import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Images from "@/shared/assets/images";

// 아이템 타입 정의
type ItemType =
  | "balloon"
  | "crown"
  | "muffler"
  | "ribbon"
  | "sunglasses"
  | "wing";

// 장착된 아이템 정보 (희귀도 포함)
interface EquippedItemInfo {
  type: ItemType;
  rarity: number;
}

const UserLevel: React.FC<{
  userLv: number;
  charactorImageSrc: string;
  exp: number;
  characterType?: "cat" | "dog";
  equippedItems?: EquippedItemInfo[]; // 희귀도 정보를 포함하도록 변경
  onAlertClick?: () => void;
}> = ({
  userLv,
  charactorImageSrc,
  exp,
  characterType = "cat",
  equippedItems = [],
  onAlertClick,
}) => {

  // 레벨에 따른 캐릭터 이미지 선택 로직 (DiceEvent와 동일)
  const getCharacterImageSrc = () => {
    if (characterType === "cat") {
      return Images.CatSmile;
    } else {
      return Images.DogSmile;
    }
  };

  // 아이템 이미지 매핑 (index.tsx의 getEquipmentIcon과 동일한 로직)
  const getItemImage = (itemType: ItemType, rarity: number): string => {
    
    const getRarityImageIndex = (rarity: number): number => {
      if (rarity <= 1) return 1; // 보라색
      if (rarity <= 3) return 2; // 하늘색
      if (rarity <= 5) return 3; // 초록색
      if (rarity <= 7) return 4; // 노란색
      return 5; // 빨간색
    };

    const imageIndex = getRarityImageIndex(rarity);
    let imageKey: string = "Ballon1";

    switch (itemType) {
      case "crown": imageKey = `Crown${imageIndex}`; break;
      case "ribbon": imageKey = `Hairpin${imageIndex}`; break;
      case "sunglasses": imageKey = `Sunglass${imageIndex}`; break;
      case "muffler": imageKey = `Muffler${imageIndex}`; break;
      case "balloon": imageKey = `Ballon${imageIndex}`; break;
      case "wing": imageKey = `Wing${imageIndex}`; break;
      default: imageKey = "Ballon1";
    }

    const imagePath = Images[imageKey as keyof typeof Images] || Images.Ballon1;
    
    return imagePath;
  };

  const roundedExp = Math.floor(exp);

  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  // 레벨에 따른 캐릭터 이미지 사용
  const characterImageSrc = getCharacterImageSrc();

  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-3xl w-[150px] h-[160px] pt-4`}
      style={{
        position: "relative",
        background: "rgba(255,255,255,0.65)",
        borderRadius: 20,
        boxShadow: "0px 2px 2px 0px rgba(0,0,0,0.4)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      {/* AlertIcon - 좌측 상단 */}
      <div
        className="absolute top-[15px] left-[15px] z-50"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onAlertClick?.();
        }}
      >
        <img
          src={Images.InfoButton}
          alt="Alert"
          className="w-[30px] h-[30px] cursor-pointer"
          style={{ width: "20px", height: "20px" }}
        />
      </div>

      {/* 캐릭터와 아이템 겹치기 */}
      <div className="relative">
        {/* BACK 아이템(풍선)을 캐릭터 뒤에 표시 */}
        {equippedItems.find(item => item.type === "balloon") && (
          <img
            src={getItemImage("balloon", equippedItems.find(item => item.type === "balloon")!.rarity)}
            alt={`${characterType} balloon`}
            className="absolute -top-6 left-1/2 transform -translate-x-[60%] w-16 h-16 opacity-90"
            style={{ zIndex: 5 }}
          />
        )}
        
        {/* 기본 캐릭터 이미지 */}
        <img
          src={characterImageSrc}
          className="w-24 h-24 relative"
          alt={`Character Level ${userLv}`}
          style={{ zIndex: 10 }}
        />

        {/* 장착된 아이템들을 캐릭터 위에 겹쳐서 표시 (BACK 제외) */}
        {equippedItems
          .filter(item => item.type !== "balloon") // BACK 아이템 제외
          .map((item, index) => {
            
            // 아이템 타입별 위치와 사이즈 설정
            let itemStyle: React.CSSProperties = {};
            
            switch (item.type) {
              case "crown": // HEAD
                itemStyle = {
                  position: "absolute",
                  top: "-2px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "32px",
                  height: "32px",
                  zIndex: 15,
                  opacity: 0.9
                };
                break;
              case "sunglasses": // EYE
                itemStyle = {
                  position: "absolute",
                  top: "20px",
                  left: "52%",
                  transform: "translateX(-50%) rotate(-2deg)",
                  width: "34px",
                  height: "34px",
                  zIndex: 15,
                  opacity: 0.9
                };
                break;
              case "ribbon": // EAR
                itemStyle = {
                  position: "absolute",
                  top: "8px",
                  right: "20px",
                  transform: "rotate(45deg)",
                  width: "24px",
                  height: "24px",
                  zIndex: 15,
                  opacity: 0.9
                };
                break;
              case "muffler": // NECK
                itemStyle = {
                  position: "absolute",
                  bottom: "14px",
                  left: "52%",
                  transform: "translateX(-50%)",
                  width: "32px",
                  height: "32px",
                  zIndex: 15,
                  opacity: 0.9
                };
                break;
              default:
                itemStyle = {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "96px",
                  height: "96px",
                  zIndex: 15,
                  opacity: 0.9
                };
            }
            
            return (
              <img
                key={`${item.type}-${index}`}
                src={getItemImage(item.type, item.rarity)}
                alt={`${characterType} ${item.type}`}
                style={itemStyle}
              />
            );
          })}
      </div>

      <div className="flex flex-row items-center w-full px-4 gap-2">
        <p
          className="font-semibold text-[8px] md:text-xs"
          style={{
            fontFamily: "'ONE Mobile POP', sans-serif",
            fontSize: "12px",
            fontWeight: 400,
            color: "#2A294E",
          }}
        >
          Lv.{userLv}
        </p>
        <div
          className="flex flex-row border rounded-full relative overflow-hidden"
          style={{
            borderColor: "#001D60BF",
            width: "84px",
            height: "14px",
          }}
        >
          {[...Array(100)].map((_, i) => {
            return (
              <div
                key={i}
                className={`w-[1%] ${i === 0 ? "rounded-l-full" : ""} ${
                  i === 99 ? "rounded-r-full" : ""
                }`}
                style={{
                  backgroundColor: i < roundedExp ? "#64FF56" : "#001D60BF",
                }}
              ></div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserLevel;
