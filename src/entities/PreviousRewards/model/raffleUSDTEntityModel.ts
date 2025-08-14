// src/entities/PreviousRewards/model/raffleUSDTEntityModel.ts

import create from 'zustand';
import { fetchInitialRaffleUSDTAPI, RaffleInitialUSDTDataResponse } from '../api/raffleUSDTApi';
import { PlayerData } from '@/features/PreviousRewards/types/PlayerData';

/**
 * USDT 전용 래플 엔티티 스토어 상태 인터페이스
 */
interface RaffleUSDTEntityState {
  myRankings: PlayerData[] | null;
  topRankings: PlayerData[];
  isLoadingInitialUSDT: boolean;
  errorInitialUSDT: string | null;
  hasLoadedInitialUSDT: boolean;
  loadInitialUSDT: () => Promise<void>;
}

/**
 * USDT 전용 래플 상태 관리를 위한 Zustand 스토어
 */
export const useRaffleUSDTEntityStore = create<RaffleUSDTEntityState>((set) => ({
  myRankings: null,
  topRankings: [],
  isLoadingInitialUSDT: false,
  errorInitialUSDT: null,
  hasLoadedInitialUSDT: false,

  /**
   * USDT 래플 초기 데이터를 로드합니다.
   */
  loadInitialUSDT: async () => {
    set({ isLoadingInitialUSDT: true, errorInitialUSDT: null });
    try {
      const data: RaffleInitialUSDTDataResponse = await fetchInitialRaffleUSDTAPI();
      set({
        myRankings: data.myRankings,
        topRankings: data.rankings,
        isLoadingInitialUSDT: false,
        errorInitialUSDT: null,
        hasLoadedInitialUSDT: true,
      });
    } catch (error: any) {
      set({
        isLoadingInitialUSDT: false,
        errorInitialUSDT: error.message || 'Failed to load initial USDT raffle data',
        hasLoadedInitialUSDT: true,
      });
    }
  },
}));
