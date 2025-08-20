// src/widgets/MyRanking/InlineRanking.tsx
import React from "react";
import { useUserStore } from "@/entities/User/model/userModel";

export const InlineRanking: React.FC = () => {
  // 가장 간단한 방식으로 데이터 가져오기
  const rank = useUserStore((state) => state.rank);
  const starPoints = useUserStore((state) => state.starPoints);
  const lotteryCount = useUserStore((state) => state.lotteryCount);
  const isLoading = useUserStore((state) => state.isLoading);

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="w-full max-w-[332px] md:max-w-full p-4 bg-white bg-opacity-20 rounded-lg">
        <div className="text-center text-white">
          <div className="animate-pulse">
            <div className="h-4 bg-white bg-opacity-30 rounded mb-2"></div>
            <div className="h-6 bg-white bg-opacity-30 rounded mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-4 bg-white bg-opacity-30 rounded"></div>
              <div className="h-4 bg-white bg-opacity-30 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 안전한 값 처리 (기본값 0)
  const safeRank = typeof rank === 'number' ? rank : 0;
  const safeStarPoints = typeof starPoints === 'number' ? starPoints : 0;
  const safeLotteryCount = typeof lotteryCount === 'number' ? lotteryCount : 0;

  // 정상 렌더링
  return (
    <div className="w-full max-w-[332px] md:max-w-full p-4 bg-white bg-opacity-20 rounded-lg">
      <div className="text-center text-white">
        <h3 className="text-lg font-bold mb-2">내 랭킹</h3>
        <div className="text-2xl font-bold text-yellow-400 mb-4">
          {safeRank.toLocaleString()}
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-300">스타</div>
            <div className="font-bold">{safeStarPoints.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-gray-300">티켓</div>
            <div className="font-bold">{safeLotteryCount.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
