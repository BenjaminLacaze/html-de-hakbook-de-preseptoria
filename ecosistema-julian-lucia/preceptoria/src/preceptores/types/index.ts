/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Tipos de pantalla del Panel de Preceptores. Se arman desde la API
 * institucional en src/preceptores/api/mappers.ts.
 */

import { StudentCondition } from '../config/bedeliaRules';

/** justificado = ausente con justificación aprobada · sin_registrar = no hay registro. */
export type AttendanceStatus = 'presente' | 'tardanza' | 'ausente' | 'justificado' | 'sin_registrar';

/**
 * "Curso" (cohorte) no existe en la API: se deriva de las comisiones a cargo
 * como carrera + año + turno. La división es el código de cada comisión.
 */
export interface Course {
  id: string; // `${careerId}|${year}|${shift}`
  careerId: string;
  careerName: string;
  year: number;
  yearLabel: string; // "1° Año"
  shift: string; // "Turno Vespertino"
  division: string; // códigos de comisión
  fullLabel: string; // "2° Año · TS en Desarrollo de Software · Turno Vespertino"
}

/** Una materia del curso = una comisión de la API. */
export interface Subject {
  id: string; // commissionId
  subjectId: string;
  courseId: string;
  name: string;
  shortCode: string; // código de la comisión
  teacherName: string;
  scheduleDays: string;
  weekdays: number[]; // 1 = lunes … 6 = sábado
  studentCount: number;
}

/** Resumen calculado por el backend (GET /attendance/summary/bulk). */
export interface StudentSubjectStats {
  classesHeld: number;
  presents: number;
  tardies: number;
  absents: number;
  justified: number;
  attendanceRate: number;
  minimumRequired: number;
  remainingAbsencesAllowed: number;
  condition: StudentCondition;
  riskReason?: string;
}

export interface Student {
  id: string;
  userId: string | null;
  legajo: string;
  apellido: string;
  nombre: string;
  dni: string;
  email: string;
  telefono: string;
  careerId: string;
  /** Clave: commissionId (Subject.id). */
  subjects: Record<string, StudentSubjectStats>;
}

export interface AttendanceAuditLog {
  id: string;
  studentId: string;
  studentName: string;
  legajo: string;
  subjectName: string;
  date: string; // dd/MM/yyyy
  previousStatus: AttendanceStatus;
  newStatus: AttendanceStatus;
  reason: string;
  changedBy: string;
  timestamp: string; // dd/MM/yyyy HH:mm
}

export interface DailyClassSession {
  commissionId: string;
  courseId: string;
  subjectName: string;
  courseLabel: string;
  timeSlot: string;
  teacherName: string;
  status: 'cargada' | 'pendiente' | 'cargada_por_docente';
  teacherLoggedAt?: string;
  presentsCount?: number;
  totalStudents?: number;
}

export type CertificateType = 'medico' | 'laboral' | 'fuerza_mayor';

export interface JustificationRequest {
  id: string;
  studentId: string;
  studentName: string;
  legajo: string;
  /** null = todas las materias. */
  subjectId: string | null;
  subjectName: string;
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
  absenceDate: string; // dd/MM/yyyy (o rango)
  submittedAt: string; // ISO
  submittedAgo: string;
  reasonDeclared: string;
  certificateType: CertificateType | null;
  documentName?: string;
  documentUrl?: string;
  status: 'pendiente' | 'aprobada' | 'rechazada';
  reviewedAt?: string;
  rejectionReason?: string;
}

export type NoticeCategory = 'URGENT' | 'INSTITUTIONAL' | 'PEDAGOGICAL' | 'ACADEMIC';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: NoticeCategory;
  targetCareer: string;
  targetYear: string;
  createdAt: string; // dd/MM/yyyy HH:mm
  expiresAt?: string; // dd/MM/yyyy
  status: 'vigente' | 'vencido' | 'borrador';
}

export interface ChatMessage {
  id: string;
  senderRole: 'preceptor' | 'alumno';
  text: string;
  timestamp: string; // HH:mm
  dateGroup: string; // "Hoy", "Ayer", "28/10/2026"
  read: boolean;
}

/** Conversación por usuario (la API no tiene conversaciones por alumno). */
export interface Conversation {
  id: string; // userId de la otra persona
  studentId: string | null;
  studentName: string;
  legajo: string;
  courseLabel: string;
  unreadCount: number;
  lastMessageText: string;
  lastMessageTime: string;
  lastMessageAt: string; // ISO, para ordenar
  /** undefined = todavía no se cargó el hilo. */
  messages?: ChatMessage[];
}

export interface NotificationItem {
  id: string;
  type: 'justificacion' | 'mensaje' | 'riesgo' | 'foro' | 'anuncio' | 'general';
  title: string;
  description: string;
  timeAgo: string;
  isToday: boolean;
  isRead: boolean;
  targetScreen: string;
}

export interface ForumReply {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export type ForumChannelId = 'general' | 'consultas' | 'propuestas';

export interface ForumThread {
  id: string;
  channelId: ForumChannelId;
  title: string;
  body: string;
  authorName: string;
  createdAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
  locked: boolean;
  replyCount: number;
  /** undefined = todavía no se cargaron. */
  replies?: ForumReply[];
}

export interface StudentCenterEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  interestedCount: number;
  category: string;
  organizer: string;
}

export interface PreceptorProfile {
  userId: string;
  nombre: string;
  apellido: string;
  email: string;
  roles: string[];
  roleLabel: string;
  phone?: string;
  bio?: string;
  position?: string;
  availability: { dayOfWeek: number; startTime: string; endTime: string }[];
  carrerasAsignadas: string[];
}

export interface RuleSettings {
  minAttendancePercent: number;
  attendanceRiskThresholdPercent: number;
  lateArrivalAbsenceWeight: number;
  institutionName: string;
}
