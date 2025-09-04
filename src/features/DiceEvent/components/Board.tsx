import React from "react";
import { motion } from "framer-motion";
import calculateTilePosition from "@/shared/utils/calculateTilePosition";
import Images from "@/shared/assets/images";

// 아이템 타입 정의
export type ItemType =
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

interface BoardProps {
  position: number;
  charactorImageSrc?: string; // 선택적 prop으로 변경
  initialX: number;
  initialY: number;
  delta: number;
  equippedItems?: EquippedItemInfo[]; // 희귀도 정보를 포함하도록 변경
  characterType?: "cat" | "dog";
  isAnywhereTile?: boolean; // anywhere 타일 여부 추가
}

const Board: React.FC<BoardProps> = ({
  position,
  charactorImageSrc,
  initialX,
  initialY,
  delta,
  equippedItems = [],
  characterType = "cat",
}) => {

  const { x, y } = calculateTilePosition(position, initialX, initialY, delta);

  // 좌우 반전 스타일 제거 (캐릭터가 항상 정면을 향하도록)
  const flipStyle = {};

  // 캐릭터 이미지 선택 (index.tsx와 동일한 로직)
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

  return (
    <motion.div
      className={`absolute z-50`}
      initial={{ x: initialX, y: initialY }}
      animate={{ x, y }}
      transition={{
        x: { type: "spring", stiffness: 300, damping: 25 },
        y: { type: "spring", stiffness: 300, damping: 15 },
      }}
    >
      <div
        className="absolute w-full h-full rounded-full bottom-0 left-1/2 transform -translate-x-1/2"
        style={{
          width: "70%",
          height: "10%",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          borderRadius: "50%",
        }}
      ></div>
      
      {/* BACK 아이템(풍선)을 캐릭터 뒤에 표시 */}
      {equippedItems.find(item => item.type === "balloon") && (
        <img
          src={getItemImage("balloon", equippedItems.find(item => item.type === "balloon")!.rarity)}
          alt={`${characterType} balloon`}
          className="absolute -top-6 left-1/2 transform -translate-x-[60%] w-8 h-8 opacity-90"
          style={{ ...flipStyle, zIndex: 5 }}
        />
      )}
      
      {/* 캐릭터 이미지 (CatSmile/DogSmile 사용) */}
      <img
        src={getCharacterImageSrc()}
        alt="character"
        className="w-12 h-12 relative"
        style={{
          transform: "translateX(4px)",
          zIndex: 10
        }}
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
                top: "1px",
                left: "60%",
                transform: "translateX(-50%)",
                width: "12px",
                height: "12px",
                zIndex: 15,
                opacity: 0.9
              };
              break;
            case "sunglasses": // EYE
              itemStyle = {
                position: "absolute",
                top: "10px",
                left: "62%",
                transform: "translateX(-50%) rotate(-2deg)",
                width: "18px",
                height: "18px",
                zIndex: 15,
                opacity: 0.9
              };
              break;
            case "ribbon": // EAR
              itemStyle = {
                position: "absolute",
                top: "4px",
                right: "6px",
                transform: "rotate(45deg)",
                width: "12px",
                height: "12px",
                zIndex: 15,
                opacity: 0.9
              };
              break;
            case "muffler": // NECK
              itemStyle = {
                position: "absolute",
                bottom: "6px",
                left: "60%",
                transform: "translateX(-50%)",
                width: "16px",
                height: "16px",
                zIndex: 15,
                opacity: 0.9
              };
              break;
            default:
              itemStyle = {
                position: "absolute",
                top: 0,
                left: 0,
                width: "48px",
                height: "48px",
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
    </motion.div>
  );
};

export default Board;
