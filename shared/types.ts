/**
 * Modelo de datos unificado — Sistema de Gestión ISFDyT N.° 26
 *
 * Fuente única de tipos para las 4 apps y el backend (Etapa 0 de
 * docs/AJUSTES_INTEGRACION_BACKEND.md).
 *
 * Decisiones aprobadas (2026-10-23):
 *   - Modelo académico TERCIARIO: carrera → plan → materia → comisión.
 *   - Los dos portales de Alumno (Julián y Lucía) usan esta misma API.
 *   - API en inglés: nombres de campos Y códigos de catálogo en inglés.
 *     Los textos en español para mostrar están en los *_LABELS de cada catálogo.
 *   - Base de datos PostgreSQL.
 *
 * Reglas de este archivo:
 *   - Sin `enum` ni `namespace`: se usan uniones de texto + arrays `as const`.
 *     (La app de Profesores compila con `erasableSyntaxOnly`.)
 *   - Los campos marcados "lo completa el backend" NO se envían desde las apps.
 *   - Cuando el backend publique su OpenAPI, este archivo se genera desde ahí.
 *
 * Cómo pasar de los valores viejos de cada app a estos: ver shared/README.md.
 */

// ============================================================================
// Tipos base
// ============================================================================

/** Identificador generado por el backend (UUID). El legajo y el DNI no son IDs. */
export type ID = string;

/** Fecha civil: "YYYY-MM-DD". */
export type ISODate = string;

/** Fecha y hora ISO 8601 con zona, ej. "2026-10-23T14:30:00-03:00". */
export type ISODateTime = string;

/** Hora del día: "HH:mm" (24 h). */
export type TimeOfDay = string;

/** Zona horaria institucional. */
export const INSTITUTION_TIMEZONE = 'America/Argentina/Buenos_Aires';

// ============================================================================
// Catálogos
// ============================================================================

/** Roles del sistema. Un usuario puede tener más de uno (ej. PROFESOR y PRECEPTOR). */
export const ROLES = [
  'SUPER_ADMIN',
  'DIRECTOR',
  'ADMINISTRATIVE',
  'PRECEPTOR',
  'TEACHER',
  'STUDENT',
] as const;
export type Role = (typeof ROLES)[number];
export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Superadministrador',
  DIRECTOR: 'Directivo',
  ADMINISTRATIVE: 'Administrativo / Secretaría',
  PRECEPTOR: 'Preceptor/a',
  TEACHER: 'Profesor/a',
  STUDENT: 'Alumno/a',
};

export const USER_STATUSES = ['ACTIVE', 'INACTIVE'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];
export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
};

/** Turno de cursada. */
export const SHIFTS = ['MORNING', 'AFTERNOON', 'EVENING'] as const;
export type Shift = (typeof SHIFTS)[number];
export const SHIFT_LABELS: Record<Shift, string> = {
  MORNING: 'Mañana',
  AFTERNOON: 'Tarde',
  EVENING: 'Vespertino',
};

/** Período de dictado de una materia o comisión. */
export const ACADEMIC_PERIODS = ['FIRST_TERM', 'SECOND_TERM', 'ANNUAL'] as const;
export type AcademicPeriod = (typeof ACADEMIC_PERIODS)[number];
export const ACADEMIC_PERIOD_LABELS: Record<AcademicPeriod, string> = {
  FIRST_TERM: '1.er cuatrimestre',
  SECOND_TERM: '2.º cuatrimestre',
  ANNUAL: 'Anual',
};

export const CYCLE_STATUSES = ['PLANNED', 'ACTIVE', 'CLOSED'] as const;
export type CycleStatus = (typeof CYCLE_STATUSES)[number];
export const CYCLE_STATUS_LABELS: Record<CycleStatus, string> = {
  PLANNED: 'Planificado',
  ACTIVE: 'Vigente',
  CLOSED: 'Cerrado',
};

/** Situación del alumno en la INSTITUCIÓN (no en una materia). */
export const STUDENT_STATUSES = ['ACTIVE', 'INACTIVE', 'GRADUATED', 'WITHDRAWN'] as const;
export type StudentStatus = (typeof STUDENT_STATUSES)[number];
export const STUDENT_STATUS_LABELS: Record<StudentStatus, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Pasivo',
  GRADUATED: 'Egresado',
  WITHDRAWN: 'Baja',
};

export const TEACHER_STATUSES = ['ACTIVE', 'ON_LEAVE', 'INACTIVE'] as const;
export type TeacherStatus = (typeof TEACHER_STATUSES)[number];
export const TEACHER_STATUS_LABELS: Record<TeacherStatus, string> = {
  ACTIVE: 'En funciones',
  ON_LEAVE: 'Con licencia',
  INACTIVE: 'Inactivo',
};

/** Condición del alumno EN UNA COMISIÓN (materia). */
export const ENROLLMENT_CONDITIONS = [
  'IN_PROGRESS', // cursando
  'REGULAR',
  'FREE', // libre
  'PROMOTED', // promocionado
  'PASSED', // aprobó el final
  'DROPPED', // abandonó / se dio de baja de la materia
] as const;
export type EnrollmentCondition = (typeof ENROLLMENT_CONDITIONS)[number];
export const ENROLLMENT_CONDITION_LABELS: Record<EnrollmentCondition, string> = {
  IN_PROGRESS: 'Cursando',
  REGULAR: 'Regular',
  FREE: 'Libre',
  PROMOTED: 'Promocionado',
  PASSED: 'Aprobado',
  DROPPED: 'Baja',
};

/**
 * Estado de asistencia en una clase. La justificación NO es un estado:
 * es un dato aparte (ver `Justification`) y se refleja en `AttendanceRecord.justified`.
 */
export const ATTENDANCE_STATUSES = ['PRESENT', 'ABSENT', 'LATE'] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];
export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  PRESENT: 'Presente',
  ABSENT: 'Ausente',
  LATE: 'Llegada tarde',
};

/** Cómo se registró la asistencia. */
export const ATTENDANCE_SOURCES = ['TEACHER', 'PRECEPTOR', 'QR', 'IMPORT'] as const;
export type AttendanceSource = (typeof ATTENDANCE_SOURCES)[number];
export const ATTENDANCE_SOURCE_LABELS: Record<AttendanceSource, string> = {
  TEACHER: 'Docente',
  PRECEPTOR: 'Preceptoría',
  QR: 'QR en el aula',
  IMPORT: 'Planilla importada',
};

/** Riesgo por asistencia: lo calcula el backend, no se guarda ni se calcula en las apps. */
export const ATTENDANCE_RISKS = ['OK', 'AT_RISK', 'BELOW_MINIMUM'] as const;
export type AttendanceRisk = (typeof ATTENDANCE_RISKS)[number];
export const ATTENDANCE_RISK_LABELS: Record<AttendanceRisk, string> = {
  OK: 'Al día',
  AT_RISK: 'En riesgo',
  BELOW_MINIMUM: 'Por debajo del mínimo',
};

/** Planilla de asistencia de una clase. */
export const SESSION_STATUSES = ['OPEN', 'CLOSED'] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];
export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  OPEN: 'Abierta',
  CLOSED: 'Cerrada',
};

export const JUSTIFICATION_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;
export type JustificationStatus = (typeof JUSTIFICATION_STATUSES)[number];
export const JUSTIFICATION_STATUS_LABELS: Record<JustificationStatus, string> = {
  PENDING: 'En revisión',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
};

export const ASSESSMENT_TYPES = [
  'PARTIAL', // parcial
  'MAKEUP', // recuperatorio
  'ASSIGNMENT', // trabajo práctico
  'COLLOQUIUM', // coloquio
  'FINAL_EXAM', // examen final
] as const;
export type AssessmentType = (typeof ASSESSMENT_TYPES)[number];
export const ASSESSMENT_TYPE_LABELS: Record<AssessmentType, string> = {
  PARTIAL: 'Parcial',
  MAKEUP: 'Recuperatorio',
  ASSIGNMENT: 'Trabajo práctico',
  COLLOQUIUM: 'Coloquio',
  FINAL_EXAM: 'Examen final',
};

export const OBSERVATION_CATEGORIES = [
  'PEDAGOGICAL_FOLLOW_UP',
  'PARTICIPATION',
  'SUPPORT_ADJUSTMENT',
  'GENERAL',
] as const;
export type ObservationCategory = (typeof OBSERVATION_CATEGORIES)[number];
export const OBSERVATION_CATEGORY_LABELS: Record<ObservationCategory, string> = {
  PEDAGOGICAL_FOLLOW_UP: 'Seguimiento pedagógico',
  PARTICIPATION: 'Participación y desempeño',
  SUPPORT_ADJUSTMENT: 'Adecuación / Apoyo',
  GENERAL: 'General',
};

export const NOTICE_STATUSES = ['DRAFT', 'PUBLISHED', 'EXPIRED', 'ARCHIVED'] as const;
export type NoticeStatus = (typeof NOTICE_STATUSES)[number];
export const NOTICE_STATUS_LABELS: Record<NoticeStatus, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  EXPIRED: 'Vencido',
  ARCHIVED: 'Archivado',
};

export const NOTICE_CATEGORIES = ['URGENT', 'INSTITUTIONAL', 'PEDAGOGICAL', 'ACADEMIC'] as const;
export type NoticeCategory = (typeof NOTICE_CATEGORIES)[number];
export const NOTICE_CATEGORY_LABELS: Record<NoticeCategory, string> = {
  URGENT: 'Urgente',
  INSTITUTIONAL: 'Institucional',
  PEDAGOGICAL: 'Pedagógico',
  ACADEMIC: 'Académico',
};

export const EVENT_TYPES = [
  'INSTITUTIONAL_DAY', // jornada institucional
  'CEREMONY', // acto
  'EXAM_PERIOD', // mesa de examen
  'GRADES_DEADLINE', // cierre de notas
  'HOLIDAY', // feriado / asueto
  'CLASS', // clase o evento de una comisión
  'OTHER',
] as const;
export type EventType = (typeof EVENT_TYPES)[number];
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  INSTITUTIONAL_DAY: 'Jornada institucional',
  CEREMONY: 'Acto',
  EXAM_PERIOD: 'Mesa de examen',
  GRADES_DEADLINE: 'Cierre de notas',
  HOLIDAY: 'Feriado / asueto',
  CLASS: 'Clase',
  OTHER: 'Otro',
};

export const AUDIT_ACTIONS = [
  'CREATE',
  'UPDATE',
  'STATUS_CHANGE',
  'DELETE',
  'SETTINGS_CHANGE',
  'EXPORT',
  'LOGIN',
  'SESSION_REOPEN',
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];
export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  CREATE: 'Creación',
  UPDATE: 'Modificación',
  STATUS_CHANGE: 'Cambio de estado',
  DELETE: 'Eliminación',
  SETTINGS_CHANGE: 'Configuración',
  EXPORT: 'Exportación',
  LOGIN: 'Ingreso',
  SESSION_REOPEN: 'Reapertura de planilla',
};

// ============================================================================
// Campos de auditoría comunes (los completa el backend)
// ============================================================================

export interface Timestamps {
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

/** Quién y cuándo. Lo completa el backend desde la sesión; las apps no lo envían. */
export interface RecordedBy {
  recordedBy: ID; // User.id
  recordedAt: ISODateTime;
}

// ============================================================================
// Identidad y acceso
// ============================================================================

export interface User extends Timestamps {
  id: ID;
  email: string; // institucional; es el usuario de ingreso
  firstName: string;
  lastName: string;
  roles: Role[];
  status: UserStatus;
  lastLoginAt?: ISODateTime;
}

/** Respuesta de GET /auth/me. Lo mínimo para armar la sesión en cualquier app. */
export interface AuthMe {
  user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'roles'>;
  /** Presente si el usuario es alumno. */
  studentId?: ID;
  /** Presente si el usuario es docente. */
  teacherId?: ID;
  /** Ciclo lectivo vigente, para no tener que pedirlo aparte. */
  activeCycleId: ID;
}

// ============================================================================
// Estructura académica (modelo terciario)
// ============================================================================

export interface Career extends Timestamps {
  id: ID;
  code: string; // ej. "TSDS"
  name: string; // ej. "Tecnicatura Superior en Desarrollo de Software"
  durationYears: number;
  active: boolean;
}

export interface StudyPlan extends Timestamps {
  id: ID;
  careerId: ID;
  code: string; // ej. "TSDS-2022"
  name: string;
  startYear: number;
  active: boolean;
}

export interface Subject extends Timestamps {
  id: ID;
  planId: ID;
  code: string;
  name: string;
  /** Año de la carrera: 1 a 4. */
  year: number;
  period: AcademicPeriod;
  weeklyHours?: number;
  /** Materias que hay que tener aprobadas/regulares antes (correlativas). */
  prerequisiteSubjectIds: ID[];
}

export interface AcademicCycle extends Timestamps {
  id: ID;
  year: number; // 2026
  status: CycleStatus;
  startDate: ISODate;
  endDate: ISODate;
  firstTermEndDate?: ISODate;
}

/** Bloque horario de una comisión. */
export interface ScheduleSlot {
  /** 1 = lunes … 6 = sábado. */
  weekday: 1 | 2 | 3 | 4 | 5 | 6;
  startTime: TimeOfDay;
  endTime: TimeOfDay;
  classroom?: string;
}

/**
 * Comisión: unidad real de cursada (materia + ciclo + turno + docentes).
 * Reemplaza a `Course` (año/división) de Directivos y a `Commission` de Profesores.
 */
export interface Commission extends Timestamps {
  id: ID;
  code: string; // ej. "TSDS-1A-PROG1"
  cycleId: ID;
  subjectId: ID;
  period: AcademicPeriod;
  shift: Shift;
  /** Docentes a cargo; el primero es el titular. */
  teacherIds: ID[];
  /** Preceptor/a asignado/a. */
  preceptorUserId?: ID;
  schedule: ScheduleSlot[];
  capacity?: number;
}

/**
 * Comisión con datos para mostrar. La arma el backend en las consultas:
 * las apps NO deben editar ni copiar estos nombres.
 */
export interface CommissionView extends Commission {
  subjectName: string;
  subjectYear: number;
  careerId: ID;
  careerName: string;
  teacherNames: string[];
  studentCount: number;
}

// ============================================================================
// Personas
// ============================================================================

export interface Student extends Timestamps {
  id: ID;
  /** Cuenta de usuario asociada; null si todavía no tiene acceso. */
  userId: ID | null;
  fileNumber: string; // legajo
  dni: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  careerId: ID;
  planId: ID;
  admissionDate: ISODate; // fecha de inscripción a la carrera
  status: StudentStatus;
}

/**
 * Datos personales sensibles (Ley 25.326). Van en un endpoint aparte, solo para
 * roles autorizados. Nunca se incluyen en listados ni en el portal de otro alumno.
 */
export interface StudentSensitiveData {
  studentId: ID;
  birthDate?: ISODate;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactEmail?: string;
  /** Alerta de salud relevante para la cursada. Acceso muy restringido. */
  healthNotes?: string;
}

export interface Teacher extends Timestamps {
  id: ID;
  userId: ID | null;
  fileNumber: string; // legajo docente
  dni: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title?: string; // ej. "Prof. Lic."
  status: TeacherStatus;
}

// ============================================================================
// Inscripción a comisiones
// ============================================================================

export interface Enrollment extends Timestamps {
  id: ID;
  studentId: ID;
  commissionId: ID;
  condition: EnrollmentCondition;
  enrolledAt: ISODate;
  conditionChangedAt?: ISODateTime;
}

// ============================================================================
// Asistencia
// ============================================================================

/** Una clase de una comisión. Sobre ella se toma la asistencia. */
export interface ClassSession extends Timestamps {
  id: ID;
  commissionId: ID;
  date: ISODate;
  topic?: string;
  status: SessionStatus;
  closedAt?: ISODateTime;
  closedBy?: ID;
}

export interface AttendanceRecord extends RecordedBy {
  id: ID;
  sessionId: ID;
  studentId: ID;
  status: AttendanceStatus;
  /** Solo si status = LATE. */
  minutesLate?: number;
  notes?: string;
  source: AttendanceSource;
  /** Lo calcula el backend: hay una justificación aprobada que cubre esta fecha. */
  justified: boolean;
}

/** Asistencia con datos para mostrar (lectura). */
export interface AttendanceRecordView extends AttendanceRecord {
  date: ISODate;
  commissionId: ID;
  subjectName: string;
  studentName: string;
  studentFileNumber: string;
}

/** Justificación de inasistencias (la carga y aprueba Preceptoría). */
export interface Justification extends Timestamps {
  id: ID;
  studentId: ID;
  fromDate: ISODate;
  toDate: ISODate;
  reason: string;
  /** URL del comprobante, si hay. */
  documentUrl?: string;
  status: JustificationStatus;
  createdBy: ID;
  reviewedBy?: ID;
  reviewedAt?: ISODateTime;
  reviewNotes?: string;
}

/**
 * Resumen de asistencia. Lo calcula SIEMPRE el backend con la regla institucional
 * (ver InstitutionSettings). Las apps solo lo muestran.
 */
export interface AttendanceSummary {
  studentId: ID;
  /** Si falta, es el resumen de todas las comisiones del ciclo. */
  commissionId?: ID;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  justifiedAbsenceCount: number;
  /** 0 a 100. */
  percentage: number;
  minimumRequired: number;
  risk: AttendanceRisk;
  /** Faltas que todavía puede tener sin quedar por debajo del mínimo. */
  remainingAbsencesAllowed: number;
}

// ============================================================================
// Calificaciones y observaciones
// ============================================================================

export interface Grade extends RecordedBy {
  id: ID;
  enrollmentId: ID;
  type: AssessmentType;
  /** Número de instancia: 1.er parcial, 2.º parcial… */
  instance: number;
  date: ISODate;
  /** 1 a 10; null si estuvo ausente o todavía no se cargó. */
  value: number | null;
  absent: boolean;
  /** Solo las calificaciones publicadas se muestran al alumno. */
  published: boolean;
  publishedAt?: ISODateTime;
  notes?: string;
}

/** Observación pedagógica de un docente sobre un alumno en una comisión. */
export interface Observation extends Timestamps {
  id: ID;
  commissionId: ID;
  studentId: ID;
  /** Fecha en que ocurrió el hecho (no la de carga). */
  date: ISODate;
  category: ObservationCategory;
  content: string;
  createdBy: ID;
}

// ============================================================================
// Comunicación institucional
// ============================================================================

/** A quién va un comunicado. Vacío = toda la institución. */
export interface NoticeAudience {
  roles?: Role[];
  careerIds?: ID[];
  commissionIds?: ID[];
}

export interface Notice extends Timestamps {
  id: ID;
  cycleId: ID;
  title: string;
  content: string;
  category: NoticeCategory;
  audience: NoticeAudience;
  status: NoticeStatus;
  pinned: boolean;
  publishedAt?: ISODateTime;
  expiresAt?: ISODateTime;
  createdBy: ID;
}

export interface SchoolEvent extends Timestamps {
  id: ID;
  cycleId: ID;
  type: EventType;
  title: string;
  description?: string;
  startDate: ISODate;
  endDate?: ISODate;
  /** Si el evento es de una comisión en particular. */
  commissionId?: ID;
  mandatory: boolean;
}

// ============================================================================
// Control institucional
// ============================================================================

/** Lo escribe el backend en cada operación. Las apps solo lo leen. */
export interface AuditLogEntry {
  id: ID;
  at: ISODateTime;
  userId: ID;
  userName: string;
  action: AuditAction;
  /** Tipo de dato afectado, ej. "AttendanceRecord". */
  entity: string;
  entityId: ID;
  summary: string;
  previousValue?: unknown;
  newValue?: unknown;
}

export interface InstitutionSettings {
  name: string; // "Instituto Superior de Formación Docente y Técnica N.° 26"
  shortName: string; // "ISFDyT N.° 26"
  cue?: string;
  city: string;
  district: string;
  timezone: typeof INSTITUTION_TIMEZONE;
  /** Porcentaje mínimo de asistencia para regularizar (ej. 75). */
  minAttendancePercent: number;
  /**
   * Cuánto descuenta una llegada tarde (0 = nada, 0.5 = media falta, 1 = falta entera).
   * PENDIENTE de decisión institucional (decisión 6 del documento de ajustes).
   */
  lateArrivalAbsenceWeight: number;
  /** Porcentaje desde el cual se marca AT_RISK (ej. 80). */
  attendanceRiskThresholdPercent: number;
}

// ============================================================================
// API: errores, paginación y pedidos (requests)
// ============================================================================

export const API_ERROR_CODES = [
  'VALIDATION_ERROR', // 400
  'UNAUTHENTICATED', // 401
  'FORBIDDEN', // 403
  'NOT_FOUND', // 404
  'CONFLICT', // 409 (ej. planilla cerrada, registro duplicado)
  'INTERNAL_ERROR', // 5xx
] as const;
export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export interface ApiError {
  error: {
    code: ApiErrorCode;
    message: string; // en español, apto para mostrar
    details?: { field?: string; message: string }[];
    traceId?: string;
  };
}

/** Listados largos. Los cortos pueden devolverse como array simple. */
export interface Page<T> {
  items: T[];
  nextCursor: string | null;
  total?: number;
}

// --- Autenticación ---

export interface LoginRequest {
  email: string;
  password: string;
}

// --- Asistencia (primer circuito real, Etapa 2) ---

/** POST /commissions/{id}/sessions */
export interface CreateSessionRequest {
  date: ISODate;
  topic?: string;
}

/** PUT /sessions/{id}/attendance — reemplaza la planilla completa de la clase. */
export interface SaveSessionAttendanceRequest {
  records: {
    studentId: ID;
    status: AttendanceStatus;
    minutesLate?: number;
    notes?: string;
  }[];
  /** true = cierra la planilla al guardar. */
  close?: boolean;
}

/** PUT /sessions/{id}/reopen — queda en auditoría. */
export interface ReopenSessionRequest {
  reason: string;
}

/** POST /justifications */
export interface CreateJustificationRequest {
  studentId: ID;
  fromDate: ISODate;
  toDate: ISODate;
  reason: string;
  documentUrl?: string;
}

/** PATCH /justifications/{id} */
export interface ReviewJustificationRequest {
  status: Exclude<JustificationStatus, 'PENDING'>;
  reviewNotes?: string;
}

// --- Gestión (Etapa 3) ---

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
}

export type CreateStudentRequest = Omit<Student, 'id' | 'userId' | keyof Timestamps> & {
  sensitive?: Omit<StudentSensitiveData, 'studentId'>;
};

export type CreateCommissionRequest = Omit<Commission, 'id' | keyof Timestamps>;

export interface CreateEnrollmentRequest {
  studentId: ID;
  commissionId: ID;
}

export type SaveGradeRequest = Pick<
  Grade,
  'enrollmentId' | 'type' | 'instance' | 'date' | 'value' | 'absent' | 'notes'
>;

export type CreateObservationRequest = Pick<
  Observation,
  'commissionId' | 'studentId' | 'date' | 'category' | 'content'
>;
