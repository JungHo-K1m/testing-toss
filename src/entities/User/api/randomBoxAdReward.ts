// 광고 시청 후 랜덤박스 보상 API
export interface RandomBoxAdRewardResponse {
    randomBox: {
      result: 'EQUIPMENT' | 'DICE' | 'SL' | 'NONE';
      equipment?: {
        ownedEquipmentId: number;
        type: 'HEAD' | 'EYE' | 'EAR' | 'NECK' | 'BACK';
        rarity: number; // 0~9
      };
    };
  }
  
  /**
   * 광고 시청 후 랜덤박스 보상받기 API
   * @returns Promise<RandomBoxAdRewardResponse>
   */
  export const getRandomBoxAdReward = async (): Promise<RandomBoxAdRewardResponse> => {
    const response = await fetch('/randombox/ad', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    if (!response.ok) {
      throw new Error(`광고 보상 API 호출 실패: ${response.status}`);
    }
  
    return response.json();
  };