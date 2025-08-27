import { useState, useCallback, useEffect, useRef } from 'react';
import { getAdUnitId } from '@/types/adMob';
import { AdMobRewardedAdEvent, ShowAdMobRewardedAdEvent } from '@/types/adMob';
import { getRandomBoxAdReward } from '@/entities/User/api/randomBoxAdReward';
import { getDiceRefillAdReward } from '@/entities/User/api/AdRefilDice';
import { getRPSRetryAdReward } from '@/entities/User/api/RetryRPS';
import { getCardFlipRetryAdReward } from '@/entities/User/api/RetryCardFlip';

// 광고 상태 타입
export type AdLoadStatus = 'not_loaded' | 'loading' | 'loaded' | 'failed';

// 광고 타입 정의
export type AdType = 'RANDOM_BOX' | 'DICE_REFILL' | 'CARD_FLIP_RETRY' | 'RPS_RETRY';

// 광고 훅 반환 타입
export interface UseAdMobReturn {
  adLoadStatus: AdLoadStatus;
  loadAd: (adType?: AdType) => void;
  showAd: (adType?: AdType) => Promise<any>; // 광고 보상 결과를 반환하도록 수정
  isSupported: boolean;
  autoLoadAd: () => void;
  reloadAd: () => void; // reloadAd 함수 추가
  resetAdInstance: () => void; // 광고 인스턴스 리셋 함수 추가
}

// 광고 지원 여부 확인
const checkAdSupport = async (): Promise<boolean> => {
  try {
    const { GoogleAdMob } = await import('@apps-in-toss/web-framework');
    return GoogleAdMob.loadAdMobRewardedAd.isSupported();
  } catch (error) {
    console.warn('GoogleAdMob을 불러올 수 없습니다:', error);
    return false;
  }
};

// 광고 로딩 함수
const loadAdMobRewardedAd = async (
  params: {
    options: { adUnitId: string };
    onEvent: (event: AdMobRewardedAdEvent) => void;
    onError: (reason: unknown) => void;
  }
): Promise<() => void> => {
  try {
    const { GoogleAdMob } = await import('@apps-in-toss/web-framework');
    return GoogleAdMob.loadAdMobRewardedAd(params);
  } catch (error) {
    console.error('GoogleAdMob 로딩 실패:', error);
    throw error;
  }
};

// 광고 표시 함수
const showAdMobRewardedAd = async (
  params: {
    options: { adUnitId: string };
    onEvent: (event: ShowAdMobRewardedAdEvent) => void;
    onError: (reason: unknown) => void;
  }
): Promise<void> => {
  try {
    const { GoogleAdMob } = await import('@apps-in-toss/web-framework');
    await GoogleAdMob.showAdMobRewardedAd(params);
  } catch (error) {
    console.error('GoogleAdMob 표시 실패:', error);
    throw error;
  }
};

export const useAdMob = (): UseAdMobReturn => {
  const [adLoadStatus, setAdLoadStatus] = useState<AdLoadStatus>('not_loaded');
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const adInstanceRef = useRef<any>(null); // 광고 인스턴스 참조 추가
  const pendingAdPromiseRef = useRef<{ resolve: (value: any) => void; reject: (reason: any) => void } | null>(null); // 보류 중인 광고 Promise 참조 추가
  const isAdReadyRef = useRef<boolean>(false); // 광고가 실제로 사용 가능한지 추적
  const currentAdTypeRef = useRef<AdType | null>(null); // 현재 광고 타입 추적

  // 광고 지원 여부 확인
  useEffect(() => {
    checkAdSupport().then(setIsSupported);
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (cleanupRef.current && typeof cleanupRef.current === 'function') {
        cleanupRef.current();
      }
      // 광고 인스턴스 정리
      if (adInstanceRef.current) {
        adInstanceRef.current = null;
      }
      // 보류 중인 광고 Promise 정리
      if (pendingAdPromiseRef.current) {
        pendingAdPromiseRef.current = null;
      }
      isAdReadyRef.current = false;
    };
  }, []);

  // 광고 타입별 API 호출 함수
  const callAdRewardAPI = async (adType: AdType): Promise<any> => {
    try {
      console.log(`${adType} 광고 보상 API 호출 시작`);
      
      switch (adType) {
        case 'RANDOM_BOX':
          return await getRandomBoxAdReward();
        case 'DICE_REFILL':
          return await getDiceRefillAdReward();
        case 'CARD_FLIP_RETRY':
          // 카드게임 재시도 API 호출 - 매개변수 없이 호출
          return await getCardFlipRetryAdReward();
        case 'RPS_RETRY':
          return await getRPSRetryAdReward();
        default:
          throw new Error(`지원하지 않는 광고 타입: ${adType}`);
      }
    } catch (error) {
      console.error(`${adType} 광고 보상 API 호출 실패:`, error);
      throw error;
    }
  };

  // 광고 로딩 함수
  const loadAd = useCallback(async (adType?: AdType) => {
    if (!isSupported) {
      console.log('광고가 지원되지 않는 환경입니다');
      return;
    }

    // 광고 타입 저장
    if (adType) {
      currentAdTypeRef.current = adType;
    }

    try {
      setAdLoadStatus('loading');
      
      const adUnitId = getAdUnitId();
      console.log('광고 ID:', adUnitId);
      
      // 기존 광고 인스턴스 정리
      if (cleanupRef.current && typeof cleanupRef.current === 'function') {
        cleanupRef.current();
      }
      if (adInstanceRef.current) {
        adInstanceRef.current = null;
      }
      
      // Bedrock 광고 API를 사용하여 광고 로드
      const cleanup = await loadAdMobRewardedAd({
        options: { adUnitId },
        onEvent: async (event: AdMobRewardedAdEvent) => {
          console.log('광고 로딩 이벤트:', event.type);
          
          switch (event.type) {
            case 'loaded':
              console.log('광고 로드 완료');
              setAdLoadStatus('loaded');
              isAdReadyRef.current = true;
              break;
            // ... existing code ...
          }
        },
        onError: (error: unknown) => {
          console.error('광고 불러오기 실패:', error);
          setAdLoadStatus('failed');
          isAdReadyRef.current = false;
          adInstanceRef.current = null;
        }
      });
      
      // 정리 함수 저장
      cleanupRef.current = cleanup;
      adInstanceRef.current = { cleanup, adUnitId };
    } catch (error) {
      console.error('광고 로딩 중 오류:', error);
      setAdLoadStatus('failed');
      isAdReadyRef.current = false;
      adInstanceRef.current = null;
    }
  }, [isSupported]);
  // 광고 표시 함수 수정
  const showAd = useCallback(async (adType: AdType = 'RANDOM_BOX'): Promise<any> => {
    if (!isSupported) {
      throw new Error('광고가 지원되지 않는 환경입니다');
    }

    // 광고 상태 재확인 및 재로드 시도
    if (adLoadStatus !== 'loaded' || !isAdReadyRef.current) {
      console.log('광고 상태 확인 중...', { adLoadStatus, isAdReady: isAdReadyRef.current });
      
      // 광고가 로드 중이거나 실패한 경우 재로드 시도
      if (adLoadStatus === 'failed' || adLoadStatus === 'not_loaded') {
        console.log('광고 재로드 시도...');
        await loadAd(adType);
        
        // 재로드 후 상태 확인
        if ((adLoadStatus as AdLoadStatus) !== 'loaded' || !isAdReadyRef.current) {
          throw new Error('광고 로드에 실패했습니다');
        }
      } else if (adLoadStatus === 'loading') {
        // 로딩 중인 경우 잠시 대기
        console.log('광고 로딩 대기 중...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 대기 후 상태 확인
        if ((adLoadStatus as AdLoadStatus) !== 'loaded' || !isAdReadyRef.current) {
          throw new Error('광고 로딩 시간 초과');
        }
      } else {
        throw new Error('광고가 로드되지 않았습니다');
      }
    }

    return new Promise((resolve, reject) => {
      try {
        console.log(`${adType} 광고 표시 시작`);
        
        // 보류 중인 광고 Promise 참조 저장
        pendingAdPromiseRef.current = { resolve, reject };
        
        // 광고 표시
        showAdMobRewardedAd({
          options: { adUnitId: getAdUnitId() },
          onEvent: (event: ShowAdMobRewardedAdEvent) => {
            console.log('showAd: 광고 이벤트:', event.type);
            
            // 광고 표시 실패 시 즉시 에러 처리
            if ((event.type as any) === 'failedToShow') {
              console.error('showAd: 광고 표시 실패');
              if (pendingAdPromiseRef.current) {
                pendingAdPromiseRef.current.reject(new Error('광고 표시에 실패했습니다'));
                pendingAdPromiseRef.current = null;
              }
            }
          },
          onError: (error: unknown) => {
            console.error('showAd: 광고 표시 중 오류:', error);
            if (pendingAdPromiseRef.current) {
              pendingAdPromiseRef.current.reject(error);
              pendingAdPromiseRef.current = null;
            }
          }
        });
        
        // 타임아웃 설정 (30초)
        const timeoutId = setTimeout(() => {
          if (pendingAdPromiseRef.current) {
            console.error('showAd: 광고 표시 타임아웃');
            pendingAdPromiseRef.current.reject(new Error('광고 표시 시간 초과'));
            pendingAdPromiseRef.current = null;
          }
        }, 30000);

        // 타임아웃 정리 함수 저장
        if (cleanupRef.current) {
          const originalCleanup = cleanupRef.current;
          cleanupRef.current = () => {
            clearTimeout(timeoutId);
            if (typeof originalCleanup === 'function') {
              originalCleanup();
            }
          };
        }
      } catch (error) {
        console.error('showAd: 광고 표시 중 오류:', error);
        reject(error);
      }
    });
  }, [adLoadStatus, isSupported, loadAd]);

  // 광고 시청 완료 후 인스턴스 리셋 함수 추가
  const resetAdInstance = useCallback(() => {
    console.log('광고 인스턴스 리셋 시작');
    
    // 기존 인스턴스 정리
    if (cleanupRef.current && typeof cleanupRef.current === 'function') {
      cleanupRef.current();
    }
    
    // 모든 상태 초기화
    adInstanceRef.current = null;
    isAdReadyRef.current = false;
    setAdLoadStatus('not_loaded');
    
    // 보류 중인 Promise 정리
    if (pendingAdPromiseRef.current) {
      pendingAdPromiseRef.current = null;
    }
    
    console.log('광고 인스턴스 리셋 완료');
  }, []);

  // 광고 재로드 함수 추가
  const reloadAd = useCallback(async () => {
    console.log('광고 재로드 시작');
    // 기존 인스턴스 정리
    if (cleanupRef.current && typeof cleanupRef.current === 'function') {
      cleanupRef.current();
    }
    adInstanceRef.current = null;
    isAdReadyRef.current = false;
    setAdLoadStatus('not_loaded');
    
    // 새로 로드
    await loadAd();
  }, [loadAd]);

  // 자동 광고 로드 함수 (모달 열릴 때 호출)
  const autoLoadAd = useCallback(async () => {
    if (!isSupported) {
      console.log('광고가 지원되지 않는 환경입니다');
      return;
    }

    // 이미 로드되고 사용 가능한 상태면 다시 로드하지 않음
    if ((adLoadStatus === 'loaded' && isAdReadyRef.current) || adLoadStatus === 'loading') {
      return;
    }

    console.log('모달 열림으로 인한 자동 광고 로드 시작');
    await loadAd();
  }, [isSupported, adLoadStatus, loadAd]);

  return {
    adLoadStatus,
    loadAd,
    showAd,
    isSupported,
    autoLoadAd,
    reloadAd, // 새로 추가된 함수
    resetAdInstance // 새로 추가된 함수
  };
};