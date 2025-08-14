import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Snowfall } from "react-snowfall";
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
  let levelClassName = "";
  let mainColor = "";

  if (userLv >= 1 && userLv <= 4) {
    levelClassName = "lv1to4-box";
    mainColor = "#dd2726";
  } else if (userLv >= 5 && userLv <= 8) {
    levelClassName = "lv5to8-box";
    mainColor = "#f59e0b";
  } else if (userLv >= 9 && userLv <= 12) {
    levelClassName = "lv9to12-box";
    mainColor = "#facc15";
  } else if (userLv >= 13 && userLv <= 16) {
    levelClassName = "lv13to16-box";
    mainColor = "#22c55e";
  } else if (userLv >= 17 && userLv <= 20) {
    levelClassName = "lv17to20-box";
    mainColor = "#0147e5";
  }

  // 레벨에 따른 캐릭터 이미지 선택 로직 (DiceEvent와 동일)
  const getCharacterImageSrc = () => {
    const index = Math.floor((userLv - 1) / 4);

    const catImages = [
      Images.Cat1,
      Images.Cat2,
      Images.Cat3,
      Images.Cat4,
      Images.Cat5,
    ];

    const dogImages = [
      Images.Dog1,
      Images.Dog2,
      Images.Dog3,
      Images.Dog4,
      Images.Dog5,
    ];

    if (characterType === "cat") {
      return catImages[index] || catImages[catImages.length - 1];
    } else {
      return dogImages[index] || dogImages[dogImages.length - 1];
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

  const messages = [
    "축하합니다! 보상은 다음과 같습니다:",
    "축하합니다! 보상은 다음과 같습니다:",
    "축하합니다! 보상은 다음과 같습니다:",
    "축하합니다! 보상은 다음과 같습니다:",
    "축하합니다! 보상은 다음과 같습니다:",
  ];

  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let showTimer: NodeJS.Timeout;
    let hideTimer: NodeJS.Timeout;

    const startCycle = () => {
      const randomIndex = Math.floor(Math.random() * messages.length);
      setCurrentMsgIndex(randomIndex);
      setVisible(true);

      hideTimer = setTimeout(() => {
        setVisible(false);
      }, 3000);

      // 12초 후 다음 메시지
      showTimer = setTimeout(() => {
        startCycle();
      }, 12000);
    };

    startCycle();

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [messages.length]);

  const currentMessageParts = messages[currentMsgIndex].split("<br/>");

  // 현재 날짜 기준 계절 구분
  const month = new Date().getMonth() + 1; // 1~12
  let images: HTMLImageElement[] | undefined;

  if (month >= 3 && month <= 5) {
    // 봄: 벚꽃잎(예: Images.Spring)
    const springImg = new Image();
    springImg.src = Images.Spring;
    images = [springImg];
  } else if (month >= 6 && month <= 8) {
    // 여름: 잎사귀(예: Images.Summer)
    const summerImg = new Image();
    summerImg.src = Images.Summer;
    images = [summerImg];
  } else if (month >= 9 && month <= 11) {
    // 가을: 낙엽(예: Images.Fall)
    const fallImg = new Image();
    fallImg.src = Images.Fall;
    images = [fallImg];
  } else {
    // 겨울: 이미지 사용 안함(눈송이 기본 형태)
    images = undefined;
  }

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
      <Snowfall
        style={{ borderRadius: "24px" }}
        snowflakeCount={10}
        images={images}
      />

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
      <div className="absolute top-1 right-1 flex justify-end w-full px-1 z-50">
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
              {currentMessageParts.map((part, index) => (
                <React.Fragment key={index}>
                  {part}
                  {index < currentMessageParts.length - 1 && <br />}
                </React.Fragment>
              ))}
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
      </div>

      {/* 캐릭터와 아이템 겹치기 */}
      <div className="relative">
        {/* 기본 캐릭터 이미지 */}
        <img
          src={characterImageSrc}
          className="w-24 h-24 md:w-32 md:h-32 z-20"
          alt={`Character Level ${userLv}`}
        />

        {/* 장착된 아이템들을 기본 캐릭터 위에 겹쳐서 표시 */}
        {equippedItems.map((itemType, index) => (
          <img
            key={`${itemType}-${index}`}
            src={getItemImage(itemType)}
            alt={`${characterType} ${itemType}`}
            className="absolute inset-0 w-24 h-24 md:w-32 md:h-32 z-30"
          />
        ))}
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
