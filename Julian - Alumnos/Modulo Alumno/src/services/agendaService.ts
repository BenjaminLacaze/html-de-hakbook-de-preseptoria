import { apiClient } from '../lib/apiClient';
import { IS_MOCK_MODE, simulateNetworkLatency } from './apiConfig';
import { mockAcademicEvents, mockTimelineEvents } from '../mocks/mockData';
import type { AcademicEvent, TimelineEvent } from '../types';

export const agendaService = {
  async getAcademicEvents(): Promise<AcademicEvent[]> {
    if (IS_MOCK_MODE) {
      await simulateNetworkLatency(200);
      return [...mockAcademicEvents];
    }
    const { data } = await apiClient.get<AcademicEvent[]>('/student/agenda');
    return data;
  },

  async getTimelineEvents(): Promise<TimelineEvent[]> {
    if (IS_MOCK_MODE) {
      await simulateNetworkLatency(200);
      return [...mockTimelineEvents];
    }
    const { data } = await apiClient.get<TimelineEvent[]>('/student/history');
    return data;
  },
};
