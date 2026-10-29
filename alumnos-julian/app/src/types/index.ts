/**
 * @file src/types/index.ts
 * Dominio de datos tipado para el Panel de Alumno de Asistencia Terciario.
 * Diseñado para desacoplar el frontend y facilitar la integración con la API REST y base MySQL.
 */

export type ThemeType = 'celestial' | 'oscuro' | 'ensonacion' | 'moderno' | 'fantasma' | 'rebelde';
export type RadiusType = 'suave' | 'estandar' | 'recto';
export type FontType = 'plus-jakarta' | 'outfit' | 'dm-sans';

export interface StudentProfile {
  id: string;
  legajo: string;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  carrera: string;
  codigoCarrera: string;
  institucion: string;
  planEstudio: string;
  anioCursada: number;
  cuatrimestreActual: number;
  comision: string;
  turno: 'Mañana' | 'Tarde' | 'Noche' | 'Sin informar';
  estadoAcademico: string;
  fechaInscripcion: string;
  promedioGeneral: number | null;
  porcentajeAsistenciaGlobal: number;
  minimumAttendance?: number;
  attendanceRisk?: string;
  avatarUrl?: string;
}

export interface SubjectTeacher {
  id: string;
  nombre: string;
  rol: 'Titular' | 'Adjunto' | 'JTP' | 'Ayudante' | 'Sin informar';
  email: string;
}

export interface SubjectSchedule {
  dia: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado';
  horarioInicio: string;
  horarioFin: string;
  aula: string;
  modalidad: 'Presencial' | 'Híbrida' | 'Virtual' | 'Sin informar';
}

export interface Subject {
  id: string;
  minimumAttendance: number;
  attendanceRisk: string;
  codigo: string;
  nombre: string;
  carrera: string;
  anio: number;
  cuatrimestre: 1 | 2 | 'Anual';
  comision: string;
  docentes: SubjectTeacher[];
  horarios: SubjectSchedule[];
  estadoCursada: 'En Curso' | 'Regularizada' | 'Promocionada' | 'Aprobada' | 'Recursando' | 'Libre';
  totalClasesPrevistas: number;
  clasesDictadas: number;
  asistenciasPresentes: number;
  asistenciasAusentes: number;
  asistenciasJustificadas: number;
  porcentajeAsistencia: number;
  limiteFaltas: number;
  promedioParciales: number | null;
  correlativas: string[];
}

export interface GradeItem {
  id: string;
  materiaId: string;
  materiaNombre: string;
  tipoEvaluacion: '1er Parcial' | '2do Parcial' | 'Recuperatorio 1' | 'Recuperatorio 2' | 'Trabajo Práctico' | 'Examen Final' | 'Coloquio';
  nota: number | null; // null si está pendiente de publicación
  fechaEvaluacion: string;
  fechaPublicacion?: string;
  estado: 'Aprobado' | 'Desaprobado' | 'Ausente' | 'Pendiente' | 'Promocionado' | 'Publicada';
  ponderacion?: string; // ej. "30%"
  observaciones?: string;
  esOficial: boolean;
}

export interface AttendanceRecord {
  id: string;
  materiaId: string;
  materiaNombre: string;
  fecha: string;
  estado: 'Presente' | 'Ausente' | 'Tardanza' | 'Justificada';
  justificacionDetalle?: string;
  estadoJustificacion?: 'En Revisión' | 'Aprobada' | 'Rechazada' | 'Sin Trámite';
  metodoRegistro: 'QR Aula' | 'Docente' | 'Preceptoría' | 'Planilla';
  observacion?: string;
}

export interface AcademicEvent {
  id: string;
  titulo: string;
  tipo: 'Clase' | 'Examen' | 'Entrega TP' | 'Feriado' | 'Mesa de Finales' | 'Institucional';
  materiaId?: string;
  materiaNombre?: string;
  fecha: string;
  horarioInicio: string;
  horarioFin: string;
  ubicacion: string;
  descripcion?: string;
  importante?: boolean;
}

export interface TimelineEvent {
  id: string;
  fecha: string;
  tipo: 'calificacion' | 'asistencia' | 'evaluacion' | 'tramite' | 'institucional';
  titulo: string;
  descripcion: string;
  materiaNombre?: string;
  badgeTexto: string;
  badgeVariant: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export interface CommunityMember {
  id: string;
  nombre: string;
  rol: 'Compañero' | 'Docente' | 'Preceptor' | 'Coordinador';
  carrera: string;
  comision: string;
  email: string;
  materiasCompartidas?: string[];
  activo: boolean;
}

export interface ForumPostReply {
  id: string;
  postId: string;
  autorNombre: string;
  autorRol: 'Alumno' | 'Docente' | 'Preceptor' | 'Participante';
  fecha: string;
  contenido: string;
}

export interface ForumPost {
  status?: string;
  locked?: boolean;
  id: string;
  materiaId?: string;
  materiaNombre?: string;
  categoria: 'Académico' | 'Consultas de TP' | 'Exámenes' | 'Material de Estudio' | 'General';
  titulo: string;
  contenido: string;
  autorNombre: string;
  autorRol: 'Alumno' | 'Docente' | 'Preceptor' | 'Participante';
  fecha: string;
  fijado?: boolean;
  respuestasCount: number;
  respuestas: ForumPostReply[];
}

export interface UserPreferences {
  theme: ThemeType;
  radius: RadiusType;
  font: FontType;
  compactMode: boolean;
  reducedMotion: boolean;
  emailNotifications: {
    notasPublicadas: boolean;
    ausenciasRegistradas: boolean;
    fechasExamen: boolean;
    respuestasForo: boolean;
  };
  pushNotifications: boolean;
}
