// src/widgets/MyRanking/InlineRanking.tsx
import React, { useMemo } from "react";
import { useUserStore } from "@/entities/User/model/userModel";
import { BaseRanking } from "./BaseRanking";

export const InlineRanking: React.FC = () => {
  // store에서 필요한 값들을 개별적으로 구독하여 불필요한 리렌더링 방지
  const rank = useUserStore((state) => state.rank);
  const previousRank = useUserStore((state) => state.previousRank);
  const starPoints = useUserStore((state) => state.starPoints);
  const lotteryCount = useUserStore((state) => state.lotteryCount);
  const slToken = useUserStore((state) => state.slToken);

  // useMemo를 사용하여 props 객체를 메모이제이션
  const rankingProps = useMemo(() => ({
    rank,
    previousRank,
    starPoints,
    lotteryCount,
    slToken,
    className: "justify-start",
    titleHidden: true,
  }), [rank, previousRank, starPoints, lotteryCount, slToken]);

  return (
    <div className="w-full max-w-[332px] md:max-w-full">
      <BaseRanking {...rankingProps} />
    </div>
  );
};
