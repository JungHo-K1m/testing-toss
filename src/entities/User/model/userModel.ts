// src/entities/User/model/userModel.ts

import { create } from 'zustand';
import { fetchHomeData } from '@/entities/User/api/userApi';
import api from '@/shared/api/axiosInstance';
import { rollDiceAPI, RollDiceResponseData } from '@/features/DiceEvent/api/rollDiceApi';
import { refillDiceAPI } from '@/features/DiceEvent/api/refillDiceApi'; // 분리된 API 함수 임포트
import { autoAPI } from '@/features/DiceEvent/api/autoApi';
import { completeTutorialAPI} from '@/features/DiceEvent/api/completeTutorialApi';
import { useSoundStore } from '@/shared/store/useSoundStore';
import { fetchLeaderTabAPI } from '@/entities/Leaderboard/api/leaderboardAPI';
import { getItemList, InventoryResponse } from '@/entities/User/api/getItemList';

// 팝업 정보 인터페이스 (새로 추가)
interface PopUp {
  id: number;
  title: string;
  content: string;
  url: string | null;
  imgUrl: string | null;
  isOpen: boolean;
}

// 주간 출석 정보 인터페이스
interface WeekAttendance {
  mon: boolean | null;
  tue: boolean | null;
  wed: boolean | null;
  thu: boolean | null;
  fri: boolean | null;
  sat: boolean | null;
  sun: boolean | null;
}

// 사용자 상태 인터페이스
interface UserState {
  // 사용자 관련 상태들
  nickName: string | null;
  setNickName: (nickName: string | null) => void;
  uid: string | null; // number에서 string으로 변경
  setUid: (uid: string | null) => void; // number에서 string으로 변경
  walletAddress: string | null;
  setWalletAddress: (walletAddress: string | null) => void;

  referrerId: string | null; // 추가된 부분: 초대한 친구 아이디
  setReferrerId: (referrerId: string | null) => void; // 추가된 부분

  isAuto: boolean; // 추가된 부분: 오토 여부
  setIsAuto: (isAuto: boolean) => void; // 추가된 부분

  starPoints: number;
  setStarPoints: (value: number | ((prev: number) => number)) => void;

  diceCount: number;
  setDiceCount: (value: number | ((prev: number) => number)) => void;

  lotteryCount: number;
  setLotteryCount: (value: number | ((prev: number) => number)) => void;

  position: number;
  setPosition: (value: number | ((prev: number) => number)) => void;

  userLv: number;
  setUserLv: (userLv: number) => void;

  completeTutorial  : boolean;
  setCompleteTutorial : (completeTutorial : boolean) => void;

  characterType: 'dog' | 'cat' | null; // 수정된 부분: null 허용
  setCharacterType: (type: 'dog' | 'cat' | null) => void; // 수정된 부분: null 허용

  slToken: number;
  setSlToken: (value: number | ((prev: number) => number)) => void;

  rank: number;
  setRank: (rank: number) => void;

  previousRank : number;

  weekAttendance: WeekAttendance;
  setWeekAttendance: (weekAttendance: WeekAttendance) => void;

  currentMiniGame: string;
  setCurrentMiniGame: (game: string) => void;

  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;

  error: string | null;
  setError: (error: string | null) => void;

  // 인증 관련 함수들
  login: (initData: string) => Promise<void>;
  signup: (initData: string, petType: 'DOG' | 'CAT') => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;

  // 사용자 데이터 가져오기
  fetchUserData: () => Promise<void>;

  diceResult: number;
  rollDice: (gauge: number) => Promise<RollDiceResponseData>;

  diceRefilledAt: string | null;
  setDiceRefilledAt: (value: string | null) => void;

  boards: Board[];
  setBoards: (boards: Board[]) => void;

  refillDice: () => Promise<void>;

  pet: Pet; // pet 속성 추가
  setPet: (update: Partial<Pet>) => void; // pet 속성 업데이트 함수 추가

  autoSwitch: () => Promise<void>;

  completeTutorialFunc: () => Promise<void>;

  // 팝업 관련 상태 (새로 추가)
  popUps: PopUp[];
  setPopUps: (popUps: PopUp[]) => void;

  // **추가된 함수들**
  addGoldItem: () => Promise<void>;
  removeGoldItem: () => Promise<void>;
  addSilverItem: () => Promise<void>;
  removeSilverItem: () => Promise<void>;
  addBronzeItem: () => Promise<void>;
  removeBronzeItem: () => Promise<void>;
  addRewardItem: () => Promise<void>;
  removeRewardItem: () => Promise<void>;
  addAutoItem: () => Promise<void>;
  removeAutoItem: () => Promise<void>;
  addAllItems: () => Promise<void>;
  addDice : () => Promise<void>;
  removeDice: () => Promise<void>;
  addSLToken: () => Promise<void>;
  removeSLToken: () => Promise<void>;


  // **추가된 필드: timeZone (null 가능)**
  timeZone: string | null;
  setTimeZone: (timeZone: string | null) => void;

  // **추가된 필드: suspend (boolean)**
  suspend: boolean;
  setSuspend: (suspend: boolean) => void;

  
  redirect: boolean;
  setRedirect: (suspend: boolean) => void;

  fetchLeaderTab: () => Promise<void>

  modalRank: number | null;
  modalPreviousRank: number | null;
  modalStarPoints: number | null;
  modalLotteryCount: number | null;
  modalSlToken: number | null;
  resetModalData: () => void;

  // 장착 아이템 관련 상태 추가
  equippedItems: InventoryResponse | null;
  setEquippedItems: (items: InventoryResponse | null) => void;
  fetchEquippedItems: () => Promise<void>;
}

// 필요한 인터페이스 정의
export interface Board {
  rewardAmount: number | null;
  tileType: 'HOME' | 'REWARD' | 'SPIN' | 'RPS' | 'MOVE' | 'JAIL';
  rewardType: 'STAR' | 'DICE' |  null;
  sequence: number;
  moveType: 'SPIN' | 'RPS' | 'HOME' | 'ANYWHERE' | null;
}

interface Pet {
  type: 'DOG' | 'CAT' | null; // 수정된 부분: null 허용
  level: number | null; // 수정된 부분: null 허용
  exp: number; // 경험치 추가
}

// 사용자 상태를 관리하는 Zustand 스토어 생성
export const useUserStore = create<UserState>((set, get) => ({
  fetchLeaderTab: async () => {
    try {
      const data = await fetchLeaderTabAPI()
      // data: { leaderBoard: [...], myRank: { rank, star, key, slToken, diceRefilledAt } }
      set(state => ({
        // 이전 랭크를 보존해 두었다가 애니메이션에 사용
        previousRank: state.rank,

        // myRank 필드로부터 각 값 갱신
        rank: data.myRank.rank,
        starPoints: data.myRank.star,
        lotteryCount: data.myRank.key,
        slToken: data.myRank.slToken,

        // 모달 데이터도 함께 업데이트
        modalRank: data.myRank.rank,
        modalPreviousRank: state.rank,
        modalStarPoints: data.myRank.star,
        modalLotteryCount: data.myRank.key,
        modalSlToken: data.myRank.slToken,

        // 상위 10명 리스트
        leaderTabData: data.leaderBoard,
      }))
    } catch (err) {
      console.error('fetchLeaderTab error', err)
    }
  },
  
  //타임존 추가
  timeZone: null,
  setTimeZone: (timeZone) => set({ timeZone }),
  
  // suspend 필드 추가 (초기값 false)
  suspend: false,
  setSuspend: (suspend) => set({ suspend }),

  
  redirect: false,
  setRedirect: (redirect) => set({ redirect }),

  // 팝업 상태 추가 (새로 추가)
  popUps: [],
  setPopUps: (popUps) => set({ popUps }),

  pet : {
    type: null,
    level: null,
    exp: 0,
  },
  setPet: (update: Partial<Pet>) =>
    set((state) => ({
      pet: {
        ...state.pet,
        ...update,
      },
    })),

  // 초기 상태 값 설정
   // 새 필드 추가: nickName, uid, walletAddress
   nickName: null,
   setNickName: (nickName) => set({ nickName }),
   uid: null, // string으로 변경
   setUid: (uid) => set({ uid }),
   walletAddress: null,
   // 기존의 setWalletAddress는 walletStore와 혼동되므로, 사용자용 walletAddress도 분리해서 관리합니다.
   setWalletAddress: (walletAddress) => set({ walletAddress }),

  referrerId: null, // 추가된 부분: 초기값 설정
  setReferrerId: (referrerId) => set({ referrerId }), // 추가된 부분

  isAuto: false, // 추가된 부분: 초기값 설정
  setIsAuto: (isAuto: boolean) => set({ isAuto }), // items.autoNftCount 의존성 제거

  position: 0,
  setPosition: (value: number | ((prev: number) => number)) =>
    set((state) => ({
      position: typeof value === 'function' ? value(state.position) : value,
    })),
    
  starPoints: 0,
  setStarPoints: (value: number | ((prev: number) => number)) =>
    set((state) => ({
      starPoints: typeof value === 'function' ? value(state.starPoints) : value,
    })),

  diceCount: 0,
  setDiceCount: (value: number | ((prev: number) => number)) =>
    set((state) => ({
      diceCount: typeof value === 'function' ? value(state.diceCount) : value,
    })),

  lotteryCount: 0,
  setLotteryCount: (value: number | ((prev: number) => number)) =>
    set((state) => ({
      lotteryCount: typeof value === 'function' ? value(state.lotteryCount) : value,
    })),

  userLv: 100,
  setUserLv: (userLv) => set({ userLv }),

  completeTutorial: true,
  setCompleteTutorial: (completeTutorial) => set({ completeTutorial }),

  characterType: null, // 수정된 부분: 초기값을 null로 설정
  setCharacterType: (type) => set({ characterType: type }), // 수정된 부분: null 허용

  slToken: 0,
  setSlToken: (value: number | ((prev: number) => number)) =>
    set((state) => ({
      slToken: typeof value === "function" ? value(state.slToken) : value,
    })),

  rank: 0,
  setRank: (rank) =>
    set((state) => ({
      previousRank: state.rank, // 현재 랭크를 이전 랭크로 저장
      rank, // 새 랭크 업데이트
    })),

  previousRank: 0,

  weekAttendance: {
    mon: null,
    tue: null,
    wed: null,
    thu: null,
    fri: null,
    sat: null,
    sun: null,
  },
  setWeekAttendance: (weekAttendance) => set({ weekAttendance }),

  currentMiniGame: '',
  setCurrentMiniGame: (game) => set({ currentMiniGame: game }),

  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),

  error: null,
  setError: (error) => set({ error }),

  diceResult: 0,
  rollDice: async (gauge: number): Promise<RollDiceResponseData> => {
    set({ isLoading: true, error: null });
  
    const sequence = get().position; // 현재 위치 가져오기
  
    try {
      const data = await rollDiceAPI(gauge, sequence);
  
      // 서버 응답에서 level과 exp를 상태에 직접 설정 (새로운 API 구조에 맞게 수정)
      set((state) =>({
        previousRank: state.rank, // 이전 랭크 저장
        rank: data.rank,
        starPoints: data.star,
        lotteryCount: data.key,        // key에서 key로 변경
        diceCount: data.dice,
        position: data.tileSequence,   // tileSequence로 position 업데이트
        userLv: data.level,            // 레벨 업데이트
        pet: {
          ...get().pet,
          level: data.level,
          exp: data.exp,
        },
        isLoading: false,
        error: null,
      }));
  
      return data; // 데이터를 반환합니다.
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Roll dice failed' });
      throw error;
    }
  },
  

  diceRefilledAt: null,
  setDiceRefilledAt: (value) => set({ diceRefilledAt: value }),

  boards: [],
  setBoards: (boards) => set({ boards }),

  // 사용자 데이터 설정 함수
  fetchUserData: async () => {
    set({ isLoading: true, error: null });
    try {
      let data = await fetchHomeData();
      if (!data || data.data === null) {
        // 응답 객체가 있고, message가 "Please choose your character first."인 경우 바로 에러 발생
        if (data && data.message === "Please choose your character first.") {
          throw new Error(data.message);
        }
      }

      // 서버 응답에서 필요한 데이터 추출 (새로운 구조에 맞게 수정)
      const {
        user,
        nowDice,
        rank,
        pet,
        weekAttendance,
        boards,
        popUps, // 새로 추가
        bgm
      } = data.data;

      // rank 데이터 안전하게 파싱
      const safeRank = rank || {};
      const safeUser = user || {};
      const safeNowDice = nowDice || {};
      const safePet = pet || {};
      const safeWeekAttendance = weekAttendance || {};
      const safeBoards = boards || [];
      const safePopUps = popUps || [];
      const safeBgm = bgm || {};

      set({
        // 사용자 정보
        nickName: safeUser.nickName || null,
        uid: safeUser.uid || null, // string으로 변경
        walletAddress: null, // 백엔드에서 제거됨
        referrerId: safeUser.referrerId || null,
        isAuto: false, // 백엔드에서 제거됨
        completeTutorial: safeUser.completeTutorial || false,
        timeZone: null, // 백엔드에서 제거됨
        suspend: safeUser.suspended || false,
        redirect: safeUser.redirect || false,

        // 게임 진행 상태
        position: safeNowDice.tileSequence || 0,
        diceCount: safeNowDice.dice || 0,
        starPoints: safeRank.star || 0,
        lotteryCount: safeRank.key || 0,
        userLv: safePet.level || 1,
        characterType: safePet.type ? safePet.type.toLowerCase() as 'dog' | 'cat' : null,

        slToken: 0, // 백엔드에서 제거됨
        rank: safeRank.rank || 0,
        previousRank: safeRank.rank || 0,
        diceRefilledAt: safeRank.diceRefilledAt || null,

        // 게임 보드 및 출석
        boards: safeBoards,
        weekAttendance: {
          mon: safeWeekAttendance.mon || null,
          tue: safeWeekAttendance.tue || null,
          wed: safeWeekAttendance.wed || null,
          thu: safeWeekAttendance.thu || null,
          fri: safeWeekAttendance.fri || null,
          sat: safeWeekAttendance.sat || null,
          sun: safeWeekAttendance.sun || null,
        },

        // 펫 정보
        pet: {
          type: safePet.type ? safePet.type.toLowerCase() as 'DOG' | 'CAT' : null,
          level: safePet.level || 1,
          exp: safePet.exp || 0,
        },

        // 팝업 정보 (새로 추가)
        popUps: safePopUps,

        isLoading: false,
        error: null,
      });

      // 사운드 설정 (안전하게 처리)
      try {
        const soundStore = useSoundStore.getState();

        if (safeBgm.masterVolume !== undefined) {
          soundStore.setMasterVolume((safeBgm.masterVolume / 10) * 0.3);
        }
        if (safeBgm.backVolume !== undefined) {
          soundStore.setBgmVolume((safeBgm.backVolume / 10) * 0.3);
        }
        if (safeBgm.effectVolume !== undefined) {
          soundStore.setSfxVolume((safeBgm.effectVolume / 10) * 0.3);
        }

        useSoundStore.setState({
          masterMuted: safeBgm.masterMute || false,
          bgmMuted: safeBgm.backMute || false,
          sfxMuted: safeBgm.effectMute || false,
        });
      } catch (soundError) {
        console.warn('Sound settings failed:', soundError);
      }

    } catch (error: any) {
      // error.response.data.message가 있으면 그 값을 사용
      const errorMessage = error.response?.data?.message || error.message;
      // console.error('fetchUserData 실패:', errorMessage);
      set({ isLoading: false, error: errorMessage });
      // 새로운 에러 객체를 던져서 error.message에 원하는 메시지가 포함되도록 함
      throw new Error(errorMessage);
    }
  },
  

  // 로그인 함수
  login: async (initData: string): Promise<void> => {
    // console.log('Step: login 시작, initData:', initData);
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { initData });

      if (response.data.code === 'OK') {
        const { userId, accessToken, refreshToken } = response.data.data;
        // console.log('Step: login 성공, userId:', userId);
        // 토큰 및 userId 저장
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({  });

        // 사용자 데이터 가져오기
        await get().fetchUserData();
        set({ isLoading: false, error: null });
      } else if (response.data.code === 'ENTITY_NOT_FOUND') {
        // console.warn('Step: login 응답 코드 ENTITY_NOT_FOUND:', response.data.message);
        throw new Error(response.data.message || 'User not found');
      } else {
        // console.warn('Step: login 응답 코드가 OK가 아님:', response.data.message);
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      // console.error('Step: login 실패:', error);
      let errorMessage = 'Login failed. Please try again.';
      if (error.response) {
        // 서버가 응답을 했지만, 상태 코드가 2xx가 아닌 경우
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        // 요청이 이루어졌으나, 응답을 받지 못한 경우
        errorMessage = 'No response from server. Please try again later.';
      } else {
        // 다른 에러
        errorMessage = error.message;
      }
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage); // 에러를 다시 던져 호출한 쪽에서 인지할 수 있도록 함
    }
  },

  // 회원가입 함수
  signup: async (initData: string, petType: 'DOG' | 'CAT'): Promise<void> => {
    // console.log('Step: signup 시작, initData:', initData, 'petType:', petType);
    set({ isLoading: true, error: null });
    try {
      // 회원가입 요청 보내기
      await api.post('/auth/signup', { initData, petType });

      set({ isLoading: false, error: null });
    } catch (error: any) {
      // console.error('Step: signup 실패:', error);
      let errorMessage = 'Signup failed. Please try again.';
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'No response from server. Please try again later.';
      } else {
        errorMessage = error.message;
      }
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage); // 에러를 다시 던져 호출한 쪽에서 인지할 수 있도록 함
    }
  },

  // 로그아웃 함수
  logout: () => {
    // console.log('Step: logout 실행. 토큰 및 userId 제거 및 상태 초기화.');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken'); // 추가된 부분: refreshToken 제거
    set({
      nickName: null,
      uid: null,
      walletAddress: null,
      referrerId: null, // 추가된 부분: referrerId 초기화
      isAuto: false, // 추가된 부분: isAuto 초기화
      timeZone: null,
      suspend: false, // 추가된 부분: suspend 초기화
      redirect:false,
      position: 0,
      diceCount: 0,
      starPoints: 0,
      lotteryCount: 0,
      userLv: 100,
      characterType: null, // 수정된 부분: characterType 초기화
      slToken: 0,
      rank: 0,
      weekAttendance: {
        mon: null,
        tue: null,
        wed: null,
        thu: null,
        fri: null,
        sat: null,
        sun: null,
      },
      currentMiniGame: '',
      isLoading: false,
      error: null,
      boards: [],
      popUps: [], // 새로 추가
    });
  },

  // 토큰 갱신 함수
  refreshToken: async (): Promise<boolean> => {
    // console.log('Step: refreshToken 시작');
    try {
      const response = await api.get('/auth/refresh');
      // console.log('Step: refreshToken 응답:', response);
  
      const newAccessToken = response.headers['authorization'];
      if (newAccessToken) {
        localStorage.setItem('accessToken', newAccessToken.replace('Bearer ', ''));
        // console.log('Step: 새로운 accessToken 저장 완료');
        return true;
      } else {
        // console.warn('Step: Authorization 헤더가 없습니다.');
        throw new Error('Token refresh failed: Authorization header is missing');
      }
    } catch (error: any) {
      // console.error('Step: refreshToken 실패:', error);
      // Refresh 실패 시 로그아웃 처리
      get().logout();
      set({ error: 'Token refresh failed. Please log in again.' });
      return false;
    }
  },  

  refillDice: async () => {
    set({ error: null });
    try {
      const data = await refillDiceAPI();

      const { nowDice, rank }  = data;
      
      // 주사위 리필 후 diceCount만 업데이트
      set({
        diceCount: nowDice.dice,
        diceRefilledAt: rank.diceRefilledAt,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      // console.error('주사위 리필 중 에러 발생:', error);
      set({ error: error.message || '주사위 리필에 실패했습니다.' });
      throw error; 
    }
  },

  
  autoSwitch: async () => {
    set({ error: null });
    try {
      const data = await autoAPI();

      const { isAuto }  = data;
    
      set({
        isAuto
      });
  
      // console.log('스위치 변경 성공:', data);
    } catch (error: any) {
      // console.error('스위치 변경 중 에러 발생:', error);
      set({ error: error.message || '스위치 변경에 실패했습니다.' });
      throw error; 
    }
  },

  completeTutorialFunc: async () => {
    set({ error: null });
    try {
      const data = await completeTutorialAPI();

      const { completeTutorial }  = data;
    
      set({
        completeTutorial
      });
  
      // console.log('튜토리얼 완료:', data);
    } catch (error: any) {
      // console.error('튜토리얼 중 에러 발생:', error);
      set({ error: error.message || '튜토리얼에 실패했습니다.' });
      throw error; 
    }
  },


  
    

   // 테스트용 아이템 추가 함수들 (백엔드에서 items가 제거되어 주석 처리)
   addGoldItem: async () => {
    console.warn('addGoldItem: 백엔드에서 items 필드가 제거되어 사용할 수 없습니다.');
    // try {
    //   const response = await api.get('/test/items/gold');
    //   if (response.data.code === 'OK') {
    //     set({ items: response.data.data });
    //     // console.log('골드 아이템 추가 성공:', response.data.data);
    //   } else {
    //     throw new Error(response.data.message || '골드 아이템 추가 실패');
    //   }
    // } catch (error: any) {
    //   // console.error('골드 아이템 추가 실패:', error);
    //   set({ error: error.message || '골드 아이템 추가에 실패했습니다.' });
    //   throw error;
    // }
   },

  removeGoldItem: async () => {
    console.warn('removeGoldItem: 백엔드에서 items 필드가 제거되어 사용할 수 없습니다.');
  },

  addSilverItem: async () => {
    console.warn('addSilverItem: 백엔드에서 items 필드가 제거되어 사용할 수 없습니다.');
  },

  removeSilverItem: async () => {
    console.warn('removeSilverItem: 백엔드에서 items 필드가 제거되어 사용할 수 없습니다.');
  },

  addBronzeItem: async () => {
    console.warn('addBronzeItem: 백엔드에서 items 필드가 제거되어 사용할 수 없습니다.');
  },

  removeBronzeItem: async () => {
    console.warn('removeBronzeItem: 백엔드에서 items 필드가 제거되어 사용할 수 없습니다.');
  },

  addRewardItem: async () => {
    console.warn('addRewardItem: 백엔드에서 items 필드가 제거되어 사용할 수 없습니다.');
  },

  removeRewardItem: async () => {
    console.warn('removeRewardItem: 백엔드에서 items 필드가 제거되어 사용할 수 없습니다.');
  },

  addAutoItem: async () => {
    console.warn('addAutoItem: 백엔드에서 items 필드가 제거되어 사용할 수 없습니다.');
  },

  removeAutoItem: async () => {
    console.warn('removeAutoItem: 백엔드에서 items 필드가 제거되어 사용할 수 없습니다.');
  },

  addAllItems: async () => {
    console.warn('addAllItems: 백엔드에서 items 필드가 제거되어 사용할 수 없습니다.');
  },

  addDice : async () => {
    console.warn('addDice: 백엔드에서 items 필드가 제거되어 사용할 수 없습니다.');
  },

  removeDice: async () => {
    console.warn('removeDice: 백엔드에서 items 필드가 제거되어 사용할 수 없습니다.');
  },

  addSLToken: async () => {
    console.warn('addSLToken: 백엔드에서 items 필드가 제거되어 사용할 수 없습니다.');
  },

  removeSLToken: async () => {
    console.warn('removeSLToken: 백엔드에서 items 필드가 제거되어 사용할 수 없습니다.');
  },

  modalRank: null,
  modalPreviousRank: null,
  modalStarPoints: null,
  modalLotteryCount: null,
  modalSlToken: null,
  resetModalData: () => {
    set({
      modalRank: null,
      modalPreviousRank: null,
      modalStarPoints: null,
      modalLotteryCount: null,
      modalSlToken: null,
    });
  },

  // 장착 아이템 관련 상태 추가
  equippedItems: null,
  setEquippedItems: (items) => set({ equippedItems: items }),
  fetchEquippedItems: async () => {
    try {
      const data = await getItemList();
      set({ equippedItems: data });
    } catch (err) {
      console.error('fetchEquippedItems error', err);
    }
  },
}));
