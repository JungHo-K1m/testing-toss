/** src/pages/RankingRewards/index.tsx */
import React, { useEffect, useState } from "react";
import { TopTitle } from "@/shared/components/ui";
import { useLocation } from "react-router-dom";
import "./PreviousRewards.css";
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";

// Ranking 관련 컴포넌트 및 Zustand 스토어
import RankingSection from "@/widgets/PreviousRewards/ui/RankingSection";
import { usePreviousRewardsEntityStore } from "@/entities/PreviousRewards/model/previousRewardsModel";
import { usePreviousRewardsFeatureStore } from "@/features/PreviousRewards/model/previousRewardsModel";

// 보상 API
import { selectRankingReward } from "@/features/PreviousRewards/api/rewardApi";
import { PlayerData } from "@/features/PreviousRewards/types/PlayerData";

// 임시 인터페이스 (RankingSection에서 사용)
interface RewardData {
  rank: number;
  name: string | null;
  slRewards: number;
  usdtRewards: number;
  round: number;
  nftType: string | null;
  selectedRewardType: string | null;
  itsMe?: boolean;
}

const PreviousRanking: React.FC = () => {
  const { playSfx } = useSound();
  const location = useLocation();
  const round = location.state?.round || 1;

  const { myRanking, topRankings, loadInitialRanking } =
    usePreviousRewardsEntityStore();
  const { dialogRankings, isLoadingRange, rangeError, loadRangeRanking } =
    usePreviousRewardsFeatureStore();

  // 기존 다이얼로그 관련 상태는 더 이상 사용하지 않아 제거 가능
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");

  // 컴포넌트 마운트 시 초기 랭킹 데이터 로딩
  useEffect(() => {
    loadInitialRanking();
  }, [loadInitialRanking]);

  // 범위별 랭킹 모달 열기 (필요시 그대로 사용)
  const handleRangeClick = async (start: number, end: number) => {
    await loadRangeRanking(start, end);
    setDialogTitle(`${start}-${end}`);
    setDialogOpen(true);
  };

  const myData = myRanking && myRanking.length > 0 ? myRanking[0] : null;
  const isReceived = myData?.selectedRewardType === "SL";

  const dialogRankingsPlayerData: PlayerData[] = dialogRankings.map((r) => ({
    ...r,
    nftType: r.nftType ?? null,
    selectedRewardType: r.selectedRewardType ?? null,
  }));

  // 보상 수령 핸들러 (SL 보상만 지원)
  const handleGetReward = async (data: RewardData) => {
    playSfx(Audios.button_click);
    if (data.selectedRewardType !== null) {
      alert("이미 보상을 선택하셨습니다!");
      return;
    }
    // 바로 SL 보상 요청
    await handleSelectRewardType(data);
  };

  // 보상 API 호출 및 Zustand 스토어 업데이트
  const handleSelectRewardType = async (targetData: RewardData) => {
    const updatedData = await selectRankingReward(1, targetData.rank, "SL");
    // Zustand 스토어 업데이트
    usePreviousRewardsEntityStore.setState((state: { myRanking: any; topRankings: any; }) => {
      const newMyRanking = state.myRanking ? [...state.myRanking] : [];
      if (
        newMyRanking.length > 0 &&
        newMyRanking[0].rank === updatedData.rank
      ) {
        newMyRanking[0] = {
          ...newMyRanking[0],
          selectedRewardType: updatedData.selectedRewardType,
        };
      }
      const newTopRankings = [...state.topRankings];
      const idx = newTopRankings.findIndex((r) => r.rank === updatedData.rank);
      if (idx > -1) {
        newTopRankings[idx] = {
          ...newTopRankings[idx],
          selectedRewardType: updatedData.selectedRewardType,
        };
      }
      return {
        myRanking: newMyRanking,
        topRankings: newTopRankings,
      };
    });

    alert("보상을 성공적으로 수령하였습니다!");
  };

  return (
    <div className="flex flex-col mb-44 text-white items-center w-full min-h-screen">
      <TopTitle title="랭킹 어워드" className="px-6" back={true} />

      <RankingSection
        myData={
          myData
            ? {
                ...myData,
                nftType: myData.nftType ?? null,
                selectedRewardType: myData.selectedRewardType ?? null,
                itsMe: myData.itsMe ?? false,
              }
            : null
        }
        topRankings={topRankings.map((r) => ({
          ...r,
          nftType: r.nftType ?? null,
          selectedRewardType: r.selectedRewardType ?? null,
          itsMe: r.itsMe ?? false,
        }))}
        isReceived={isReceived}
        // 기존 onGetReward prop도 보상 버튼 클릭으로 연동 (RankingSection 내에 보상 버튼이 있다면)
        onGetReward={() => {
          if (!myData) return;
          handleGetReward({
            rank: myData.rank,
            name: myData.name,
            slRewards: myData.slRewards ?? 0,
            usdtRewards: myData.usdtRewards ?? 0,
            nftType: myData.nftType ?? null,
            round: myData.round,
            selectedRewardType: myData.selectedRewardType ?? null,
            itsMe: myData.itsMe ?? false,
          });
        }}
        dialogOpen={dialogOpen}
        onDialogOpenChange={setDialogOpen}
        dialogTitle={dialogTitle}
        dialogRankings={dialogRankingsPlayerData}
        isLoadingRange={isLoadingRange}
        rangeError={rangeError}
        handleRangeClick={handleRangeClick}
      />
    </div>
  );
};

export default PreviousRanking;
