import api from '@/shared/api/axiosInstance';

// 프로모션 보상 응답 타입 정의
export interface PromotionResponse {
  promotionCode: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'GIVEUP';
  errorMessage?: string;
}

// 프로모션 보상 지급 API
export const getPromotion = async (promotionCode: string): Promise<PromotionResponse> => {
  const response = await api.post('/api/promotion', {
    promotionCode: promotionCode
  });

  if (response.data.code === 'OK') {
    console.log("프로모션 보상 지급 응답: ", response.data);
    return {
      promotionCode: response.data.data.promotionCode,
      status: response.data.data.status,
      errorMessage: response.data.data.errorMessage
    };
  } else {
    console.error('프로모션 보상 지급 실패:', response);
    throw new Error(response.data.message || 'Failed to give promotion reward');
  }
};

export default getPromotion;
