/**
 * @file apiContract.ts
 * @description Contrato formal de Backend / API REST para Perfil Directivo (ISFDyT N.° 26).
 * Define de manera unificada los endpoints, métodos, tipos de solicitud (Request),
 * respuestas exitosas (Response) y códigos de error normalizados.
 */

import {
  User,
  UserRole,
  UserStatus,
  Course,
  Student,
  AttendanceStatus,
  AttendanceRecord,
  GradeRecord,
  AcademicPeriod,
  ScheduleSlot,
  SchoolEvent,
  OfficialNotice,
  AuditLogEntry,
  InstitutionSettings,
} from '../types';

// ==========================================
// 1. ENVOLTORIOS ESTÁNDAR DE RESPUESTA
// ==========================================

export interface ApiResponse<T> {
  success: true;
  data: T;
  timestamp: string;
  version: 'v1';
}

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'RESOURCE_NOT_FOUND'
  | 'SCHEDULE_CONFLICT'
  | 'DUPLICATE_ENTRY'
  | 'CYCLE_LOCKED'
  | 'INTERNAL_SERVER_ERROR';

export interface ApiErrorResponse {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: string[];
    field?: string;
  };
  timestamp: string;
  version: 'v1';
}

// ==========================================
// 2. CONTRATOS POR MÓDULO
// ==========================================

// --- MÓDULO 1: USUARIOS Y PERMISOS ---
export interface GetUsersQuery {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  dni: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  assignedCourses?: string[];
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  dni?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  assignedCourses?: string[];
}

// --- MÓDULO 2: CURSOS Y DIVISIONES ---
export interface GetCoursesQuery {
  cycleId?: '2026' | '2025';
  yearLevel?: number;
}

export interface CreateCourseRequest {
  cycleId: '2026' | '2025';
  yearLevel: number;
  division: string;
  shift: 'MAÑANA' | 'TARDE' | 'VESPERTINO';
  orientation: string;
  classroom: string;
  capacity: number;
  preceptorId: string;
}

export interface UpdateCourseRequest {
  yearLevel?: number;
  division?: string;
  shift?: 'MAÑANA' | 'TARDE' | 'VESPERTINO';
  orientation?: string;
  classroom?: string;
  capacity?: number;
  preceptorId?: string;
}

// --- MÓDULO 3: ESTUDIANTES Y MATRÍCULA ---
export interface GetStudentsQuery {
  courseId?: string;
  cycleId?: '2026' | '2025';
  status?: Student['status'];
  search?: string;
}

export interface CreateStudentRequest {
  dni: string;
  lastName: string;
  firstName: string;
  birthDate: string;
  courseId: string;
  cycleId: '2026' | '2025';
  tutorName: string;
  tutorPhone: string;
  tutorEmail?: string;
  address: string;
  healthAlert?: string;
  status?: Student['status'];
}

export interface UpdateStudentRequest {
  lastName?: string;
  firstName?: string;
  dni?: string;
  birthDate?: string;
  courseId?: string;
  tutorName?: string;
  tutorPhone?: string;
  tutorEmail?: string;
  address?: string;
  healthAlert?: string;
  status?: Student['status'];
}

// --- MÓDULO 4: ASISTENCIA ESCOLAR ---
export interface SaveBatchAttendanceRequest {
  cycleId: '2026' | '2025';
  courseId: string;
  date: string; // YYYY-MM-DD
  records: Array<{
    studentId: string;
    status: AttendanceStatus;
    notes?: string;
  }>;
}

export interface SaveBatchAttendanceResponse {
  courseId: string;
  date: string;
  processedCount: number;
  presentes: number;
  ausentesInjustificados: number;
  ausentesJustificados: number;
  tardanzas: number;
  recordedByUserId: string;
  updatedAt: string;
}

export interface StudentAttendanceSummaryResponse {
  studentId: string;
  cycleId: string;
  totalRecords: number;
  presentes: number;
  ausentesInjustificados: number;
  ausentesJustificados: number;
  tardanzas: number;
  percentAttendance: number;
  isAtRisk: boolean;
}

// --- MÓDULO 5: SEGUIMIENTO ACADÉMICO ---
export interface SaveGradeRequest {
  cycleId: '2026' | '2025';
  period: AcademicPeriod;
  studentId: string;
  courseId: string;
  subjectId: string;
  score: number; // 1 a 10
  teacherNotes?: string;
}

export interface StudentReportCardResponse {
  student: Student;
  course: Course;
  cycleId: string;
  subjects: Array<{
    subjectId: string;
    code: string;
    name: string;
    grades: Partial<Record<AcademicPeriod, number>>;
    finalAverage: number | null;
    isApproved: boolean;
  }>;
}

// --- MÓDULO 6: ORGANIZACIÓN Y HORARIOS ---
export interface CreateScheduleSlotRequest {
  cycleId: '2026' | '2025';
  courseId: string;
  dayOfWeek: 1 | 2 | 3 | 4 | 5;
  module: number;
  startTime: string;
  endTime: string;
  subjectId: string;
  teacherId: string;
  classroom: string;
}

export interface CreateEventRequest {
  cycleId: '2026' | '2025';
  date: string;
  title: string;
  type: SchoolEvent['type'];
  description: string;
  isMandatory: boolean;
}

// --- MÓDULO 7: CIRCULARES Y COMUNICADOS ---
export interface CreateNoticeRequest {
  cycleId: '2026' | '2025';
  title: string;
  content: string;
  category: OfficialNotice['category'];
  recipients: OfficialNotice['recipients'];
  status: OfficialNotice['status'];
  isPinned: boolean;
}

// --- MÓDULO 8: INFORMES Y ESTADÍSTICAS ---
export interface AttendanceReportResponse {
  cycleId: string;
  courses: Array<{
    courseId: string;
    courseName: string;
    shift: string;
    studentCount: number;
    totalRecords: number;
    presentes: number;
    ausentesInjustificados: number;
    attendanceRate: number;
  }>;
  globalRate: number;
  generatedAt: string;
}

// --- MÓDULO 9: AUDITORÍA ---
export interface GetAuditLogsQuery {
  module?: string;
  action?: AuditLogEntry['action'];
  userId?: string;
  limit?: number;
}

// --- MÓDULO 10: CONFIGURACIÓN INSTITUCIONAL ---
export type UpdateInstitutionSettingsRequest = Partial<InstitutionSettings>;
