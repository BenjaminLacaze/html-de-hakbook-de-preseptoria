import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  User,
  Course,
  Student,
  Teacher,
  Subject,
  TeacherAssignment,
  AttendanceRecord,
  GradeRecord,
  ScheduleSlot,
  SchoolEvent,
  OfficialNotice,
  AuditLogEntry,
  InstitutionSettings,
  ActiveSection,
  AttendanceStatus,
  AcademicPeriod,
} from '../types';
import {
  initialUsers,
  initialCourses,
  initialStudents,
  initialTeachers,
  initialSubjects,
  initialTeacherAssignments,
  initialAttendanceRecords,
  initialGradeRecords,
  initialScheduleSlots,
  initialSchoolEvents,
  initialNotices,
  initialAuditLogs,
  initialInstitutionSettings,
} from '../data/mockData';

interface AppContextType {
  activeUser: User;
  activeSection: ActiveSection;
  activeCycleId: '2026' | '2025';
  users: User[];
  courses: Course[];
  students: Student[];
  teachers: Teacher[];
  subjects: Subject[];
  teacherAssignments: TeacherAssignment[];
  attendanceRecords: AttendanceRecord[];
  gradeRecords: GradeRecord[];
  schedules: ScheduleSlot[];
  events: SchoolEvent[];
  notices: OfficialNotice[];
  auditLogs: AuditLogEntry[];
  institutionSettings: InstitutionSettings;
  systemNotification: { message: string; type: 'success' | 'warning' | 'info' | 'error' } | null;

  // Actions
  setActiveSection: (section: ActiveSection) => void;
  setActiveCycleId: (cycleId: '2026' | '2025') => void;
  setActiveUser: (user: User) => void;
  showNotification: (message: string, type?: 'success' | 'warning' | 'info' | 'error') => void;

  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  toggleUserStatus: (id: string) => void;

  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;

  addStudent: (student: Omit<Student, 'id' | 'legajo'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;

  addAttendanceRecord: (record: Omit<AttendanceRecord, 'id'>) => void;
  updateAttendanceRecord: (id: string, updates: Partial<AttendanceRecord>) => void;
  batchSaveAttendance: (
    courseId: string,
    date: string,
    entries: { studentId: string; status: AttendanceStatus; notes?: string }[]
  ) => void;

  addGradeRecord: (grade: Omit<GradeRecord, 'id'>) => void;
  updateGradeRecord: (id: string, updates: Partial<GradeRecord>) => void;

  addNotice: (notice: Omit<OfficialNotice, 'id' | 'publishDate' | 'readCount'>) => void;
  updateNotice: (id: string, updates: Partial<OfficialNotice>) => void;
  deleteNotice: (id: string) => void;

  addScheduleSlot: (slot: Omit<ScheduleSlot, 'id'>) => void;
  updateScheduleSlot: (id: string, updates: Partial<ScheduleSlot>) => void;
  deleteScheduleSlot: (id: string) => void;

  addEvent: (event: Omit<SchoolEvent, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<SchoolEvent>) => void;
  deleteEvent: (id: string) => void;

  updateInstitutionSettings: (settings: Partial<InstitutionSettings>) => void;
  resetToDemoData: () => void;

  // Computed & Query helpers
  getCourseById: (courseId: string) => Course | undefined;
  getStudentById: (studentId: string) => Student | undefined;
  getTeacherById: (teacherId: string) => Teacher | undefined;
  getSubjectById: (subjectId: string) => Subject | undefined;
  getCourseStudents: (courseId: string) => Student[];
  getCourseAssignments: (courseId: string) => TeacherAssignment[];
  getStudentAttendanceStats: (studentId: string) => {
    total: number;
    presentes: number;
    ausentesInjustificados: number;
    ausentesJustificados: number;
    tardanzas: number;
    percentAttendance: number;
    isAtRisk: boolean;
  };
  getGlobalAttendanceStats: () => {
    totalRecorded: number;
    presentes: number;
    ausentesInjustificados: number;
    ausentesJustificados: number;
    tardanzas: number;
    globalRate: number;
  };
  getAtRiskStudents: () => {
    student: Student;
    course: Course | undefined;
    attendanceRate: number;
    consecutiveAbsences: number;
    failedSubjectsCount: number;
    riskReasons: string[];
  }[];
}

const STORAGE_KEY = 'perfil_directivo_isfdyt26_v1';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage or fall back to mockData
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>('inicio');
  const [activeCycleId, setActiveCycleIdState] = useState<'2026' | '2025'>('2026');

  const [systemNotification, setSystemNotification] = useState<{
    message: string;
    type: 'success' | 'warning' | 'info' | 'error';
  } | null>(null);

  const [users, setUsers] = useState<User[]>(initialUsers);
  const [activeUser, setActiveUser] = useState<User>(initialUsers[0]);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>(initialTeacherAssignments);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendanceRecords);
  const [gradeRecords, setGradeRecords] = useState<GradeRecord[]>(initialGradeRecords);
  const [schedules, setSchedules] = useState<ScheduleSlot[]>(initialScheduleSlots);
  const [events, setEvents] = useState<SchoolEvent[]>(initialSchoolEvents);
  const [notices, setNotices] = useState<OfficialNotice[]>(initialNotices);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);
  const [institutionSettings, setInstitutionSettings] = useState<InstitutionSettings>(initialInstitutionSettings);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.users) setUsers(parsed.users);
        if (parsed.courses) setCourses(parsed.courses);
        if (parsed.students) setStudents(parsed.students);
        if (parsed.teachers) setTeachers(parsed.teachers);
        if (parsed.subjects) setSubjects(parsed.subjects);
        if (parsed.teacherAssignments) setTeacherAssignments(parsed.teacherAssignments);
        if (parsed.attendanceRecords) setAttendanceRecords(parsed.attendanceRecords);
        if (parsed.gradeRecords) setGradeRecords(parsed.gradeRecords);
        if (parsed.schedules) setSchedules(parsed.schedules);
        if (parsed.events) setEvents(parsed.events);
        if (parsed.notices) setNotices(parsed.notices);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (parsed.institutionSettings) setInstitutionSettings(parsed.institutionSettings);
        if (parsed.activeCycleId) setActiveCycleIdState(parsed.activeCycleId);
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using initial mock data', e);
    }
    setIsInitialized(true);
  }, []);

  // Save to LocalStorage whenever critical data changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      const payload = {
        users,
        courses,
        students,
        teachers,
        subjects,
        teacherAssignments,
        attendanceRecords,
        gradeRecords,
        schedules,
        events,
        notices,
        auditLogs,
        institutionSettings,
        activeCycleId,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to sync to localStorage', e);
    }
  }, [
    isInitialized,
    users,
    courses,
    students,
    teachers,
    subjects,
    teacherAssignments,
    attendanceRecords,
    gradeRecords,
    schedules,
    events,
    notices,
    auditLogs,
    institutionSettings,
    activeCycleId,
  ]);

  const showNotification = (
    message: string,
    type: 'success' | 'warning' | 'info' | 'error' = 'success'
  ) => {
    setSystemNotification({ message, type });
    setTimeout(() => {
      setSystemNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  const logAudit = (
    module: string,
    action: AuditLogEntry['action'],
    entity: string,
    entityId: string,
    details: string,
    previousValue?: string,
    newValue?: string
  ) => {
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: activeUser.id,
      userName: activeUser.name,
      userRole: activeUser.role,
      module,
      action,
      entity,
      entityId,
      details,
      previousValue,
      newValue,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  const setActiveCycleId = (cycleId: '2026' | '2025') => {
    setActiveCycleIdState(cycleId);
    logAudit(
      'Configuración Institucional',
      'CAMBIO_CICLO',
      'AcademicCycle',
      cycleId,
      `Cambio de contexto activo al Ciclo Lectivo ${cycleId} (${cycleId === '2025' ? 'Histórico / Solo Lectura' : 'Vigente'})`
    );
    showNotification(
      cycleId === '2025'
        ? 'Visualizando Ciclo Lectivo 2025 (Histórico — Modo de solo consulta)'
        : 'Contexto activo: Ciclo Lectivo 2026 (Operativo)',
      cycleId === '2025' ? 'warning' : 'info'
    );
  };

  // User actions
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Nunca',
    };
    setUsers((prev) => [newUser, ...prev]);
    logAudit(
      'Usuarios y Permisos',
      'CREACION',
      'User',
      newUser.id,
      `Alta de usuario institucional: ${newUser.name} (${newUser.role}) — DNI: ${newUser.dni}`
    );
    showNotification(`Usuario ${newUser.name} registrado con éxito.`);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          logAudit(
            'Usuarios y Permisos',
            'MODIFICACION',
            'User',
            id,
            `Modificación de perfil: ${updated.name}`
          );
          return updated;
        }
        return u;
      })
    );
    showNotification('Usuario actualizado correctamente.');
  };

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
          logAudit(
            'Usuarios y Permisos',
            'CAMBIO_ESTADO',
            'User',
            id,
            `Cambio de estado de ${u.name} a ${nextStatus}`,
            u.status,
            nextStatus
          );
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
    showNotification('Estado de usuario modificado.');
  };

  // Course actions
  const addCourse = (courseData: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...courseData,
      id: `c-${courseData.yearLevel}-${Date.now().toString().slice(-4)}`,
    };
    setCourses((prev) => [...prev, newCourse]);
    logAudit(
      'Cursos y Divisiones',
      'CREACION',
      'Course',
      newCourse.id,
      `Creación de división: ${newCourse.yearLevel}° ${newCourse.division} (${newCourse.shift})`
    );
    showNotification(`Curso ${newCourse.yearLevel}° ${newCourse.division} creado con éxito.`);
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    logAudit(
      'Cursos y Divisiones',
      'MODIFICACION',
      'Course',
      id,
      `Actualización de datos para la división seleccionada`
    );
    showNotification('División escolar actualizada.');
  };

  // Student actions
  const addStudent = (studentData: Omit<Student, 'id' | 'legajo'>) => {
    const currentYear = new Date().getFullYear();
    const count = students.length + 1;
    const legajo = `LEG-${currentYear}-${String(count).padStart(3, '0')}`;
    const newStudent: Student = {
      ...studentData,
      id: `std-${Date.now()}`,
      legajo,
    };
    setStudents((prev) => [...prev, newStudent]);
    logAudit(
      'Alumnos y Matrícula',
      'CREACION',
      'Student',
      newStudent.id,
      `Inscripción de alumno: ${newStudent.lastName}, ${newStudent.firstName} (Legajo: ${legajo})`
    );
    showNotification(`Estudiante ${newStudent.lastName} matriculado correctamente.`);
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    logAudit(
      'Alumnos y Matrícula',
      'MODIFICACION',
      'Student',
      id,
      `Actualización de legajo de estudiante`
    );
    showNotification('Ficha de estudiante actualizada.');
  };

  // Attendance actions
  const addAttendanceRecord = (recordData: Omit<AttendanceRecord, 'id'>) => {
    const newRecord: AttendanceRecord = {
      ...recordData,
      id: `att-${Date.now()}`,
    };
    setAttendanceRecords((prev) => [newRecord, ...prev]);
  };

  const updateAttendanceRecord = (id: string, updates: Partial<AttendanceRecord>) => {
    setAttendanceRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
    showNotification('Registro de asistencia rectificado.');
  };

  const batchSaveAttendance = (
    courseId: string,
    date: string,
    entries: { studentId: string; status: AttendanceStatus; notes?: string }[]
  ) => {
    // Remove existing records for this course & date to avoid duplicates
    setAttendanceRecords((prev) => {
      const filtered = prev.filter(
        (r) => !(r.courseId === courseId && r.date === date)
      );
      const newRecords: AttendanceRecord[] = entries.map((entry, idx) => ({
        id: `att-${Date.now()}-${idx}`,
        cycleId: activeCycleId,
        date,
        courseId,
        studentId: entry.studentId,
        status: entry.status,
        notes: entry.notes || '',
        recordedByUserId: activeUser.id,
      }));
      return [...newRecords, ...filtered];
    });

    logAudit(
      'Seguimiento de Asistencia',
      'CREACION',
      'AttendanceRecord',
      courseId,
      `Planilla de asistencia del ${date} guardada para el curso (${entries.length} estudiantes)`
    );
    showNotification(`Asistencia del día ${date} asentada correctamente.`);
  };

  // Grade actions
  const addGradeRecord = (gradeData: Omit<GradeRecord, 'id'>) => {
    const newGrade: GradeRecord = {
      ...gradeData,
      id: `grd-${Date.now()}`,
    };
    setGradeRecords((prev) => [newGrade, ...prev]);
    logAudit(
      'Seguimiento Académico',
      'CREACION',
      'GradeRecord',
      newGrade.id,
      `Carga de calificación (${newGrade.score}) en ${newGrade.period}`
    );
    showNotification('Calificación registrada.');
  };

  const updateGradeRecord = (id: string, updates: Partial<GradeRecord>) => {
    setGradeRecords((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
    logAudit(
      'Seguimiento Académico',
      'MODIFICACION',
      'GradeRecord',
      id,
      `Rectificación formal de calificación en acta digital`
    );
    showNotification('Calificación rectificada en el libro de notas.');
  };

  // Notices actions
  const addNotice = (
    noticeData: Omit<OfficialNotice, 'id' | 'publishDate' | 'readCount'>
  ) => {
    const newNotice: OfficialNotice = {
      ...noticeData,
      id: `not-${Date.now()}`,
      publishDate: new Date().toISOString().split('T')[0],
      readCount: 0,
    };
    setNotices((prev) => [newNotice, ...prev]);
    logAudit(
      'Comunicados Oficiales',
      'CREACION',
      'OfficialNotice',
      newNotice.id,
      `Emisión de circular: ${newNotice.title} (Estado: ${newNotice.status})`
    );
    showNotification('Circular institucional guardada.');
  };

  const updateNotice = (id: string, updates: Partial<OfficialNotice>) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
    );
    logAudit(
      'Comunicados Oficiales',
      'MODIFICACION',
      'OfficialNotice',
      id,
      `Actualización de comunicado institucional`
    );
    showNotification('Circular actualizada.');
  };

  const deleteNotice = (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
    logAudit(
      'Comunicados Oficiales',
      'ELIMINACION_CONTROLADA',
      'OfficialNotice',
      id,
      `Baja de circular institucional del panel directivo`
    );
    showNotification('Circular eliminada.', 'info');
  };

  // Schedule actions
  const addScheduleSlot = (slotData: Omit<ScheduleSlot, 'id'>) => {
    const newSlot: ScheduleSlot = {
      ...slotData,
      id: `sch-${Date.now()}`,
    };
    setSchedules((prev) => [...prev, newSlot]);
    logAudit(
      'Organización Institucional',
      'CREACION',
      'ScheduleSlot',
      newSlot.id,
      `Asignación de módulo horario en grilla institucional`
    );
    showNotification('Módulo horario incorporado.');
  };

  const updateScheduleSlot = (id: string, updates: Partial<ScheduleSlot>) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    showNotification('Horario modificado.');
  };

  const deleteScheduleSlot = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    showNotification('Módulo retirado de la grilla.');
  };

  // Events actions
  const addEvent = (eventData: Omit<SchoolEvent, 'id'>) => {
    const newEvent: SchoolEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
    };
    setEvents((prev) => [...prev, newEvent]);
    logAudit(
      'Organización Institucional',
      'CREACION',
      'SchoolEvent',
      newEvent.id,
      `Inclusión de evento en calendario escolar: ${newEvent.title}`
    );
    showNotification('Evento agregado a la agenda directiva.');
  };

  const updateEvent = (id: string, updates: Partial<SchoolEvent>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
    showNotification('Evento institucional actualizado.');
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    showNotification('Evento suprimido del calendario.');
  };

  // Settings
  const updateInstitutionSettings = (settingsData: Partial<InstitutionSettings>) => {
    setInstitutionSettings((prev) => {
      const next = { ...prev, ...settingsData };
      logAudit(
        'Configuración Institucional',
        'CONFIGURACION',
        'InstitutionSettings',
        'global',
        `Actualización de parámetros institucionales`
      );
      return next;
    });
    showNotification('Configuración institucional guardada.');
  };

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUsers(initialUsers);
    setActiveUser(initialUsers[0]);
    setCourses(initialCourses);
    setStudents(initialStudents);
    setTeachers(initialTeachers);
    setSubjects(initialSubjects);
    setTeacherAssignments(initialTeacherAssignments);
    setAttendanceRecords(initialAttendanceRecords);
    setGradeRecords(initialGradeRecords);
    setSchedules(initialScheduleSlots);
    setEvents(initialSchoolEvents);
    setNotices(initialNotices);
    setAuditLogs(initialAuditLogs);
    setInstitutionSettings(initialInstitutionSettings);
    setActiveCycleIdState('2026');
    showNotification('Datos de demostración restablecidos íntegramente.', 'info');
  };

  // Queries
  const getCourseById = (courseId: string) => courses.find((c) => c.id === courseId);
  const getStudentById = (studentId: string) => students.find((s) => s.id === studentId);
  const getTeacherById = (teacherId: string) => teachers.find((t) => t.id === teacherId);
  const getSubjectById = (subjectId: string) => subjects.find((s) => s.id === subjectId);
  const getCourseStudents = (courseId: string) =>
    students.filter((s) => s.courseId === courseId && s.cycleId === activeCycleId);
  const getCourseAssignments = (courseId: string) =>
    teacherAssignments.filter((a) => a.courseId === courseId && a.cycleId === activeCycleId);

  const getStudentAttendanceStats = (studentId: string) => {
    const studentRecords = attendanceRecords.filter(
      (r) => r.studentId === studentId && r.cycleId === activeCycleId
    );
    const total = studentRecords.length;
    if (total === 0) {
      return {
        total: 0,
        presentes: 0,
        ausentesInjustificados: 0,
        ausentesJustificados: 0,
        tardanzas: 0,
        percentAttendance: 100,
        isAtRisk: false,
      };
    }
    const presentes = studentRecords.filter((r) => r.status === 'PRESENTE').length;
    const ausentesInjustificados = studentRecords.filter(
      (r) => r.status === 'AUSENTE_INJUSTIFICADO'
    ).length;
    const ausentesJustificados = studentRecords.filter(
      (r) => r.status === 'AUSENTE_JUSTIFICADO'
    ).length;
    const tardanzas = studentRecords.filter((r) => r.status === 'TARDANZA').length;

    // Regla estándar: Tardanza computa como 0.5 presencia o asistencia con apercibimiento
    // Inasistencias totales = Ausentes Injustificados + Ausentes Justificados
    const percentAttendance = Math.round(((presentes + tardanzas * 0.75) / total) * 100);
    const inasistenciaRate = Math.round(
      ((ausentesInjustificados + ausentesJustificados) / total) * 100
    );

    const isAtRisk =
      inasistenciaRate >= institutionSettings.attendanceAlertThresholdPercent ||
      ausentesInjustificados >= institutionSettings.consecutiveAbsenceAlertThreshold;

    return {
      total,
      presentes,
      ausentesInjustificados,
      ausentesJustificados,
      tardanzas,
      percentAttendance,
      isAtRisk,
    };
  };

  const getGlobalAttendanceStats = () => {
    const currentRecords = attendanceRecords.filter((r) => r.cycleId === activeCycleId);
    const totalRecorded = currentRecords.length;
    if (totalRecorded === 0) {
      return {
        totalRecorded: 0,
        presentes: 0,
        ausentesInjustificados: 0,
        ausentesJustificados: 0,
        tardanzas: 0,
        globalRate: 100,
      };
    }
    const presentes = currentRecords.filter((r) => r.status === 'PRESENTE').length;
    const ausentesInjustificados = currentRecords.filter(
      (r) => r.status === 'AUSENTE_INJUSTIFICADO'
    ).length;
    const ausentesJustificados = currentRecords.filter(
      (r) => r.status === 'AUSENTE_JUSTIFICADO'
    ).length;
    const tardanzas = currentRecords.filter((r) => r.status === 'TARDANZA').length;
    const globalRate = Math.round(((presentes + tardanzas * 0.75) / totalRecorded) * 100);

    return {
      totalRecorded,
      presentes,
      ausentesInjustificados,
      ausentesJustificados,
      tardanzas,
      globalRate,
    };
  };

  const getAtRiskStudents = () => {
    const currentStudents = students.filter((s) => s.cycleId === activeCycleId);
    const results: ReturnType<AppContextType['getAtRiskStudents']> = [];

    currentStudents.forEach((student) => {
      const attStats = getStudentAttendanceStats(student.id);
      const studentGrades = gradeRecords.filter(
        (g) => g.studentId === student.id && g.cycleId === activeCycleId
      );
      const failedGrades = studentGrades.filter(
        (g) => g.score < institutionSettings.minPassingGrade
      );

      const riskReasons: string[] = [];
      if (attStats.isAtRisk) {
        riskReasons.push(
          `Inasistencias elevadas (${100 - attStats.percentAttendance}%, ${attStats.ausentesInjustificados} injustificadas)`
        );
      }
      if (failedGrades.length >= 2) {
        riskReasons.push(`${failedGrades.length} materias no aprobadas en el período`);
      } else if (failedGrades.length === 1) {
        riskReasons.push(`1 materia en riesgo de desaprobación`);
      }
      if (student.status === 'CONDICIONAL') {
        riskReasons.push(`Matrícula en condición condicional`);
      }

      if (riskReasons.length > 0) {
        const course = courses.find((c) => c.id === student.courseId);
        results.push({
          student,
          course,
          attendanceRate: attStats.percentAttendance,
          consecutiveAbsences: attStats.ausentesInjustificados,
          failedSubjectsCount: failedGrades.length,
          riskReasons,
        });
      }
    });

    return results;
  };

  return (
    <AppContext.Provider
      value={{
        activeUser,
        activeSection,
        activeCycleId,
        users,
        courses,
        students,
        teachers,
        subjects,
        teacherAssignments,
        attendanceRecords,
        gradeRecords,
        schedules,
        events,
        notices,
        auditLogs,
        institutionSettings,
        systemNotification,

        setActiveSection,
        setActiveCycleId,
        setActiveUser,
        showNotification,

        addUser,
        updateUser,
        toggleUserStatus,

        addCourse,
        updateCourse,

        addStudent,
        updateStudent,

        addAttendanceRecord,
        updateAttendanceRecord,
        batchSaveAttendance,

        addGradeRecord,
        updateGradeRecord,

        addNotice,
        updateNotice,
        deleteNotice,

        addScheduleSlot,
        updateScheduleSlot,
        deleteScheduleSlot,

        addEvent,
        updateEvent,
        deleteEvent,

        updateInstitutionSettings,
        resetToDemoData,

        getCourseById,
        getStudentById,
        getTeacherById,
        getSubjectById,
        getCourseStudents,
        getCourseAssignments,
        getStudentAttendanceStats,
        getGlobalAttendanceStats,
        getAtRiskStudents,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
