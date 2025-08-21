// src/widgets/MyRanking/BaseRanking.tsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import CountUp from "react-countup";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { IoIosArrowRoundUp, IoIosArrowRoundDown } from "react-icons/io";
import Images from "@/shared/assets/images";

export interface BaseRankingProps {
  rank: number;
  previousRank: number;
  starPoints: number;
  lotteryCount: number;
  slToken: number;
  className?: string;
  titleHidden?: boolean;
}

export const BaseRanking: React.FC<BaseRankingProps> = ({
  rank,
  previousRank,
  starPoints,
  lotteryCount,
  slToken,
  className = "",
  titleHidden = true,
}) => {
  // --- 1) 애니메이션 트리거 상태 ---
  const [showRankText, setShowRankText] = useState<
    "myRank" | "rankUp" | "rankDown"
  >("myRank");
  const [rankChanged, setRankChanged] = useState(false);
  const [starChanged, setStarChanged] = useState(false);
  const [lotteryChanged, setLotteryChanged] = useState(false);
  const [tokenChanged, setTokenChanged] = useState(false);

  // --- 2) 이전 값 레퍼런스 ---
  const prevStarRef = useRef(starPoints);
  const prevLotteryRef = useRef(lotteryCount);
  const prevTokenRef = useRef(slToken);

  // --- 3) Rank 애니메이션 감지 ---
  useEffect(() => {
    // previousRank가 0이 아닐 때만 애니메이션 실행 (초기 렌더링 방지)
    if (previousRank !== 0 && previousRank !== rank) {
      setRankChanged(true);
      setShowRankText(rank < previousRank ? "rankUp" : "rankDown");
      const t1 = setTimeout(() => setRankChanged(false), 700);
      const t2 = setTimeout(() => setShowRankText("myRank"), 1500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [rank, previousRank]);

  // --- 4) Star/Ticket/Token 애니메이션 감지 ---
  useEffect(() => {
    // 초기 렌더링 시에는 애니메이션 실행하지 않음
    if (prevStarRef.current !== 0 && prevStarRef.current !== starPoints) {
      setStarChanged(true);
      const t = setTimeout(() => setStarChanged(false), 700);
      prevStarRef.current = starPoints;
      return () => clearTimeout(t);
    } else {
      prevStarRef.current = starPoints;
    }
  }, [starPoints]);

  useEffect(() => {
    // 초기 렌더링 시에는 애니메이션 실행하지 않음
    if (prevLotteryRef.current !== 0 && prevLotteryRef.current !== lotteryCount) {
      setLotteryChanged(true);
      const t = setTimeout(() => setLotteryChanged(false), 700);
      prevLotteryRef.current = lotteryCount;
      return () => clearTimeout(t);
    } else {
      prevLotteryRef.current = lotteryCount;
    }
  }, [lotteryCount]);

  useEffect(() => {
    // 초기 렌더링 시에는 애니메이션 실행하지 않음
    if (prevTokenRef.current !== 0 && prevTokenRef.current !== slToken) {
      setTokenChanged(true);
      const t = setTimeout(() => setTokenChanged(false), 700);
      prevTokenRef.current = slToken;
      return () => clearTimeout(t);
    } else {
      prevTokenRef.current = slToken;
    }
  }, [slToken]);

  // --- 5) Framer Motion Variants ---
  const scaleGlow: Variants = {
    initial: { scale: 1, filter: "brightness(1)", rotate: 0 },
    animate: {
      scale: [1, 1.5, 1.2, 1],
      filter: [
        "brightness(1)",
        "brightness(2)",
        "brightness(1.5)",
        "brightness(1)",
      ],
      rotate: [0, 5, -5, 0],
      transition: { duration: 1, ease: "easeInOut" },
    },
  };

  const scaleGlowImg: Variants = {
    initial: {
      scale: 1,
      filter: "brightness(1) drop-shadow(0 0 0px rgba(255,255,255,0))",
      rotate: 0,
    },
    animate: {
      scale: [1, 1.3, 1.1, 1],
      filter: [
        "brightness(1) drop-shadow(0 0 0px rgba(255,255,255,0))",
        "brightness(2) drop-shadow(0 0 10px rgba(255,255,255,0.8))",
        "brightness(1.5) drop-shadow(0 0 5px rgba(255,255,255,0.5))",
        "brightness(1) drop-shadow(0 0 0px rgba(255,255,255,0))",
      ],
      rotate: [0, 3, -3, 0],
      transition: { duration: 1, ease: "easeInOut" },
    },
  };
  
  const upDownVar: Variants = {
    initial: { scale: 1, opacity: 0, y: 0 },
    animate: {
      scale: [1, 1.3, 1, 1.3, 1],
      opacity: [0, 1, 1, 1, 0],
      y: [0, -5, 0, -5, 5],
      transition: { duration: 1.4, ease: "easeInOut" },
    },
    exit: { opacity: 0, scale: 1, y: 10, transition: { duration: 0.2 } },
  };
  
  const myVar: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  // diff와 isUp을 useMemo로 최적화
  const { diff, isUp } = useMemo(() => {
    const diffValue = previousRank - rank;
    const isUpValue = diffValue > 0;
    return { diff: diffValue, isUp: isUpValue };
  }, [previousRank, rank]);

  // --- 6) 렌더링 ---
  return (
    <div
      className={`flex flex-col items-center justify-center text-white cursor-pointer w-full ${className}`}
      role="button"
    >
      {/* Title */}
      <h1
        className={` ${titleHidden ? "hidden" : "block"}`}
        style={{
          fontFamily: "'ONE Mobile POP', sans-serif",
          fontSize: "30px",
          fontWeight: 400,
          color: "#FFFFFF",
          WebkitTextStroke: "1px #000000",
        }}
      >
        랭킹
      </h1>

      <div
        className={`bg-box px-8 w-full h-24 md:h-32 flex font-semibold ${
          titleHidden ? "mt-0" : "mt-4"
        }`}
        style={{
          background: "rgba(255,255,255,0.65)",
          borderRadius: 20,
          boxShadow: "0px 2px 2px 0px rgba(0,0,0,0.4)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        {/* Rank text & number */}
        <div className="relative w-[121px] h-full flex flex-col items-center justify-center gap-2">
          <p
            className="text-base font-semibold invisible"
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: "18px",
              fontWeight: 400,
              color: "#FFFFFF",
              WebkitTextStroke: "1px #000000",
            }}
          >
            내 랭킹
          </p>
          <div className="absolute top-[18%] md:top-[24%] w-full flex items-center justify-center">
            <AnimatePresence mode="wait">
              {showRankText === "myRank" && (
                <motion.p
                  key="my"
                  variants={myVar}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="text-base font-semibold"
                  style={{
                    fontFamily: "'ONE Mobile POP', sans-serif",
                    fontSize: "18px",
                    fontWeight: 400,
                    color: "#FFFFFF",
                    WebkitTextStroke: "1px #000000",
                  }}
                >
                  내 랭킹
                </motion.p>
              )}
              {showRankText === "rankUp" && (
                <motion.p
                  key="up"
                  variants={upDownVar}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="font-jalnan text-[#22C55E]"
                  style={{
                    fontFamily: "'ONE Mobile POP', sans-serif",
                    fontSize: "18px",
                    fontWeight: 400,
                    color: "#FFFFFF",
                    WebkitTextStroke: "1px #000000",
                  }}
                >
                  Rank Up!
                </motion.p>
              )}
              {showRankText === "rankDown" && (
                <motion.p
                  key="down"
                  variants={upDownVar}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="font-jalnan text-[#DD2726]"
                  style={{
                    fontFamily: "'ONE Mobile POP', sans-serif",
                    fontSize: "18px",
                    fontWeight: 400,
                    color: "#FFFFFF",
                    WebkitTextStroke: "1px #000000",
                  }}
                >
                  Rank Down!
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <motion.p
            variants={scaleGlow}
            animate={rankChanged ? "animate" : "initial"}
            className={`${rank > 9999 ? "text-xl" : "text-2xl"} `}
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontWeight: 400,
              color: "#fde047",
              WebkitTextStroke: "1px #000000",
            }}
          >
            <CountUp start={0} end={rank} duration={1} separator="," />
          </motion.p>
          {diff !== 0 && (
            <div
              className={`absolute flex items-center -right-2 z-20 ${
                isUp ? "text-[#22C55E] top-[40%]" : "text-[#DD2726] bottom-1"
              } text-[12px] font-semibold`}
            >
              <p>{Math.abs(diff)}</p>
              {isUp ? (
                <IoIosArrowRoundUp className="w-4 h-4" />
              ) : (
                <IoIosArrowRoundDown className="w-4 h-4" />
              )}
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="w-[1px] h-full mx-6 flex items-center">
          <div className="bg-[#737373] h-16 w-full" />
        </div>

        {/* Star, Ticket, Token */}
        <div className="w-full h-full flex items-center justify-around text-xs">
          <div className="flex flex-col items-center gap-2">
            <motion.img
              src={Images.Star}
              alt="star"
              className="w-6 h-6"
              variants={scaleGlowImg}
              animate={starChanged ? "animate" : "initial"}
            />
            <p
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "18px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              <CountUp start={0} end={starPoints} duration={1} separator="," />
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <motion.img
              src={Images.LotteryTicket}
              alt="ticket"
              className="w-6 h-6"
              variants={scaleGlowImg}
              animate={lotteryChanged ? "animate" : "initial"}
            />
            <p
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "18px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              <CountUp
                start={0}
                end={lotteryCount}
                duration={1}
                separator=","
              />
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <motion.img
              src={Images.TokenReward}
              alt="token"
              className="w-6 h-6"
              variants={scaleGlowImg}
              animate={tokenChanged ? "animate" : "initial"}
            />
            <p
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "18px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              <CountUp
                start={0}
                end={slToken}
                duration={1}
                separator=","
                preserveValue
              />
            </p>
          </div>
        </div>
      </div>

      {/* Footer text */}
      <p
        className="w-full font-medium text-xs md:text-sm mt-2 px-2 text-left"
        style={{
          fontFamily: "'ONE Mobile POP', sans-serif",
          fontSize: "18px",
          fontWeight: 400,
          color: "#FFFFFF",
          WebkitTextStroke: "1px #000000",
        }}
      >
        *랭킹은 스타포인트 기준으로 산정됩니다.
      </p>
    </div>
  );
};
