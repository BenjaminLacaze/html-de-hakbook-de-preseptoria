import { apiClient, isoDateTime, isoDay, isoTime } from './client';
import { Notice } from '../types/api';

interface NoticeDTO {
  id: string;
  title: string;
  publishedAt: string;
  author: string;
  content: string;
  isUrgent: boolean;
  targetChildren: string[];
  readByGuardian: boolean;
  readAt?: string;
}

const toNotice = (n: NoticeDTO): Notice => ({
  id: n.id,
  title: n.title,
  date: isoDay(n.publishedAt),
  time: isoTime(n.publishedAt),
  author: n.author,
  content: n.content,
  isUrgent: n.isUrgent,
  targetCourses: n.targetChildren.length ? n.targetChildren : undefined,
  readByGuardian: n.readByGuardian,
  readAt: isoDateTime(n.readAt),
});

let lastNotices: Notice[] = [];

/** Comunicados de Preceptoría y Directivos dirigidos a las familias, a los alumnos o a toda la institución. */
export async function getNotices(): Promise<Notice[]> {
  lastNotices = (await apiClient<NoticeDTO[]>('/guardian/notices', { method: 'GET' })).map(toNotice);
  return lastNotices;
}

/** El acuse de lectura se guarda en la base (no en el navegador). */
export async function markNoticeRead(noticeId: string): Promise<Notice> {
  const r = await apiClient<{ readAt: string }>(`/guardian/notices/${encodeURIComponent(noticeId)}/read`, { method: 'POST' });
  const current = lastNotices.find((n) => n.id === noticeId) ?? (await getNotices()).find((n) => n.id === noticeId)!;
  return { ...current, readByGuardian: true, readAt: isoDateTime(r.readAt) };
}
