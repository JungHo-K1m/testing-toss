// src/entities/RewardPage/model/rewardModel.ts

import { create } from 'zustand';
import { fetchLeaderHomeAPI } from '../api/rewardsAPI';
import { LeaderHomeData, RankingAward, DrawAward } from '../types';

// 리워드 상태 인터페이스
interface RewardState {
  // 랭킹 보상 데이터
  rankingAwards: RankingAward[];
  // SL 토큰 래플 보상 데이터
  slDrawAwards: DrawAward[];
  // USDT 래플 보상 데이터
  usdtDrawAwards: DrawAward[];

  // 사용자 랭크 정보
  rank: {
    rank: number;
    star: number;
    ticket: number;
    slToken: number;
    diceRefilledAt: string | null;
  };

  // 로딩 및 에러 상태
  isLoadingHome: boolean;
  errorHome: string | null;

  // 액션
  fetchLeaderHome: () => Promise<void>;
}

export const useRewardStore = create<RewardState>((set, get) => ({
  // 초기 상태
  rankingAwards: [],
  slDrawAwards: [],
  usdtDrawAwards: [],
  rank: {
    rank: 0,
    star: 0,
    ticket: 0,
    slToken: 0,
    diceRefilledAt: null,
  },
  isLoadingHome: false,
  errorHome: null,

  // 리더 홈 데이터 로드
  fetchLeaderHome: async () => {
    set({ isLoadingHome: true, errorHome: null });
    try {
      // API 호출 (fetchLeaderHomeAPI는 이미 data 필드를 언랩핑하여 반환한다고 가정)
      const data: LeaderHomeData = await fetchLeaderHomeAPI();

      set({
        rankingAwards: data.rankingAwards,
        slDrawAwards: data.slDrawAwards,
        usdtDrawAwards: data.usdtDrawAwards,
        rank: data.rank,
        isLoadingHome: false,
        errorHome: null,
      });
    } catch (error: any) {
      set({
        isLoadingHome: false,
        errorHome: error.message || 'Failed to fetch leader home data',
      });
    }
  },
}));
