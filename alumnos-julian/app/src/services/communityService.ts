import { apiClient } from '../lib/apiClient';
import { IS_MOCK_MODE, simulateNetworkLatency } from './apiConfig';
import { mockCommunityMembers } from '../mocks/mockData';
import type { CommunityMember } from '../types';

export const communityService = {
  async getMembers(): Promise<CommunityMember[]> {
    if (IS_MOCK_MODE) {
      await simulateNetworkLatency(200);
      return [...mockCommunityMembers];
    }
    const { data } = await apiClient.get<CommunityMember[]>('/student/community');
    return data;
  },
};
