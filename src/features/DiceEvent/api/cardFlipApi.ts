import api from '@/shared/api/axiosInstance';

export interface CardFlipResponseData {
  success: boolean;
  reward?: {
    type: string;
    amount: number;
  };
}

export const flipCard = async (): Promise<CardFlipResponseData> => {
  try {
    const response = await api.post('/card-flip');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '카드 뒤집기에 실패했습니다.');
  }
}; 