import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { addDays, format, subDays } from 'date-fns';
import { toast } from 'sonner';
import {
  ScreenType,
  Sector,
  SectorGridPosition,
  FloorType,
  Task,
  TaskType,
  Incident,
  IncidentStatus,
  Shift,
  TurnSwapRequest,
  AbsenceJustification,
  HistoryEvent,
  CommunityNotice,
  NotificationItem,
  UserProfile,
  StaffPerson,
  ThemeType,
  FontSize,
  SectorConditionOnReport,
  Priority,
} from '../types';
import {
  api,
  errorMessage,
  displayName,
  toAbsence,
  toHistory,
  toIncident,
  toNotice,
  toNotification,
  toSector,
  toShifts,
  toTask,
  toTurnSwap,
  toUserProfile,
  INCIDENT_STATUS_TO_API,
  PRIORITY_TO_API,
  SECTOR_STATUS_TO_API,
  TASK_TYPE_TO_API,
  type AppNotificationDTO,
  type AuthMe,
  type IncidentDTO,
  type InstallationDTO,
  type MaintenanceLogDTO,
  type NoticeDTO,
  type ShiftChangeRequestDTO,
  type StaffAbsenceDTO,
  type StaffAbsenceReason,
  type StaffMemberDTO,
  type StaffShiftDTO,
  type StaffTaskDTO,
  type UserProfileDTO,
} from '../api';

/** Bloques de datos que se piden a la API (cada uno se puede recargar por separado). */
type Section =
  | 'installations'
  | 'tasks'
  | 'incidents'
  | 'maintenance'
  | 'shifts'
  | 'swaps'
  | 'absences'
  | 'people'
  | 'notices'
  | 'notifications'
  | 'profile';

const ALL_SECTIONS: Section[] = [
  'installations',
  'tasks',
  'incidents',
  'maintenance',
  'shifts',
  'swaps',
  'absences',
  'people',
  'notices',
  'notifications',
  'profile',
];

const SECTION_LABELS: Record<Section, string> = {
  installations: 'plano de sectores',
  tasks: 'tareas',
  incidents: 'incidencias',
  maintenance: 'registro de mantenimiento',
  shifts: 'turnos',
  swaps: 'cambios de turno',
  absences: 'justificaciones',
  people: 'equipo de auxiliares',
  notices: 'avisos',
  notifications: 'notificaciones',
  profile: 'perfil',
};

/** Ventana de turnos que se carga (para el inicio y el formulario de cambio). */
const SHIFT_WINDOW_PAST_DAYS = 14;
const SHIFT_WINDOW_FUTURE_DAYS = 56;

export const todayISO = () => format(new Date(), 'yyyy-MM-dd');

interface AuxiliaresContextType {
  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType, params?: Record<string, any>) => void;
  screenParams: Record<string, any>;

  // Sesión y estado de carga
  me: AuthMe;
  userProfile: UserProfile;
  loading: boolean;
  loadErrors: string[];
  /** true si no se pudo cargar ningún bloque (API caída o sin red). */
  allFailed: boolean;
  reload: () => Promise<void>;
  logout: () => Promise<void>;

  // Datos de la API (ya traducidos a la pantalla)
  sectors: Sector[];
  /** Tareas de hoy. */
  tasks: Task[];
  incidents: Incident[];
  /** Mis turnos en la ventana cargada. */
  shifts: Shift[];
  /** Turnos de todo el equipo en la ventana cargada (para pedir un cambio). */
  teamShifts: Shift[];
  /** Traduce turnos de la API a los de la pantalla (para semanas fuera de la ventana). */
  mapMyShifts: (dtos: StaffShiftDTO[]) => Shift[];
  shiftsVersion: number;
  people: StaffPerson[];
  turnSwaps: TurnSwapRequest[];
  absences: AbsenceJustification[];
  historyEvents: HistoryEvent[];
  communityNotices: CommunityNotice[];
  notifications: NotificationItem[];

  // Preferencias locales
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  fontSize: FontSize;
  setFontSize: (s: FontSize) => void;
  reduceMotion: boolean;
  setReduceMotion: (r: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (o: boolean) => void;
  activePhotoViewerUrl: string | null;
  setActivePhotoViewerUrl: (url: string | null) => void;
  showIntro: boolean;
  setShowIntro: (s: boolean) => void;

  // Acciones (devuelven false si la API rechazó el cambio; el error ya se mostró en un toast)
  toggleTaskComplete: (taskId: string) => Promise<{ undo: () => Promise<void> } | null>;
  createTask: (data: {
    title: string;
    sectorId?: string;
    location?: string;
    type: TaskType;
    scheduledTime: string;
    priority?: Priority;
    notes?: string;
  }) => Promise<boolean>;
  reportIncident: (data: {
    sectorId: string;
    description: string;
    priority: Incident['priority'];
    sectorConditionOnReport: SectorConditionOnReport;
    photoUrl?: string;
  }) => Promise<Incident | null>;
  updateIncidentStatus: (
    incidentId: string,
    status: IncidentStatus,
    restoreSectorOk?: boolean
  ) => Promise<boolean>;
  markSectorClean: (sectorId: string) => Promise<boolean>;
  updateSectorLayout: (sectorId: string, grid: SectorGridPosition) => Promise<boolean>;
  addSector: (data: {
    code: string;
    name: string;
    floor: FloorType;
    colSpan: number;
    rowSpan: number;
  }) => Promise<boolean>;
  removeSector: (sectorId: string) => Promise<boolean>;
  requestTurnSwap: (data: {
    requesterShiftId: string;
    colleagueShiftId: string;
    reason?: string;
  }) => Promise<boolean>;
  respondToTurnSwap: (swapId: string, accept: boolean) => Promise<boolean>;
  cancelTurnSwap: (swapId: string) => Promise<boolean>;
  submitAbsence: (data: {
    fromDate: string;
    toDate?: string;
    reason: StaffAbsenceReason;
    notes: string;
    documentName?: string;
    documentUrl?: string;
  }) => Promise<boolean>;
  withdrawAbsence: (absenceId: string) => Promise<boolean>;
  markNoticeRead: (noticeId: string) => Promise<boolean>;
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  saveProfile: (data: { phone: string; bio: string }) => Promise<boolean>;
}

const AuxiliaresContext = createContext<AuxiliaresContextType | undefined>(undefined);

export const AuxiliaresProvider: React.FC<{
  me: AuthMe;
  onLogout: () => Promise<void>;
  children: React.ReactNode;
}> = ({ me, onLogout, children }) => {
  const userId = me.user.id;

  const [currentScreen, setCurrentScreenState] = useState<ScreenType>('tareas');
  const [screenParams, setScreenParams] = useState<Record<string, any>>({});

  // ---------------------------------------------------------- datos de la API
  const [installations, setInstallations] = useState<InstallationDTO[]>([]);
  const [taskDtos, setTaskDtos] = useState<StaffTaskDTO[]>([]);
  const [incidentDtos, setIncidentDtos] = useState<IncidentDTO[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceLogDTO[]>([]);
  const [shiftDtos, setShiftDtos] = useState<StaffShiftDTO[]>([]);
  const [shiftsVersion, setShiftsVersion] = useState(0);
  const [swapDtos, setSwapDtos] = useState<ShiftChangeRequestDTO[]>([]);
  const [absenceDtos, setAbsenceDtos] = useState<StaffAbsenceDTO[]>([]);
  const [peopleDtos, setPeopleDtos] = useState<StaffMemberDTO[]>([]);
  const [noticeDtos, setNoticeDtos] = useState<NoticeDTO[]>([]);
  const [notificationDtos, setNotificationDtos] = useState<AppNotificationDTO[]>([]);
  const [profileDto, setProfileDto] = useState<UserProfileDTO | null>(null);

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<Section, string>>>({});

  // ---------------------------------------------------- preferencias locales
  const [theme, setThemeState] = useState<ThemeType>('celestial');
  const [fontSize, setFontSizeState] = useState<FontSize>('normal');
  const [reduceMotion, setReduceMotionState] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [activePhotoViewerUrl, setActivePhotoViewerUrl] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState<boolean>(true);

  const setTheme = (t: ThemeType) => {
    setThemeState(t);
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('isfd26_theme', t);
  };

  const setFontSize = (s: FontSize) => {
    setFontSizeState(s);
    document.documentElement.setAttribute('data-font-size', s);
    localStorage.setItem('isfd26_font_size', s);
  };

  const setReduceMotion = (r: boolean) => {
    setReduceMotionState(r);
    document.documentElement.setAttribute('data-reduce-motion', r ? 'true' : 'false');
    localStorage.setItem('isfd26_reduce_motion', r ? 'true' : 'false');
  };

  // Load persisted theme/preferences on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('isfd26_theme') as ThemeType;
    if (savedTheme) {
      setThemeState(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'celestial');
    }

    const savedFontSize = localStorage.getItem('isfd26_font_size') as FontSize;
    if (savedFontSize) {
      setFontSizeState(savedFontSize);
      document.documentElement.setAttribute('data-font-size', savedFontSize);
    } else {
      document.documentElement.setAttribute('data-font-size', 'normal');
    }

    const savedReduce = localStorage.getItem('isfd26_reduce_motion');
    if (savedReduce === 'true') {
      setReduceMotionState(true);
      document.documentElement.setAttribute('data-reduce-motion', 'true');
    }
  }, []);

  const setCurrentScreen = (screen: ScreenType, params: Record<string, any> = {}) => {
    setCurrentScreenState(screen);
    setScreenParams(params);
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  // ------------------------------------------------------------------ carga
  const loaders = useMemo<Record<Section, () => Promise<void>>>(
    () => ({
      installations: () => api.getInstallations().then(setInstallations),
      // Sin fecha: trae las últimas tareas (hoy para la jornada; completadas para el historial).
      tasks: () => api.getTasks().then(setTaskDtos),
      incidents: () => api.getIncidents().then(setIncidentDtos),
      maintenance: () => api.getMaintenanceLog().then(setMaintenance),
      shifts: () => {
        const now = new Date();
        return api
          .getShifts({
            from: format(subDays(now, SHIFT_WINDOW_PAST_DAYS), 'yyyy-MM-dd'),
            to: format(addDays(now, SHIFT_WINDOW_FUTURE_DAYS), 'yyyy-MM-dd'),
          })
          .then((rows) => {
            setShiftDtos(rows);
            setShiftsVersion((v) => v + 1);
          });
      },
      swaps: () => api.getShiftChanges().then(setSwapDtos),
      absences: () => api.getAbsences().then(setAbsenceDtos),
      people: () => api.getStaffPeople().then(setPeopleDtos),
      notices: () => api.getNotices().then(setNoticeDtos),
      notifications: () => api.getNotifications().then(setNotificationDtos),
      profile: () => api.getMyProfile().then(setProfileDto),
    }),
    []
  );

  const refresh = useCallback(
    async (...sections: Section[]) => {
      const results = await Promise.allSettled(sections.map((s) => loaders[s]()));
      setErrors((prev) => {
        const next = { ...prev };
        results.forEach((r, idx) => {
          const section = sections[idx];
          if (r.status === 'fulfilled') delete next[section];
          else next[section] = errorMessage(r.reason, 'No se pudo cargar.');
        });
        return next;
      });
    },
    [loaders]
  );

  const reload = useCallback(async () => {
    setLoading(true);
    await refresh(...ALL_SECTIONS);
    setLoading(false);
  }, [refresh]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Las notificaciones se vuelven a pedir cada minuto (pedidos de cambio, respuestas, etc.).
  useEffect(() => {
    const timer = window.setInterval(() => void refresh('notifications'), 60_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  /** Ejecuta un cambio en la API, recarga lo afectado y avisa si falló. */
  const run = async (fn: () => Promise<unknown>, after: Section[]): Promise<boolean> => {
    try {
      await fn();
      await refresh(...after);
      return true;
    } catch (error) {
      toast.error(errorMessage(error));
      if (after.length) void refresh(...after);
      return false;
    }
  };

  // ----------------------------------------------------- datos derivados
  const userProfile = useMemo(() => toUserProfile(me, profileDto), [me, profileDto]);
  const sectors = useMemo(() => installations.map(toSector), [installations]);
  const today = todayISO();
  const tasks = useMemo(
    () => taskDtos.filter((t) => t.date === today).map((t) => toTask(t, sectors)),
    [taskDtos, sectors, today]
  );
  const incidents = useMemo(
    () => incidentDtos.map((i) => toIncident(i, sectors)),
    [incidentDtos, sectors]
  );
  const mapMyShifts = useCallback(
    (dtos: StaffShiftDTO[]) => toShifts(dtos, userId, swapDtos),
    [userId, swapDtos]
  );
  const shifts = useMemo(() => mapMyShifts(shiftDtos), [mapMyShifts, shiftDtos]);
  const teamShifts = useMemo(() => {
    const ids = [...new Set(shiftDtos.map((s) => s.userId))];
    return ids.flatMap((id) => toShifts(shiftDtos, id, swapDtos));
  }, [shiftDtos, swapDtos]);
  const people = useMemo(
    () =>
      peopleDtos.map((p) => ({ id: p.id, name: displayName(`${p.lastName}, ${p.firstName}`) })),
    [peopleDtos]
  );
  const turnSwaps = useMemo(
    () =>
      swapDtos
        .map((r) => toTurnSwap(r, userId))
        .filter((r): r is TurnSwapRequest => r !== null),
    [swapDtos, userId]
  );
  const absences = useMemo(
    () => absenceDtos.filter((a) => a.userId === userId).map(toAbsence),
    [absenceDtos, userId]
  );
  const historyEvents = useMemo(
    () => toHistory(taskDtos, incidentDtos, maintenance, sectors),
    [taskDtos, incidentDtos, maintenance, sectors]
  );
  const communityNotices = useMemo(() => noticeDtos.map(toNotice), [noticeDtos]);
  const notifications = useMemo(
    () => notificationDtos.map(toNotification),
    [notificationDtos]
  );
  const loadErrors = useMemo(
    () =>
      (Object.entries(errors) as [Section, string][]).map(
        ([section, message]) => `${SECTION_LABELS[section]}: ${message}`
      ),
    [errors]
  );

  // ------------------------------------------------------------- acciones
  const toggleTaskComplete = async (taskId: string) => {
    const target = taskDtos.find((t) => t.id === taskId);
    if (!target) return null;
    const previous = target.status;
    const next = previous === 'DONE' ? 'PENDING' : 'DONE';
    // Se marca al instante; si la API lo rechaza, la recarga lo vuelve atrás.
    setTaskDtos((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: next } : t)));
    const ok = await run(() => api.setTaskStatus(taskId, next), ['tasks']);
    if (!ok) return null;
    return {
      undo: async () => {
        setTaskDtos((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: previous } : t))
        );
        await run(() => api.setTaskStatus(taskId, previous), ['tasks']);
      },
    };
  };

  const createTask: AuxiliaresContextType['createTask'] = (data) =>
    run(
      () =>
        api.createTask({
          date: todayISO(),
          startTime: data.scheduledTime,
          title: data.title,
          type: TASK_TYPE_TO_API[data.type],
          priority: data.priority ? PRIORITY_TO_API[data.priority] : undefined,
          installationId: data.sectorId || undefined,
          location: data.sectorId ? undefined : data.location,
          details: data.notes,
        }),
      ['tasks']
    );

  const reportIncident: AuxiliaresContextType['reportIncident'] = async (data) => {
    const sector = sectors.find((s) => s.id === data.sectorId);
    if (!sector) {
      toast.error('Elegí el sector donde ocurrió.');
      return null;
    }
    const created: { value?: IncidentDTO } = {};
    const ok = await run(async () => {
      created.value = await api.createIncident({
        description: data.description,
        priority: PRIORITY_TO_API[data.priority],
        sector: sector.name,
        installationId: sector.id,
        imageUrl: data.photoUrl,
        // "Sigue en uso" no cambia el estado del sector en el plano.
        installationStatus:
          data.sectorConditionOnReport === 'en_uso'
            ? undefined
            : SECTOR_STATUS_TO_API[data.sectorConditionOnReport],
      });
    }, ['incidents', 'installations']);
    return ok && created.value ? toIncident(created.value, sectors) : null;
  };

  const updateIncidentStatus: AuxiliaresContextType['updateIncidentStatus'] = (
    incidentId,
    status,
    restoreSectorOk
  ) =>
    run(
      () =>
        api.updateIncident(incidentId, {
          status: INCIDENT_STATUS_TO_API[status],
          restoreInstallation: status === 'resuelta' ? Boolean(restoreSectorOk) : undefined,
        }),
      ['incidents', 'installations']
    );

  // Marca el sector limpio y lo deja anotado en el registro de mantenimiento (Historial).
  const markSectorClean = async (sectorId: string) => {
    const sector = sectors.find((s) => s.id === sectorId);
    if (!sector) return false;
    return run(async () => {
      await api.updateInstallation(sectorId, { cleanedNow: true });
      await api.createMaintenanceLog({
        date: todayISO(),
        task: `Limpieza y desinfección: ${sector.name}`,
        responsible: userProfile.name,
        installationId: sectorId,
      });
    }, ['installations', 'maintenance']);
  };

  const updateSectorLayout = (sectorId: string, grid: SectorGridPosition) =>
    run(() => api.updateInstallation(sectorId, { layout: grid }), ['installations']);

  const addSector: AuxiliaresContextType['addSector'] = (data) => {
    // Se ubica debajo del último sector de esa planta.
    const sameFloor = sectors.filter((s) => s.floor === data.floor);
    const row = sameFloor.reduce((max, s) => Math.max(max, s.grid.row + s.grid.rowSpan), 1);
    return run(
      () =>
        api.createInstallation({
          name: data.name,
          code: data.code || undefined,
          floor: data.floor,
          status: 'OK',
          layout: { col: 1, row, colSpan: data.colSpan, rowSpan: data.rowSpan },
        }),
      ['installations']
    );
  };

  const removeSector = (sectorId: string) =>
    run(() => api.deleteInstallation(sectorId), ['installations']);

  const requestTurnSwap: AuxiliaresContextType['requestTurnSwap'] = (data) =>
    run(() => api.createShiftChange(data), ['swaps']);

  const respondToTurnSwap = (swapId: string, accept: boolean) =>
    run(() => api.respondShiftChange(swapId, accept ? 'ACCEPTED' : 'REJECTED'), [
      'swaps',
      'shifts',
    ]);

  const cancelTurnSwap = (swapId: string) =>
    run(() => api.respondShiftChange(swapId, 'CANCELLED'), ['swaps']);

  const submitAbsence: AuxiliaresContextType['submitAbsence'] = (data) =>
    run(() => api.createAbsence(data), ['absences']);

  const withdrawAbsence = (absenceId: string) =>
    run(() => api.deleteAbsence(absenceId), ['absences']);

  const markNoticeRead = (noticeId: string) =>
    run(() => api.markNoticeRead(noticeId), ['notices']);

  const markNotificationRead = (notifId: string) => {
    const target = notificationDtos.find((n) => n.id === notifId);
    if (!target || target.readAt) return;
    const now = new Date().toISOString();
    setNotificationDtos((prev) => prev.map((n) => (n.id === notifId ? { ...n, readAt: now } : n)));
    void run(() => api.markNotificationsRead([notifId]), ['notifications']);
  };

  const markAllNotificationsRead = () => {
    const now = new Date().toISOString();
    setNotificationDtos((prev) => prev.map((n) => (n.readAt ? n : { ...n, readAt: now })));
    void run(() => api.markNotificationsRead(), ['notifications']);
  };

  const saveProfile = (data: { phone: string; bio: string }) =>
    run(
      () =>
        api.updateMyProfile({
          phone: data.phone.trim() || null,
          bio: data.bio.trim() || null,
        }),
      ['profile']
    );

  return (
    <AuxiliaresContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        screenParams,
        me,
        userProfile,
        loading,
        loadErrors,
        allFailed: Object.keys(errors).length === ALL_SECTIONS.length,
        reload,
        logout: onLogout,
        sectors,
        tasks,
        incidents,
        shifts,
        teamShifts,
        mapMyShifts,
        shiftsVersion,
        people,
        turnSwaps,
        absences,
        historyEvents,
        communityNotices,
        notifications,
        theme,
        setTheme,
        fontSize,
        setFontSize,
        reduceMotion,
        setReduceMotion,
        notificationsOpen,
        setNotificationsOpen,
        activePhotoViewerUrl,
        setActivePhotoViewerUrl,
        showIntro,
        setShowIntro,
        toggleTaskComplete,
        createTask,
        reportIncident,
        updateIncidentStatus,
        markSectorClean,
        updateSectorLayout,
        addSector,
        removeSector,
        requestTurnSwap,
        respondToTurnSwap,
        cancelTurnSwap,
        submitAbsence,
        withdrawAbsence,
        markNoticeRead,
        markNotificationRead,
        markAllNotificationsRead,
        saveProfile,
      }}
    >
      {children}
    </AuxiliaresContext.Provider>
  );
};

export const useAuxiliares = () => {
  const context = useContext(AuxiliaresContext);
  if (!context) {
    throw new Error('useAuxiliares debe usarse dentro de un AuxiliaresProvider');
  }
  return context;
};
