import { 
  AttendanceRisk, 
  AttendanceState, 
  AuthorizationResponse, 
  AuthorizationType, 
  DocumentType, 
  EventCategory, 
  JustificationStatus 
} from './api';

export const ATTENDANCE_STATE_LABELS: Record<AttendanceState, string> = {
  PRESENT: 'Presente',
  ABSENT: 'Ausente',
  LATE: 'Llegada tarde',
  JUSTIFIED_ABSENT: 'Justificada',
};

export const ATTENDANCE_RISK_LABELS: Record<AttendanceRisk, { label: string; description: string }> = {
  OK: {
    label: 'Regular',
    description: 'Cumple con el porcentaje mínimo requerido de asistencia.',
  },
  AT_RISK: {
    label: 'En riesgo',
    description: 'Próximo al límite máximo de inasistencias permitidas.',
  },
  BELOW_MINIMUM: {
    label: 'Por debajo del mínimo',
    description: 'Superó el cupo de inasistencias institucionales.',
  },
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  MEDICAL: 'Certificado Médico',
  WORK: 'Constancia Laboral',
  FORCE_MAJEURE: 'Fuerza Mayor / Trámite Impostergable',
};

export const JUSTIFICATION_STATUS_LABELS: Record<JustificationStatus, { label: string; hint: string }> = {
  UNDER_REVIEW: {
    label: 'En revisión',
    hint: 'La solicitud fue recibida por Preceptoría y está siendo evaluada.',
  },
  APPROVED: {
    label: 'Aprobada',
    hint: 'La inasistencia fue justificada formalmente en el libro matriz.',
  },
  REJECTED: {
    label: 'Rechazada',
    hint: 'La constancia no cumplió con las pautas reglamentarias.',
  },
};

export const AUTHORIZATION_TYPE_LABELS: Record<AuthorizationType, string> = {
  FIELD_TRIP: 'Salida didáctica',
  TRAVEL: 'Viaje educativo',
  IMAGE_USE: 'Uso de imagen institucional',
  EARLY_DISMISSAL: 'Retiro anticipado autorizado',
};

export const AUTHORIZATION_RESPONSE_LABELS: Record<AuthorizationResponse, string> = {
  PENDING: 'Pendiente de respuesta',
  APPROVED: 'Autorizado',
  REJECTED: 'No autorizado',
};

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  EXAM: 'Examen / Parcial',
  SPECIAL_CLASS: 'Clase especial / Taller',
  COMMEMORATIVE_ACT: 'Acto institucional',
  HOLIDAY: 'Feriado / Asueto',
  FIELD_TRIP: 'Salida / Visita',
};

/**
 * Formatea fechas AAAA-MM-DD a formato argentino dd/MM/yyyy
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    // Si ya viene como AAAA-MM-DD
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Argentina/Buenos_Aires',
    }).format(d);
  } catch {
    return dateString;
  }
}

/**
 * Formatea fecha y hora dd/MM/yyyy HH:mm
 */
export function formatDateTime(dateTimeString?: string | null): string {
  if (!dateTimeString) return '—';
  try {
    const d = new Date(dateTimeString);
    if (!isNaN(d.getTime())) {
      return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'America/Argentina/Buenos_Aires',
      }).format(d);
    }
    // Si viene en formato simple "AAAA-MM-DD HH:mm"
    const [datePart, timePart] = dateTimeString.split(' ');
    if (datePart && timePart) {
      return `${formatDate(datePart)} ${timePart}`;
    }
    return formatDate(dateTimeString);
  } catch {
    return dateTimeString;
  }
}

export function formatTime(timeString?: string | null): string {
  if (!timeString) return '—';
  return timeString.slice(0, 5);
}
