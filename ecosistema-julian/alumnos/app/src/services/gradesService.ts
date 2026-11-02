import { apiFetch } from '@shared/api';
import type { MyGrade } from '@shared/types';
import { grade } from './adapters';
export const gradesService = { async getGrades() { return (await apiFetch<MyGrade[]>('/me/grades')).map(grade); }, async getGradesBySubject(id: string) { return (await this.getGrades()).filter(g => g.materiaId === id); } };
