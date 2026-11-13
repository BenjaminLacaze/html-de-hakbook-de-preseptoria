import { apiClient } from './client';
import { SubjectGrades } from '../types/api';

/** Solo llegan las notas que el docente ya publicó. */
export async function getChildGrades(childId: string): Promise<SubjectGrades[]> {
  return apiClient<SubjectGrades[]>(`/guardian/children/${encodeURIComponent(childId)}/grades`, { method: 'GET' });
}
