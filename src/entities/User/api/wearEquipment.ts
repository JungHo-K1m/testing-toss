import api from '@/shared/api/axiosInstance';

// 아이템 장착 요청 타입 정의
export interface WearEquipmentRequest {
  ownedEquipmentId: number; // 장착할 아이템 ownedEquipmentId
}

// 아이템 장착 응답 타입 정의 (getItemList.ts와 동일한 구조)
export interface InventoryItem {
  ownedEquipmentId: number;
  type: string; // HEAD/EYE/EAR/NECK/BACK
  rarity: number; // 0~9 등급
}

export interface EquippedSlotItem extends InventoryItem {
  slotId: number; // 슬롯 ID
}

export interface WearEquipmentResponse {
  slot: EquippedSlotItem[]; // 장착된 아이템들 (slotId 포함)
  myItems: InventoryItem[]; // 보유 아이템들
}

// 아이템 장착 API 함수
export const wearEquipment = async (request: WearEquipmentRequest): Promise<WearEquipmentResponse> => {
  const response = await api.post('/wear/equipment', request);

  if (response.data.code === 'OK') {
    // API 응답 구조에 맞게 데이터 반환
    return response.data.data;
  } else {
    throw new Error(response.data.message || '아이템 장착에 실패했습니다.');
  }
};

export default wearEquipment;
