// src/entities/User/api/RetryCardFlip.ts

import api from '@/shared/api/axiosInstance';

export interface CardFlipRetryRequest {
  cardFlipId: number;      // 카드플립 게임 ID
  type: "COLOR" | "FLIP"; // 게임 타입
  num: number;             // 선택 값 (왼쪽부터 1)
}

export interface CardFlipRetryResponse {
  success: boolean;
  message: string;
  data?: {
    bettingAmount: number;
    reward: number;
    result: string;        // "WIN" 또는 "DEFEAT"
    rank: number;
    starCount: number;
    cardFlipId: number;
  };
}

/**
 * 카드게임 재시도 광고 보상 API
 * 광고 시청 후 카드게임을 다시 시도할 수 있는 기회를 제공
 */
export const getCardFlipRetryAdReward = async (requestData: CardFlipRetryRequest): Promise<CardFlipRetryResponse> => {
  try {
    const response = await api.post<CardFlipRetryResponse>('/cardflip/retry', requestData);
    
    // console.log('카드게임 재시도 광고 보상 API 응답:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('카드게임 재시도 광고 보상 API 오류:', error);
    
    // 에러 응답 구조화
    if (error.response) {
      // 서버에서 에러 응답을 보낸 경우
      const errorResponse: CardFlipRetryResponse = {
        success: false,
        message: error.response.data?.message || '카드게임 재시도에 실패했습니다.',
        data: {
          bettingAmount: 0,
          reward: 0,
          result: "",
          rank: 0,
          starCount: 0,
          cardFlipId: 0,
        }
      };
      return errorResponse;
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      const errorResponse: CardFlipRetryResponse = {
        success: false,
        message: '서버와의 연결에 실패했습니다. 다시 시도해주세요.',
        data: {
          bettingAmount: 0,
          reward: 0,
          result: "",
          rank: 0,
          starCount: 0,
          cardFlipId: 0,
        }
      };
      return errorResponse;
    } else {
      // 요청 자체를 보내지 못한 경우
      const errorResponse: CardFlipRetryResponse = {
        success: false,
        message: '요청을 처리할 수 없습니다. 다시 시도해주세요.',
        data: {
          bettingAmount: 0,
          reward: 0,
          result: "",
          rank: 0,
          starCount: 0,
          cardFlipId: 0,
        }
      };
      return errorResponse;
    }
  }
};