/**
 * Tipos de datos para el módulo Panel de Auxiliares - ISFDyT N° 26.
 * Son los tipos de la pantalla; api/mappers.ts los arma a partir de los DTO de la API.
 */
import type { StaffAbsenceReason } from './api/dto';

export type ScreenType =
  | 'tareas'
  | 'incidencias'
  | 'reportar'
  | 'plano'
  | 'turnos'
  | 'justificaciones'
  | 'historial'
  | 'comunidad'
  | 'perfil'
  | 'opciones';

export type SectorStatus = 'ok' | 'mantenimiento' | 'fuera_servicio';

export interface SectorGridPosition {
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
}

export type FloorType = 'PB' | 'P1';

export interface Sector {
  id: string;
  /** Código corto; si el sector no tiene uno cargado, queda vacío. */
  code: string;
  name: string;
  floor: FloorType;
  status: SectorStatus;
  lastCleanedAt?: string; // ISO
  lastCleanedBy?: string;
  grid: SectorGridPosition;
  nextTask?: string;
  notes?: string;
}

export type TaskType = 'limpieza' | 'mantenimiento' | 'rutina';
export type Priority = 'alta' | 'media' | 'baja';

export interface Task {
  id: string;
  title: string;
  /** Sector del plano, si la tarea está asociada a uno. */
  sectorId?: string;
  sectorName: string;
  type: TaskType;
  scheduledTime: string; // HH:mm
  scheduledDate: string; // yyyy-MM-dd
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
  priority?: Priority;
}

export type IncidentPriority = Priority;
export type IncidentStatus = 'abierta' | 'en_progreso' | 'resuelta';
export type SectorConditionOnReport = 'en_uso' | 'mantenimiento' | 'fuera_servicio';

export interface Incident {
  id: string;
  sectorId?: string;
  sectorName: string;
  description: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  /** Estado actual del sector en el plano (la API no guarda el estado al momento del reporte). */
  currentSectorStatus?: SectorStatus;
  reportedBy: string;
  reportedAt: string; // ISO
  photoUrl?: string;
  notes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export type ShiftType = 'normal' | 'cambio' | 'libre' | 'feriado';

export interface Shift {
  id: string;
  userId: string;
  /** "Nombre Apellido" */
  userName: string;
  date: string; // yyyy-MM-dd
  dayOfWeek: number; // 0=Dom, 1=Lun, ..., 6=Sab
  /** Sin horario = todo el día. */
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  type: ShiftType;
  swappedWith?: string;
  colleagues: string[];
  notes?: string;
}

export type SwapStatus = 'pendiente' | 'aceptada' | 'rechazada' | 'cancelada';

export interface TurnSwapRequest {
  id: string;
  direction: 'enviada' | 'recibida';
  myShiftDate: string;
  myShiftTime: string;
  targetColleague: string;
  targetShiftDate: string;
  targetShiftTime: string;
  reason?: string;
  status: SwapStatus;
  createdAt: string;
}

export type AbsenceStatus = 'en_revision' | 'aprobada' | 'rechazada';

export interface AbsenceJustification {
  id: string;
  fromDate: string;
  toDate: string;
  reason: StaffAbsenceReason;
  reasonLabel: string;
  notes: string;
  documentName?: string;
  documentUrl?: string;
  status: AbsenceStatus;
  reviewNotes?: string;
  createdAt: string;
}

export type HistoryEventType =
  | 'tarea'
  | 'incidencia_reportada'
  | 'incidencia_resuelta'
  | 'limpieza'
  | 'mantenimiento';

export interface HistoryEvent {
  id: string;
  timestamp: string; // ISO
  type: HistoryEventType;
  title: string;
  sectorName: string;
  responsibleName: string;
  details?: string;
}

export interface CommunityNotice {
  id: string;
  title: string;
  date: string;
  category: 'urgente' | 'institucional';
  categoryLabel: string;
  message: string;
  read: boolean;
  priority?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string; // ISO
  read: boolean;
  type: 'tarea' | 'incidencia' | 'cambio_turno' | 'aviso';
  targetScreen?: ScreenType;
  targetParams?: Record<string, string>;
}

export interface StaffPerson {
  id: string;
  name: string;
}

export type ThemeType =
  | 'celestial'
  | 'oscuro'
  | 'ensonacion'
  | 'moderno'
  | 'fantasma'
  | 'rebelde';

export type FontSize = 'normal' | 'large' | 'xlarge';

/** Datos de la sesión (/auth/me) + perfil social (/social/profiles/me). */
export interface UserProfile {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  initials: string;
  email: string;
  roleLabel: string;
  phone?: string;
  bio?: string;
}
