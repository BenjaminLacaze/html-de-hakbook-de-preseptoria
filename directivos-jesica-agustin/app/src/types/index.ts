export type UserRole =
  | 'DIRECTIVO'
  | 'VICEDIRECTOR'
  | 'SECRETARIA'
  | 'PRECEPTORIA'
  | 'DOCENTE'
  | 'ORIENTACION_ESCOLAR';

export type UserStatus = 'ACTIVO' | 'INACTIVO';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  dni: string;
  phone: string;
  status: UserStatus;
  assignedCourses?: string[];
  lastLogin: string;
  createdAt: string;
}

export type Shift = 'MAÑANA' | 'TARDE' | 'VESPERTINO';

export interface AcademicCycle {
  id: '2026' | '2025';
  year: number;
  status: 'VIGENTE' | 'CERRADO';
  startDate: string;
  endDate: string;
  description: string;
}

export interface Course {
  id: string;
  cycleId: '2026' | '2025';
  yearLevel: number;
  division: string;
  shift: Shift;
  orientation: string;
  preceptorId: string;
  classroom: string;
  capacity: number;
}

export interface Student {
  id: string;
  legajo: string;
  dni: string;
  lastName: string;
  firstName: string;
  birthDate: string;
  tutorName: string;
  tutorPhone: string;
  tutorEmail: string;
  courseId: string;
  cycleId: '2026' | '2025';
  status: 'REGULAR' | 'CONDICIONAL' | 'EGRESADO' | 'PASIVADO';
  address: string;
  healthAlert?: string;
}

export interface Teacher {
  id: string;
  dni: string;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  title: string;
  status: 'ACTIVO' | 'LICENCIA' | 'INACTIVO';
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  yearLevel: number;
  hoursWeekly: number;
  regime: 'ANUAL' | 'CUATRIMESTRAL';
  area: 'FORMACION_GENERAL' | 'FORMACION_ESPECIFICA' | 'PRACTICA_PROFESIONALIZANTE';
}

export interface TeacherAssignment {
  id: string;
  cycleId: '2026' | '2025';
  courseId: string;
  subjectId: string;
  teacherId: string;
  statusRevista: 'TITULAR' | 'PROVISIONAL' | 'SUPLENTE';
}

export type AttendanceStatus =
  | 'PRESENTE'
  | 'AUSENTE_INJUSTIFICADO'
  | 'AUSENTE_JUSTIFICADO'
  | 'TARDANZA';

export interface AttendanceRecord {
  id: string;
  cycleId: '2026' | '2025';
  date: string; // YYYY-MM-DD
  studentId: string;
  courseId: string;
  status: AttendanceStatus;
  notes?: string;
  recordedByUserId: string;
}

export type AcademicPeriod =
  | '1_TRIMESTRE'
  | '2_TRIMESTRE'
  | '3_TRIMESTRE'
  | 'DICIEMBRE_FEBRERO';

export interface GradeRecord {
  id: string;
  cycleId: '2026' | '2025';
  period: AcademicPeriod;
  studentId: string;
  courseId: string;
  subjectId: string;
  score: number; // 1 to 10
  isApproved: boolean;
  teacherNotes?: string;
  date: string;
}

export interface ScheduleSlot {
  id: string;
  cycleId: '2026' | '2025';
  courseId: string;
  dayOfWeek: 1 | 2 | 3 | 4 | 5; // 1 = Lunes ... 5 = Viernes
  module: number; // 1 to 6
  startTime: string; // e.g. "07:45"
  endTime: string;   // e.g. "08:45"
  subjectId: string;
  teacherId: string;
  classroom: string;
}

export interface SchoolEvent {
  id: string;
  cycleId: '2026' | '2025';
  date: string;
  title: string;
  type:
    | 'ACTO_ESCOLAR'
    | 'JORNADA_INSTITUCIONAL'
    | 'MESA_EXAMEN'
    | 'CIERRE_NOTAS'
    | 'FERIADO'
    | 'REUNION_PADRES';
  description: string;
  isMandatory: boolean;
}

export interface OfficialNotice {
  id: string;
  cycleId: '2026' | '2025';
  title: string;
  content: string;
  category: 'URGENTE' | 'INSTITUCIONAL' | 'PEDAGOGICO' | 'ACADEMICO';
  recipients: 'TODOS' | 'DOCENTES' | 'PRECEPTORES' | 'FAMILIAS';
  status: 'BORRADOR' | 'PUBLICADO' | 'VENCIDO' | 'ARCHIVADO';
  publishDate: string;
  authorName: string;
  authorRole: string;
  readCount: number;
  isPinned: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO string
  userId: string;
  userName: string;
  userRole: string;
  module: string;
  action:
    | 'CREACION'
    | 'MODIFICACION'
    | 'CAMBIO_ESTADO'
    | 'ELIMINACION_CONTROLADA'
    | 'CONFIGURACION'
    | 'EXPORTACION'
    | 'CAMBIO_CICLO';
  entity: string;
  entityId: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

export interface InstitutionSettings {
  name: string;
  schoolNumber: string;
  cue: string;
  district: string;
  region: string;
  address: string;
  phone: string;
  email: string;
  principalName: string;
  vicePrincipalName: string;
  attendanceAlertThresholdPercent: number; // default: 15% inasistencias
  consecutiveAbsenceAlertThreshold: number; // default: 3 días
  minPassingGrade: number; // default: 7
  gradingScale: '1-10';
  activeCycleId: '2026' | '2025';
}

export type ActiveSection =
  | 'inicio'
  | 'usuarios'
  | 'cursos'
  | 'asistencia'
  | 'rendimiento'
  | 'organizacion'
  | 'comunicados'
  | 'informes'
  | 'auditoria'
  | 'configuracion'
  | 'contrato';
