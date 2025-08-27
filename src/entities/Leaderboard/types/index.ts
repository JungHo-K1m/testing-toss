// src/entities/Leaderboard/types/index.ts

export interface LeaderBoardEntry {
  name: string;
  starCount: number;
  rank: number;
}

export interface NeighborEntry {
  userId: number;
  name: string;
  starCount: number;
  rank: number;
  me: boolean;
  key: number; // lottery count (key)
}

export interface MyRankData {
  rank: number;
  star: number;
  key: number;
  slToken: number;
  diceRefilledAt: string;
}
  
export interface LeaderTabData {
  myRank: number;
  neighbors: NeighborEntry[];
}
  
export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  offset: number;
  paged: boolean;
  unpaged: boolean;
}
  
export interface LeaderboardPage {
  content: LeaderBoardEntry[];
  pageable: Pageable;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
  