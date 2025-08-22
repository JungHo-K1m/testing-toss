import api from '@/shared/api/axiosInstance';

// 아이템 해제 요청 타입 정의
export interface RemoveEquipmentRequest {
  slotId: number; // 해제할 슬롯 slotId
}

// 아이템 해제 응답 타입 정의 (getItemList.ts와 동일한 구조)
export interface InventoryItem {
  ownedEquipmentId: number;
  type: string; // HEAD/EYE/EAR/NECK/BACK
  rarity: number; // 0~9 등급
}

export interface EquippedSlotItem extends InventoryItem {
  slotId: number; // 슬롯 ID
}

export interface RemoveEquipmentResponse {
  slot: EquippedSlotItem[]; // 장착된 아이템들 (slotId 포함)
  myItems: InventoryItem[]; // 보유 아이템들
}

// 아이템 해제 API 함수
export const removeEquipment = async (request: RemoveEquipmentRequest): Promise<RemoveEquipmentResponse> => {
  const response = await api.post('/remove/equipment', request);

  if (response.data.code === 'OK') {
    // API 응답 구조에 맞게 데이터 반환
    return response.data.data;
  } else {
    throw new Error(response.data.message || '아이템 해제에 실패했습니다.');
  }
};

export default removeEquipment;
