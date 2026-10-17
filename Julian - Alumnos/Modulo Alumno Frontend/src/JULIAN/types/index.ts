export type ActiveSection =
  | 'inicio'
  | 'perfil'
  | 'agenda'
  | 'materias'
  | 'notas'
  | 'faltas'
  | 'historial'
  | 'comunidad'
  | 'foros'
  | 'opciones'
  | 'apariencia'
  | 'asistencia-qr';

export type ThemeId =
  | 'celestial'
  | 'oscuro'
  | 'ensonacion'
  | 'moderno'
  | 'fantasma'
  | 'rebelde';

export type BorderStyle = 'sencillo' | 'refinado';
export type TypographyStyle = 'plus-jakarta' | 'cinzel' | 'jetbrains-mono' | 'system';
export type AccentIntensity = 'sutil' | 'equilibrado' | 'intenso';

export interface AppearanceSettings {
  theme: ThemeId;
  borderStyle: BorderStyle;
  fontFamily: TypographyStyle;
  accentIntensity: AccentIntensity;
  reduceMotion: boolean;
  highContrast: boolean;
}

export interface StudentProfile {
  id: string;
  fullName: string;
  dni: string;
  legajo: string;
  email: string;
  career: string;
  institution: string;
  plan: string;
  year: number;
  division: string;
  shift: string;
  status: 'Regular Activo' | 'Condicional' | 'En Trámite';
  cohort: string;
  tutorPreceptor: string;
  preceptorEmail: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  address: string;
  avatarUrl: string;
}

export interface SubjectSchedule {
  day: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado';
  startTime: string;
  endTime: string;
  classroom: string;
  modality: 'Presencial' | 'Híbrida' | 'Virtual';
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  professor: string;
  professorEmail: string;
  commission: string;
  year: number;
  schedules: SubjectSchedule[];
  status: 'Cursando' | 'Regular' | 'Promocionada' | 'En Riesgo' | 'Libre';
  attendancePercentage: number;
  attendedClasses: number;
  totalClasses: number;
  absences: number;
  maxAllowedAbsences: number;
  currentAverage: number;
  correlatives: string[];
  description: string;
  nextExam?: {
    title: string;
    date: string;
    classroom: string;
  };
}

export interface Grade {
  id: string;
  subjectId: string;
  subjectName: string;
  evaluationName: string;
  type: 'Parcial' | 'Trabajo Práctico' | 'Recuperatorio' | 'Examen Final';
  score: number | null;
  minPassingScore: number;
  maxScore: number;
  date: string;
  isApproved: boolean | null;
  status: 'Publicada' | 'Pendiente de Publicación' | 'Ausente Justificado';
  feedback?: string;
  weightPercentage?: number;
}

export interface AttendanceRecord {
  id: string;
  subjectId: string;
  subjectName: string;
  date: string;
  time: string;
  status: 'Presente' | 'Ausente' | 'Tardanza' | 'Justificada';
  hoursCount: number;
  classroom: string;
  method: 'Código QR' | 'Planilla Docente' | 'Preceptoría';
  justificationStatus?: 'No Requerida' | 'Pendiente' | 'Aprobada' | 'Rechazada';
  justificationReason?: string;
  justificationAttachment?: string;
  justificationSubmittedAt?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'Clase' | 'Examen' | 'Entrega TP' | 'Institucional' | 'Mesa Final';
  subjectId?: string;
  subjectName?: string;
  date: string;
  startTime: string;
  endTime: string;
  classroom?: string;
  description: string;
  priority: 'Alta' | 'Media' | 'Baja';
}

export interface AcademicNotice {
  id: string;
  title: string;
  category: 'Institucional' | 'Materia' | 'Preceptoría' | 'Urgente';
  author: string;
  authorRole: string;
  date: string;
  summary: string;
  content: string;
  isRead: boolean;
  priority: boolean;
}

export interface CommunityMember {
  id: string;
  name: string;
  role: 'Docente' | 'Preceptor' | 'Compañero';
  roleDetail: string;
  institutionalEmail: string;
  commission: string;
  officeHours?: string;
  avatarUrl?: string;
  status: 'Disponible' | 'En Clase' | 'Fuera de Horario';
}

export interface ForumReply {
  id: string;
  topicId: string;
  authorName: string;
  authorRole: string;
  isCurrentUser: boolean;
  content: string;
  createdAt: string;
  likes: number;
}

export interface ForumTopic {
  id: string;
  subjectId?: string;
  subjectName: string;
  title: string;
  authorName: string;
  authorRole: string;
  isCurrentUser: boolean;
  createdAt: string;
  content: string;
  tags: string[];
  replies: ForumReply[];
  isPinned: boolean;
  views: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'asistencia' | 'calificacion' | 'aviso' | 'agenda';
  read: boolean;
  targetSection?: ActiveSection;
}

export interface QRScanSession {
  sessionId: string;
  subjectCode: string;
  subjectName: string;
  professorName: string;
  classroom: string;
  validUntil: string;
  tokenSeed: string;
  ipNetworkRequired: string;
}
