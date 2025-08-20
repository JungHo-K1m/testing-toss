import api from '@/shared/api/axiosInstance';

export interface CardFlipRequest {
  type: 'COLOR' | 'FLIP'; // COLOR = 2분의 1 확률, FLIP = 4분의 1 확률
  bettingAmount: number; // 100 단위로 베팅 가능
  num: number; // 선택 값 (왼쪽부터 1)
}

export interface CardFlipResponseData {
  bettingAmount: number;
  reward: number;
  result: 'WIN' | 'DEFEAT';
  rank: number;
  starCount: number;
}

export const flipCard = async (requestData: CardFlipRequest): Promise<CardFlipResponseData> => {
  try {
    const response = await api.post('/cardflip', requestData);
    
    if (response.data.code === 'OK') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || '카드 플립에 실패했습니다.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '카드 플립에 실패했습니다.');
  }
}; 