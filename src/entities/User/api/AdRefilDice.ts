import api from '@/shared/api/axiosInstance';

// 주사위 리필 광고 보상 응답 인터페이스
export interface DiceRefillAdRewardResponse {
  nowDice: {
    dice: number;
  };
  rank: {
    diceRefilledAt: string;
  };
}

/**
 * 주사위 리필 광고 보상 API
 * 광고 시청 후 주사위를 무료로 리필할 수 있는 API
 * 
 * @returns Promise<DiceRefillAdRewardResponse> 주사위 리필 결과
 * @throws Error API 호출 실패 시 에러 메시지
 */
export const getDiceRefillAdReward = async (): Promise<DiceRefillAdRewardResponse> => {
  try {
    // API 문서에 따른 정확한 경로 사용
    const response = await api.get('/home/refill-dice/ad');
    
    console.log('주사위 리필 광고 보상 API 응답:', response.data);
    
    // 응답 데이터 구조 확인
    const responseData = response.data;
    
    // API 문서에 따른 응답 구조 검증
    if (!responseData.nowDice || !responseData.rank) {
      throw new Error('응답 데이터 구조가 올바르지 않습니다.');
    }
    
    const { nowDice, rank } = responseData;
    
    // 필수 필드 검증
    if (typeof nowDice.dice !== 'number') {
      throw new Error('유효하지 않은 주사위 데이터입니다.');
    }
    
    if (!rank.diceRefilledAt || typeof rank.diceRefilledAt !== 'string') {
      throw new Error('유효하지 않은 리필 시간 데이터입니다.');
    }
    
    // 검증된 데이터 반환
    return {
      nowDice: {
        dice: nowDice.dice
      },
      rank: {
        diceRefilledAt: rank.diceRefilledAt
      }
    };
    
  } catch (error: any) {
    console.error('주사위 리필 광고 보상 API 오류:', error);
    
    // API 에러 처리
    if (error.response) {
      // 서버 응답이 있는 경우
      const status = error.response.status;
      const message = error.response.data?.message || '주사위 리필에 실패했습니다.';
      
      switch (status) {
        case 400:
          throw new Error('잘못된 요청입니다. 요청 데이터를 확인해주세요.');
        case 401:
          throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
        case 403:
          throw new Error('권한이 없습니다. 광고 시청 후 사용 가능합니다.');
        case 404:
          throw new Error('주사위 리필 기능을 찾을 수 없습니다.');
        case 409:
          throw new Error('이미 최근에 주사위를 리필했습니다. 잠시 후 다시 시도해주세요.');
        case 429:
          throw new Error('너무 많은 요청입니다. 잠시 후 다시 시도해주세요.');
        case 500:
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        case 503:
          throw new Error('서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.');
        default:
          throw new Error(`주사위 리필 실패: ${message}`);
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      throw new Error('서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.');
    } else {
      // 기타 에러 (네트워크 오류, 타임아웃 등)
      if (error.code === 'ECONNABORTED') {
        throw new Error('요청 시간이 초과되었습니다. 다시 시도해주세요.');
      } else if (error.name === 'NetworkError') {
        throw new Error('네트워크 오류가 발생했습니다. 연결을 확인해주세요.');
      } else {
        throw new Error(error.message || '알 수 없는 오류가 발생했습니다.');
      }
    }
  }
};

export default getDiceRefillAdReward;