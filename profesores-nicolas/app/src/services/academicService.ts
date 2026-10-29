import { apiFetch, getMe } from '@shared/api';
import { SHIFT_LABELS, OBSERVATION_CATEGORY_LABELS } from '@shared/types';
import type { AuthMe, CommissionView, AcademicCycle, Teacher as ApiTeacher, PreceptorScope, Enrollment, Observation, AttendanceStatus as ApiStatus, ObservationCategory } from '@shared/types';
import type { Teacher, Commission, Student, ClassSession, AttendanceRecord, AcademicObservation, AttendanceStatus } from '../types';

const toApiStatus: Record<AttendanceStatus, ApiStatus> = { PRESENTE: 'PRESENT', AUSENTE: 'ABSENT', TARDE: 'LATE' };
const fromApiStatus: Record<ApiStatus, AttendanceStatus> = { PRESENT: 'PRESENTE', ABSENT: 'AUSENTE', LATE: 'TARDE' };
type SessionResponse = { id: string; commissionId: string; date: string; topic?: string; status: string; registeredCount?: number; records?: { studentId: string; status: ApiStatus }[] };
const sessionView = (s: SessionResponse): ClassSession => ({ id: s.id, commissionId: s.commissionId, date: s.date, topic: s.topic, isClosed: s.status === 'CLOSED', registeredCount: s.registeredCount ?? s.records?.length ?? 0 });

export const academicService = {
  async getCurrentTeacher(me?: AuthMe): Promise<Teacher> {
    const identity = me ?? await getMe();
    if (!identity) throw new Error('La sesión venció. Volvé a ingresar.');
    const teachers = await apiFetch<ApiTeacher[]>('/structure/teachers');
    const teacher = teachers.find(t => t.id === identity.teacherId || t.userId === identity.user.id);
    return { id: teacher?.id ?? identity.user.id, legajo: teacher?.fileNumber ?? 'Sin legajo docente', name: `${identity.user.firstName} ${identity.user.lastName}`, title: teacher?.title ?? '', email: identity.user.email, department: '' };
  },
  async getCommissions(teacherId?: string): Promise<Commission[]> {
    const [rows, cycles] = await Promise.all([apiFetch<CommissionView[]>('/structure/commissions'), apiFetch<AcademicCycle[]>('/structure/cycles')]);
    return rows.filter(c => !teacherId || c.teacherIds.includes(teacherId)).map(c => ({
      id: c.id, code: c.code, name: c.code, subjectId: c.subjectId, subjectName: c.subjectName, careerName: c.careerName,
      academicYear: String(cycles.find(cy => cy.id === c.cycleId)?.year ?? ''), shift: SHIFT_LABELS[c.shift] as Commission["shift"],
      schedule: c.schedule.map(s => `${['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][s.weekday]} ${s.startTime}–${s.endTime}`).join(' · '),
      classroom: [...new Set(c.schedule.map(s => s.classroom).filter(Boolean))].join(', '), teacherId: c.teacherIds[0] ?? '', studentCount: c.studentCount,
    }));
  },
  async getCommissionById(id: string): Promise<Commission | undefined> { return (await this.getCommissions()).find(c => c.id === id); },
  async getStudentsByCommission(commissionId: string, filters?: { searchQuery?: string; status?: string; sortBy?: 'name' | 'legajo'; sortOrder?: 'asc' | 'desc' }): Promise<Student[]> {
    const [scope, enrollments] = await Promise.all([apiFetch<PreceptorScope>('/academic/scope'), apiFetch<Enrollment[]>('/structure/enrollments', { query: { commissionId } })]);
    const list: Student[] = enrollments.filter(e => e.condition !== 'DROPPED').map(e => {
      const s = scope.students.find(s => s.id === e.studentId);
      if (!s) throw new Error('No se pudo obtener la ficha de un alumno inscripto.');
      return { id: s.id, legajo: s.fileNumber, dni: s.dni, lastName: s.lastName, firstName: s.firstName, email: s.email, commissionId, status: e.condition === 'FREE' ? 'LIBRE' : e.condition === 'PROMOTED' ? 'PROMOCIONADO' : e.condition === 'PASSED' ? 'APROBADO' : e.condition === 'IN_PROGRESS' ? 'CURSANDO' : 'REGULAR', enrollmentDate: e.enrolledAt };
    });
    const q = filters?.searchQuery?.trim().toLowerCase();
    return list.filter(s => (!filters?.status || filters.status === 'TODOS' || s.status === filters.status) && (!q || `${s.lastName} ${s.firstName} ${s.legajo} ${s.dni}`.toLowerCase().includes(q))).sort((a,b) => (filters?.sortBy === 'legajo' ? a.legajo.localeCompare(b.legajo) : `${a.lastName}, ${a.firstName}`.localeCompare(`${b.lastName}, ${b.firstName}`)) * (filters?.sortOrder === 'desc' ? -1 : 1));
  },
  async getClassSessions(commissionId?: string): Promise<ClassSession[]> {
    const commissionIds = commissionId ? [commissionId] : (await this.getCommissions()).map(c => c.id);
    const groups = await Promise.all(commissionIds.map(id =>
      apiFetch<SessionResponse[]>(`/attendance/commissions/${id}/sessions`)
    ));
    return groups.flat().map(sessionView).sort((a, b) => b.date.localeCompare(a.date));
  },
  async getClassSessionById(id: string): Promise<ClassSession> { return sessionView(await apiFetch<SessionResponse>(`/attendance/sessions/${id}`)); },
  async createOrOpenClassSession(commissionId: string, date: string, topic?: string): Promise<ClassSession> {
    return sessionView(await apiFetch<SessionResponse>(`/attendance/commissions/${commissionId}/sessions`, { method: 'POST', body: { date, topic } }));
  },
  async getAttendanceBySession(id: string): Promise<AttendanceRecord[]> {
    const s = await apiFetch<SessionResponse>(`/attendance/sessions/${id}`);
    return (s.records ?? []).map(r => ({ id: `${id}:${r.studentId}`, classSessionId: id, studentId: r.studentId, status: fromApiStatus[r.status], recordedAt: '', recordedByTeacherId: '' }));
  },
  async saveAttendance(sessionId: string, records: { studentId: string; status: AttendanceStatus }[], _teacherId: string): Promise<{ success: boolean; message: string; count: number }> {
    const result = await apiFetch<{ saved: number; closed: boolean }>(`/attendance/sessions/${sessionId}`, { method: 'PUT', body: { records: records.map(r => ({ studentId: r.studentId, status: toApiStatus[r.status] })), close: false } });
    return { success: true, message: `Asistencia guardada para ${result.saved} estudiantes.`, count: result.saved };
  },
  async getObservations(filters?: { commissionId?: string; studentId?: string; searchQuery?: string }): Promise<AcademicObservation[]> {
    const [rows, scope, commissions] = await Promise.all([
      apiFetch<Observation[]>('/records/observations', { query: { commissionId: filters?.commissionId === 'TODAS' ? undefined : filters?.commissionId, studentId: filters?.studentId === 'TODOS' ? undefined : filters?.studentId } }),
      apiFetch<PreceptorScope>('/academic/scope'), this.getCommissions(),
    ]);
    const list = rows.map(o => {
      const s = scope.students.find(s => s.id === o.studentId);
      return { id: o.id, commissionId: o.commissionId, commissionName: commissions.find(c => c.id === o.commissionId)?.name ?? o.commissionId, studentId: o.studentId, studentName: s ? `${s.lastName}, ${s.firstName}` : 'Alumno sin ficha disponible', studentLegajo: s?.fileNumber ?? '', pedagogicalDate: o.date, createdAt: o.createdAt, content: o.content, category: OBSERVATION_CATEGORY_LABELS[o.category] as AcademicObservation['category'], teacherId: o.createdBy };
    });
    const q = filters?.searchQuery?.trim().toLowerCase();
    return list.filter(o => !q || `${o.studentName} ${o.content} ${o.category} ${o.commissionName}`.toLowerCase().includes(q));
  },
  async createObservation(data: Omit<AcademicObservation, 'id' | 'createdAt'>): Promise<AcademicObservation> {
    const category = (Object.keys(OBSERVATION_CATEGORY_LABELS) as ObservationCategory[]).find(k => OBSERVATION_CATEGORY_LABELS[k] === data.category);
    if (!category) throw new Error('Categoría de observación inválida.');
    const result = await apiFetch<{ id: string }>('/records/observations', { method: 'POST', body: { commissionId: data.commissionId, studentId: data.studentId, date: data.pedagogicalDate, category, content: data.content } });
    const saved = (await this.getObservations({ commissionId: data.commissionId, studentId: data.studentId })).find(o => o.id === result.id);
    if (!saved) throw new Error('La observación se guardó, pero no se pudo recargar. Actualizá la pantalla antes de intentar otra vez.');
    return saved;
  },
};
