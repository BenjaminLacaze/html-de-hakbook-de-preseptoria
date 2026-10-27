// Notas, observaciones, comunicados, eventos, auditoría y configuración institucional.
//
//   GET /records/grades?commissionId=           PUT /records/grades (carga o corrige)   POST /records/grades/publish
//   GET /records/observations?commissionId|studentId   POST /records/observations
//   GET /records/notices      POST /records/notices      PATCH /records/notices/:id
//   GET /records/events?from&to   POST /records/events   PATCH|DELETE /records/events/:id
//   GET /records/audit?entity&userId&limit
//   GET /records/settings     PATCH /records/settings
import { Hono } from 'hono';
import { z } from 'zod';
import {
  ASSESSMENT_TYPES,
  EVENT_TYPES,
  NOTICE_CATEGORIES,
  NOTICE_STATUSES,
  OBSERVATION_CATEGORIES,
  ROLES,
  type AuditLogEntry,
  type Grade,
  type InstitutionSettings,
  type Notice,
  type NoticeAudience,
  type Observation,
  type SchoolEvent,
} from '../../../shared/types.js';
import { audit } from '../audit.js';
import { requireAuth, requireRoles, type AppEnv, type CurrentUser } from '../auth/middleware.js';
import { prisma } from '../db.js';
import { AppError, forbidden, notFound } from '../errors.js';
import type { Prisma } from '../generated/prisma/client.js';
import { notify } from '../notify.js';
import { activeCycle, commissionScope, hasRole, isManagement, parseDate, toISO, toISODate } from '../scope.js';
import { parseBody } from '../validation.js';

const MANAGE = ['SUPER_ADMIN', 'DIRECTOR', 'ADMINISTRATIVE'] as const;
const ACADEMIC = [...MANAGE, 'PRECEPTOR', 'TEACHER'] as const;

/** La comisión tiene que estar en el alcance del usuario (docente, preceptor o gestión). */
async function assertCommission(user: CurrentUser, commissionId: string) {
  const cm = await prisma.commission.findFirst({ where: { AND: [await commissionScope(user), { id: commissionId }] } });
  if (!cm) throw notFound('No existe la comisión o no la tenés a cargo.');
  return cm;
}

const gradeDTO = (g: Prisma.GradeGetPayload<object>): Grade => ({
  id: g.id,
  enrollmentId: g.enrollmentId,
  type: g.type,
  instance: g.instance,
  date: toISODate(g.date),
  value: g.value === null ? null : Number(g.value),
  absent: g.absent,
  published: g.published,
  publishedAt: toISO(g.publishedAt),
  notes: g.notes ?? undefined,
  recordedBy: g.recordedBy,
  recordedAt: g.recordedAt.toISOString(),
});

const noticeDTO = (n: Prisma.NoticeGetPayload<object>): Notice => ({
  id: n.id,
  cycleId: n.cycleId,
  title: n.title,
  content: n.content,
  category: n.category,
  audience: (n.audience ?? {}) as NoticeAudience,
  status: n.status,
  pinned: n.pinned,
  publishedAt: toISO(n.publishedAt),
  expiresAt: toISO(n.expiresAt),
  createdBy: n.createdBy,
  createdAt: n.createdAt.toISOString(),
  updatedAt: n.updatedAt.toISOString(),
});

/** ¿El comunicado está dirigido a este usuario? (vacío = toda la institución) */
async function audienceMatches(a: NoticeAudience, user: CurrentUser): Promise<boolean> {
  if (a.roles?.length && !user.roles.some((r) => a.roles!.includes(r))) return false;
  const scoped = Boolean(a.careerIds?.length || a.years?.length || a.commissionIds?.length);
  if (!scoped || isManagement(user)) return true;
  // Alumno: por sus inscripciones. Docente/preceptor: por sus comisiones.
  const commissions = user.studentId
    ? await prisma.commission.findMany({ where: { enrollments: { some: { studentId: user.studentId } } }, include: { subject: { include: { plan: true } } } })
    : await prisma.commission.findMany({ where: await commissionScope(user), include: { subject: { include: { plan: true } } } });
  return commissions.some(
    (cm) =>
      (!a.careerIds?.length || a.careerIds.includes(cm.subject.plan.careerId)) &&
      (!a.years?.length || a.years.includes(cm.subject.year)) &&
      (!a.commissionIds?.length || a.commissionIds.includes(cm.id)),
  );
}

const noticeBody = z.object({
  title: z.string().trim().min(2).max(200),
  content: z.string().trim().min(2).max(10_000),
  category: z.enum(NOTICE_CATEGORIES),
  audience: z
    .object({
      roles: z.array(z.enum(ROLES)).optional(),
      careerIds: z.array(z.string().uuid()).optional(),
      years: z.array(z.number().int().min(1).max(8)).optional(),
      commissionIds: z.array(z.string().uuid()).optional(),
    })
    .default({}),
  publish: z.boolean().optional(),
  pinned: z.boolean().optional(),
  expiresAt: z.string().datetime({ offset: true }).optional(),
});

const eventBody = z.object({
  type: z.enum(EVENT_TYPES),
  title: z.string().trim().min(2).max(200),
  description: z.string().max(3000).optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  commissionId: z.string().uuid().optional(),
  mandatory: z.boolean().default(false),
});

const eventDTO = (e: Prisma.SchoolEventGetPayload<object>): SchoolEvent => ({
  id: e.id,
  cycleId: e.cycleId,
  type: e.type,
  title: e.title,
  description: e.description ?? undefined,
  startDate: toISODate(e.startDate),
  endDate: e.endDate ? toISODate(e.endDate) : undefined,
  commissionId: e.commissionId ?? undefined,
  mandatory: e.mandatory,
  createdAt: e.createdAt.toISOString(),
  updatedAt: e.updatedAt.toISOString(),
});

export const recordsRoutes = new Hono<AppEnv>()
  .use(requireAuth)

  // -------------------------------------------------------------------- notas
  .get('/grades', requireRoles(...ACADEMIC), async (c) => {
    const commissionId = c.req.query('commissionId');
    if (!commissionId) throw new AppError('VALIDATION_ERROR', 'Indicá commissionId.');
    await assertCommission(c.get('user'), commissionId);
    const rows = await prisma.grade.findMany({ where: { enrollment: { commissionId } }, orderBy: [{ type: 'asc' }, { instance: 'asc' }] });
    return c.json(rows.map(gradeDTO));
  })
  .put('/grades', requireRoles('SUPER_ADMIN', 'DIRECTOR', 'TEACHER'), async (c) => {
    const user = c.get('user');
    const b = await parseBody(
      c,
      z.object({
        enrollmentId: z.string().uuid(),
        type: z.enum(ASSESSMENT_TYPES),
        instance: z.number().int().min(1).max(10).default(1),
        date: z.string(),
        value: z.number().min(1).max(10).nullable(),
        absent: z.boolean().default(false),
        notes: z.string().max(1000).optional(),
      }),
    );
    const en = await prisma.enrollment.findUnique({ where: { id: b.enrollmentId } });
    if (!en) throw notFound('No existe la inscripción.');
    await assertCommission(user, en.commissionId);
    const data = { date: parseDate(b.date), value: b.absent ? null : b.value, absent: b.absent, notes: b.notes, recordedBy: user.id, recordedAt: new Date() };
    const g = await prisma.grade.upsert({
      where: { enrollmentId_type_instance: { enrollmentId: b.enrollmentId, type: b.type, instance: b.instance } },
      create: { enrollmentId: b.enrollmentId, type: b.type, instance: b.instance, ...data },
      update: data,
    });
    await audit(c, user, { action: 'UPDATE', entity: 'Grade', entityId: g.id, summary: `Nota ${b.type} ${b.instance}: ${b.absent ? 'ausente' : b.value}` });
    return c.json(gradeDTO(g));
  })
  .post('/grades/publish', requireRoles('SUPER_ADMIN', 'DIRECTOR', 'TEACHER'), async (c) => {
    const user = c.get('user');
    const b = await parseBody(c, z.object({ commissionId: z.string().uuid(), type: z.enum(ASSESSMENT_TYPES), instance: z.number().int().min(1).max(10) }));
    await assertCommission(user, b.commissionId);
    const r = await prisma.grade.updateMany({
      where: { enrollment: { commissionId: b.commissionId }, type: b.type, instance: b.instance, published: false },
      data: { published: true, publishedAt: new Date() },
    });
    const students = await prisma.enrollment.findMany({ where: { commissionId: b.commissionId }, select: { student: { select: { userId: true } } } });
    await notify(students.map((s) => s.student.userId), { type: 'ANNOUNCEMENT', text: 'Se publicaron notas nuevas', link: '/me/grades' });
    await audit(c, user, { action: 'UPDATE', entity: 'Grade', entityId: b.commissionId, summary: `Publicadas ${r.count} notas (${b.type} ${b.instance})` });
    return c.json({ published: r.count });
  })

  // ------------------------------------------------------------ observaciones
  .get('/observations', requireRoles(...ACADEMIC), async (c) => {
    const q = c.req.query();
    const scope = await commissionScope(c.get('user'));
    const rows = await prisma.observation.findMany({
      where: { commission: scope, ...(q.commissionId ? { commissionId: q.commissionId } : {}), ...(q.studentId ? { studentId: q.studentId } : {}) },
      orderBy: { date: 'desc' },
      take: 1000,
    });
    const out: Observation[] = rows.map((o) => ({
      id: o.id,
      commissionId: o.commissionId,
      studentId: o.studentId,
      date: toISODate(o.date),
      category: o.category,
      content: o.content,
      createdBy: o.createdBy,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    }));
    return c.json(out);
  })
  .post('/observations', requireRoles('SUPER_ADMIN', 'DIRECTOR', 'PRECEPTOR', 'TEACHER'), async (c) => {
    const user = c.get('user');
    const b = await parseBody(
      c,
      z.object({
        commissionId: z.string().uuid(),
        studentId: z.string().uuid(),
        date: z.string(),
        category: z.enum(OBSERVATION_CATEGORIES),
        content: z.string().trim().min(3).max(5000),
      }),
    );
    await assertCommission(user, b.commissionId);
    const en = await prisma.enrollment.findUnique({ where: { studentId_commissionId: { studentId: b.studentId, commissionId: b.commissionId } } });
    if (!en) throw new AppError('VALIDATION_ERROR', 'El alumno no está inscripto en esa comisión.');
    const o = await prisma.observation.create({ data: { ...b, date: parseDate(b.date), createdBy: user.id } });
    return c.json({ id: o.id }, 201);
  })

  // ------------------------------------------------------------- comunicados
  .get('/notices', async (c) => {
    const user = c.get('user');
    const all = c.req.query('all') === '1' && hasRole(user, ...MANAGE);
    const rows = await prisma.notice.findMany({
      where: all ? {} : { status: 'PUBLISHED', OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 300,
    });
    const visible: Notice[] = [];
    for (const n of rows) {
      if (all || n.createdBy === user.id || (await audienceMatches((n.audience ?? {}) as NoticeAudience, user))) visible.push(noticeDTO(n));
    }
    return c.json(visible);
  })
  .post('/notices', requireRoles(...MANAGE, 'PRECEPTOR'), async (c) => {
    const user = c.get('user');
    const b = await parseBody(c, noticeBody);
    // El preceptor solo puede dirigirse a sus comisiones/carreras (no a toda la institución).
    if (!isManagement(user) && !(b.audience.careerIds?.length || b.audience.commissionIds?.length)) {
      throw forbidden('Como preceptor, el comunicado tiene que ir dirigido a una carrera o comisión.');
    }
    const cycle = await activeCycle();
    const n = await prisma.notice.create({
      data: {
        cycleId: cycle.id,
        title: b.title,
        content: b.content,
        category: b.category,
        audience: b.audience,
        status: b.publish ? 'PUBLISHED' : 'DRAFT',
        publishedAt: b.publish ? new Date() : null,
        pinned: b.pinned ?? false,
        expiresAt: b.expiresAt ? new Date(b.expiresAt) : null,
        createdBy: user.id,
      },
    });
    await audit(c, user, { action: 'CREATE', entity: 'Notice', entityId: n.id, summary: `Comunicado: ${n.title}` });
    return c.json(noticeDTO(n), 201);
  })
  .patch('/notices/:id', requireRoles(...MANAGE, 'PRECEPTOR'), async (c) => {
    const user = c.get('user');
    const b = await parseBody(c, noticeBody.partial().extend({ status: z.enum(NOTICE_STATUSES).optional() }));
    const n = await prisma.notice.findUnique({ where: { id: c.req.param('id') } });
    if (!n) throw notFound('No existe el comunicado.');
    if (!isManagement(user) && n.createdBy !== user.id) throw forbidden('Solo podés editar tus comunicados.');
    const { publish, expiresAt, ...rest } = b;
    const status = publish ? 'PUBLISHED' : b.status;
    const u = await prisma.notice.update({
      where: { id: n.id },
      data: {
        ...rest,
        ...(status ? { status, ...(status === 'PUBLISHED' && !n.publishedAt ? { publishedAt: new Date() } : {}) } : {}),
        ...(expiresAt ? { expiresAt: new Date(expiresAt) } : {}),
      },
    });
    return c.json(noticeDTO(u));
  })

  // ------------------------------------------------------------------ eventos
  .get('/events', async (c) => {
    const q = c.req.query();
    const rows = await prisma.schoolEvent.findMany({
      where: {
        ...(q.from || q.to
          ? { startDate: { ...(q.from ? { gte: parseDate(q.from, 'from') } : {}), ...(q.to ? { lte: parseDate(q.to, 'to') } : {}) } }
          : {}),
      },
      orderBy: { startDate: 'asc' },
      take: 500,
    });
    return c.json(rows.map(eventDTO));
  })
  .post('/events', requireRoles(...MANAGE), async (c) => {
    const b = await parseBody(c, eventBody);
    const cycle = await activeCycle();
    const e = await prisma.schoolEvent.create({
      data: { ...b, cycleId: cycle.id, startDate: parseDate(b.startDate, 'startDate'), endDate: b.endDate ? parseDate(b.endDate, 'endDate') : null },
    });
    await audit(c, c.get('user'), { action: 'CREATE', entity: 'SchoolEvent', entityId: e.id, summary: `Evento: ${e.title}` });
    return c.json(eventDTO(e), 201);
  })
  .patch('/events/:id', requireRoles(...MANAGE), async (c) => {
    const b = await parseBody(c, eventBody.partial());
    const e = await prisma.schoolEvent.findUnique({ where: { id: c.req.param('id') } });
    if (!e) throw notFound('No existe el evento.');
    const u = await prisma.schoolEvent.update({
      where: { id: e.id },
      data: {
        ...b,
        ...(b.startDate ? { startDate: parseDate(b.startDate, 'startDate') } : {}),
        ...(b.endDate ? { endDate: parseDate(b.endDate, 'endDate') } : {}),
      },
    });
    return c.json(eventDTO(u));
  })
  .delete('/events/:id', requireRoles(...MANAGE), async (c) => {
    const e = await prisma.schoolEvent.findUnique({ where: { id: c.req.param('id') } });
    if (!e) throw notFound('No existe el evento.');
    await prisma.schoolEvent.delete({ where: { id: e.id } });
    await audit(c, c.get('user'), { action: 'DELETE', entity: 'SchoolEvent', entityId: e.id, summary: `Evento eliminado: ${e.title}` });
    return c.body(null, 204);
  })

  // ---------------------------------------------------------------- auditoría
  .get('/audit', requireRoles('SUPER_ADMIN', 'DIRECTOR'), async (c) => {
    const q = c.req.query();
    const rows = await prisma.auditLog.findMany({
      where: { ...(q.entity ? { entity: q.entity } : {}), ...(q.userId ? { userId: q.userId } : {}) },
      orderBy: { at: 'desc' },
      take: Math.min(Number(q.limit ?? 100), 1000),
    });
    const out: AuditLogEntry[] = rows.map((a) => ({
      id: a.id,
      at: a.at.toISOString(),
      userId: a.userId ?? '',
      userName: a.userName,
      action: a.action,
      entity: a.entity,
      entityId: a.entityId,
      summary: a.summary,
      previousValue: a.previousValue ?? undefined,
      newValue: a.newValue ?? undefined,
    }));
    return c.json(out);
  })

  // ------------------------------------------------------------ configuración
  .get('/settings', async (c) => {
    const s = await prisma.institutionSettings.findUnique({ where: { id: 1 } });
    if (!s) throw notFound('Falta la configuración institucional (npm run db:seed).');
    const out: InstitutionSettings = {
      name: s.name,
      shortName: s.shortName,
      cue: s.cue ?? undefined,
      city: s.city,
      district: s.district,
      timezone: 'America/Argentina/Buenos_Aires',
      minAttendancePercent: s.minAttendancePercent,
      lateArrivalAbsenceWeight: Number(s.lateArrivalAbsenceWeight),
      attendanceRiskThresholdPercent: s.attendanceRiskThresholdPercent,
    };
    return c.json(out);
  })
  .patch('/settings', requireRoles('SUPER_ADMIN', 'DIRECTOR'), async (c) => {
    const b = await parseBody(
      c,
      z
        .object({
          name: z.string().trim().min(2).max(200),
          shortName: z.string().trim().min(2).max(60),
          cue: z.string().max(20).nullable(),
          city: z.string().trim().min(2).max(80),
          district: z.string().trim().min(2).max(80),
          minAttendancePercent: z.number().int().min(0).max(100),
          lateArrivalAbsenceWeight: z.number().min(0).max(1),
          attendanceRiskThresholdPercent: z.number().int().min(0).max(100),
        })
        .partial(),
    );
    const before = await prisma.institutionSettings.findUnique({ where: { id: 1 } });
    if (!before) throw notFound('Falta la configuración institucional (npm run db:seed).');
    await prisma.institutionSettings.update({ where: { id: 1 }, data: b });
    await audit(c, c.get('user'), {
      action: 'SETTINGS_CHANGE',
      entity: 'InstitutionSettings',
      entityId: '1',
      summary: `Configuración: ${Object.keys(b).join(', ')}`,
      previousValue: JSON.parse(JSON.stringify(before)),
      newValue: b,
    });
    return c.json({ ok: true });
  });
