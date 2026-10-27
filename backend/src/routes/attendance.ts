// Toma de asistencia unificada.
//
// Preceptoría carga por MATERIA + FECHA; Profesores por COMISIÓN + CLASE. Las dos formas
// escriben en las mismas tablas (class_sessions + attendance_records): una clase por
// comisión y fecha, y un registro por alumno y clase.
//
//   GET  /attendance?careerId&year&subjectId&commissionId&studentId&from&to
//   POST /attendance/by-subject                 (Preceptoría)
//   GET  /attendance/summary?studentId&commissionId
//   POST /attendance/commissions/:id/sessions   (Profesores: abre o reutiliza la clase del día)
//   GET  /attendance/sessions/:id
//   PUT  /attendance/sessions/:id               (Profesores: guarda la planilla de la clase)
//   GET  /attendance/justifications?status&studentId
//   POST /attendance/justifications
//   PATCH /attendance/justifications/:id        (aprobar / rechazar)
import { Hono } from 'hono';
import { z } from 'zod';
import {
  ATTENDANCE_STATUSES,
  JUSTIFICATION_STATUSES,
  type AttendanceRecordView,
  type AttendanceSummary,
  type JustificationView,
} from '../../../shared/types.js';
import { audit } from '../audit.js';
import { requireAuth, requireRoles, type AppEnv, type CurrentUser } from '../auth/middleware.js';
import { prisma } from '../db.js';
import { AppError, forbidden, notFound } from '../errors.js';
import type { Prisma } from '../generated/prisma/client.js';
import { commissionScope, hasRole, isManagement, parseDate, toISO, toISODate } from '../scope.js';
import { notify } from '../notify.js';
import { attendanceSummary } from '../summary.js';
import { parseBody } from '../validation.js';

const READERS = ['SUPER_ADMIN', 'DIRECTOR', 'ADMINISTRATIVE', 'PRECEPTOR', 'TEACHER'] as const;
const WRITERS = ['SUPER_ADMIN', 'DIRECTOR', 'PRECEPTOR', 'TEACHER'] as const;
const REVIEWERS = ['SUPER_ADMIN', 'DIRECTOR', 'PRECEPTOR'] as const;

const recordSchema = z.object({
  studentId: z.string().uuid(),
  status: z.enum(ATTENDANCE_STATUSES),
  minutesLate: z.number().int().min(1).max(240).optional(),
  notes: z.string().max(500).optional(),
});

/** Origen del registro según quién lo carga. */
const sourceFor = (u: CurrentUser) => (hasRole(u, 'TEACHER') && !hasRole(u, 'PRECEPTOR') ? 'TEACHER' : 'PRECEPTOR') as 'TEACHER' | 'PRECEPTOR';

/** Busca la clase de esa comisión y fecha, o la crea. */
async function sessionFor(commissionId: string, date: Date) {
  const existing = await prisma.classSession.findFirst({ where: { commissionId, date }, orderBy: { createdAt: 'asc' } });
  return existing ?? prisma.classSession.create({ data: { commissionId, date } });
}

/** Guarda (crea o reemplaza) los registros de una clase. */
async function upsertRecords(
  sessionId: string,
  records: z.infer<typeof recordSchema>[],
  user: CurrentUser,
): Promise<number> {
  const source = sourceFor(user);
  await prisma.$transaction(
    records.map((r) =>
      prisma.attendanceRecord.upsert({
        where: { sessionId_studentId: { sessionId, studentId: r.studentId } },
        create: {
          sessionId,
          studentId: r.studentId,
          status: r.status,
          minutesLate: r.status === 'LATE' ? r.minutesLate : null,
          notes: r.notes,
          source,
          recordedBy: user.id,
        },
        update: {
          status: r.status,
          minutesLate: r.status === 'LATE' ? r.minutesLate : null,
          notes: r.notes,
          source,
          recordedBy: user.id,
          recordedAt: new Date(),
        },
      }),
    ),
  );
  return records.length;
}

/** Justificaciones que cubren las fechas de una lista de registros (por alumno). */
async function justificationsFor(studentIds: string[], from: Date, to: Date) {
  if (studentIds.length === 0) return [];
  return prisma.justification.findMany({
    where: { studentId: { in: studentIds }, fromDate: { lte: to }, toDate: { gte: from } },
    orderBy: { createdAt: 'desc' },
  });
}

/** Alumnos que el usuario puede ver (inscriptos en sus comisiones). */
async function visibleStudentIds(user: CurrentUser): Promise<string[] | 'all'> {
  if (isManagement(user)) return 'all';
  const where = await commissionScope(user);
  const rows = await prisma.enrollment.findMany({ where: { commission: where }, select: { studentId: true }, distinct: ['studentId'] });
  return rows.map((r) => r.studentId);
}

export const attendanceRoutes = new Hono<AppEnv>()
  .use(requireAuth)

  // ------------------------------------------------------------------ lectura
  .get('/', requireRoles(...READERS), async (c) => {
    const q = c.req.query();
    const user = c.get('user');
    const scope = await commissionScope(user);
    const commissionWhere: Prisma.CommissionWhereInput = {
      AND: [
        scope,
        q.commissionId ? { id: q.commissionId } : {},
        q.subjectId ? { subjectId: q.subjectId } : {},
        q.careerId ? { subject: { plan: { careerId: q.careerId } } } : {},
        q.year ? { subject: { year: Number(q.year) } } : {},
      ],
    };
    const sessionWhere: Prisma.ClassSessionWhereInput = {
      commission: commissionWhere,
      ...(q.from || q.to
        ? { date: { ...(q.from ? { gte: parseDate(q.from, 'from') } : {}), ...(q.to ? { lte: parseDate(q.to, 'to') } : {}) } }
        : {}),
    };
    const records = await prisma.attendanceRecord.findMany({
      where: { session: sessionWhere, ...(q.studentId ? { studentId: q.studentId } : {}) },
      include: { session: { include: { commission: { include: { subject: true } } } }, student: true },
      orderBy: [{ session: { date: 'desc' } }],
      take: 5000,
    });

    const dates = records.map((r) => r.session.date.getTime());
    const justs = dates.length
      ? await justificationsFor([...new Set(records.map((r) => r.studentId))], new Date(Math.min(...dates)), new Date(Math.max(...dates)))
      : [];

    const out: AttendanceRecordView[] = records.map((r) => {
      const d = r.session.date;
      const covering = justs.find((j) => j.studentId === r.studentId && j.fromDate <= d && j.toDate >= d);
      return {
        id: r.id,
        sessionId: r.sessionId,
        studentId: r.studentId,
        status: r.status,
        minutesLate: r.minutesLate ?? undefined,
        notes: r.notes ?? undefined,
        source: r.source,
        recordedBy: r.recordedBy,
        recordedAt: r.recordedAt.toISOString(),
        justified: r.status === 'ABSENT' && covering?.status === 'APPROVED',
        date: toISODate(d),
        commissionId: r.session.commissionId,
        subjectId: r.session.commission.subjectId,
        subjectName: r.session.commission.subject.name,
        studentName: `${r.student.lastName}, ${r.student.firstName}`,
        studentFileNumber: r.student.fileNumber,
        justificationId: covering?.id,
        justificationStatus: covering?.status,
      };
    });
    return c.json(out);
  })

  // --------------------------------------------- Preceptoría: materia + fecha
  .post('/by-subject', requireRoles(...WRITERS), async (c) => {
    const user = c.get('user');
    const body = await parseBody(
      c,
      z.object({ subjectId: z.string().uuid(), date: z.string(), records: z.array(recordSchema).min(1).max(500) }),
    );
    const date = parseDate(body.date);
    const scope = await commissionScope(user);
    const commissions = await prisma.commission.findMany({
      where: { AND: [scope, { subjectId: body.subjectId }] },
      include: { enrollments: { select: { studentId: true } }, subject: true },
    });
    if (commissions.length === 0) throw forbidden('No tenés comisiones de esa materia a cargo.');

    // Cada alumno va a la comisión de esa materia en la que está inscripto.
    const byCommission = new Map<string, z.infer<typeof recordSchema>[]>();
    const notEnrolled: string[] = [];
    for (const r of body.records) {
      const cm = commissions.find((x) => x.enrollments.some((e) => e.studentId === r.studentId));
      if (!cm) notEnrolled.push(r.studentId);
      else byCommission.set(cm.id, [...(byCommission.get(cm.id) ?? []), r]);
    }
    if (notEnrolled.length) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Hay alumnos que no están inscriptos en esa materia.',
        notEnrolled.map((id) => ({ field: 'records.studentId', message: id })),
      );
    }

    let saved = 0;
    for (const [commissionId, recs] of byCommission) {
      const session = await sessionFor(commissionId, date);
      if (session.status === 'CLOSED' && !hasRole(user, 'DIRECTOR', 'SUPER_ADMIN')) {
        throw new AppError('CONFLICT', 'La planilla de esa clase ya está cerrada. Pedí que la reabran.');
      }
      saved += await upsertRecords(session.id, recs, user);
    }
    await audit(c, user, {
      action: 'UPDATE',
      entity: 'Attendance',
      entityId: body.subjectId,
      summary: `Asistencia de ${commissions[0].subject.name} del ${body.date}: ${saved} registro(s)`,
    });
    return c.json({ saved });
  })

  // ------------------------------------------------------- resumen calculado
  .get('/summary', requireRoles(...READERS, 'STUDENT'), async (c) => {
    const user = c.get('user');
    const studentId = hasRole(user, 'STUDENT') && !hasRole(user, ...READERS) ? user.studentId : c.req.query('studentId');
    if (!studentId) throw new AppError('VALIDATION_ERROR', 'Falta studentId.');
    const commissionId = c.req.query('commissionId');
    const visible = hasRole(user, 'STUDENT') && studentId === user.studentId ? 'all' : await visibleStudentIds(user);
    if (visible !== 'all' && !visible.includes(studentId)) throw notFound();

    return c.json(await attendanceSummary(studentId, commissionId));
  })

  // ---------------------------------------------- Profesores: comisión + clase
  .post('/commissions/:id/sessions', requireRoles(...WRITERS), async (c) => {
    const user = c.get('user');
    const body = await parseBody(c, z.object({ date: z.string(), topic: z.string().max(200).optional() }));
    const commission = await prisma.commission.findFirst({ where: { AND: [await commissionScope(user), { id: c.req.param('id') }] } });
    if (!commission) throw notFound('No existe la comisión o no la tenés a cargo.');
    const session = await sessionFor(commission.id, parseDate(body.date));
    const updated = body.topic ? await prisma.classSession.update({ where: { id: session.id }, data: { topic: body.topic } }) : session;
    return c.json({ id: updated.id, commissionId: updated.commissionId, date: toISODate(updated.date), topic: updated.topic, status: updated.status });
  })

  .get('/sessions/:id', requireRoles(...READERS), async (c) => {
    const user = c.get('user');
    const session = await prisma.classSession.findFirst({
      where: { id: c.req.param('id'), commission: await commissionScope(user) },
      include: { records: true },
    });
    if (!session) throw notFound('No existe la clase o no la tenés a cargo.');
    return c.json({
      id: session.id,
      commissionId: session.commissionId,
      date: toISODate(session.date),
      topic: session.topic,
      status: session.status,
      records: session.records.map((r) => ({ studentId: r.studentId, status: r.status, minutesLate: r.minutesLate ?? undefined, notes: r.notes ?? undefined })),
    });
  })

  .put('/sessions/:id', requireRoles(...WRITERS), async (c) => {
    const user = c.get('user');
    const body = await parseBody(c, z.object({ records: z.array(recordSchema).max(500), close: z.boolean().optional() }));
    const session = await prisma.classSession.findFirst({
      where: { id: c.req.param('id'), commission: await commissionScope(user) },
      include: { commission: { include: { enrollments: { select: { studentId: true } } } } },
    });
    if (!session) throw notFound('No existe la clase o no la tenés a cargo.');
    if (session.status === 'CLOSED' && !hasRole(user, 'DIRECTOR', 'SUPER_ADMIN')) {
      throw new AppError('CONFLICT', 'La planilla de esta clase ya está cerrada.');
    }
    const enrolled = new Set(session.commission.enrollments.map((e) => e.studentId));
    const bad = body.records.filter((r) => !enrolled.has(r.studentId));
    if (bad.length) throw new AppError('VALIDATION_ERROR', 'Hay alumnos que no están inscriptos en esta comisión.');
    const saved = await upsertRecords(session.id, body.records, user);
    if (body.close) {
      await prisma.classSession.update({ where: { id: session.id }, data: { status: 'CLOSED', closedAt: new Date(), closedBy: user.id } });
    }
    await audit(c, user, { action: 'UPDATE', entity: 'ClassSession', entityId: session.id, summary: `Planilla guardada (${saved} registros)${body.close ? ' y cerrada' : ''}` });
    return c.json({ saved, closed: Boolean(body.close) });
  })

  // ---------------------------------------------------------- justificaciones
  .get('/justifications', requireRoles(...READERS), async (c) => {
    const user = c.get('user');
    const q = c.req.query();
    const visible = await visibleStudentIds(user);
    const where: Prisma.JustificationWhereInput = {
      ...(q.status && (JUSTIFICATION_STATUSES as readonly string[]).includes(q.status) ? { status: q.status as never } : {}),
      ...(q.studentId ? { studentId: q.studentId } : {}),
      // Sin acceso total: solo sus alumnos. Si pide uno que no tiene a cargo, no devuelve nada.
      ...(visible === 'all'
        ? {}
        : { studentId: q.studentId ? (visible.includes(q.studentId) ? q.studentId : { in: [] }) : { in: visible } }),
    };
    const rows = await prisma.justification.findMany({ where, include: { student: true }, orderBy: { createdAt: 'desc' }, take: 1000 });
    const out: JustificationView[] = rows.map((j) => ({
      id: j.id,
      studentId: j.studentId,
      fromDate: toISODate(j.fromDate),
      toDate: toISODate(j.toDate),
      reason: j.reason,
      documentUrl: j.documentUrl ?? undefined,
      status: j.status,
      createdBy: j.createdBy,
      reviewedBy: j.reviewedBy ?? undefined,
      reviewedAt: toISO(j.reviewedAt),
      reviewNotes: j.reviewNotes ?? undefined,
      createdAt: j.createdAt.toISOString(),
      updatedAt: j.updatedAt.toISOString(),
      studentName: `${j.student.lastName}, ${j.student.firstName}`,
      studentFileNumber: j.student.fileNumber,
    }));
    return c.json(out);
  })

  .post('/justifications', requireRoles(...REVIEWERS, 'ADMINISTRATIVE'), async (c) => {
    const user = c.get('user');
    const body = await parseBody(
      c,
      z.object({
        studentId: z.string().uuid(),
        fromDate: z.string(),
        toDate: z.string(),
        reason: z.string().trim().min(3, 'Contá el motivo.').max(1000),
        documentUrl: z.string().url().optional(),
      }),
    );
    const from = parseDate(body.fromDate, 'fromDate');
    const to = parseDate(body.toDate, 'toDate');
    if (to < from) throw new AppError('VALIDATION_ERROR', 'La fecha "hasta" es anterior a "desde".', [{ field: 'toDate', message: 'Anterior a "desde".' }]);
    const visible = await visibleStudentIds(user);
    if (visible !== 'all' && !visible.includes(body.studentId)) throw notFound('No existe el alumno o no lo tenés a cargo.');
    const j = await prisma.justification.create({
      data: { studentId: body.studentId, fromDate: from, toDate: to, reason: body.reason, documentUrl: body.documentUrl, createdBy: user.id },
    });
    await audit(c, user, { action: 'CREATE', entity: 'Justification', entityId: j.id, summary: `Justificación ${body.fromDate} a ${body.toDate}` });
    return c.json({ id: j.id, status: j.status }, 201);
  })

  .patch('/justifications/:id', requireRoles(...REVIEWERS), async (c) => {
    const user = c.get('user');
    const body = await parseBody(c, z.object({ status: z.enum(['APPROVED', 'REJECTED']), reviewNotes: z.string().max(1000).optional() }));
    const j = await prisma.justification.findUnique({ where: { id: c.req.param('id') } });
    if (!j) throw notFound('No existe la justificación.');
    const visible = await visibleStudentIds(user);
    if (visible !== 'all' && !visible.includes(j.studentId)) throw notFound('No existe la justificación.');
    const updated = await prisma.justification.update({
      where: { id: j.id },
      data: { status: body.status, reviewNotes: body.reviewNotes, reviewedBy: user.id, reviewedAt: new Date() },
    });
    const st = await prisma.student.findUnique({ where: { id: j.studentId }, select: { userId: true } });
    await notify([st?.userId], {
      type: body.status === 'APPROVED' ? 'JUSTIFICATION_APPROVED' : 'JUSTIFICATION_REJECTED',
      text: body.status === 'APPROVED' ? 'Te aprobaron una justificación' : 'Te rechazaron una justificación',
      details: body.reviewNotes,
      link: '/me/justifications',
    });
    await audit(c, user, {
      action: 'STATUS_CHANGE',
      entity: 'Justification',
      entityId: j.id,
      summary: `Justificación ${body.status === 'APPROVED' ? 'aprobada' : 'rechazada'}`,
      previousValue: { status: j.status },
      newValue: { status: updated.status },
    });
    return c.json({ id: updated.id, status: updated.status });
  });
