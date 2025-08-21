import React, { useState, useEffect } from "react";
import { TopTitle } from "@/shared/components/ui";
import { useNavigate, useLocation } from "react-router-dom";
import Images from "@/shared/assets/images";
import { getItemList, InventoryItem, EquippedSlotItem, InventoryResponse } from "@/entities/User/api/getItemList";

// 등급별 색상 매핑 함수
const getRarityImageIndex = (rarity: number): number => {
  if (rarity <= 1) return 1;      // 보라색
  if (rarity <= 3) return 2;      // 하늘색
  if (rarity <= 5) return 3;      // 초록색
  if (rarity <= 7) return 4;      // 노란색
  return 5;                        // 빨간색
};

// 장비 타입별 이미지 가져오기 함수
const getEquipmentIcon = (type: string, rarity: number) => {
  const imageIndex = getRarityImageIndex(rarity);
  
  let result;
  switch (type.toUpperCase()) {
    case 'HEAD': 
      result = Images[`Crown${imageIndex}` as keyof typeof Images];
      break;
    case 'EAR': 
      result = Images[`Hairpin${imageIndex}` as keyof typeof Images];
      break;
    case 'EYE': 
      result = Images[`Sunglass${imageIndex}` as keyof typeof Images];
      break;
    case 'NECK': 
      result = Images[`Muffler${imageIndex}` as keyof typeof Images];
      break;
    case 'BACK': 
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
  };
}

function ItemModal({ isOpen, onClose, item }: ItemModalProps) {
  if (!isOpen) return null;

  const enhancementEffects = [
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

  const getLevelColor = (level: number) => {
    if (level <= 2) return "bg-purple-500";
    if (level <= 4) return "bg-blue-400";
    if (level <= 6) return "bg-green-500";
    if (level <= 8) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <>
      {/* 배경 블러 오버레이 */}
      <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md z-[9999]" />

      {/* 모달 컨테이너 */}
      <div className="fixed inset-0 flex items-center justify-center z-[10000] p-4">
        <div
          className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl"
          style={{
            background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
            boxShadow:
              "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
          }}
        >
          <div className="p-6">
            {/* 헤더 */}
            <div className="text-center mb-6">
              <h2
                className="mb-3"
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "24px",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                {item.name}
              </h2>
              <div className="relative inline-block">
                <img
                  src={item.icon}
                  alt={item.alt}
                  className="w-20 h-20 rounded-2xl"
                />
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-orange-500 w-6 h-6 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {item.level}
                  </span>
                </div>
              </div>
            </div>

            {/* 강화 효과 목록 */}
            <div
              className="space-y-3 mb-6"
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
                  <span className="text-white font-bold">
                    {enhancement.level === 1
                      ? "+10%"
                      : `찬스 게임 성공 확률 ${enhancement.effect}`}
                  </span>
                </div>
              ))}
            </div>

            {/* 액션 버튼 */}
            <div className="flex space-x-3">
              <button
                className={`w-[150px] h-14 flex-1 py-3 rounded-[10px] relative`}
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
                onClick={() => {
                  // TODO: 장착/해제 로직 구현
                  console.log(item.isEquipped ? "해제" : "장착");
                }}
              >
                <img
                  src={
                    item.isEquipped
                      ? Images.ButtonPointRed
                      : Images.ButtonPointBlue
                  }
                  alt={
                    item.isEquipped ? "button-point-red" : "button-point-blue"
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
                {item.isEquipped ? "해제" : "장착"}
              </button>
              <button
                className="w-[150px] h-14 flex-1 py-3 rounded-[10px] relative"
                style={{
                  background:
                    "linear-gradient(180deg, #50B0FF 0%, #50B0FF 50%, #008DFF 50%, #008DFF 100%)",
                  border: "2px solid #76C1FF",
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
                onClick={() => {
                  // TODO: 강화 로직 구현
                  console.log("강화");
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
                강화
              </button>
            </div>

            {/* 닫기 버튼 */}
            <button
              className="absolute top-4 right-4 text-white text-2xl"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </>
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
    if (level <= 2) {
      return {
        background: "linear-gradient(180deg, #C655FD 0%, #EECAFF 100%)",
        border: "2px solid #EECAFF",
        numberBackground: "#C655FD",
        numberBorder: "1px solid #EECAFF",
      };
    } else if (level <= 4) {
      return {
        background: "linear-gradient(180deg, #1FC9FE 0%, #87E2FF 100%)",
        border: "2px solid #87E2FF",
        numberBackground: "#1FC9FE",
        numberBorder: "1px solid #87E2FF",
      };
    } else if (level <= 6) {
      return {
        background: "linear-gradient(180deg, #73DF28 0%, #ABEE7D 100%)",
        border: "2px solid #ABEE7D",
        numberBackground: "#73DF28",
        numberBorder: "1px solid #ABEE7D",
      };
    } else if (level <= 8) {
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
        className="w-[60px] h-[60px] min-[376px]:w-20 min-[376px]:h-20 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer"
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
          className="w-9 h-9 min-[376px]:w-12 min-[376px]:h-12"
        />
      </div>
      {/* 등급 표시: 원형, 모바일 퍼스트 분기 */}
      <div
        className="absolute left-1/2 translate-x-[-50%] bottom-[-6px] min-[376px]:bottom-[-8px] w-[18px] h-[18px] min-[376px]:w-[22px] min-[376px]:h-[22px] rounded-full flex items-center justify-center"
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
      case 'HEAD': return 'top';
      case 'BACK': return 'bottom';
      case 'NECK': return 'right';
      case 'EAR': return 'left';
      case 'EYE': return 'right';
      default: return 'center';
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      <div
        className="w-[60px] h-[60px] min-[376px]:w-20 min-[376px]:h-20 rounded-2xl flex items-center justify-center shadow-lg border-2 border-dashed border-gray-400 bg-gray-800/30"
        style={{
          boxShadow: "0px 2px 2px 0px rgba(0, 0, 0, 0.35), inset 0px 0px 2px 2px rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="text-gray-400 text-xs text-center">
          <div className="font-bold">{type}</div>
          <div className="text-[8px]">슬롯</div>
        </div>
      </div>
      {/* 빈 슬롯 표시 */}
      <div
        className="absolute left-1/2 translate-x-[-50%] bottom-[-6px] min-[376px]:bottom-[-8px] w-[18px] h-[18px] min-[376px]:w-[22px] min-[376px]:h-[22px] rounded-full flex items-center justify-center bg-gray-500 border border-gray-400"
      >
        <span className="text-[5px] min-[376px]:text-[6px] font-bold text-white">-</span>
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
    if (level <= 2) {
      return {
        background: "#C655FD80",
        border: "2px solid #EECAFF",
        numberBackground: "#C655FD",
        numberBorder: "1px solid #EECAFF",
      };
    } else if (level <= 4) {
      return {
        background: "#1FC9FE80",
        border: "2px solid #87E2FF",
        numberBackground: "#1FC9FE80",
        numberBorder: "1px solid #87E2FF",
      };
    } else if (level <= 6) {
      return {
        background: "#73DF2880",
        border: "2px solid #ABEE7D",
        numberBackground: "#73DF2880",
        numberBorder: "1px solid #ABEE7D",
      };
    } else if (level <= 8) {
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
  const charactorImageSrc = location.state?.charactorImageSrc || Images.Cat1;

  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    icon: string;
    alt: string;
    name: string;
    level: number;
    isEquipped: boolean;
  } | null>(null);

  // 인벤토리 데이터 상태
  const [inventoryData, setInventoryData] = useState<InventoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 인벤토리 데이터 가져오기
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setIsLoading(true);
        const data = await getItemList();
        setInventoryData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        console.error('Inventory fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // 아이템 클릭 핸들러
  const handleItemClick = (
    item: InventoryItem,
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
    });
    setIsModalOpen(true);
  };

  // 장착된 아이템 클릭 핸들러
  const handleEquippedItemClick = (item: EquippedSlotItem) => {
    // slotId 정보 로깅 (디버깅용)
    console.log(`장착된 아이템 클릭: ${item.type}, 슬롯 ID: ${item.slotId}, 장비 ID: ${item.ownedEquipmentId}`);
    handleItemClick(item, true);
  };

  // 장착된 아이템을 효율적으로 찾는 헬퍼 함수
  const getEquippedItem = (type: string): EquippedSlotItem | undefined => {
    return inventoryData?.slot.find(item => item.type === type);
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
    { type: 'HEAD', position: 'top' },
    { type: 'EYE', position: 'top' },
    { type: 'EAR', position: 'left' },
    { type: 'NECK', position: 'right' },
    { type: 'BACK', position: 'bottom' },
  ];

  return (
    <div className="flex flex-col items-center text-white relative min-h-screen">
      {/* 상단 40% (TopTitle 포함) */}
      <div
        style={{
          backgroundImage: `url(${Images.BackgroundHome})`,
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          width: "100%",
          height: "50vh",
          minHeight: 200,
        }}
        className="w-full mx-6 flex flex-col"
      >
        <TopTitle title={"인벤토리"} back={false} />
        {/* 착용 중인 아이템 및 캐릭터 표시 영역 */}
        <div className="flex items-center justify-center flex-1 w-full">
          {/* 좌측 아이템 슬롯 */}
          <div className="flex flex-col gap-[100px] items-center">
            {/* HEAD 슬롯 */}
            {getEquippedItem('HEAD') ? (
              <ItemSlot
                icon={getEquipmentIcon('HEAD', getEquippedItem('HEAD')!.rarity)}
                alt="HEAD"
                level={getEquippedItem('HEAD')!.rarity}
                onClick={() => handleEquippedItemClick(getEquippedItem('HEAD')!)}
              />
            ) : (
              <EmptySlot type="HEAD" />
            )}
            {/* BACK 슬롯 */}
            {getEquippedItem('BACK') ? (
              <ItemSlot
                icon={getEquipmentIcon('BACK', getEquippedItem('BACK')!.rarity)}
                alt="BACK"
                level={getEquippedItem('BACK')!.rarity}
                onClick={() => handleEquippedItemClick(getEquippedItem('BACK')!)}
              />
            ) : (
              <EmptySlot type="BACK" />
            )}
          </div>
          {/* 중앙 캐릭터 */}
          <img
            src={Images.DogSmile}
            alt="character"
            className="min-[376px]:w-[200px] min-[376px]:h-[200px] w-[180px] h-[180px] min-[376px]:-translate-y-4 -translate-y-12"
          />
          {/* 우측 아이템 슬롯 */}
          <div className="flex flex-col gap-[30px] items-center">
            {/* NECK 슬롯 */}
            {getEquippedItem('NECK') ? (
              <ItemSlot
                icon={getEquipmentIcon('NECK', getEquippedItem('NECK')!.rarity)}
                alt="NECK"
                level={getEquippedItem('NECK')!.rarity}
                onClick={() => handleEquippedItemClick(getEquippedItem('NECK')!)}
              />
            ) : (
              <EmptySlot type="NECK" />
            )}
            {/* EAR 슬롯 */}
            {getEquippedItem('EAR') ? (
              <ItemSlot
                icon={getEquipmentIcon('EAR', getEquippedItem('EAR')!.rarity)}
                alt="EAR"
                level={getEquippedItem('EAR')!.rarity}
                onClick={() => handleEquippedItemClick(getEquippedItem('EAR')!)}
              />
            ) : (
              <EmptySlot type="EAR" />
            )}
            {/* EYE 슬롯 */}
            {getEquippedItem('EYE') ? (
              <ItemSlot
                icon={getEquipmentIcon('EYE', getEquippedItem('EYE')!.rarity)}
                alt="EYE"
                level={getEquippedItem('EYE')!.rarity}
                onClick={() => handleEquippedItemClick(getEquippedItem('EYE')!)}
              />
            ) : (
              <EmptySlot type="EYE" />
            )}
          </div>
        </div>
      </div>

      {/* 보유 중인 아이템 목록 영역 */}
      <div
        className="w-full h-[50vh] mx-6 overflow-hidden"
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
          
          {/* 인벤토리 통계 정보 */}
          {/* {inventoryData && (
            <div className="mb-4 p-3 rounded-lg bg-blue-900/30 border border-blue-400/50">
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="text-blue-300 font-bold">장착된 아이템</div>
                  <div className="text-white text-lg">
                    {inventoryData.slot.length}/5
                  </div>
                </div>
                <div>
                  <div className="text-green-300 font-bold">보유 아이템</div>
                  <div className="text-white text-lg">
                    {inventoryData.myItems.length}개
                  </div>
                </div>
                <div>
                  <div className="text-yellow-300 font-bold">빈 슬롯</div>
                  <div className="text-white text-lg">
                    {5 - inventoryData.slot.length}개
                  </div>
                </div>
              </div>
            </div>
          )} */}
          
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
                  <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold mb-2">보유한 아이템이 없습니다</div>
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
        />
      )}
    </div>
  );
};

export default Inventory;
