import { apiFetch } from '@shared/api';
import type { SchoolEvent, Notice, MyGrade, AttendanceRecordView, JustificationView } from '@shared/types';
import type { AcademicEvent, TimelineEvent } from '../types';
export const agendaService = { async getAcademicEvents(): Promise<AcademicEvent[]> { return (await apiFetch<SchoolEvent[]>('/records/events')).map(e => ({ id: e.id, titulo: e.title, tipo: e.type === 'EXAM_PERIOD' ? 'Mesa de Finales' : e.type === 'CLASS' ? 'Clase' : e.type === 'HOLIDAY' ? 'Feriado' : 'Institucional', materiaId: e.commissionId, fecha: e.startDate, horarioInicio: '', horarioFin: '', ubicacion: 'Sin informar', descripcion: e.description, importante: e.mandatory })); }, async getTimelineEvents(): Promise<TimelineEvent[]> {
        const [notices, grades, records, justs] = await Promise.all([apiFetch<Notice[]>('/records/notices'), apiFetch<MyGrade[]>('/me/grades'), apiFetch<AttendanceRecordView[]>('/me/attendance'), apiFetch<JustificationView[]>('/me/justifications')]);
        return [
            ...notices.map((n): TimelineEvent => ({ id: n.id, fecha: n.publishedAt ?? n.createdAt, tipo: 'institucional', titulo: n.title, descripcion: n.content, badgeTexto: 'Comunicado', badgeVariant: 'info' })),
            ...grades.map((g): TimelineEvent => ({ id: g.id, fecha: g.date, tipo: 'calificacion', titulo: 'Nota publicada', descripcion: g.absent ? 'Ausente' : g.value === null ? 'Sin nota' : String(g.value), materiaNombre: g.subjectName, badgeTexto: 'Publicada', badgeVariant: 'info' })),
            ...records.map((r): TimelineEvent => ({ id: r.id, fecha: r.date, tipo: 'asistencia', titulo: 'Registro de asistencia', descripcion: r.notes ?? '', materiaNombre: r.subjectName, badgeTexto: r.justified ? 'Justificada' : r.status === 'PRESENT' ? 'Presente' : r.status === 'LATE' ? 'Tarde' : 'Ausente', badgeVariant: 'neutral' })),
            ...justs.map((j): TimelineEvent => ({ id: j.id, fecha: j.createdAt, tipo: 'tramite', titulo: 'Justificación', descripcion: j.reason, badgeTexto: j.status === 'APPROVED' ? 'Aprobada' : j.status === 'REJECTED' ? 'Rechazada' : 'En revisión', badgeVariant: 'info' }))
        ].sort((a, b) => b.fecha.localeCompare(a.fecha));
    } };
