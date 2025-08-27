// src/entities/User/api/RetryRPS.ts

import api from '@/shared/api/axiosInstance';

export interface RPSRetryRequest {
  // RPS 재시도 요청 데이터
  // 필요한 경우 추가 필드 정의
}

export interface RPSRetryResponse {
  success: boolean;
  message: string;
  data?: {
    canRetry: boolean;
    retryCount: number;
    maxRetries: number;
    // 추가 보상 정보가 있다면 여기에 정의
  };
}

/**
 * RPS 재시도 광고 보상 API
 * 광고 시청 후 RPS 게임을 다시 시도할 수 있는 기회를 제공
 */
export const getRPSRetryAdReward = async (): Promise<RPSRetryResponse> => {
  try {
    const response = await api.post<RPSRetryResponse>('/rps/retry');
    
    console.log('RPS 재시도 광고 보상 API 응답:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('RPS 재시도 광고 보상 API 오류:', error);
    
    // 에러 응답 구조화
    if (error.response) {
      // 서버에서 에러 응답을 보낸 경우
      const errorResponse: RPSRetryResponse = {
        success: false,
        message: error.response.data?.message || 'RPS 재시도에 실패했습니다.',
        data: {
          canRetry: false,
          retryCount: 0,
          maxRetries: 0,
        }
      };
      return errorResponse;
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      const errorResponse: RPSRetryResponse = {
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
      const errorResponse: RPSRetryResponse = {
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