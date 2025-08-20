import React from "react";
import Images from "@/shared/assets/images";
import { formatNumber } from "@/shared/utils/formatNumber";

interface LevelReward {
  level: number;
  dice: number;
  points: number;
  tickets?: number;
  bgColor: string;
}

const levelRewards: LevelReward[] = [
  { level: 2, dice: 10, points: 1000, bgColor: "#DD2726" },
  { level: 3, dice: 15, points: 2000, bgColor: "#DD2726" },
  { level: 4, dice: 20, points: 3000, bgColor: "#DD2726" },
  { level: 5, dice: 30, points: 5000, tickets: 3, bgColor: "#F59E0B" },
  { level: 6, dice: 40, points: 7000, tickets: 3, bgColor: "#F59E0B" },
  { level: 7, dice: 50, points: 10000, tickets: 3, bgColor: "#F59E0B" },
  { level: 8, dice: 60, points: 15000, tickets: 4, bgColor: "#F59E0B" },
  { level: 9, dice: 70, points: 20000, tickets: 5, bgColor: "#F59E0B" },
  { level: 10, dice: 100, points: 30000, tickets: 7, bgColor: "#FACC15" },
  { level: 15, dice: 200, points: 50000, tickets: 15, bgColor: "#22C55E" },
  { level: 20, dice: 500, points: 100000, tickets: 100, bgColor: "#0147E5" },
];

interface LevelRewardsProps {
  currentLevel?: number;
}

const LevelRewards: React.FC<LevelRewardsProps> = ({ currentLevel = 1 }) => {

  // 다음 레벨 보상 찾기
  const getNextLevelReward = () => {
    // 현재 레벨보다 큰 보상 중 가장 가까운 것 찾기
    const availableRewards = levelRewards.filter(
      (reward) => reward.level > currentLevel
    );
    return availableRewards.length > 0 ? availableRewards[0] : null;
  };

  const nextLevelReward = getNextLevelReward();

  return (
    <div className="flex flex-col gap-4 w-full">
      <h1
        className="text-center font-bold text-xl font-one-mobile-pop"
        style={{
          fontSize: "24px",
          fontWeight: 400,
          color: "#FDE047",
          WebkitTextStroke: "1px #000000",
        }}
      >
        레벨 보상
      </h1>

      {/* 다음 레벨 보상 섹션 */}
      <div className="flex flex-col gap-2">
        <h2
          className="text-white font-bold text-center font-one-mobile-pop"
          style={{
            fontSize: "18px",
            fontWeight: 400,
            WebkitTextStroke: "1px #000000",
          }}
        >
          다음 레벨 보상
        </h2>
        <div
          className="flex flex-col p-5 rounded-3xl"
          style={{
            backgroundColor: "#005EAA80",
            borderRadius: "20px",
            padding: "20px",
            boxShadow: "inset 0px 0px 4px 3px rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          {nextLevelReward ? (
            <div className="flex flex-row justify-center items-center">
              <div className="w-20 h-20 bg-gradient-to-b from-[#2660f4] to-[#3937a3] rounded-2xl flex items-center justify-center">
                <div className="flex-col gap-1 w-[76px] h-[76px] logo-bg rounded-2xl flex items-center justify-center">
                  <img
                    src={Images.Star}
                    className="w-8 h-8"
                    alt="Points Reward"
                  />
                  <p className="text-xs">
                    +{formatNumber(nextLevelReward.points)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-row justify-center items-center">
              <p className="text-white text-sm">최고 레벨에 도달했습니다!</p>
            </div>
          )}
        </div>
      </div>

      {/* 보상을 획득하세요! 섹션 */}
      <h2
        className="text-white font-bold text-center font-one-mobile-pop"
        style={{
          fontSize: "18px",
          fontWeight: 400,
          WebkitTextStroke: "1px #000000",
        }}
      >
        보상을 획득하세요!
      </h2>

      {/* 레벨별 보상 섹션 */}
      <div
        className="flex flex-col p-5 rounded-3xl gap-4"
        style={{
          backgroundColor: "#005EAA80",
          borderRadius: "20px",
          padding: "20px",
          boxShadow: "inset 0px 0px 4px 3px rgba(255, 255, 255, 0.6)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        {levelRewards.map((reward) => (
          <div key={reward.level} className="flex flex-col gap-4">
            <div className="flex flex-row items-center gap-2 ">
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: reward.bgColor }}
              ></div>
              <p>
                  레벨 {reward.level}
              </p>
            </div>
            <div className="flex flex-row justify-center items-center gap-2 w-full">
              <div className="w-20 h-20 bg-gradient-to-b from-[#2660f4] to-[#3937a3] rounded-2xl flex items-center justify-center">
                <div className="flex-col gap-1 w-[76px] h-[76px] logo-bg rounded-2xl flex items-center justify-center">
                  <img
                    src={Images.Dice}
                    className="w-8 h-8"
                    alt="Dice Reward"
                  />
                  <p className="text-xs">+{formatNumber(reward.dice)}</p>
                </div>
              </div>
              <div className="w-20 h-20 bg-gradient-to-b from-[#2660f4] to-[#3937a3] rounded-2xl flex items-center justify-center">
                <div className="flex-col gap-1 w-[76px] h-[76px] logo-bg rounded-2xl flex items-center justify-center">
                  <img
                    src={Images.Star}
                    className="w-8 h-8"
                    alt="Points Reward"
                  />
                  <p className="text-xs">+{formatNumber(reward.points)}</p>
                </div>
              </div>
              {reward.tickets && (
                <div className="w-20 h-20 bg-gradient-to-b from-[#2660f4] to-[#3937a3] rounded-2xl flex items-center justify-center">
                  <div className="flex-col gap-1 w-[76px] h-[76px] logo-bg rounded-2xl flex items-center justify-center">
                    <img
                      src={Images.LotteryTicket}
                      className="w-8 h-8"
                      alt="Ticket Reward"
                    />
                    <p className="text-xs">+{formatNumber(reward.tickets)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LevelRewards;
