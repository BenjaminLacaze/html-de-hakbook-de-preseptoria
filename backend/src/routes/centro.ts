// Centro de Estudiantes: eventos, foro de la comunidad, comunicados y reclamos.
//
// Leer: cualquier persona con sesión. Gestionar (crear eventos y comunicados, moderar,
// responder reclamos): Centro de Estudiantes y Superadmin. Anotarse a eventos, publicar en
// el foro y presentar reclamos: alumnos y Centro.
//
//   GET /centro/events            POST /centro/events          PATCH|DELETE /centro/events/:id
//   POST|DELETE /centro/events/:id/join
//   GET /centro/threads           POST /centro/threads         PATCH /centro/threads/:id (fijar)
//   GET /centro/threads/:id/replies                            POST /centro/threads/:id/replies
//   GET /centro/announcements     POST /centro/announcements   PATCH|DELETE /centro/announcements/:id
//   GET /centro/claims            POST /centro/claims          PATCH /centro/claims/:id
import { Hono } from 'hono';
import { z } from 'zod';
import {
  REP_CLAIM_CATEGORIES,
  REP_CLAIM_STATUSES,
  REP_EVENT_TYPES,
  REP_FORUM_CATEGORIES,
  type RepAnnouncement,
  type RepClaim,
  type RepEvent,
  type RepReply,
  type RepThread,
} from '../../../shared/types.js';
import { audit } from '../audit.js';
import { requireAuth, requireRoles, type AppEnv } from '../auth/middleware.js';
import { prisma } from '../db.js';
import { notFound } from '../errors.js';
import { hasRole, parseDate, toISODate } from '../scope.js';
import { parseBody } from '../validation.js';

const MANAGE = ['STUDENT_REP', 'SUPER_ADMIN'] as const;
const PARTICIPATE = ['STUDENT', 'STUDENT_REP', 'SUPER_ADMIN'] as const;
const TIME = z.string().regex(/^\d{2}:\d{2}$/, 'Hora HH:mm');
const fullName = (u: { firstName: string; lastName: string }) => `${u.firstName} ${u.lastName}`;

const eventBody = z.object({
  title: z.string().trim().min(2).max(200),
  date: z.string(),
  time: TIME.optional(),
  location: z.string().max(200).optional(),
  description: z.string().trim().min(2).max(3000),
  type: z.enum(REP_EVENT_TYPES),
  organizer: z.string().trim().min(2).max(120),
});

const announcementBody = z.object({
  title: z.string().trim().min(2).max(200),
  content: z.string().trim().min(2).max(5000),
  pinned: z.boolean().optional(),
  publishDate: z.string().optional(),
});

export const centroRoutes = new Hono<AppEnv>()
  .use(requireAuth)

  // ---------------------------------------------------------------- eventos
  .get('/events', async (c) => {
    const me = c.get('user');
    const rows = await prisma.repEvent.findMany({
      orderBy: { date: 'asc' },
      include: { _count: { select: { participants: true } }, participants: { where: { userId: me.id }, select: { userId: true } } },
      take: 500,
    });
    const out: RepEvent[] = rows.map((e) => ({
      id: e.id,
      title: e.title,
      date: toISODate(e.date),
      time: e.time ?? undefined,
      location: e.location ?? undefined,
      description: e.description,
      type: e.type,
      organizer: e.organizer,
      createdBy: e.createdBy,
      participantCount: e._count.participants,
      joined: e.participants.length > 0,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    }));
    return c.json(out);
  })
  .post('/events', requireRoles(...MANAGE), async (c) => {
    const me = c.get('user');
    const b = await parseBody(c, eventBody);
    const e = await prisma.repEvent.create({ data: { ...b, date: parseDate(b.date), createdBy: me.id } });
    await audit(c, me, { action: 'CREATE', entity: 'RepEvent', entityId: e.id, summary: `Evento: ${e.title}` });
    return c.json({ id: e.id }, 201);
  })
  .patch('/events/:id', requireRoles(...MANAGE), async (c) => {
    const b = await parseBody(c, eventBody.partial());
    const e = await prisma.repEvent.findUnique({ where: { id: c.req.param('id') } });
    if (!e) throw notFound('No existe el evento.');
    await prisma.repEvent.update({ where: { id: e.id }, data: { ...b, ...(b.date ? { date: parseDate(b.date) } : {}) } });
    return c.json({ id: e.id });
  })
  .delete('/events/:id', requireRoles(...MANAGE), async (c) => {
    const me = c.get('user');
    const e = await prisma.repEvent.findUnique({ where: { id: c.req.param('id') } });
    if (!e) throw notFound('No existe el evento.');
    await prisma.repEvent.delete({ where: { id: e.id } });
    await audit(c, me, { action: 'DELETE', entity: 'RepEvent', entityId: e.id, summary: `Evento eliminado: ${e.title}` });
    return c.body(null, 204);
  })
  .post('/events/:id/join', requireRoles(...PARTICIPATE), async (c) => {
    const me = c.get('user');
    const e = await prisma.repEvent.findUnique({ where: { id: c.req.param('id') } });
    if (!e) throw notFound('No existe el evento.');
    await prisma.repEventParticipant.upsert({
      where: { eventId_userId: { eventId: e.id, userId: me.id } },
      create: { eventId: e.id, userId: me.id },
      update: {},
    });
    return c.json({ joined: true });
  })
  .delete('/events/:id/join', requireRoles(...PARTICIPATE), async (c) => {
    const me = c.get('user');
    await prisma.repEventParticipant.deleteMany({ where: { eventId: c.req.param('id'), userId: me.id } });
    return c.json({ joined: false });
  })

  // ------------------------------------------------------------------- foro
  .get('/threads', async (c) => {
    const rows = await prisma.repThread.findMany({
      include: { author: true, _count: { select: { replies: true } } },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      take: 500,
    });
    const out: RepThread[] = rows.map((t) => ({
      id: t.id,
      authorId: t.authorId,
      authorName: fullName(t.author),
      title: t.title,
      content: t.content,
      category: t.category,
      pinned: t.pinned,
      replyCount: t._count.replies,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));
    return c.json(out);
  })
  .post('/threads', requireRoles(...PARTICIPATE), async (c) => {
    const me = c.get('user');
    const b = await parseBody(
      c,
      z.object({ title: z.string().trim().min(2).max(200), content: z.string().trim().min(2).max(5000), category: z.enum(REP_FORUM_CATEGORIES) }),
    );
    const t = await prisma.repThread.create({ data: { ...b, authorId: me.id } });
    return c.json({ id: t.id }, 201);
  })
  .patch('/threads/:id', requireRoles(...MANAGE), async (c) => {
    const b = await parseBody(c, z.object({ pinned: z.boolean() }));
    const t = await prisma.repThread.findUnique({ where: { id: c.req.param('id') } });
    if (!t) throw notFound('No existe el tema.');
    await prisma.repThread.update({ where: { id: t.id }, data: { pinned: b.pinned } });
    return c.json({ id: t.id, pinned: b.pinned });
  })
  .get('/threads/:id/replies', async (c) => {
    const rows = await prisma.repReply.findMany({
      where: { threadId: c.req.param('id') },
      include: { author: true },
      orderBy: { createdAt: 'asc' },
    });
    const out: RepReply[] = rows.map((r) => ({
      id: r.id,
      threadId: r.threadId,
      authorId: r.authorId,
      authorName: fullName(r.author),
      content: r.content,
      createdAt: r.createdAt.toISOString(),
    }));
    return c.json(out);
  })
  .post('/threads/:id/replies', requireRoles(...PARTICIPATE), async (c) => {
    const me = c.get('user');
    const b = await parseBody(c, z.object({ content: z.string().trim().min(1).max(3000) }));
    const t = await prisma.repThread.findUnique({ where: { id: c.req.param('id') } });
    if (!t) throw notFound('No existe el tema.');
    const r = await prisma.repReply.create({ data: { threadId: t.id, authorId: me.id, content: b.content } });
    return c.json({ id: r.id }, 201);
  })

  // ------------------------------------------------------------ comunicados
  .get('/announcements', async (c) => {
    const rows = await prisma.repAnnouncement.findMany({
      include: { author: true },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      take: 200,
    });
    const out: RepAnnouncement[] = rows.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      authorId: a.authorId,
      authorName: fullName(a.author),
      pinned: a.pinned,
      publishDate: a.publishDate ? toISODate(a.publishDate) : undefined,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }));
    return c.json(out);
  })
  .post('/announcements', requireRoles(...MANAGE), async (c) => {
    const me = c.get('user');
    const b = await parseBody(c, announcementBody);
    const a = await prisma.repAnnouncement.create({
      data: { ...b, publishDate: b.publishDate ? parseDate(b.publishDate) : null, authorId: me.id },
    });
    await audit(c, me, { action: 'CREATE', entity: 'RepAnnouncement', entityId: a.id, summary: `Comunicado: ${a.title}` });
    return c.json({ id: a.id }, 201);
  })
  .patch('/announcements/:id', requireRoles(...MANAGE), async (c) => {
    const b = await parseBody(c, announcementBody.partial());
    const a = await prisma.repAnnouncement.findUnique({ where: { id: c.req.param('id') } });
    if (!a) throw notFound('No existe el comunicado.');
    await prisma.repAnnouncement.update({
      where: { id: a.id },
      data: { ...b, ...(b.publishDate ? { publishDate: parseDate(b.publishDate) } : {}) },
    });
    return c.json({ id: a.id });
  })
  .delete('/announcements/:id', requireRoles(...MANAGE), async (c) => {
    const me = c.get('user');
    const a = await prisma.repAnnouncement.findUnique({ where: { id: c.req.param('id') } });
    if (!a) throw notFound('No existe el comunicado.');
    await prisma.repAnnouncement.delete({ where: { id: a.id } });
    await audit(c, me, { action: 'DELETE', entity: 'RepAnnouncement', entityId: a.id, summary: `Comunicado eliminado: ${a.title}` });
    return c.body(null, 204);
  })

  // --------------------------------------------------------------- reclamos
  .get('/claims', requireRoles(...PARTICIPATE), async (c) => {
    const me = c.get('user');
    // El Centro ve todos; un alumno, solo los suyos.
    const rows = await prisma.repClaim.findMany({
      where: hasRole(me, ...MANAGE) ? {} : { authorId: me.id },
      include: { author: true },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    const out: RepClaim[] = rows.map((r) => ({
      id: r.id,
      authorId: r.authorId,
      authorName: fullName(r.author),
      category: r.category,
      description: r.description,
      status: r.status,
      response: r.response ?? undefined,
      responderId: r.responderId ?? undefined,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
    return c.json(out);
  })
  .post('/claims', requireRoles(...PARTICIPATE), async (c) => {
    const me = c.get('user');
    const b = await parseBody(c, z.object({ category: z.enum(REP_CLAIM_CATEGORIES), description: z.string().trim().min(5).max(3000) }));
    const r = await prisma.repClaim.create({ data: { ...b, authorId: me.id } });
    return c.json({ id: r.id }, 201);
  })
  .patch('/claims/:id', requireRoles(...MANAGE), async (c) => {
    const me = c.get('user');
    const b = await parseBody(c, z.object({ status: z.enum(REP_CLAIM_STATUSES).optional(), response: z.string().max(3000).optional() }));
    const r = await prisma.repClaim.findUnique({ where: { id: c.req.param('id') } });
    if (!r) throw notFound('No existe el reclamo.');
    await prisma.repClaim.update({
      where: { id: r.id },
      data: { ...b, ...(b.response ? { responderId: me.id } : {}) },
    });
    if (b.status && b.status !== r.status) {
      await audit(c, me, { action: 'STATUS_CHANGE', entity: 'RepClaim', entityId: r.id, summary: `Reclamo ${r.status} → ${b.status}` });
    }
    return c.json({ id: r.id });
  });
