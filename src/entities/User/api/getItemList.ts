import api from '@/shared/api/axiosInstance';

// 인벤토리 아이템 타입 정의
export interface InventoryItem {
  ownedEquipmentId: number;
  type: string; // HEAD/EYE/EAR/NECK/BACK
  rarity: number; // 0~9 등급
}

// 장착된 아이템 슬롯 타입 정의
export interface EquippedSlotItem extends InventoryItem {
  slotId: number; // 슬롯 ID
}

export interface InventoryResponse {
  slot: EquippedSlotItem[]; // 장착된 아이템들 (slotId 포함)
  myItems: InventoryItem[]; // 보유 아이템들
}

// 인벤토리 조회 API 함수
export const getItemList = async (): Promise<InventoryResponse> => {
  const response = await api.get('/equipment');

  if (response.data.code === 'OK') {
    return response.data.data;
  } else {
    throw new Error(response.data.message || '인벤토리 조회에 실패했습니다.');
  }
};

export default getItemList;
