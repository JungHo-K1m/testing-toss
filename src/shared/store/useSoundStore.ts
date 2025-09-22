// stores/useSoundStore.ts
import { create } from 'zustand';

interface SoundStore {
  // 볼륨 (0 ~ 1)
  bgmVolume: number;
  sfxVolume: number;
  masterVolume: number;

  // 음소거 여부
  bgmMuted: boolean;
  sfxMuted: boolean;
  masterMuted: boolean;

  // 광고 시청 상태
  isAdPlaying: boolean;

  // 액션(업데이트 함수들)
  setBgmVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  setMasterVolume: (volume: number) => void;

  toggleBgmMute: () => void;
  toggleSfxMute: () => void;
  toggleMasterMute: () => void;

  // 광고 상태 관리
  setAdPlaying: (isPlaying: boolean) => void;

  // 사운드 설정 초기화
  initializeSoundSettings: () => void;
  
  // 강제 사운드 재시작 (디버그용)
  forceRestartSound: () => void;
}

export const useSoundStore = create<SoundStore>((set, get) => ({
  // 초기값 설정
  bgmVolume: 0.15,
  sfxVolume: 0.15,
  masterVolume: 0.15,

  bgmMuted: false,
  sfxMuted: false,
  masterMuted: false,

  // 광고 시청 상태 초기값
  isAdPlaying: false,

  // 볼륨 설정
  setBgmVolume: (volume) => set({ bgmVolume: volume }),
  setSfxVolume: (volume) => set({ sfxVolume: volume }),
  setMasterVolume: (volume) => set({ masterVolume: volume }),

  // 음소거 토글
  toggleBgmMute: () => set((state) => ({ bgmMuted: !state.bgmMuted })),
  toggleSfxMute: () => set((state) => ({ sfxMuted: !state.sfxMuted })),
  toggleMasterMute: () => set((state) => ({ masterMuted: !state.masterMuted })),

  // 광고 상태 관리
  setAdPlaying: (isPlaying) => set({ isAdPlaying: isPlaying }),

  // 사운드 설정 초기화 (로컬 스토리지에서 불러오기)
  initializeSoundSettings: () => {
    try {
      const savedSettings = localStorage.getItem('soundSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        set({
          bgmVolume: settings.bgmVolume ?? 0.15,
          sfxVolume: settings.sfxVolume ?? 0.15,
          masterVolume: settings.masterVolume ?? 0.15,
          bgmMuted: settings.bgmMuted ?? false,
          sfxMuted: settings.sfxMuted ?? false,
          masterMuted: settings.masterMuted ?? false,
        });
      }
    } catch (error) {
      console.error('Failed to load sound settings from localStorage:', error);
    }
  },

  // 강제 사운드 재시작 (디버그용)
  forceRestartSound: () => {
    // AudioContext 재활성화 시도 (여러 방법)
    const resumeAudioContext = async () => {
      try {
        let audioContext = null;
        
        // 방법 1: Howler.js의 내부 AudioContext
        if ((window as any).Howl?._howls?.[0]?._sounds?.[0]?._node?.context) {
          audioContext = (window as any).Howl._howls[0]._sounds[0]._node.context;
        }
        
        // 방법 2: Howler.js의 전역 AudioContext
        if (!audioContext && (window as any).Howl?._ctx) {
          audioContext = (window as any).Howl._ctx;
        }
        
        // 방법 3: 새로운 AudioContext 생성
        if (!audioContext && window.AudioContext) {
          audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        if (audioContext && audioContext.state === 'suspended') {
          await audioContext.resume();
        }
      } catch (error) {
        // AudioContext 재활성화 실패 시 무시
      }
    };
    
    resumeAudioContext();
    
    // 상태를 강제로 업데이트하여 useAudioManager의 useEffect를 다시 실행
    const currentState = get();
    set({
      ...currentState,
      bgmVolume: currentState.bgmVolume + 0.001, // 미세한 변화로 리렌더링 트리거
    });
    setTimeout(() => {
      set({
        ...currentState,
        bgmVolume: currentState.bgmVolume, // 원래 값으로 복원
      });
    }, 100);
  },
}));
