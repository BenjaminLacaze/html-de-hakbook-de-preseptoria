/**
 * Tipos oficiales para la API del Panel de Familias — ISFDyT N° 26
 * Todos los endpoints cuelgan de /api/v1
 */

export type UserRole = 'GUARDIAN' | 'STUDENT' | 'TEACHER' | 'PRECEPTOR' | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
  role: UserRole;
  mustChangePassword?: boolean;
}

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  courseName: string;
  year: string;
  shift: string; // 'Mañana' | 'Tarde' | 'Vespertino'
  photoUrl?: string;
  relationship: string; // 'Madre' | 'Padre' | 'Tutor/a Legal'
}

export type AttendanceRisk = 'OK' | 'AT_RISK' | 'BELOW_MINIMUM';

export interface AttendanceSummary {
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  justifiedAbsenceCount: number;
  percentage: number; // Porcentaje calculado por el servidor
  minimumRequired: number; // Ej: 80 para materias regulares
  risk: AttendanceRisk;
  remainingAbsencesAllowed: number;
  ruleExplanation?: string; // Texto oficial institucional del servidor
}

export type AttendanceState = 'PRESENT' | 'ABSENT' | 'LATE' | 'JUSTIFIED_ABSENT';

export interface AttendanceRecord {
  id: string;
  date: string; // AAAA-MM-DD
  time?: string; // HH:mm
  subjectId: string;
  subjectName: string;
  state: AttendanceState;
  justified: boolean;
  notes?: string;
}

export interface GradeItem {
  id: string;
  subjectId: string;
  subjectName: string;
  instance: string; // Ej: "1° Cuatrimestre", "Parcial N° 1", "Recuperatorio", "Trabajo Práctico N° 1"
  date: string; // AAAA-MM-DD
  numericGrade?: number | null; // null si no está publicada
  isPublished: boolean;
  status: 'PUBLISHED' | 'PENDING';
  teacherNotes?: string;
}

export interface SubjectGrades {
  subjectId: string;
  subjectName: string;
  teacherName: string;
  items: GradeItem[];
  finalCondition?: string; // Ej: "En curso", "Aprobada", etc., solo si lo da el servidor
}

export type EventCategory = 'EXAM' | 'SPECIAL_CLASS' | 'COMMEMORATIVE_ACT' | 'HOLIDAY' | 'FIELD_TRIP';

export interface AgendaEvent {
  id: string;
  childId?: string;
  childName?: string;
  title: string;
  category: EventCategory;
  date: string; // AAAA-MM-DD
  startTime: string; // HH:mm
  endTime?: string; // HH:mm
  location: string;
  description: string;
  subjectName?: string;
}

export interface Notice {
  id: string;
  title: string;
  date: string; // AAAA-MM-DD
  time: string; // HH:mm
  author: string; // Ej: "Equipo Directivo", "Preceptoría Turno Vespertino"
  content: string;
  isUrgent: boolean;
  targetCourses?: string[];
  readByGuardian: boolean;
  readAt?: string; // ISO string o dd/MM/yyyy HH:mm
}

export type DocumentType = 'MEDICAL' | 'WORK' | 'FORCE_MAJEURE';
export type JustificationStatus = 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export interface Justification {
  id: string;
  childId: string;
  childName: string;
  submissionDate: string; // AAAA-MM-DD HH:mm
  fromDate: string; // AAAA-MM-DD
  toDate: string; // AAAA-MM-DD
  reason: string;
  documentType: DocumentType;
  documentName: string;
  status: JustificationStatus;
  reviewedAt?: string;
  rejectionReason?: string;
}

export type AuthorizationType = 'FIELD_TRIP' | 'TRAVEL' | 'IMAGE_USE' | 'EARLY_DISMISSAL';
export type AuthorizationResponse = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Authorization {
  id: string;
  childId: string;
  childName: string;
  title: string;
  type: AuthorizationType;
  description: string;
  deadlineDate: string; // AAAA-MM-DD
  destination?: string;
  dateOfEvent?: string; // AAAA-MM-DD
  response: AuthorizationResponse;
  respondedAt?: string; // AAAA-MM-DD HH:mm
  responsiblePersonName?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientId: string;
  sentAt: string; // AAAA-MM-DD HH:mm
  content: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: string; // Ej: "Preceptoría Turno Tarde", "Prof. Mariano Soria (Tutor)"
  childName?: string;
  unreadCount: number;
  lastMessage?: {
    content: string;
    sentAt: string;
  };
}

export interface GuardianProfile {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  phone: string;
  address: string;
  occupation?: string;
  children: {
    childId: string;
    fullName: string;
    courseName: string;
    relationship: string;
  }[];
}

export interface CorrectionRequest {
  id: string;
  date: string;
  requestedFields: {
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
  };
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface ApiError {
  error: {
    code: 'VALIDATION_ERROR' | 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'TOO_MANY_ATTEMPTS' | 'INTERNAL_ERROR';
    message: string;
    details?: string;
    traceId?: string;
  };
}
