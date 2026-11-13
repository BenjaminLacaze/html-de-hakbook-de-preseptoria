import { apiFetch, getMe } from '@shared/api';
import { ROLE_LABELS, SHIFT_LABELS, OBSERVATION_CATEGORY_LABELS } from '@shared/types';
import type {
  AcademicCycle,
  AssessmentType,
  AttendanceRecordView,
  AttendanceStatus as ApiStatus,
  AuthMe,
  CommissionView,
  Conversation,
  DirectoryEntry,
  Enrollment,
  Grade,
  Observation,
  ObservationCategory,
  PreceptorScope,
  PrivateMessage,
  Role,
  SchoolEvent,
  Teacher as ApiTeacher,
} from '@shared/types';
import type {
  AcademicObservation,
  AgendaEvent,
  AttendanceRecord,
  AttendanceStatus,
  ChatMessage,
  ClassSession,
  Commission,
  ConversationSummary,
  GradeEntry,
  GradeEvaluation,
  InstitutionalContact,
  Student,
  Teacher,
} from '../types';

const toApiStatus: Record<AttendanceStatus, ApiStatus> = { PRESENTE: 'PRESENT', AUSENTE: 'ABSENT', TARDE: 'LATE' };
const fromApiStatus: Record<ApiStatus, AttendanceStatus> = { PRESENT: 'PRESENTE', ABSENT: 'AUSENTE', LATE: 'TARDE' };

type SessionResponse = {
  id: string;
  commissionId: string;
  date: string;
  topic?: string;
  status: string;
  registeredCount?: number;
  records?: { studentId: string; status: ApiStatus; minutesLate?: number; notes?: string }[];
};

const sessionView = (s: SessionResponse): ClassSession => ({
  id: s.id,
  commissionId: s.commissionId,
  date: s.date,
  topic: s.topic,
  isClosed: s.status === 'CLOSED',
  registeredCount: s.registeredCount ?? s.records?.length ?? 0,
});

/** El backend usa `PARTIAL` + instancia; la planilla muestra cinco columnas. */
const EVALUATION_TO_API: Record<GradeEvaluation, { type: AssessmentType; instance: number }> = {
  PARCIAL_1: { type: 'PARTIAL', instance: 1 },
  PARCIAL_2: { type: 'PARTIAL', instance: 2 },
  RECUPERATORIO_1: { type: 'MAKEUP', instance: 1 },
  RECUPERATORIO_2: { type: 'MAKEUP', instance: 2 },
  FINAL: { type: 'FINAL_EXAM', instance: 1 },
};

const API_TO_EVALUATION: Record<string, GradeEvaluation> = {
  'PARTIAL:1': 'PARCIAL_1',
  'PARTIAL:2': 'PARCIAL_2',
  'MAKEUP:1': 'RECUPERATORIO_1',
  'MAKEUP:2': 'RECUPERATORIO_2',
  'FINAL_EXAM:1': 'FINAL',
};

const categoryFor = (roles: Role[]): InstitutionalContact['category'] => {
  if (roles.includes('STUDENT')) return 'Alumno';
  if (roles.includes('PRECEPTOR')) return 'Preceptor';
  if (roles.includes('DIRECTOR') || roles.includes('ADMINISTRATIVE') || roles.includes('SUPER_ADMIN')) return 'Directivo';
  return 'Docente';
};

const contactFrom = (entry: DirectoryEntry): InstitutionalContact => {
  const name = `${entry.lastName}, ${entry.firstName}`;
  return {
    id: entry.id,
    name,
    role: entry.position || entry.roles.map((r) => ROLE_LABELS[r]).join(' / '),
    email: '',
    avatar: `${entry.firstName.charAt(0)}${entry.lastName.charAt(0)}`.toUpperCase(),
    category: categoryFor(entry.roles),
  };
};

const chatFrom = (m: PrivateMessage, meId: string, contact: InstitutionalContact): ChatMessage => ({
  id: m.id,
  senderId: m.senderId,
  senderName: m.senderId === meId ? 'Vos' : contact.name,
  recipientId: m.receiverId,
  recipientName: m.receiverId === meId ? 'Vos' : contact.name,
  body: m.text,
  createdAt: m.createdAt,
  isRead: Boolean(m.readAt) || m.senderId === meId,
});

export const academicService = {
  async getCurrentTeacher(me?: AuthMe): Promise<Teacher> {
    const identity = me ?? (await getMe());
    if (!identity) throw new Error('La sesión venció. Volvé a ingresar.');
    const teachers = await apiFetch<ApiTeacher[]>('/structure/teachers');
    const teacher = teachers.find((t) => t.id === identity.teacherId || t.userId === identity.user.id);
    return {
      id: teacher?.id ?? identity.user.id,
      legajo: teacher?.fileNumber ?? 'Sin legajo docente',
      name: `${identity.user.firstName} ${identity.user.lastName}`,
      title: teacher?.title ?? '',
      email: identity.user.email,
      department: '',
    };
  },

  async getCommissions(teacherId?: string): Promise<Commission[]> {
    const [rows, cycles] = await Promise.all([
      apiFetch<CommissionView[]>('/structure/commissions'),
      apiFetch<AcademicCycle[]>('/structure/cycles'),
    ]);
    return rows
      .filter((c) => !teacherId || c.teacherIds.includes(teacherId))
      .map((c) => ({
        id: c.id,
        code: c.code,
        name: c.code,
        subjectId: c.subjectId,
        subjectName: c.subjectName,
        careerName: c.careerName,
        academicYear: String(cycles.find((cy) => cy.id === c.cycleId)?.year ?? ''),
        shift: SHIFT_LABELS[c.shift] as Commission['shift'],
        schedule: c.schedule
          .map((s) => `${['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][s.weekday]} ${s.startTime}–${s.endTime}`)
          .join(' · '),
        classroom: [...new Set(c.schedule.map((s) => s.classroom).filter(Boolean))].join(', '),
        teacherId: c.teacherIds[0] ?? '',
        studentCount: c.studentCount,
      }));
  },

  async getCommissionById(id: string): Promise<Commission | undefined> {
    return (await this.getCommissions()).find((c) => c.id === id);
  },

  async getStudentsByCommission(
    commissionId: string,
    filters?: { searchQuery?: string; status?: string; sortBy?: 'name' | 'legajo'; sortOrder?: 'asc' | 'desc' },
  ): Promise<Student[]> {
    const [scope, enrollments] = await Promise.all([
      apiFetch<PreceptorScope>('/academic/scope'),
      apiFetch<Enrollment[]>('/structure/enrollments', { query: { commissionId } }),
    ]);
    const list: Student[] = enrollments
      .filter((e) => e.condition !== 'DROPPED')
      .map((e) => {
        const s = scope.students.find((st) => st.id === e.studentId);
        if (!s) throw new Error('No se pudo obtener la ficha de un alumno inscripto.');
        return {
          id: s.id,
          legajo: s.fileNumber,
          dni: s.dni,
          lastName: s.lastName,
          firstName: s.firstName,
          email: s.email,
          commissionId,
          status:
            e.condition === 'FREE'
              ? 'LIBRE'
              : e.condition === 'PROMOTED'
                ? 'PROMOCIONADO'
                : e.condition === 'PASSED'
                  ? 'APROBADO'
                  : e.condition === 'IN_PROGRESS'
                    ? 'CURSANDO'
                    : 'REGULAR',
          enrollmentDate: e.enrolledAt,
        };
      });
    const q = filters?.searchQuery?.trim().toLowerCase();
    return list
      .filter(
        (s) =>
          (!filters?.status || filters.status === 'TODOS' || s.status === filters.status) &&
          (!q || `${s.lastName} ${s.firstName} ${s.legajo} ${s.dni}`.toLowerCase().includes(q)),
      )
      .sort(
        (a, b) =>
          (filters?.sortBy === 'legajo'
            ? a.legajo.localeCompare(b.legajo)
            : `${a.lastName}, ${a.firstName}`.localeCompare(`${b.lastName}, ${b.firstName}`)) *
          (filters?.sortOrder === 'desc' ? -1 : 1),
      );
  },

  async getClassSessions(commissionId?: string): Promise<ClassSession[]> {
    const commissionIds = commissionId ? [commissionId] : (await this.getCommissions()).map((c) => c.id);
    const groups = await Promise.all(
      commissionIds.map((id) => apiFetch<SessionResponse[]>(`/attendance/commissions/${id}/sessions`)),
    );
    return groups
      .flat()
      .map(sessionView)
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  async getClassSessionById(id: string): Promise<ClassSession> {
    return sessionView(await apiFetch<SessionResponse>(`/attendance/sessions/${id}`));
  },

  async createOrOpenClassSession(commissionId: string, date: string, topic?: string): Promise<ClassSession> {
    return sessionView(
      await apiFetch<SessionResponse>(`/attendance/commissions/${commissionId}/sessions`, {
        method: 'POST',
        body: { date, topic },
      }),
    );
  },

  async getAttendanceBySession(id: string): Promise<AttendanceRecord[]> {
    const session = await apiFetch<SessionResponse>(`/attendance/sessions/${id}`);
    // La sesión no devuelve `justified`; se completa con la lectura de asistencia del día.
    const day = await apiFetch<AttendanceRecordView[]>('/attendance', {
      query: { commissionId: session.commissionId, from: session.date, to: session.date },
    });
    const byStudent = new Map(day.map((r) => [r.studentId, r]));
    return (session.records ?? []).map((r) => {
      const full = byStudent.get(r.studentId);
      return {
        id: `${id}:${r.studentId}`,
        classSessionId: id,
        studentId: r.studentId,
        status: fromApiStatus[r.status],
        recordedAt: full?.recordedAt ?? '',
        recordedByTeacherId: full?.recordedBy ?? '',
        justified: full?.justified ?? false,
        minutesLate: r.minutesLate ?? full?.minutesLate,
      };
    });
  },

  async saveAttendance(
    sessionId: string,
    records: { studentId: string; status: AttendanceStatus }[],
    _teacherId: string,
  ): Promise<{ success: boolean; message: string; count: number }> {
    const result = await apiFetch<{ saved: number; closed: boolean }>(`/attendance/sessions/${sessionId}`, {
      method: 'PUT',
      body: { records: records.map((r) => ({ studentId: r.studentId, status: toApiStatus[r.status] })), close: false },
    });
    return { success: true, message: `Asistencia guardada para ${result.saved} estudiantes.`, count: result.saved };
  },

  async getObservations(filters?: { commissionId?: string; studentId?: string; searchQuery?: string }): Promise<AcademicObservation[]> {
    const [rows, scope, commissions] = await Promise.all([
      apiFetch<Observation[]>('/records/observations', {
        query: {
          commissionId: filters?.commissionId === 'TODAS' ? undefined : filters?.commissionId,
          studentId: filters?.studentId === 'TODOS' ? undefined : filters?.studentId,
        },
      }),
      apiFetch<PreceptorScope>('/academic/scope'),
      this.getCommissions(),
    ]);
    const list = rows.map((o) => {
      const s = scope.students.find((st) => st.id === o.studentId);
      return {
        id: o.id,
        commissionId: o.commissionId,
        commissionName: commissions.find((c) => c.id === o.commissionId)?.name ?? o.commissionId,
        studentId: o.studentId,
        studentName: s ? `${s.lastName}, ${s.firstName}` : 'Alumno sin ficha disponible',
        studentLegajo: s?.fileNumber ?? '',
        pedagogicalDate: o.date,
        createdAt: o.createdAt,
        content: o.content,
        category: OBSERVATION_CATEGORY_LABELS[o.category] as AcademicObservation['category'],
        teacherId: o.createdBy,
      };
    });
    const q = filters?.searchQuery?.trim().toLowerCase();
    return list.filter((o) => !q || `${o.studentName} ${o.content} ${o.category} ${o.commissionName}`.toLowerCase().includes(q));
  },

  async createObservation(data: Omit<AcademicObservation, 'id' | 'createdAt'>): Promise<AcademicObservation> {
    const category = (Object.keys(OBSERVATION_CATEGORY_LABELS) as ObservationCategory[]).find(
      (k) => OBSERVATION_CATEGORY_LABELS[k] === data.category,
    );
    if (!category) throw new Error('Categoría de observación inválida.');
    const result = await apiFetch<{ id: string }>('/records/observations', {
      method: 'POST',
      body: { commissionId: data.commissionId, studentId: data.studentId, date: data.pedagogicalDate, category, content: data.content },
    });
    const saved = (await this.getObservations({ commissionId: data.commissionId, studentId: data.studentId })).find(
      (o) => o.id === result.id,
    );
    if (!saved) throw new Error('La observación se guardó, pero no se pudo recargar. Actualizá la pantalla antes de intentar otra vez.');
    return saved;
  },

  // --- AGENDA INSTITUCIONAL ---
  // El calendario lo administra Dirección (`/records/events`); el docente lo consulta.
  async getAgendaEvents(filters?: { commissionId?: string; type?: string }): Promise<AgendaEvent[]> {
    const [events, commissions] = await Promise.all([
      apiFetch<SchoolEvent[]>('/records/events'),
      this.getCommissions(),
    ]);
    const commissionName = new Map(commissions.map((c) => [c.id, c.name]));
    const teacherCommissions = new Set(commissions.map((c) => c.id));
    const typeFilter = filters?.type;
    return events
      // Solo eventos institucionales o de las comisiones que dicta el docente.
      .filter((e) => !e.commissionId || teacherCommissions.has(e.commissionId))
      .filter((e) => !typeFilter || typeFilter === 'TODOS' || e.type === (typeFilter as SchoolEvent['type']))
      .filter(
        (e) =>
          !filters?.commissionId ||
          filters.commissionId === 'TODAS' ||
          !e.commissionId ||
          e.commissionId === filters.commissionId,
      )
      .map((e) => ({
        id: e.id,
        commissionId: e.commissionId,
        commissionName: e.commissionId ? (commissionName.get(e.commissionId) ?? 'Comisión') : 'Toda la institución',
        title: e.title,
        description: e.description,
        type: e.type,
        date: e.startDate,
        endDate: e.endDate,
        mandatory: e.mandatory,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  // --- MENSAJERÍA INSTITUCIONAL (/social) ---
  async getInstitutionalContacts(): Promise<InstitutionalContact[]> {
    const [me, directory] = await Promise.all([getMe(), apiFetch<DirectoryEntry[]>('/social/directory')]);
    return directory.filter((d) => d.id !== me?.user.id).map(contactFrom);
  },

  async getConversations(): Promise<ConversationSummary[]> {
    const me = await getMe();
    if (!me) throw new Error('La sesión venció. Volvé a ingresar.');
    const [rows, contacts] = await Promise.all([
      apiFetch<Conversation[]>('/social/messages/conversations'),
      this.getInstitutionalContacts(),
    ]);
    const byId = new Map(contacts.map((c) => [c.id, c]));
    return rows.map((row) => {
      const contact = byId.get(row.with.id) ?? contactFrom(row.with);
      return {
        contact,
        lastMessage: chatFrom(row.lastMessage, me.user.id, contact),
        unreadCount: row.unreadCount,
      };
    });
  },

  async getConversation(contact: InstitutionalContact): Promise<ChatMessage[]> {
    const me = await getMe();
    if (!me) throw new Error('La sesión venció. Volvé a ingresar.');
    const rows = await apiFetch<PrivateMessage[]>(`/social/messages/with/${contact.id}`);
    return rows.map((m) => chatFrom(m, me.user.id, contact));
  },

  async sendMessage(data: { recipientId: string; body: string }): Promise<void> {
    await apiFetch('/social/messages', {
      method: 'POST',
      body: { receiverId: data.recipientId, text: data.body },
    });
  },

  // --- CALIFICACIONES (/records/grades) ---
  async getGradesByCommission(commissionId: string): Promise<GradeEntry[]> {
    const [rows, enrollments] = await Promise.all([
      apiFetch<Grade[]>('/records/grades', { query: { commissionId } }),
      apiFetch<Enrollment[]>('/structure/enrollments', { query: { commissionId } }),
    ]);
    const enrollmentById = new Map(enrollments.map((e) => [e.id, e]));
    return rows.flatMap((g) => {
      const enrollment = enrollmentById.get(g.enrollmentId);
      const type = API_TO_EVALUATION[`${g.type}:${g.instance}`];
      if (!enrollment || !type) return [];
      return [
        {
          id: g.id,
          commissionId,
          studentId: enrollment.studentId,
          type,
          date: g.date,
          value: g.value,
          absent: g.absent,
          published: g.published,
          publishedAt: g.publishedAt,
          notes: g.notes,
        },
      ];
    });
  },

  async saveGrade(data: {
    studentId: string;
    commissionId: string;
    type: GradeEvaluation;
    date: string;
    value: number | null;
    absent: boolean;
    notes?: string;
  }): Promise<void> {
    const enrollments = await apiFetch<Enrollment[]>('/structure/enrollments', { query: { commissionId: data.commissionId } });
    const enrollment = enrollments.find((e) => e.studentId === data.studentId);
    if (!enrollment) throw new Error('El alumno no está inscripto en esta comisión.');
    const target = EVALUATION_TO_API[data.type];
    await apiFetch('/records/grades', {
      method: 'PUT',
      body: {
        enrollmentId: enrollment.id,
        type: target.type,
        instance: target.instance,
        date: data.date,
        value: data.value,
        absent: data.absent,
        notes: data.notes || undefined,
      },
    });
  },

  async publishGrades(commissionId: string, type: GradeEvaluation): Promise<{ published: number }> {
    const target = EVALUATION_TO_API[type];
    return apiFetch<{ published: number }>('/records/grades/publish', {
      method: 'POST',
      body: { commissionId, type: target.type, instance: target.instance },
    });
  },
};
