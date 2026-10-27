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
  'STAFF', // auxiliar / maestranza
  'STUDENT_REP', // Centro de Estudiantes
] as const;
export type Role = (typeof ROLES)[number];
export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Superadministrador',
  DIRECTOR: 'Directivo',
  ADMINISTRATIVE: 'Administrativo / Secretaría',
  PRECEPTOR: 'Preceptor/a',
  TEACHER: 'Profesor/a',
  STUDENT: 'Alumno/a',
  STAFF: 'Auxiliar',
  STUDENT_REP: 'Centro de Estudiantes',
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
  /** Ciclo lectivo vigente, para no tener que pedirlo aparte. null si todavía no hay uno vigente. */
  activeCycleId: ID | null;
  /** true = la cuenta es nueva o se blanqueó la clave: la app debe pedir el cambio de contraseña. */
  mustChangePassword: boolean;
}

/** Usuario tal como lo devuelve la API (nunca incluye la contraseña). */
export type UserDTO = User & {
  mustChangePassword: boolean;
  studentId: ID | null;
  teacherId: ID | null;
};

// ============================================================================
// Acceso a cada app
// ============================================================================

/** Apps del sistema (coinciden con las carpetas del repo). */
/** 'preceptoria', 'auxiliares' y 'centro' viven en la app consolidacion/ (consolidacion/app). */
export const APPS = ['directivos', 'profesores', 'alumnos', 'preceptoria', 'auxiliares', 'centro'] as const;
export type AppId = (typeof APPS)[number];

/**
 * Roles que pueden entrar a cada app. Las cuentas se crean desde Directivos.
 * SUPER_ADMIN entra a todas (soporte). El backend igual valida cada pedido:
 * esto es solo para que la app muestre "sin acceso" en vez de pantallas vacías.
 */
export const APP_ACCESS: Record<AppId, readonly Role[]> = {
  directivos: ['SUPER_ADMIN', 'DIRECTOR', 'ADMINISTRATIVE'],
  profesores: ['SUPER_ADMIN', 'TEACHER'],
  alumnos: ['SUPER_ADMIN', 'STUDENT'],
  preceptoria: ['SUPER_ADMIN', 'PRECEPTOR'],
  auxiliares: ['SUPER_ADMIN', 'STAFF'],
  centro: ['SUPER_ADMIN', 'STUDENT_REP'],
};

/** true si alguno de los roles del usuario puede entrar a la app. */
export function canAccessApp(roles: readonly Role[], app: AppId): boolean {
  return roles.some((r) => APP_ACCESS[app].includes(r));
}

/**
 * Qué roles puede asignar cada rol al crear o editar cuentas desde Directivos.
 * El backend aplica exactamente esta tabla.
 */
export const ASSIGNABLE_ROLES: Partial<Record<Role, readonly Role[]>> = {
  SUPER_ADMIN: ROLES,
  DIRECTOR: ['DIRECTOR', 'ADMINISTRATIVE', 'PRECEPTOR', 'TEACHER', 'STUDENT', 'STAFF', 'STUDENT_REP'],
  ADMINISTRATIVE: ['PRECEPTOR', 'TEACHER', 'STUDENT', 'STAFF', 'STUDENT_REP'],
};

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
  subjectId: ID;
  subjectName: string;
  studentName: string;
  studentFileNumber: string;
  /** Justificación que cubre esta fecha, si hay (aprobada, pendiente o rechazada). */
  justificationId?: ID;
  justificationStatus?: JustificationStatus;
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
  /** Años de cursada (ej. anuncio del preceptor a 2.º año). */
  years?: number[];
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
  'TOO_MANY_ATTEMPTS', // 429 (cuenta bloqueada unos minutos por intentos fallidos)
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

/** POST /auth/login — responde AuthMe y deja la cookie de sesión. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** POST /auth/change-password */
export interface ChangePasswordRequest {
  currentPassword: string;
  /** Mínimo 8 caracteres. */
  newPassword: string;
}

/** Largo mínimo de contraseña (lo valida también el backend). */
export const MIN_PASSWORD_LENGTH = 8;

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

/** POST /users (desde Directivos). */
export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
  /** Vincula la cuenta con un alumno ya cargado. */
  studentId?: ID;
  /** Vincula la cuenta con un docente ya cargado. */
  teacherId?: ID;
}

/**
 * Respuesta de POST /users y POST /users/{id}/reset-password.
 * La contraseña temporal se muestra UNA sola vez: Directivos se la pasa a la persona,
 * que la cambia en su primer ingreso.
 */
export interface UserWithTemporaryPassword {
  user: UserDTO;
  temporaryPassword: string;
}

/** PATCH /users/{id} */
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  roles?: Role[];
  status?: UserStatus;
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

// ============================================================================
// Asistencia: pedidos y vistas de la toma de asistencia unificada
// (Preceptoría carga por materia y fecha; Profesores por comisión y clase:
//  las dos escriben en la misma planilla, class_sessions + attendance_records)
// ============================================================================

/** POST /attendance/by-subject — toma de asistencia del preceptor (materia + fecha). */
export interface SaveSubjectAttendanceRequest {
  subjectId: ID;
  date: ISODate;
  records: { studentId: ID; status: AttendanceStatus; minutesLate?: number; notes?: string }[];
}

/** Filtros de GET /attendance. */
export interface AttendanceQuery {
  careerId?: ID;
  year?: number;
  subjectId?: ID;
  commissionId?: ID;
  studentId?: ID;
  from?: ISODate;
  to?: ISODate;
}

/** Justificación con datos para mostrar (lectura). */
export interface JustificationView extends Justification {
  studentName: string;
  studentFileNumber: string;
}

/** Alumno con su carrera y años de cursada (para listados de preceptoría). */
export interface StudentView extends Student {
  careerCode: string;
  /** Años de la carrera en los que tiene materias en el ciclo vigente. */
  years: number[];
}

/** Materia con su carrera (catálogo). */
export interface SubjectView extends Subject {
  careerId: ID;
  careerCode: string;
}

/** Datos para armar la pantalla del preceptor: sus comisiones, materias y alumnos. */
export interface PreceptorScope {
  careers: Pick<Career, 'id' | 'code' | 'name'>[];
  /** Años de cursada que tiene asignados (por carrera). */
  years: { careerId: ID; years: number[] }[];
  subjects: SubjectView[];
  students: StudentView[];
}

// ============================================================================
// Auxiliares (maestranza / mantenimiento del edificio)
// ============================================================================

export const STAFF_TASK_TYPES = ['CLEANING', 'MAINTENANCE', 'ROUTINE'] as const;
export type StaffTaskType = (typeof STAFF_TASK_TYPES)[number];
export const STAFF_TASK_TYPE_LABELS: Record<StaffTaskType, string> = {
  CLEANING: 'Limpieza',
  MAINTENANCE: 'Mantenimiento',
  ROUTINE: 'Rutina',
};

export const STAFF_TASK_STATUSES = ['PENDING', 'DONE'] as const;
export type StaffTaskStatus = (typeof STAFF_TASK_STATUSES)[number];
export const STAFF_TASK_STATUS_LABELS: Record<StaffTaskStatus, string> = { PENDING: 'Pendiente', DONE: 'Completada' };

export interface StaffTask extends Timestamps {
  id: ID;
  date: ISODate;
  startTime: TimeOfDay;
  title: string;
  type: StaffTaskType;
  status: StaffTaskStatus;
  location: string;
  details?: string;
  assignedToUserId?: ID;
  completedAt?: ISODateTime;
  completedBy?: ID;
}

export const INSTALLATION_STATUSES = ['OK', 'MAINTENANCE', 'OUT_OF_SERVICE'] as const;
export type InstallationStatus = (typeof INSTALLATION_STATUSES)[number];
export const INSTALLATION_STATUS_LABELS: Record<InstallationStatus, string> = {
  OK: 'Operativa',
  MAINTENANCE: 'En mantenimiento',
  OUT_OF_SERVICE: 'Fuera de servicio',
};

export interface Installation extends Timestamps {
  id: ID;
  name: string;
  status: InstallationStatus;
  /** Ubicación en el plano del edificio (grilla). */
  layout: { col: number; row: number; colSpan: number; rowSpan: number };
  lastCleanedAt?: ISODateTime;
  nextTask?: string;
  notes?: string;
}

export const INCIDENT_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
export type IncidentPriority = (typeof INCIDENT_PRIORITIES)[number];
export const INCIDENT_PRIORITY_LABELS: Record<IncidentPriority, string> = { LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta' };

export const INCIDENT_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED'] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];
export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  OPEN: 'Abierta',
  IN_PROGRESS: 'En progreso',
  RESOLVED: 'Resuelta',
};

export interface Incident extends Timestamps {
  id: ID;
  description: string;
  priority: IncidentPriority;
  /** Sector o instalación, en texto (puede no estar en el plano). */
  sector: string;
  installationId?: ID;
  imageUrl?: string;
  status: IncidentStatus;
  reportedBy: ID;
  resolvedAt?: ISODateTime;
  resolvedBy?: ID;
}

export interface MaintenanceLog {
  id: ID;
  date: ISODate;
  task: string;
  responsible: string;
  installationId?: ID;
  recordedBy: ID;
  createdAt: ISODateTime;
}

// ============================================================================
// Centro de Estudiantes
// ============================================================================

export const REP_EVENT_TYPES = ['ACADEMIC', 'CULTURAL', 'SPORTS', 'MEETING'] as const;
export type RepEventType = (typeof REP_EVENT_TYPES)[number];
export const REP_EVENT_TYPE_LABELS: Record<RepEventType, string> = {
  ACADEMIC: 'Académico',
  CULTURAL: 'Cultural',
  SPORTS: 'Deportivo',
  MEETING: 'Reunión',
};

export interface RepEvent extends Timestamps {
  id: ID;
  title: string;
  date: ISODate;
  time?: TimeOfDay;
  location?: string;
  description: string;
  type: RepEventType;
  organizer: string;
  createdBy: ID;
  /** Cantidad de inscriptos (lo calcula el backend). */
  participantCount: number;
  /** true si el usuario de la sesión ya se anotó. */
  joined: boolean;
}

export const REP_FORUM_CATEGORIES = ['GENERAL', 'PROPOSALS', 'EVENTS'] as const;
export type RepForumCategory = (typeof REP_FORUM_CATEGORIES)[number];
export const REP_FORUM_CATEGORY_LABELS: Record<RepForumCategory, string> = {
  GENERAL: 'General',
  PROPOSALS: 'Propuestas',
  EVENTS: 'Eventos',
};

export interface RepThread extends Timestamps {
  id: ID;
  authorId: ID;
  authorName: string;
  title: string;
  content: string;
  category: RepForumCategory;
  pinned: boolean;
  replyCount: number;
}

export interface RepReply {
  id: ID;
  threadId: ID;
  authorId: ID;
  authorName: string;
  content: string;
  createdAt: ISODateTime;
}

export interface RepAnnouncement extends Timestamps {
  id: ID;
  title: string;
  content: string;
  authorId: ID;
  authorName: string;
  pinned: boolean;
  publishDate?: ISODate;
}

export const REP_CLAIM_CATEGORIES = ['ACADEMIC', 'INFRASTRUCTURE', 'ADMINISTRATIVE', 'SUGGESTION'] as const;
export type RepClaimCategory = (typeof REP_CLAIM_CATEGORIES)[number];
export const REP_CLAIM_CATEGORY_LABELS: Record<RepClaimCategory, string> = {
  ACADEMIC: 'Académico',
  INFRASTRUCTURE: 'Infraestructura',
  ADMINISTRATIVE: 'Administrativo',
  SUGGESTION: 'Sugerencia',
};

export const REP_CLAIM_STATUSES = ['PENDING', 'IN_REVIEW', 'RESOLVED', 'ARCHIVED'] as const;
export type RepClaimStatus = (typeof REP_CLAIM_STATUSES)[number];
export const REP_CLAIM_STATUS_LABELS: Record<RepClaimStatus, string> = {
  PENDING: 'Pendiente',
  IN_REVIEW: 'En revisión',
  RESOLVED: 'Resuelto',
  ARCHIVED: 'Archivado',
};

export interface RepClaim extends Timestamps {
  id: ID;
  authorId: ID;
  /** El Centro ve el nombre; cada alumno ve solo sus propios reclamos. */
  authorName: string;
  category: RepClaimCategory;
  description: string;
  status: RepClaimStatus;
  response?: string;
  responderId?: ID;
}

// ============================================================================
// Datos compartidos entre apps (2026-10-27): directorio, perfil, notas, mensajes,
// foro académico moderado y notificaciones
// ============================================================================

/** Entrada del directorio (lo mínimo para mostrar y escribirle a alguien). */
export interface DirectoryEntry {
  id: ID; // User.id
  firstName: string;
  lastName: string;
  roles: Role[];
  avatarUrl?: string;
  position?: string;
}

export interface UserProfile {
  userId: ID;
  bio?: string;
  phone?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  accentColor?: string;
  /** Cargo en el Centro de Estudiantes, si corresponde. */
  position?: string;
  links: { id: string; url: string; label: string }[];
  /** Horarios de atención o consulta. 1 = lunes. */
  availability: { id: string; dayOfWeek: number; startTime: TimeOfDay; endTime: TimeOfDay }[];
  updatedAt?: ISODateTime;
}

export type UpdateProfileRequest = Partial<Omit<UserProfile, 'userId' | 'updatedAt'>>;

export interface UserNote extends Timestamps {
  id: ID;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
}

export interface PrivateMessage {
  id: ID;
  senderId: ID;
  receiverId: ID;
  text: string;
  readAt?: ISODateTime;
  createdAt: ISODateTime;
}

/** Resumen de una conversación (GET /social/messages/conversations). */
export interface Conversation {
  with: DirectoryEntry;
  lastMessage: PrivateMessage;
  unreadCount: number;
}

export const FORUM_THREAD_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION'] as const;
export type ForumThreadStatus = (typeof FORUM_THREAD_STATUSES)[number];
export const FORUM_THREAD_STATUS_LABELS: Record<ForumThreadStatus, string> = {
  PENDING: 'Pendiente de revisión',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  NEEDS_REVISION: 'Necesita cambios',
};

/** Foro académico moderado por Preceptoría (distinto del foro del Centro, RepThread). */
export interface ForumThread extends Timestamps {
  id: ID;
  authorId: ID;
  authorName: string;
  title: string;
  content: string;
  careerId?: ID;
  year?: number;
  commissionId?: ID;
  status: ForumThreadStatus;
  rejectionReason?: string;
  locked: boolean;
  replyCount: number;
}

export interface ForumReply {
  id: ID;
  threadId: ID;
  authorId: ID;
  authorName: string;
  content: string;
  createdAt: ISODateTime;
}

export const NOTIFICATION_TYPES = [
  'ANNOUNCEMENT',
  'ABSENCE',
  'JUSTIFICATION_REQUEST',
  'JUSTIFICATION_APPROVED',
  'JUSTIFICATION_REJECTED',
  'MESSAGE',
  'FORUM',
  'EVENT',
  'CLAIM',
  'GENERAL',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface AppNotification {
  id: ID;
  type: NotificationType;
  text: string;
  details?: string;
  link?: string;
  readAt?: ISODateTime;
  createdAt: ISODateTime;
}

// ============================================================================
// Portal del alumno: GET /me/*
// ============================================================================

/** Una materia que cursa el alumno, con su comisión y condición. */
export interface MySubject {
  enrollmentId: ID;
  commission: CommissionView;
  condition: EnrollmentCondition;
  attendance: AttendanceSummary;
}

/** Nota publicada, tal como la ve el alumno. */
export interface MyGrade {
  id: ID;
  subjectName: string;
  commissionId: ID;
  type: AssessmentType;
  instance: number;
  date: ISODate;
  value: number | null;
  absent: boolean;
  notes?: string;
}

// ============================================================================
// Pedidos de escritura de la estructura académica (Directivos / Secretaría)
// ============================================================================

export interface CreateCareerRequest {
  code: string;
  name: string;
  durationYears: number;
}
export interface CreateStudyPlanRequest {
  careerId: ID;
  code: string;
  name: string;
  startYear: number;
}
export interface CreateSubjectRequest {
  planId: ID;
  code: string;
  name: string;
  year: number;
  period: AcademicPeriod;
  weeklyHours?: number;
  prerequisiteSubjectIds?: ID[];
}
export interface CreateCycleRequest {
  year: number;
  startDate: ISODate;
  endDate: ISODate;
  firstTermEndDate?: ISODate;
}
export type CreateTeacherRequest = Omit<Teacher, 'id' | 'userId' | 'status' | keyof Timestamps>;

/** Comunicado institucional (o anuncio del preceptor a su curso). */
export type CreateNoticeRequest = Pick<Notice, 'title' | 'content' | 'category' | 'audience'> & {
  publish?: boolean;
  pinned?: boolean;
  expiresAt?: ISODateTime;
};

export type CreateEventRequest = Omit<SchoolEvent, 'id' | 'cycleId' | keyof Timestamps>;

export type UpdateSettingsRequest = Partial<
  Pick<
    InstitutionSettings,
    'name' | 'shortName' | 'cue' | 'city' | 'district' | 'minAttendancePercent' | 'lateArrivalAbsenceWeight' | 'attendanceRiskThresholdPercent'
  >
>;
