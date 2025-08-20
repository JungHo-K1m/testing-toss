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

const UserLevel: React.FC<{
  userLv: number;
  charactorImageSrc: string;
  exp: number;
  characterType?: "cat" | "dog";
  equippedItems?: ItemType[];
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

  // 아이템 이미지 매핑 (Board 컴포넌트와 동일)
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

  const roundedExp = Math.floor(exp);

  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  // 레벨에 따른 캐릭터 이미지 사용
  const characterImageSrc = getCharacterImageSrc();

  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-3xl w-[150px] h-[160px]`}
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

      {/* 말풍선 + 문구 */}
      {/* <div className="absolute top-1 right-1 flex justify-end w-full px-1 z-50">
        <AnimatePresence>
          {visible && (
            <motion.div
              key={currentMsgIndex}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="relative px-2 py-1 rounded-2xl shadow-lg font-semibold text-[10px]"
              style={{
                background: "#fff",
                color: "#333",
                textAlign: "center",
                zIndex: 50,
                overflow: "visible",
              }}
            >
              <div
                style={{
                  content: "",
                  position: "absolute" as const,
                  bottom: "-3px",
                  left: "30%",
                  transform: "translateX(-50%)",
                  width: 0,
                  height: 0,
                  borderLeft: "6px solid transparent",
                  borderRight: "6px solid transparent",
                  borderTop: "6px solid #fff",
                }}
              ></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div> */}

      {/* 캐릭터와 아이템 겹치기 */}
      <div className="relative">
        {/* 기본 캐릭터 이미지 */}
        <img
          src={characterImageSrc}
          className="w-24 h-24 md:w-32 md:h-32 z-20"
          alt={`Character Level ${userLv}`}
        />

        {/* 장착된 아이템들을 기본 캐릭터 위에 겹쳐서 표시 */}
        {/* {equippedItems.map((itemType, index) => (
          <img
            key={`${itemType}-${index}`}
            src={getItemImage(itemType)}
            alt={`${characterType} ${itemType}`}
            className="absolute inset-0 w-24 h-24 md:w-32 md:h-32 z-30"
          />
        ))} */}
      </div>

      <div className="flex flex-row items-center w-full px-4 gap-2">
        <p
          className="font-semibold text-[8px] md:text-xs"
          style={{
            fontFamily: "'ONE Mobile POP', sans-serif",
            fontSize: "12px",
            fontWeight: 400,
            color: "#FFFFFF",
            WebkitTextStroke: "1px #000000",
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
