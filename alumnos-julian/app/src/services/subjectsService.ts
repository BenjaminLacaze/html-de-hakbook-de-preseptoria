import { apiClient } from '../lib/apiClient';
import { IS_MOCK_MODE, simulateNetworkLatency } from './apiConfig';
import { mockSubjects } from '../mocks/mockData';
import type { Subject } from '../types';

export const subjectsService = {
  async getSubjects(): Promise<Subject[]> {
    if (IS_MOCK_MODE) {
      await simulateNetworkLatency(250);
      return [...mockSubjects];
    }
    const { data } = await apiClient.get<Subject[]>('/student/subjects');
    return data;
  },

  async getSubjectById(id: string): Promise<Subject | null> {
    if (IS_MOCK_MODE) {
      await simulateNetworkLatency(150);
      const found = mockSubjects.find((s) => s.id === id);
      return found ? { ...found } : null;
    }
    const { data } = await apiClient.get<Subject>(`/student/subjects/${id}`);
    return data;
  },
};
