import { create } from 'zustand';

interface WalletStore {
  walletAddress: string;
  provider: any;
  walletType: string;
  sdk: any;
  initialized: boolean; // 초기화 여부를 관리하는 boolean
  setWalletAddress: (address: string) => void;
  setProvider: (provider: any) => void;
  setWalletType: (walletType: string) => void;
  setSdk: (sdk: any) => void;
  setInitialized: (initialized: boolean) => void; // 초기화 상태 업데이트 함수
  clearWallet: () => void;
}

const useWalletStore = create<WalletStore>((set) => ({
  walletAddress: "",
  provider: null,
  walletType: "",
  sdk: null,
  initialized: false, // 초기값 false 설정
  setWalletAddress: (address: string) => set({ walletAddress: address }),
  setProvider: (provider: any) => set({ provider }),
  setWalletType: (walletType: string) => set({ walletType }),
  setSdk: (sdk: any) => set({ sdk }),
  setInitialized: (initialized: boolean) => set({ initialized }),
  clearWallet: () => {
    // localStorage에서 지갑 연결 정보 제거
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('isWalletConnected');
    // console.log("[지갑 해제] localStorage 연결 정보 제거 완료");
    
    // Zustand Store 초기화
    set({
      walletAddress: "",
      provider: null,
      walletType: "",
      sdk: null,
      initialized: false, // 초기화 여부도 초기 상태로 리셋
    });
  },
}));

export default useWalletStore;
