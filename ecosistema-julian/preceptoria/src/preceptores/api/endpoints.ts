/**
 * Una función tipada por endpoint que usa el Panel de Preceptores.
 * El backend (backend/src/routes/*) es la fuente de verdad.
 */

import { ApiError, apiFetch, qs } from './http';
import type {
  ApiAttendanceChange,
  ApiAttendanceRecordView,
  ApiAttendanceSummary,
  ApiAuthMe,
  ApiClassSession,
  ApiCommissionView,
  ApiConversation,
  ApiCreateJustificationRequest,
  ApiCreateNoticeRequest,
  ApiDirectoryEntry,
  ApiForumChannel,
  ApiForumReply,
  ApiForumThread,
  ApiInstitutionSettings,
  ApiJustificationStatus,
  ApiJustificationView,
  ApiNotice,
  ApiNotification,
  ApiPreceptorScope,
  ApiPrivateMessage,
  ApiQrCodeIssued,
  ApiRepEvent,
  ApiSaveBySubjectRequest,
  ApiStudentSensitiveData,
  ApiUserProfile,
  ID,
  ISODate,
} from './types';

// ------------------------------------------------------------------ sesión
export const authApi = {
  /** null = no hay sesión. */
  async me(): Promise<ApiAuthMe | null> {
    try {
      return await apiFetch<ApiAuthMe>('/auth/me');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    }
  },
  login: (email: string, password: string) =>
    apiFetch<ApiAuthMe>('/auth/login', { method: 'POST', body: { email, password } }),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiFetch<ApiAuthMe>('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } }),
  logout: () => apiFetch<void>('/auth/logout', { method: 'POST' }),
};

// -------------------------------------------------------- estructura académica
export const academicApi = {
  scope: () => apiFetch<ApiPreceptorScope>('/academic/scope'),
  commissions: (filters: { careerId?: ID; year?: number } = {}) =>
    apiFetch<ApiCommissionView[]>(`/structure/commissions${qs(filters)}`),
  /** Auditado en el backend (SENSITIVE_DATA_READ). Pedirlo solo a demanda. */
  studentSensitive: (studentId: ID) => apiFetch<ApiStudentSensitiveData>(`/structure/students/${studentId}/sensitive`),
};

// ----------------------------------------------------------------- asistencia
export const attendanceApi = {
  list: (filters: { subjectId?: ID; commissionId?: ID; studentId?: ID; from?: ISODate; to?: ISODate }) =>
    apiFetch<ApiAttendanceRecordView[]>(`/attendance${qs(filters)}`),
  saveBySubject: (body: ApiSaveBySubjectRequest) =>
    apiFetch<{ saved: number }>('/attendance/by-subject', { method: 'POST', body }),
  summaryBulk: (filters: { commissionId?: ID; subjectId?: ID }) =>
    apiFetch<ApiAttendanceSummary[]>(`/attendance/summary/bulk${qs(filters)}`),
  audit: (filters: { commissionId?: ID; subjectId?: ID }) =>
    apiFetch<ApiAttendanceChange[]>(`/attendance/audit${qs(filters)}`),

  justifications: (status?: ApiJustificationStatus) =>
    apiFetch<ApiJustificationView[]>(`/attendance/justifications${qs({ status })}`),
  createJustification: (body: ApiCreateJustificationRequest) =>
    apiFetch<{ id: ID; status: ApiJustificationStatus }>('/attendance/justifications', { method: 'POST', body }),
  reviewJustification: (id: ID, status: 'APPROVED' | 'REJECTED', reviewNotes?: string) =>
    apiFetch<{ id: ID; status: ApiJustificationStatus }>(`/attendance/justifications/${id}`, {
      method: 'PATCH',
      body: { status, ...(reviewNotes ? { reviewNotes } : {}) },
    }),

  // QR de la clase: abre (o reutiliza) la clase de esa comisión y fecha y genera un código.
  openSession: (commissionId: ID, date: ISODate) =>
    apiFetch<ApiClassSession>(`/attendance/commissions/${commissionId}/sessions`, { method: 'POST', body: { date } }),
  issueQr: (sessionId: ID, minutes: number) =>
    apiFetch<ApiQrCodeIssued>(`/attendance/sessions/${sessionId}/qr`, { method: 'POST', body: { minutes } }),
  revokeQr: (sessionId: ID) => apiFetch<void>(`/attendance/sessions/${sessionId}/qr`, { method: 'DELETE' }),
};

// ------------------------------------------------------- registros y comunicados
export const recordsApi = {
  settings: () => apiFetch<ApiInstitutionSettings>('/records/settings'),
  myNotices: () => apiFetch<ApiNotice[]>('/records/notices?mine=1'),
  createNotice: (body: ApiCreateNoticeRequest) => apiFetch<ApiNotice>('/records/notices', { method: 'POST', body }),
  archiveNotice: (id: ID) => apiFetch<ApiNotice>(`/records/notices/${id}`, { method: 'PATCH', body: { status: 'ARCHIVED' } }),
};

// ------------------------------------------------------------------- social
export const socialApi = {
  directory: (filters: { role?: string; search?: string } = {}) =>
    apiFetch<ApiDirectoryEntry[]>(`/social/directory${qs(filters)}`),
  conversations: () => apiFetch<ApiConversation[]>('/social/messages/conversations'),
  /** Además marca como leídos los mensajes recibidos de esa persona. */
  messagesWith: (userId: ID) => apiFetch<ApiPrivateMessage[]>(`/social/messages/with/${userId}`),
  sendMessage: (receiverId: ID, text: string) =>
    apiFetch<ApiPrivateMessage>('/social/messages', { method: 'POST', body: { receiverId, text } }),

  forum: (channel?: ApiForumChannel) => apiFetch<ApiForumThread[]>(`/social/forum${qs({ channel })}`),
  createThread: (title: string, content: string, channel: ApiForumChannel) =>
    apiFetch<ApiForumThread>('/social/forum', { method: 'POST', body: { title, content, channel } }),
  replies: (threadId: ID) => apiFetch<ApiForumReply[]>(`/social/forum/${threadId}/replies`),
  reply: (threadId: ID, content: string) =>
    apiFetch<{ id: ID }>(`/social/forum/${threadId}/replies`, { method: 'POST', body: { content } }),

  notifications: () => apiFetch<ApiNotification[]>('/social/notifications'),
  markNotificationsRead: (ids?: ID[]) =>
    apiFetch<{ updated: number }>('/social/notifications/read', { method: 'POST', body: ids ? { ids } : {} }),

  myProfile: () => apiFetch<ApiUserProfile>('/social/profiles/me'),
};

// ---------------------------------------------------- Centro de Estudiantes
export const centroApi = {
  /** Solo lectura para Preceptoría: anotarse devuelve 403. */
  events: () => apiFetch<ApiRepEvent[]>('/centro/events'),
};
