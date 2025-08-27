import React, { useState, useEffect } from "react";
import { useUserStore } from '@/entities/User/model/userModel';
import LoadingSpinner from "@/shared/components/ui/loadingSpinner";
import { NeighborEntry } from '@/entities/Leaderboard/types';

interface RankingEntry {
  rank: number;
  username: string;
  score: number;
  key: number; // lottery count 추가
}

const NewMyRanking: React.FC = () => {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [myRank, setMyRank] = useState<RankingEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchLeaderTab, leaderTabData } = useUserStore();

  // 모달 오픈 시마다 최신 랭크 가져오기
  useEffect(() => {
    fetchLeaderTab();
  }, [fetchLeaderTab]);

  // API 응답 데이터를 기반으로 랭킹 데이터 처리
  useEffect(() => {
    if (leaderTabData && leaderTabData.neighbors) {
      const neighbors = leaderTabData.neighbors;
      
      // 내 랭킹 찾기
      const myNeighbor = neighbors.find(neighbor => neighbor.me);
      if (myNeighbor) {
        const myRankData: RankingEntry = {
          rank: myNeighbor.rank,
          username: myNeighbor.name,
          score: myNeighbor.starCount, // neighbors에서 가져온 starCount 사용
          key: myNeighbor.key, // neighbors에서 가져온 key 사용
        };
        setMyRank(myRankData);

        // neighbors 리스트를 RankingEntry 형태로 변환
        const rankingEntries: RankingEntry[] = neighbors.map((neighbor: NeighborEntry) => ({
          rank: neighbor.rank,
          username: neighbor.name,
          score: neighbor.starCount,
          key: neighbor.key,
        }));

        // 순위별로 정렬
        rankingEntries.sort((a, b) => a.rank - b.rank);
        setRankings(rankingEntries);
      }
      
      setIsLoading(false);
    }
  }, [leaderTabData]);

  const formatScore = (score: number): string => {
    return score.toLocaleString();
  };

  if (isLoading) {
    return <LoadingSpinner className="h-screen" />;
  }

  // 데이터가 없는 경우 처리
  if (!rankings.length || !myRank) {
    return (
      <div className="flex flex-col md:px-0 mb-44 w-full mt-7 rounded-[25px] text-white text-center py-8"
        style={{
          background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
          boxShadow:
            "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
        }}>
        <h1 className="mb-6 text-center mt-5"
          style={{
            fontFamily: "'ONE Mobile POP', sans-serif",
            fontSize: "24px",
            fontWeight: 400,
            color: "#FFFFFF",
            WebkitTextStroke: "1px #000000",
          }}>
          내 랭킹
        </h1>
        <p>랭킹 데이터를 불러올 수 없습니다.</p>
      </div>
    );
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
