/**
 * Tipos de la API institucional. Copia local (sin importar entre apps) de lo que
 * usa Preceptoría de shared/types.ts. Si cambia el contrato, actualizar acá.
 */

export type ID = string;
export type ISODate = string; // YYYY-MM-DD
export type ISODateTime = string;

export type ApiRole =
  | 'SUPER_ADMIN'
  | 'DIRECTOR'
  | 'ADMINISTRATIVE'
  | 'PRECEPTOR'
  | 'TEACHER'
  | 'STUDENT'
  | 'STUDENT_REP'
  | 'AUXILIARY'
  | string;

export interface ApiAuthMe {
  user: { id: ID; email: string; firstName: string; lastName: string; roles: ApiRole[] };
  studentId?: ID | null;
  teacherId?: ID | null;
  activeCycleId: ID | null;
  mustChangePassword: boolean;
}

export type ApiShift = 'MORNING' | 'AFTERNOON' | 'EVENING';
export type ApiAttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';
export type ApiAttendanceSource = 'TEACHER' | 'PRECEPTOR' | 'QR' | 'IMPORT';
export type ApiAttendanceRisk = 'OK' | 'AT_RISK' | 'BELOW_MINIMUM';
export type ApiJustificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ApiJustificationDocumentType = 'MEDICAL' | 'WORK' | 'FORCE_MAJEURE';
export type ApiNoticeCategory = 'URGENT' | 'INSTITUTIONAL' | 'PEDAGOGICAL' | 'ACADEMIC';
export type ApiNoticeStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | string;
export type ApiForumChannel = 'GENERAL' | 'QUESTIONS' | 'PROPOSALS';
export type ApiForumThreadStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';

export interface ApiScheduleSlot {
  /** 1 = lunes … 6 = sábado. */
  weekday: number;
  startTime: string;
  endTime: string;
  classroom?: string;
}

/** GET /structure/commissions */
export interface ApiCommissionView {
  id: ID;
  code: string;
  cycleId: ID;
  subjectId: ID;
  period: string;
  shift: ApiShift;
  teacherIds: ID[];
  preceptorUserId?: ID;
  schedule: ApiScheduleSlot[];
  capacity?: number;
  subjectName: string;
  subjectYear: number;
  careerId: ID;
  careerName: string;
  teacherNames: string[];
  studentCount: number;
}

export interface ApiStudentView {
  id: ID;
  userId: ID | null;
  fileNumber: string;
  dni: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  careerId: ID;
  planId: ID;
  admissionDate: ISODate;
  status: string;
  careerCode: string;
  years: number[];
}

/** GET /academic/scope */
export interface ApiPreceptorScope {
  careers: { id: ID; code: string; name: string }[];
  years: { careerId: ID; years: number[] }[];
  subjects: { id: ID; name: string; code: string; year: number; careerId: ID; careerCode: string }[];
  students: ApiStudentView[];
}

/** GET /attendance/summary/bulk — lo calcula el backend con InstitutionSettings. */
export interface ApiAttendanceSummary {
  studentId: ID;
  commissionId?: ID;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  justifiedAbsenceCount: number;
  percentage: number;
  minimumRequired: number;
  risk: ApiAttendanceRisk;
  remainingAbsencesAllowed: number;
}

/** GET /attendance */
export interface ApiAttendanceRecordView {
  id: ID;
  sessionId: ID;
  studentId: ID;
  status: ApiAttendanceStatus;
  minutesLate?: number;
  notes?: string;
  source: ApiAttendanceSource;
  recordedBy: ID;
  recordedAt: ISODateTime;
  justified: boolean;
  date: ISODate;
  commissionId: ID;
  subjectId: ID;
  subjectName: string;
  studentName: string;
  studentFileNumber: string;
  justificationId?: ID;
  justificationStatus?: ApiJustificationStatus;
}

/** GET /attendance/audit */
export interface ApiAttendanceChange {
  id: ID;
  at: ISODateTime;
  userName: string;
  studentId: ID;
  studentName: string;
  date: ISODate;
  subjectName: string;
  previousStatus: ApiAttendanceStatus;
  newStatus: ApiAttendanceStatus;
  notes?: string;
}

/** GET /attendance/justifications */
export interface ApiJustificationView {
  id: ID;
  studentId: ID;
  fromDate: ISODate;
  toDate: ISODate;
  reason: string;
  subjectId?: ID;
  subjectName?: string;
  documentType?: ApiJustificationDocumentType;
  documentName?: string;
  documentUrl?: string;
  status: ApiJustificationStatus;
  createdBy: ID;
  reviewedBy?: ID;
  reviewedAt?: ISODateTime;
  reviewNotes?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  studentName: string;
  studentFileNumber: string;
}

export interface ApiSaveBySubjectRequest {
  subjectId: ID;
  date: ISODate;
  records: { studentId: ID; status: ApiAttendanceStatus; minutesLate?: number; notes?: string }[];
}

export interface ApiCreateJustificationRequest {
  studentId: ID;
  fromDate: ISODate;
  toDate: ISODate;
  reason: string;
  subjectId?: ID;
  documentType?: ApiJustificationDocumentType;
  documentName?: string;
  documentUrl?: string;
}

export interface ApiClassSession {
  id: ID;
  commissionId: ID;
  date: ISODate;
  topic?: string | null;
  status: string;
}

export interface ApiQrCodeIssued {
  id: ID;
  sessionId: ID;
  code: string;
  expiresAt: ISODateTime;
}

export interface ApiStudentSensitiveData {
  studentId: ID;
  birthDate?: ISODate;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactEmail?: string;
  healthNotes?: string;
}

/** GET /records/settings */
export interface ApiInstitutionSettings {
  name: string;
  shortName: string;
  cue?: string;
  city: string;
  district: string;
  timezone: string;
  minAttendancePercent: number;
  lateArrivalAbsenceWeight: number;
  attendanceRiskThresholdPercent: number;
}

export interface ApiNoticeAudience {
  roles?: ApiRole[];
  careerIds?: ID[];
  years?: number[];
  commissionIds?: ID[];
}

/** GET /records/notices */
export interface ApiNotice {
  id: ID;
  cycleId: ID;
  title: string;
  content: string;
  category: ApiNoticeCategory;
  audience: ApiNoticeAudience;
  status: ApiNoticeStatus;
  pinned: boolean;
  publishedAt?: ISODateTime;
  expiresAt?: ISODateTime;
  createdBy: ID;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  readAt?: ISODateTime;
}

export interface ApiCreateNoticeRequest {
  title: string;
  content: string;
  category: ApiNoticeCategory;
  audience: ApiNoticeAudience;
  publish: boolean;
  expiresAt?: ISODateTime;
}

export interface ApiDirectoryEntry {
  id: ID;
  firstName: string;
  lastName: string;
  roles: ApiRole[];
  avatarUrl?: string;
  position?: string;
}

export interface ApiPrivateMessage {
  id: ID;
  senderId: ID;
  receiverId: ID;
  text: string;
  readAt?: ISODateTime;
  createdAt: ISODateTime;
}

/** GET /social/messages/conversations */
export interface ApiConversation {
  with: ApiDirectoryEntry;
  lastMessage: ApiPrivateMessage;
  unreadCount: number;
}

/** GET /social/forum */
export interface ApiForumThread {
  id: ID;
  authorId: ID;
  authorName: string;
  title: string;
  content: string;
  channel: ApiForumChannel;
  careerId?: ID;
  year?: number;
  commissionId?: ID;
  status: ApiForumThreadStatus;
  rejectionReason?: string;
  locked: boolean;
  replyCount: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface ApiForumReply {
  id: ID;
  threadId: ID;
  authorId: ID;
  authorName: string;
  content: string;
  createdAt: ISODateTime;
}

/** GET /social/notifications */
export interface ApiNotification {
  id: ID;
  type: string;
  text: string;
  details?: string;
  link?: string;
  readAt?: ISODateTime;
  createdAt: ISODateTime;
}

/** GET /social/profiles/me */
export interface ApiUserProfile {
  userId: ID;
  bio?: string;
  phone?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  accentColor?: string;
  position?: string;
  links: { id: string; url: string; label: string }[];
  availability: { id: string; dayOfWeek: number; startTime: string; endTime: string }[];
  updatedAt?: ISODateTime;
}

/** GET /centro/events (solo lectura para Preceptoría) */
export interface ApiRepEvent {
  id: ID;
  title: string;
  date: ISODate;
  time?: string;
  endTime?: string;
  location?: string;
  description: string;
  type: 'ACADEMIC' | 'CULTURAL' | 'SPORTS' | 'MEETING' | string;
  organizer: string;
  capacity?: number;
  coverUrl?: string;
  createdBy: ID;
  participantCount: number;
  joined: boolean;
}
