import api from '@/shared/api/axiosInstance';

// 광고 시청 후 랜덤박스 보상 API
export interface RandomBoxAdRewardResponse {
  type: 'EQUIPMENT' | 'DICE' | 'SL' | 'NONE';  // result → type으로 변경
  equipment?: {
    ownedEquipmentId: number;
    type: 'HEAD' | 'EYE' | 'EAR' | 'NECK' | 'BACK';
    rarity: number; // 0~9
  };
}

/**
 * 광고 시청 후 랜덤박스 보상받기 API
 * @returns Promise<RandomBoxAdRewardResponse>
 */
export const getRandomBoxAdReward = async (): Promise<RandomBoxAdRewardResponse> => {
  const response = await api.get('/randombox/ad');

  if (response.data.code === 'OK') {
    // API 응답 구조에 맞게 데이터 반환
    return response.data.data;
  } else {
    throw new Error(response.data.message || '광고 보상 받기에 실패했습니다.');
  }
};

export default getRandomBoxAdReward;