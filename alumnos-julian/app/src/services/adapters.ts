import { apiFetch } from '@shared/api';
import type { Student as ApiStudent, MySubject, AttendanceSummary, MyGrade, AttendanceRecordView, InstitutionSettings } from '@shared/types';
import type { StudentProfile, Subject, GradeItem, AttendanceRecord } from '../types';
export const loadSubjects = () => apiFetch<MySubject[]>('/me/subjects');
export function subject(s: MySubject): Subject {
    const c = s.commission, a = s.attendance;
    return { id: c.id, minimumAttendance: a.minimumRequired, attendanceRisk: a.risk, codigo: c.code, nombre: c.subjectName, carrera: c.careerName, anio: c.subjectYear,
        cuatrimestre: c.period === 'FIRST_TERM' ? 1 : c.period === 'SECOND_TERM' ? 2 : 'Anual', comision: c.code,
        docentes: c.teacherNames.map((nombre, i) => ({ id: c.teacherIds[i] ?? '', nombre, rol: 'Sin informar', email: '' })),
        horarios: c.schedule.map(h => ({ dia: (['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] as const)[h.weekday - 1], horarioInicio: h.startTime, horarioFin: h.endTime, aula: h.classroom ?? 'Sin informar', modalidad: 'Sin informar' })),
        estadoCursada: s.condition === 'PROMOTED' ? 'Promocionada' : s.condition === 'PASSED' ? 'Aprobada' : s.condition === 'REGULAR' ? 'Regularizada' : s.condition === 'FREE' ? 'Libre' : 'En Curso',
        totalClasesPrevistas: a.totalSessions, clasesDictadas: a.totalSessions, asistenciasPresentes: a.presentCount, asistenciasAusentes: a.absentCount, asistenciasJustificadas: a.justifiedAbsenceCount,
        porcentajeAsistencia: a.percentage, limiteFaltas: a.absentCount + a.remainingAbsencesAllowed, promedioParciales: null, correlativas: [] };
}
export async function profile(): Promise<StudentProfile> {
    const [s, ss, a, i] = await Promise.all([apiFetch<ApiStudent>('/me/student'), loadSubjects(), apiFetch<AttendanceSummary>('/me/summary'), apiFetch<InstitutionSettings>('/records/settings')]);
    const c = ss[0]?.commission;
    return { id: s.id, minimumAttendance: a.minimumRequired, attendanceRisk: a.risk, legajo: s.fileNumber, nombre: s.firstName, apellido: s.lastName, dni: s.dni, email: s.email, telefono: s.phone ?? '', carrera: c?.careerName ?? 'Sin cursadas', codigoCarrera: 'Sin informar', institucion: i.name, planEstudio: 'Sin informar', anioCursada: c?.subjectYear ?? 0, cuatrimestreActual: 0, comision: ss.map(x => x.commission.code).join(', '), turno: ({ MORNING: 'Mañana', AFTERNOON: 'Tarde', EVENING: 'Noche' } as const)[c?.shift] ?? 'Sin informar', estadoAcademico: s.status === 'ACTIVE' ? 'Activo' : s.status, fechaInscripcion: s.admissionDate, promedioGeneral: null, porcentajeAsistenciaGlobal: a.percentage };
}
export const grade = (g: MyGrade): GradeItem => ({ id: g.id, materiaId: g.commissionId, materiaNombre: g.subjectName, tipoEvaluacion: g.type === 'FINAL_EXAM' ? 'Examen Final' : g.type === 'ASSIGNMENT' ? 'Trabajo Práctico' : g.type === 'COLLOQUIUM' ? 'Coloquio' : g.type === 'MAKEUP' ? (g.instance === 2 ? 'Recuperatorio 2' : 'Recuperatorio 1') : g.instance === 2 ? '2do Parcial' : '1er Parcial', nota: g.value, fechaEvaluacion: g.date, estado: g.absent ? 'Ausente' : g.value === null ? 'Pendiente' : 'Publicada', esOficial: true, observaciones: g.notes });
export const attendance = (r: AttendanceRecordView): AttendanceRecord => ({ id: r.id, materiaId: r.commissionId, materiaNombre: r.subjectName, fecha: r.date, estado: r.justified ? 'Justificada' : r.status === 'PRESENT' ? 'Presente' : r.status === 'LATE' ? 'Tardanza' : 'Ausente', estadoJustificacion: r.justificationStatus === 'APPROVED' ? 'Aprobada' : r.justificationStatus === 'PENDING' ? 'En Revisión' : r.justificationStatus === 'REJECTED' ? 'Rechazada' : 'Sin Trámite', metodoRegistro: r.source === 'TEACHER' ? 'Docente' : 'Preceptoría', observacion: r.notes });
