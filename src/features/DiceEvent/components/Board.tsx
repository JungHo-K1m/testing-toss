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

interface BoardProps {
  position: number;
  charactorImageSrc: string;
  initialX: number;
  initialY: number;
  delta: number;
  equippedItems?: ItemType[];
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

  // position이 10보다 큰 경우 좌우 반전 스타일 적용
  const flipStyle = position > 10 ? { transform: "scaleX(-1)" } : {};

  // 아이템 이미지 매핑
  const getItemImage = (itemType: ItemType): string => {
    const itemMap = {
      cat: {
        balloon: Images.CatGreenBallon,
        crown: Images.CatGreenCrown,
        muffler: Images.CatGreenMuffler,
        ribbon: Images.CatGreenRibbon,
        sunglasses: Images.CatGreenSunglasses,
        wing: Images.CatGreenWing,
      },
      dog: {
        balloon: Images.DogGreenBallon,
        crown: Images.DogGreenCrown,
        muffler: Images.DogGreenMuffler,
        ribbon: Images.DogGreenRibbon,
        sunglasses: Images.DogGreenSunglasses,
        wing: Images.DogGreenWing,
      },
    };

    return itemMap[characterType][itemType];
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
      <img
        src={Images.CatSmile}
        alt="character"
        className="w-12 h-12 md:w-20 md:h-20 relative z-10"
        style={{
          ...flipStyle,
          transform: `${flipStyle.transform || ''} translateX(4px)`.trim(),
        }}
      />
      {/* {equippedItems.map((itemType, index) => (
        <img
          key={`${itemType}-${index}`}
          src={getItemImage(itemType)}
          alt={`${characterType} ${itemType}`}
          className="absolute inset-0 w-12 h-12 md:w-20 md:h-20 z-20"
          style={flipStyle}
        />
      ))} */}
    </motion.div>
  );
};

export default Board;
