// Panel de Familias: lo que ve y hace un responsable (madre, padre, tutor/a) sobre SUS hijos.
// El vínculo sale siempre de la sesión + student_guardians; si el alumno no es su hijo → 404.
//
//   GET  /guardian/children                         hijos a cargo
//   GET  /guardian/children/:id/summary             resumen de asistencia (mismo cálculo que el alumno)
//   GET  /guardian/children/:id/attendance          registros (?from&to&subjectId)
//   GET  /guardian/children/:id/grades              notas publicadas, por materia
//   GET  /guardian/children/:id/agenda              agenda del hijo (?from&to)     GET /guardian/agenda (todos)
//   GET|POST /guardian/children/:id/justifications  justificaciones (las revisa Preceptoría)
//   GET  /guardian/notices    POST /guardian/notices/:id/read   comunicados y acuse de lectura
//   GET  /guardian/authorizations   PATCH /guardian/authorizations/:id   autorizaciones (se responde una vez)
//   GET  /guardian/profile    GET|POST /guardian/corrections    ficha y pedidos de corrección
//   GET  /guardian/contacts                         preceptores y docentes de sus hijos (para Mensajes)
//
// Lado institucional (Preceptoría, Secretaría, Directivos), en /families:
//   GET|POST /families/authorizations               pedir una autorización y ver las respuestas
//   GET  /families/guardians    PUT /families/guardians/:userId   fichas y vínculos (PUT: solo gestión)
//   GET  /families/corrections  PATCH /families/corrections/:id   resolver pedidos de corrección
import { Hono } from 'hono';
import { z } from 'zod';
import {
  ASSESSMENT_TYPE_LABELS,
  ENROLLMENT_CONDITION_LABELS,
  JUSTIFICATION_DOCUMENT_TYPES,
  type NoticeAudience,
} from '../../../shared/types.js';
import { audit } from '../audit.js';
import { requireAuth, requireRoles, type AppEnv, type CurrentUser } from '../auth/middleware.js';
import { prisma } from '../db.js';
import { AppError, notFound } from '../errors.js';
import { notify } from '../notify.js';
import { commissionScope, isManagement, parseDate, toISO, toISODate } from '../scope.js';
import { attendanceSummary, covers } from '../summary.js';
import { parseBody } from '../validation.js';

const RELATIONSHIPS = ['MOTHER', 'FATHER', 'LEGAL_GUARDIAN'] as const;
const AUTHORIZATION_TYPES = ['FIELD_TRIP', 'TRAVEL', 'IMAGE_USE', 'EARLY_DISMISSAL'] as const;
const fullName = (p: { firstName: string; lastName: string }) => `${p.firstName} ${p.lastName}`;

const noGuardian = () =>
  new AppError('NOT_FOUND', 'Tu cuenta no tiene una ficha de responsable. Pedile a Secretaría que la vincule.');

/** Ficha del responsable de la sesión, con sus hijos. */
async function guardianOf(user: CurrentUser) {
  const g = await prisma.guardian.findUnique({
    where: { userId: user.id },
    include: { students: { include: { student: { include: { career: true } } }, orderBy: { createdAt: 'asc' } } },
  });
  if (!g) throw noGuardian();
  return g;
}

/** Devuelve el alumno solo si es hijo del responsable de la sesión. */
async function childOf(user: CurrentUser, studentId: string) {
  const g = await guardianOf(user);
  const link = g.students.find((s) => s.studentId === studentId);
  if (!link) throw notFound('No encontramos a ese alumno entre tus hijos a cargo.');
  return { guardian: g, link, student: link.student };
}

/** Comisiones que cursa un alumno (sin las dadas de baja). */
const enrollmentsOf = (studentIds: string[]) =>
  prisma.enrollment.findMany({
    where: { studentId: { in: studentIds }, condition: { not: 'DROPPED' } },
    include: {
      commission: {
        include: {
          subject: { include: { plan: true } },
          teachers: { include: { teacher: true }, orderBy: { position: 'asc' } },
        },
      },
    },
  });

/** Preceptores de las comisiones de un alumno. */
async function preceptorsOf(studentId: string): Promise<string[]> {
  const rows = await prisma.enrollment.findMany({
    where: { studentId, condition: { not: 'DROPPED' }, commission: { preceptorUserId: { not: null } } },
    select: { commission: { select: { preceptorUserId: true } } },
  });
  return [...new Set(rows.map((r) => r.commission.preceptorUserId).filter((x): x is string => Boolean(x)))];
}

/** Cuentas de los responsables de un alumno (para avisarles). */
export async function guardianUserIdsOf(studentIds: string[]): Promise<string[]> {
  if (studentIds.length === 0) return [];
  const rows = await prisma.studentGuardian.findMany({
    where: { studentId: { in: studentIds } },
    select: { guardian: { select: { userId: true } } },
  });
  return [...new Set(rows.map((r) => r.guardian.userId))];
}

const range = (q: Record<string, string>) => ({
  from: q.from ? parseDate(q.from, 'from') : undefined,
  to: q.to ? parseDate(q.to, 'to') : undefined,
});

const EVENT_CATEGORY = {
  EXAM_PERIOD: 'EXAM',
  GRADES_DEADLINE: 'EXAM',
  CEREMONY: 'COMMEMORATIVE_ACT',
  HOLIDAY: 'HOLIDAY',
  INSTITUTIONAL_DAY: 'SPECIAL_CLASS',
  CLASS: 'SPECIAL_CLASS',
  OTHER: 'SPECIAL_CLASS',
} as const;

interface AgendaItem {
  id: string;
  childId?: string;
  childName?: string;
  title: string;
  category: 'EXAM' | 'SPECIAL_CLASS' | 'COMMEMORATIVE_ACT' | 'HOLIDAY' | 'FIELD_TRIP';
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  description: string;
  subjectName?: string;
  /** De dónde sale: calendario institucional, autorización de salida o evento del Centro de Estudiantes. */
  source: 'INSTITUTION' | 'AUTHORIZATION' | 'STUDENT_CENTER';
}

/** Agenda de uno o varios hijos: calendario institucional + salidas autorizables + eventos del Centro. */
async function agendaFor(children: { id: string; firstName: string; lastName: string }[], from?: Date, to?: Date): Promise<AgendaItem[]> {
  const ids = children.map((c) => c.id);
  const nameOf = new Map(children.map((c) => [c.id, fullName(c)]));
  const enrollments = await enrollmentsOf(ids);
  const studentsByCommission = new Map<string, string[]>();
  for (const e of enrollments) studentsByCommission.set(e.commissionId, [...(studentsByCommission.get(e.commissionId) ?? []), e.studentId]);
  const subjectByCommission = new Map(enrollments.map((e) => [e.commissionId, e.commission.subject.name]));
  const dateWhere = { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) };
  const hasRange = Boolean(from || to);
  const out: AgendaItem[] = [];

  const events = await prisma.schoolEvent.findMany({
    where: {
      cycle: { status: 'ACTIVE' },
      OR: [{ commissionId: null }, { commissionId: { in: [...studentsByCommission.keys()] } }],
      ...(hasRange ? { startDate: dateWhere } : {}),
    },
    orderBy: { startDate: 'asc' },
    take: 500,
  });
  for (const e of events) {
    const base = {
      title: e.title,
      category: EVENT_CATEGORY[e.type],
      date: toISODate(e.startDate),
      description: e.description ?? '',
      source: 'INSTITUTION' as const,
    };
    if (!e.commissionId) out.push({ id: e.id, ...base });
    else {
      for (const sid of new Set(studentsByCommission.get(e.commissionId) ?? [])) {
        out.push({ id: `${e.id}:${sid}`, childId: sid, childName: nameOf.get(sid), subjectName: subjectByCommission.get(e.commissionId), ...base });
      }
    }
  }

  const trips = await prisma.authorizationResponse.findMany({
    where: { studentId: { in: ids }, request: { eventDate: hasRange ? dateWhere : { not: null } } },
    include: { request: true },
  });
  for (const r of trips) {
    out.push({
      id: `aut:${r.id}`,
      childId: r.studentId,
      childName: nameOf.get(r.studentId),
      title: r.request.title,
      category: 'FIELD_TRIP',
      date: toISODate(r.request.eventDate!),
      location: r.request.destination ?? undefined,
      description: r.request.description,
      source: 'AUTHORIZATION',
    });
  }

  const centro = await prisma.repEvent.findMany({ where: hasRange ? { date: dateWhere } : {}, orderBy: { date: 'asc' }, take: 200 });
  for (const e of centro) {
    out.push({
      id: `centro:${e.id}`,
      title: e.title,
      category: 'SPECIAL_CLASS',
      date: toISODate(e.date),
      startTime: e.time ?? undefined,
      endTime: e.endTime ?? undefined,
      location: e.location ?? undefined,
      description: `${e.description} (Organiza: ${e.organizer})`,
      source: 'STUDENT_CENTER',
    });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

type AuthorizationRow = Awaited<ReturnType<typeof authorizationRows>>[number];
const authorizationRows = (studentIds: string[]) =>
  prisma.authorizationResponse.findMany({
    where: { studentId: { in: studentIds } },
    include: { request: true, student: true },
    orderBy: { request: { deadlineDate: 'asc' } },
  });
const authorizationDTO = (r: AuthorizationRow) => ({
  id: r.id,
  childId: r.studentId,
  childName: fullName(r.student),
  title: r.request.title,
  type: r.request.type,
  description: r.request.description,
  deadlineDate: toISODate(r.request.deadlineDate),
  destination: r.request.destination ?? undefined,
  dateOfEvent: r.request.eventDate ? toISODate(r.request.eventDate) : undefined,
  response: r.answer,
  respondedAt: toISO(r.respondedAt),
  responsiblePersonName: r.request.responsible ?? undefined,
});

const correctionDTO = (r: { id: string; createdAt: Date; phone: string | null; email: string | null; address: string | null; notes: string | null; status: string; reviewNotes: string | null }) => ({
  id: r.id,
  date: r.createdAt.toISOString(),
  requestedFields: {
    ...(r.phone ? { phone: r.phone } : {}),
    ...(r.email ? { email: r.email } : {}),
    ...(r.address ? { address: r.address } : {}),
    ...(r.notes ? { notes: r.notes } : {}),
  },
  status: r.status,
  reviewNotes: r.reviewNotes ?? undefined,
});

export const guardianRoutes = new Hono<AppEnv>()
  .use(requireAuth, requireRoles('GUARDIAN'))

  // -------------------------------------------------------------------- hijos
  .get('/children', async (c) => {
    const g = await guardianOf(c.get('user'));
    const enrollments = await enrollmentsOf(g.students.map((s) => s.studentId));
    return c.json(
      g.students.map((l) => {
        const own = enrollments.filter((e) => e.studentId === l.studentId);
        return {
          id: l.studentId,
          firstName: l.student.firstName,
          lastName: l.student.lastName,
          fileNumber: l.student.fileNumber,
          courseName: l.student.career.name,
          year: own.length ? Math.max(...own.map((e) => e.commission.subject.year)) : 1,
          shift: own[0]?.commission.shift ?? 'EVENING',
          relationship: l.relationship,
          /** Si el alumno tiene cuenta propia en el Panel de Alumnos. */
          hasOwnAccount: Boolean(l.student.userId),
        };
      }),
    );
  })

  .get('/children/:id/summary', async (c) => {
    const { student } = await childOf(c.get('user'), c.req.param('id'));
    return c.json(await attendanceSummary(student.id));
  })

  .get('/children/:id/attendance', async (c) => {
    const { student } = await childOf(c.get('user'), c.req.param('id'));
    const q = c.req.query();
    const { from, to } = range(q);
    const records = await prisma.attendanceRecord.findMany({
      where: {
        studentId: student.id,
        session: {
          ...(from || to ? { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
          ...(q.subjectId ? { commission: { subjectId: q.subjectId } } : {}),
        },
      },
      include: { session: { include: { commission: { include: { subject: true } } } } },
      orderBy: { session: { date: 'desc' } },
    });
    const justs = await prisma.justification.findMany({ where: { studentId: student.id } });
    return c.json(
      records.map((r) => {
        const subjectId = r.session.commission.subjectId;
        const j = justs.filter((x) => covers(x, r.session.date, subjectId));
        return {
          id: r.id,
          date: toISODate(r.session.date),
          subjectId,
          subjectName: r.session.commission.subject.name,
          status: r.status,
          minutesLate: r.minutesLate ?? undefined,
          justified: r.status === 'ABSENT' && j.some((x) => x.status === 'APPROVED'),
          justificationPending: r.status === 'ABSENT' && j.some((x) => x.status === 'PENDING'),
          notes: r.notes ?? undefined,
        };
      }),
    );
  })

  .get('/children/:id/grades', async (c) => {
    const { student } = await childOf(c.get('user'), c.req.param('id'));
    const enrollments = await enrollmentsOf([student.id]);
    const grades = await prisma.grade.findMany({
      where: { published: true, enrollment: { studentId: student.id } },
      orderBy: { date: 'asc' },
    });
    return c.json(
      enrollments
        .sort((a, b) => a.commission.subject.name.localeCompare(b.commission.subject.name))
        .map((e) => {
          const subject = e.commission.subject;
          const teacher = e.commission.teachers[0]?.teacher;
          return {
            subjectId: subject.id,
            subjectName: subject.name,
            teacherName: teacher ? fullName(teacher) : 'Docente a designar',
            finalCondition: ENROLLMENT_CONDITION_LABELS[e.condition],
            items: grades
              .filter((g) => g.enrollmentId === e.id)
              .map((g) => ({
                id: g.id,
                subjectId: subject.id,
                subjectName: subject.name,
                instance: `${ASSESSMENT_TYPE_LABELS[g.type]}${g.type === 'FINAL_EXAM' ? '' : ` ${g.instance}`}`,
                date: toISODate(g.date),
                numericGrade: g.value === null ? undefined : Number(g.value),
                absent: g.absent,
                isPublished: true,
                status: 'PUBLISHED' as const,
                teacherNotes: g.notes ?? undefined,
              })),
          };
        }),
    );
  })

  // ------------------------------------------------------------------- agenda
  .get('/children/:id/agenda', async (c) => {
    const { student } = await childOf(c.get('user'), c.req.param('id'));
    const { from, to } = range(c.req.query());
    return c.json(await agendaFor([student], from, to));
  })

  .get('/agenda', async (c) => {
    const g = await guardianOf(c.get('user'));
    const { from, to } = range(c.req.query());
    return c.json(await agendaFor(g.students.map((s) => s.student), from, to));
  })

  // ----------------------------------------------------------- justificaciones
  .get('/children/:id/justifications', async (c) => {
    const { student } = await childOf(c.get('user'), c.req.param('id'));
    const rows = await prisma.justification.findMany({ where: { studentId: student.id }, include: { subject: true }, orderBy: { createdAt: 'desc' } });
    return c.json(
      rows.map((j) => ({
        id: j.id,
        childId: student.id,
        childName: fullName(student),
        submissionDate: j.createdAt.toISOString(),
        fromDate: toISODate(j.fromDate),
        toDate: toISODate(j.toDate),
        reason: j.reason,
        subjectName: j.subject?.name,
        documentType: j.documentType ?? undefined,
        documentName: j.documentName ?? undefined,
        status: j.status,
        reviewedAt: toISO(j.reviewedAt),
        rejectionReason: j.status === 'REJECTED' ? (j.reviewNotes ?? undefined) : undefined,
        reviewNotes: j.reviewNotes ?? undefined,
        /** true si la presentó este responsable (false: la pidió el alumno o la cargó Preceptoría). */
        submittedByMe: j.createdBy === c.get('user').id,
      })),
    );
  })

  .post('/children/:id/justifications', async (c) => {
    const user = c.get('user');
    const { student } = await childOf(user, c.req.param('id'));
    const body = await parseBody(
      c,
      z.object({
        fromDate: z.string(),
        toDate: z.string(),
        reason: z.string().trim().min(3, 'Contá el motivo.').max(1000),
        documentType: z.enum(JUSTIFICATION_DOCUMENT_TYPES).optional(),
        documentName: z.string().trim().max(200).optional(),
      }),
    );
    const from = parseDate(body.fromDate, 'fromDate');
    const to = parseDate(body.toDate, 'toDate');
    if (to < from) throw new AppError('VALIDATION_ERROR', 'La fecha "hasta" es anterior a "desde".', [{ field: 'toDate', message: 'Anterior a "desde".' }]);
    const overlapping = await prisma.justification.findFirst({
      where: { studentId: student.id, status: 'PENDING', fromDate: { lte: to }, toDate: { gte: from } },
    });
    if (overlapping) throw new AppError('CONFLICT', 'Ya hay una justificación en revisión para esas fechas.');
    const j = await prisma.justification.create({
      data: { studentId: student.id, fromDate: from, toDate: to, reason: body.reason, documentType: body.documentType, documentName: body.documentName, createdBy: user.id },
    });
    await notify(await preceptorsOf(student.id), {
      type: 'JUSTIFICATION_REQUEST',
      text: `La familia de ${fullName(student)} pidió una justificación`,
      details: `${body.fromDate} a ${body.toDate}`,
      link: '/attendance/justifications',
    });
    await audit(c, user, { action: 'CREATE', entity: 'Justification', entityId: j.id, summary: `Justificación pedida por el responsable ${body.fromDate} a ${body.toDate}` });
    return c.json({ id: j.id, status: j.status }, 201);
  })

  // -------------------------------------------------------------- comunicados
  .get('/notices', async (c) => {
    const user = c.get('user');
    const g = await guardianOf(user);
    const enrollments = await enrollmentsOf(g.students.map((s) => s.studentId));
    const rows = await prisma.notice.findMany({
      where: { status: 'PUBLISHED', OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 300,
    });
    const visible = rows
      .map((n) => ({ n, children: noticeChildren((n.audience ?? {}) as NoticeAudience, enrollments) }))
      .filter((x) => x.children !== null);
    const reads = await prisma.noticeRead.findMany({ where: { userId: user.id, noticeId: { in: visible.map((x) => x.n.id) } } });
    const readAt = new Map(reads.map((r) => [r.noticeId, r.readAt.toISOString()]));
    const authors = await prisma.user.findMany({ where: { id: { in: [...new Set(visible.map((x) => x.n.createdBy))] } }, select: { id: true, firstName: true, lastName: true } });
    const authorName = new Map(authors.map((a) => [a.id, fullName(a)]));
    const nameOf = new Map(g.students.map((s) => [s.studentId, s.student.firstName]));
    return c.json(
      visible.map(({ n, children }) => ({
        id: n.id,
        title: n.title,
        publishedAt: (n.publishedAt ?? n.createdAt).toISOString(),
        author: authorName.get(n.createdBy) ?? 'ISFDyT N° 26',
        content: n.content,
        category: n.category,
        isUrgent: n.category === 'URGENT',
        /** Hijos a los que alcanza (vacío: toda la institución). */
        targetChildren: (children ?? []).map((id) => nameOf.get(id)).filter(Boolean),
        readByGuardian: readAt.has(n.id),
        readAt: readAt.get(n.id),
      })),
    );
  })

  .post('/notices/:id/read', async (c) => {
    const user = c.get('user');
    const g = await guardianOf(user);
    const n = await prisma.notice.findUnique({ where: { id: c.req.param('id') } });
    const enrollments = await enrollmentsOf(g.students.map((s) => s.studentId));
    if (!n || n.status !== 'PUBLISHED' || noticeChildren((n.audience ?? {}) as NoticeAudience, enrollments) === null) {
      throw notFound('No existe el comunicado.');
    }
    const r = await prisma.noticeRead.upsert({
      where: { noticeId_userId: { noticeId: n.id, userId: user.id } },
      create: { noticeId: n.id, userId: user.id },
      update: {},
    });
    return c.json({ noticeId: n.id, readAt: r.readAt.toISOString() });
  })

  // ----------------------------------------------------------- autorizaciones
  .get('/authorizations', async (c) => {
    const g = await guardianOf(c.get('user'));
    return c.json((await authorizationRows(g.students.map((s) => s.studentId))).map(authorizationDTO));
  })

  .patch('/authorizations/:id', async (c) => {
    const user = c.get('user');
    const g = await guardianOf(user);
    const body = await parseBody(c, z.object({ response: z.enum(['APPROVED', 'REJECTED']) }));
    const row = await prisma.authorizationResponse.findUnique({ where: { id: c.req.param('id') }, include: { request: true, student: true } });
    if (!row || !g.students.some((s) => s.studentId === row.studentId)) throw notFound('No existe la autorización.');
    // Una sola respuesta: el cambio de estado va atado a que siga pendiente.
    const done = await prisma.authorizationResponse.updateMany({
      where: { id: row.id, answer: 'PENDING' },
      data: { answer: body.response, respondedBy: user.id, respondedAt: new Date() },
    });
    if (done.count === 0) throw new AppError('CONFLICT', 'Esta autorización ya fue respondida.');
    await notify([row.request.createdBy], {
      type: 'GENERAL',
      text: `${fullName(user)} ${body.response === 'APPROVED' ? 'autorizó' : 'no autorizó'} "${row.request.title}"`,
      details: fullName(row.student),
      link: '/families/authorizations',
    });
    await audit(c, user, { action: 'STATUS_CHANGE', entity: 'AuthorizationResponse', entityId: row.id, summary: `Autorización ${body.response === 'APPROVED' ? 'aprobada' : 'rechazada'} por el responsable`, previousValue: { answer: 'PENDING' }, newValue: { answer: body.response } });
    const [fresh] = (await authorizationRows([row.studentId])).filter((r) => r.id === row.id);
    return c.json(authorizationDTO(fresh));
  })

  // -------------------------------------------------------------------- ficha
  .get('/profile', async (c) => {
    const user = c.get('user');
    const g = await guardianOf(user);
    return c.json({
      id: g.id,
      firstName: user.firstName,
      lastName: user.lastName,
      dni: g.dni,
      email: user.email,
      phone: g.phone ?? '',
      address: g.address ?? '',
      occupation: g.occupation ?? undefined,
      children: g.students.map((s) => ({
        childId: s.studentId,
        fullName: fullName(s.student),
        courseName: s.student.career.name,
        relationship: s.relationship,
      })),
    });
  })

  .get('/corrections', async (c) => {
    const g = await guardianOf(c.get('user'));
    const rows = await prisma.guardianCorrectionRequest.findMany({ where: { guardianId: g.id }, orderBy: { createdAt: 'desc' } });
    return c.json(rows.map(correctionDTO));
  })

  .post('/corrections', async (c) => {
    const user = c.get('user');
    const g = await guardianOf(user);
    const body = await parseBody(
      c,
      z.object({
        phone: z.string().trim().max(40).optional(),
        email: z.string().trim().email('Email inválido.').max(200).optional().or(z.literal('')),
        address: z.string().trim().max(200).optional(),
        notes: z.string().trim().max(1000).optional(),
      }),
    );
    const data = { phone: body.phone || null, email: body.email || null, address: body.address || null, notes: body.notes || null };
    if (!data.phone && !data.email && !data.address && !data.notes) throw new AppError('VALIDATION_ERROR', 'Indicá al menos un dato a corregir.');
    const pending = await prisma.guardianCorrectionRequest.findFirst({ where: { guardianId: g.id, status: 'PENDING' } });
    if (pending) throw new AppError('CONFLICT', 'Ya tenés un pedido de corrección en revisión.');
    const r = await prisma.guardianCorrectionRequest.create({ data: { guardianId: g.id, ...data } });
    const preceptors = (await Promise.all(g.students.map((s) => preceptorsOf(s.studentId)))).flat();
    await notify(preceptors, { type: 'GENERAL', text: `${fullName(user)} (familia) pidió corregir sus datos de contacto`, link: '/families/corrections' });
    await audit(c, user, { action: 'CREATE', entity: 'GuardianCorrectionRequest', entityId: r.id, summary: 'Pedido de corrección de datos del responsable' });
    return c.json(correctionDTO(r), 201);
  })

  // ----------------------------------------------------------------- contactos
  .get('/contacts', async (c) => {
    const g = await guardianOf(c.get('user'));
    const enrollments = await enrollmentsOf(g.students.map((s) => s.studentId));
    const nameOf = new Map(g.students.map((s) => [s.studentId, s.student.firstName]));
    const byUser = new Map<string, { role: 'PRECEPTOR' | 'TEACHER'; children: Set<string>; subjects: Set<string> }>();
    const add = (userId: string | null | undefined, role: 'PRECEPTOR' | 'TEACHER', studentId: string, subject: string) => {
      if (!userId) return;
      const cur = byUser.get(userId) ?? { role, children: new Set<string>(), subjects: new Set<string>() };
      if (role === 'PRECEPTOR') cur.role = 'PRECEPTOR';
      cur.children.add(nameOf.get(studentId) ?? '');
      cur.subjects.add(subject);
      byUser.set(userId, cur);
    };
    for (const e of enrollments) {
      add(e.commission.preceptorUserId, 'PRECEPTOR', e.studentId, e.commission.subject.name);
      for (const t of e.commission.teachers) add(t.teacher.userId, 'TEACHER', e.studentId, e.commission.subject.name);
    }
    const users = await prisma.user.findMany({ where: { id: { in: [...byUser.keys()] }, status: 'ACTIVE' }, select: { id: true, firstName: true, lastName: true } });
    return c.json(
      users.map((u) => {
        const x = byUser.get(u.id)!;
        return {
          userId: u.id,
          name: fullName(u),
          role: x.role,
          childNames: [...x.children].filter(Boolean),
          subjects: x.role === 'TEACHER' ? [...x.subjects] : [],
        };
      }),
    );
  });

/**
 * ¿A qué hijos alcanza un comunicado? null = no es para esta familia; [] = es general.
 * Una familia ve lo dirigido a Familias, a Alumnos o a toda la institución, y —si está acotado a
 * carrera, año o comisión— solo cuando alguno de sus hijos cursa ahí.
 */
function noticeChildren(a: NoticeAudience, enrollments: Awaited<ReturnType<typeof enrollmentsOf>>): string[] | null {
  if (a.roles?.length && !a.roles.includes('GUARDIAN') && !a.roles.includes('STUDENT')) return null;
  const scoped = Boolean(a.careerIds?.length || a.years?.length || a.commissionIds?.length);
  if (!scoped) return [];
  const hit = enrollments.filter(
    (e) =>
      (!a.careerIds?.length || a.careerIds.includes(e.commission.subject.plan.careerId)) &&
      (!a.years?.length || a.years.includes(e.commission.subject.year)) &&
      (!a.commissionIds?.length || a.commissionIds.includes(e.commissionId)),
  );
  return hit.length ? [...new Set(hit.map((e) => e.studentId))] : null;
}

// ============================================================================
// Lado institucional
// ============================================================================

const STAFF = ['SUPER_ADMIN', 'DIRECTOR', 'ADMINISTRATIVE', 'PRECEPTOR'] as const;
const MANAGE = ['SUPER_ADMIN', 'DIRECTOR', 'ADMINISTRATIVE'] as const;

/** Alumnos que el usuario puede alcanzar: gestión → todos; preceptor → los de sus comisiones. */
async function reachableStudentIds(user: CurrentUser): Promise<string[] | 'all'> {
  if (isManagement(user)) return 'all';
  const rows = await prisma.enrollment.findMany({
    where: { commission: await commissionScope(user), condition: { not: 'DROPPED' } },
    select: { studentId: true },
    distinct: ['studentId'],
  });
  return rows.map((r) => r.studentId);
}

export const familiesRoutes = new Hono<AppEnv>()
  .use(requireAuth, requireRoles(...STAFF))

  .get('/authorizations', async (c) => {
    const user = c.get('user');
    const reach = await reachableStudentIds(user);
    const rows = await prisma.authorizationRequest.findMany({
      where: reach === 'all' ? {} : { OR: [{ createdBy: user.id }, { responses: { some: { studentId: { in: reach } } } }] },
      include: { responses: { include: { student: true }, ...(reach === 'all' ? {} : { where: { studentId: { in: reach } } }) } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return c.json(
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        type: r.type,
        description: r.description,
        deadlineDate: toISODate(r.deadlineDate),
        destination: r.destination ?? undefined,
        dateOfEvent: r.eventDate ? toISODate(r.eventDate) : undefined,
        responsiblePersonName: r.responsible ?? undefined,
        createdAt: r.createdAt.toISOString(),
        counts: {
          pending: r.responses.filter((x) => x.answer === 'PENDING').length,
          approved: r.responses.filter((x) => x.answer === 'APPROVED').length,
          rejected: r.responses.filter((x) => x.answer === 'REJECTED').length,
        },
        responses: r.responses.map((x) => ({
          id: x.id,
          studentId: x.studentId,
          studentName: `${x.student.lastName}, ${x.student.firstName}`,
          response: x.answer,
          respondedAt: toISO(x.respondedAt),
        })),
      })),
    );
  })

  .post('/authorizations', async (c) => {
    const user = c.get('user');
    const body = await parseBody(
      c,
      z.object({
        title: z.string().trim().min(3).max(160),
        type: z.enum(AUTHORIZATION_TYPES),
        description: z.string().trim().min(3).max(2000),
        deadlineDate: z.string(),
        destination: z.string().trim().max(200).optional(),
        dateOfEvent: z.string().optional(),
        responsiblePersonName: z.string().trim().max(160).optional(),
        /** A quiénes se les pide: alumnos puntuales y/o comisiones enteras. */
        studentIds: z.array(z.string().uuid()).max(500).optional(),
        commissionIds: z.array(z.string().uuid()).max(100).optional(),
      }),
    );
    const reach = await reachableStudentIds(user);
    const fromCommissions = body.commissionIds?.length
      ? (await prisma.enrollment.findMany({ where: { commissionId: { in: body.commissionIds }, condition: { not: 'DROPPED' } }, select: { studentId: true } })).map((e) => e.studentId)
      : [];
    const wanted = [...new Set([...(body.studentIds ?? []), ...fromCommissions])];
    const targets = reach === 'all' ? wanted : wanted.filter((id) => reach.includes(id));
    // Solo tiene sentido pedirla a alumnos con algún responsable vinculado.
    const withGuardian = await prisma.studentGuardian.findMany({ where: { studentId: { in: targets } }, select: { studentId: true }, distinct: ['studentId'] });
    if (withGuardian.length === 0) {
      throw new AppError('VALIDATION_ERROR', 'Ninguno de los alumnos elegidos tiene un responsable vinculado.', [{ field: 'studentIds', message: 'Sin responsables vinculados.' }]);
    }
    const r = await prisma.authorizationRequest.create({
      data: {
        title: body.title,
        type: body.type,
        description: body.description,
        deadlineDate: parseDate(body.deadlineDate, 'deadlineDate'),
        destination: body.destination,
        eventDate: body.dateOfEvent ? parseDate(body.dateOfEvent, 'dateOfEvent') : null,
        responsible: body.responsiblePersonName ?? fullName(user),
        createdBy: user.id,
        responses: { create: withGuardian.map((s) => ({ studentId: s.studentId })) },
      },
    });
    await notify(await guardianUserIdsOf(withGuardian.map((s) => s.studentId)), {
      type: 'GENERAL',
      text: `Nueva autorización para responder: ${body.title}`,
      details: `Vence el ${body.deadlineDate}`,
      link: '/guardian/authorizations',
    });
    await audit(c, user, { action: 'CREATE', entity: 'AuthorizationRequest', entityId: r.id, summary: `Autorización pedida a ${withGuardian.length} familias: ${body.title}` });
    return c.json({ id: r.id, students: withGuardian.length }, 201);
  })

  .get('/guardians', async (c) => {
    const reach = await reachableStudentIds(c.get('user'));
    const rows = await prisma.guardian.findMany({
      where: reach === 'all' ? {} : { students: { some: { studentId: { in: reach } } } },
      include: { user: true, students: { include: { student: true } } },
      orderBy: { user: { lastName: 'asc' } },
      take: 500,
    });
    return c.json(
      rows.map((g) => ({
        id: g.id,
        userId: g.userId,
        firstName: g.user.firstName,
        lastName: g.user.lastName,
        email: g.user.email,
        phone: g.phone ?? undefined,
        children: g.students
          .filter((s) => reach === 'all' || reach.includes(s.studentId))
          .map((s) => ({ studentId: s.studentId, fullName: fullName(s.student), relationship: s.relationship })),
      })),
    );
  })

  // Crea o actualiza la ficha del responsable y sus vínculos (la cuenta con rol GUARDIAN ya existe).
  .put('/guardians/:userId', requireRoles(...MANAGE), async (c) => {
    const actor = c.get('user');
    const body = await parseBody(
      c,
      z.object({
        dni: z.string().trim().min(6).max(20),
        phone: z.string().trim().max(40).optional(),
        address: z.string().trim().max(200).optional(),
        occupation: z.string().trim().max(120).optional(),
        children: z.array(z.object({ studentId: z.string().uuid(), relationship: z.enum(RELATIONSHIPS) })).min(1, 'Vinculá al menos un alumno.').max(20),
      }),
    );
    const target = await prisma.user.findUnique({ where: { id: c.req.param('userId') } });
    if (!target || !target.roles.includes('GUARDIAN')) throw notFound('No existe una cuenta de familia con ese id.');
    const students = await prisma.student.count({ where: { id: { in: body.children.map((x) => x.studentId) } } });
    if (students !== new Set(body.children.map((x) => x.studentId)).size) throw new AppError('VALIDATION_ERROR', 'Alguno de los alumnos no existe.');
    const dniTaken = await prisma.guardian.findFirst({ where: { dni: body.dni, userId: { not: target.id } } });
    if (dniTaken) throw new AppError('CONFLICT', 'Ya hay un responsable con ese DNI.');
    const data = { dni: body.dni, phone: body.phone ?? null, address: body.address ?? null, occupation: body.occupation ?? null };
    const g = await prisma.guardian.upsert({ where: { userId: target.id }, update: data, create: { userId: target.id, ...data } });
    await prisma.$transaction([
      prisma.studentGuardian.deleteMany({ where: { guardianId: g.id } }),
      prisma.studentGuardian.createMany({ data: body.children.map((x) => ({ guardianId: g.id, ...x })) }),
    ]);
    await audit(c, actor, { action: 'UPDATE', entity: 'Guardian', entityId: g.id, summary: `Responsable vinculado a ${body.children.length} alumno(s)` });
    return c.json({ id: g.id, children: body.children.length });
  })

  .get('/corrections', async (c) => {
    const reach = await reachableStudentIds(c.get('user'));
    const rows = await prisma.guardianCorrectionRequest.findMany({
      where: reach === 'all' ? {} : { guardian: { students: { some: { studentId: { in: reach } } } } },
      include: { guardian: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
      take: 300,
    });
    return c.json(rows.map((r) => ({ ...correctionDTO(r), guardianId: r.guardianId, guardianName: fullName(r.guardian.user) })));
  })

  // Aprobar aplica teléfono y domicilio a la ficha. El email de ingreso lo cambia Directivos aparte.
  .patch('/corrections/:id', async (c) => {
    const user = c.get('user');
    const body = await parseBody(c, z.object({ status: z.enum(['APPROVED', 'REJECTED']), reviewNotes: z.string().trim().max(1000).optional() }));
    const reach = await reachableStudentIds(user);
    const r = await prisma.guardianCorrectionRequest.findUnique({ where: { id: c.req.param('id') }, include: { guardian: { include: { students: true } } } });
    if (!r || (reach !== 'all' && !r.guardian.students.some((s) => reach.includes(s.studentId)))) throw notFound('No existe el pedido.');
    if (r.status !== 'PENDING') throw new AppError('CONFLICT', 'Este pedido ya fue resuelto.');
    const updated = await prisma.guardianCorrectionRequest.update({
      where: { id: r.id },
      data: { status: body.status, reviewNotes: body.reviewNotes, reviewedBy: user.id, reviewedAt: new Date() },
    });
    if (body.status === 'APPROVED' && (r.phone || r.address)) {
      await prisma.guardian.update({ where: { id: r.guardianId }, data: { ...(r.phone ? { phone: r.phone } : {}), ...(r.address ? { address: r.address } : {}) } });
    }
    await notify([r.guardian.userId], {
      type: 'GENERAL',
      text: body.status === 'APPROVED' ? 'Aceptaron tu pedido de corrección de datos' : 'Rechazaron tu pedido de corrección de datos',
      details: body.reviewNotes,
      link: '/guardian/corrections',
    });
    await audit(c, user, { action: 'STATUS_CHANGE', entity: 'GuardianCorrectionRequest', entityId: r.id, summary: `Pedido de corrección ${body.status === 'APPROVED' ? 'aceptado' : 'rechazado'}`, previousValue: { status: r.status }, newValue: { status: updated.status } });
    return c.json(correctionDTO(updated));
  });
