/**
 * ISFDyT N.° 26 - Sistema de Gestión Académica (SGA)
 * Módulo Docente / Profesor
 * Definiciones de tipos e interfaces de datos institucionales
 */

export type Shift = 'Mañana' | 'Tarde' | 'Vespertino';

export type StudentStatus = 'REGULAR' | 'LIBRE' | 'PROMOCIONADO';

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

export type ActiveScreen = 'dashboard' | 'commissions' | 'students' | 'attendance' | 'observations';
