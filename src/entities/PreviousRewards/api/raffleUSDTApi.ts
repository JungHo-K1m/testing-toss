// src/entities/PreviousRewards/api/raffleUSDTApi.ts

import api from '@/shared/api/axiosInstance';
import { PlayerData } from '@/features/PreviousRewards/types/PlayerData';

/**
 * USDT 전용 초기 래플 데이터 응답 인터페이스
 */
export interface RaffleInitialUSDTDataResponse {
  myRankings: PlayerData[];
  rankings: PlayerData[];
}

/**
 * /leader/raffle/usdt/initial 엔드포인트에서 USDT 래플 초기 데이터를 조회합니다.
 */
export const fetchInitialRaffleUSDTAPI = async (): Promise<RaffleInitialUSDTDataResponse> => {
  const response = await api.get('/leader/raffle/usdt/initial');
  return response.data.data as RaffleInitialUSDTDataResponse;
};