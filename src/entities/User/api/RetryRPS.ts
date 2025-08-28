// src/entities/User/api/RetryRPS.ts

import api from '@/shared/api/axiosInstance';

export interface RPSRetryRequest {
  rpsId: number;           // RPS 게임 ID
  value: number;           // 0 = 가위, 1 = 바위, 2 = 보
}
export interface RPSRetryResponse {
  success: boolean;
  message: string;
  code?: string;        // ✅ 추가됨
  data?: {
    bettingAmount: number;
    reward: number;
    result: string;
    pcValue: number;
    rank: number;
    starCount: number;
    rpsId: number;
  };
}

// 로그 저장 헬퍼 함수
const saveLog = (action: string, data: any) => {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      data
    };
    
    const existingLogs = JSON.parse(localStorage.getItem('rpsApiLogs') || '[]');
    existingLogs.push(logEntry);
    
    // 로그가 너무 많아지지 않도록 최대 50개까지만 유지
    if (existingLogs.length > 50) {
      existingLogs.splice(0, existingLogs.length - 50);
    }
    
    localStorage.setItem('rpsApiLogs', JSON.stringify(existingLogs));
    
    // 콘솔에도 출력
    // console.log(`[RPS API] ${action}:`, data);
  } catch (error) {
    console.error('로그 저장 실패:', error);
  }
};

/**
 * RPS 재시도 광고 보상 API
 * 광고 시청 후 RPS 게임을 다시 시도할 수 있는 기회를 제공
 */
export const getRPSRetryAdReward = async (requestData: RPSRetryRequest): Promise<RPSRetryResponse> => {
  try {
    saveLog('API 요청 시작', {
      url: '/rps/retry',
      method: 'POST',
      requestData,
      timestamp: new Date().toISOString()
    });
    
    const response = await api.post<any>('/rps/retry', requestData);
    
    saveLog('API 응답 수신', {
      status: response.status,
      statusText: response.statusText,
      responseData: response.data,
      timestamp: new Date().toISOString()
    });
    
    //  핵심 수정: 응답 데이터 검증 및 구조 변환
    if (response.data && response.data.code === "OK") {
      saveLog('API 응답 성공', {
        success: true,
        data: response.data.data,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,                    // ← success 필드 추가
        message: response.data.message,   // ← message 필드 추가
        data: response.data.data          // ← data 필드 유지
      };
    } else {
      saveLog('API 응답 실패', {
        success: false,
        responseData: response.data,
        timestamp: new Date().toISOString()
      });
      
      const errorResponse: RPSRetryResponse = {
        success: false,
        message: response.data?.message || 'RPS 재시도에 실패했습니다.',
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
  } catch (error: any) {
    saveLog('API 에러 발생', {
      errorType: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // 에러 응답 구조화
    if (error.response) {
      // 서버에서 에러 응답을 보낸 경우
      saveLog('서버 에러 응답', {
        status: error.response.status,
        statusText: error.response.statusText,
        responseData: error.response.data,
        headers: error.response.headers,
        timestamp: new Date().toISOString()
      });
      
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
      saveLog('서버 응답 없음', {
        requestData: error.request,
        timestamp: new Date().toISOString()
      });
      
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
      saveLog('요청 실패', {
        errorMessage: error.message,
        timestamp: new Date().toISOString()
      });
      
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

// 로그 확인용 함수들
export const checkRPSApiLogs = () => {
  try {
    const logs = JSON.parse(localStorage.getItem('rpsApiLogs') || '[]');
    console.table(logs);
    return logs;
  } catch (error) {
    console.error('로그 확인 실패:', error);
    return [];
  }
};

export const getLastRPSApiLog = () => {
  try {
    const logs = JSON.parse(localStorage.getItem('rpsApiLogs') || '[]');
    return logs[logs.length - 1] || null;
  } catch (error) {
    console.error('마지막 로그 확인 실패:', error);
    return null;
  }
};

export const clearRPSApiLogs = () => {
  try {
    localStorage.removeItem('rpsApiLogs');
    // console.log('RPS API 로그가 초기화되었습니다.');
  } catch (error) {
    console.error('로그 초기화 실패:', error);
  }
};

export const exportRPSApiLogs = () => {
  try {
    const logs = JSON.parse(localStorage.getItem('rpsApiLogs') || '[]');
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `rps-api-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    // console.log('RPS API 로그가 다운로드되었습니다.');
  } catch (error) {
    console.error('로그 다운로드 실패:', error);
  }
};