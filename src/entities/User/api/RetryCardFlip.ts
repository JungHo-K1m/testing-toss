// src/entities/User/api/RetryCardFlip.ts

import api from '@/shared/api/axiosInstance';

export interface CardFlipRetryRequest {
  // 카드게임 재시도 요청 데이터
  // 필요한 경우 추가 필드 정의
}

export interface CardFlipRetryResponse {
    success: boolean;
    message: string;
    data?: {
      canRetry: boolean;
      retryCount: number;
      maxRetries: number;
      // 게임 재시도에 필요한 추가 정보
      gameState?: {
        bettingAmount: number;
        gameType: "COLOR" | "FLIP";
        selectedValue: number;
      };
      // 보상 정보
      reward?: {
        type: "RETRY" | "BONUS";
        value: number;
      };
    };
  }

/**
 * 카드게임 재시도 광고 보상 API
 * 광고 시청 후 카드게임을 다시 시도할 수 있는 기회를 제공
 */
export const getCardFlipRetryAdReward = async (): Promise<CardFlipRetryResponse> => {
  try {
    const response = await api.post<CardFlipRetryResponse>('/cardflip/retry');
    
    console.log('카드게임 재시도 광고 보상 API 응답:', response.data);
    
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
          canRetry: false,
          retryCount: 0,
          maxRetries: 0,
        }
      };
      return errorResponse;
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      const errorResponse: CardFlipRetryResponse = {
        success: false,
        message: '서버와의 연결에 실패했습니다. 다시 시도해주세요.',
        data: {
          canRetry: false,
          retryCount: 0,
          maxRetries: 0,
        }
      };
      return errorResponse;
    } else {
      // 요청 자체를 보내지 못한 경우
      const errorResponse: CardFlipRetryResponse = {
        success: false,
        message: '요청을 처리할 수 없습니다. 다시 시도해주세요.',
        data: {
          canRetry: false,
          retryCount: 0,
          maxRetries: 0,
        }
      };
      return errorResponse;
    }
  }
};