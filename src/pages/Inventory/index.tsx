import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { TopTitle } from "@/shared/components/ui";
import { useNavigate, useLocation } from "react-router-dom";
import Images from "@/shared/assets/images";

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
      <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md z-[60]" />

      {/* 모달 컨테이너 */}
      <div className="fixed inset-0 flex items-center justify-center z-[70] p-4">
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
}: {
  icon: string;
  alt: string;
  onClick: () => void;
}) {
  return (
    <div className="relative flex flex-col items-center">
      <div
        className="w-[60px] h-[60px] min-[376px]:w-20 min-[376px]:h-20 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer"
        style={{ background: "linear-gradient(180deg, #F43F5E 0%, #fff 100%)" }}
        onClick={onClick}
      >
        <img
          src={icon}
          alt={alt}
          className="w-9 h-9 min-[376px]:w-12 min-[376px]:h-12"
        />
      </div>
      {/* 등급 표시: 원형, 모바일 퍼스트 분기 */}
      <div className="absolute left-1/2 translate-x-[-50%] bottom-[-6px] min-[376px]:bottom-[-8px] bg-[#F43F5E] w-[18px] h-[18px] min-[376px]:w-[22px] min-[376px]:h-[22px] rounded-full flex items-center justify-center">
        <span className="text-[5px] min-[376px]:text-[6px] font-bold text-white">
          1
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
  return (
    <div
      className="relative rounded-2xl flex items-center justify-center shadow-md w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] cursor-pointer"
      style={{
        background: gradient,
        boxShadow:
          "0px 2px 2px 0px rgba(0, 0, 0, 0.35), inset 0px 0px 2px 2px rgba(255, 255, 255, 0.2)",
      }}
      onClick={onClick}
    >
      <img src={icon} alt={alt} className="w-9 h-9 sm:w-10 sm:h-10" />
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 bg-[#FF5E5E] w-[22px] h-[22px] rounded-full flex items-center justify-center">
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

  // 아이템 클릭 핸들러
  const handleItemClick = (
    item: {
      icon: string;
      alt: string;
      quantity: number;
      gradient: string;
    },
    isEquipped: boolean = false
  ) => {
    const itemNames: { [key: string]: string } = {
      crown: "레드 크라운",
      muffler: "그린 머플러",
      balloon: "블루 풍선",
      ribbon: "옐로우 리본",
    };

    setSelectedItem({
      icon: item.icon,
      alt: item.alt,
      name: itemNames[item.alt] || item.alt,
      level: item.quantity,
      isEquipped,
    });
    setIsModalOpen(true);
  };

  // 장착된 아이템 클릭 핸들러
  const handleEquippedItemClick = (icon: string, alt: string) => {
    const itemNames: { [key: string]: string } = {
      crown: "레드 크라운",
      muffler: "그린 머플러",
      balloon: "블루 풍선",
      ribbon: "옐로우 리본",
    };

    setSelectedItem({
      icon,
      alt,
      name: itemNames[alt] || alt,
      level: 1,
      isEquipped: true,
    });
    setIsModalOpen(true);
  };

  const dummyItems: Array<{
    icon: string;
    alt: string;
    quantity: number;
    gradient: string;
  }> = [
    {
      icon: Images.CatGreenCrown,
      alt: "crown",
      quantity: 5,
      gradient: "linear-gradient(180deg, #FECACA 0%, #FDA4AF 100%)",
    },
    {
      icon: Images.CatGreenCrown,
      alt: "crown",
      quantity: 5,
      gradient: "linear-gradient(180deg, #FECACA 0%, #FDA4AF 100%)",
    },
    {
      icon: Images.CatGreenCrown,
      alt: "crown",
      quantity: 5,
      gradient: "linear-gradient(180deg, #FECACA 0%, #FDA4AF 100%)",
    },
    {
      icon: Images.CatGreenCrown,
      alt: "crown",
      quantity: 5,
      gradient: "linear-gradient(180deg, #FECACA 0%, #FDA4AF 100%)",
    },
    {
      icon: Images.CatGreenCrown,
      alt: "crown",
      quantity: 5,
      gradient: "linear-gradient(180deg, #FECACA 0%, #FDA4AF 100%)",
    },
    {
      icon: Images.CatGreenCrown,
      alt: "crown",
      quantity: 5,
      gradient: "linear-gradient(180deg, #FECACA 0%, #FDA4AF 100%)",
    },
    {
      icon: Images.CatGreenMuffler,
      alt: "muffler",
      quantity: 4,
      gradient: "linear-gradient(180deg, #D9F99D 0%, #A7F3D0 100%)",
    },
    {
      icon: Images.CatGreenMuffler,
      alt: "muffler",
      quantity: 4,
      gradient: "linear-gradient(180deg, #D9F99D 0%, #A7F3D0 100%)",
    },
    {
      icon: Images.CatGreenMuffler,
      alt: "muffler",
      quantity: 4,
      gradient: "linear-gradient(180deg, #D9F99D 0%, #A7F3D0 100%)",
    },
    {
      icon: Images.CatGreenBallon,
      alt: "balloon",
      quantity: 3,
      gradient: "linear-gradient(180deg, #BBF7D0 0%, #86EFAC 100%)",
    },
    {
      icon: Images.CatGreenBallon,
      alt: "balloon",
      quantity: 3,
      gradient: "linear-gradient(180deg, #BBF7D0 0%, #86EFAC 100%)",
    },
    {
      icon: Images.CatGreenBallon,
      alt: "balloon",
      quantity: 3,
      gradient: "linear-gradient(180deg, #BBF7D0 0%, #86EFAC 100%)",
    },
    {
      icon: Images.CatGreenRibbon,
      alt: "ribbon",
      quantity: 2,
      gradient: "linear-gradient(180deg, #BFDBFE 0%, #93C5FD 100%)",
    },
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
            <ItemSlot
              icon={Images.CatGreenCrown}
              alt="crown"
              onClick={() =>
                handleEquippedItemClick(Images.CatGreenCrown, "crown")
              }
            />
            <ItemSlot
              icon={Images.CatGreenBallon}
              alt="balloon"
              onClick={() =>
                handleEquippedItemClick(Images.CatGreenBallon, "balloon")
              }
            />
          </div>
          {/* 중앙 캐릭터 */}
          <img
            src={charactorImageSrc}
            alt="character"
            className="min-[376px]:w-[200px] min-[376px]:h-[200px] w-[180px] h-[180px] min-[376px]:-translate-y-4 -translate-y-12"
          />
          {/* 우측 아이템 슬롯 */}
          <div className="flex flex-col gap-[30px] items-center">
            <ItemSlot
              icon={Images.CatGreenMuffler}
              alt="muffler"
              onClick={() =>
                handleEquippedItemClick(Images.CatGreenMuffler, "muffler")
              }
            />
            <ItemSlot
              icon={Images.CatGreenRibbon}
              alt="ribbon"
              onClick={() =>
                handleEquippedItemClick(Images.CatGreenRibbon, "ribbon")
              }
            />
            <ItemSlot
              icon={Images.CatGreenRibbon}
              alt="ribbon"
              onClick={() =>
                handleEquippedItemClick(Images.CatGreenRibbon, "ribbon")
              }
            />
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
          <div className="grid grid-cols-4 gap-3 gap-y-4 justify-items-center">
            {dummyItems.map((item, index) => (
              <OwnedItemCard
                key={`${item.alt}-${index}`}
                icon={item.icon}
                alt={item.alt}
                quantity={item.quantity}
                gradient={item.gradient}
                onClick={() => handleItemClick(item, false)}
              />
            ))}
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
