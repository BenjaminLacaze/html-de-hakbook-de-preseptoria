/**
 * Traducción API ↔ pantallas del Panel de Preceptores.
 * Fechas: la API usa YYYY-MM-DD / ISO; en pantalla dd/MM/yyyy en hora de Argentina.
 */

import { riskToCondition } from '../config/bedeliaRules';
import type {
  Announcement,
  AttendanceAuditLog,
  AttendanceStatus,
  CertificateType,
  Conversation,
  ChatMessage,
  Course,
  ForumChannelId,
  ForumReply,
  ForumThread,
  JustificationRequest,
  NoticeCategory,
  NotificationItem,
  StudentCenterEvent,
  StudentSubjectStats,
  Subject,
} from '../types';
import type {
  ApiAttendanceChange,
  ApiAttendanceRecordView,
  ApiAttendanceStatus,
  ApiAttendanceSummary,
  ApiCommissionView,
  ApiConversation,
  ApiForumChannel,
  ApiForumReply,
  ApiForumThread,
  ApiJustificationDocumentType,
  ApiJustificationView,
  ApiNotice,
  ApiNotification,
  ApiPreceptorScope,
  ApiPrivateMessage,
  ApiRepEvent,
  ApiShift,
} from './types';

export const AR_TZ = 'America/Argentina/Buenos_Aires';

// ------------------------------------------------------------------- fechas
const isoDayFmt = new Intl.DateTimeFormat('en-CA', { timeZone: AR_TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
const timeFmt = new Intl.DateTimeFormat('es-AR', { timeZone: AR_TZ, hour: '2-digit', minute: '2-digit', hour12: false });
const weekdayFmt = new Intl.DateTimeFormat('en-US', { timeZone: AR_TZ, weekday: 'short' });

/** Hoy en Argentina, YYYY-MM-DD. */
export const todayISO = (): string => isoDayFmt.format(new Date());

/** YYYY-MM-DD → dd/MM/yyyy (sin pasar por Date: las fechas DATE no tienen zona). */
export function isoToDisplay(iso: string | undefined | null): string {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return y && m && d ? `${d}/${m}/${y}` : iso;
}

/** dd/MM/yyyy → YYYY-MM-DD (null si no es válida). */
export function displayToIso(display: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(display.trim());
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

/** Fecha y hora ISO → día YYYY-MM-DD en Argentina. */
export const isoDateTimeToDay = (iso: string): string => isoDayFmt.format(new Date(iso));
/** Fecha y hora ISO → dd/MM/yyyy en Argentina. */
export const dateTimeToDisplayDate = (iso: string): string => isoToDisplay(isoDateTimeToDay(iso));
/** Fecha y hora ISO → HH:mm en Argentina. */
export const dateTimeToTime = (iso: string): string => timeFmt.format(new Date(iso));
/** Fecha y hora ISO → dd/MM/yyyy HH:mm en Argentina. */
export const dateTimeToDisplay = (iso: string | undefined): string =>
  iso ? `${dateTimeToDisplayDate(iso)} ${dateTimeToTime(iso)}` : '';

/** Día de la semana de hoy en Argentina: 1 = lunes … 7 = domingo. */
export function todayWeekday(): number {
  const map: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  return map[weekdayFmt.format(new Date())] ?? 7;
}

export function relativeTime(iso: string): string {
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return 'Recién';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24 && isoDateTimeToDay(iso) === todayISO()) return `Hace ${diffH} h`;
  const yesterday = isoDayFmt.format(new Date(Date.now() - 86_400_000));
  if (isoDateTimeToDay(iso) === yesterday) return 'Ayer';
  return dateTimeToDisplayDate(iso);
}

/** Igual que relativeTime pero para usar dentro de una oración ("presentado hace 2 h", "el 28/10/2026"). */
export function relativeInline(iso: string): string {
  const r = relativeTime(iso);
  return /^\d/.test(r) ? `el ${r}` : r.toLowerCase();
}

function dateGroup(iso: string): string {
  const day = isoDateTimeToDay(iso);
  if (day === todayISO()) return 'Hoy';
  if (day === isoDayFmt.format(new Date(Date.now() - 86_400_000))) return 'Ayer';
  return isoToDisplay(day);
}

// --------------------------------------------------------- estados de asistencia
export function apiToStatus(status: ApiAttendanceStatus, justified = false): AttendanceStatus {
  if (status === 'PRESENT') return 'presente';
  if (status === 'LATE') return 'tardanza';
  return justified ? 'justificado' : 'ausente';
}

/** justificado se guarda como ABSENT (+ justificación aparte). sin_registrar no se envía. */
export function statusToApi(status: AttendanceStatus): ApiAttendanceStatus | null {
  if (status === 'presente') return 'PRESENT';
  if (status === 'tardanza') return 'LATE';
  if (status === 'ausente' || status === 'justificado') return 'ABSENT';
  return null;
}

export const recordToStatus = (r: ApiAttendanceRecordView): AttendanceStatus => apiToStatus(r.status, r.justified);

// ------------------------------------------------------------ cursos y materias
export const SHIFT_LABELS: Record<ApiShift, string> = {
  MORNING: 'Turno Mañana',
  AFTERNOON: 'Turno Tarde',
  EVENING: 'Turno Vespertino',
};
export const WEEKDAY_LABELS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const courseIdOf = (c: Pick<ApiCommissionView, 'careerId' | 'subjectYear' | 'shift'>) =>
  `${c.careerId}|${c.subjectYear}|${c.shift}`;

export function scheduleLabel(c: ApiCommissionView): string {
  if (!c.schedule?.length) return 'Horario no informado';
  return c.schedule
    .map((s) => `${WEEKDAY_LABELS[s.weekday] ?? ''} ${s.startTime} - ${s.endTime}${s.classroom ? ` · ${s.classroom}` : ''}`)
    .join(' / ');
}

/** Agrupa las comisiones a cargo en cursos (carrera + año + turno). */
export function buildCourses(commissions: ApiCommissionView[]): Course[] {
  const byId = new Map<string, Course & { codes: string[] }>();
  for (const c of commissions) {
    const id = courseIdOf(c);
    const prev = byId.get(id);
    if (prev) {
      if (!prev.codes.includes(c.code)) prev.codes.push(c.code);
      continue;
    }
    const yearLabel = `${c.subjectYear}° Año`;
    const shift = SHIFT_LABELS[c.shift] ?? c.shift;
    byId.set(id, {
      id,
      careerId: c.careerId,
      careerName: c.careerName,
      year: c.subjectYear,
      yearLabel,
      shift,
      division: '',
      fullLabel: `${yearLabel} · ${c.careerName} · ${shift}`,
      codes: [c.code],
    });
  }
  return [...byId.values()]
    .map(({ codes, ...course }) => ({ ...course, division: codes.sort().join(', ') }))
    .sort((a, b) => a.careerName.localeCompare(b.careerName, 'es') || a.year - b.year || a.shift.localeCompare(b.shift));
}

export function mapCommission(c: ApiCommissionView): Subject {
  return {
    id: c.id,
    subjectId: c.subjectId,
    courseId: courseIdOf(c),
    name: c.subjectName,
    shortCode: c.code,
    teacherName: c.teacherNames.join(', ') || 'Sin docente asignado',
    scheduleDays: scheduleLabel(c),
    weekdays: (c.schedule ?? []).map((s) => s.weekday),
    studentCount: c.studentCount,
  };
}

// ---------------------------------------------------------------- resúmenes
const fmtPct = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(1)}%`;

export function mapSummary(s: ApiAttendanceSummary): StudentSubjectStats {
  const condition = riskToCondition(s.risk);
  let riskReason: string | undefined;
  if (condition === 'libre') {
    riskReason = `${fmtPct(s.percentage)} de asistencia (mínimo ${fmtPct(s.minimumRequired)})`;
  } else if (condition === 'en_riesgo') {
    riskReason = `${fmtPct(s.percentage)} de asistencia; ${s.remainingAbsencesAllowed === 0 ? 'no le quedan faltas' : `le ${s.remainingAbsencesAllowed === 1 ? 'queda 1 falta' : `quedan ${s.remainingAbsencesAllowed} faltas`}`}`;
  }
  return {
    classesHeld: s.totalSessions,
    presents: s.presentCount,
    tardies: s.lateCount,
    absents: s.absentCount,
    justified: s.justifiedAbsenceCount,
    attendanceRate: s.percentage,
    minimumRequired: s.minimumRequired,
    remainingAbsencesAllowed: s.remainingAbsencesAllowed,
    condition,
    riskReason,
  };
}

// ---------------------------------------------------------------- auditoría
export function mapAuditChange(c: ApiAttendanceChange, fileNumberById: Map<string, string>): AttendanceAuditLog {
  return {
    id: c.id,
    studentId: c.studentId,
    studentName: c.studentName,
    legajo: fileNumberById.get(c.studentId) ?? '',
    subjectName: c.subjectName,
    date: isoToDisplay(c.date),
    previousStatus: apiToStatus(c.previousStatus),
    newStatus: apiToStatus(c.newStatus),
    reason: c.notes ?? 'Sin motivo registrado',
    changedBy: c.userName,
    timestamp: dateTimeToDisplay(c.at),
  };
}

// ---------------------------------------------------------- justificaciones
const DOC_TYPES: Record<ApiJustificationDocumentType, CertificateType> = {
  MEDICAL: 'medico',
  WORK: 'laboral',
  FORCE_MAJEURE: 'fuerza_mayor',
};
export const CERTIFICATE_LABELS: Record<CertificateType, string> = {
  medico: 'Certificado médico',
  laboral: 'Certificado laboral',
  fuerza_mayor: 'Fuerza mayor',
};
export const certificateToApi = (t: CertificateType): ApiJustificationDocumentType =>
  t === 'medico' ? 'MEDICAL' : t === 'laboral' ? 'WORK' : 'FORCE_MAJEURE';

export function mapJustification(j: ApiJustificationView): JustificationRequest {
  const absenceDate =
    j.fromDate === j.toDate ? isoToDisplay(j.fromDate) : `${isoToDisplay(j.fromDate)} al ${isoToDisplay(j.toDate)}`;
  return {
    id: j.id,
    studentId: j.studentId,
    studentName: j.studentName,
    legajo: j.studentFileNumber,
    subjectId: j.subjectId ?? null,
    subjectName: j.subjectName ?? 'Todas las materias',
    fromDate: j.fromDate,
    toDate: j.toDate,
    absenceDate,
    submittedAt: j.createdAt,
    submittedAgo: relativeInline(j.createdAt),
    reasonDeclared: j.reason,
    certificateType: j.documentType ? DOC_TYPES[j.documentType] : null,
    documentName: j.documentName,
    documentUrl: j.documentUrl,
    status: j.status === 'APPROVED' ? 'aprobada' : j.status === 'REJECTED' ? 'rechazada' : 'pendiente',
    reviewedAt: dateTimeToDisplay(j.reviewedAt),
    rejectionReason: j.status === 'REJECTED' ? j.reviewNotes : undefined,
  };
}

// ---------------------------------------------------------------- comunicados
export const NOTICE_CATEGORY_LABELS: Record<NoticeCategory, string> = {
  URGENT: 'Urgente',
  INSTITUTIONAL: 'Institucional',
  PEDAGOGICAL: 'Pedagógico',
  ACADEMIC: 'Académico',
};

export function mapNotice(n: ApiNotice, scope: ApiPreceptorScope | null): Announcement | null {
  if (n.status === 'ARCHIVED') return null;
  const careerNames = (n.audience.careerIds ?? []).map((id) => scope?.careers.find((c) => c.id === id)?.name ?? 'Carrera');
  const expired = Boolean(n.expiresAt && new Date(n.expiresAt).getTime() <= Date.now());
  return {
    id: n.id,
    title: n.title,
    body: n.content,
    category: (n.category as NoticeCategory) ?? 'INSTITUTIONAL',
    targetCareer: careerNames.length
      ? careerNames.join(', ')
      : n.audience.commissionIds?.length
        ? `${n.audience.commissionIds.length} comisión(es)`
        : 'Toda la institución',
    targetYear: n.audience.years?.length ? n.audience.years.map((y) => `${y}°`).join(', ') : 'Todos',
    createdAt: dateTimeToDisplay(n.publishedAt ?? n.createdAt),
    expiresAt: n.expiresAt ? dateTimeToDisplayDate(n.expiresAt) : undefined,
    status: n.status === 'DRAFT' ? 'borrador' : expired ? 'vencido' : 'vigente',
  };
}

// ---------------------------------------------------------------- mensajes
export interface StudentLookup {
  studentId: string;
  name: string;
  legajo: string;
  courseLabel: string;
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Superadministración',
  DIRECTOR: 'Dirección',
  ADMINISTRATIVE: 'Secretaría',
  PRECEPTOR: 'Preceptoría',
  TEACHER: 'Docente',
  STUDENT: 'Alumno/a',
  STUDENT_REP: 'Centro de Estudiantes',
  AUXILIARY: 'Auxiliar',
};
export const rolesLabel = (roles: string[]) => roles.map((r) => ROLE_LABELS[r] ?? r).join(' · ') || 'Sin rol';

export function mapConversation(c: ApiConversation, byUserId: Map<string, StudentLookup>): Conversation {
  const student = byUserId.get(c.with.id);
  return {
    id: c.with.id,
    studentId: student?.studentId ?? null,
    studentName: student?.name ?? `${c.with.lastName}, ${c.with.firstName}`,
    legajo: student?.legajo ?? rolesLabel(c.with.roles),
    courseLabel: student?.courseLabel ?? (c.with.position || 'Fuera de tus cursos'),
    unreadCount: c.unreadCount,
    lastMessageText: c.lastMessage.text,
    lastMessageTime: dateGroup(c.lastMessage.createdAt) === 'Hoy' ? dateTimeToTime(c.lastMessage.createdAt) : dateGroup(c.lastMessage.createdAt),
    lastMessageAt: c.lastMessage.createdAt,
  };
}

export function mapMessage(m: ApiPrivateMessage, myUserId: string): ChatMessage {
  return {
    id: m.id,
    senderRole: m.senderId === myUserId ? 'preceptor' : 'alumno',
    text: m.text,
    timestamp: dateTimeToTime(m.createdAt),
    dateGroup: dateGroup(m.createdAt),
    read: Boolean(m.readAt),
  };
}

// ------------------------------------------------------------ notificaciones
export function mapNotification(n: ApiNotification): NotificationItem {
  const type: NotificationItem['type'] = n.type.startsWith('JUSTIFICATION')
    ? 'justificacion'
    : n.type === 'MESSAGE'
      ? 'mensaje'
      : n.type === 'ABSENCE'
        ? 'riesgo'
        : n.type === 'FORUM'
          ? 'foro'
          : n.type === 'ANNOUNCEMENT'
            ? 'anuncio'
            : 'general';
  const targetScreen: Record<NotificationItem['type'], string> = {
    justificacion: 'justificaciones',
    mensaje: 'mensajes',
    riesgo: 'alumnos',
    foro: 'comunidad',
    anuncio: 'anuncios',
    general: '',
  };
  return {
    id: n.id,
    type,
    title: n.text,
    description: n.details ?? '',
    timeAgo: relativeTime(n.createdAt),
    isToday: isoDateTimeToDay(n.createdAt) === todayISO(),
    isRead: Boolean(n.readAt),
    targetScreen: targetScreen[type],
  };
}

// ------------------------------------------------------------------- foro
const CHANNELS: Record<ApiForumChannel, ForumChannelId> = { GENERAL: 'general', QUESTIONS: 'consultas', PROPOSALS: 'propuestas' };
export const channelToApi = (c: ForumChannelId): ApiForumChannel =>
  c === 'consultas' ? 'QUESTIONS' : c === 'propuestas' ? 'PROPOSALS' : 'GENERAL';

export function mapThread(t: ApiForumThread): ForumThread {
  return {
    id: t.id,
    channelId: CHANNELS[t.channel] ?? 'general',
    title: t.title,
    body: t.content,
    authorName: t.authorName,
    createdAt: dateTimeToDisplay(t.createdAt),
    status: t.status,
    locked: t.locked,
    replyCount: t.replyCount,
  };
}

export const mapReply = (r: ApiForumReply): ForumReply => ({
  id: r.id,
  authorName: r.authorName,
  text: r.content,
  createdAt: dateTimeToDisplay(r.createdAt),
});

// ---------------------------------------------------- Centro de Estudiantes
const EVENT_TYPES: Record<string, string> = { ACADEMIC: 'Académico', CULTURAL: 'Cultural', SPORTS: 'Deportivo', MEETING: 'Reunión' };

export const mapRepEvent = (e: ApiRepEvent): StudentCenterEvent => ({
  id: e.id,
  title: e.title,
  description: e.description,
  date: isoToDisplay(e.date),
  time: e.time ? `${e.time}${e.endTime ? ` - ${e.endTime}` : ''} hs` : 'Horario a confirmar',
  location: e.location ?? 'Lugar a confirmar',
  interestedCount: e.participantCount,
  category: EVENT_TYPES[e.type] ?? e.type,
  organizer: e.organizer,
});

/** Lista de registros del día → mapa alumno → estado. */
export function recordsByStudent(records: ApiAttendanceRecordView[]): Record<string, AttendanceStatus> {
  const out: Record<string, AttendanceStatus> = {};
  for (const r of records) out[r.studentId] = recordToStatus(r);
  return out;
}
