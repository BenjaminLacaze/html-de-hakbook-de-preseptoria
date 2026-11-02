/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Estado del Panel de Preceptores, cargado desde la API institucional.
 * Nada se calcula acá: porcentajes, riesgo y faltas restantes vienen del backend.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import {
  Course,
  Subject,
  Student,
  JustificationRequest,
  Announcement,
  Conversation,
  NotificationItem,
  DailyClassSession,
  ForumThread,
  ForumChannelId,
  StudentCenterEvent,
  AttendanceStatus,
  NoticeCategory,
  PreceptorProfile,
  RuleSettings,
} from '../types';
import {
  academicApi,
  attendanceApi,
  centroApi,
  recordsApi,
  socialApi,
  errorMessage,
  buildCourses,
  channelToApi,
  courseIdOf,
  dateTimeToTime,
  mapCommission,
  mapConversation,
  mapJustification,
  mapMessage,
  mapNotice,
  mapNotification,
  mapRepEvent,
  mapReply,
  mapSummary,
  mapThread,
  recordsByStudent,
  rolesLabel,
  statusToApi,
  todayISO,
  todayWeekday,
  isoToDisplay,
} from '../api';
import type {
  ApiAttendanceRecordView,
  ApiAttendanceSummary,
  ApiCommissionView,
  ApiNotice,
  ApiPreceptorScope,
  ApiUserProfile,
  StudentLookup,
} from '../api';
import { StudentCondition } from '../config/bedeliaRules';
import { usePreceptorSession } from '../auth/SessionGate';
import { toast } from 'sonner';

export type ScreenId =
  | 'inicio'
  | 'asistencia'
  | 'historial'
  | 'alumnos'
  | 'justificaciones'
  | 'anuncios'
  | 'mensajes'
  | 'analisis'
  | 'comunidad'
  | 'opciones'
  | 'perfil';

type LoadState = 'loading' | 'ready' | 'error';

export interface RollCallSummary {
  presents: number;
  tardies: number;
  absents: number;
  justified: number;
  unregistered: number;
  saved: number;
}

interface PreceptorContextType {
  activeScreen: ScreenId;
  setActiveScreen: (screen: ScreenId) => void;

  // Carga
  loadState: LoadState;
  loadError: string;
  reload: () => void;
  courseLoading: boolean;
  courseError: string;
  /** Sube después de cada cambio de asistencia: las pantallas que piden datos propios lo usan para refrescar. */
  attendanceVersion: number;

  // Sesión y perfil
  profile: PreceptorProfile;
  logout: () => Promise<void>;
  ruleSettings: RuleSettings | null;

  // Cursos y materias (derivados de las comisiones a cargo)
  currentCourse: Course;
  setCurrentCourse: (course: Course) => void;
  availableCourses: Course[];
  subjects: Subject[];
  allSubjects: Subject[];
  selectedSubjectId: string;
  setSelectedSubjectId: (id: string) => void;
  selectedSubject: Subject | null;

  // Datos
  students: Student[];
  justifications: JustificationRequest[];
  announcements: Announcement[];
  conversations: Conversation[];
  notifications: NotificationItem[];
  todayClasses: DailyClassSession[];
  forumThreads: ForumThread[];
  studentCenterEvents: StudentCenterEvent[];

  // Filtros y navegación
  alumnosFilterCondition: StudentCondition | 'todas';
  setAlumnosFilterCondition: (cond: StudentCondition | 'todas') => void;
  alumnosSearchQuery: string;
  setAlumnosSearchQuery: (query: string) => void;
  justificacionesTab: 'pendientes' | 'aprobadas' | 'rechazadas';
  setJustificacionesTab: (tab: 'pendientes' | 'aprobadas' | 'rechazadas') => void;
  goTakeAttendance: (commissionId: string) => void;

  // Ficha del alumno
  selectedStudentForProfile: Student | null;
  openStudentProfile: (student: Student) => void;
  closeStudentProfile: () => void;

  // Toma de asistencia (materia = comisión + fecha)
  rollCallDraft: Record<string, AttendanceStatus>;
  rollCallBaseline: Record<string, AttendanceStatus>;
  rollCallLoading: boolean;
  rollCallSaving: boolean;
  setRollCallStatus: (studentId: string, status: AttendanceStatus) => void;
  markAllPresent: () => void;
  hasUnsavedRollCall: boolean;
  saveRollCall: () => Promise<RollCallSummary | null>;
  discardRollCallChanges: () => void;
  rollCallDate: string; // YYYY-MM-DD
  setRollCallDate: (date: string) => void;

  // Acciones
  approveJustification: (id: string) => Promise<void>;
  rejectJustification: (id: string, reason: string) => Promise<void>;
  batchApproveJustifications: (ids: string[]) => Promise<void>;
  correctAttendanceRecord: (
    studentId: string,
    isoDate: string,
    commissionId: string,
    previousStatus: AttendanceStatus,
    newStatus: AttendanceStatus,
    reason: string,
  ) => Promise<boolean>;
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  loadConversation: (userId: string) => Promise<void>;
  startConversationWithStudent: (student: Student) => void;
  sendChatMessage: (userId: string, text: string) => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  createAnnouncement: (input: {
    title: string;
    body: string;
    category: NoticeCategory;
    careerId: string;
    year: number | null;
    expiresAt?: string; // YYYY-MM-DD
  }) => Promise<boolean>;
  deleteAnnouncement: (id: string) => Promise<void>;
  createForumThread: (channelId: ForumChannelId, title: string, body: string) => Promise<boolean>;
  loadThreadReplies: (threadId: string) => Promise<void>;
  addForumReply: (threadId: string, text: string) => Promise<void>;

  counts: {
    pendingJustifications: number;
    atRiskStudents: number;
    libreStudents: number;
    unreadMessages: number;
    unreadNotifications: number;
  };

  isNotificationDrawerOpen: boolean;
  setIsNotificationDrawerOpen: (open: boolean) => void;
  isMobileMoreMenuOpen: boolean;
  setIsMobileMoreMenuOpen: (open: boolean) => void;

  showIntroVideo: boolean;
  setShowIntroVideo: (show: boolean) => void;
  openIntroVideo: () => void;
}

const PreceptorContext = createContext<PreceptorContextType | undefined>(undefined);

const COURSE_KEY = 'i26.preceptor.course.v1';
const VALID_SCREENS: ScreenId[] = ['inicio', 'asistencia', 'historial', 'alumnos', 'justificaciones', 'anuncios', 'mensajes', 'analisis', 'comunidad', 'opciones', 'perfil'];

const EMPTY_COURSE: Course = {
  id: '',
  careerId: '',
  careerName: 'Sin cursos asignados',
  year: 0,
  yearLabel: '',
  shift: '',
  division: '',
  fullLabel: 'Sin cursos asignados',
};

const readStored = (key: string) => {
  try {
    return localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
};

export const PreceptorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { me, logout } = usePreceptorSession();
  const myUserId = me.user.id;

  const [activeScreen, setActiveScreenState] = useState<ScreenId>(() => {
    const hash = window.location.hash.replace('#', '') as ScreenId;
    return VALID_SCREENS.includes(hash) ? hash : 'inicio';
  });

  const setActiveScreen = (screen: ScreenId) => {
    setActiveScreenState(screen);
    window.location.hash = screen;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ------------------------------------------------------------- datos base
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [scope, setScope] = useState<ApiPreceptorScope | null>(null);
  const [commissions, setCommissions] = useState<ApiCommissionView[]>([]);
  const [ruleSettings, setRuleSettings] = useState<RuleSettings | null>(null);
  const [apiProfile, setApiProfile] = useState<ApiUserProfile | null>(null);
  const [rawNotices, setRawNotices] = useState<ApiNotice[]>([]);
  const [justifications, setJustifications] = useState<JustificationRequest[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [forumThreads, setForumThreads] = useState<ForumThread[]>([]);
  const [studentCenterEvents, setStudentCenterEvents] = useState<StudentCenterEvent[]>([]);
  const [todayRecords, setTodayRecords] = useState<ApiAttendanceRecordView[]>([]);
  const [attendanceVersion, setAttendanceVersion] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const refreshJustifications = useCallback(async () => {
    setJustifications((await attendanceApi.justifications()).map(mapJustification));
  }, []);
  const refreshNotices = useCallback(async () => setRawNotices(await recordsApi.myNotices()), []);
  const refreshNotifications = useCallback(async () => {
    setNotifications((await socialApi.notifications()).map(mapNotification));
  }, []);
  const refreshForum = useCallback(async () => {
    const rows = (await socialApi.forum()).map(mapThread);
    setForumThreads((prev) => rows.map((t) => ({ ...t, replies: prev.find((p) => p.id === t.id && p.replyCount === t.replyCount)?.replies })));
  }, []);
  const refreshTodayRecords = useCallback(async () => {
    const today = todayISO();
    setTodayRecords(await attendanceApi.list({ from: today, to: today }));
  }, []);

  useEffect(() => {
    let active = true;
    setLoadState('loading');
    setLoadError('');
    (async () => {
      try {
        // Lo imprescindible: sin esto no hay panel.
        const [scopeRes, commissionsRes, settingsRes] = await Promise.all([
          academicApi.scope(),
          academicApi.commissions(),
          recordsApi.settings(),
        ]);
        if (!active) return;
        setScope(scopeRes);
        setCommissions(commissionsRes);
        setRuleSettings({
          minAttendancePercent: settingsRes.minAttendancePercent,
          attendanceRiskThresholdPercent: settingsRes.attendanceRiskThresholdPercent,
          lateArrivalAbsenceWeight: settingsRes.lateArrivalAbsenceWeight,
          institutionName: settingsRes.shortName || settingsRes.name,
        });
        setLoadState('ready');

        // El resto se carga en paralelo; si algo falla, se avisa sin bloquear el panel.
        const results = await Promise.allSettled([
          refreshJustifications(),
          refreshNotices(),
          refreshNotifications(),
          refreshForum(),
          refreshTodayRecords(),
          socialApi.conversations().then((rows) => active && setConversationsRaw(rows)),
          centroApi.events().then((rows) => active && setStudentCenterEvents(rows.map(mapRepEvent))),
          socialApi.myProfile().then((p) => active && setApiProfile(p)),
        ]);
        const failed = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
        if (active && failed.length) {
          toast.error('Parte de la información no se pudo cargar', { description: errorMessage(failed[0].reason) });
        }
      } catch (reason) {
        if (!active) return;
        setLoadError(errorMessage(reason, 'No se pudo cargar el panel.'));
        setLoadState('error');
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  // Lo que llega de otros paneles (justificaciones de alumnos, mensajes, avisos) se actualiza
  // al volver a la pestaña y cada minuto mientras está visible, sin recargar la página.
  useEffect(() => {
    if (loadState !== 'ready') return;
    const refresh = () => {
      if (document.visibilityState !== 'visible') return;
      void Promise.allSettled([
        refreshJustifications(),
        refreshNotifications(),
        socialApi.conversations().then(setConversationsRaw),
      ]);
    };
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, [loadState, refreshJustifications, refreshNotifications]);

  // ---------------------------------------------------- cursos y materias
  const availableCourses = useMemo(() => buildCourses(commissions), [commissions]);
  const allSubjects = useMemo(
    () => commissions.map(mapCommission).sort((a, b) => a.name.localeCompare(b.name, 'es')),
    [commissions],
  );
  const [currentCourseId, setCurrentCourseId] = useState<string>(() => readStored(COURSE_KEY));
  const currentCourse = useMemo(
    () => availableCourses.find((c) => c.id === currentCourseId) ?? availableCourses[0] ?? EMPTY_COURSE,
    [availableCourses, currentCourseId],
  );
  const setCurrentCourse = (course: Course) => {
    setCurrentCourseId(course.id);
    try {
      localStorage.setItem(COURSE_KEY, course.id);
    } catch {
      /* el navegador no guarda preferencias: no pasa nada */
    }
  };

  const subjects = useMemo(() => allSubjects.filter((s) => s.courseId === currentCourse.id), [allSubjects, currentCourse.id]);
  const [selectedSubjectIdState, setSelectedSubjectId] = useState<string>('');
  const selectedSubject = useMemo(
    () => subjects.find((s) => s.id === selectedSubjectIdState) ?? subjects[0] ?? null,
    [subjects, selectedSubjectIdState],
  );
  const selectedSubjectId = selectedSubject?.id ?? '';

  // ------------------------------------------- resúmenes del curso (backend)
  const [summaries, setSummaries] = useState<Record<string, ApiAttendanceSummary[]>>({});
  const [courseLoading, setCourseLoading] = useState(false);
  const [courseError, setCourseError] = useState('');
  const courseCommissionIds = useMemo(() => subjects.map((s) => s.id), [subjects]);
  const courseKey = courseCommissionIds.join(',');

  const loadCourseSummaries = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;
    setCourseLoading(true);
    setCourseError('');
    try {
      const rows = await Promise.all(ids.map((commissionId) => attendanceApi.summaryBulk({ commissionId })));
      setSummaries((prev) => {
        const next = { ...prev };
        ids.forEach((id, i) => {
          next[id] = rows[i];
        });
        return next;
      });
    } catch (reason) {
      setCourseError(errorMessage(reason, 'No se pudo cargar la asistencia del curso.'));
    } finally {
      setCourseLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loadState !== 'ready') return;
    void loadCourseSummaries(courseKey ? courseKey.split(',') : []);
  }, [loadState, courseKey, loadCourseSummaries]);

  /** Alumnos del curso: inscriptos en alguna comisión del curso, con su resumen por comisión. */
  const students = useMemo<Student[]>(() => {
    if (!scope) return [];
    const byId = new Map<string, Student>();
    for (const commissionId of courseCommissionIds) {
      for (const summary of summaries[commissionId] ?? []) {
        let student = byId.get(summary.studentId);
        if (!student) {
          const s = scope.students.find((x) => x.id === summary.studentId);
          if (!s) continue;
          student = {
            id: s.id,
            userId: s.userId,
            legajo: s.fileNumber,
            apellido: s.lastName,
            nombre: s.firstName,
            dni: s.dni,
            email: s.email,
            telefono: s.phone ?? '',
            careerId: s.careerId,
            subjects: {},
          };
          byId.set(s.id, student);
        }
        student.subjects[commissionId] = mapSummary(summary);
      }
    }
    return [...byId.values()].sort(
      (a, b) => a.apellido.localeCompare(b.apellido, 'es') || a.nombre.localeCompare(b.nombre, 'es'),
    );
  }, [scope, summaries, courseCommissionIds]);

  /** Para mostrar mensajes: userId → alumno visible. */
  const studentsByUserId = useMemo(() => {
    const map = new Map<string, StudentLookup>();
    if (!scope) return map;
    for (const s of scope.students) {
      if (!s.userId) continue;
      const career = scope.careers.find((c) => c.id === s.careerId);
      map.set(s.userId, {
        studentId: s.id,
        name: `${s.lastName}, ${s.firstName}`,
        legajo: s.fileNumber,
        courseLabel: `${s.years.map((y) => `${y}°`).join(' y ')} Año · ${career?.name ?? s.careerCode}`,
      });
    }
    return map;
  }, [scope]);

  const studentsByUserIdRef = useRef(studentsByUserId);
  studentsByUserIdRef.current = studentsByUserId;
  const setConversationsRaw = (rows: Parameters<typeof mapConversation>[0][]) => {
    setConversations((prev) =>
      rows.map((row) => {
        const mapped = mapConversation(row, studentsByUserIdRef.current);
        const old = prev.find((p) => p.id === mapped.id);
        return { ...mapped, messages: old?.messages };
      }),
    );
  };

  // ---------------------------------------------------------- clases de hoy
  const todayClasses = useMemo<DailyClassSession[]>(() => {
    const weekday = todayWeekday();
    const courseLabel = (c: ApiCommissionView) => availableCourses.find((x) => x.id === courseIdOf(c))?.fullLabel ?? c.careerName;
    return commissions
      .filter((c) => (c.schedule ?? []).some((s) => s.weekday === weekday))
      .map((c) => {
        const slot = c.schedule.filter((s) => s.weekday === weekday).sort((a, b) => a.startTime.localeCompare(b.startTime));
        const records = todayRecords.filter((r) => r.commissionId === c.id);
        const teacherRecords = records.filter((r) => r.source === 'TEACHER');
        const status: DailyClassSession['status'] =
          records.length === 0 ? 'pendiente' : teacherRecords.length === records.length ? 'cargada_por_docente' : 'cargada';
        const firstTeacher = teacherRecords.map((r) => r.recordedAt).sort()[0];
        return {
          commissionId: c.id,
          courseId: courseIdOf(c),
          subjectName: c.subjectName,
          courseLabel: courseLabel(c),
          timeSlot: slot.map((s) => `${s.startTime} - ${s.endTime}${s.classroom ? ` · ${s.classroom}` : ''}`).join(' / '),
          teacherName: c.teacherNames.join(', ') || 'Sin docente asignado',
          status,
          teacherLoggedAt: firstTeacher ? `${dateTimeToTime(firstTeacher)} hs` : undefined,
          presentsCount: records.filter((r) => r.status !== 'ABSENT').length,
          totalStudents: c.studentCount,
        };
      })
      .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  }, [commissions, todayRecords, availableCourses]);

  // --------------------------------------------------------------- filtros
  const [alumnosFilterCondition, setAlumnosFilterCondition] = useState<StudentCondition | 'todas'>('todas');
  const [alumnosSearchQuery, setAlumnosSearchQuery] = useState<string>('');
  const [justificacionesTab, setJustificacionesTab] = useState<'pendientes' | 'aprobadas' | 'rechazadas'>('pendientes');
  const [selectedStudentForProfileId, setSelectedStudentForProfileId] = useState<string | null>(null);
  const selectedStudentForProfile = useMemo(
    () => students.find((s) => s.id === selectedStudentForProfileId) ?? null,
    [students, selectedStudentForProfileId],
  );

  // ------------------------------------------------------- toma de asistencia
  const [rollCallDate, setRollCallDate] = useState<string>(todayISO);
  const [rollCallBaseline, setRollCallBaseline] = useState<Record<string, AttendanceStatus>>({});
  const [rollCallDraft, setRollCallDraft] = useState<Record<string, AttendanceStatus>>({});
  const [rollCallLoading, setRollCallLoading] = useState(false);
  const [rollCallSaving, setRollCallSaving] = useState(false);

  useEffect(() => {
    if (!selectedSubjectId || !/^\d{4}-\d{2}-\d{2}$/.test(rollCallDate)) {
      setRollCallBaseline({});
      setRollCallDraft({});
      return;
    }
    let active = true;
    setRollCallLoading(true);
    attendanceApi
      .list({ commissionId: selectedSubjectId, from: rollCallDate, to: rollCallDate })
      .then((rows) => {
        if (!active) return;
        const baseline = recordsByStudent(rows);
        setRollCallBaseline(baseline);
        setRollCallDraft(baseline);
      })
      .catch((reason) => {
        if (active) toast.error('No se pudo leer la planilla de esa fecha', { description: errorMessage(reason) });
      })
      .finally(() => {
        if (active) setRollCallLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedSubjectId, rollCallDate, attendanceVersion]);

  const rollCallStudents = useMemo(
    () => students.filter((s) => selectedSubjectId && s.subjects[selectedSubjectId]),
    [students, selectedSubjectId],
  );

  const hasUnsavedRollCall = useMemo(
    () => rollCallStudents.some((s) => (rollCallDraft[s.id] ?? 'sin_registrar') !== (rollCallBaseline[s.id] ?? 'sin_registrar')),
    [rollCallStudents, rollCallDraft, rollCallBaseline],
  );

  const setRollCallStatus = (studentId: string, status: AttendanceStatus) => {
    setRollCallDraft((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    setRollCallDraft((prev) => {
      const next = { ...prev };
      rollCallStudents.forEach((s) => {
        // No pisa lo que ya está justificado.
        if (next[s.id] !== 'justificado') next[s.id] = 'presente';
      });
      return next;
    });
    toast.info('Marcados todos como presentes en el borrador', {
      description: 'Podés corregir individualmente a los ausentes antes de guardar.',
    });
  };

  const discardRollCallChanges = () => {
    setRollCallDraft(rollCallBaseline);
    toast.info('Cambios descartados', { description: 'La planilla volvió a lo que está guardado.' });
  };

  /** Justificado = ausente + justificación aprobada para esa materia y fecha. */
  const justifyAbsence = async (studentId: string, subjectId: string, date: string, reason: string) => {
    const created = await attendanceApi.createJustification({ studentId, subjectId, fromDate: date, toDate: date, reason });
    if (created.status === 'PENDING') {
      await attendanceApi.reviewJustification(created.id, 'APPROVED', 'Registrada por Preceptoría al cargar la asistencia.');
    }
  };

  const afterAttendanceChange = async () => {
    setAttendanceVersion((v) => v + 1);
    await Promise.allSettled([loadCourseSummaries(courseCommissionIds), refreshTodayRecords(), refreshJustifications()]);
  };

  const saveRollCall = async (): Promise<RollCallSummary | null> => {
    if (!selectedSubject) return null;
    const counts = { presents: 0, tardies: 0, absents: 0, justified: 0, unregistered: 0 };
    const records: { studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' }[] = [];
    const toJustify: string[] = [];
    const blocked: string[] = [];

    for (const s of rollCallStudents) {
      const next = rollCallDraft[s.id] ?? 'sin_registrar';
      const prev = rollCallBaseline[s.id] ?? 'sin_registrar';
      if (next === 'presente') counts.presents++;
      else if (next === 'tardanza') counts.tardies++;
      else if (next === 'ausente') counts.absents++;
      else if (next === 'justificado') counts.justified++;
      else counts.unregistered++;
      if (next === prev) continue;
      if (next === 'sin_registrar' || (prev === 'justificado' && next === 'ausente')) {
        // La API no borra registros ni anula justificaciones aprobadas.
        blocked.push(`${s.apellido}, ${s.nombre}`);
        continue;
      }
      const apiStatus = statusToApi(next)!;
      if (!(next === 'justificado' && prev === 'ausente')) records.push({ studentId: s.id, status: apiStatus });
      if (next === 'justificado') toJustify.push(s.id);
    }

    setRollCallSaving(true);
    try {
      let saved = 0;
      if (records.length) {
        saved = (await attendanceApi.saveBySubject({ subjectId: selectedSubject.subjectId, date: rollCallDate, records })).saved;
      }
      for (const studentId of toJustify) {
        await justifyAbsence(studentId, selectedSubject.subjectId, rollCallDate, 'Inasistencia justificada por Preceptoría al tomar asistencia.');
      }
      await afterAttendanceChange();
      if (blocked.length) {
        toast.warning('Algunos cambios no se pudieron aplicar', {
          description: `No se puede borrar un registro ni quitar una justificación aprobada desde acá: ${blocked.join('; ')}.`,
        });
      }
      toast.success('Asistencia guardada', {
        description: `${selectedSubject.name} · ${isoToDisplay(rollCallDate)}: ${saved} registro(s)${toJustify.length ? ` y ${toJustify.length} justificación(es)` : ''}.`,
      });
      return { ...counts, saved };
    } catch (reason) {
      toast.error('No se pudo guardar la asistencia', { description: errorMessage(reason) });
      return null;
    } finally {
      setRollCallSaving(false);
    }
  };

  const goTakeAttendance = (commissionId: string) => {
    const subject = allSubjects.find((s) => s.id === commissionId);
    if (!subject) return;
    const course = availableCourses.find((c) => c.id === subject.courseId);
    if (course) setCurrentCourse(course);
    setSelectedSubjectId(subject.id);
    setRollCallDate(todayISO());
    setActiveScreen('asistencia');
  };

  // ---------------------------------------------------- corrección histórica
  const correctAttendanceRecord = async (
    studentId: string,
    isoDate: string,
    commissionId: string,
    previousStatus: AttendanceStatus,
    newStatus: AttendanceStatus,
    reason: string,
  ): Promise<boolean> => {
    const subject = allSubjects.find((s) => s.id === commissionId);
    if (!subject || newStatus === previousStatus) return false;
    if (newStatus === 'sin_registrar' || (previousStatus === 'justificado' && newStatus === 'ausente')) {
      toast.error('Esa corrección no está disponible', {
        description: 'La API no permite borrar un registro ni anular una justificación ya aprobada.',
      });
      return false;
    }
    try {
      if (!(newStatus === 'justificado' && previousStatus === 'ausente')) {
        await attendanceApi.saveBySubject({
          subjectId: subject.subjectId,
          date: isoDate,
          records: [{ studentId, status: statusToApi(newStatus)!, notes: reason }],
        });
      }
      if (newStatus === 'justificado') await justifyAbsence(studentId, subject.subjectId, isoDate, reason);
      await afterAttendanceChange();
      toast.success('Corrección registrada', {
        description: `Registro del ${isoToDisplay(isoDate)} modificado a ${newStatus}. Queda en el historial de correcciones.`,
      });
      return true;
    } catch (reason) {
      toast.error('No se pudo registrar la corrección', { description: errorMessage(reason) });
      return false;
    }
  };

  // ---------------------------------------------------------- justificaciones
  const reviewMany = async (ids: string[], status: 'APPROVED' | 'REJECTED', notes?: string) => {
    const results = await Promise.allSettled(ids.map((id) => attendanceApi.reviewJustification(id, status, notes)));
    await Promise.allSettled([refreshJustifications(), loadCourseSummaries(courseCommissionIds)]);
    setAttendanceVersion((v) => v + 1);
    return results;
  };

  const approveJustification = async (id: string) => {
    const [r] = await reviewMany([id], 'APPROVED');
    if (r.status === 'fulfilled') toast.success('Justificación aprobada', { description: 'La inasistencia ya no cuenta para el porcentaje.' });
    else toast.error('No se pudo aprobar', { description: errorMessage(r.reason) });
  };

  const rejectJustification = async (id: string, reason: string) => {
    if (!reason.trim()) {
      toast.error('El motivo de rechazo es obligatorio para informar al alumno.');
      return;
    }
    const [r] = await reviewMany([id], 'REJECTED', reason.trim());
    if (r.status === 'fulfilled') toast.info('Justificación rechazada', { description: 'El alumno recibe el motivo en su panel.' });
    else toast.error('No se pudo rechazar', { description: errorMessage(r.reason) });
  };

  const batchApproveJustifications = async (ids: string[]) => {
    const results = await reviewMany(ids, 'APPROVED');
    const ok = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.length - ok;
    if (ok) toast.success(`Se aprobaron ${ok} justificaciones`);
    if (failed) {
      const first = results.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
      toast.error(`${failed} no se pudieron aprobar`, { description: errorMessage(first?.reason) });
    }
  };

  // ---------------------------------------------------------------- mensajes
  const [activeConversationId, setActiveConversationId] = useState<string>('');

  const loadConversation = async (userId: string) => {
    try {
      const rows = await socialApi.messagesWith(userId);
      setConversations((prev) =>
        prev.map((c) => (c.id === userId ? { ...c, unreadCount: 0, messages: rows.map((m) => mapMessage(m, myUserId)) } : c)),
      );
    } catch (reason) {
      toast.error('No se pudo abrir la conversación', { description: errorMessage(reason) });
    }
  };

  const startConversationWithStudent = (student: Student) => {
    if (!student.userId) {
      toast.error(`${student.nombre} todavía no tiene cuenta en el sistema`, {
        description: 'Solo se puede escribir a alumnos con cuenta institucional activa.',
      });
      return;
    }
    const userId = student.userId;
    setConversations((prev) => {
      if (prev.some((c) => c.id === userId)) return prev;
      const lookup = studentsByUserId.get(userId);
      return [
        {
          id: userId,
          studentId: student.id,
          studentName: `${student.apellido}, ${student.nombre}`,
          legajo: student.legajo,
          courseLabel: lookup?.courseLabel ?? currentCourse.fullLabel,
          unreadCount: 0,
          lastMessageText: 'Conversación nueva',
          lastMessageTime: '',
          lastMessageAt: new Date().toISOString(),
        },
        ...prev,
      ];
    });
    setActiveConversationId(userId);
    setSelectedStudentForProfileId(null);
    setActiveScreen('mensajes');
  };

  const sendChatMessage = async (userId: string, text: string) => {
    if (!text.trim()) return;
    try {
      const msg = await socialApi.sendMessage(userId, text.trim());
      const mapped = mapMessage(msg, myUserId);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === userId
            ? {
                ...c,
                lastMessageText: msg.text,
                lastMessageTime: mapped.timestamp,
                lastMessageAt: msg.createdAt,
                messages: [...(c.messages ?? []), mapped],
              }
            : c,
        ),
      );
    } catch (reason) {
      toast.error('No se pudo enviar el mensaje', { description: errorMessage(reason) });
    }
  };

  // ---------------------------------------------------------- notificaciones
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    socialApi.markNotificationsRead([id]).catch(() => void refreshNotifications());
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    socialApi
      .markNotificationsRead()
      .then(() => toast.success('Todas las notificaciones marcadas como leídas'))
      .catch((reason) => {
        toast.error('No se pudieron marcar como leídas', { description: errorMessage(reason) });
        void refreshNotifications();
      });
  };

  // ---------------------------------------------------------------- anuncios
  const announcements = useMemo(
    () => rawNotices.map((n) => mapNotice(n, scope)).filter((n): n is Announcement => n !== null),
    [rawNotices, scope],
  );

  const createAnnouncement: PreceptorContextType['createAnnouncement'] = async (input) => {
    try {
      await recordsApi.createNotice({
        title: input.title,
        content: input.body,
        category: input.category,
        audience: { careerIds: [input.careerId], ...(input.year ? { years: [input.year] } : {}) },
        publish: true,
        // Vence al final del día elegido, hora de Argentina.
        ...(input.expiresAt ? { expiresAt: `${input.expiresAt}T23:59:59-03:00` } : {}),
      });
      await refreshNotices();
      toast.success('Comunicado publicado', { description: 'Ya lo ven los alumnos de la carrera y año elegidos.' });
      return true;
    } catch (reason) {
      toast.error('No se pudo publicar el comunicado', { description: errorMessage(reason) });
      return false;
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await recordsApi.archiveNotice(id);
      await refreshNotices();
      toast.info('Comunicado archivado', { description: 'Dejó de estar visible para los alumnos.' });
    } catch (reason) {
      toast.error('No se pudo archivar el comunicado', { description: errorMessage(reason) });
    }
  };

  // -------------------------------------------------------------------- foro
  const createForumThread = async (channelId: ForumChannelId, title: string, body: string) => {
    try {
      await socialApi.createThread(title, body, channelToApi(channelId));
      await refreshForum();
      toast.success('Tema publicado en el foro');
      return true;
    } catch (reason) {
      toast.error('No se pudo publicar el tema', { description: errorMessage(reason) });
      return false;
    }
  };

  const loadThreadReplies = async (threadId: string) => {
    try {
      const rows = (await socialApi.replies(threadId)).map(mapReply);
      setForumThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, replies: rows, replyCount: rows.length } : t)));
    } catch (reason) {
      toast.error('No se pudieron cargar las respuestas', { description: errorMessage(reason) });
    }
  };

  const addForumReply = async (threadId: string, text: string) => {
    try {
      await socialApi.reply(threadId, text);
      await loadThreadReplies(threadId);
      toast.success('Respuesta enviada');
    } catch (reason) {
      toast.error('No se pudo responder', { description: errorMessage(reason) });
    }
  };

  // ----------------------------------------------------------------- perfil
  const profile = useMemo<PreceptorProfile>(() => {
    const carreras =
      scope?.careers.map((c) => {
        const years = scope.years.find((y) => y.careerId === c.id)?.years ?? [];
        return `${c.name}${years.length ? ` (${years.map((y) => `${y}°`).join(', ')} año)` : ''}`;
      }) ?? [];
    return {
      userId: me.user.id,
      nombre: me.user.firstName,
      apellido: me.user.lastName,
      email: me.user.email,
      roles: me.user.roles,
      roleLabel: rolesLabel(me.user.roles),
      phone: apiProfile?.phone,
      bio: apiProfile?.bio,
      position: apiProfile?.position,
      availability: apiProfile?.availability ?? [],
      carrerasAsignadas: carreras,
    };
  }, [me, apiProfile, scope]);

  // ----------------------------------------------------------------- conteos
  const counts = useMemo(() => {
    let atRisk = 0;
    let libre = 0;
    students.forEach((student) => {
      const stats = Object.values(student.subjects);
      const isLibre = stats.some((s) => s.condition === 'libre');
      if (isLibre) libre++;
      else if (stats.some((s) => s.condition === 'en_riesgo')) atRisk++;
    });
    return {
      pendingJustifications: justifications.filter((j) => j.status === 'pendiente').length,
      atRiskStudents: atRisk,
      libreStudents: libre,
      unreadMessages: conversations.filter((c) => c.unreadCount > 0).length,
      unreadNotifications: notifications.filter((n) => !n.isRead).length,
    };
  }, [justifications, students, conversations, notifications]);

  // ------------------------------------------------------------- UI auxiliar
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpenState] = useState(false);
  const setIsNotificationDrawerOpen = (open: boolean) => {
    setIsNotificationDrawerOpenState(open);
    if (open) void refreshNotifications().catch(() => undefined);
  };
  const [isMobileMoreMenuOpen, setIsMobileMoreMenuOpen] = useState(false);
  const [showIntroVideo, setShowIntroVideo] = useState(true);

  return (
    <PreceptorContext.Provider
      value={{
        activeScreen,
        setActiveScreen,
        loadState,
        loadError,
        reload,
        courseLoading,
        courseError,
        attendanceVersion,
        profile,
        logout,
        ruleSettings,
        currentCourse,
        setCurrentCourse,
        availableCourses,
        subjects,
        allSubjects,
        selectedSubjectId,
        setSelectedSubjectId,
        selectedSubject,
        students,
        justifications,
        announcements,
        conversations,
        notifications,
        todayClasses,
        forumThreads,
        studentCenterEvents,
        alumnosFilterCondition,
        setAlumnosFilterCondition,
        alumnosSearchQuery,
        setAlumnosSearchQuery,
        justificacionesTab,
        setJustificacionesTab,
        goTakeAttendance,
        selectedStudentForProfile,
        openStudentProfile: (student) => setSelectedStudentForProfileId(student.id),
        closeStudentProfile: () => setSelectedStudentForProfileId(null),
        rollCallDraft,
        rollCallBaseline,
        rollCallLoading,
        rollCallSaving,
        setRollCallStatus,
        markAllPresent,
        hasUnsavedRollCall,
        saveRollCall,
        discardRollCallChanges,
        rollCallDate,
        setRollCallDate,
        approveJustification,
        rejectJustification,
        batchApproveJustifications,
        correctAttendanceRecord,
        activeConversationId,
        setActiveConversationId,
        loadConversation,
        startConversationWithStudent,
        sendChatMessage,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        createAnnouncement,
        deleteAnnouncement,
        createForumThread,
        loadThreadReplies,
        addForumReply,
        counts,
        isNotificationDrawerOpen,
        setIsNotificationDrawerOpen,
        isMobileMoreMenuOpen,
        setIsMobileMoreMenuOpen,
        showIntroVideo,
        setShowIntroVideo,
        openIntroVideo: () => setShowIntroVideo(true),
      }}
    >
      {children}
    </PreceptorContext.Provider>
  );
};

export function usePreceptor(): PreceptorContextType {
  const context = useContext(PreceptorContext);
  if (!context) {
    throw new Error('usePreceptor must be used within a PreceptorProvider');
  }
  return context;
}
