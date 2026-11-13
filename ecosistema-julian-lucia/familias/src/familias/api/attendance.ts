import { apiClient } from './client';
import { AttendanceRecord } from '../types/api';

export interface AttendanceFilterParams {
  from?: string;
  to?: string;
  subjectId?: string;
}

interface AttendanceDTO {
  id: string;
  date: string;
  subjectId: string;
  subjectName: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  justified: boolean;
  notes?: string;
}

export async function getChildAttendance(childId: string, params?: AttendanceFilterParams): Promise<AttendanceRecord[]> {
  const q = new URLSearchParams();
  if (params?.from) q.set('from', params.from);
  if (params?.to) q.set('to', params.to);
  if (params?.subjectId && params.subjectId !== 'ALL') q.set('subjectId', params.subjectId);
  const qs = q.toString();
  const rows = await apiClient<AttendanceDTO[]>(
    `/guardian/children/${encodeURIComponent(childId)}/attendance${qs ? `?${qs}` : ''}`,
    { method: 'GET' },
  );
  // En la base, "justificada" no es un estado: es una falta con una justificación aprobada.
  return rows.map((r) => ({
    id: r.id,
    date: r.date,
    subjectId: r.subjectId,
    subjectName: r.subjectName,
    state: r.status === 'ABSENT' && r.justified ? 'JUSTIFIED_ABSENT' : r.status,
    justified: r.justified,
    notes: r.notes,
  }));
}
