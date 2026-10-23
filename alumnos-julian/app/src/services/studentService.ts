import { apiClient } from '../lib/apiClient';
import { IS_MOCK_MODE, simulateNetworkLatency } from './apiConfig';
import { mockStudentProfile } from '../mocks/mockData';
import type { StudentProfile } from '../types';

let currentProfile: StudentProfile = { ...mockStudentProfile };

export const studentService = {
  async getProfile(): Promise<StudentProfile> {
    if (IS_MOCK_MODE) {
      await simulateNetworkLatency(200);
      return { ...currentProfile };
    }
    const { data } = await apiClient.get<StudentProfile>('/student/profile');
    return data;
  },

  async updateContactInfo(info: { email: string; telefono: string }): Promise<StudentProfile> {
    if (IS_MOCK_MODE) {
      await simulateNetworkLatency(350);
      currentProfile = {
        ...currentProfile,
        email: info.email,
        telefono: info.telefono,
      };
      return { ...currentProfile };
    }
    const { data } = await apiClient.patch<StudentProfile>('/student/profile/contact', info);
    return data;
  },
};
