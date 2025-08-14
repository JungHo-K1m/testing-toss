import React, { useState, useEffect } from "react";
import LoadingSpinner from "@/shared/components/ui/loadingSpinner";

interface RankingEntry {
  rank: number;
  username: string;
  score: number;
}

const NewMyRanking: React.FC = () => {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [myRank, setMyRank] = useState<RankingEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 테스트용 설정 - 이 값을 변경하여 다른 순위 테스트 가능
  const TEST_MY_RANK = 2; // 1로 변경하면 1위 테스트, 23으로 하면 23위 테스트

  // 더미 데이터 생성
  useEffect(() => {
    const generateDummyData = () => {
      // 내 랭킹 설정
      const myRankData: RankingEntry = {
        rank: TEST_MY_RANK,
        username: "User-23456",
        score: 10000000,
      };
      setMyRank(myRankData);

      // 전체 랭킹 데이터 생성 (내 랭킹 주변 7개)
      const allRankings: RankingEntry[] = [];

      if (myRankData.rank === 1) {
        // 1위인 경우: 1위부터 7위까지 표시
        for (let i = 1; i <= 7; i++) {
          if (i === 1) {
            allRankings.push(myRankData);
          } else {
            allRankings.push({
              rank: i,
              username: `User-${String(
                Math.floor(Math.random() * 99999)
              ).padStart(5, "0")}`,
              score: 10000000 - Math.floor(Math.random() * 2000000),
            });
          }
        }
      } else if (myRankData.rank <= 3) {
        // 2-3위인 경우: 1위부터 7위까지 표시
        for (let i = 1; i <= 7; i++) {
          if (i === myRankData.rank) {
            allRankings.push(myRankData);
          } else if (i === 1) {
            allRankings.push({
              rank: 1,
              username: `User-${String(
                Math.floor(Math.random() * 99999)
              ).padStart(5, "0")}`,
              score: 10000000 + Math.floor(Math.random() * 3000000),
            });
          } else {
            allRankings.push({
              rank: i,
              username: `User-${String(
                Math.floor(Math.random() * 99999)
              ).padStart(5, "0")}`,
              score: 10000000 - Math.floor(Math.random() * 2000000),
            });
          }
        }
      } else {
        // 4위 이상인 경우: 내 랭킹 위 3개, 내 랭킹, 내 랭킹 아래 3개
        // 내 랭킹 위 3개
        for (let i = myRankData.rank - 3; i < myRankData.rank; i++) {
          allRankings.push({
            rank: i,
            username: `User-${String(
              Math.floor(Math.random() * 99999)
            ).padStart(5, "0")}`,
            score: 10000000 + Math.floor(Math.random() * 3000000),
          });
        }

        // 내 랭킹
        allRankings.push(myRankData);

        // 내 랭킹 아래 3개
        for (let i = myRankData.rank + 1; i <= myRankData.rank + 3; i++) {
          allRankings.push({
            rank: i,
            username: `User-${String(
              Math.floor(Math.random() * 99999)
            ).padStart(5, "0")}`,
            score: 10000000 - Math.floor(Math.random() * 2000000),
          });
        }
      }

      setRankings(allRankings);
      setIsLoading(false);
    };

    // 로딩 시뮬레이션
    setTimeout(generateDummyData, 1000);
  }, []);

  const formatScore = (score: number): string => {
    return score.toLocaleString();
  };

  if (isLoading) {
    return <LoadingSpinner className="h-screen" />;
  }

  return (
    <div
      className="flex flex-col md:px-0 mb-44 w-full mt-7 rounded-[25px]"
      style={{
        background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
        boxShadow:
          "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
      }}
    >
      <h1
        className="mb-6 text-center mt-5"
        style={{
          fontFamily: "'ONE Mobile POP', sans-serif",
          fontSize: "24px",
          fontWeight: 400,
          color: "#FFFFFF",
          WebkitTextStroke: "1px #000000",
        }}
      >
        내 랭킹
      </h1>

      {/* 랭킹 리스트 */}
      <div className="flex flex-col gap-1 px-4 mb-4">
        {rankings.map((entry, index) => (
          <div
            key={`${entry.rank}-${index}`}
            className="flex items-center justify-between py-3 px-4 "
            style={{
              borderBottom:
                entry.rank === myRank?.rank
                  ? "none"
                  : "1px solid rgba(156, 163, 175, 0.6)",
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: "14px",
              fontWeight: 400,
              WebkitTextStroke: "1px #000000",
            }}
          >
            {/* 순위 */}
            <div
              className={`${
                entry.rank === myRank?.rank ? "text-[#FDE047]" : "text-white"
              }`}
            >
              {entry.rank}
            </div>

            {/* 사용자명 */}
            <div
              className={`${
                entry.rank === myRank?.rank ? "text-[#FDE047]" : "text-white"
              }`}
            >
              {entry.username}
            </div>

            {/* 점수 */}
            <div
              className={`${
                entry.rank === myRank?.rank ? "text-[#FDE047]" : "text-white"
              }`}
            >
              {formatScore(entry.score)}
            </div>
          </div>
        ))}
      </div>

      {/* 내 랭킹 하단 강조 표시 */}
      {myRank && (
        <div className="mt-6 mx-4 mb-4">
          <div
            className="flex items-center justify-between py-4 px-6 rounded-[20px]"
            style={{
              background: "rgba(0, 94, 170, 0.5)",
              backdropFilter: "blur(10px)",
              boxShadow: "inset 0px 0px 4px 3px rgba(255, 255, 255, 0.6)",
            }}
          >
            <div
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                color: "#FDE047",
                WebkitTextStroke: "1px #000000",
              }}
            >
              {myRank.rank}
            </div>
            <div
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                color: "#FDE047",
                WebkitTextStroke: "1px #000000",
              }}
            >
              {myRank.username}
            </div>
            <div
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                color: "#FDE047",
                WebkitTextStroke: "1px #000000",
              }}
            >
              {formatScore(myRank.score)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewMyRanking;
