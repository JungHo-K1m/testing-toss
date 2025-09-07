import api from '@/shared/api/axiosInstance';

// 랜덤박스 결과 타입 정의 - 실제 API 응답 구조에 맞게 수정
export interface RandomBoxResult {
  type: 'EQUIPMENT' | 'DICE' | 'SL' | 'NONE';  // result → type으로 변경
  equipment?: {
    ownedEquipmentId: number;
    type: string; // HEAD/EYE/EAR/NECK/BACK
    rarity: number; // 0~9 등급
  };
  keyCount?: number; // 랜덤박스 오픈픈 후 남은 열쇠 개수 (선택적 필드)
  diceCount?: number; // 랜덤박스 오픈픈 후 남은 주사위 개수 (선택적 필드)
}

// 랜덤박스 오픈 API 함수
export const purchaseRandomBox = async (): Promise<RandomBoxResult> => {
  const response = await api.get('/randombox');

  if (response.data.code === 'OK') {
    // API 응답 구조에 맞게 수정 - data.data에서 가져오기
    return {
      type: response.data.data.type,  // data.data.type에서 가져오기
      equipment: response.data.data.equipment,  // data.data.equipment에서 가져오기
      keyCount: response.data.data.keyCount,  // data.data.keyCount에서 가져오기
      diceCount: response.data.data.diceCount  // data.data.diceCount에서 가져오기
    };
  } else {
    throw new Error(response.data.message || '랜덤박스 오픈에 실패했습니다.');
  }
};

export default purchaseRandomBox;
