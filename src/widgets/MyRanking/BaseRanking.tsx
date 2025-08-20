// src/widgets/MyRanking/BaseRanking.tsx
import React from "react";
import CountUp from "react-countup";
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
  // 안전한 값 처리
  const safeRank = rank ?? 0;
  const safePreviousRank = previousRank ?? 0;
  const safeStarPoints = starPoints ?? 0;
  const safeLotteryCount = lotteryCount ?? 0;
  const safeSlToken = slToken ?? 0;

  const diff = safePreviousRank - safeRank;
  const isUp = diff > 0;

  // 간단한 렌더링 (애니메이션 제거)
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
          </p>
          
          <p
            className={`${safeRank > 9999 ? "text-xl" : "text-2xl"}`}
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontWeight: 400,
              color: "#fde047",
              WebkitTextStroke: "1px #000000",
            }}
          >
            <CountUp start={0} end={safeRank} duration={1} separator="," />
          </p>
          
          {diff !== 0 && (
            <div
              className={`absolute flex items-center -right-2 z-20 ${
                isUp ? "text-[#22C55E] top-[40%]" : "text-[#DD2726] bottom-1"
              } text-[12px] font-semibold`}
            >
              <p>{Math.abs(diff)}</p>
              <span className="text-xs">{isUp ? "↑" : "↓"}</span>
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
            <img
              src={Images.Star}
              alt="star"
              className="w-6 h-6"
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
              <CountUp start={0} end={safeStarPoints} duration={1} separator="," />
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <img
              src={Images.LotteryTicket}
              alt="ticket"
              className="w-6 h-6"
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
                end={safeLotteryCount}
                duration={1}
                separator=","
              />
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <img
              src={Images.TokenReward}
              alt="token"
              className="w-6 h-6"
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
                end={safeSlToken}
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
