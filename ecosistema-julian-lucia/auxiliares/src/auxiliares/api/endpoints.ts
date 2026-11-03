/**
 * Una función tipada por endpoint que usa el Panel de Auxiliares.
 * Rutas en backend/src/routes/{staff,records,social}.ts.
 */
import { apiFetch } from './http';
import type {
  AppNotificationDTO,
  IncidentDTO,
  IncidentPriority,
  IncidentStatus,
  InstallationDTO,
  InstallationStatus,
  Layout,
  MaintenanceLogDTO,
  NoticeDTO,
  ShiftChangeRequestDTO,
  ShiftChangeStatus,
  StaffAbsenceDTO,
  StaffAbsenceReason,
  StaffMemberDTO,
  StaffShiftDTO,
  StaffTaskDTO,
  StaffTaskStatus,
  StaffTaskType,
  UserProfileDTO,
} from './dto';

const qs = (params: Record<string, string | undefined>) => {
  const entries = Object.entries(params).filter((e): e is [string, string] => Boolean(e[1]));
  return entries.length ? `?${new URLSearchParams(entries).toString()}` : '';
};
const id = (value: string) => encodeURIComponent(value);

// ------------------------------------------------------------------ tareas
export const getTasks = (date?: string) => apiFetch<StaffTaskDTO[]>(`/staff/tasks${qs({ date })}`);

export const createTask = (body: {
  date: string;
  startTime: string;
  title: string;
  type: StaffTaskType;
  priority?: IncidentPriority;
  installationId?: string;
  location?: string;
  details?: string;
  assignedToUserId?: string;
}) => apiFetch<StaffTaskDTO>('/staff/tasks', { method: 'POST', body });

export const setTaskStatus = (taskId: string, status: StaffTaskStatus) =>
  apiFetch<StaffTaskDTO>(`/staff/tasks/${id(taskId)}`, { method: 'PATCH', body: { status } });

export const deleteTask = (taskId: string) =>
  apiFetch<void>(`/staff/tasks/${id(taskId)}`, { method: 'DELETE' });

// ---------------------------------------------------------- instalaciones
export const getInstallations = () => apiFetch<InstallationDTO[]>('/staff/installations');

export const createInstallation = (body: {
  name: string;
  code?: string;
  floor?: string;
  status?: InstallationStatus;
  layout: Layout;
  nextTask?: string;
  notes?: string;
}) => apiFetch<InstallationDTO>('/staff/installations', { method: 'POST', body });

export const updateInstallation = (
  installationId: string,
  body: Partial<{
    name: string;
    code: string | null;
    floor: string | null;
    layout: Layout;
    status: InstallationStatus;
    nextTask: string | null;
    notes: string | null;
    cleanedNow: true;
  }>
) =>
  apiFetch<InstallationDTO>(`/staff/installations/${id(installationId)}`, {
    method: 'PATCH',
    body,
  });

export const deleteInstallation = (installationId: string) =>
  apiFetch<void>(`/staff/installations/${id(installationId)}`, { method: 'DELETE' });

// ------------------------------------------------------------ incidencias
export const getIncidents = (status?: IncidentStatus) =>
  apiFetch<IncidentDTO[]>(`/staff/incidents${qs({ status })}`);

export const createIncident = (body: {
  description: string;
  priority: IncidentPriority;
  sector: string;
  installationId?: string;
  imageUrl?: string;
  notes?: string;
  installationStatus?: InstallationStatus;
}) => apiFetch<IncidentDTO>('/staff/incidents', { method: 'POST', body });

export const updateIncident = (
  incidentId: string,
  body: { status: IncidentStatus; notes?: string; restoreInstallation?: boolean }
) => apiFetch<IncidentDTO>(`/staff/incidents/${id(incidentId)}`, { method: 'PATCH', body });

// ---------------------------------------------------------- mantenimiento
export const getMaintenanceLog = () => apiFetch<MaintenanceLogDTO[]>('/staff/maintenance');

export const createMaintenanceLog = (body: {
  date: string;
  task: string;
  responsible: string;
  installationId?: string;
}) => apiFetch<{ id: string }>('/staff/maintenance', { method: 'POST', body });

// ----------------------------------------------------------------- turnos
export const getStaffPeople = () => apiFetch<StaffMemberDTO[]>('/staff/people');

export const getShifts = (params: { from?: string; to?: string; userId?: string } = {}) =>
  apiFetch<StaffShiftDTO[]>(`/staff/shifts${qs(params)}`);

export const getShiftChanges = (status?: ShiftChangeStatus) =>
  apiFetch<ShiftChangeRequestDTO[]>(`/staff/shift-changes${qs({ status })}`);

export const createShiftChange = (body: {
  requesterShiftId: string;
  colleagueShiftId: string;
  reason?: string;
}) => apiFetch<ShiftChangeRequestDTO>('/staff/shift-changes', { method: 'POST', body });

export const respondShiftChange = (
  requestId: string,
  status: Exclude<ShiftChangeStatus, 'PENDING'>
) =>
  apiFetch<ShiftChangeRequestDTO>(`/staff/shift-changes/${id(requestId)}`, {
    method: 'PATCH',
    body: { status },
  });

// ------------------------------------------------- ausencias del personal
export const getAbsences = (status?: StaffAbsenceDTO['status']) =>
  apiFetch<StaffAbsenceDTO[]>(`/staff/absences${qs({ status })}`);

export const createAbsence = (body: {
  fromDate: string;
  toDate?: string;
  reason: StaffAbsenceReason;
  notes: string;
  documentName?: string;
  documentUrl?: string;
}) => apiFetch<StaffAbsenceDTO>('/staff/absences', { method: 'POST', body });

export const deleteAbsence = (absenceId: string) =>
  apiFetch<void>(`/staff/absences/${id(absenceId)}`, { method: 'DELETE' });

// ------------------------------------------------------------ comunicados
export const getNotices = () => apiFetch<NoticeDTO[]>('/records/notices');

export const markNoticeRead = (noticeId: string) =>
  apiFetch<{ noticeId: string; readAt: string }>(`/records/notices/${id(noticeId)}/read`, {
    method: 'POST',
  });

// --------------------------------------------------------- notificaciones
export const getNotifications = () => apiFetch<AppNotificationDTO[]>('/social/notifications');

/** Sin ids: marca todas como leídas. */
export const markNotificationsRead = (ids?: string[]) =>
  apiFetch<{ updated: number }>('/social/notifications/read', {
    method: 'POST',
    body: ids ? { ids } : {},
  });

// ----------------------------------------------------------------- perfil
export const getMyProfile = () => apiFetch<UserProfileDTO>('/social/profiles/me');

export const updateMyProfile = (body: { phone?: string | null; bio?: string | null }) =>
  apiFetch<{ ok: true }>('/social/profiles/me', { method: 'PUT', body });
