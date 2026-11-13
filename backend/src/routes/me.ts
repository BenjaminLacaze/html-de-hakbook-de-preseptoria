// Portal del alumno: lo propio, siempre resuelto desde la sesión (nunca desde un id que mande la app).
// Lo usan los dos portales de Alumno (Julián y Lucía).
//
//   GET /me/student          ficha del alumno
//   GET /me/subjects         materias que cursa (comisión, condición y resumen de asistencia)
//   GET /me/attendance       registros de asistencia (?commissionId)
//   GET /me/summary          resumen de asistencia (?commissionId)
//   GET /me/grades           notas publicadas
//   GET /me/justifications   sus justificaciones
//   POST /me/justifications  pide una justificación (queda PENDING para Preceptoría)
//   GET|POST /me/corrections pedidos de corrección de su ficha
//   POST /me/attendance/qr   registra su presente con el código QR de la clase
import { Hono } from 'hono';
import { z } from 'zod';
import {
  CORRECTION_FIELDS,
  JUSTIFICATION_DOCUMENT_TYPES,
  type AttendanceRecordView,
  type CorrectionField,
  type JustificationView,
  type MyGrade,
  type MySubject,
  type QrCheckInResult,
} from '../../../shared/types.js';
import { audit } from '../audit.js';
import { requireAuth, requireRoles, type AppEnv } from '../auth/middleware.js';
import { prisma } from '../db.js';
import { commissionInclude, commissionView, correctionDTO, studentDTO } from '../dto.js';
import { AppError, notFound } from '../errors.js';
import type { Prisma } from '../generated/prisma/client.js';
import { notify } from '../notify.js';
import { hashQrCode } from '../qr.js';
import { parseDate, toISO, toISODate } from '../scope.js';
import { attendanceSummary, covers } from '../summary.js';
import { parseBody } from '../validation.js';

const noStudent = () => new AppError('NOT_FOUND', 'Tu cuenta no está vinculada a un alumno. Pedile a Secretaría que la vincule.');

/** Valor actual del dato que se pide corregir, tomado de la ficha (no de lo que mande la app). */
function currentValueOf(s: Prisma.StudentGetPayload<object>, field: CorrectionField): string | null {
  switch (field) {
    case 'FIRST_NAME': return s.firstName;
    case 'LAST_NAME': return s.lastName;
    case 'DNI': return s.dni;
    case 'EMAIL': return s.email;
    case 'PHONE': return s.phone;
    case 'ADMISSION_DATE': return toISODate(s.admissionDate);
    case 'OTHER': return null;
  }
}

/** Preceptores de las comisiones que cursa el alumno (para avisarles de un trámite). */
async function preceptorsOf(studentId: string): Promise<string[]> {
  const rows = await prisma.enrollment.findMany({
    where: { studentId, condition: { not: 'DROPPED' }, commission: { preceptorUserId: { not: null } } },
    select: { commission: { select: { preceptorUserId: true } } },
  });
  return rows.map((r) => r.commission.preceptorUserId).filter((x): x is string => Boolean(x));
}

export const meRoutes = new Hono<AppEnv>()
  .use(requireAuth, requireRoles('STUDENT', 'STUDENT_REP'))

  .get('/student', async (c) => {
    const id = c.get('user').studentId;
    if (!id) throw noStudent();
    const s = await prisma.student.findUniqueOrThrow({ where: { id } });
    return c.json(studentDTO(s));
  })

  .get('/subjects', async (c) => {
    const id = c.get('user').studentId;
    if (!id) throw noStudent();
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: id, condition: { not: 'DROPPED' } },
      include: { commission: { include: commissionInclude } },
      orderBy: { commission: { subject: { year: 'asc' } } },
    });
    const out: MySubject[] = [];
    for (const e of enrollments) {
      out.push({
        enrollmentId: e.id,
        commission: commissionView(e.commission),
        condition: e.condition,
        attendance: await attendanceSummary(id, e.commissionId),
      });
    }
    return c.json(out);
  })

  .get('/attendance', async (c) => {
    const id = c.get('user').studentId;
    if (!id) throw noStudent();
    const commissionId = c.req.query('commissionId');
    const records = await prisma.attendanceRecord.findMany({
      where: { studentId: id, ...(commissionId ? { session: { commissionId } } : {}) },
      include: { session: { include: { commission: { include: { subject: true } } } }, student: true },
      orderBy: { session: { date: 'desc' } },
    });
    const justs = await prisma.justification.findMany({ where: { studentId: id } });
    const out: AttendanceRecordView[] = records.map((r) => {
      const d = r.session.date;
      const j = justs.find((x) => covers(x, d, r.session.commission.subjectId));
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
        justified: r.status === 'ABSENT' && j?.status === 'APPROVED',
        date: toISODate(d),
        commissionId: r.session.commissionId,
        subjectId: r.session.commission.subjectId,
        subjectName: r.session.commission.subject.name,
        studentName: `${r.student.lastName}, ${r.student.firstName}`,
        studentFileNumber: r.student.fileNumber,
        justificationId: j?.id,
        justificationStatus: j?.status,
      };
    });
    return c.json(out);
  })

  .get('/summary', async (c) => {
    const id = c.get('user').studentId;
    if (!id) throw noStudent();
    return c.json(await attendanceSummary(id, c.req.query('commissionId')));
  })

  .get('/grades', async (c) => {
    const id = c.get('user').studentId;
    if (!id) throw noStudent();
    const rows = await prisma.grade.findMany({
      where: { published: true, enrollment: { studentId: id } },
      include: { enrollment: { include: { commission: { include: { subject: true } } } } },
      orderBy: { date: 'desc' },
    });
    const out: MyGrade[] = rows.map((g) => ({
      id: g.id,
      subjectName: g.enrollment.commission.subject.name,
      commissionId: g.enrollment.commissionId,
      type: g.type,
      instance: g.instance,
      date: toISODate(g.date),
      value: g.value === null ? null : Number(g.value),
      absent: g.absent,
      notes: g.notes ?? undefined,
    }));
    return c.json(out);
  })

  .get('/justifications', async (c) => {
    const id = c.get('user').studentId;
    if (!id) throw noStudent();
    const rows = await prisma.justification.findMany({ where: { studentId: id }, include: { student: true, subject: true }, orderBy: { createdAt: 'desc' } });
    const out: JustificationView[] = rows.map((j) => ({
      id: j.id,
      studentId: j.studentId,
      fromDate: toISODate(j.fromDate),
      toDate: toISODate(j.toDate),
      reason: j.reason,
      subjectId: j.subjectId ?? undefined,
      subjectName: j.subject?.name,
      documentType: j.documentType ?? undefined,
      documentName: j.documentName ?? undefined,
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

  .post('/justifications', async (c) => {
    const user = c.get('user');
    const id = user.studentId;
    if (!id) throw noStudent();
    const body = await parseBody(
      c,
      z.object({
        fromDate: z.string(),
        toDate: z.string(),
        reason: z.string().trim().min(3, 'Contá el motivo.').max(1000),
        /** Materia de la falta (sin valor: todas las materias de esas fechas). */
        subjectId: z.string().uuid().optional(),
        documentType: z.enum(JUSTIFICATION_DOCUMENT_TYPES).optional(),
        documentName: z.string().trim().max(200).optional(),
        documentUrl: z.string().url().optional(),
      }),
    );
    const from = parseDate(body.fromDate, 'fromDate');
    const to = parseDate(body.toDate, 'toDate');
    if (to < from) throw new AppError('VALIDATION_ERROR', 'La fecha "hasta" es anterior a "desde".', [{ field: 'toDate', message: 'Anterior a "desde".' }]);
    if (body.subjectId) {
      const enrolled = await prisma.enrollment.findFirst({ where: { studentId: id, commission: { subjectId: body.subjectId } } });
      if (!enrolled) throw new AppError('VALIDATION_ERROR', 'No cursás esa materia.', [{ field: 'subjectId', message: 'No cursás esa materia.' }]);
    }
    const overlapping = await prisma.justification.findFirst({
      where: {
        studentId: id,
        status: 'PENDING',
        fromDate: { lte: to },
        toDate: { gte: from },
        // Una pendiente "para todas" choca con cualquiera; una por materia, solo con la misma o con "todas".
        ...(body.subjectId ? { OR: [{ subjectId: null }, { subjectId: body.subjectId }] } : {}),
      },
    });
    if (overlapping) throw new AppError('CONFLICT', 'Ya tenés una justificación en revisión para esas fechas.');
    const j = await prisma.justification.create({
      data: {
        studentId: id,
        fromDate: from,
        toDate: to,
        reason: body.reason,
        subjectId: body.subjectId,
        documentType: body.documentType,
        documentName: body.documentName,
        documentUrl: body.documentUrl,
        createdBy: user.id,
      },
    });
    await notify(await preceptorsOf(id), {
      type: 'JUSTIFICATION_REQUEST',
      text: 'Un alumno pidió una justificación',
      details: `${body.fromDate} a ${body.toDate}`,
      link: '/attendance/justifications',
    });
    await audit(c, user, { action: 'CREATE', entity: 'Justification', entityId: j.id, summary: `Justificación pedida por el alumno ${body.fromDate} a ${body.toDate}` });
    return c.json({ id: j.id, status: j.status }, 201);
  })

  // ------------------------------------------------- corrección de la ficha
  .get('/corrections', async (c) => {
    const id = c.get('user').studentId;
    if (!id) throw noStudent();
    const rows = await prisma.dataCorrectionRequest.findMany({ where: { studentId: id }, include: { student: true }, orderBy: { createdAt: 'desc' } });
    return c.json(rows.map(correctionDTO));
  })

  .post('/corrections', async (c) => {
    const user = c.get('user');
    const id = user.studentId;
    if (!id) throw noStudent();
    const body = await parseBody(
      c,
      z.object({
        field: z.enum(CORRECTION_FIELDS),
        proposedValue: z.string().trim().min(1, 'Escribí el dato correcto.').max(200),
        reason: z.string().trim().min(3, 'Contá el motivo.').max(1000),
        documentUrl: z.string().url().optional(),
      }),
    );
    const pending = await prisma.dataCorrectionRequest.findFirst({ where: { studentId: id, field: body.field, status: 'PENDING' } });
    if (pending) throw new AppError('CONFLICT', 'Ya tenés un pedido en revisión para ese dato.');
    const student = await prisma.student.findUniqueOrThrow({ where: { id } });
    const r = await prisma.dataCorrectionRequest.create({
      data: { ...body, studentId: id, currentValue: currentValueOf(student, body.field), createdBy: user.id },
      include: { student: true },
    });
    await notify(await preceptorsOf(id), {
      type: 'GENERAL',
      text: 'Un alumno pidió corregir un dato de su ficha',
      link: '/structure/corrections',
    });
    await audit(c, user, { action: 'CREATE', entity: 'DataCorrectionRequest', entityId: r.id, summary: `Pedido de corrección: ${body.field}` });
    return c.json(correctionDTO(r), 201);
  })

  // ------------------------------------------------------ asistencia por QR
  .post('/attendance/qr', async (c) => {
    const user = c.get('user');
    const id = user.studentId;
    if (!id) throw noStudent();
    const body = await parseBody(c, z.object({ code: z.string().trim().min(6).max(40) }));
    const qr = await prisma.attendanceQrCode.findUnique({
      where: { codeHash: hashQrCode(body.code) },
      include: { session: { include: { commission: { include: { subject: true } } } } },
    });
    if (!qr || qr.revokedAt) throw notFound('El código no es válido.');
    if (qr.expiresAt <= new Date()) throw new AppError('CONFLICT', 'El código venció. Pedí uno nuevo en el aula.');
    const { session } = qr;
    const enrolled = await prisma.enrollment.findFirst({
      where: { studentId: id, commissionId: session.commissionId, condition: { not: 'DROPPED' } },
    });
    if (!enrolled) throw notFound('El código no es válido.');
    const result = (status: QrCheckInResult['status'], alreadyRegistered: boolean): QrCheckInResult => ({
      sessionId: session.id,
      commissionId: session.commissionId,
      subjectName: session.commission.subject.name,
      date: toISODate(session.date),
      status,
      alreadyRegistered,
    });
    const existing = await prisma.attendanceRecord.findUnique({ where: { sessionId_studentId: { sessionId: session.id, studentId: id } } });
    if (existing) return c.json(result(existing.status, true));
    if (session.status === 'CLOSED') throw new AppError('CONFLICT', 'La planilla de esta clase ya está cerrada.');
    let rec;
    try {
      rec = await prisma.attendanceRecord.create({
        data: { sessionId: session.id, studentId: id, status: 'PRESENT', source: 'QR', recordedBy: user.id },
      });
    } catch (e) {
      // Doble envío casi simultáneo: el otro pedido ya lo registró.
      if ((e as { code?: string }).code === 'P2002') return c.json(result('PRESENT', true));
      throw e;
    }
    await audit(c, user, { action: 'CREATE', entity: 'AttendanceRecord', entityId: rec.id, summary: 'Presente por QR' });
    return c.json(result(rec.status, false), 201);
  });
