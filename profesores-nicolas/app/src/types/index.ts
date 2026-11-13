/**
 * ISFDyT N.° 26 - Sistema de Gestión Académica (SGA)
 * Módulo Docente / Profesor
 * Definiciones locales de pantalla. El contrato de datos vive en `shared/types.ts`;
 * acá solo se traducen los códigos del backend a lo que muestran las vistas.
 */

import type { EventType } from '@shared/types';

export type Shift = 'Mañana' | 'Tarde' | 'Vespertino';

export type StudentStatus = 'REGULAR' | 'LIBRE' | 'PROMOCIONADO' | 'APROBADO' | 'CURSANDO';

export type AttendanceStatus = 'PRESENTE' | 'AUSENTE' | 'TARDE';

export interface Teacher {
  id: string;
  legajo: string;
  name: string;
  title: string;
  email: string;
  department: string;
  avatarUrl?: string;
}

export interface Career {
  id: string;
  name: string;
  code: string;
  degreeType: 'Profesorado' | 'Tecnicatura';
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  careerId: string;
  year: number; // 1° a 4° año
}

export interface Commission {
  id: string;
  code: string;
  name: string;
  subjectId: string;
  subjectName: string;
  careerName: string;
  academicYear: string;
  shift: Shift;
  schedule: string;
  classroom: string;
  teacherId: string;
  studentCount: number;
}

export interface Student {
  id: string;
  legajo: string;
  dni: string;
  lastName: string;
  firstName: string;
  email: string;
  commissionId: string;
  status: StudentStatus;
  enrollmentDate: string;
}

export interface ClassSession {
  id: string;
  commissionId: string;
  date: string; // YYYY-MM-DD
  topic?: string;
  isClosed: boolean;
  registeredCount: number;
}

export interface AttendanceRecord {
  id: string;
  classSessionId: string;
  studentId: string;
  status: AttendanceStatus;
  recordedAt: string;
  recordedByTeacherId: string;
  /** La justificación la carga y aprueba Preceptoría; el docente solo la consulta. */
  justified?: boolean;
  minutesLate?: number;
}

export interface AcademicObservation {
  id: string;
  commissionId: string;
  commissionName: string;
  studentId: string;
  studentName: string;
  studentLegajo: string;
  pedagogicalDate: string; // Fecha en que ocurrió el hecho pedagógico
  createdAt: string;       // Fecha y hora del registro en el SGA
  content: string;
  category: 'Seguimiento pedagógico' | 'Participación y desempeño' | 'Adecuación / Apoyo' | 'General';
  teacherId: string;
}

/**
 * Agenda: se muestra el calendario institucional (`/records/events`).
 * Lo carga Dirección; el docente solo lo consulta.
 */
export interface AgendaEvent {
  id: string;
  commissionId?: string;
  commissionName: string;
  title: string;
  description?: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  mandatory: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  body: string;
  createdAt: string;
  isRead: boolean;
}

export interface InstitutionalContact {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  category: 'Alumno' | 'Preceptor' | 'Directivo' | 'Docente';
}

/** Resumen de conversación que devuelve `/social/messages/conversations`. */
export interface ConversationSummary {
  contact: InstitutionalContact;
  lastMessage: ChatMessage;
  unreadCount: number;
}

/** Instancias que muestra la planilla del docente (se traducen al enum del backend). */
export type GradeEvaluation = 'PARCIAL_1' | 'PARCIAL_2' | 'RECUPERATORIO_1' | 'RECUPERATORIO_2' | 'FINAL';

/** Fila de nota ya traducida a la nomenclatura de la planilla. */
export interface GradeEntry {
  id: string;
  commissionId: string;
  studentId: string;
  type: GradeEvaluation;
  date: string;
  value: number | null;
  absent: boolean;
  published: boolean;
  publishedAt?: string;
  notes?: string;
}

export type ActiveScreen =
  | 'dashboard'
  | 'commissions'
  | 'students'
  | 'attendance'
  | 'grades'
  | 'observations'
  | 'agenda'
  | 'messages';
