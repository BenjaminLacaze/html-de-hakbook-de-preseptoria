/**
 * Tipos de la API tal como los devuelve el backend.
 * Copia local de shared/types.ts (este panel no importa fuera de su carpeta):
 * si cambia el contrato, actualizar acá.
 */

export type Role =
  | 'SUPER_ADMIN'
  | 'DIRECTOR'
  | 'ADMINISTRATIVE'
  | 'PRECEPTOR'
  | 'TEACHER'
  | 'STUDENT'
  | 'STAFF'
  | 'STUDENT_REP';

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Superadministrador',
  DIRECTOR: 'Directivo',
  ADMINISTRATIVE: 'Administrativo',
  PRECEPTOR: 'Preceptor/a',
  TEACHER: 'Docente',
  STUDENT: 'Alumno/a',
  STAFF: 'Auxiliar',
  STUDENT_REP: 'Centro de Estudiantes',
};

export interface AuthMe {
  user: { id: string; email: string; firstName: string; lastName: string; roles: Role[] };
  studentId?: string | null;
  teacherId?: string | null;
  activeCycleId: string | null;
  mustChangePassword: boolean;
}

export type StaffTaskType = 'CLEANING' | 'MAINTENANCE' | 'ROUTINE';
export type StaffTaskStatus = 'PENDING' | 'DONE';
export type IncidentPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type InstallationStatus = 'OK' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
export type StaffShiftType = 'REGULAR' | 'SWAP' | 'OFF' | 'HOLIDAY';
export type ShiftChangeStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
export type JustificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type NoticeCategory = 'URGENT' | 'INSTITUTIONAL' | 'PEDAGOGICAL' | 'ACADEMIC';

export const STAFF_ABSENCE_REASONS = [
  'SICK_LEAVE',
  'FAMILY_CARE',
  'OFFICIAL_PROCEDURE',
  'FORCE_MAJEURE',
  'EXAM_TRAINING',
] as const;
export type StaffAbsenceReason = (typeof STAFF_ABSENCE_REASONS)[number];
export const STAFF_ABSENCE_REASON_LABELS: Record<StaffAbsenceReason, string> = {
  SICK_LEAVE: 'Licencia por enfermedad',
  FAMILY_CARE: 'Atención de familiar a cargo',
  OFFICIAL_PROCEDURE: 'Trámite judicial o bancario impostergable',
  FORCE_MAJEURE: 'Razones de fuerza mayor',
  EXAM_TRAINING: 'Examen o capacitación',
};

export const NOTICE_CATEGORY_LABELS: Record<NoticeCategory, string> = {
  URGENT: 'Urgente',
  INSTITUTIONAL: 'Institucional',
  PEDAGOGICAL: 'Pedagógico',
  ACADEMIC: 'Académico',
};

interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export interface Layout {
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
}

export interface StaffTaskDTO extends Timestamps {
  id: string;
  date: string;
  startTime: string;
  title: string;
  type: StaffTaskType;
  status: StaffTaskStatus;
  priority?: IncidentPriority;
  location: string;
  installationId?: string;
  details?: string;
  assignedToUserId?: string;
  completedAt?: string;
  completedBy?: string;
  completedByName?: string;
}

export interface InstallationDTO extends Timestamps {
  id: string;
  name: string;
  code?: string;
  floor?: string;
  status: InstallationStatus;
  layout: Layout | null;
  lastCleanedAt?: string;
  lastCleanedBy?: string;
  lastCleanedByName?: string;
  nextTask?: string;
  notes?: string;
}

export interface IncidentDTO extends Timestamps {
  id: string;
  description: string;
  priority: IncidentPriority;
  sector: string;
  installationId?: string;
  imageUrl?: string;
  notes?: string;
  status: IncidentStatus;
  reportedBy: string;
  reportedByName?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolvedByName?: string;
}

export interface MaintenanceLogDTO {
  id: string;
  date: string;
  task: string;
  responsible: string;
  installationId?: string;
  recordedBy: string;
  createdAt: string;
}

export interface StaffMemberDTO {
  id: string;
  firstName: string;
  lastName: string;
}

export interface StaffShiftDTO extends Timestamps {
  id: string;
  userId: string;
  /** "Apellido, Nombre" */
  userName: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: StaffShiftType;
  notes?: string;
}

export interface ShiftChangeRequestDTO extends Timestamps {
  id: string;
  requesterId: string;
  requesterName: string;
  colleagueId: string;
  colleagueName: string;
  requesterShift: StaffShiftDTO;
  colleagueShift: StaffShiftDTO;
  reason?: string;
  status: ShiftChangeStatus;
  respondedAt?: string;
  respondedBy?: string;
}

export interface StaffAbsenceDTO extends Timestamps {
  id: string;
  userId: string;
  userName: string;
  fromDate: string;
  toDate: string;
  reason: StaffAbsenceReason;
  notes: string;
  documentName?: string;
  documentUrl?: string;
  status: JustificationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface NoticeDTO extends Timestamps {
  id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  pinned: boolean;
  publishedAt?: string;
  expiresAt?: string;
  readAt?: string;
}

export interface AppNotificationDTO {
  id: string;
  type: string;
  text: string;
  details?: string;
  link?: string;
  readAt?: string;
  createdAt: string;
}

export interface UserProfileDTO {
  userId: string;
  bio?: string;
  phone?: string;
  avatarUrl?: string;
  updatedAt?: string;
}
