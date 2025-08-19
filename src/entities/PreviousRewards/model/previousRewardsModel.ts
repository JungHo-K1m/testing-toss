// src/entities/PreviousRewards/model/previousRewardsModel.ts

import { create } from 'zustand';
import { fetchInitialRankingAPI } from '../api/previousRewardsApi';
import { PlayerData } from '@/features/PreviousRewards/types/PlayerData';

interface PreviousRewardsEntityState {
  myRanking: PlayerData[] | null;
  topRankings: PlayerData[];
  isLoadingInitial: boolean;
  errorInitial: string | null;
  loadInitialRanking: () => Promise<void>;
}

export const usePreviousRewardsEntityStore = create<PreviousRewardsEntityState>((set) => ({
  myRanking: null,
  topRankings: [],
  isLoadingInitial: false,
  errorInitial: null,
  loadInitialRanking: async () => {
    set({ isLoadingInitial: true, errorInitial: null });
    try {
      const { myRanking, rankings } = await fetchInitialRankingAPI();
      // 서버에서 반환된 myRanking이 단일 객체인 경우, 배열로 감싸기
      const wrappedMyRanking = Array.isArray(myRanking) ? myRanking : [myRanking];

      set({
        myRanking: wrappedMyRanking,
        topRankings: rankings,
        isLoadingInitial: false,
        errorInitial: null,
      });
    } catch (error: any) {
      set({
        isLoadingInitial: false,
        errorInitial: error.message || 'Failed to load initial data',
      });
    }
  },
}));
