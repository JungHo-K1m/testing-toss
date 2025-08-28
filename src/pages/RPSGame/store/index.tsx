// src/pages/RPSGame/store/index.tsx

import { create } from "zustand";
import api from "@/shared/api/axiosInstance";
import { useUserStore } from "@/entities/User/model/userModel";

interface SlotResult {
  userChoice: string;
  computerChoice: string;
}

interface PlayRoundResponse {
  computerChoice: string;
  result: "win" | "lose";
  reward: number;
  rpsId: number;  // ✅ rpsId 추가
}

interface RPSGameState {
  betAmount: number;
  isSpinning: boolean;
  slotResults: SlotResult[];
  isGameStarted: boolean;
  isDialogOpen: boolean;
  gameResult: "win" | "lose" | null;
  lastReward: number;
  rpsId: number;  // ✅ rpsId 추가
  setBetAmount: (amount: number) => void;
  startGame: () => void;
  spin: () => void;
  stopSpin: (userChoice: string, computerChoice: string) => void;
  endGame: () => void;
  openDialog: () => void;
  closeDialog: () => void;
  playRound: (userChoice: string) => Promise<PlayRoundResponse | null>;
  handleRPSGameEnd: (result: "win" | "lose", winnings: number) => void;
  handleRetryGameResult: (result: "win" | "lose", winnings: number) => void; // 재시도 게임용 결과 처리 함수 추가
  setRpsId: (id: number) => void; // rpsId 설정 함수 추가
  resetForRetry: () => void; // 재시도를 위한 상태 리셋 함수 추가
}

export const useRPSGameStore = create<RPSGameState>((set, get) => ({
  betAmount: 0,
  isSpinning: false,
  slotResults: [],
  isGameStarted: false,
  isDialogOpen: false,
  gameResult: null,
  lastReward: 0,
  rpsId: 0,
  
  setBetAmount: (amount: number) => {
    set({ betAmount: amount });
  },

  setRpsId: (id: number) => {
    set({ rpsId: id });
  },

  startGame: () => {
    set({
      isGameStarted: true,
      slotResults: [],
      gameResult: null,
      lastReward: 0,
      isDialogOpen: false, // 게임 시작 시 다이얼로그 닫기
    });
  },

  spin: () => set({ isSpinning: true }),

  stopSpin: (userChoice: string, computerChoice: string) =>
    set((state) => ({
      isSpinning: false,
      slotResults: [...state.slotResults, { userChoice, computerChoice }],
    })),

  endGame: () =>
    set({
      isGameStarted: false,
      betAmount: 0,
      slotResults: [],
      gameResult: null,
      isDialogOpen: false,
      lastReward: 0,
      rpsId: 0, // rpsId도 리셋
    }),

  openDialog: () => set({ isDialogOpen: true }),

  closeDialog: () => set({ isDialogOpen: false }),

  // 🔥 핵심 수정: 재시도를 위한 상태 리셋 함수
  resetForRetry: () => {
    const currentBetAmount = get().betAmount; // 현재 베팅 금액 유지
    set({
      isSpinning: false,
      slotResults: [],
      gameResult: null,
      lastReward: 0,
      isDialogOpen: false,
      // betAmount는 유지 (재시도 시 같은 금액으로 베팅)
      // rpsId는 유지 (재시도 권한 확인용)
    });
  },

  playRound: async (userChoice: string): Promise<PlayRoundResponse | null> => {
    const bettingAmount = get().betAmount;
    if (bettingAmount <= 0) {
      return null;
    }
    try {
      const requestData = {
        bettingAmount: bettingAmount,
        value: userChoice === "rock" ? 1 : userChoice === "paper" ? 2 : 0,
      };
      const response = await api.post("/play-rps", requestData);

      if (response.data.code === "OK") {
        const { reward, result, pcValue, rank, starCount, rpsId } = response.data.data;
        const computerChoice =
          pcValue === 1 ? "rock" : pcValue === 2 ? "paper" : "scissors";

        let winnings = 0;

        if (result === "WIN") {
          winnings = bettingAmount * 3;

          // 서버 응답으로 받은 rank와 starCount를 UserStore에 업데이트
          if (rank !== undefined) {
            useUserStore.getState().setRank(rank);
          }
          if (starCount !== undefined) {
            useUserStore.getState().setStarPoints(starCount);
          } else {
            // starCount가 없는 경우 기존 방식으로 업데이트
            useUserStore
              .getState()
              .setStarPoints(useUserStore.getState().starPoints + winnings);
          }
          set({
            gameResult: "win",
            lastReward: winnings,
            rpsId: rpsId, // rpsId 저장
          });
          // 승리 시 바로 다이얼로그 표시
          setTimeout(() => {
            set({ isDialogOpen: true });
          }, 450);
        } else {
          winnings = -bettingAmount;

          // 서버 응답으로 받은 rank와 starCount를 UserStore에 업데이트
          if (rank !== undefined) {
            useUserStore.getState().setRank(rank);
          }
          if (starCount !== undefined) {
            useUserStore.getState().setStarPoints(starCount);
          } else {
            // starCount가 없는 경우 기존 방식으로 업데이트
            useUserStore
              .getState()
              .setStarPoints(useUserStore.getState().starPoints + winnings);
          }
          set({
            gameResult: "lose",
            lastReward: winnings,
            rpsId: rpsId, // rpsId 저장
          });
          // 패배 시 바로 다이얼로그 표시
          setTimeout(() => {
            set({ isDialogOpen: true });
          }, 450);
        }

        return {
          computerChoice,
          result: result === "WIN" ? "win" : "lose",
          reward: winnings,
          rpsId: rpsId,
        };
      } else {
        return null;
      }
    } catch (error: any) {
      return null;
    }
  },

  handleRPSGameEnd: (result: "win" | "lose", winnings: number) => {
    set({
      isDialogOpen: false,
      isGameStarted: false,
      gameResult: null,
      lastReward: 0,
      slotResults: [],
      betAmount: 0,
      rpsId: 0, // rpsId도 리셋
    });
  },

  // 재시도 게임용 결과 처리 함수 추가
  handleRetryGameResult: (result: "win" | "lose", winnings: number) => {
    set({
      gameResult: result,
      lastReward: winnings,
      isDialogOpen: true, // 결과 다이얼로그 표시
      // 게임 상태는 유지 (isGameStarted, betAmount, rpsId 등)
    });
  },
}));

export default useRPSGameStore;
