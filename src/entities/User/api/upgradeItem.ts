import api from '@/shared/api/axiosInstance';

// 아이템 강화 요청 타입 정의
export interface UpgradeEquipmentRequest {
  upgradeEquipmentId: number; // 강화할 아이템 ownedEquipmentId
  materialEquipmentId: number; // 재료 아이템 ownedEquipmentId
}

// 강화된 아이템 응답 타입 정의
export interface UpgradeEquipment {
  ownedEquipmentId: number;
  type: string; // HEAD/EYE/EAR/NECK/BACK
  rarity: number; // 0~9 등급
}

// 아이템 강화 응답 타입 정의
export interface UpgradeEquipmentResponse {
  success: boolean;
  upgradeEquipment: UpgradeEquipment; // 강화된 아이템 정보
  inventory: {
    slot: Array<{
      slotId: number;
      ownedEquipmentId: number;
      type: string;
      rarity: number;
    }>;
    myItems: Array<{
      ownedEquipmentId: number;
      type: string;
      rarity: number;
    }>;
  };
}

// 아이템 강화 API 함수
export const upgradeEquipment = async (request: UpgradeEquipmentRequest): Promise<UpgradeEquipmentResponse> => {
  const response = await api.post('/upgrade/equipment', request);

  if (response.data.code === 'OK') {
    // API 응답 구조에 맞게 데이터 반환
    return response.data.data;
  } else {
    throw new Error(response.data.message || '아이템 강화에 실패했습니다.');
  }
};

export default upgradeEquipment;
