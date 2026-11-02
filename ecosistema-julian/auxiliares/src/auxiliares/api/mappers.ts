/**
 * Traducción entre los códigos de la API (en inglés, mayúsculas) y los de la pantalla.
 */
import type {
  AppNotificationDTO,
  AuthMe,
  IncidentDTO,
  IncidentPriority as ApiPriority,
  IncidentStatus as ApiIncidentStatus,
  InstallationDTO,
  InstallationStatus,
  MaintenanceLogDTO,
  NoticeDTO,
  ShiftChangeRequestDTO,
  ShiftChangeStatus,
  StaffAbsenceDTO,
  StaffShiftDTO,
  StaffShiftType,
  StaffTaskDTO,
  StaffTaskType,
  UserProfileDTO,
  JustificationStatus,
} from './dto';
import { NOTICE_CATEGORY_LABELS, ROLE_LABELS, STAFF_ABSENCE_REASON_LABELS } from './dto';
import type {
  AbsenceJustification,
  AbsenceStatus,
  CommunityNotice,
  FloorType,
  HistoryEvent,
  Incident,
  IncidentStatus,
  NotificationItem,
  Priority,
  Sector,
  SectorStatus,
  Shift,
  ShiftType,
  SwapStatus,
  Task,
  TaskType,
  TurnSwapRequest,
  UserProfile,
} from '../types';

const invert = <A extends string, B extends string>(map: Record<A, B>) =>
  Object.fromEntries(Object.entries(map).map(([a, b]) => [b, a])) as Record<B, A>;

// ------------------------------------------------------------ enumerados
export const TASK_TYPE_TO_API: Record<TaskType, StaffTaskType> = {
  limpieza: 'CLEANING',
  mantenimiento: 'MAINTENANCE',
  rutina: 'ROUTINE',
};
export const TASK_TYPE_FROM_API = invert(TASK_TYPE_TO_API);

export const PRIORITY_TO_API: Record<Priority, ApiPriority> = {
  alta: 'HIGH',
  media: 'MEDIUM',
  baja: 'LOW',
};
export const PRIORITY_FROM_API = invert(PRIORITY_TO_API);

export const SECTOR_STATUS_TO_API: Record<SectorStatus, InstallationStatus> = {
  ok: 'OK',
  mantenimiento: 'MAINTENANCE',
  fuera_servicio: 'OUT_OF_SERVICE',
};
export const SECTOR_STATUS_FROM_API = invert(SECTOR_STATUS_TO_API);

export const INCIDENT_STATUS_TO_API: Record<IncidentStatus, ApiIncidentStatus> = {
  abierta: 'OPEN',
  en_progreso: 'IN_PROGRESS',
  resuelta: 'RESOLVED',
};
export const INCIDENT_STATUS_FROM_API = invert(INCIDENT_STATUS_TO_API);

export const SHIFT_TYPE_FROM_API: Record<StaffShiftType, ShiftType> = {
  REGULAR: 'normal',
  SWAP: 'cambio',
  OFF: 'libre',
  HOLIDAY: 'feriado',
};

export const SWAP_STATUS_FROM_API: Record<ShiftChangeStatus, SwapStatus> = {
  PENDING: 'pendiente',
  ACCEPTED: 'aceptada',
  REJECTED: 'rechazada',
  CANCELLED: 'cancelada',
};

export const ABSENCE_STATUS_FROM_API: Record<JustificationStatus, AbsenceStatus> = {
  PENDING: 'en_revision',
  APPROVED: 'aprobada',
  REJECTED: 'rechazada',
};

// --------------------------------------------------------------- helpers
/** "Apellido, Nombre" → "Nombre Apellido". */
export const displayName = (apiName: string) => {
  const [last, first] = apiName.split(',').map((p) => p.trim());
  return first ? `${first} ${last}` : apiName;
};

/** Texto del horario de un turno ("07:00 – 13:00" o "Todo el día"). */
export const shiftTimeLabel = (s: { startTime?: string; endTime?: string }) =>
  s.startTime || s.endTime ? `${s.startTime ?? '00:00'} – ${s.endTime ?? '24:00'}` : 'Todo el día';

/** La API guarda el piso como texto libre: se normaliza a las dos plantas del plano. */
export const normalizeFloor = (floor?: string): FloorType =>
  floor && /^(p\s*1|1|primer|piso\s*1|1\s*°?\s*piso)/i.test(floor.trim()) ? 'P1' : 'PB';

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

const SIN_DATO = 'Sin dato';

// --------------------------------------------------------------- mappers
export function toUserProfile(me: AuthMe, profile?: UserProfileDTO | null): UserProfile {
  const { firstName, lastName, email, roles } = me.user;
  const mainRole = roles.includes('STAFF') ? 'STAFF' : roles[0];
  return {
    id: me.user.id,
    name: `${firstName} ${lastName}`.trim(),
    firstName,
    lastName,
    initials: `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?',
    email,
    roleLabel: mainRole ? ROLE_LABELS[mainRole] ?? mainRole : 'Sin rol',
    phone: profile?.phone,
    bio: profile?.bio,
  };
}

export function toSector(i: InstallationDTO): Sector {
  const layout = i.layout ?? { col: 1, row: 1, colSpan: 1, rowSpan: 1 };
  return {
    id: i.id,
    code: i.code ?? '',
    name: i.name,
    floor: normalizeFloor(i.floor),
    status: SECTOR_STATUS_FROM_API[i.status],
    lastCleanedAt: i.lastCleanedAt,
    lastCleanedBy: i.lastCleanedByName,
    grid: {
      col: layout.col ?? 1,
      row: layout.row ?? 1,
      colSpan: layout.colSpan ?? 1,
      rowSpan: layout.rowSpan ?? 1,
    },
    nextTask: i.nextTask,
    notes: i.notes,
  };
}

export function toTask(t: StaffTaskDTO, sectors: Sector[]): Task {
  const sector = t.installationId
    ? sectors.find((s) => s.id === t.installationId)
    : sectors.find((s) => sameName(s.name, t.location));
  return {
    id: t.id,
    title: t.title,
    sectorId: sector?.id,
    sectorName: t.location || sector?.name || SIN_DATO,
    type: TASK_TYPE_FROM_API[t.type],
    scheduledTime: t.startTime,
    scheduledDate: t.date,
    completed: t.status === 'DONE',
    completedAt: t.completedAt,
    completedBy: t.completedByName,
    notes: t.details,
    priority: t.priority ? PRIORITY_FROM_API[t.priority] : undefined,
  };
}

export function toIncident(i: IncidentDTO, sectors: Sector[]): Incident {
  const sector = i.installationId
    ? sectors.find((s) => s.id === i.installationId)
    : sectors.find((s) => sameName(s.name, i.sector));
  return {
    id: i.id,
    sectorId: sector?.id,
    sectorName: i.sector,
    description: i.description,
    priority: PRIORITY_FROM_API[i.priority],
    status: INCIDENT_STATUS_FROM_API[i.status],
    currentSectorStatus: sector?.status,
    reportedBy: i.reportedByName ?? SIN_DATO,
    reportedAt: i.createdAt,
    photoUrl: i.imageUrl,
    notes: i.notes,
    resolvedAt: i.resolvedAt,
    resolvedBy: i.resolvedByName,
  };
}

/**
 * Turnos de una persona con sus compañeros del día (los demás turnos de la misma fecha)
 * y con quién se intercambió (pedidos de cambio aceptados).
 */
export function toShifts(
  all: StaffShiftDTO[],
  userId: string,
  swaps: ShiftChangeRequestDTO[]
): Shift[] {
  return all
    .filter((s) => s.userId === userId)
    .map((s) => {
      const colleagues = all
        .filter((o) => o.date === s.date && o.userId !== userId && o.type !== 'OFF')
        .map((o) => displayName(o.userName));
      const swap = swaps.find(
        (r) =>
          r.status === 'ACCEPTED' &&
          (r.requesterShift.id === s.id || r.colleagueShift.id === s.id)
      );
      const swappedWith = swap
        ? displayName(swap.requesterId === userId ? swap.colleagueName : swap.requesterName)
        : undefined;
      return {
        id: s.id,
        userId: s.userId,
        userName: displayName(s.userName),
        date: s.date,
        dayOfWeek: new Date(`${s.date}T12:00:00`).getDay(),
        startTime: s.startTime,
        endTime: s.endTime,
        type: SHIFT_TYPE_FROM_API[s.type],
        swappedWith,
        colleagues: [...new Set(colleagues)],
        notes: s.notes,
      };
    });
}

/** Pedido de cambio visto desde la persona de la sesión. Null si no participa. */
export function toTurnSwap(r: ShiftChangeRequestDTO, userId: string): TurnSwapRequest | null {
  const sent = r.requesterId === userId;
  if (!sent && r.colleagueId !== userId) return null;
  // Al aceptarse, los titulares de los turnos se intercambian, pero los IDs quedan:
  // requesterShift es siempre el turno que ofreció quien lo pidió.
  const mine = sent ? r.requesterShift : r.colleagueShift;
  const theirs = sent ? r.colleagueShift : r.requesterShift;
  return {
    id: r.id,
    direction: sent ? 'enviada' : 'recibida',
    myShiftDate: mine.date,
    myShiftTime: shiftTimeLabel(mine),
    targetColleague: displayName(sent ? r.colleagueName : r.requesterName),
    targetShiftDate: theirs.date,
    targetShiftTime: shiftTimeLabel(theirs),
    reason: r.reason,
    status: SWAP_STATUS_FROM_API[r.status],
    createdAt: r.createdAt,
  };
}

export function toAbsence(a: StaffAbsenceDTO): AbsenceJustification {
  return {
    id: a.id,
    fromDate: a.fromDate,
    toDate: a.toDate,
    reason: a.reason,
    reasonLabel: STAFF_ABSENCE_REASON_LABELS[a.reason] ?? a.reason,
    notes: a.notes,
    documentName: a.documentName,
    documentUrl: a.documentUrl,
    status: ABSENCE_STATUS_FROM_API[a.status],
    reviewNotes: a.reviewNotes,
    createdAt: a.createdAt,
  };
}

export function toNotice(n: NoticeDTO): CommunityNotice {
  const when = n.publishedAt ?? n.createdAt;
  return {
    id: n.id,
    title: n.title,
    date: new Date(when).toLocaleDateString('es-AR'),
    category: n.category === 'URGENT' ? 'urgente' : 'institucional',
    categoryLabel: NOTICE_CATEGORY_LABELS[n.category] ?? n.category,
    message: n.content,
    read: Boolean(n.readAt),
    priority: n.pinned,
  };
}

export function toNotification(n: AppNotificationDTO): NotificationItem {
  const link = n.link ?? '';
  let type: NotificationItem['type'] = 'aviso';
  let targetScreen: NotificationItem['targetScreen'];
  let targetParams: NotificationItem['targetParams'];
  if (link.includes('shift-changes')) {
    type = 'cambio_turno';
    targetScreen = 'justificaciones';
    targetParams = { tab: 'recibidas' };
  } else if (link.includes('absences')) {
    targetScreen = 'justificaciones';
  } else if (link.includes('incidents')) {
    type = 'incidencia';
    targetScreen = 'incidencias';
  } else if (link.includes('tasks')) {
    type = 'tarea';
    targetScreen = 'tareas';
  } else if (n.type === 'ANNOUNCEMENT') {
    targetScreen = 'comunidad';
  }
  return {
    id: n.id,
    title: n.text,
    message: n.details ?? '',
    timestamp: n.createdAt,
    read: Boolean(n.readAt),
    type,
    targetScreen,
    targetParams,
  };
}

/** Historial armado con lo que ya guarda la API (no hay un endpoint de historial). */
export function toHistory(
  tasks: StaffTaskDTO[],
  incidents: IncidentDTO[],
  maintenance: MaintenanceLogDTO[],
  sectors: Sector[]
): HistoryEvent[] {
  const events: HistoryEvent[] = [];
  for (const t of tasks) {
    if (t.status !== 'DONE' || !t.completedAt) continue;
    events.push({
      id: `task-${t.id}`,
      timestamp: t.completedAt,
      type: 'tarea',
      title: `Completó: ${t.title}`,
      sectorName: t.location || SIN_DATO,
      responsibleName: t.completedByName ?? SIN_DATO,
      details: t.details,
    });
  }
  for (const i of incidents) {
    events.push({
      id: `inc-${i.id}`,
      timestamp: i.createdAt,
      type: 'incidencia_reportada',
      title: `Incidencia reportada (${PRIORITY_FROM_API[i.priority].toUpperCase()}): ${i.sector}`,
      sectorName: i.sector,
      responsibleName: i.reportedByName ?? SIN_DATO,
      details: i.description,
    });
    if (i.status === 'RESOLVED' && i.resolvedAt) {
      events.push({
        id: `res-${i.id}`,
        timestamp: i.resolvedAt,
        type: 'incidencia_resuelta',
        title: `Incidencia resuelta: ${i.sector}`,
        sectorName: i.sector,
        responsibleName: i.resolvedByName ?? SIN_DATO,
        details: i.notes ?? i.description,
      });
    }
  }
  for (const m of maintenance) {
    const sector = m.installationId ? sectors.find((s) => s.id === m.installationId) : undefined;
    events.push({
      id: `mnt-${m.id}`,
      timestamp: m.createdAt,
      type: /limpi|sanitiz|desinfec/i.test(m.task) ? 'limpieza' : 'mantenimiento',
      title: m.task,
      sectorName: sector?.name ?? SIN_DATO,
      responsibleName: m.responsible,
    });
  }
  return events.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}
