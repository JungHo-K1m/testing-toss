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
  console.log('📡 getRandomBoxAdReward API 호출 시작');
  
  try {
    const response = await api.get('/randombox/ad');
    console.log('📡 API 응답 받음:', response.data);

    if (response.data.code === 'OK') {
      console.log('✅ API 성공 - 반환할 데이터:', response.data.data);
      // API 응답 구조에 맞게 데이터 반환
      return response.data.data;
    } else {
      console.error('❌ API 실패:', response.data.message);
      throw new Error(response.data.message || '광고 보상 받기에 실패했습니다.');
    }
  } catch (error) {
    console.error('❌ API 호출 중 오류:', error);
    throw error;
  }
};

export default getRandomBoxAdReward;