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
 * 광고 시청 후 주사위 리필 API
 * 
 * @returns Promise<DiceRefillAdRewardResponse> - 주사위 리필 결과
 * @throws Error - API 호출 실패 시
 * 
 * @example
 * ```typescript
 * try {
 *   const result = await getDiceRefillAdReward();
 *   console.log('주사위 개수:', result.nowDice.dice);
 *   console.log('리필 시간:', result.rank.diceRefilledAt);
 * } catch (error) {
 *   console.error('주사위 리필 실패:', error);
 * }
 * ```
 */
export const getDiceRefillAdReward = async (): Promise<DiceRefillAdRewardResponse> => {
    try {
      const response = await api.get('/api/home/refill-dice/ad');
      
      // 실제 응답 구조에 맞게 수정
      const { data } = response.data; // data 객체 추출
      
      if (!data) {
        throw new Error('응답 데이터가 없습니다.');
      }
      
      const { nowDice, rank } = data; // data 내부에서 추출
      
      // 필수 필드 검증
      if (!nowDice || typeof nowDice.dice !== 'number') {
        throw new Error('유효하지 않은 주사위 데이터입니다.');
      }
      
      if (!rank || !rank.diceRefilledAt) {
        throw new Error('유효하지 않은 랭크 데이터입니다.');
      }
      
      return {
        nowDice: {
          dice: nowDice.dice
        },
        rank: {
          diceRefilledAt: rank.diceRefilledAt
        }
      };
    
  } catch (error: any) {
    // API 에러 처리
    if (error.response) {
      // 서버 응답이 있는 경우
      const status = error.response.status;
      const message = error.response.data?.message || '주사위 리필에 실패했습니다.';
      
      switch (status) {
        case 401:
          throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
        case 403:
          throw new Error('권한이 없습니다.');
        case 404:
          throw new Error('주사위 리필 기능을 찾을 수 없습니다.');
        case 429:
          throw new Error('너무 많은 요청입니다. 잠시 후 다시 시도해주세요.');
        case 500:
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        default:
          throw new Error(`주사위 리필 실패: ${message}`);
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      throw new Error('서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.');
    } else {
      // 기타 에러
      throw new Error(error.message || '알 수 없는 오류가 발생했습니다.');
    }
  }
};

export default getDiceRefillAdReward;