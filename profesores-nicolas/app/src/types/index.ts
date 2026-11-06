/**
 * ISFDyT N.° 26 - Sistema de Gestión Académica (SGA)
 * Módulo Docente / Profesor
 * Definiciones de tipos e interfaces de datos institucionales
 */

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

export type AgendaEventType = 'PARCIAL' | 'FINAL' | 'RECUPERATORIO' | 'ENTREGA_TP' | 'CLASE' | 'EVENTO';

export interface AgendaEvent {
  id: string;
  commissionId: string;
  commissionName: string;
  title: string;
  description: string;
  type: AgendaEventType;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  reminderDaysBefore: number;
  isCompleted: boolean;
}

export type MessageCategory = 'ACADEMICO' | 'INSTITUCIONAL' | 'DIRECTIVO';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  subject: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  category: MessageCategory;
}

export interface InstitutionalContact {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  category: 'Alumno' | 'Preceptor' | 'Directivo';
}

export type GradeEvaluationType = 'PARCIAL_1' | 'PARCIAL_2' | 'RECUPERATORIO_1' | 'RECUPERATORIO_2' | 'FINAL';

export interface StudentGradeSummary {
  student: Student;
  parcial1: { value: number | null; absent: boolean; published: boolean } | null;
  parcial2: { value: number | null; absent: boolean; published: boolean } | null;
  recuperatorio1: { value: number | null; absent: boolean; published: boolean } | null;
  recuperatorio2: { value: number | null; absent: boolean; published: boolean } | null;
  finalExam: { value: number | null; absent: boolean; published: boolean } | null;
  average: number | null;
  finalStatus: 'PROMOCIONADO' | 'REGULAR' | 'LIBRE' | 'CURSANDO';
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
