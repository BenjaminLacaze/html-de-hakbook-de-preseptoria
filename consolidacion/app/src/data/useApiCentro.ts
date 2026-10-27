// Capa traductora: pantalla del Centro de Estudiantes (rescatada) ↔ API /centro/* y /social/directory.
import { useCallback, useEffect, useState } from 'react';
import { apiFetch, ApiRequestError } from '@shared/api';
import type { AuthMe, DirectoryEntry, RepAnnouncement, RepClaim, RepEvent, RepReply, RepThread } from '@shared/types';
import type {
  StudentRepAnnouncement,
  StudentRepClaim,
  StudentRepEvent,
  StudentRepForumReply,
  StudentRepForumThread,
  User,
} from '../legacy/types';
import { diff, invert, legacyUser, useSyncedList, userNum, userUuid } from './sync';

const EV_TYPE = { ACADEMIC: 'académico', CULTURAL: 'cultural', SPORTS: 'deportivo', MEETING: 'reunión' } as const;
const FORUM_CAT = { GENERAL: 'general', PROPOSALS: 'propuestas', EVENTS: 'eventos' } as const;
const CLAIM_CAT = { ACADEMIC: 'académico', INFRASTRUCTURE: 'infraestructura', ADMINISTRATIVE: 'administrativo', SUGGESTION: 'sugerencia' } as const;
const CLAIM_ST = { PENDING: 'pendiente', IN_REVIEW: 'en revisión', RESOLVED: 'resuelto', ARCHIVED: 'archivado' } as const;

export interface ApiCentroState {
  state: 'idle' | 'loading' | 'ready' | 'error';
  error?: string;
  user?: User;
  allUsers?: User[];
  participants?: Record<string, number[]>;
  events?: ReturnType<typeof useSyncedList<StudentRepEvent>>;
  threads?: ReturnType<typeof useSyncedList<StudentRepForumThread>>;
  replies?: ReturnType<typeof useSyncedList<StudentRepForumReply>>;
  announcements?: ReturnType<typeof useSyncedList<StudentRepAnnouncement>>;
  claims?: ReturnType<typeof useSyncedList<StudentRepClaim>>;
}

export function useApiCentro(me: AuthMe | null): ApiCentroState {
  const [state, setState] = useState<ApiCentroState['state']>(me ? 'loading' : 'idle');
  const [error, setError] = useState<string>();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [participants, setParticipants] = useState<Record<string, number[]>>({});

  // eslint-disable-next-line prefer-const
  let reload: () => Promise<void>;

  const eventBody = (e: StudentRepEvent) => ({
    title: e.title,
    date: e.date,
    time: e.time || undefined,
    location: e.location || undefined,
    description: e.description,
    type: invert(EV_TYPE)[e.type],
    organizer: e.organizer,
  });

  const events = useSyncedList<StudentRepEvent>(
    useCallback(async (before, after) => {
      const d = diff(before, after);
      for (const e of d.added) await apiFetch('/centro/events', { method: 'POST', body: eventBody(e) });
      for (const { after: e } of d.changed) await apiFetch(`/centro/events/${e.id}`, { method: 'PATCH', body: eventBody(e) });
      for (const e of d.removed) await apiFetch(`/centro/events/${e.id}`, { method: 'DELETE' });
    }, []),
    () => reload(),
  );

  const threads = useSyncedList<StudentRepForumThread>(
    useCallback(async (before, after) => {
      const d = diff(before, after);
      for (const t of d.added)
        await apiFetch('/centro/threads', { method: 'POST', body: { title: t.title, content: t.content, category: invert(FORUM_CAT)[t.category] } });
      for (const { before: b, after: a } of d.changed)
        if (Boolean(b.isPinned) !== Boolean(a.isPinned)) await apiFetch(`/centro/threads/${a.id}`, { method: 'PATCH', body: { pinned: Boolean(a.isPinned) } });
    }, []),
    () => reload(),
  );

  const replies = useSyncedList<StudentRepForumReply>(
    useCallback(async (before, after) => {
      for (const r of diff(before, after).added) await apiFetch(`/centro/threads/${r.threadId}/replies`, { method: 'POST', body: { content: r.content } });
    }, []),
    () => reload(),
  );

  const annBody = (a: StudentRepAnnouncement) => ({
    title: a.title,
    content: a.content,
    pinned: Boolean(a.isPinned),
    ...(a.publishDate ? { publishDate: a.publishDate.slice(0, 10) } : {}),
  });
  const announcements = useSyncedList<StudentRepAnnouncement>(
    useCallback(async (before, after) => {
      const d = diff(before, after);
      for (const a of d.added) await apiFetch('/centro/announcements', { method: 'POST', body: annBody(a) });
      for (const { after: a } of d.changed) await apiFetch(`/centro/announcements/${a.id}`, { method: 'PATCH', body: annBody(a) });
      for (const a of d.removed) await apiFetch(`/centro/announcements/${a.id}`, { method: 'DELETE' });
    }, []),
    () => reload(),
  );

  const claims = useSyncedList<StudentRepClaim>(
    useCallback(async (before, after) => {
      for (const { before: b, after: a } of diff(before, after).changed)
        if (b.status !== a.status || b.response !== a.response)
          await apiFetch(`/centro/claims/${a.id}`, {
            method: 'PATCH',
            body: { ...(b.status !== a.status ? { status: invert(CLAIM_ST)[a.status] } : {}), ...(a.response && b.response !== a.response ? { response: a.response } : {}) },
          });
    }, []),
    () => reload(),
  );

  reload = useCallback(async () => {
    if (!me) return;
    try {
      const [dir, ev, th, an, cl] = await Promise.all([
        apiFetch<DirectoryEntry[]>('/social/directory'),
        apiFetch<RepEvent[]>('/centro/events'),
        apiFetch<RepThread[]>('/centro/threads'),
        apiFetch<RepAnnouncement[]>('/centro/announcements'),
        apiFetch<RepClaim[]>('/centro/claims'),
      ]);
      const [reps, parts] = await Promise.all([
        Promise.all(th.map((t) => apiFetch<RepReply[]>(`/centro/threads/${t.id}/replies`))),
        Promise.all(ev.map((e) => apiFetch<{ id: string }[]>(`/centro/events/${e.id}/participants`).then((p) => [e.id, p] as const))),
      ]);
      setAllUsers(dir.map((d) => legacyUser(d)));
      setParticipants(Object.fromEntries(parts.map(([id, p]) => [id, p.map((u) => userNum(u.id))])));
      events.replace(
        ev.map((e) => ({ id: e.id, title: e.title, date: e.date, time: e.time, location: e.location, description: e.description, type: EV_TYPE[e.type], organizer: e.organizer })),
      );
      threads.replace(
        th.map((t) => ({ id: t.id, authorId: userNum(t.authorId), title: t.title, content: t.content, category: FORUM_CAT[t.category], timestamp: t.createdAt, isPinned: t.pinned })),
      );
      replies.replace(reps.flat().map((r) => ({ id: r.id, threadId: r.threadId, authorId: userNum(r.authorId), content: r.content, timestamp: r.createdAt })));
      announcements.replace(
        an.map((a) => ({ id: a.id, title: a.title, content: a.content, authorId: userNum(a.authorId), timestamp: a.createdAt, isPinned: a.pinned, publishDate: a.publishDate })),
      );
      claims.replace(
        cl.map((r) => ({
          id: r.id,
          authorId: userNum(r.authorId),
          category: CLAIM_CAT[r.category],
          description: r.description,
          timestamp: r.createdAt,
          status: CLAIM_ST[r.status],
          response: r.response,
          responderId: r.responderId ? userNum(r.responderId) : undefined,
        })),
      );
      setState('ready');
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Error inesperado.');
      setState('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  if (!me) return { state: 'idle' };
  if (state !== 'ready') return { state, error };
  return {
    state,
    user: legacyUser({ id: me.user.id, firstName: me.user.firstName, lastName: me.user.lastName, roles: me.user.roles }, me.user.email),
    allUsers,
    participants,
    events,
    threads,
    replies,
    announcements,
    claims,
  };
}

// Para que otros módulos puedan resolver ids de usuario de las pantallas a UUID.
export { userUuid };
