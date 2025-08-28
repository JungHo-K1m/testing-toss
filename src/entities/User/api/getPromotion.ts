import api from '@/shared/api/axiosInstance';

// 프로모션 보상 요청
export const getPromotion = async (): Promise<any> => {
  const response = await api.get('/portal/reward/promotion');

  if (response.data.code === 'OK') {
    // // console.log("프로모션 보상 수령 여부 확인: ", response);
    return response.data.message;
  } else {
    // console.error('Unexpected response:', response);
    throw new Error(response.data.message || 'Failed to fetch reward information');
  }
};


export default getPromotion;
