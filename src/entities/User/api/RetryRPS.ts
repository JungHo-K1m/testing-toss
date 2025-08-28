// src/entities/User/api/RetryRPS.ts

import api from '@/shared/api/axiosInstance';

export interface RPSRetryRequest {
  rpsId: number;           // RPS 게임 ID
  value: number;           // 0 = 가위, 1 = 바위, 2 = 보
}

export interface RPSRetryResponse {
  success: boolean;
  message: string;
  data?: {
    bettingAmount: number;
    reward: number;
    result: string;        // "WIN" 또는 "DEFEAT"
    pcValue: number;       // 0 = 가위, 1 = 바위, 2 = 보
    rank: number;
    starCount: number;
    rpsId: number;         // 추후 Retry를 위한 ID
  };
}

/**
 * RPS 재시도 광고 보상 API
 * 광고 시청 후 RPS 게임을 다시 시도할 수 있는 기회를 제공
 */
export const getRPSRetryAdReward = async (requestData: RPSRetryRequest): Promise<RPSRetryResponse> => {
  try {
    const response = await api.post<RPSRetryResponse>('/rps/retry', requestData);
    
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
          bettingAmount: 0,
          reward: 0,
          result: "",
          pcValue: 0,
          rank: 0,
          starCount: 0,
          rpsId: 0,
        }
      };
      return errorResponse;
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      const errorResponse: RPSRetryResponse = {
        success: false,
        message: '서버와의 연결에 실패했습니다. 다시 시도해주세요.',
        data: {
          bettingAmount: 0,
          reward: 0,
          result: "",
          pcValue: 0,
          rank: 0,
          starCount: 0,
          rpsId: 0,
        }
      };
      return errorResponse;
    } else {
      // 요청 자체를 보내지 못한 경우
      const errorResponse: RPSRetryResponse = {
        success: false,
        message: '요청을 처리할 수 없습니다. 다시 시도해주세요.',
        data: {
          bettingAmount: 0,
          reward: 0,
          result: "",
          pcValue: 0,
          rank: 0,
          starCount: 0,
          rpsId: 0,
        }
      };
      return errorResponse;
    }
  }
};