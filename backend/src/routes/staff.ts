// Auxiliares (maestranza / mantenimiento): tareas, instalaciones, incidencias y mantenimiento.
//   Auxiliares, Directivos, Administrativos y Superadmin.
//
//   GET   /staff/tasks?date=AAAA-MM-DD     POST /staff/tasks      PATCH /staff/tasks/:id
//   GET   /staff/installations             PATCH /staff/installations/:id
//   GET   /staff/incidents?status=         POST /staff/incidents  PATCH /staff/incidents/:id
//   GET   /staff/maintenance               POST /staff/maintenance
import { Hono } from 'hono';
import { z } from 'zod';
import {
  INCIDENT_PRIORITIES,
  INCIDENT_STATUSES,
  INSTALLATION_STATUSES,
  STAFF_TASK_STATUSES,
  STAFF_TASK_TYPES,
  type Incident,
  type Installation,
  type MaintenanceLog,
  type StaffTask,
} from '../../../shared/types.js';
import { audit } from '../audit.js';
import { requireAuth, requireRoles, type AppEnv } from '../auth/middleware.js';
import { prisma } from '../db.js';
import { notFound } from '../errors.js';
import type { Prisma } from '../generated/prisma/client.js';
import { parseDate, toISO, toISODate } from '../scope.js';
import { parseBody } from '../validation.js';

const TIME = z.string().regex(/^\d{2}:\d{2}$/, 'Hora HH:mm');

type TaskRow = Prisma.StaffTaskGetPayload<object>;
const taskDTO = (t: TaskRow): StaffTask => ({
  id: t.id,
  date: toISODate(t.date),
  startTime: t.startTime,
  title: t.title,
  type: t.type,
  status: t.status,
  location: t.location,
  details: t.details ?? undefined,
  assignedToUserId: t.assignedToUserId ?? undefined,
  completedAt: toISO(t.completedAt),
  completedBy: t.completedBy ?? undefined,
  createdAt: t.createdAt.toISOString(),
  updatedAt: t.updatedAt.toISOString(),
});

type InstRow = Prisma.InstallationGetPayload<object>;
const installationDTO = (i: InstRow): Installation => ({
  id: i.id,
  name: i.name,
  status: i.status,
  layout: i.layout as Installation['layout'],
  lastCleanedAt: toISO(i.lastCleanedAt),
  nextTask: i.nextTask ?? undefined,
  notes: i.notes ?? undefined,
  createdAt: i.createdAt.toISOString(),
  updatedAt: i.updatedAt.toISOString(),
});

type IncRow = Prisma.IncidentGetPayload<object>;
const incidentDTO = (i: IncRow): Incident => ({
  id: i.id,
  description: i.description,
  priority: i.priority,
  sector: i.sector,
  installationId: i.installationId ?? undefined,
  imageUrl: i.imageUrl ?? undefined,
  status: i.status,
  reportedBy: i.reportedBy,
  resolvedAt: toISO(i.resolvedAt),
  resolvedBy: i.resolvedBy ?? undefined,
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
    return c.json(rows.map(taskDTO));
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
        location: z.string().trim().min(1).max(120),
        details: z.string().max(1000).optional(),
        assignedToUserId: z.string().uuid().optional(),
      }),
    );
    const t = await prisma.staffTask.create({ data: { ...b, date: parseDate(b.date), createdBy: user.id } });
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
    return c.json(taskDTO(u));
  })

  // ---------------------------------------------------------- instalaciones
  .get('/installations', async (c) => {
    const rows = await prisma.installation.findMany({ orderBy: { name: 'asc' } });
    return c.json(rows.map(installationDTO));
  })
  .patch('/installations/:id', async (c) => {
    const user = c.get('user');
    const b = await parseBody(
      c,
      z
        .object({
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
      data: { ...rest, ...(cleanedNow ? { lastCleanedAt: new Date() } : {}) },
    });
    if (b.status && b.status !== i.status) {
      await audit(c, user, { action: 'STATUS_CHANGE', entity: 'Installation', entityId: i.id, summary: `${i.name}: ${i.status} → ${b.status}` });
    }
    return c.json(installationDTO(u));
  })

  // ------------------------------------------------------------ incidencias
  .get('/incidents', async (c) => {
    const status = c.req.query('status');
    const rows = await prisma.incident.findMany({
      where: status && (INCIDENT_STATUSES as readonly string[]).includes(status) ? { status: status as never } : {},
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    return c.json(rows.map(incidentDTO));
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
        imageUrl: z.string().url().optional(),
      }),
    );
    const i = await prisma.incident.create({ data: { ...b, reportedBy: user.id } });
    await audit(c, user, { action: 'CREATE', entity: 'Incident', entityId: i.id, summary: `Incidencia (${b.priority}) en ${b.sector}` });
    return c.json(incidentDTO(i), 201);
  })
  .patch('/incidents/:id', async (c) => {
    const user = c.get('user');
    const b = await parseBody(c, z.object({ status: z.enum(INCIDENT_STATUSES) }));
    const i = await prisma.incident.findUnique({ where: { id: c.req.param('id') } });
    if (!i) throw notFound('No existe la incidencia.');
    const resolved = b.status === 'RESOLVED';
    const u = await prisma.incident.update({
      where: { id: i.id },
      data: { status: b.status, resolvedAt: resolved ? new Date() : null, resolvedBy: resolved ? user.id : null },
    });
    await audit(c, user, { action: 'STATUS_CHANGE', entity: 'Incident', entityId: i.id, summary: `Incidencia ${i.status} → ${b.status}` });
    return c.json(incidentDTO(u));
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
  });
