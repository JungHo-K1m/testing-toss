import React, { useState, useEffect } from "react";
import {
  TopTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui";
import { useNavigate, useLocation } from "react-router-dom";
import Images from "@/shared/assets/images";
import {
  getItemList,
  InventoryItem,
  EquippedSlotItem,
  InventoryResponse,
} from "@/entities/User/api/getItemList";
import { wearEquipment } from "@/entities/User/api/wearEquipment";
import { removeEquipment } from "@/entities/User/api/removeEquipment";
import { upgradeEquipment } from "@/entities/User/api/upgradeItem";
import BottomNavigation from "@/widgets/BottomNav/BottomNav";
import { HiX } from "react-icons/hi";
import { DialogClose } from "@radix-ui/react-dialog";
import { useUserStore } from "@/entities/User/model/userModel";

// 등급별 색상 매핑 함수
const getRarityImageIndex = (rarity: number): number => {
  if (rarity <= 1) return 1; // 보라색
  if (rarity <= 3) return 2; // 하늘색
  if (rarity <= 5) return 3; // 초록색
  if (rarity <= 7) return 4; // 노란색
  return 5; // 빨간색
};

// 장비 타입별 이미지 가져오기 함수
const getEquipmentIcon = (type: string, rarity: number) => {
  const imageIndex = getRarityImageIndex(rarity);

  let result;
  switch (type.toUpperCase()) {
    case "HEAD":
      result = Images[`Crown${imageIndex}` as keyof typeof Images];
      break;
    case "EAR":
      result = Images[`Hairpin${imageIndex}` as keyof typeof Images];
      break;
    case "EYE":
      result = Images[`Sunglass${imageIndex}` as keyof typeof Images];
      break;
    case "NECK":
      result = Images[`Muffler${imageIndex}` as keyof typeof Images];
      break;
    case "BACK":
      result = Images[`Ballon${imageIndex}` as keyof typeof Images];
      break;
    default:
      result = Images.Ballon1; // 기본값
  }

  return result;
};

// 아이템 상세 모달 컴포넌트
interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    icon: string;
    alt: string;
    name: string;
    level: number;
    isEquipped: boolean;
    type?: string;
    ownedEquipmentId?: number; // 장착/해제를 위한 ID 추가
    slotId?: number; // 장착된 아이템의 슬롯 ID 추가
  };
  inventoryData: any; // 강화 기능을 위한 인벤토리 데이터
  onEquipmentChange: (newInventoryData: any) => void; // 인벤토리 데이터 업데이트 콜백
}

function ItemModal({
  isOpen,
  onClose,
  item,
  inventoryData,
  onEquipmentChange,
}: ItemModalProps) {
  // 강화 결과 모달 상태
  const [showUpgradeResult, setShowUpgradeResult] = useState(false);
  const [upgradeResult, setUpgradeResult] = useState<{
    success: boolean;
    message: string;
    newLevel?: number;
  } | null>(null);

  // 강화 가능한 재료 아이템 찾기
  const findUpgradeMaterial = (
    currentItem: typeof item,
    inventoryData: any
  ) => {
    if (!inventoryData?.myItems) return null;

    // 동일한 부위, 동일한 등급의 아이템 중에서
    // ownedEquipmentId가 작은 순서로 정렬하여 첫 번째 아이템 선택
    const candidates = inventoryData.myItems
      .filter(
        (invItem: any) =>
          invItem.type === currentItem.type &&
          invItem.rarity === currentItem.level &&
          invItem.ownedEquipmentId !== currentItem.ownedEquipmentId // 자기 자신 제외
      )
      .sort((a: any, b: any) => a.ownedEquipmentId - b.ownedEquipmentId);

    return candidates.length > 0 ? candidates[0] : null;
  };

  // 강화 가능 여부 확인 (동일한 아이템의 동일한 등급을 보유한 경우에만)
  const canUpgrade = (currentItem: typeof item, inventoryData: any) => {
    if (!currentItem.ownedEquipmentId) return false;

    const material = findUpgradeMaterial(currentItem, inventoryData);
    return material !== null;
  };
  // 아이템 타입별 강화 효과 정의
  const getEnhancementEffects = (type: string) => {
    switch (type?.toUpperCase()) {
      case "HEAD": // 크라운 - 주사위 재충전 대기시간 감소
        return [
          { level: 1, effect: "-3.2%" },
          { level: 2, effect: "-3.9%" },
          { level: 3, effect: "-4.9%" },
          { level: 4, effect: "-6.5%" },
          { level: 5, effect: "-9.4%" },
          { level: 6, effect: "-14.6%" },
          { level: 7, effect: "-24.4%" },
          { level: 8, effect: "-44.4%" },
          { level: 9, effect: "-95%" },
        ];
      case "EYE": // 선글라스 - 미니게임 스타포인트 배수
        return [
          { level: 1, effect: "×1.01" },
          { level: 2, effect: "×1.02" },
          { level: 3, effect: "×1.11" },
          { level: 4, effect: "×1.35" },
          { level: 5, effect: "×1.86" },
          { level: 6, effect: "×2.78" },
          { level: 7, effect: "×4.29" },
          { level: 8, effect: "×6.62" },
          { level: 9, effect: "×10" },
        ];
      case "EAR": // 머리핀 - 럭키다이스 성공 확률
        return [
          { level: 1, effect: "32.4%" },
          { level: 2, effect: "32.9%" },
          { level: 3, effect: "33.6%" },
          { level: 4, effect: "34.8%" },
          { level: 5, effect: "36.9%" },
          { level: 6, effect: "40.8%" },
          { level: 7, effect: "48%" },
          { level: 8, effect: "62.7%" },
          { level: 9, effect: "100%" },
        ];
      case "NECK": // 목도리 - 주사위 스타포인트 배수
        return [
          { level: 1, effect: "×2.7" },
          { level: 2, effect: "×3.1" },
          { level: 3, effect: "×3.6" },
          { level: 4, effect: "×4.4" },
          { level: 5, effect: "×5.9" },
          { level: 6, effect: "×8.6" },
          { level: 7, effect: "×13.6" },
          { level: 8, effect: "×24" },
          { level: 9, effect: "×50" },
        ];
      case "BACK": // 풍선 - 스핀 보상배수
        return [
          { level: 1, effect: "×1.33" },
          { level: 2, effect: "×1.52" },
          { level: 3, effect: "×1.77" },
          { level: 4, effect: "×2.17" },
          { level: 5, effect: "×2.91" },
          { level: 6, effect: "×4.27" },
          { level: 7, effect: "×6.78" },
          { level: 8, effect: "×11.94" },
          { level: 9, effect: "×25" },
        ];
      default:
        return [
          { level: 1, effect: "+10%" },
          { level: 2, effect: "+10%" },
          { level: 3, effect: "+20%" },
          { level: 4, effect: "+20%" },
          { level: 5, effect: "+30%" },
          { level: 6, effect: "+30%" },
          { level: 7, effect: "+40%" },
          { level: 8, effect: "+40%" },
          { level: 9, effect: "+50%" },
        ];
    }
  };

  const enhancementEffects = getEnhancementEffects(item.type || "");

  // 아이템 타입별 효과 설명 생성
  const getEffectDescription = (
    type: string,
    level: number,
    effect: string
  ) => {
    switch (type?.toUpperCase()) {
      case "HEAD":
        return `주사위 재충전 대기시간 ${effect}`;
      case "EYE":
        return `미니게임 스타포인트 ${effect}`;
      case "EAR":
        return `럭키다이스 성공 확률 ${effect}`;
      case "NECK":
        return `주사위 스타포인트 배수 ${effect}`;
      case "BACK":
        return `스핀 보상배수(토스포인트 제외) ${effect}`;
      default:
        return `찬스 게임 성공 확률 ${effect}`;
    }
  };

  const getLevelColor = (level: number) => {
    if (level <= 1) return "bg-purple-500";
    if (level <= 3) return "bg-blue-400";
    if (level <= 5) return "bg-green-500";
    if (level <= 7) return "bg-yellow-500";
    return "bg-orange-500";
  };

  // 강화도에 따른 배경 색상과 테두리 색상 결정 (ItemSlot과 동일)
  const getEnhancementStyle = (level: number) => {
    if (level <= 1) {
      return {
        background: "linear-gradient(180deg, #C655FD 0%, #EECAFF 100%)",
        border: "2px solid #EECAFF",
        numberBackground: "#C655FD",
        numberBorder: "1px solid #EECAFF",
      };
    } else if (level <= 3) {
      return {
        background: "linear-gradient(180deg, #1FC9FE 0%, #87E2FF 100%)",
        border: "2px solid #87E2FF",
        numberBackground: "#1FC9FE",
        numberBorder: "1px solid #87E2FF",
      };
    } else if (level <= 5) {
      return {
        background: "linear-gradient(180deg, #73DF28 0%, #ABEE7D 100%)",
        border: "2px solid #ABEE7D",
        numberBackground: "#73DF28",
        numberBorder: "1px solid #ABEE7D",
      };
    } else if (level <= 7) {
      return {
        background: "linear-gradient(180deg, #FDE328 0%, #FFF3A1 100%)",
        border: "2px solid #FFF3A1",
        numberBackground: "#FDE328",
        numberBorder: "1px solid #FFF3A1",
      };
    } else {
      return {
        background: "linear-gradient(180deg, #FE5A1F 0%, #FFAC8E 100%)",
        border: "2px solid #FFAC8E",
        numberBackground: "#FE5A1F",
        numberBorder: "1px solid #FFAC8E",
      };
    }
  };

  // fetchEquippedItems 함수는 useUserStore에서 가져와야 하지만
  // 현재 구현되지 않은 상태이므로 주석 처리
  // const { fetchEquippedItems } = useUserStore();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="border-none rounded-3xl text-white h-svh overflow-x-hidden font-semibold overflow-y-auto max-w-[90%] md:max-w-lg max-h-[80%]"
        style={{
          background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <DialogTitle className="sr-only">아이템 상세 정보</DialogTitle>
        <div className="relative">
          <DialogClose className="absolute top-0 right-0 p-2">
            <HiX className="w-5 h-5" onClick={onClose} />
          </DialogClose>
        </div>

        <div className="flex flex-col items-center justify-around">
          <div className="flex flex-col items-center gap-2 mb-[30px]">
            <h1
              className="text-center"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "30px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "2px #000000",
              }}
            >
              {item.name}
            </h1>
            <div className="relative inline-block">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                style={{
                  background: getEnhancementStyle(item.level).background,
                  border: getEnhancementStyle(item.level).border,
                  boxShadow:
                    "0px 2px 2px 0px rgba(0, 0, 0, 0.35), inset 0px 0px 2px 2px rgba(255, 255, 255, 0.2)",
                }}
              >
                <img src={item.icon} alt={item.alt} className="w-16 h-16" />
              </div>
              <div
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  background: getEnhancementStyle(item.level).numberBackground,
                  border: getEnhancementStyle(item.level).numberBorder,
                }}
              >
                <span className="text-white text-xs font-bold">
                  {item.level}
                </span>
              </div>
            </div>
          </div>

          {/* 강화 효과 목록 */}
          <div
            className="space-y-3 mb-6 w-full"
            style={{
              background: "rgba(194, 213, 232, 0.1)",
              border: "2px solid #B4CADA",
              borderRadius: "20px",
              padding: "16px",
              boxShadow: "0px 4px 8px 0px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(15px)",
              WebkitBackdropFilter: "blur(15px)",
            }}
          >
            {enhancementEffects.map((enhancement) => (
              <div
                key={enhancement.level}
                className="flex items-center space-x-3"
              >
                <div
                  className={`w-8 h-8 rounded-full ${getLevelColor(
                    enhancement.level
                  )} flex items-center justify-center`}
                >
                  <span className="text-white text-sm font-bold">
                    {enhancement.level}
                  </span>
                </div>
                <div className="w-6 h-6">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 text-amber-600"
                  >
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
                  </svg>
                </div>
                <span className="text-white font-bold text-sm">
                  {getEffectDescription(
                    item.type || "",
                    enhancement.level,
                    enhancement.effect
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* 액션 버튼 */}
          <div className="flex space-x-3 w-full justify-center">
            <button
              className={`w-[150px] h-14 py-3 rounded-[10px] relative`}
              style={{
                background: item.isEquipped
                  ? "linear-gradient(180deg, #FF6D70 0%, #FF6D70 50%, #FF2F32 50%, #FF2F32 100%)"
                  : "linear-gradient(180deg, #50B0FF 0%, #50B0FF 50%, #008DFF 50%, #008DFF 100%)",
                border: item.isEquipped
                  ? "2px solid #FF8E8E"
                  : "2px solid #76C1FF",
                outline: "2px solid #000000",
                boxShadow:
                  "0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 3px 0px 0px rgba(0, 0, 0, 0.1)",
                color: "#FFFFFF",
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "18px",
                fontWeight: "400",
                WebkitTextStroke: "1px #000000",
                opacity: 1,
              }}
              onClick={async () => {
                try {
                  // console.log("=== 장착/해제 버튼 클릭 시작 ===");
                  // console.log("아이템 정보:", {
                    ownedEquipmentId: item.ownedEquipmentId,
                    type: item.type,
                    isEquipped: item.isEquipped,
                    name: item.name,
                    level: item.level,
                  });

                  if (!item.ownedEquipmentId) {
                    console.error("❌ ownedEquipmentId가 없습니다:", item);
                    return;
                  }

                  let newInventoryData;

                  if (item.isEquipped) {
                    // 장착된 아이템 해제
                    // console.log("🔍 장착된 아이템 해제 시도:", {
                      item: item,
                      hasSlotId: !!item.slotId,
                      slotId: item.slotId,
                    });

                    if (!item.slotId) {
                      console.error("❌ slotId가 없습니다:", item);
                      return;
                    }

                    // console.log("🚀 removeEquipment API 호출 시작...");
                    // console.log("API 요청 데이터:", {
                      slotId: item.slotId,
                    });

                    newInventoryData = await removeEquipment({
                      slotId: item.slotId,
                    });
                  } else {
                    // 아이템 장착
                    // console.log("🚀 wearEquipment API 호출 시작...");
                    // console.log("API 요청 데이터:", {
                      ownedEquipmentId: item.ownedEquipmentId,
                    });

                    newInventoryData = await wearEquipment({
                      ownedEquipmentId: item.ownedEquipmentId,
                    });
                  }

                  // console.log("✅ API 응답 성공:", newInventoryData);
                  // console.log("응답 데이터 구조:", {
                    hasSlot: !!newInventoryData.slot,
                    hasMyItems: !!newInventoryData.myItems,
                    slotLength: newInventoryData.slot?.length || 0,
                    myItemsLength: newInventoryData.myItems?.length || 0,
                  });

                  // console.log("🔄 인벤토리 데이터 업데이트 시작...");
                  onEquipmentChange(newInventoryData);
                  // console.log("✅ 인벤토리 데이터 업데이트 완료");

                  // useUserStore의 장착 아이템 상태도 업데이트
                  // console.log("🔄 useUserStore 장착 아이템 상태 업데이트 시작...");
                  // await fetchEquippedItems(); // 현재 구현되지 않은 함수
                  // console.log("✅ useUserStore 장착 아이템 상태 업데이트 완료");

                  // console.log("🚪 모달 닫기 시작...");
                  onClose();
                  // console.log("✅ 모달 닫기 완료");

                  // console.log(`🎉 ${item.isEquipped ? "해제" : "장착"} 완료!`);
                  // console.log("=== 장착/해제 버튼 클릭 완료 ===");
                } catch (error: unknown) {
                  console.error("❌ 장착/해제 실패 - 에러 상세 정보:");
                  console.error("에러 객체:", error);
                  console.error(
                    "에러 메시지:",
                    error instanceof Error ? error.message : "알 수 없는 에러"
                  );
                  console.error(
                    "에러 스택:",
                    error instanceof Error ? error.stack : "스택 정보 없음"
                  );

                  // Axios 에러인지 확인
                  if (
                    error &&
                    typeof error === "object" &&
                    "response" in error
                  ) {
                    const axiosError = error as any;
                    console.error("API 응답 에러:", {
                      status: axiosError.response?.status,
                      statusText: axiosError.response?.statusText,
                      data: axiosError.response?.data,
                    });
                  }

                  // 에러 로깅만 수행 (alert 제거)
                  console.error("장착/해제 실패:", error);
                }
              }}
            >
              <img
                src={
                  item.isEquipped
                    ? Images.ButtonPointRed
                    : Images.ButtonPointBlue
                }
                alt={item.isEquipped ? "button-point-red" : "button-point-blue"}
                style={{
                  position: "absolute",
                  top: "3px",
                  left: "3px",
                  width: "8.47px",
                  height: "6.3px",
                  pointerEvents: "none",
                }}
              />
              {item.isEquipped ? "해제" : "장착"}
            </button>
            <button
              className="w-[150px] h-14 py-3 rounded-[10px] relative"
              disabled={!canUpgrade(item, inventoryData)}
              style={{
                background: canUpgrade(item, inventoryData)
                  ? "linear-gradient(180deg, #50B0FF 0%, #50B0FF 50%, #008DFF 50%, #008DFF 100%)"
                  : "linear-gradient(180deg, #808080 0%, #808080 50%, #606060 50%, #606060 100%)",
                border: canUpgrade(item, inventoryData)
                  ? "2px solid #76C1FF"
                  : "2px solid #A0A0A0",
                outline: "2px solid #000000",
                boxShadow:
                  "0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 3px 0px 0px rgba(0, 0, 0, 0.1)",
                color: "#FFFFFF",
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "18px",
                fontWeight: "400",
                WebkitTextStroke: "1px #000000",
                opacity: canUpgrade(item, inventoryData) ? 1 : 0.6,
                cursor: canUpgrade(item, inventoryData)
                  ? "pointer"
                  : "not-allowed",
              }}
              onClick={async () => {
                try {
                  // console.log("=== 강화 버튼 클릭 시작 ===");

                  if (!item.ownedEquipmentId) {
                    console.error("❌ ownedEquipmentId가 없습니다:", item);
                    return;
                  }

                  // 강화 가능한 재료 아이템 찾기
                  const material = findUpgradeMaterial(item, inventoryData);

                  if (!material) {
                    return;
                  }

                  // console.log("🔍 강화 대상 아이템:", {
                    id: item.ownedEquipmentId,
                    type: item.type,
                    level: item.level,
                    name: item.name,
                  });

                  // console.log("🔍 재료 아이템:", {
                    id: material.ownedEquipmentId,
                    type: material.type,
                    level: material.rarity,
                  });

                  // console.log("🚀 upgradeEquipment API 호출 시작...");
                  // console.log("API 요청 데이터:", {
                    upgradeEquipmentId: item.ownedEquipmentId,
                    materialEquipmentId: material.ownedEquipmentId,
                  });

                  const upgradeResult = await upgradeEquipment({
                    upgradeEquipmentId: item.ownedEquipmentId,
                    materialEquipmentId: material.ownedEquipmentId,
                  });

                  // console.log("✅ 강화 API 응답 성공:", upgradeResult);

                  // 강화 성공/실패와 관계없이 인벤토리 데이터 업데이트
                  // API 문서에 따르면 실패 시에도 inventory 데이터가 포함됨
                  if (upgradeResult.inventory) {
                    // console.log("🔄 인벤토리 데이터 업데이트 시작...");
                    onEquipmentChange(upgradeResult.inventory);
                    // console.log("✅ 인벤토리 데이터 업데이트 완료");
                  }

                  if (upgradeResult.success) {
                    // console.log("🎉 강화 성공!");
                    // console.log(
                      "강화된 아이템:",
                      upgradeResult.upgradeEquipment
                    );

                    // useUserStore의 장착 아이템 상태도 업데이트
                    // console.log("🔄 강화 후 useUserStore 장착 아이템 상태 업데이트 시작...");
                    // await fetchEquippedItems(); // 현재 구현되지 않은 함수
                    // console.log("✅ 강화 후 useUserStore 장착 아이템 상태 업데이트 완료");

                    // 강화 결과 모달 표시
                    setUpgradeResult({
                      success: true,
                      message: `${item.name}이 레벨 ${upgradeResult.upgradeEquipment.rarity}로 강화되었습니다!`,
                      newLevel: upgradeResult.upgradeEquipment.rarity,
                    });
                    setShowUpgradeResult(true);
                  } else {
                    // 강화 실패 결과 모달 표시
                    setUpgradeResult({
                      success: false,
                      message: "강화에 실패했습니다.",
                    });
                    setShowUpgradeResult(true);
                  }

                  // console.log("=== 강화 버튼 클릭 완료 ===");
                } catch (error: unknown) {
                  console.error("❌ 강화 실패 - 에러 상세 정보:");
                  console.error("에러 객체:", error);
                  console.error(
                    "에러 메시지:",
                    error instanceof Error ? error.message : "알 수 없는 에러"
                  );

                  // 에러 결과 모달 표시
                  setUpgradeResult({
                    success: false,
                    message:
                      error instanceof Error
                        ? error.message
                        : "강화에 실패했습니다.",
                  });
                  setShowUpgradeResult(true);
                }
              }}
            >
              <img
                src={
                  canUpgrade(item, inventoryData)
                    ? Images.ButtonPointBlue
                    : Images.ButtonPointRed
                }
                alt={
                  canUpgrade(item, inventoryData)
                    ? "button-point-blue"
                    : "button-point-red"
                }
                style={{
                  position: "absolute",
                  top: "3px",
                  left: "3px",
                  width: "8.47px",
                  height: "6.3px",
                  pointerEvents: "none",
                }}
              />
              {canUpgrade(item, inventoryData) ? "강화" : "강화 불가"}
            </button>
          </div>
        </div>
      </DialogContent>

      {/* 강화 결과 모달 */}
      {showUpgradeResult && upgradeResult && (
        <Dialog
          open={showUpgradeResult}
          onOpenChange={() => setShowUpgradeResult(false)}
        >
          <DialogContent
            className="border-none rounded-3xl text-white max-w-md"
            style={{
              background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <DialogTitle className="sr-only">강화 결과</DialogTitle>
            <div className="relative">
              <DialogClose className="absolute top-2 right-2 p-1">
                <HiX className="w-4 h-4" />
              </DialogClose>
            </div>

            <div className="flex flex-col items-center p-6">
              {/* 결과 아이콘 */}
              <div className="w-16 h-16 mb-4 rounded-full flex items-center justify-center">
                {upgradeResult.success ? (
                  <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* 결과 메시지 */}
              <h2
                className="text-center mb-4"
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "24px",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                {upgradeResult.success ? "강화 성공!" : "강화 실패"}
              </h2>

              <p
                className="text-center mb-6 text-lg"
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  color: "#FFFFFF",
                }}
              >
                {upgradeResult.message}
              </p>

              {/* 확인 버튼 */}
              <button
                className="w-32 h-12 rounded-lg relative"
                style={{
                  background:
                    "linear-gradient(180deg, #50B0FF 0%, #50B0FF 50%, #008DFF 50%, #008DFF 100%)",
                  border: "2px solid #76C1FF",
                  outline: "2px solid #000000",
                  boxShadow:
                    "0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 3px 0px 0px rgba(0, 0, 0, 0.1)",
                  color: "#FFFFFF",
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "16px",
                  fontWeight: "400",
                  WebkitTextStroke: "1px #000000",
                }}
                                 onClick={async () => {
                   setShowUpgradeResult(false);
                   if (upgradeResult.success) {
                     onClose(); // 성공 시 아이템 모달도 닫기
                   } else {
                     // 실패 시 아이템 모달도 닫고 인벤토리 목록 새로 조회
                     onClose();
                     // 인벤토리 데이터 새로 조회 (페이지 리프레시 대신)
                     try {
                       const newInventoryData = await getItemList();
                       onEquipmentChange(newInventoryData);
                     } catch (error) {
                       console.error("인벤토리 새로 조회 실패:", error);
                     }
                   }
                 }}
              >
                <img
                  src={Images.ButtonPointBlue}
                  alt="button-point-blue"
                  style={{
                    position: "absolute",
                    top: "3px",
                    left: "3px",
                    width: "8.47px",
                    height: "6.3px",
                    pointerEvents: "none",
                  }}
                />
                확인
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}

// 아이템 슬롯 컴포넌트: 아이콘과 하단 중앙 마름모 숫자(1) 표시
function ItemSlot({
  icon,
  alt,
  onClick,
  level = 1,
}: {
  icon: string;
  alt: string;
  onClick: () => void;
  level?: number;
}) {
  // 강화도에 따른 배경 색상과 테두리 색상 결정
  const getEnhancementStyle = (level: number) => {
    if (level <= 1) {
      return {
        background: "linear-gradient(180deg, #C655FD 0%, #EECAFF 100%)",
        border: "2px solid #EECAFF",
        numberBackground: "#C655FD",
        numberBorder: "1px solid #EECAFF",
      };
    } else if (level <= 3) {
      return {
        background: "linear-gradient(180deg, #1FC9FE 0%, #87E2FF 100%)",
        border: "2px solid #87E2FF",
        numberBackground: "#1FC9FE",
        numberBorder: "1px solid #87E2FF",
      };
    } else if (level <= 5) {
      return {
        background: "linear-gradient(180deg, #73DF28 0%, #ABEE7D 100%)",
        border: "2px solid #ABEE7D",
        numberBackground: "#73DF28",
        numberBorder: "1px solid #ABEE7D",
      };
    } else if (level <= 7) {
      return {
        background: "linear-gradient(180deg, #FDE328 0%, #FFF3A1 100%)",
        border: "2px solid #FFF3A1",
        numberBackground: "#FDE328",
        numberBorder: "1px solid #FFF3A1",
      };
    } else {
      return {
        background: "linear-gradient(180deg, #FE5A1F 0%, #FFAC8E 100%)",
        border: "2px solid #FFAC8E",
        numberBackground: "#FE5A1F",
        numberBorder: "1px solid #FFAC8E",
      };
    }
  };

  const enhancementStyle = getEnhancementStyle(level);

  return (
    <div className="relative flex flex-col items-center">
      <div
        className="w-[46px] h-[46px] min-[376px]:w-[66px] min-[376px]:h-[66px] rounded-2xl flex items-center justify-center shadow-lg cursor-pointer"
        style={{
          background: enhancementStyle.background,
          border: enhancementStyle.border,
          boxShadow:
            "0px 2px 2px 0px rgba(0, 0, 0, 0.35), inset 0px 0px 2px 2px rgba(255, 255, 255, 0.2)",
        }}
        onClick={onClick}
      >
        <img
          src={icon}
          alt={alt}
          className="w-7 h-7 min-[376px]:w-10 min-[376px]:h-10"
        />
      </div>
      {/* 등급 표시: 원형, 모바일 퍼스트 분기 */}
      <div
        className="absolute left-1/2 translate-x-[-50%] bottom-[-6px] min-[376px]:bottom-[-8px] w-[16px] h-[16px] min-[376px]:w-[20px] min-[376px]:h-[20px] rounded-full flex items-center justify-center"
        style={{
          background: enhancementStyle.numberBackground,
          border: enhancementStyle.numberBorder,
        }}
      >
        <span className="text-[5px] min-[376px]:text-[6px] font-bold text-white">
          {level}
        </span>
      </div>
    </div>
  );
}

// 빈 슬롯 컴포넌트
function EmptySlot({ type }: { type: string }) {
  const getSlotPosition = (type: string) => {
    switch (type) {
      case "HEAD":
        return "top";
      case "BACK":
        return "bottom";
      case "NECK":
        return "right";
      case "EAR":
        return "left";
      case "EYE":
        return "right";
      default:
        return "center";
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      <div
        className="w-[46px] h-[46px] min-[376px]:w-[66px] min-[376px]:h-[66px] rounded-2xl flex items-center justify-center shadow-lg border-2 border-dashed border-gray-400 bg-gray-800/30"
        style={{
          boxShadow:
            "0px 2px 2px 0px rgba(0, 0, 0, 0.35), inset 0px 0px 2px 2px rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="text-gray-400 text-xs text-center">
          <div className="font-bold">{type}</div>
          <div className="text-[8px]">슬롯</div>
        </div>
      </div>
      {/* 빈 슬롯 표시 */}
      <div className="absolute left-1/2 translate-x-[-50%] bottom-[-6px] min-[376px]:bottom-[-8px] w-[16px] h-[16px] min-[376px]:w-[20px] min-[376px]:h-[20px] rounded-full flex items-center justify-center bg-gray-500 border border-gray-400">
        <span className="text-[5px] min-[376px]:text-[6px] font-bold text-white">
          -
        </span>
      </div>
    </div>
  );
}

interface OwnedItemCardProps {
  icon: string;
  alt: string;
  quantity: number;
  gradient: string;
  onClick: () => void;
}

function OwnedItemCard({
  icon,
  alt,
  quantity,
  gradient,
  onClick,
}: OwnedItemCardProps) {
  // 강화도에 따른 배경 색상과 테두리 색상 결정
  const getEnhancementStyle = (level: number) => {
    if (level <= 1) {
      return {
        background: "#C655FD80",
        border: "2px solid #EECAFF",
        numberBackground: "#C655FD",
        numberBorder: "1px solid #EECAFF",
      };
    } else if (level <= 3) {
      return {
        background: "#1FC9FE80",
        border: "2px solid #87E2FF",
        numberBackground: "#1FC9FE80",
        numberBorder: "1px solid #87E2FF",
      };
    } else if (level <= 5) {
      return {
        background: "#73DF2880",
        border: "2px solid #ABEE7D",
        numberBackground: "#73DF2880",
        numberBorder: "1px solid #ABEE7D",
      };
    } else if (level <= 7) {
      return {
        background: "#FDE32880",
        border: "2px solid #FFF3A1",
        numberBackground: "#FDE32880",
        numberBorder: "1px solid #FFF3A1",
      };
    } else {
      return {
        background: "#FE5A1F80",
        border: "2px solid #FFAC8E",
        numberBackground: "#FE5A1F80",
        numberBorder: "1px solid #FFAC8E",
      };
    }
  };

  const enhancementStyle = getEnhancementStyle(quantity);

  return (
    <div
      className="relative rounded-2xl flex items-center justify-center shadow-md w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] cursor-pointer"
      style={{
        background: enhancementStyle.background,
        border: enhancementStyle.border,
        boxShadow:
          "0px 2px 2px 0px rgba(0, 0, 0, 0.35), inset 0px 0px 2px 2px rgba(255, 255, 255, 0.2)",
      }}
      onClick={onClick}
    >
      <img src={icon} alt={alt} className="w-9 h-9 sm:w-10 sm:h-10" />
      <div
        className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-[22px] h-[22px] rounded-full flex items-center justify-center"
        style={{
          background: enhancementStyle.numberBackground,
          border: enhancementStyle.numberBorder,
        }}
      >
        <span className="text-white text-[10px] font-bold">{quantity}</span>
      </div>
    </div>
  );
}

const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // useUserStore에서 pet 데이터 가져오기
  const { pet, characterType, userLv } = useUserStore();

  // 캐릭터 이미지 동적 설정 함수
  const getCharacterImageSrc = () => {
    if (!pet || !pet.type) {
      return Images.CatSmile; // 기본값
    }

    if (pet.type === "CAT") {
      return Images.CatSmile;
    } else if (pet.type === "DOG") {
      return Images.DogSmile;
    }

    return Images.CatSmile; // 기본값
  };

  const charactorImageSrc = getCharacterImageSrc();

  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<{
    icon: string;
    alt: string;
    name: string;
    level: number;
    isEquipped: boolean;
    type: string;
    ownedEquipmentId?: number;
    slotId?: number;
  } | null>(null);

  // 인벤토리 데이터 상태
  const [inventoryData, setInventoryData] = useState<InventoryResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useUserStore에서 필요한 데이터 가져오기
  const { fetchUserData, fetchEquippedItems } = useUserStore();

  // 사용자 데이터 초기 로딩
  useEffect(() => {
    const initializeUserData = async () => {
      try {
        await fetchUserData();
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    initializeUserData();
  }, [fetchUserData]);

  // 인벤토리 데이터 가져오기
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setIsLoading(true);
        const data = await getItemList();
        setInventoryData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
        console.error("Inventory fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // 아이템 클릭 핸들러
  const handleItemClick = (
    item: InventoryItem | EquippedSlotItem,
    isEquipped: boolean = false
  ) => {
    const itemNames: { [key: string]: string } = {
      HEAD: "크라운",
      EAR: "머리핀",
      EYE: "선글라스",
      NECK: "목도리",
      BACK: "풍선",
    };

    setSelectedItem({
      icon: getEquipmentIcon(item.type, item.rarity),
      alt: item.type,
      name: itemNames[item.type] || item.type,
      level: item.rarity,
      isEquipped,
      type: item.type,
      ownedEquipmentId: item.ownedEquipmentId,
      slotId: "slotId" in item ? item.slotId : undefined,
    });
    setIsModalOpen(true);
    // console.log("Modal opened, isModalOpen:", true); // 디버깅용
    // console.log("Selected item data:", {
      type: item.type,
      rarity: item.rarity,
      ownedEquipmentId: item.ownedEquipmentId,
      isEquipped,
      slotId: "slotId" in item ? item.slotId : undefined,
    });
  };

  // 장착된 아이템 클릭 핸들러
  const handleEquippedItemClick = (item: EquippedSlotItem) => {
    // slotId 정보 로깅 (디버깅용)
    // console.log(
      `장착된 아이템 클릭: ${item.type}, 슬롯 ID: ${item.slotId}, 장비 ID: ${item.ownedEquipmentId}`
    );

    // 장착된 아이템의 경우 slotId를 포함하여 모달 열기
    const itemNames: { [key: string]: string } = {
      HEAD: "크라운",
      EAR: "머리핀",
      EYE: "선글라스",
      NECK: "목도리",
      BACK: "풍선",
    };

    setSelectedItem({
      icon: getEquipmentIcon(item.type, item.rarity),
      alt: item.type,
      name: itemNames[item.type] || item.type,
      level: item.rarity,
      isEquipped: true,
      type: item.type,
      ownedEquipmentId: item.ownedEquipmentId,
      slotId: item.slotId, // slotId를 명시적으로 설정
    });
    setIsModalOpen(true);

    // console.log("장착된 아이템 모달 열기:", {
      type: item.type,
      rarity: item.rarity,
      ownedEquipmentId: item.ownedEquipmentId,
      slotId: item.slotId,
      isEquipped: true,
    });
  };

  // 장착된 아이템을 효율적으로 찾는 헬퍼 함수
  const getEquippedItem = (type: string): EquippedSlotItem | undefined => {
    return inventoryData?.slot.find((item) => item.type === type);
  };

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <div className="text-xl">인벤토리 로딩 중...</div>
      </div>
    );
  }

  // 에러 상태 표시
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <div className="text-xl text-red-400">오류: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 rounded-lg"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 기본 슬롯 위치 (HEAD, EYE, EAR, NECK, BACK 순서)
  const slotPositions = [
    { type: "HEAD", position: "top" },
    { type: "EYE", position: "top" },
    { type: "EAR", position: "left" },
    { type: "NECK", position: "right" },
    { type: "BACK", position: "bottom" },
  ];

  return (
    <div className="flex flex-col items-center relative min-h-screen">
      <div
        style={{
          backgroundImage: `url(${Images.BackgroundHome})`,
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          width: "100%",
          height: "55vh",
          minHeight: 200,
        }}
        className="w-full mx-6 flex flex-col pt-2"
      >
        <TopTitle title={"인벤토리"} back={false} />
        {/* 착용 중인 아이템 및 캐릭터 표시 영역 */}
        <div className="flex items-center justify-center flex-1 w-full">
          {/* 좌측 아이템 슬롯 */}
          <div className="flex flex-col gap-[100px] items-center">
            {/* HEAD 슬롯 */}
            {getEquippedItem("HEAD") ? (
              <ItemSlot
                icon={getEquipmentIcon("HEAD", getEquippedItem("HEAD")!.rarity)}
                alt="HEAD"
                level={getEquippedItem("HEAD")!.rarity}
                onClick={() =>
                  handleEquippedItemClick(getEquippedItem("HEAD")!)
                }
              />
            ) : (
              <EmptySlot type="HEAD" />
            )}
            {/* BACK 슬롯 */}
            {getEquippedItem("BACK") ? (
              <ItemSlot
                icon={getEquipmentIcon("BACK", getEquippedItem("BACK")!.rarity)}
                alt="BACK"
                level={getEquippedItem("BACK")!.rarity}
                onClick={() =>
                  handleEquippedItemClick(getEquippedItem("BACK")!)
                }
              />
            ) : (
              <EmptySlot type="BACK" />
            )}
          </div>
          {/* 중앙 캐릭터 */}
          <div className="relative">
            {/* BACK 아이템을 캐릭터 뒤에 표시 */}
            {getEquippedItem("BACK") && (
              <img
                src={getEquipmentIcon("BACK", getEquippedItem("BACK")!.rarity)}
                alt="BACK"
                className="absolute -top-20 left-1/2 transform -translate-x-[60%] w-20 h-20 min-[376px]:w-24 min-[376px]:h-24 opacity-90"
                style={{ zIndex: 5 }}
              />
            )}

            {/* 캐릭터 이미지 */}
            <img
              src={charactorImageSrc}
              alt="character"
              className="relative min-[376px]:w-[200px] min-[376px]:h-[200px] w-[180px] h-[180px] min-[376px]:-translate-y-4 -translate-y-12"
              style={{ zIndex: 10 }}
            />

            {/* 장착된 아이템 오버레이 (캐릭터 앞에 표시) */}
            {getEquippedItem("HEAD") && (
              <img
                src={getEquipmentIcon("HEAD", getEquippedItem("HEAD")!.rarity)}
                alt="HEAD"
                className="absolute -top-7 left-1/2 transform -translate-x-1/2 w-12 h-12 min-[376px]:w-16 min-[376px]:h-16 opacity-90"
                style={{ zIndex: 15 }}
              />
            )}

            {getEquippedItem("EYE") && (
              <img
                src={getEquipmentIcon("EYE", getEquippedItem("EYE")!.rarity)}
                alt="EYE"
                className="absolute top-[18px] left-[33%] transform -translate-x-1/2 w-12 h-12 min-[376px]:w-20 min-[376px]:h-20 opacity-90"
                style={{
                  zIndex: 15,
                  transform: "rotate(-2deg)",
                }}
              />
            )}

            {getEquippedItem("EAR") && (
              <img
                src={getEquipmentIcon("EAR", getEquippedItem("EAR")!.rarity)}
                alt="EAR"
                className="absolute top-1 right-8 w-10 h-10 min-[376px]:w-12 min-[376px]:h-12 opacity-90"
                style={{
                  zIndex: 15,
                  transform: "rotate(45deg)",
                }}
              />
            )}

            {getEquippedItem("NECK") && (
              <img
                src={getEquipmentIcon("NECK", getEquippedItem("NECK")!.rarity)}
                alt="NECK"
                className="absolute top-[88px] left-[51%] transform -translate-x-1/2 w-14 h-14 min-[376px]:w-16 min-[376px]:h-16 opacity-90"
                style={{ zIndex: 15 }}
              />
            )}
          </div>
          {/* 우측 아이템 슬롯 */}
          <div className="flex flex-col gap-[20px] items-center">
            {/* NECK 슬롯 */}
            {getEquippedItem("NECK") ? (
              <ItemSlot
                icon={getEquipmentIcon("NECK", getEquippedItem("NECK")!.rarity)}
                alt="NECK"
                level={getEquippedItem("NECK")!.rarity}
                onClick={() =>
                  handleEquippedItemClick(getEquippedItem("NECK")!)
                }
              />
            ) : (
              <EmptySlot type="NECK" />
            )}
            {/* EAR 슬롯 */}
            {getEquippedItem("EAR") ? (
              <ItemSlot
                icon={getEquipmentIcon("EAR", getEquippedItem("EAR")!.rarity)}
                alt="EAR"
                level={getEquippedItem("EAR")!.rarity}
                onClick={() => handleEquippedItemClick(getEquippedItem("EAR")!)}
              />
            ) : (
              <EmptySlot type="EAR" />
            )}
            {/* EYE 슬롯 */}
            {getEquippedItem("EYE") ? (
              <ItemSlot
                icon={getEquipmentIcon("EYE", getEquippedItem("EYE")!.rarity)}
                alt="EYE"
                level={getEquippedItem("EYE")!.rarity}
                onClick={() => handleEquippedItemClick(getEquippedItem("EYE")!)}
              />
            ) : (
              <EmptySlot type="EYE" />
            )}
          </div>
        </div>
      </div>

      {/* 보유 중인 아이템 목록 영역 */}
      <div
        className="w-full h-[45vh] mx-6 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
        }}
      >
        <div className="h-full w-full overflow-y-auto p-4 pb-28">
          <div
            className="text-center mb-3"
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: "24px",
              fontWeight: 400,
              color: "#FFFFFF",
              WebkitTextStroke: "1px #000000",
            }}
          >
            내 아이템
          </div>

          <div className="grid grid-cols-4 gap-3 gap-y-4 justify-items-center">
            {inventoryData?.myItems && inventoryData.myItems.length > 0 ? (
              inventoryData.myItems.map((item, index) => (
                <OwnedItemCard
                  key={`${item.type}-${item.ownedEquipmentId}-${index}`}
                  icon={getEquipmentIcon(item.type, item.rarity)}
                  alt={item.type}
                  quantity={item.rarity}
                  gradient=""
                  onClick={() => handleItemClick(item, false)}
                />
              ))
            ) : (
              // 보유 아이템이 없을 때의 빈 상태
              <div className="col-span-4 flex flex-col items-center justify-center py-12 text-gray-400">
                <div className="w-24 h-24 mb-4 rounded-full bg-gray-700/50 flex items-center justify-center border-2 border-dashed border-gray-500">
                  <svg
                    className="w-12 h-12 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold mb-2">
                    보유한 아이템이 없습니다
                  </div>
                  <div className="text-sm text-gray-500">
                    게임을 플레이하여 아이템을 획득해보세요!
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 아이템 상세 모달 */}
      {selectedItem && (
        <ItemModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          inventoryData={inventoryData}
          onEquipmentChange={(newInventoryData) => {
            // console.log("🔄 인벤토리 데이터 업데이트:", newInventoryData);

            // API 응답 데이터 구조 확인 및 검증
            if (
              newInventoryData &&
              Array.isArray(newInventoryData.slot) &&
              Array.isArray(newInventoryData.myItems)
            ) {
              // console.log("✅ 유효한 응답 데이터:", {
                slotCount: newInventoryData.slot.length,
                myItemsCount: newInventoryData.myItems.length,
              });

              setInventoryData(newInventoryData);
            } else {
              console.error("❌ 잘못된 응답 데이터 구조:", newInventoryData);
              // 기존 데이터 유지
            }
          }}
        />
      )}

      {/* 하단 네비게이션 */}
      <BottomNavigation hidden={isModalOpen} />
    </div>
  );
};

export default Inventory;
