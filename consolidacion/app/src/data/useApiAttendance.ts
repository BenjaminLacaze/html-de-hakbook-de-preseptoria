// Capa traductora entre la pantalla de Preceptoría (rescatada, con su propio modelo) y la API.
//
// La pantalla habla en "su idioma" (ids numéricos de alumno, estados 'Presente'/'Justificado'…);
// la API habla el modelo unificado (UUIDs, PRESENT/ABSENT/LATE + justificaciones aparte).
//
//   API → pantalla
//     PRESENT, LATE                → Presente   (la pantalla del preceptor no tiene "tarde")
//     ABSENT + justif. aprobada    → Justificado
//     ABSENT + justif. pendiente   → Pendiente  (aparece en "Justificaciones")
//     ABSENT                       → Ausente
//   pantalla → API
//     Presente → PRESENT · Ausente → ABSENT
//     Justificado → ABSENT + justificación de ese día, aprobada en el momento
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch, ApiRequestError } from '@shared/api';
import type { AttendanceRecordView, AuthMe, JustificationView, PreceptorScope } from '@shared/types';
import { AttendanceStatus, Role, type AttendanceRecord, type Subject, type User } from '../legacy/types';

/** Código de carrera en la base → id de carrera que usan las pantallas rescatadas (CAREERS). */
const LEGACY_CAREER: Record<string, string> = { 'DEMO-DEV': 'dev', 'DEMO-DIS': 'design' };
const legacyCareer = (code: string) => LEGACY_CAREER[code] ?? code.toLowerCase();

export interface ApiAttendanceState {
  state: 'idle' | 'loading' | 'ready' | 'error';
  error?: string;
  preceptor?: User;
  students?: User[];
  subjects?: Subject[];
  attendance?: {
    attendanceRecords: AttendanceRecord[];
    addAttendanceRecord: (updates: { studentId: number; status: AttendanceStatus }[], date: string, subjectId: string) => void;
    updateAttendanceStatus: (recordId: string, status: AttendanceStatus) => void;
    resolveJustificationRequest: (recordId: string, approved: boolean) => void;
  };
}

export function useApiAttendance(me: AuthMe | null): ApiAttendanceState {
  const [scope, setScope] = useState<PreceptorScope | null>(null);
  const [rows, setRows] = useState<AttendanceRecordView[]>([]);
  const [justs, setJusts] = useState<JustificationView[]>([]);
  const [state, setState] = useState<ApiAttendanceState['state']>(me ? 'loading' : 'idle');
  const [error, setError] = useState<string>();

  // UUID de alumno ↔ id numérico que usa la pantalla (estable mientras dura la sesión).
  const ids = useRef({ toNum: new Map<string, number>(), toUuid: new Map<number, string>(), next: 100000 });
  const num = (uuid: string) => {
    const m = ids.current;
    if (!m.toNum.has(uuid)) {
      m.toNum.set(uuid, m.next);
      m.toUuid.set(m.next, uuid);
      m.next++;
    }
    return m.toNum.get(uuid)!;
  };

  const reload = useCallback(async () => {
    if (!me) return;
    try {
      const sc = await apiFetch<PreceptorScope>('/academic/scope');
      const careerId = sc.careers[0]?.id;
      const [att, js] = await Promise.all([
        careerId ? apiFetch<AttendanceRecordView[]>('/attendance', { query: { careerId } }) : Promise.resolve([]),
        apiFetch<JustificationView[]>('/attendance/justifications'),
      ]);
      setScope(sc);
      setRows(att);
      setJusts(js);
      setState('ready');
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Error inesperado.');
      setState('error');
    }
  }, [me]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const careerCode = scope?.careers[0]?.code;

  const preceptor = useMemo<User | undefined>(() => {
    if (!me || !scope) return undefined;
    const years = scope.years.find((y) => y.careerId === scope.careers[0]?.id)?.years ?? [1];
    return {
      id: 1,
      name: `${me.user.firstName} ${me.user.lastName}`,
      email: me.user.email,
      password: '',
      role: Role.PRECEPTOR,
      careerId: careerCode ? legacyCareer(careerCode) : 'dev',
      year: years,
    };
  }, [me, scope, careerCode]);

  const students = useMemo<User[]>(
    () =>
      (scope?.students ?? []).map((s) => ({
        id: num(s.id),
        name: `${s.firstName} ${s.lastName}`,
        email: s.email,
        password: '',
        role: Role.STUDENT,
        careerId: legacyCareer(s.careerCode),
        year: s.years.length === 1 ? s.years[0] : s.years,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scope],
  );

  const subjects = useMemo<Subject[]>(
    () => (scope?.subjects ?? []).map((s) => ({ id: s.id, name: s.name, careerId: legacyCareer(s.careerCode), year: s.year })),
    [scope],
  );

  const attendanceRecords = useMemo<AttendanceRecord[]>(() => {
    const justById = new Map(justs.map((j) => [j.id, j]));
    return rows.map((r) => {
      let status: AttendanceStatus;
      if (r.status === 'PRESENT' || r.status === 'LATE') status = AttendanceStatus.PRESENT;
      else if (r.justificationStatus === 'APPROVED') status = AttendanceStatus.JUSTIFIED;
      else if (r.justificationStatus === 'PENDING') status = AttendanceStatus.PENDING_JUSTIFICATION;
      else status = AttendanceStatus.ABSENT;
      return {
        id: r.id,
        studentId: num(r.studentId),
        subjectId: r.subjectId,
        date: r.date,
        status,
        justificationReason: r.justificationId ? justById.get(r.justificationId)?.reason : undefined,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, justs]);

  const report = (e: unknown) => window.alert(e instanceof ApiRequestError ? e.message : 'No se pudo guardar. Probá de nuevo.');

  const addAttendanceRecord = useCallback(
    (updates: { studentId: number; status: AttendanceStatus }[], date: string, subjectId: string) => {
      void (async () => {
        try {
          const records = updates.map((u) => ({
            studentId: ids.current.toUuid.get(u.studentId)!,
            status: u.status === AttendanceStatus.PRESENT ? ('PRESENT' as const) : ('ABSENT' as const),
          }));
          await apiFetch('/attendance/by-subject', { method: 'POST', body: { subjectId, date, records } });
          // "Justificado" marcado por el preceptor: justificación de ese día, aprobada en el momento.
          for (const u of updates.filter((x) => x.status === AttendanceStatus.JUSTIFIED)) {
            const studentId = ids.current.toUuid.get(u.studentId)!;
            const already = justs.some(
              (j) => j.studentId === studentId && j.fromDate <= date && j.toDate >= date && j.status === 'APPROVED',
            );
            if (already) continue;
            const j = await apiFetch<{ id: string }>('/attendance/justifications', {
              method: 'POST',
              body: { studentId, fromDate: date, toDate: date, reason: 'Justificada por Preceptoría al tomar asistencia.' },
            });
            await apiFetch(`/attendance/justifications/${j.id}`, { method: 'PATCH', body: { status: 'APPROVED' } });
          }
        } catch (e) {
          report(e);
        } finally {
          await reload();
        }
      })();
    },
    [justs, reload],
  );

  const updateAttendanceStatus = useCallback(
    (recordId: string, status: AttendanceStatus) => {
      const r = rows.find((x) => x.id === recordId);
      if (!r) return;
      addAttendanceRecord([{ studentId: num(r.studentId), status }], r.date, r.subjectId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, addAttendanceRecord],
  );

  const resolveJustificationRequest = useCallback(
    (recordId: string, approved: boolean) => {
      const r = rows.find((x) => x.id === recordId);
      if (!r?.justificationId) return;
      void apiFetch(`/attendance/justifications/${r.justificationId}`, {
        method: 'PATCH',
        body: { status: approved ? 'APPROVED' : 'REJECTED' },
      })
        .catch(report)
        .finally(() => void reload());
    },
    [rows, reload],
  );

  if (!me) return { state: 'idle' };
  if (state !== 'ready') return { state, error };
  return {
    state,
    preceptor,
    students,
    subjects,
    attendance: { attendanceRecords, addAttendanceRecord, updateAttendanceStatus, resolveJustificationRequest },
  };
}
