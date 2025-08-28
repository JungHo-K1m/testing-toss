import api from '@/shared/api/axiosInstance';

interface ViralRewardRequest {
  count: number;
}

interface ViralRewardResponse {
  code: string;
  message: string;
  data: null;
}

export const getViralReward = async (count: number): Promise<ViralRewardResponse> => {
  const response = await api.post<ViralRewardResponse>('/viral', { count });
  return response.data;
};