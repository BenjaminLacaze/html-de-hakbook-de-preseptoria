import { apiClient } from '../lib/apiClient';
import { IS_MOCK_MODE, simulateNetworkLatency } from './apiConfig';
import { mockGrades } from '../mocks/mockData';
import type { GradeItem } from '../types';

export const gradesService = {
  async getGrades(): Promise<GradeItem[]> {
    if (IS_MOCK_MODE) {
      await simulateNetworkLatency(250);
      return [...mockGrades];
    }
    const { data } = await apiClient.get<GradeItem[]>('/student/grades');
    return data;
  },

  async getGradesBySubject(subjectId: string): Promise<GradeItem[]> {
    if (IS_MOCK_MODE) {
      await simulateNetworkLatency(150);
      return mockGrades.filter((g) => g.materiaId === subjectId);
    }
    const { data } = await apiClient.get<GradeItem[]>(`/student/subjects/${subjectId}/grades`);
    return data;
  },
};
