// Centro de Estudiantes: eventos, foro de la comunidad, comunicados y reclamos.
//
// Leer: cualquier persona con sesión. Gestionar (crear eventos y comunicados, moderar,
// responder y derivar reclamos): Centro de Estudiantes y Superadmin. Anotarse a eventos,
// publicar o denunciar en el foro y presentar reclamos: alumnos y Centro.
//
//   GET /centro/events            POST /centro/events          PATCH|DELETE /centro/events/:id
//   POST|DELETE /centro/events/:id/join   GET /centro/events/:id/participants (Centro)
//   GET /centro/threads           POST /centro/threads         PATCH /centro/threads/:id (fijar, ocultar, descartar denuncia)
//   POST /centro/threads/:id/report (denunciar)
//   GET /centro/threads/:id/replies                            POST /centro/threads/:id/replies
//   GET /centro/announcements     POST /centro/announcements   PATCH|DELETE /centro/announcements/:id
//   GET /centro/claims            POST /centro/claims          PATCH /centro/claims/:id (estado, respuesta, derivar, archivar)
import { Hono } from 'hono';
import { z } from 'zod';
import {
  REP_CLAIM_CATEGORIES,
  REP_CLAIM_DESTINATION_LABELS,
  REP_CLAIM_DESTINATIONS,
  REP_CLAIM_STATUS_LABELS,
  REP_CLAIM_STATUSES,
  REP_EVENT_TYPES,
  REP_FORUM_CATEGORIES,
  type RepAnnouncement,
  type RepAttachment,
  type RepClaim,
  type RepClaimHistoryItem,
  type RepEvent,
  type RepEventParticipantView,
  type RepReply,
  type RepThread,
} from '../../../shared/types.js';
import { audit } from '../audit.js';
import { requireAuth, requireRoles, type AppEnv, type CurrentUser } from '../auth/middleware.js';
import { prisma } from '../db.js';
import { AppError, notFound } from '../errors.js';
import type { Prisma } from '../generated/prisma/client.js';
import { hasRole, parseDate, toISODate } from '../scope.js';
import { notify } from '../notify.js';
import { parseBody } from '../validation.js';

const MANAGE = ['STUDENT_REP', 'SUPER_ADMIN'] as const;
const PARTICIPATE = ['STUDENT', 'STUDENT_REP', 'SUPER_ADMIN'] as const;
const TIME = z.string().regex(/^\d{2}:\d{2}$/, 'Hora HH:mm');
const fullName = (u: { firstName: string; lastName: string }) => `${u.firstName} ${u.lastName}`;
const today = () => parseDate(new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }));

/** Miembros activos del Centro, para avisarles de algo nuevo. */
const repIds = async () =>
  (await prisma.user.findMany({ where: { roles: { has: 'STUDENT_REP' }, status: 'ACTIVE' }, select: { id: true } })).map((u) => u.id);

/** Autor con su cargo en el Centro (si lo tiene). */
const authorInclude = { include: { profile: { select: { position: true } } } } as const;
type AuthorRow = Prisma.UserGetPayload<typeof authorInclude>;
const authorInfo = (u: AuthorRow) => ({
  authorName: fullName(u),
  authorPosition: u.profile?.position ?? undefined,
  authorIsRep: u.roles.includes('STUDENT_REP'),
});

const eventBody = z.object({
  title: z.string().trim().min(2).max(200),
  date: z.string(),
  time: TIME.optional(),
  endTime: TIME.nullable().optional(),
  location: z.string().max(200).optional(),
  description: z.string().trim().min(2).max(3000),
  type: z.enum(REP_EVENT_TYPES),
  organizer: z.string().trim().min(2).max(120),
  capacity: z.number().int().min(1).max(5000).nullable().optional(),
  coverUrl: z.string().url().max(2000).nullable().optional(),
});

const attachment = z.object({
  name: z.string().trim().min(1).max(200),
  url: z.string().url().max(2000),
  kind: z.enum(['image', 'pdf', 'document']),
  sizeBytes: z.number().int().min(0).optional(),
});

const announcementBody = z.object({
  title: z.string().trim().min(2).max(200),
  content: z.string().trim().min(2).max(5000),
  pinned: z.boolean().optional(),
  publishDate: z.string().nullable().optional(),
  summary: z.string().trim().max(400).nullable().optional(),
  coverUrl: z.string().url().max(2000).nullable().optional(),
  draft: z.boolean().optional(),
  attachments: z.array(attachment).max(10).optional(),
});

type ClaimRow = Prisma.RepClaimGetPayload<{ include: { author: { include: { student: { include: { career: true } } } } } }>;

/** Agrega un paso a la línea de tiempo del reclamo. */
const withHistory = (r: { history: unknown }, item: Omit<RepClaimHistoryItem, 'at'>) =>
  [...((r.history ?? []) as RepClaimHistoryItem[]), { ...item, at: new Date().toISOString() }] as unknown as Prisma.InputJsonValue;

function claimDTO(r: ClaimRow, viewer: CurrentUser): RepClaim {
  // Anónimo: nadie ve el autor, salvo el propio autor y Superadmin.
  const showAuthor = !r.anonymous || r.authorId === viewer.id || hasRole(viewer, 'SUPER_ADMIN');
  return {
    id: r.id,
    authorId: showAuthor ? r.authorId : '',
    authorName: showAuthor ? fullName(r.author) : undefined,
    authorEmail: showAuthor ? r.author.email : undefined,
    authorCareer: showAuthor ? r.author.student?.career.name : undefined,
    code: r.code ?? undefined,
    category: r.category,
    title: r.title ?? undefined,
    description: r.description,
    anonymous: r.anonymous,
    status: r.status,
    response: r.response ?? undefined,
    responderId: r.responderId ?? undefined,
    forwardedTo: r.forwardedTo ?? undefined,
    forwardNote: r.forwardNote ?? undefined,
    archiveReason: r.archiveReason ?? undefined,
    history: (r.history ?? []) as unknown as RepClaimHistoryItem[],
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}
const claimInclude = { author: { include: { student: { include: { career: true } } } } } as const;

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
      endTime: e.endTime ?? undefined,
      location: e.location ?? undefined,
      description: e.description,
      type: e.type,
      organizer: e.organizer,
      capacity: e.capacity ?? undefined,
      coverUrl: e.coverUrl ?? undefined,
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
  /** Quiénes se anotaron (para el Centro). */
  .get('/events/:id/participants', requireRoles(...MANAGE), async (c) => {
    const rows = await prisma.repEventParticipant.findMany({
      where: { eventId: c.req.param('id') },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true, roles: true, student: { select: { career: { select: { name: true } } } } } } },
      orderBy: { joinedAt: 'asc' },
    });
    const out: RepEventParticipantView[] = rows.map(({ user: u, joinedAt }) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      roles: u.roles,
      careerName: u.student?.career.name,
      joinedAt: joinedAt.toISOString(),
    }));
    return c.json(out);
  })
  .post('/events/:id/join', requireRoles(...PARTICIPATE), async (c) => {
    const me = c.get('user');
    const e = await prisma.repEvent.findUnique({ where: { id: c.req.param('id') }, include: { _count: { select: { participants: true } } } });
    if (!e) throw notFound('No existe el evento.');
    const already = await prisma.repEventParticipant.findUnique({ where: { eventId_userId: { eventId: e.id, userId: me.id } } });
    if (already) return c.json({ joined: true });
    if (e.capacity !== null && e._count.participants >= e.capacity) throw new AppError('CONFLICT', 'El evento ya no tiene cupo.');
    await prisma.repEventParticipant.create({ data: { eventId: e.id, userId: me.id } });
    await notify([e.createdBy], { type: 'EVENT', text: `${fullName(me)} se inscribió a "${e.title}"`, link: `/centro/events/${e.id}` });
    return c.json({ joined: true });
  })
  .delete('/events/:id/join', requireRoles(...PARTICIPATE), async (c) => {
    const me = c.get('user');
    await prisma.repEventParticipant.deleteMany({ where: { eventId: c.req.param('id'), userId: me.id } });
    return c.json({ joined: false });
  })

  // ------------------------------------------------------------------- foro
  .get('/threads', async (c) => {
    const me = c.get('user');
    const manage = hasRole(me, ...MANAGE);
    const rows = await prisma.repThread.findMany({
      where: manage ? {} : { hidden: false },
      include: { author: authorInclude, _count: { select: { replies: true } } },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      take: 500,
    });
    const out: RepThread[] = rows.map((t) => ({
      id: t.id,
      authorId: t.authorId,
      ...authorInfo(t.author),
      title: t.title,
      content: t.content,
      category: t.category,
      pinned: t.pinned,
      replyCount: t._count.replies,
      hidden: t.hidden,
      hiddenReason: manage ? t.hiddenReason ?? undefined : undefined,
      // Las denuncias son información de moderación: solo para el Centro.
      reported: manage ? t.reported : false,
      reportReason: manage ? t.reportReason ?? undefined : undefined,
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
    const me = c.get('user');
    const b = await parseBody(
      c,
      z
        .object({
          pinned: z.boolean(),
          hidden: z.boolean(),
          hiddenReason: z.string().trim().max(500),
          /** false = descartar la denuncia. */
          reported: z.literal(false),
        })
        .partial(),
    );
    const t = await prisma.repThread.findUnique({ where: { id: c.req.param('id') } });
    if (!t) throw notFound('No existe el tema.');
    const u = await prisma.repThread.update({
      where: { id: t.id },
      data: {
        ...b,
        ...(b.hidden === false ? { hiddenReason: null } : {}),
        ...(b.reported === false ? { reportReason: null } : {}),
      },
    });
    if (b.hidden !== undefined && b.hidden !== t.hidden) {
      await audit(c, me, { action: 'STATUS_CHANGE', entity: 'RepThread', entityId: t.id, summary: b.hidden ? `Tema oculto: ${t.title}` : `Tema visible: ${t.title}` });
    }
    return c.json({ id: u.id, pinned: u.pinned, hidden: u.hidden, reported: u.reported });
  })
  .post('/threads/:id/report', requireRoles(...PARTICIPATE), async (c) => {
    const me = c.get('user');
    const b = await parseBody(c, z.object({ reason: z.string().trim().min(3, 'Contá el motivo.').max(500) }));
    const t = await prisma.repThread.findUnique({ where: { id: c.req.param('id') } });
    if (!t || t.hidden) throw notFound('No existe el tema.');
    await prisma.repThread.update({ where: { id: t.id }, data: { reported: true, reportReason: b.reason } });
    await notify(await repIds(), { type: 'FORUM', text: `Denunciaron un tema del foro: "${t.title}"`, details: b.reason, link: `/centro/threads/${t.id}` });
    await audit(c, me, { action: 'CREATE', entity: 'RepThreadReport', entityId: t.id, summary: 'Denuncia en el foro del Centro' });
    return c.json({ reported: true });
  })
  .get('/threads/:id/replies', async (c) => {
    const me = c.get('user');
    const t = await prisma.repThread.findUnique({ where: { id: c.req.param('id') } });
    if (!t || (t.hidden && !hasRole(me, ...MANAGE))) throw notFound('No existe el tema.');
    const rows = await prisma.repReply.findMany({
      where: { threadId: t.id },
      include: { author: authorInclude },
      orderBy: { createdAt: 'asc' },
    });
    const out: RepReply[] = rows.map((r) => ({
      id: r.id,
      threadId: r.threadId,
      authorId: r.authorId,
      ...authorInfo(r.author),
      content: r.content,
      createdAt: r.createdAt.toISOString(),
    }));
    return c.json(out);
  })
  .post('/threads/:id/replies', requireRoles(...PARTICIPATE), async (c) => {
    const me = c.get('user');
    const b = await parseBody(c, z.object({ content: z.string().trim().min(1).max(3000) }));
    const t = await prisma.repThread.findUnique({ where: { id: c.req.param('id') } });
    if (!t || (t.hidden && !hasRole(me, ...MANAGE))) throw notFound('No existe el tema.');
    const r = await prisma.repReply.create({ data: { threadId: t.id, authorId: me.id, content: b.content } });
    return c.json({ id: r.id }, 201);
  })

  // ------------------------------------------------------------ comunicados
  .get('/announcements', async (c) => {
    const me = c.get('user');
    // Borradores y publicaciones programadas: solo el Centro.
    const rows = await prisma.repAnnouncement.findMany({
      where: hasRole(me, ...MANAGE) ? {} : { draft: false, OR: [{ publishDate: null }, { publishDate: { lte: today() } }] },
      include: { author: authorInclude },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      take: 200,
    });
    const out: RepAnnouncement[] = rows.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      authorId: a.authorId,
      authorName: fullName(a.author),
      authorPosition: a.author.profile?.position ?? undefined,
      pinned: a.pinned,
      publishDate: a.publishDate ? toISODate(a.publishDate) : undefined,
      summary: a.summary ?? undefined,
      coverUrl: a.coverUrl ?? undefined,
      draft: a.draft,
      attachments: (a.attachments ?? []) as unknown as RepAttachment[],
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
    const { publishDate, ...rest } = b;
    await prisma.repAnnouncement.update({
      where: { id: a.id },
      data: { ...rest, ...(publishDate !== undefined ? { publishDate: publishDate ? parseDate(publishDate) : null } : {}) },
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
      include: claimInclude,
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    return c.json(rows.map((r) => claimDTO(r, me)));
  })
  .post('/claims', requireRoles(...PARTICIPATE), async (c) => {
    const me = c.get('user');
    const b = await parseBody(
      c,
      z.object({
        category: z.enum(REP_CLAIM_CATEGORIES),
        title: z.string().trim().min(3).max(200).optional(),
        description: z.string().trim().min(5).max(3000),
        anonymous: z.boolean().optional(),
      }),
    );
    const year = new Date().getFullYear();
    const history = [{ at: new Date().toISOString(), type: 'CREATED', title: 'Reclamo recibido', actorName: b.anonymous ? 'Anónimo' : fullName(me) }];
    // Número correlativo por año. Si dos llegan juntos, el segundo reintenta con el siguiente.
    let r;
    for (let attempt = 0; ; attempt++) {
      const count = await prisma.repClaim.count({ where: { code: { startsWith: `REC-${year}-` } } });
      const code = `REC-${year}-${String(count + 1 + attempt).padStart(3, '0')}`;
      try {
        r = await prisma.repClaim.create({ data: { ...b, code, history, authorId: me.id }, include: claimInclude });
        break;
      } catch (e) {
        if ((e as { code?: string }).code !== 'P2002' || attempt >= 4) throw e;
      }
    }
    await notify(await repIds(), { type: 'CLAIM', text: `Reclamo nuevo ${r.code}`, details: b.title ?? b.description.slice(0, 120), link: `/centro/claims/${r.id}` });
    return c.json(claimDTO(r, me), 201);
  })
  .patch('/claims/:id', requireRoles(...MANAGE), async (c) => {
    const me = c.get('user');
    const b = await parseBody(
      c,
      z.object({
        status: z.enum(REP_CLAIM_STATUSES).optional(),
        response: z.string().trim().max(3000).optional(),
        forwardedTo: z.enum(REP_CLAIM_DESTINATIONS).optional(),
        forwardNote: z.string().trim().max(1000).optional(),
        archiveReason: z.string().trim().max(1000).optional(),
        /** Comentario interno para la línea de tiempo. */
        note: z.string().trim().max(1000).optional(),
      }),
    );
    const r = await prisma.repClaim.findUnique({ where: { id: c.req.param('id') } });
    if (!r) throw notFound('No existe el reclamo.');
    // Derivar y archivar fijan el estado.
    const status = b.forwardedTo ? 'FORWARDED' : b.archiveReason ? 'ARCHIVED' : b.status;
    let history = r.history as unknown;
    const actorName = fullName(me);
    if (b.forwardedTo) {
      history = withHistory({ history }, { type: 'FORWARDED', title: `Derivado a ${REP_CLAIM_DESTINATION_LABELS[b.forwardedTo]}`, note: b.forwardNote, actorName });
    } else if (status === 'ARCHIVED' && r.status !== 'ARCHIVED') {
      history = withHistory({ history }, { type: 'ARCHIVED', title: 'Reclamo archivado', note: b.archiveReason, actorName });
    } else if (status && status !== r.status) {
      history = withHistory({ history }, { type: 'STATUS', title: `Estado: ${REP_CLAIM_STATUS_LABELS[status]}`, note: b.note, actorName });
    }
    if (b.response) history = withHistory({ history }, { type: 'RESPONSE', title: 'Respuesta al autor', note: b.response, actorName });
    const u = await prisma.repClaim.update({
      where: { id: r.id },
      data: {
        ...(status ? { status } : {}),
        ...(b.response ? { response: b.response, responderId: me.id } : {}),
        ...(b.forwardedTo ? { forwardedTo: b.forwardedTo, forwardNote: b.forwardNote ?? null } : {}),
        ...(b.archiveReason ? { archiveReason: b.archiveReason } : {}),
        history: history as Prisma.InputJsonValue,
      },
      include: claimInclude,
    });
    if (b.response || (status && status !== r.status)) {
      await notify([r.authorId], {
        type: 'CLAIM',
        text: b.response ? 'El Centro de Estudiantes respondió tu reclamo' : `Tu reclamo ahora está: ${REP_CLAIM_STATUS_LABELS[u.status]}`,
        details: b.response,
        link: '/centro/claims',
      });
    }
    if (status && status !== r.status) {
      await audit(c, me, { action: 'STATUS_CHANGE', entity: 'RepClaim', entityId: r.id, summary: `Reclamo ${r.status} → ${status}` });
    }
    return c.json(claimDTO(u, me));
  });
