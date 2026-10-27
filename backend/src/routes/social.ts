// Datos compartidos entre todas las apps: directorio, perfil, notas, mensajes, foro académico y
// notificaciones. Cualquier persona con sesión; los permisos finos están en cada ruta.
//
//   GET /social/directory?role=&search=
//   GET /social/profiles/:userId          PUT /social/profiles/me
//   GET /social/notes   POST /social/notes   PATCH|DELETE /social/notes/:id         (solo las propias)
//   GET /social/messages/conversations    GET /social/messages/with/:userId (las marca leídas)
//   POST /social/messages
//   GET /social/forum?status=             POST /social/forum
//   PATCH /social/forum/:id               (moderar: Preceptoría/Directivos · editar: el autor)
//   DELETE /social/forum/:id              GET|POST /social/forum/:id/replies
//   GET /social/notifications             POST /social/notifications/read  (todas o { ids })
import { Hono } from 'hono';
import { z } from 'zod';
import {
  FORUM_THREAD_STATUSES,
  ROLES,
  type AppNotification,
  type Conversation,
  type DirectoryEntry,
  type ForumReply,
  type ForumThread,
  type PrivateMessage,
  type UserNote,
  type UserProfile,
} from '../../../shared/types.js';
import { requireAuth, type AppEnv, type CurrentUser } from '../auth/middleware.js';
import { prisma } from '../db.js';
import { AppError, forbidden, notFound } from '../errors.js';
import type { Prisma } from '../generated/prisma/client.js';
import { notify } from '../notify.js';
import { hasRole, toISO } from '../scope.js';
import { parseBody } from '../validation.js';

const MODERATORS = ['SUPER_ADMIN', 'DIRECTOR', 'PRECEPTOR'] as const;
const isModerator = (u: CurrentUser) => hasRole(u, ...MODERATORS);
const fullName = (u: { firstName: string; lastName: string }) => `${u.firstName} ${u.lastName}`;

const userSel = { id: true, firstName: true, lastName: true, roles: true, profile: { select: { avatarUrl: true, position: true } } } as const;
type UserSel = Prisma.UserGetPayload<{ select: typeof userSel }>;
const entry = (u: UserSel): DirectoryEntry => ({
  id: u.id,
  firstName: u.firstName,
  lastName: u.lastName,
  roles: u.roles,
  avatarUrl: u.profile?.avatarUrl ?? undefined,
  position: u.profile?.position ?? undefined,
});

const msgDTO = (m: Prisma.PrivateMessageGetPayload<object>): PrivateMessage => ({
  id: m.id,
  senderId: m.senderId,
  receiverId: m.receiverId,
  text: m.text,
  readAt: toISO(m.readAt),
  createdAt: m.createdAt.toISOString(),
});

const noteDTO = (n: Prisma.UserNoteGetPayload<object>): UserNote => ({
  id: n.id,
  title: n.title,
  content: n.content,
  color: n.color,
  pinned: n.pinned,
  createdAt: n.createdAt.toISOString(),
  updatedAt: n.updatedAt.toISOString(),
});

type ThreadRow = Prisma.ForumThreadGetPayload<{ include: { author: true; _count: { select: { replies: true } } } }>;
const threadDTO = (t: ThreadRow): ForumThread => ({
  id: t.id,
  authorId: t.authorId,
  authorName: fullName(t.author),
  title: t.title,
  content: t.content,
  careerId: t.careerId ?? undefined,
  year: t.year ?? undefined,
  commissionId: t.commissionId ?? undefined,
  status: t.status,
  rejectionReason: t.rejectionReason ?? undefined,
  locked: t.locked,
  replyCount: t._count.replies,
  createdAt: t.createdAt.toISOString(),
  updatedAt: t.updatedAt.toISOString(),
});

const linkSchema = z.object({ id: z.string().max(40), url: z.string().url().max(500), label: z.string().max(80) });
const slotSchema = z.object({
  id: z.string().max(40),
  dayOfWeek: z.number().int().min(1).max(7),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export const socialRoutes = new Hono<AppEnv>()
  .use(requireAuth)

  // --------------------------------------------------------------- directorio
  .get('/directory', async (c) => {
    const q = c.req.query();
    const rows = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        ...(q.role && (ROLES as readonly string[]).includes(q.role) ? { roles: { has: q.role as never } } : {}),
        ...(q.search
          ? { OR: [{ firstName: { contains: q.search, mode: 'insensitive' } }, { lastName: { contains: q.search, mode: 'insensitive' } }] }
          : {}),
      },
      select: userSel,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      take: 500,
    });
    return c.json(rows.map(entry));
  })

  // ------------------------------------------------------------------- perfil
  .get('/profiles/:userId', async (c) => {
    const userId = c.req.param('userId') === 'me' ? c.get('user').id : c.req.param('userId');
    const p = await prisma.userProfile.findUnique({ where: { userId } });
    const out: UserProfile = {
      userId,
      bio: p?.bio ?? undefined,
      phone: p?.phone ?? undefined,
      avatarUrl: p?.avatarUrl ?? undefined,
      bannerUrl: p?.bannerUrl ?? undefined,
      accentColor: p?.accentColor ?? undefined,
      position: p?.position ?? undefined,
      links: (p?.links ?? []) as UserProfile['links'],
      availability: (p?.availability ?? []) as UserProfile['availability'],
      updatedAt: toISO(p?.updatedAt),
    };
    return c.json(out);
  })
  .put('/profiles/me', async (c) => {
    const me = c.get('user');
    const b = await parseBody(
      c,
      z
        .object({
          bio: z.string().max(2000).nullable(),
          phone: z.string().max(40).nullable(),
          avatarUrl: z.string().url().max(1000).nullable(),
          bannerUrl: z.string().url().max(1000).nullable(),
          accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable(),
          position: z.string().max(80).nullable(),
          links: z.array(linkSchema).max(10),
          availability: z.array(slotSchema).max(20),
        })
        .partial(),
    );
    // El cargo en el Centro lo pueden poner solo los del Centro.
    if (b.position !== undefined && !hasRole(me, 'STUDENT_REP', 'SUPER_ADMIN')) delete b.position;
    await prisma.userProfile.upsert({ where: { userId: me.id }, create: { userId: me.id, ...b }, update: b });
    return c.json({ ok: true });
  })

  // -------------------------------------------------------------------- notas
  .get('/notes', async (c) => {
    const rows = await prisma.userNote.findMany({ where: { userId: c.get('user').id }, orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }] });
    return c.json(rows.map(noteDTO));
  })
  .post('/notes', async (c) => {
    const b = await parseBody(
      c,
      z.object({ title: z.string().trim().min(1).max(200), content: z.string().max(10_000), color: z.string().max(20).optional(), pinned: z.boolean().optional() }),
    );
    const n = await prisma.userNote.create({ data: { ...b, userId: c.get('user').id } });
    return c.json(noteDTO(n), 201);
  })
  .patch('/notes/:id', async (c) => {
    const b = await parseBody(
      c,
      z.object({ title: z.string().trim().min(1).max(200), content: z.string().max(10_000), color: z.string().max(20), pinned: z.boolean() }).partial(),
    );
    const n = await prisma.userNote.findFirst({ where: { id: c.req.param('id'), userId: c.get('user').id } });
    if (!n) throw notFound('No existe la nota.');
    return c.json(noteDTO(await prisma.userNote.update({ where: { id: n.id }, data: b })));
  })
  .delete('/notes/:id', async (c) => {
    const r = await prisma.userNote.deleteMany({ where: { id: c.req.param('id'), userId: c.get('user').id } });
    if (!r.count) throw notFound('No existe la nota.');
    return c.body(null, 204);
  })

  // ----------------------------------------------------------------- mensajes
  .get('/messages/conversations', async (c) => {
    const me = c.get('user').id;
    const msgs = await prisma.privateMessage.findMany({
      where: { OR: [{ senderId: me }, { receiverId: me }] },
      orderBy: { createdAt: 'desc' },
      take: 2000,
    });
    const byOther = new Map<string, { last: (typeof msgs)[number]; unread: number }>();
    for (const m of msgs) {
      const other = m.senderId === me ? m.receiverId : m.senderId;
      const cur = byOther.get(other) ?? { last: m, unread: 0 };
      if (m.receiverId === me && !m.readAt) cur.unread++;
      byOther.set(other, cur);
    }
    const users = await prisma.user.findMany({ where: { id: { in: [...byOther.keys()] } }, select: userSel });
    const out: Conversation[] = users
      .map((u) => ({ with: entry(u), lastMessage: msgDTO(byOther.get(u.id)!.last), unreadCount: byOther.get(u.id)!.unread }))
      .sort((a, b) => b.lastMessage.createdAt.localeCompare(a.lastMessage.createdAt));
    return c.json(out);
  })
  .get('/messages/with/:userId', async (c) => {
    const me = c.get('user').id;
    const other = c.req.param('userId');
    const rows = await prisma.privateMessage.findMany({
      where: { OR: [{ senderId: me, receiverId: other }, { senderId: other, receiverId: me }] },
      orderBy: { createdAt: 'asc' },
      take: 1000,
    });
    await prisma.privateMessage.updateMany({ where: { senderId: other, receiverId: me, readAt: null }, data: { readAt: new Date() } });
    return c.json(rows.map(msgDTO));
  })
  .post('/messages', async (c) => {
    const me = c.get('user');
    const b = await parseBody(c, z.object({ receiverId: z.string().uuid(), text: z.string().trim().min(1).max(4000) }));
    if (b.receiverId === me.id) throw new AppError('VALIDATION_ERROR', 'No podés mandarte un mensaje a vos mismo.');
    const to = await prisma.user.findFirst({ where: { id: b.receiverId, status: 'ACTIVE' } });
    if (!to) throw notFound('No existe el destinatario.');
    const m = await prisma.privateMessage.create({ data: { senderId: me.id, receiverId: b.receiverId, text: b.text } });
    await notify([b.receiverId], { type: 'MESSAGE', text: `Mensaje nuevo de ${fullName(me)}`, link: `/social/messages/with/${me.id}` });
    return c.json(msgDTO(m), 201);
  })

  // ------------------------------------------------------- foro académico
  .get('/forum', async (c) => {
    const me = c.get('user');
    const status = c.req.query('status');
    // Moderadores ven todo; el resto ve lo aprobado más lo propio.
    const where: Prisma.ForumThreadWhereInput = isModerator(me)
      ? status && (FORUM_THREAD_STATUSES as readonly string[]).includes(status)
        ? { status: status as never }
        : {}
      : { OR: [{ status: 'APPROVED' }, { authorId: me.id }] };
    const rows = await prisma.forumThread.findMany({
      where,
      include: { author: true, _count: { select: { replies: true } } },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    return c.json(rows.map(threadDTO));
  })
  .post('/forum', async (c) => {
    const me = c.get('user');
    const b = await parseBody(
      c,
      z.object({
        title: z.string().trim().min(3).max(200),
        content: z.string().trim().min(3).max(10_000),
        careerId: z.string().uuid().optional(),
        year: z.number().int().min(1).max(8).optional(),
        commissionId: z.string().uuid().optional(),
      }),
    );
    // Lo que publica un moderador queda aprobado; lo demás espera revisión.
    const t = await prisma.forumThread.create({
      data: { ...b, authorId: me.id, status: isModerator(me) ? 'APPROVED' : 'PENDING' },
      include: { author: true, _count: { select: { replies: true } } },
    });
    return c.json(threadDTO(t), 201);
  })
  .patch('/forum/:id', async (c) => {
    const me = c.get('user');
    const t = await prisma.forumThread.findUnique({ where: { id: c.req.param('id') } });
    if (!t) throw notFound('No existe el tema.');
    if (isModerator(me)) {
      const b = await parseBody(
        c,
        z.object({ status: z.enum(FORUM_THREAD_STATUSES), rejectionReason: z.string().max(1000).nullable(), locked: z.boolean() }).partial(),
      );
      const u = await prisma.forumThread.update({
        where: { id: t.id },
        data: { ...b, ...(b.status ? { moderatedBy: me.id, moderatedAt: new Date() } : {}) },
        include: { author: true, _count: { select: { replies: true } } },
      });
      if (b.status && b.status !== t.status) {
        await notify([t.authorId], {
          type: 'FORUM',
          text: `Tu tema "${t.title}" quedó: ${b.status === 'APPROVED' ? 'aprobado' : b.status === 'REJECTED' ? 'rechazado' : 'para corregir'}`,
          details: b.rejectionReason ?? undefined,
        });
      }
      return c.json(threadDTO(u));
    }
    if (t.authorId !== me.id) throw forbidden('Solo podés editar tus temas.');
    const b = await parseBody(c, z.object({ title: z.string().trim().min(3).max(200), content: z.string().trim().min(3).max(10_000) }).partial());
    // Al editar, vuelve a revisión.
    const u = await prisma.forumThread.update({
      where: { id: t.id },
      data: { ...b, status: 'PENDING', rejectionReason: null },
      include: { author: true, _count: { select: { replies: true } } },
    });
    return c.json(threadDTO(u));
  })
  .delete('/forum/:id', async (c) => {
    const me = c.get('user');
    const t = await prisma.forumThread.findUnique({ where: { id: c.req.param('id') } });
    if (!t) throw notFound('No existe el tema.');
    if (!isModerator(me) && t.authorId !== me.id) throw forbidden('Solo podés borrar tus temas.');
    await prisma.forumThread.delete({ where: { id: t.id } });
    return c.body(null, 204);
  })
  .get('/forum/:id/replies', async (c) => {
    const me = c.get('user');
    const t = await prisma.forumThread.findUnique({ where: { id: c.req.param('id') } });
    if (!t || (t.status !== 'APPROVED' && t.authorId !== me.id && !isModerator(me))) throw notFound('No existe el tema.');
    const rows = await prisma.forumReply.findMany({ where: { threadId: t.id }, include: { author: true }, orderBy: { createdAt: 'asc' } });
    const out: ForumReply[] = rows.map((r) => ({
      id: r.id,
      threadId: r.threadId,
      authorId: r.authorId,
      authorName: fullName(r.author),
      content: r.content,
      createdAt: r.createdAt.toISOString(),
    }));
    return c.json(out);
  })
  .post('/forum/:id/replies', async (c) => {
    const me = c.get('user');
    const b = await parseBody(c, z.object({ content: z.string().trim().min(1).max(5000) }));
    const t = await prisma.forumThread.findUnique({ where: { id: c.req.param('id') } });
    if (!t || (t.status !== 'APPROVED' && !isModerator(me))) throw notFound('No existe el tema.');
    if (t.locked && !isModerator(me)) throw new AppError('CONFLICT', 'El tema está cerrado: no admite respuestas.');
    const r = await prisma.forumReply.create({ data: { threadId: t.id, authorId: me.id, content: b.content } });
    if (t.authorId !== me.id) await notify([t.authorId], { type: 'FORUM', text: `${fullName(me)} respondió tu tema "${t.title}"` });
    return c.json({ id: r.id }, 201);
  })

  // ----------------------------------------------------------- notificaciones
  .get('/notifications', async (c) => {
    const unread = c.req.query('unread') === '1';
    const rows = await prisma.notification.findMany({
      where: { userId: c.get('user').id, ...(unread ? { readAt: null } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    const out: AppNotification[] = rows.map((n) => ({
      id: n.id,
      type: n.type,
      text: n.text,
      details: n.details ?? undefined,
      link: n.link ?? undefined,
      readAt: toISO(n.readAt),
      createdAt: n.createdAt.toISOString(),
    }));
    return c.json(out);
  })
  .post('/notifications/read', async (c) => {
    const b = await parseBody(c, z.object({ ids: z.array(z.string().uuid()).optional() }));
    const r = await prisma.notification.updateMany({
      where: { userId: c.get('user').id, readAt: null, ...(b.ids ? { id: { in: b.ids } } : {}) },
      data: { readAt: new Date() },
    });
    return c.json({ updated: r.count });
  });
