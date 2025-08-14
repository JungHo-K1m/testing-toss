// src/features/PreviousRewards/types/PlayerData.ts

export interface PlayerData {
  name: string | null;
  rank: number;
  slRewards: number;
  usdtRewards: number;
  round: number;
  nftType: string | null;
  selectedRewardType: string | null; // 반드시 null 또는 string
  itsMe?: boolean; 
}
