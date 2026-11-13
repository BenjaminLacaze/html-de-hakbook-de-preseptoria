import { apiClient } from './client';
import { AttendanceSummary, Child } from '../types/api';

export const SHIFT_LABELS: Record<string, string> = { MORNING: 'Mañana', AFTERNOON: 'Tarde', EVENING: 'Vespertino' };
export const RELATIONSHIP_LABELS: Record<string, string> = { MOTHER: 'Madre', FATHER: 'Padre', LEGAL_GUARDIAN: 'Tutor/a Legal' };

interface ChildDTO {
  id: string;
  firstName: string;
  lastName: string;
  courseName: string;
  year: number;
  shift: string;
  relationship: string;
}

export async function getChildren(): Promise<Child[]> {
  const rows = await apiClient<ChildDTO[]>('/guardian/children', { method: 'GET' });
  return rows.map((c) => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    courseName: c.courseName,
    year: `${c.year}.º año`,
    shift: SHIFT_LABELS[c.shift] ?? c.shift,
    relationship: RELATIONSHIP_LABELS[c.relationship] ?? c.relationship,
  }));
}

export async function getChildSummary(childId: string): Promise<AttendanceSummary> {
  const s = await apiClient<AttendanceSummary>(`/guardian/children/${encodeURIComponent(childId)}/summary`, { method: 'GET' });
  return {
    ...s,
    ruleExplanation:
      s.ruleExplanation ??
      `Asistencia mínima requerida: ${s.minimumRequired}%. Las inasistencias con justificación aprobada por Preceptoría no cuentan en contra.`,
  };
}
