import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch, logout as endSession } from '@shared/api';
import type { AuthMe, Student, MySubject, AttendanceRecordView, AttendanceSummary, InstitutionSettings, Notice } from '@shared/types';
import type { StudentProfile, AttendanceRecord } from '../types';
interface Data {
    userId: string;
    student: StudentProfile;
    records: AttendanceRecord[];
    summary: AttendanceSummary;
    settings: InstitutionSettings;
    notices: Notice[];
}
const AuthContext = createContext<(Data & {
    isLoggedIn: boolean;
    isDemoMode: boolean;
    isLoading: boolean;
    logout: () => Promise<void>;
}) | undefined>(undefined);
export const AuthProvider: React.FC<{
    me: AuthMe;
    children: React.ReactNode;
}> = ({ me, children }) => {
    const [data, setData] = useState<Data>(), [error, setError] = useState(''), [loading, setLoading] = useState(true);
    useEffect(() => {
        let active = true;
        const load = async () => {
            setLoading(true);
            try {
                const [s, subjects, rows, summary, settings, notices] = await Promise.all([apiFetch<Student>('/me/student'), apiFetch<MySubject[]>('/me/subjects'), apiFetch<AttendanceRecordView[]>('/me/attendance'), apiFetch<AttendanceSummary>('/me/summary'), apiFetch<InstitutionSettings>('/records/settings'), apiFetch<Notice[]>('/records/notices')]);
                const c = subjects[0]?.commission;
                const student: StudentProfile = { id: s.id, legajo: s.fileNumber, dni: s.dni, firstName: s.firstName, lastName: s.lastName, email: s.email, career: c?.careerName ?? 'Sin cursadas', institution: settings.name, institutionShort: settings.shortName, year: c ? String(c.subjectYear) : 'Sin informar', division: subjects.map(x => x.commission.code).join(', '), shift: c?.shift ?? 'Sin informar', academicYear: new Date().getFullYear(), enrollmentStatus: ({ ACTIVE: 'ACTIVO', GRADUATED: 'EGRESADO', INACTIVE: 'INACTIVO', WITHDRAWN: 'BAJA' } as const)[s.status], minimumAttendanceRequired: settings.minAttendancePercent, minimumJustifiedAttendanceRequired: settings.attendanceRiskThresholdPercent, preceptorContact: { name: 'Consultar en Secretaría', email: 'Sin informar', office: 'Sin informar' } };
                const records: AttendanceRecord[] = rows.map(r => ({ id: r.id, studentId: r.studentId, date: r.date, time: '', status: r.justified ? 'JUSTIFICADO' : r.status === 'PRESENT' ? 'PRESENTE' : r.status === 'LATE' ? 'TARDE' : 'AUSENTE', subjectName: r.subjectName, academicPeriod: subjects.find(x => x.commission.id === r.commissionId)?.commission.period === 'FIRST_TERM' ? '1C' : subjects.find(x => x.commission.id === r.commissionId)?.commission.period === 'SECOND_TERM' ? '2C' : 'ANUAL', observation: r.notes, registeredBy: r.source === 'TEACHER' ? 'Docente' : 'Preceptoría' }));
                if (active) {
                    setData({ userId: me.user.id, student, records, summary, settings, notices });
                    setError('');
                }
            }
            catch (e) {
                if (active)
                    setError((e as Error).message);
            }
            finally {
                if (active)
                    setLoading(false);
            }
        };
        void load();
        window.addEventListener('focus', load);
        return () => { active = false; window.removeEventListener('focus', load); };
    }, [me.user.id]);
    const logout = async () => { try {
        await endSession();
        window.location.reload();
    }
    catch (e) {
        setError((e as Error).message);
    } };
    if (error)
        return <div role="alert"><p>{error}</p><button onClick={() => window.location.reload()}>Volver a cargar</button></div>;
    if (!data)
        return <p role="status">Cargando datos del alumno…</p>;
    return <AuthContext.Provider value={{ ...data, isLoggedIn: true, isDemoMode: false, isLoading: loading, logout }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => { const c = useContext(AuthContext); if (!c)
    throw new Error('Falta la sesión del alumno'); return c; };
