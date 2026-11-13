// Auxiliares (maestranza / mantenimiento): tareas, instalaciones, incidencias y mantenimiento.
//   Auxiliares, Directivos, Administrativos y Superadmin.
//
//   GET   /staff/tasks?date=AAAA-MM-DD     POST /staff/tasks      PATCH /staff/tasks/:id
//   GET   /staff/installations             PATCH /staff/installations/:id
//   GET   /staff/incidents?status=         POST /staff/incidents  PATCH /staff/incidents/:id
//   GET   /staff/maintenance               POST /staff/maintenance
//   GET   /staff/people                    (auxiliares activos)
//   GET   /staff/shifts?from&to&userId     POST /staff/shifts     PATCH|DELETE /staff/shifts/:id   (alta: Directivos)
//   GET   /staff/shift-changes?status=     POST /staff/shift-changes   PATCH /staff/shift-changes/:id
//   GET   /staff/absences?status=          POST /staff/absences   PATCH /staff/absences/:id (Directivos)   DELETE (la propia, pendiente)
import { Hono } from 'hono';
import { z } from 'zod';
import {
  INCIDENT_PRIORITIES,
  INCIDENT_STATUSES,
  INSTALLATION_STATUSES,
  JUSTIFICATION_STATUSES,
  SHIFT_CHANGE_STATUSES,
  STAFF_ABSENCE_REASONS,
  STAFF_SHIFT_TYPES,
  STAFF_TASK_STATUSES,
  STAFF_TASK_TYPES,
  type Incident,
  type Installation,
  type MaintenanceLog,
  type ShiftChangeRequest,
  type StaffAbsence,
  type StaffMember,
  type StaffShift,
  type StaffTask,
} from '../../../shared/types.js';
import { audit } from '../audit.js';
import { requireAuth, requireRoles, type AppEnv } from '../auth/middleware.js';
import { prisma } from '../db.js';
import { AppError, forbidden, notFound } from '../errors.js';
import type { Prisma } from '../generated/prisma/client.js';
import { notify } from '../notify.js';
import { isManagement, parseDate, toISO, toISODate } from '../scope.js';
import { parseBody } from '../validation.js';

const TIME = z.string().regex(/^\d{2}:\d{2}$/, 'Hora HH:mm');
const SHIFT_MANAGERS = ['DIRECTOR', 'ADMINISTRATIVE', 'SUPER_ADMIN'] as const;

/** Foto de una incidencia: URL https o imagen embebida (data URL), hasta ~1,5 MB. */
const IMAGE = z
  .string()
  .max(2_000_000, 'La foto es demasiado grande.')
  .refine((v) => /^https?:\/\//.test(v) || /^data:image\/(jpeg|png|webp);base64,/.test(v), 'Foto inválida.');

/** Nombre y apellido de cada usuario de la lista (para mostrar quién hizo qué). */
async function namesOf(ids: (string | null | undefined)[]): Promise<Map<string, string>> {
  const unique = [...new Set(ids.filter((x): x is string => Boolean(x)))];
  if (!unique.length) return new Map();
  const users = await prisma.user.findMany({ where: { id: { in: unique } }, select: { id: true, firstName: true, lastName: true } });
  return new Map(users.map((u) => [u.id, `${u.firstName} ${u.lastName}`]));
}

type AbsenceRow = Prisma.StaffAbsenceGetPayload<{ include: { user: true } }>;
const absenceDTO = (a: AbsenceRow): StaffAbsence => ({
  id: a.id,
  userId: a.userId,
  userName: `${a.user.lastName}, ${a.user.firstName}`,
  fromDate: toISODate(a.fromDate),
  toDate: toISODate(a.toDate),
  reason: a.reason,
  notes: a.notes,
  documentName: a.documentName ?? undefined,
  documentUrl: a.documentUrl ?? undefined,
  status: a.status,
  reviewedBy: a.reviewedBy ?? undefined,
  reviewedAt: toISO(a.reviewedAt),
  reviewNotes: a.reviewNotes ?? undefined,
  createdAt: a.createdAt.toISOString(),
  updatedAt: a.updatedAt.toISOString(),
});

const shiftBody = z.object({
  userId: z.string().uuid(),
  date: z.string(),
  startTime: TIME.optional(),
  endTime: TIME.optional(),
  type: z.enum(STAFF_SHIFT_TYPES).default('REGULAR'),
  notes: z.string().max(500).optional(),
});

type Slot = { date: Date; startTime: string | null; endTime: string | null };
/** Horario de un turno; sin horario cuenta como todo el día. */
const span = (s: Slot): [string, string] => [s.startTime ?? '00:00', s.endTime ?? '24:00'];

function checkTimes(s: Slot) {
  const [start, end] = span(s);
  if (start >= end) throw new AppError('VALIDATION_ERROR', 'La hora de fin tiene que ser posterior a la de inicio.');
}

/** Turno de esa persona, ese día, que se superpone con el horario dado (sin contar los excluidos). */
async function overlapping(userId: string, slot: Slot, exclude: string[] = []) {
  const [start, end] = span(slot);
  const sameDay = await prisma.staffShift.findMany({ where: { userId, date: slot.date, id: { notIn: exclude } } });
  return sameDay.find((x) => {
    const [s, e] = span(x);
    return start < e && s < end;
  });
}

/** Un intercambio es posible si a ninguno de los dos le queda un turno superpuesto. */
async function checkSwap(mine: Prisma.StaffShiftGetPayload<object>, theirs: Prisma.StaffShiftGetPayload<object>) {
  const exclude = [mine.id, theirs.id];
  if ((await overlapping(mine.userId, theirs, exclude)) || (await overlapping(theirs.userId, mine, exclude))) {
    throw new AppError('CONFLICT', 'Con el cambio, a alguno de los dos se le superponen turnos ese día.');
  }
}

type ShiftRow = Prisma.StaffShiftGetPayload<{ include: { user: true } }>;
const shiftDTO = (s: ShiftRow): StaffShift => ({
  id: s.id,
  userId: s.userId,
  userName: `${s.user.lastName}, ${s.user.firstName}`,
  date: toISODate(s.date),
  startTime: s.startTime ?? undefined,
  endTime: s.endTime ?? undefined,
  type: s.type,
  notes: s.notes ?? undefined,
  createdAt: s.createdAt.toISOString(),
  updatedAt: s.updatedAt.toISOString(),
});

const changeInclude = {
  requester: true,
  colleague: true,
  requesterShift: { include: { user: true } },
  colleagueShift: { include: { user: true } },
} as const satisfies Prisma.ShiftChangeRequestInclude;

const changeDTO = (r: Prisma.ShiftChangeRequestGetPayload<{ include: typeof changeInclude }>): ShiftChangeRequest => ({
  id: r.id,
  requesterId: r.requesterId,
  requesterName: `${r.requester.lastName}, ${r.requester.firstName}`,
  colleagueId: r.colleagueId,
  colleagueName: `${r.colleague.lastName}, ${r.colleague.firstName}`,
  requesterShift: shiftDTO(r.requesterShift),
  colleagueShift: shiftDTO(r.colleagueShift),
  reason: r.reason ?? undefined,
  status: r.status,
  respondedAt: toISO(r.respondedAt),
  respondedBy: r.respondedBy ?? undefined,
  createdAt: r.createdAt.toISOString(),
  updatedAt: r.updatedAt.toISOString(),
});

type TaskRow = Prisma.StaffTaskGetPayload<object>;
const taskDTO = (t: TaskRow, names = new Map<string, string>()): StaffTask => ({
  id: t.id,
  date: toISODate(t.date),
  startTime: t.startTime,
  title: t.title,
  type: t.type,
  status: t.status,
  priority: t.priority ?? undefined,
  location: t.location,
  installationId: t.installationId ?? undefined,
  details: t.details ?? undefined,
  assignedToUserId: t.assignedToUserId ?? undefined,
  completedAt: toISO(t.completedAt),
  completedBy: t.completedBy ?? undefined,
  completedByName: t.completedBy ? names.get(t.completedBy) : undefined,
  createdAt: t.createdAt.toISOString(),
  updatedAt: t.updatedAt.toISOString(),
});

type InstRow = Prisma.InstallationGetPayload<object>;
const installationDTO = (i: InstRow, names = new Map<string, string>()): Installation => ({
  id: i.id,
  name: i.name,
  code: i.code ?? undefined,
  floor: i.floor ?? undefined,
  status: i.status,
  layout: i.layout as Installation['layout'],
  lastCleanedAt: toISO(i.lastCleanedAt),
  lastCleanedBy: i.lastCleanedBy ?? undefined,
  lastCleanedByName: i.lastCleanedBy ? names.get(i.lastCleanedBy) : undefined,
  nextTask: i.nextTask ?? undefined,
  notes: i.notes ?? undefined,
  createdAt: i.createdAt.toISOString(),
  updatedAt: i.updatedAt.toISOString(),
});

type IncRow = Prisma.IncidentGetPayload<object>;
const incidentDTO = (i: IncRow, names = new Map<string, string>()): Incident => ({
  id: i.id,
  description: i.description,
  priority: i.priority,
  sector: i.sector,
  installationId: i.installationId ?? undefined,
  imageUrl: i.imageUrl ?? undefined,
  notes: i.notes ?? undefined,
  status: i.status,
  reportedBy: i.reportedBy,
  reportedByName: names.get(i.reportedBy),
  resolvedAt: toISO(i.resolvedAt),
  resolvedBy: i.resolvedBy ?? undefined,
  resolvedByName: i.resolvedBy ? names.get(i.resolvedBy) : undefined,
  createdAt: i.createdAt.toISOString(),
  updatedAt: i.updatedAt.toISOString(),
});

export const staffRoutes = new Hono<AppEnv>()
  .use(requireAuth, requireRoles('STAFF', 'DIRECTOR', 'ADMINISTRATIVE', 'SUPER_ADMIN'))

  // ---------------------------------------------------------------- tareas
  .get('/tasks', async (c) => {
    const date = c.req.query('date');
    const rows = await prisma.staffTask.findMany({
      where: date ? { date: parseDate(date) } : {},
      orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
      take: 500,
    });
    const names = await namesOf(rows.map((t) => t.completedBy));
    return c.json(rows.map((t) => taskDTO(t, names)));
  })
  .post('/tasks', async (c) => {
    const user = c.get('user');
    const b = await parseBody(
      c,
      z.object({
        date: z.string(),
        startTime: TIME,
        title: z.string().trim().min(2).max(200),
        type: z.enum(STAFF_TASK_TYPES),
        priority: z.enum(INCIDENT_PRIORITIES).optional(),
        /** Sector del plano. Si viene, location puede omitirse (se usa el nombre del sector). */
        installationId: z.string().uuid().optional(),
        location: z.string().trim().min(1).max(120).optional(),
        details: z.string().max(1000).optional(),
        assignedToUserId: z.string().uuid().optional(),
      }),
    );
    const inst = b.installationId ? await prisma.installation.findUnique({ where: { id: b.installationId } }) : null;
    if (b.installationId && !inst) throw notFound('No existe el sector.');
    const location = b.location ?? inst?.name;
    if (!location) throw new AppError('VALIDATION_ERROR', 'Indicá el lugar o el sector.', [{ field: 'location', message: 'Requerido.' }]);
    const t = await prisma.staffTask.create({ data: { ...b, location, date: parseDate(b.date), createdBy: user.id } });
    await audit(c, user, { action: 'CREATE', entity: 'StaffTask', entityId: t.id, summary: `Tarea: ${t.title}` });
    return c.json(taskDTO(t), 201);
  })
  .patch('/tasks/:id', async (c) => {
    const user = c.get('user');
    const b = await parseBody(c, z.object({ status: z.enum(STAFF_TASK_STATUSES) }));
    const t = await prisma.staffTask.findUnique({ where: { id: c.req.param('id') } });
    if (!t) throw notFound('No existe la tarea.');
    const done = b.status === 'DONE';
    const u = await prisma.staffTask.update({
      where: { id: t.id },
      data: { status: b.status, completedAt: done ? new Date() : null, completedBy: done ? user.id : null },
    });
    return c.json(taskDTO(u, await namesOf([u.completedBy])));
  })

  .delete('/tasks/:id', async (c) => {
    const r = await prisma.staffTask.deleteMany({ where: { id: c.req.param('id') } });
    if (!r.count) throw notFound('No existe la tarea.');
    return c.body(null, 204);
  })

  // ---------------------------------------------------------- instalaciones
  .get('/installations', async (c) => {
    const rows = await prisma.installation.findMany({ orderBy: { name: 'asc' } });
    const names = await namesOf(rows.map((i) => i.lastCleanedBy));
    return c.json(rows.map((i) => installationDTO(i, names)));
  })
  .post('/installations', async (c) => {
    const user = c.get('user');
    const b = await parseBody(
      c,
      z.object({
        name: z.string().trim().min(1).max(120),
        code: z.string().trim().max(20).optional(),
        floor: z.string().trim().max(20).optional(),
        status: z.enum(INSTALLATION_STATUSES).default('OK'),
        layout: z.object({ col: z.number().int().min(1), row: z.number().int().min(1), colSpan: z.number().int().min(1), rowSpan: z.number().int().min(1) }),
        nextTask: z.string().max(200).optional(),
        notes: z.string().max(1000).optional(),
      }),
    );
    const exists = await prisma.installation.findUnique({ where: { name: b.name } });
    if (exists) throw new AppError('CONFLICT', 'Ya existe un sector con ese nombre.');
    const i = await prisma.installation.create({ data: b });
    await audit(c, user, { action: 'CREATE', entity: 'Installation', entityId: i.id, summary: `Sector: ${i.name}` });
    return c.json(installationDTO(i), 201);
  })
  .delete('/installations/:id', requireRoles('DIRECTOR', 'ADMINISTRATIVE', 'SUPER_ADMIN', 'STAFF'), async (c) => {
    const user = c.get('user');
    const i = await prisma.installation.findUnique({ where: { id: c.req.param('id') }, include: { _count: { select: { incidents: true } } } });
    if (!i) throw notFound('No existe el sector.');
    if (i._count.incidents > 0) throw new AppError('CONFLICT', 'El sector tiene incidencias registradas: no se puede borrar.');
    await prisma.installation.delete({ where: { id: i.id } });
    await audit(c, user, { action: 'DELETE', entity: 'Installation', entityId: i.id, summary: `Sector eliminado: ${i.name}` });
    return c.body(null, 204);
  })
  .patch('/installations/:id', async (c) => {
    const user = c.get('user');
    const b = await parseBody(
      c,
      z
        .object({
          name: z.string().trim().min(1).max(120),
          code: z.string().trim().max(20).nullable(),
          floor: z.string().trim().max(20).nullable(),
          layout: z.object({ col: z.number().int().min(1), row: z.number().int().min(1), colSpan: z.number().int().min(1), rowSpan: z.number().int().min(1) }),
          status: z.enum(INSTALLATION_STATUSES),
          nextTask: z.string().max(200).nullable(),
          notes: z.string().max(1000).nullable(),
          cleanedNow: z.literal(true),
        })
        .partial(),
    );
    const i = await prisma.installation.findUnique({ where: { id: c.req.param('id') } });
    if (!i) throw notFound('No existe la instalación.');
    const { cleanedNow, ...rest } = b;
    const u = await prisma.installation.update({
      where: { id: i.id },
      data: { ...rest, ...(cleanedNow ? { lastCleanedAt: new Date(), lastCleanedBy: user.id } : {}) },
    });
    if (b.status && b.status !== i.status) {
      await audit(c, user, { action: 'STATUS_CHANGE', entity: 'Installation', entityId: i.id, summary: `${i.name}: ${i.status} → ${b.status}` });
    }
    return c.json(installationDTO(u, await namesOf([u.lastCleanedBy])));
  })

  // ------------------------------------------------------------ incidencias
  .get('/incidents', async (c) => {
    const status = c.req.query('status');
    const rows = await prisma.incident.findMany({
      where: status && (INCIDENT_STATUSES as readonly string[]).includes(status) ? { status: status as never } : {},
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    const names = await namesOf(rows.flatMap((i) => [i.reportedBy, i.resolvedBy]));
    return c.json(rows.map((i) => incidentDTO(i, names)));
  })
  .post('/incidents', async (c) => {
    const user = c.get('user');
    const b = await parseBody(
      c,
      z.object({
        description: z.string().trim().min(3).max(1000),
        priority: z.enum(INCIDENT_PRIORITIES),
        sector: z.string().trim().min(1).max(120),
        installationId: z.string().uuid().optional(),
        imageUrl: IMAGE.optional(),
        notes: z.string().max(1000).optional(),
        /** Estado en que queda el sector al reportar (actualiza la instalación). */
        installationStatus: z.enum(INSTALLATION_STATUSES).optional(),
      }),
    );
    const { installationStatus, ...data } = b;
    if (installationStatus && !b.installationId) throw new AppError('VALIDATION_ERROR', 'Para cambiar el estado del sector, elegí el sector.');
    const i = await prisma.$transaction(async (tx) => {
      const created = await tx.incident.create({ data: { ...data, reportedBy: user.id } });
      if (installationStatus && b.installationId) await tx.installation.update({ where: { id: b.installationId }, data: { status: installationStatus } });
      return created;
    });
    await audit(c, user, { action: 'CREATE', entity: 'Incident', entityId: i.id, summary: `Incidencia (${b.priority}) en ${b.sector}` });
    return c.json(incidentDTO(i, await namesOf([i.reportedBy])), 201);
  })
  .patch('/incidents/:id', async (c) => {
    const user = c.get('user');
    const b = await parseBody(
      c,
      z.object({
        status: z.enum(INCIDENT_STATUSES),
        notes: z.string().max(1000).optional(),
        /** Al resolver: deja el sector como operativo. */
        restoreInstallation: z.boolean().optional(),
      }),
    );
    const i = await prisma.incident.findUnique({ where: { id: c.req.param('id') } });
    if (!i) throw notFound('No existe la incidencia.');
    const resolved = b.status === 'RESOLVED';
    const u = await prisma.$transaction(async (tx) => {
      const updated = await tx.incident.update({
        where: { id: i.id },
        data: { status: b.status, ...(b.notes !== undefined ? { notes: b.notes } : {}), resolvedAt: resolved ? new Date() : null, resolvedBy: resolved ? user.id : null },
      });
      if (resolved && b.restoreInstallation && i.installationId) await tx.installation.update({ where: { id: i.installationId }, data: { status: 'OK' } });
      return updated;
    });
    await audit(c, user, { action: 'STATUS_CHANGE', entity: 'Incident', entityId: i.id, summary: `Incidencia ${i.status} → ${b.status}` });
    return c.json(incidentDTO(u, await namesOf([u.reportedBy, u.resolvedBy])));
  })

  // ---------------------------------------------------------- mantenimiento
  .get('/maintenance', async (c) => {
    const rows = await prisma.maintenanceLog.findMany({ orderBy: { date: 'desc' }, take: 500 });
    const out: MaintenanceLog[] = rows.map((m) => ({
      id: m.id,
      date: toISODate(m.date),
      task: m.task,
      responsible: m.responsible,
      installationId: m.installationId ?? undefined,
      recordedBy: m.recordedBy,
      createdAt: m.createdAt.toISOString(),
    }));
    return c.json(out);
  })
  .post('/maintenance', async (c) => {
    const user = c.get('user');
    const b = await parseBody(
      c,
      z.object({
        date: z.string(),
        task: z.string().trim().min(2).max(300),
        responsible: z.string().trim().min(2).max(120),
        installationId: z.string().uuid().optional(),
      }),
    );
    const m = await prisma.maintenanceLog.create({ data: { ...b, date: parseDate(b.date), recordedBy: user.id } });
    return c.json({ id: m.id }, 201);
  })

  // ----------------------------------------------------------------- turnos
  // El cronograma lo cargan Directivos/Administración; los auxiliares lo consultan
  // y piden cambios entre ellos. Al aceptar un cambio se intercambian los titulares.
  .get('/people', async (c) => {
    const rows = await prisma.user.findMany({
      where: { roles: { has: 'STAFF' }, status: 'ACTIVE' },
      select: { id: true, firstName: true, lastName: true },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
    const out: StaffMember[] = rows;
    return c.json(out);
  })
  .get('/shifts', async (c) => {
    const q = c.req.query();
    const rows = await prisma.staffShift.findMany({
      where: {
        ...(q.userId ? { userId: q.userId } : {}),
        ...(q.from || q.to ? { date: { ...(q.from ? { gte: parseDate(q.from, 'from') } : {}), ...(q.to ? { lte: parseDate(q.to, 'to') } : {}) } } : {}),
      },
      include: { user: true },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      take: 1000,
    });
    return c.json(rows.map(shiftDTO));
  })
  .post('/shifts', requireRoles(...SHIFT_MANAGERS), async (c) => {
    const user = c.get('user');
    const b = await parseBody(c, shiftBody);
    const staff = await prisma.user.findFirst({ where: { id: b.userId, roles: { has: 'STAFF' } } });
    if (!staff) throw notFound('No existe esa persona en Auxiliares.');
    const slot = { date: parseDate(b.date), startTime: b.startTime ?? null, endTime: b.endTime ?? null };
    checkTimes(slot);
    if (await overlapping(b.userId, slot)) throw new AppError('CONFLICT', 'Esa persona ya tiene un turno que se superpone ese día.');
    const s = await prisma.staffShift.create({ data: { ...b, date: slot.date, createdBy: user.id }, include: { user: true } });
    await audit(c, user, { action: 'CREATE', entity: 'StaffShift', entityId: s.id, summary: `Turno ${b.date} de ${staff.lastName}` });
    return c.json(shiftDTO(s), 201);
  })
  .patch('/shifts/:id', requireRoles(...SHIFT_MANAGERS), async (c) => {
    const user = c.get('user');
    const b = await parseBody(c, shiftBody.omit({ userId: true, date: true }).partial());
    const s = await prisma.staffShift.findUnique({ where: { id: c.req.param('id') } });
    if (!s) throw notFound('No existe el turno.');
    const slot = { date: s.date, startTime: b.startTime ?? s.startTime, endTime: b.endTime ?? s.endTime };
    checkTimes(slot);
    if (await overlapping(s.userId, slot, [s.id])) throw new AppError('CONFLICT', 'Esa persona ya tiene un turno que se superpone ese día.');
    const u = await prisma.staffShift.update({ where: { id: s.id }, data: b, include: { user: true } });
    await audit(c, user, { action: 'UPDATE', entity: 'StaffShift', entityId: s.id, summary: 'Turno modificado' });
    return c.json(shiftDTO(u));
  })
  .delete('/shifts/:id', requireRoles(...SHIFT_MANAGERS), async (c) => {
    const user = c.get('user');
    const r = await prisma.staffShift.deleteMany({ where: { id: c.req.param('id') } });
    if (!r.count) throw notFound('No existe el turno.');
    await audit(c, user, { action: 'DELETE', entity: 'StaffShift', entityId: c.req.param('id'), summary: 'Turno eliminado' });
    return c.body(null, 204);
  })

  // ------------------------------------------------------- cambios de turno
  .get('/shift-changes', async (c) => {
    const user = c.get('user');
    const status = c.req.query('status');
    const rows = await prisma.shiftChangeRequest.findMany({
      where: {
        // Auxiliar: solo los que pidió o los que le pidieron. Directivos ven todos.
        ...(isManagement(user) ? {} : { OR: [{ requesterId: user.id }, { colleagueId: user.id }] }),
        ...(status && (SHIFT_CHANGE_STATUSES as readonly string[]).includes(status) ? { status: status as never } : {}),
      },
      include: changeInclude,
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    return c.json(rows.map(changeDTO));
  })
  .post('/shift-changes', requireRoles('STAFF'), async (c) => {
    const user = c.get('user');
    const b = await parseBody(
      c,
      z.object({
        requesterShiftId: z.string().uuid(),
        colleagueShiftId: z.string().uuid(),
        reason: z.string().trim().max(500).optional(),
      }),
    );
    const [mine, theirs] = await Promise.all([
      prisma.staffShift.findUnique({ where: { id: b.requesterShiftId } }),
      prisma.staffShift.findUnique({ where: { id: b.colleagueShiftId } }),
    ]);
    if (!mine || mine.userId !== user.id) throw notFound('No existe ese turno tuyo.');
    if (!theirs) throw notFound('No existe el turno de tu compañero/a.');
    if (theirs.userId === user.id) throw new AppError('VALIDATION_ERROR', 'Elegí un turno de otra persona.');
    await checkSwap(mine, theirs);
    const open = await prisma.shiftChangeRequest.findFirst({
      where: { status: 'PENDING', OR: [{ requesterShiftId: { in: [mine.id, theirs.id] } }, { colleagueShiftId: { in: [mine.id, theirs.id] } }] },
    });
    if (open) throw new AppError('CONFLICT', 'Ya hay un pedido pendiente para alguno de esos turnos.');
    const r = await prisma.shiftChangeRequest.create({
      data: { requesterId: user.id, colleagueId: theirs.userId, requesterShiftId: mine.id, colleagueShiftId: theirs.id, reason: b.reason },
      include: changeInclude,
    });
    await notify([theirs.userId], {
      type: 'GENERAL',
      text: `${user.firstName} ${user.lastName} te pidió un cambio de turno`,
      details: b.reason,
      link: '/staff/shift-changes',
    });
    return c.json(changeDTO(r), 201);
  })
  .patch('/shift-changes/:id', async (c) => {
    const user = c.get('user');
    const b = await parseBody(c, z.object({ status: z.enum(['ACCEPTED', 'REJECTED', 'CANCELLED']) }));
    const r = await prisma.shiftChangeRequest.findUnique({ where: { id: c.req.param('id') }, include: changeInclude });
    if (!r) throw notFound('No existe el pedido.');
    const mgmt = isManagement(user);
    if (!mgmt && r.requesterId !== user.id && r.colleagueId !== user.id) throw notFound('No existe el pedido.');
    if (r.status !== 'PENDING') throw new AppError('CONFLICT', 'Este pedido ya fue resuelto.');
    // Cancela quien lo pidió; acepta o rechaza el compañero (o Directivos).
    if (b.status === 'CANCELLED' && r.requesterId !== user.id && !mgmt) throw forbidden('Solo quien lo pidió puede cancelarlo.');
    if (b.status !== 'CANCELLED' && r.colleagueId !== user.id && !mgmt) throw forbidden('Lo tiene que responder tu compañero/a.');
    const { requesterShift: a, colleagueShift: o } = r;
    if (b.status === 'ACCEPTED' && (a.userId !== r.requesterId || o.userId !== r.colleagueId)) {
      throw new AppError('CONFLICT', 'Los turnos cambiaron desde que se pidió. Pedilo de nuevo.');
    }
    if (b.status === 'ACCEPTED') await checkSwap(a, o);
    const resolved = { status: b.status, respondedAt: new Date(), respondedBy: user.id };
    await prisma.$transaction(async (tx) => {
      if (b.status === 'ACCEPTED') {
        await tx.staffShift.update({ where: { id: a.id }, data: { userId: r.colleagueId, type: 'SWAP' } });
        await tx.staffShift.update({ where: { id: o.id }, data: { userId: r.requesterId, type: 'SWAP' } });
      }
      await tx.shiftChangeRequest.update({ where: { id: r.id }, data: resolved });
    });
    if (b.status !== 'CANCELLED') {
      await notify([r.requesterId], {
        type: 'GENERAL',
        text: b.status === 'ACCEPTED' ? 'Aceptaron tu cambio de turno' : 'Rechazaron tu cambio de turno',
        link: '/staff/shift-changes',
      });
    }
    await audit(c, user, {
      action: 'STATUS_CHANGE',
      entity: 'ShiftChangeRequest',
      entityId: r.id,
      summary: `Cambio de turno: ${b.status}`,
      previousValue: { status: r.status },
      newValue: { status: b.status },
    });
    const updated = await prisma.shiftChangeRequest.findUniqueOrThrow({ where: { id: r.id }, include: changeInclude });
    return c.json(changeDTO(updated));
  })

  // ------------------------------------------- ausencias del personal
  // El auxiliar pide; Directivos/Administración aprueban o rechazan.
  .get('/absences', async (c) => {
    const user = c.get('user');
    const status = c.req.query('status');
    const rows = await prisma.staffAbsence.findMany({
      where: {
        ...(isManagement(user) ? {} : { userId: user.id }),
        ...(status && (JUSTIFICATION_STATUSES as readonly string[]).includes(status) ? { status: status as never } : {}),
      },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    return c.json(rows.map(absenceDTO));
  })
  .post('/absences', requireRoles('STAFF'), async (c) => {
    const user = c.get('user');
    const b = await parseBody(
      c,
      z.object({
        fromDate: z.string(),
        toDate: z.string().optional(),
        reason: z.enum(STAFF_ABSENCE_REASONS),
        notes: z.string().trim().min(3, 'Contá el detalle.').max(1000),
        documentName: z.string().trim().max(200).optional(),
        documentUrl: z.string().url().max(2000).optional(),
      }),
    );
    const from = parseDate(b.fromDate, 'fromDate');
    const to = b.toDate ? parseDate(b.toDate, 'toDate') : from;
    if (to < from) throw new AppError('VALIDATION_ERROR', 'La fecha "hasta" es anterior a "desde".', [{ field: 'toDate', message: 'Anterior a "desde".' }]);
    const overlapping = await prisma.staffAbsence.findFirst({ where: { userId: user.id, status: 'PENDING', fromDate: { lte: to }, toDate: { gte: from } } });
    if (overlapping) throw new AppError('CONFLICT', 'Ya tenés un pedido en revisión para esas fechas.');
    const a = await prisma.staffAbsence.create({
      data: { userId: user.id, fromDate: from, toDate: to, reason: b.reason, notes: b.notes, documentName: b.documentName, documentUrl: b.documentUrl },
      include: { user: true },
    });
    const managers = await prisma.user.findMany({ where: { roles: { hasSome: ['DIRECTOR', 'ADMINISTRATIVE'] }, status: 'ACTIVE' }, select: { id: true } });
    await notify(managers.map((m) => m.id), {
      type: 'JUSTIFICATION_REQUEST',
      text: `${user.firstName} ${user.lastName} (Auxiliares) pidió justificar una ausencia`,
      details: `${toISODate(from)}${to > from ? ` a ${toISODate(to)}` : ''}`,
      link: '/staff/absences',
    });
    await audit(c, user, { action: 'CREATE', entity: 'StaffAbsence', entityId: a.id, summary: `Ausencia ${toISODate(from)} a ${toISODate(to)}` });
    return c.json(absenceDTO(a), 201);
  })
  .patch('/absences/:id', requireRoles(...SHIFT_MANAGERS), async (c) => {
    const user = c.get('user');
    const b = await parseBody(c, z.object({ status: z.enum(['APPROVED', 'REJECTED']), reviewNotes: z.string().max(1000).optional() }));
    const a = await prisma.staffAbsence.findUnique({ where: { id: c.req.param('id') } });
    if (!a) throw notFound('No existe el pedido.');
    if (a.status !== 'PENDING') throw new AppError('CONFLICT', 'Este pedido ya fue resuelto.');
    const u = await prisma.staffAbsence.update({
      where: { id: a.id },
      data: { status: b.status, reviewNotes: b.reviewNotes, reviewedBy: user.id, reviewedAt: new Date() },
      include: { user: true },
    });
    await notify([a.userId], {
      type: b.status === 'APPROVED' ? 'JUSTIFICATION_APPROVED' : 'JUSTIFICATION_REJECTED',
      text: b.status === 'APPROVED' ? 'Aprobaron tu justificación de ausencia' : 'Rechazaron tu justificación de ausencia',
      details: b.reviewNotes,
      link: '/staff/absences',
    });
    await audit(c, user, {
      action: 'STATUS_CHANGE',
      entity: 'StaffAbsence',
      entityId: a.id,
      summary: `Ausencia ${b.status === 'APPROVED' ? 'aprobada' : 'rechazada'}`,
      previousValue: { status: a.status },
      newValue: { status: u.status },
    });
    return c.json(absenceDTO(u));
  })
  .delete('/absences/:id', requireRoles('STAFF'), async (c) => {
    const user = c.get('user');
    const a = await prisma.staffAbsence.findUnique({ where: { id: c.req.param('id') } });
    if (!a || a.userId !== user.id) throw notFound('No existe el pedido.');
    if (a.status !== 'PENDING') throw new AppError('CONFLICT', 'Solo se puede retirar un pedido que sigue en revisión.');
    await prisma.staffAbsence.delete({ where: { id: a.id } });
    return c.body(null, 204);
  });
