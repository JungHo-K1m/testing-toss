import api from '@/shared/api/axiosInstance';

// 베팅 가능 금액 조회
export const getBettingAmount = async (): Promise<{starCount: number, allowedBetting: number}> => {
  const response = await api.get('/bettingAmount');

  if (response.data.code === 'OK') {
    return response.data.message;
  } else {
    throw new Error(response.data.message || 'Failed to fetch betting amount information');
  }
};

export default getBettingAmount;
