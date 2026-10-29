/**
 * Tipos e interfaces del Módulo Alumno
 * Sistema de Asistencia Escolar
 * Responsable: Lucia Salgado - Tecnicatura en Desarrollo de Software
 */

export type AttendanceStatus = 'PRESENTE' | 'AUSENTE' | 'TARDE' | 'JUSTIFICADO';

export type AcademicPeriod = '1C' | '2C' | 'ANUAL';

export type EnrollmentStatus = 'REGULAR' | 'EN_RIESGO' | 'LIBRE';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // ISO formato YYYY-MM-DD
  time: string; // HH:mm
  status: AttendanceStatus;
  subjectName: string;
  academicPeriod: AcademicPeriod;
  observation?: string;
  justificationDocNumber?: string;
  preceptorNote?: string;
  registeredBy: string;
}

export interface StudentProfile {
  id: string;
  legajo: string;
  dni: string;
  firstName: string;
  lastName: string;
  email: string;
  career: string;
  institution: string;
  institutionShort: string;
  year: string;
  division: string;
  shift: string;
  academicYear: number;
  enrollmentStatus: 'ACTIVO' | 'EGRESADO' | 'INACTIVO' | 'BAJA';
  minimumAttendanceRequired: number; // e.g. 75 (%)
  minimumJustifiedAttendanceRequired: number; // e.g. 60 (%)
  preceptorContact: {
    name: string;
    email: string;
    office: string;
  };
}

export interface AttendanceStatistics {
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  justifiedCount: number;
  computableAttendanceUnits: number;
  computableTotalUnits: number;
  percentage: number;
  regularityStatus: EnrollmentStatus;
  remainingAbsencesAllowed: number;
}

export interface AttendanceFilters {
  period: 'ALL' | '1C' | '2C' | 'MONTH';
  selectedMonth?: number; // 0..11
  status: 'ALL' | AttendanceStatus;
  searchQuery: string;
  startDate?: string;
  endDate?: string;
}

export interface AccessibilitySettings {
  textSize: 'normal' | 'large' | 'xlarge';
  highContrast: boolean;
  darkMode: boolean;
}

export type NavView = 'comunicacion' | 'inicio' | 'asistencia' | 'perfil' | 'ayuda' | 'accesibilidad';
