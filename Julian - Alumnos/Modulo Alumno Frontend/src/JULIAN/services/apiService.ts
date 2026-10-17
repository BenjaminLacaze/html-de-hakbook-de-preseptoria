import {
  MOCK_ATTENDANCE_RECORDS,
  MOCK_CALENDAR_EVENTS,
  MOCK_COMMUNITY,
  MOCK_FORUMS,
  MOCK_GRADES,
  MOCK_NOTICES,
  MOCK_NOTIFICATIONS,
  MOCK_STUDENT,
  MOCK_SUBJECTS
} from '../data/mockData';
import {
  AcademicNotice,
  AppearanceSettings,
  AttendanceRecord,
  CalendarEvent,
  CommunityMember,
  ForumReply,
  ForumTopic,
  Grade,
  NotificationItem,
  QRScanSession,
  StudentProfile,
  Subject
} from '../types';

/**
 * SERVICIO DESACOPLADO DE DATOS ACADÉMICOS - MÓDULO JULIAN
 * 
 * Contratos RESTful proyectados para integración con el backend institucional:
 * - GET    /api/v1/alumnos/me                       -> Obtener perfil del estudiante autenticado
 * - GET    /api/v1/alumnos/me/materias              -> Obtener materias cursadas y estado
 * - GET    /api/v1/alumnos/me/notas                 -> Obtener calificaciones y promedios
 * - GET    /api/v1/alumnos/me/asistencias           -> Listar registros de asistencia
 * - POST   /api/v1/alumnos/me/asistencias/justificar -> Enviar solicitud de justificación con comprobante
 * - POST   /api/v1/alumnos/me/asistencia-qr/validar -> Validar token temporal QR de clase presencial
 * - GET    /api/v1/alumnos/me/agenda                -> Eventos, evaluaciones y clases
 * - GET    /api/v1/foros                            -> Listar temas de debate
 * - POST   /api/v1/foros/:id/respuestas             -> Enviar respuesta a foro
 * - GET    /api/v1/comunidad                        -> Miembros institucionales autorizados
 */

const STORAGE_KEYS = {
  ATTENDANCE: 'asistencia_terciario_julian_attendance_v1',
  FORUMS: 'asistencia_terciario_julian_forums_v1',
  NOTICES: 'asistencia_terciario_julian_notices_v1',
  NOTIFICATIONS: 'asistencia_terciario_julian_notifications_v1',
  SETTINGS: 'asistencia_terciario_julian_appearance_v1'
};

class AcademicApiService {
  private simulateDelay<T>(data: T, ms = 120): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(data), ms));
  }

  // Student Profile
  async getStudentProfile(): Promise<StudentProfile> {
    return this.simulateDelay({ ...MOCK_STUDENT });
  }

  // Subjects
  async getEnrolledSubjects(): Promise<Subject[]> {
    return this.simulateDelay([...MOCK_SUBJECTS]);
  }

  async getSubjectById(subjectId: string): Promise<Subject | undefined> {
    const found = MOCK_SUBJECTS.find((s) => s.id === subjectId);
    return this.simulateDelay(found ? { ...found } : undefined);
  }

  // Grades
  async getGrades(): Promise<Grade[]> {
    return this.simulateDelay([...MOCK_GRADES]);
  }

  // Attendance
  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (stored) {
      try {
        return this.simulateDelay(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing stored attendance', e);
      }
    }
    return this.simulateDelay([...MOCK_ATTENDANCE_RECORDS]);
  }

  async submitAttendanceJustification(
    recordId: string,
    reason: string,
    attachmentName?: string
  ): Promise<{ success: boolean; updatedRecord: AttendanceRecord }> {
    const records = await this.getAttendanceRecords();
    const index = records.findIndex((r) => r.id === recordId);
    if (index === -1) {
      throw new Error('Registro de inasistencia no encontrado');
    }

    const updated: AttendanceRecord = {
      ...records[index],
      justificationStatus: 'Pendiente',
      justificationReason: reason,
      justificationAttachment: attachmentName || 'comprobante_digital.pdf',
      justificationSubmittedAt: new Date().toISOString().split('T')[0]
    };

    records[index] = updated;
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));

    return this.simulateDelay({ success: true, updatedRecord: updated }, 300);
  }

  // QR Attendance Check-In
  async validateQRAttendance(
    tokenPayload: string,
    studentId: string
  ): Promise<{
    success: boolean;
    message: string;
    sessionInfo: QRScanSession;
    recordedAt: string;
  }> {
    // Simulated token validation against current session
    const mockSession: QRScanSession = {
      sessionId: 'SES-2026-10-I26-PROG2',
      subjectCode: 'TSDS-201',
      subjectName: 'Programación II',
      professorName: 'Lic. Martín Soria',
      classroom: 'Laboratorio de Software 3',
      validUntil: '2026-10-16T21:00:00Z',
      tokenSeed: 'I26-GEO-VERIFIED-HASH',
      ipNetworkRequired: 'Red Estudiantil I26-Campus'
    };

    await new Promise((r) => setTimeout(r, 600));

    // Register present attendance in local state
    const records = await this.getAttendanceRecords();
    const newRecord: AttendanceRecord = {
      id: `ATT-${Date.now()}-PROG2`,
      subjectId: 'SUB-PROG2',
      subjectName: 'Programación II',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      status: 'Presente',
      hoursCount: 2,
      classroom: 'Laboratorio de Software 3',
      method: 'Código QR'
    };

    records.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));

    return {
      success: true,
      message: '¡Asistencia registrada con éxito! Presentismo confirmado en el aula.',
      sessionInfo: mockSession,
      recordedAt: `${newRecord.date} ${newRecord.time} hs`
    };
  }

  // Calendar
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    return this.simulateDelay([...MOCK_CALENDAR_EVENTS]);
  }

  // Notices
  async getAcademicNotices(): Promise<AcademicNotice[]> {
    return this.simulateDelay([...MOCK_NOTICES]);
  }

  // Community
  async getCommunityMembers(): Promise<CommunityMember[]> {
    return this.simulateDelay([...MOCK_COMMUNITY]);
  }

  // Forums
  async getForums(): Promise<ForumTopic[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.FORUMS);
    if (stored) {
      try {
        return this.simulateDelay(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing stored forums', e);
      }
    }
    return this.simulateDelay([...MOCK_FORUMS]);
  }

  async addForumReply(topicId: string, content: string): Promise<ForumReply> {
    const forums = await this.getForums();
    const topic = forums.find((t) => t.id === topicId);
    if (!topic) throw new Error('Tema de foro no encontrado');

    const newReply: ForumReply = {
      id: `REP-${Date.now()}`,
      topicId,
      authorName: MOCK_STUDENT.fullName,
      authorRole: 'Estudiante (Tú)',
      isCurrentUser: true,
      content,
      createdAt: 'Justo ahora',
      likes: 0
    };

    topic.replies.push(newReply);
    localStorage.setItem(STORAGE_KEYS.FORUMS, JSON.stringify(forums));

    return this.simulateDelay(newReply, 250);
  }

  async createForumTopic(
    title: string,
    content: string,
    subjectName: string,
    tags: string[]
  ): Promise<ForumTopic> {
    const forums = await this.getForums();
    const newTopic: ForumTopic = {
      id: `FRM-${Date.now()}`,
      subjectName,
      title,
      authorName: MOCK_STUDENT.fullName,
      authorRole: 'Estudiante (2° B)',
      isCurrentUser: true,
      createdAt: 'Justo ahora',
      content,
      tags: tags.length ? tags : ['Consulta Académica'],
      replies: [],
      isPinned: false,
      views: 1
    };

    forums.unshift(newTopic);
    localStorage.setItem(STORAGE_KEYS.FORUMS, JSON.stringify(forums));

    return this.simulateDelay(newTopic, 300);
  }

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    return this.simulateDelay([...MOCK_NOTIFICATIONS]);
  }
}

export const apiService = new AcademicApiService();
