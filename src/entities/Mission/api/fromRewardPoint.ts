import api from '@/shared/api/axiosInstance';

// 리워드 보상 요청
export const getRewardPoints = async (): Promise<any> => {
  const response = await api.get('/portal/reward/point');

  if (response.data.code === 'OK') {
    return response.data.message;
  } else {
    throw new Error(response.data.message || 'Failed to fetch reward information');
  }
};


export default getRewardPoints;
