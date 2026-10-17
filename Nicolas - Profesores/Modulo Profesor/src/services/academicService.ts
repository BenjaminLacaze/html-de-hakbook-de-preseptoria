/**
 * ISFDyT N.° 26 - Sistema de Gestión Académica (SGA)
 * Capa de Servicios Desacoplada (Academic Service)
 * 
 * Esta capa aísla la lógica de acceso a datos de los componentes de la interfaz.
 * Actualmente utiliza almacenamiento local en el navegador (localStorage) con datos
 * simulados por defecto, permitiendo probar toda la reactividad del frontend.
 * 
 * En la siguiente etapa de desarrollo, las funciones de este módulo se conectarán
 * directamente a los endpoints REST del backend institucional sin necesidad
 * de modificar la estructura de las vistas ni los componentes visuales.
 */

import type {
  Teacher,
  Commission,
  Student,
  ClassSession,
  AttendanceRecord,
  AcademicObservation,
  AttendanceStatus,
} from '../types';
import {
  MOCK_TEACHER,
  MOCK_COMMISSIONS,
  MOCK_STUDENTS,
  MOCK_CLASS_SESSIONS,
  MOCK_ATTENDANCE_RECORDS,
  MOCK_OBSERVATIONS,
} from '../data/mockData';

const STORAGE_KEYS = {
  COMMISSIONS: 'sga_26_commissions',
  STUDENTS: 'sga_26_students',
  SESSIONS: 'sga_26_sessions',
  ATTENDANCE: 'sga_26_attendance',
  OBSERVATIONS: 'sga_26_observations',
};

// Inicialización de almacenamiento con datos por defecto si está vacío
function getStored<T>(key: string, defaultData: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Error al leer ${key} de almacenamiento local:`, error);
    return defaultData;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn(`Error al guardar en ${key}:`, error);
  }
}

export const academicService = {
  /**
   * Obtiene la identidad del profesor de demostración activo
   */
  async getCurrentTeacher(): Promise<Teacher> {
    return MOCK_TEACHER;
  },

  /**
   * Obtiene las comisiones asignadas al docente
   */
  async getCommissions(teacherId?: string): Promise<Commission[]> {
    const commissions = getStored<Commission[]>(STORAGE_KEYS.COMMISSIONS, MOCK_COMMISSIONS);
    const students = getStored<Student[]>(STORAGE_KEYS.STUDENTS, MOCK_STUDENTS);

    // Recalcular cantidad de estudiantes dinámicamente según pertenencia
    const updated = commissions.map((c) => ({
      ...c,
      studentCount: students.filter((s) => s.commissionId === c.id).length,
    }));

    if (teacherId) {
      return updated.filter((c) => c.teacherId === teacherId);
    }
    return updated;
  },

  /**
   * Obtiene una comisión específica por su identificador
   */
  async getCommissionById(commissionId: string): Promise<Commission | undefined> {
    const commissions = await this.getCommissions();
    return commissions.find((c) => c.id === commissionId);
  },

  /**
   * Obtiene el listado de estudiantes de una comisión con filtros opcionales
   */
  async getStudentsByCommission(
    commissionId: string,
    filters?: {
      searchQuery?: string;
      status?: string;
      sortBy?: 'name' | 'legajo';
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<Student[]> {
    const allStudents = getStored<Student[]>(STORAGE_KEYS.STUDENTS, MOCK_STUDENTS);
    let list = allStudents.filter((s) => s.commissionId === commissionId);

    if (filters?.status && filters.status !== 'TODOS') {
      list = list.filter((s) => s.status === filters.status);
    }

    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.lastName.toLowerCase().includes(q) ||
          s.firstName.toLowerCase().includes(q) ||
          s.legajo.toLowerCase().includes(q) ||
          s.dni.includes(q)
      );
    }

    const sortBy = filters?.sortBy || 'name';
    const sortOrder = filters?.sortOrder || 'asc';

    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        const fullA = `${a.lastName}, ${a.firstName}`;
        const fullB = `${b.lastName}, ${b.firstName}`;
        comparison = fullA.localeCompare(fullB);
      } else if (sortBy === 'legajo') {
        comparison = a.legajo.localeCompare(b.legajo);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  },

  /**
   * Obtiene las instancias de clase para una comisión específica,
   * o todas las instancias registradas si no se especifica commissionId.
   */
  async getClassSessions(commissionId?: string): Promise<ClassSession[]> {
    const sessions = getStored<ClassSession[]>(STORAGE_KEYS.SESSIONS, MOCK_CLASS_SESSIONS);
    if (!commissionId) {
      return sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return sessions
      .filter((s) => s.commissionId === commissionId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  /**
   * Obtiene una instancia de clase por su identificador
   */
  async getClassSessionById(sessionId: string): Promise<ClassSession | undefined> {
    const sessions = getStored<ClassSession[]>(STORAGE_KEYS.SESSIONS, MOCK_CLASS_SESSIONS);
    return sessions.find((s) => s.id === sessionId);
  },

  /**
   * Crea o abre una nueva instancia de clase para una fecha
   */
  async createOrOpenClassSession(
    commissionId: string,
    date: string,
    topic?: string
  ): Promise<ClassSession> {
    const sessions = getStored<ClassSession[]>(STORAGE_KEYS.SESSIONS, MOCK_CLASS_SESSIONS);
    
    // Verificar si ya existe para esa fecha
    const existing = sessions.find((s) => s.commissionId === commissionId && s.date === date);
    if (existing) {
      return existing;
    }

    const newSession: ClassSession = {
      id: `ses-${Date.now()}`,
      commissionId,
      date,
      topic: topic?.trim() || 'Clase regular según cronograma',
      isClosed: false,
      registeredCount: 0,
    };

    sessions.push(newSession);
    setStored(STORAGE_KEYS.SESSIONS, sessions);
    return newSession;
  },

  /**
   * Obtiene los registros de asistencia de una sesión
   */
  async getAttendanceBySession(sessionId: string): Promise<AttendanceRecord[]> {
    const records = getStored<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, MOCK_ATTENDANCE_RECORDS);
    return records.filter((r) => r.classSessionId === sessionId);
  },

  /**
   * Registra o actualiza la asistencia de una sesión
   * Regla de negocio: todos los estudiantes requeridos deben tener estado
   */
  async saveAttendance(
    sessionId: string,
    records: { studentId: string; status: AttendanceStatus }[],
    teacherId: string
  ): Promise<{ success: boolean; message: string; count: number }> {
    const allAttendance = getStored<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, MOCK_ATTENDANCE_RECORDS);
    const sessions = getStored<ClassSession[]>(STORAGE_KEYS.SESSIONS, MOCK_CLASS_SESSIONS);
    
    // Filtrar los registros previos de esta misma sesión para no duplicar
    const otherRecords = allAttendance.filter((r) => r.classSessionId !== sessionId);

    const now = new Date();
    const formattedDate = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newRecords: AttendanceRecord[] = records.map((r, index) => ({
      id: `att-${sessionId}-${index}-${Date.now()}`,
      classSessionId: sessionId,
      studentId: r.studentId,
      status: r.status,
      recordedAt: formattedDate,
      recordedByTeacherId: teacherId,
    }));

    const updatedAttendance = [...otherRecords, ...newRecords];
    setStored(STORAGE_KEYS.ATTENDANCE, updatedAttendance);

    // Actualizar estado de la sesión de clase
    const updatedSessions = sessions.map((s) => {
      if (s.id === sessionId) {
        return {
          ...s,
          isClosed: true,
          registeredCount: newRecords.length,
        };
      }
      return s;
    });
    setStored(STORAGE_KEYS.SESSIONS, updatedSessions);

    return {
      success: true,
      message: `Asistencia guardada exitosamente para ${newRecords.length} estudiantes (registro simulado).`,
      count: newRecords.length,
    };
  },

  /**
   * Obtiene las observaciones académicas con filtros opcionales
   */
  async getObservations(filters?: {
    commissionId?: string;
    studentId?: string;
    searchQuery?: string;
  }): Promise<AcademicObservation[]> {
    let list = getStored<AcademicObservation[]>(STORAGE_KEYS.OBSERVATIONS, MOCK_OBSERVATIONS);

    if (filters?.commissionId && filters.commissionId !== 'TODAS') {
      list = list.filter((o) => o.commissionId === filters.commissionId);
    }

    if (filters?.studentId && filters.studentId !== 'TODOS') {
      list = list.filter((o) => o.studentId === filters.studentId);
    }

    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.studentName.toLowerCase().includes(q) ||
          o.content.toLowerCase().includes(q) ||
          o.category.toLowerCase().includes(q) ||
          o.commissionName.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Registra una nueva observación académica pedagógica
   */
  async createObservation(
    data: Omit<AcademicObservation, 'id' | 'createdAt'>
  ): Promise<AcademicObservation> {
    const observations = getStored<AcademicObservation[]>(
      STORAGE_KEYS.OBSERVATIONS,
      MOCK_OBSERVATIONS
    );

    const now = new Date();
    const formattedCreatedAt = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newObservation: AcademicObservation = {
      ...data,
      id: `obs-${Date.now()}`,
      createdAt: formattedCreatedAt,
    };

    observations.unshift(newObservation);
    setStored(STORAGE_KEYS.OBSERVATIONS, observations);
    return newObservation;
  },

  /**
   * Restablece los datos de demostración a su estado original
   */
  async resetDemoData(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.COMMISSIONS);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
    localStorage.removeItem(STORAGE_KEYS.OBSERVATIONS);
  },
};
