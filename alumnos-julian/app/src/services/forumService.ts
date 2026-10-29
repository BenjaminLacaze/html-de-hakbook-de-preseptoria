import { apiFetch } from '@shared/api';
import type { ForumThread, ForumReply } from '@shared/types';
import type { ForumPost, ForumPostReply } from '../types';
const reply = (r: ForumReply): ForumPostReply => ({ id: r.id, postId: r.threadId, autorNombre: r.authorName, autorRol: 'Participante', fecha: r.createdAt, contenido: r.content });
const post = (t: ForumThread, respuestas: ForumPostReply[] = []): ForumPost => ({ id: t.id, materiaId: t.commissionId, categoria: 'General', titulo: t.title, contenido: t.content, autorNombre: t.authorName, autorRol: 'Participante', fecha: t.createdAt, respuestasCount: t.replyCount, respuestas, status: t.status, locked: t.locked });
export const forumService = { async getPosts() { const ts = await apiFetch<ForumThread[]>('/social/forum'); return Promise.all(ts.map(async (t) => post(t, t.status === 'APPROVED' ? (await apiFetch<ForumReply[]>(`/social/forum/${t.id}/replies`)).map(reply) : []))); }, async createPost(d: {
        titulo: string;
        contenido: string;
        categoria: ForumPost['categoria'];
        materiaId?: string;
        materiaNombre?: string;
    }) { return post(await apiFetch<ForumThread>('/social/forum', { method: 'POST', body: { title: d.titulo, content: d.contenido, commissionId: d.materiaId || undefined } })); }, async replyToPost(id: string, content: string) { return reply(await apiFetch<ForumReply>(`/social/forum/${id}/replies`, { method: 'POST', body: { content } })); } };
