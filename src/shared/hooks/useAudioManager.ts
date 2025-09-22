// hooks/useAudioManager.ts
import { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { useSoundStore } from '../store/useSoundStore';

// AudioContext 재활성화를 위한 헬퍼 함수
const resumeAudioContext = async () => {
  try {
    // 여러 방법으로 AudioContext에 접근 시도
    let audioContext = null;
    
    // 방법 1: Howler.js의 내부 AudioContext
    if ((Howl as any)._howls?.[0]?._sounds?.[0]?._node?.context) {
      audioContext = (Howl as any)._howls[0]._sounds[0]._node.context;
    }
    
    // 방법 2: Howler.js의 전역 AudioContext
    if (!audioContext && (Howl as any)._ctx) {
      audioContext = (Howl as any)._ctx;
    }
    
    // 방법 3: Web Audio API의 기본 AudioContext
    if (!audioContext && window.AudioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (audioContext) {
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
    }
  } catch (error) {
    // AudioContext 재활성화 실패 시 무시
  }
};

/**
 * BGM 자동 로드/재생 + zustand(볼륨/뮤트) 연동
 * - 효과음(SFX)에 대해 loop 옵션과 stopSfx를 제공.
 * - loop=false인 경우, 기존처럼 1회성 재생 후 끝.
 * - loop=true인 경우, Map에 Howl을 저장하여 stopSfx로 정지 가능.
 */
export function useAudioManager(bgmSrc: string) {
  const bgmRef = useRef<Howl | null>(null);

  // 루프 SFX를 관리할 Map (src -> Howl)
  const loopSfxMapRef = useRef<Map<string, Howl>>(new Map());

  // zustand에서 가져올 볼륨/뮤트 정보
  const {
    bgmVolume, sfxVolume, masterVolume,
    bgmMuted, sfxMuted, masterMuted,
    isAdPlaying,
  } = useSoundStore();

  // ========== 1) BGM: Howl 인스턴스 생성 및 재생 ==========
  useEffect(() => {
    if (!bgmRef.current) {
      bgmRef.current = new Howl({
        src: [bgmSrc],
        loop: true,
        volume: 0, // 초기 볼륨 0, 아래 useEffect에서 업데이트
        preload: true, // 미리 로드하여 재생 지연 방지
        html5: false, // Web Audio API 사용 (더 안정적)
      });
      
      // BGM 로드 완료 후 자동 재생
      bgmRef.current.on('load', async () => {
        if (bgmRef.current && !isAdPlaying) {
          // AudioContext 재활성화
          await resumeAudioContext();
          
          const finalVolume = (masterMuted || bgmMuted)
            ? 0
            : bgmVolume * masterVolume;
          bgmRef.current.volume(finalVolume);
          bgmRef.current.play();
          
          // 재생 실패 시 재시도
          if (!bgmRef.current.playing()) {
            setTimeout(async () => {
              await resumeAudioContext();
              bgmRef.current?.play();
            }, 100);
          }
        }
      });
      
      
      // 즉시 재생 시도 (로드가 이미 완료된 경우)
      if (bgmRef.current.state() === 'loaded' && !isAdPlaying) {
        // AudioContext 재활성화
        resumeAudioContext().then(() => {
          const finalVolume = (masterMuted || bgmMuted)
            ? 0
            : bgmVolume * masterVolume;
          bgmRef.current!.volume(finalVolume);
          bgmRef.current!.play();
          
          // 재생 실패 시 재시도
          if (!bgmRef.current!.playing()) {
            setTimeout(async () => {
              await resumeAudioContext();
              bgmRef.current?.play();
            }, 100);
          }
        });
      }
    }

    return () => {
      bgmRef.current?.stop();
      bgmRef.current?.unload();
      bgmRef.current = null;
    };
  }, [bgmSrc, masterMuted, bgmMuted, bgmVolume, masterVolume, isAdPlaying]);

  // ========== 1.5) 백그라운드 복귀 시 BGM 재생 ==========
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && bgmRef.current && !isAdPlaying) {
        // 백그라운드에서 복귀하고 광고가 재생 중이 아닐 때 BGM 재생
        const finalVolume = (masterMuted || bgmMuted)
          ? 0
          : bgmVolume * masterVolume;
        
        // 더 강력한 재시작 로직
        const restartBGM = async (attempt = 1) => {
          if (!bgmRef.current) return;
          
          // 1. AudioContext 재활성화
          await resumeAudioContext();
          
          // 2. 볼륨 설정
          bgmRef.current.volume(finalVolume);
          
          // 3. 완전 중지
          bgmRef.current.stop();
          
          // 4. 잠시 대기 후 재생
          await new Promise(resolve => setTimeout(resolve, 150));
          
          // 5. 다시 AudioContext 확인
          await resumeAudioContext();
          
          // 6. 재생 시도
          if (bgmRef.current) {
            bgmRef.current.play();
            
            // 7. 재생 상태 확인
            await new Promise(resolve => setTimeout(resolve, 100));
            const isPlaying = bgmRef.current.playing();
            
            // 8. 재생 실패 시 재시도 (최대 3회)
            if (!isPlaying && attempt < 3) {
              setTimeout(() => restartBGM(attempt + 1), 300);
            }
          }
        };
        
        await restartBGM();
      }
    };

    // 페이지 포커스 이벤트도 추가로 처리
    const handleFocus = async () => {
      if (bgmRef.current && !isAdPlaying) {
        const finalVolume = (masterMuted || bgmMuted)
          ? 0
          : bgmVolume * masterVolume;
        
        // 포커스 시 강력한 재시작 로직
        const restartBGMOnFocus = async (attempt = 1) => {
          if (!bgmRef.current) return;
          
          await resumeAudioContext();
          bgmRef.current.volume(finalVolume);
          bgmRef.current.stop();
          
          await new Promise(resolve => setTimeout(resolve, 150));
          await resumeAudioContext();
          
          if (bgmRef.current) {
            bgmRef.current.play();
            
            await new Promise(resolve => setTimeout(resolve, 100));
            const isPlaying = bgmRef.current.playing();
            
            if (!isPlaying && attempt < 3) {
              setTimeout(() => restartBGMOnFocus(attempt + 1), 300);
            }
          }
        };
        
        await restartBGMOnFocus();
      }
    };

    // 페이지 로드 완료 시에도 재시작 시도
    const handleLoad = () => {
      if (bgmRef.current && !isAdPlaying) {
        const finalVolume = (masterMuted || bgmMuted)
          ? 0
          : bgmVolume * masterVolume;
        
        bgmRef.current.volume(finalVolume);
        
        if (!bgmRef.current.playing()) {
          bgmRef.current.stop();
          setTimeout(() => {
            if (bgmRef.current) {
              bgmRef.current.play();
            }
          }, 100);
        }
      }
    };

    // 사용자 상호작용 시 오디오 재시작 (클릭, 터치 등)
    const handleUserInteraction = async () => {
      if (bgmRef.current && !isAdPlaying && !bgmRef.current.playing()) {
        const finalVolume = (masterMuted || bgmMuted)
          ? 0
          : bgmVolume * masterVolume;
        
        // 사용자 상호작용 시 강력한 재시작
        const restartBGMOnInteraction = async (attempt = 1) => {
          if (!bgmRef.current) return;
          
          await resumeAudioContext();
          bgmRef.current.volume(finalVolume);
          bgmRef.current.stop();
          
          await new Promise(resolve => setTimeout(resolve, 100));
          await resumeAudioContext();
          
          if (bgmRef.current) {
            bgmRef.current.play();
            
            await new Promise(resolve => setTimeout(resolve, 100));
            const isPlaying = bgmRef.current.playing();
            
            if (!isPlaying && attempt < 2) {
              setTimeout(() => restartBGMOnInteraction(attempt + 1), 200);
            }
          }
        };
        
        await restartBGMOnInteraction();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('load', handleLoad);
    
    // 사용자 상호작용 이벤트 리스너 추가
    document.addEventListener('click', handleUserInteraction, { once: false });
    document.addEventListener('touchstart', handleUserInteraction, { once: false });
    document.addEventListener('keydown', handleUserInteraction, { once: false });
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('load', handleLoad);
      
      // 사용자 상호작용 이벤트 리스너 제거
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [masterMuted, bgmMuted, bgmVolume, masterVolume, isAdPlaying]);

  // ========== 2) BGM 볼륨/뮤트 연동 ==========
  useEffect(() => {
    if (bgmRef.current) {
      const finalVolume = (masterMuted || bgmMuted || isAdPlaying)
        ? 0
        : bgmVolume * masterVolume;
      bgmRef.current.volume(finalVolume);
    }
  }, [bgmVolume, bgmMuted, masterVolume, masterMuted, isAdPlaying]);

  // ========== 3) SFX 재생 함수 (loop 옵션 포함) ==========
  function playSfx(sfxSrc: string, options?: { loop?: boolean }) {
    // 광고 시청 중이면 사운드 재생하지 않음
    if (isAdPlaying) {
      return;
    }

    // 최종 볼륨 계산
    const finalVolume = (masterMuted || sfxMuted)
      ? 0
      : sfxVolume * masterVolume;

    // 만약 loop = true라면 무한 반복
    if (options?.loop) {
      // 이미 생성된 Howl이 있는지 확인
      let existingHowl = loopSfxMapRef.current.get(sfxSrc);

      if (!existingHowl) {
        existingHowl = new Howl({
          src: [sfxSrc],
          volume: finalVolume,
          loop: true, // 무한 반복
        });
        loopSfxMapRef.current.set(sfxSrc, existingHowl);
      } else {
        // 기존 인스턴스의 볼륨 업데이트
        existingHowl.volume(finalVolume);
        existingHowl.loop(true);
      }

      // (이미 재생 중이어도) 다시 play() 호출하여 재시작
      existingHowl.stop();
      existingHowl.play();
    }
    //
    // loop = false(또는 undefined)인 경우: 매번 새로 생성 후 1회 재생
    // => 기존 로직과 동일하게 '단발성 효과음'
    else {
      const sfx = new Howl({
        src: [sfxSrc],
        volume: finalVolume,
        loop: false,
      });
      sfx.play();
    }
  }

  // ========== 4) SFX 정지 함수 (loop 사운드 정지 전용) ==========
  function stopSfx(sfxSrc: string) {
    const loopSound = loopSfxMapRef.current.get(sfxSrc);
    if (loopSound) {
      loopSound.stop();
      // 필요하다면 완전히 해제할 수도 있음 (unload)
      // loopSound.unload();
      // loopSfxMapRef.current.delete(sfxSrc);
    }
  }

  // ========== 5) (선택) 볼륨/뮤트 변화 시, 루프 사운드들도 실시간 반영 ==========
  useEffect(() => {
    const finalVolume = (masterMuted || sfxMuted || isAdPlaying)
      ? 0
      : sfxVolume * masterVolume;
    loopSfxMapRef.current.forEach((sound) => {
      sound.volume(finalVolume);
    });
  }, [sfxVolume, masterVolume, sfxMuted, masterMuted, isAdPlaying]);

  // ========== 6) 주기적 BGM 상태 체크 및 자동 복구 ==========
  useEffect(() => {
    const checkBGMStatus = async () => {
      if (bgmRef.current && !isAdPlaying && !masterMuted && !bgmMuted) {
        const isPlaying = bgmRef.current.playing();
        const shouldBePlaying = bgmVolume * masterVolume > 0;
        
        if (shouldBePlaying && !isPlaying) {
          // AudioContext 재활성화
          await resumeAudioContext();
          
          // 볼륨 설정
          const finalVolume = bgmVolume * masterVolume;
          bgmRef.current.volume(finalVolume);
          
          // 재시작
          bgmRef.current.stop();
          setTimeout(async () => {
            if (bgmRef.current) {
              await resumeAudioContext();
              bgmRef.current.play();
            }
          }, 100);
        }
      }
    };

    // 3초마다 상태 체크
    const interval = setInterval(checkBGMStatus, 3000);
    
    return () => {
      clearInterval(interval);
    };
  }, [bgmVolume, masterVolume, bgmMuted, masterMuted, isAdPlaying]);

  return {
    playSfx,
    stopSfx,
  };
}
