// src/entities/RewardPage/types/index.ts

export interface RankingAward {
  rangeStart: number;
  rangeEnd: number;
  slRewards: number;
  usdtRewards: number | null;
  round: number;
  nftType: "GOLD" | "SILVER" | "BRONZE" | null;
}

export interface DrawAward {
  rangeStart: number;
  rangeEnd: number;
  slRewards: number | null;
  usdtRewards: number | null;
  round: number;
  nftType: "GOLD" | "SILVER" | "BRONZE" | null;
  rewardType: "SL" | "USDT";
}

export interface AirDropAward {
  winnerNum: number | null;
  slRewards: number;
  usdtRewards?: number | null;
  round: number;
  nftType?: "GOLD" | "SILVER" | "BRONZE" | null;
}

export type Award = RankingAward | DrawAward | AirDropAward;

export interface Rank {
  rank: number;
  star: number;
  ticket: number;
  slToken: number;
  round: number;
  diceRefilledAt: string | null;
}

export interface LeaderHomeData {
  rankingAwards: RankingAward[];
  slDrawAwards: DrawAward[];
  usdtDrawAwards: DrawAward[];
  airDropAwards: AirDropAward[] | null;
  rank: Rank;
}
