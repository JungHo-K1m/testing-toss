import { useState, useCallback, useEffect, useRef } from 'react';
import { getAdUnitId, getAdGroupId, AdType, LoadAdMobEvent, ShowAdMobEvent } from '@/types/adMob';
import { getRandomBoxAdReward } from '@/entities/User/api/randomBoxAdReward';
import { getDiceRefillAdReward } from '@/entities/User/api/AdRefilDice';
import { getRPSRetryAdReward } from '@/entities/User/api/RetryRPS';
import { getCardFlipRetryAdReward } from '@/entities/User/api/RetryCardFlip';
import { useSoundStore } from '@/shared/store/useSoundStore';

// 광고 상태 타입
export type AdLoadStatus = 'not_loaded' | 'loading' | 'loaded' | 'failed' | 'cleaning';



// 광고 인스턴스 정보 타입
interface AdInstance {
  cleanup: (() => void) | null;
  adUnitId: string;
  isReady: boolean;
  pendingPromise: {
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    requestData?: Record<string, any>;
  } | null;
  lastAdTime?: number; // 마지막 광고 시청 시간
}

// 광고 타입별 인스턴스 관리 타입
type AdInstances = {
  [K in AdType]: AdInstance;
};

// 광고 훅 반환 타입
export interface UseAdMobReturn {
  // 개별 광고 타입별 상태 및 함수
  getAdStatus: (adType: AdType) => AdLoadStatus;
  loadAd: (adType: AdType) => Promise<void>;
  showAd: (adType: AdType, requestData?: any) => Promise<any>;
  isSupported: boolean;
  autoLoadAd: (adType: AdType) => Promise<void>;
  reloadAd: (adType: AdType) => Promise<void>;
  resetAdInstance: (adType: AdType) => void;
  
  // 전체 광고 관리 함수
  resetAllAdInstances: () => void;
  loadAllAds: () => Promise<void>;
}

// 광고 지원 여부 확인
const checkAdSupport = async (): Promise<boolean> => {
  try {
    const { GoogleAdMob } = await import('@apps-in-toss/web-framework');
    return GoogleAdMob.loadAppsInTossAdMob.isSupported();
  } catch (error) {
    console.warn('GoogleAdMob을 불러올 수 없습니다:', error);
    return false;
  }
};

// 새로운 광고 로딩 함수
const loadAppsInTossAdMob = async (
  params: {
    options: { adGroupId: string };
    onEvent: (event: LoadAdMobEvent) => void;
    onError: (reason: unknown) => void;
  }
): Promise<() => void> => {
  try {
    const { GoogleAdMob } = await import('@apps-in-toss/web-framework');
    return GoogleAdMob.loadAppsInTossAdMob(params);
  } catch (error) {
    console.error('GoogleAdMob 로딩 실패:', error);
    throw error;
  }
};

// 새로운 광고 표시 함수
const showAppsInTossAdMob = async (
  params: {
    options: { adGroupId: string };
    onEvent: (event: ShowAdMobEvent) => void;
    onError: (reason: unknown) => void;
  }
): Promise<void> => {
  try {
    const { GoogleAdMob } = await import('@apps-in-toss/web-framework');
    await GoogleAdMob.showAppsInTossAdMob(params);
  } catch (error) {
    console.error('GoogleAdMob 표시 실패:', error);
    throw error;
  }
};

export const useAdMob = (): UseAdMobReturn => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const { setAdPlaying } = useSoundStore();
  
  // 사운드 제어 상태 추적 (중복 호출 방지)
  const soundControlRef = useRef<{
    isAdPlaying: boolean;
    soundRestartTimeout: ReturnType<typeof setTimeout> | null;
  }>({
    isAdPlaying: false,
    soundRestartTimeout: null,
  });
  
  // 중앙화된 사운드 제어 함수
  const controlAdSound = useCallback((shouldPlay: boolean, delay: number = 0) => {
    // 기존 타임아웃 정리
    if (soundControlRef.current.soundRestartTimeout) {
      clearTimeout(soundControlRef.current.soundRestartTimeout);
      soundControlRef.current.soundRestartTimeout = null;
    }
    
    // 즉시 실행
    if (delay === 0) {
      if (soundControlRef.current.isAdPlaying !== shouldPlay) {
        soundControlRef.current.isAdPlaying = shouldPlay;
        setAdPlaying(shouldPlay);
      }
    } else {
      // 지연 실행
      soundControlRef.current.soundRestartTimeout = setTimeout(() => {
        if (soundControlRef.current.isAdPlaying !== shouldPlay) {
          soundControlRef.current.isAdPlaying = shouldPlay;
          setAdPlaying(shouldPlay);
        }
        soundControlRef.current.soundRestartTimeout = null;
      }, delay);
    }
  }, [setAdPlaying]);
  
  // 광고 타입별 상태 관리
  const [adStatuses, setAdStatuses] = useState<Record<AdType, AdLoadStatus>>({
    RANDOM_BOX: 'not_loaded',
    DICE_REFILL: 'not_loaded',
    CARD_FLIP_RETRY: 'not_loaded',
    RPS_RETRY: 'not_loaded',
  });

  // 광고 타입별 인스턴스 관리
  const adInstancesRef = useRef<AdInstances>({
    RANDOM_BOX: {
      cleanup: null,
      adUnitId: '',
      isReady: false,
      pendingPromise: null,
    },
    DICE_REFILL: {
      cleanup: null,
      adUnitId: '',
      isReady: false,
      pendingPromise: null,
    },
    CARD_FLIP_RETRY: {
      cleanup: null,
      adUnitId: '',
      isReady: false,
      pendingPromise: null,
    },
    RPS_RETRY: {
      cleanup: null,
      adUnitId: '',
      isReady: false,
      pendingPromise: null,
    },
  });

  // 광고 지원 여부 확인
  useEffect(() => {
    checkAdSupport().then(setIsSupported);
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      // 사운드 제어 타임아웃 정리
      if (soundControlRef.current.soundRestartTimeout) {
        clearTimeout(soundControlRef.current.soundRestartTimeout);
      }
      
      // 모든 광고 인스턴스 정리
      Object.values(adInstancesRef.current).forEach(instance => {
        if (instance.cleanup && typeof instance.cleanup === 'function') {
          instance.cleanup();
        }
        instance.cleanup = null;
        instance.isReady = false;
        instance.pendingPromise = null;
      });
    };
  }, []);

  // 광고 타입별 API 호출 함수
  const callAdRewardAPI = async (adType: AdType, requestData?: any): Promise<any> => {
    try {      
      switch (adType) {
        case 'RANDOM_BOX':
          return await getRandomBoxAdReward();
        case 'DICE_REFILL':
          return await getDiceRefillAdReward();
        case 'CARD_FLIP_RETRY':
          if (!requestData) {
            throw new Error('카드플립 재시도에 필요한 데이터가 없습니다');
          }
          return await getCardFlipRetryAdReward(requestData);
        case 'RPS_RETRY':
          if (!requestData) {
            throw new Error('RPS 재시도에 필요한 데이터가 없습니다');
          }
          return await getRPSRetryAdReward(requestData);
        default:
          throw new Error(`지원하지 않는 광고 타입: ${adType}`);
      }
    } catch (error) {
      console.error(`${adType} 광고 보상 API 호출 실패:`, error);
      throw error;
    }
  };

  // 광고 상태 조회 함수
  const getAdStatus = useCallback((adType: AdType): AdLoadStatus => {
    return adStatuses[adType];
  }, [adStatuses]);

  // 광고 로딩 함수 - 광고 타입별로 관리
  const loadAd = useCallback(async (adType: AdType) => {
    if (!isSupported) {
      return;
    }

    const currentStatus = adStatuses[adType];
    
    // 이미 로딩 중이면 중복 실행 방지  
    if (currentStatus === 'loading') {
      return;
    }

    try {
      // 해당 광고 타입의 상태를 loading으로 설정
      setAdStatuses(prev => ({
        ...prev,
        [adType]: 'loading'
      }));
      
      const adGroupId = getAdGroupId(adType);
      
      // 기존 광고 인스턴스 정리
      const instance = adInstancesRef.current[adType];
      if (instance.cleanup && typeof instance.cleanup === 'function') {
        instance.cleanup();
      }
      
      // 새로운 광고 API를 사용하여 광고 로드
      const cleanup = await loadAppsInTossAdMob({
        options: { adGroupId },
        onEvent: async (event: LoadAdMobEvent) => {
          
          switch (event.type) {
            case 'loaded':
              setAdStatuses(prev => ({
                ...prev,
                [adType]: 'loaded'
              }));
              instance.isReady = true;
              break;
          }
        },
        onError: (error: unknown) => {
          console.error(`${adType} 광고 불러오기 실패:`, error);
          setAdStatuses(prev => ({
            ...prev,
            [adType]: 'failed'
          }));
          instance.isReady = false;
        }
      });
      
      // 인스턴스 정보 업데이트
      instance.cleanup = cleanup;
      instance.adUnitId = adGroupId;
      
    } catch (error) {
      console.error(`${adType} 광고 로딩 중 오류:`, error);
      setAdStatuses(prev => ({
        ...prev,
        [adType]: 'failed'
      }));
      adInstancesRef.current[adType].isReady = false;
    }
  }, [isSupported, adStatuses, callAdRewardAPI]);

  // 광고 표시 함수 - 광고 타입별로 관리
  const showAd = useCallback(async (adType: AdType, requestData?: any): Promise<any> => {
    if (!isSupported) {
      throw new Error('광고가 지원되지 않는 환경입니다');
    }
    
    const instance = adInstancesRef.current[adType];
    const currentStatus = adStatuses[adType];
    
    // 광고 시청 간격 체크 (최소 3초 간격)
    const now = Date.now();
    const lastAdTime = instance.lastAdTime || 0;
    if (now - lastAdTime < 3000) {
      throw new Error('광고 시청 간격이 너무 짧습니다. 잠시 후 다시 시도해주세요.');
    }
    

    // 보류 중인 Promise가 있으면 정리
    if (instance.pendingPromise) {
      instance.pendingPromise = null;
    }

    // 광고 상태 재확인 및 재로드 시도
    if (currentStatus !== 'loaded' || !instance.isReady) {
      
      // 광고가 로드 중이거나 실패한 경우 재로드 시도
      if (currentStatus === 'failed' || currentStatus === 'not_loaded') {
        await loadAd(adType);
        
        // 재로드 후 상태 확인 - 최대 3초 대기
        let waitCount = 0;
        while (waitCount < 30) {
          await new Promise(resolve => setTimeout(resolve, 100));
          waitCount++;
          // 현재 상태를 직접 확인하여 클로저 문제 해결
          const currentStatus = adStatuses[adType];
          if (currentStatus === 'loaded' && instance.isReady) {
            break;
          }
        }
        
        // 최종 상태 확인
        if (adStatuses[adType] !== 'loaded' || !instance.isReady) {
          throw new Error(`${adType} 광고 로드에 실패했습니다`);
        }
      } else if (currentStatus === 'loading') {
        // 로딩 중인 경우 최대 3초 대기
        let waitCount = 0;
        while (waitCount < 30) {
          await new Promise(resolve => setTimeout(resolve, 100));
          waitCount++;
          // 현재 상태를 직접 확인하여 클로저 문제 해결
          const currentStatus = adStatuses[adType];
          if (currentStatus === 'loaded' && instance.isReady) {
            break;
          }
        }
        
        // 최종 상태 확인
        if (adStatuses[adType] !== 'loaded' || !instance.isReady) {
          throw new Error(`${adType} 광고 로딩 시간 초과`);
        }
      } else {
        throw new Error(`${adType} 광고가 로드되지 않았습니다`);
      }
    }

    return new Promise((resolve, reject) => {
      try {
        
        // 보류 중인 광고 Promise 참조 저장 (requestData 포함)
        instance.pendingPromise = { resolve, reject, requestData };
        
        // 광고 시청 시작 시간 기록
        instance.lastAdTime = now;
        
        // 광고 표시
        showAppsInTossAdMob({
          options: { adGroupId: getAdGroupId(adType) },
          onEvent: (event: ShowAdMobEvent) => {
            switch (event.type) {
              case 'requested':
                console.log(`${adType} 광고 표시 요청 완료`);
                break;
              case 'clicked':
                console.log(`${adType} 광고 클릭`);
                break;
              case 'dismissed':
                console.log(`${adType} 광고 닫힘`);
                controlAdSound(false);
                resetAdInstance(adType);
                break;
              case 'failedToShow':
                console.log(`${adType} 광고 표시 실패`);
                controlAdSound(false);
                resetAdInstance(adType);
                break;
              case 'impression':
                console.log(`${adType} 광고 노출`);
                break;
              case 'show':
                console.log(`${adType} 광고 컨텐츠 표시`);
                controlAdSound(true);
                break;
              case 'userEarnedReward':
                console.log(`${adType} 광고 보상 획득:`, event.data);
                if (instance.pendingPromise) {
                  // RPS_RETRY와 CARD_FLIP_RETRY는 즉시 API 호출하지 않음
                  if (adType === 'CARD_FLIP_RETRY' || adType === 'RPS_RETRY') {
                    // Promise resolve (requestData 포함하여 전달)
                    const rewardResponse = {
                      type: adType,
                      message: '게임 재시도 기회를 획득했습니다',
                      requestData: instance.pendingPromise.requestData,
                      success: true
                    };
                    
                    instance.pendingPromise.resolve(rewardResponse);
                    instance.pendingPromise = null;
                    
                    // 광고 시청 완료 후 자동으로 인스턴스 정리 (지연)
                    setTimeout(() => {
                      controlAdSound(false);
                      resetAdInstance(adType);
                    }, 2000);
                    return;
                  }

                  // 다른 광고 타입들만 API 호출
                  (async () => {
                    try {
                      // 광고 보상 API 호출
                      const rewardData = await callAdRewardAPI(
                        adType,
                        instance.pendingPromise?.requestData
                      );
                      
                      // Promise resolve
                      if (instance.pendingPromise) {
                        instance.pendingPromise.resolve(rewardData);
                        instance.pendingPromise = null;
                      }
                    } catch (error) {
                      console.error(`❌ ${adType} showAd: 광고 보상 API 호출 실패:`, error);
                      if (instance.pendingPromise) {
                        instance.pendingPromise.reject(error);
                        instance.pendingPromise = null;
                      }
                    }
                  })();
                  
                  // 광고 인스턴스 리셋을 지연시켜 호출 (모달 표시 후)
                  setTimeout(() => {
                    controlAdSound(false);
                    resetAdInstance(adType);
                  }, 2000);
                }
                break;
            }
          },
          onError: (error: unknown) => {
            console.error(`${adType} showAd: 광고 표시 중 오류:`, error);
            
            // 에러 발생 시 사운드 재생
            controlAdSound(false);
            
            // 에러 발생 시 Promise reject
            if (instance.pendingPromise) {
              const errorResponse = {
                type: adType,
                message: '광고 시청에 실패했습니다',
                error: true,
                success: false,
                errorDetails: error
              };
              
              instance.pendingPromise.reject(errorResponse);
              instance.pendingPromise = null;
            }
          }
        });
        
        // 타임아웃 설정을 45초로 설정 (30초 광고 + 여유시간)
        const timeoutId = setTimeout(() => {
          if (instance.pendingPromise) {
            console.error(`${adType} showAd: 광고 표시 타임아웃 (45초)`);
            
            // 타임아웃 시 사운드 재생
            controlAdSound(false);
            
            // 타임아웃 시 적절한 에러 응답 생성
            const timeoutResponse = {
              type: adType,
              message: '광고 시청 시간이 초과되었습니다. 다시 시도해주세요.',
              error: true,
              success: false,
              errorDetails: 'timeout'
            };
            
            instance.pendingPromise.resolve(timeoutResponse);
            instance.pendingPromise = null;
          }
        }, 45000);

        // 타임아웃 정리 함수 저장
        if (instance.cleanup) {
          const originalCleanup = instance.cleanup;
          instance.cleanup = () => {
            clearTimeout(timeoutId);
            if (typeof originalCleanup === 'function') {
              originalCleanup();
            }
          };
        }
      } catch (error) {
        console.error(`${adType} showAd: 광고 표시 중 오류:`, error);
        reject(error);
      }
    });
  }, [isSupported, adStatuses, loadAd]);

  // resetAdInstance 함수 - 광고 타입별로 관리
  const resetAdInstance = useCallback((adType: AdType) => {
    
    const instance = adInstancesRef.current[adType];
    
    // 정리 상태로 설정
    setAdStatuses(prev => ({
      ...prev,
      [adType]: 'cleaning'
    }));
    
    // 기존 인스턴스 정리
    if (instance.cleanup && typeof instance.cleanup === 'function') {
      try {
        instance.cleanup();
      } catch (error) {
        console.error(`❌ ${adType} cleanup 함수 실행 중 오류:`, error);
      }
    }
    
    // 참조 정리
    instance.cleanup = null;
    instance.isReady = false;
    instance.adUnitId = '';
    
    // 보류 중인 Promise 정리
    if (instance.pendingPromise) {
      instance.pendingPromise = null;
    }
    
    // 정리 완료 후 not_loaded 상태로 변경 (약간의 지연을 두어 UI가 정리 상태를 보여줄 수 있도록)
    setTimeout(() => {
      setAdStatuses(prev => ({
        ...prev,
        [adType]: 'not_loaded'
      }));
    }, 500);
  }, []);

  // 광고 재로드 함수 - 광고 타입별로 관리
  const reloadAd = useCallback(async (adType: AdType) => {
    resetAdInstance(adType);
    await loadAd(adType);
  }, [loadAd, resetAdInstance]);

  // 자동 광고 로드 함수 - 광고 타입별로 관리
  const autoLoadAd = useCallback(async (adType: AdType) => {
    if (!isSupported) {
      return;
    }

    const currentStatus = adStatuses[adType];
    const instance = adInstancesRef.current[adType];

    // 이미 로드되고 사용 가능한 상태면 다시 로드하지 않음
    if ((currentStatus === 'loaded' && instance.isReady) || currentStatus === 'loading') {
      return;
    }

    await loadAd(adType);
  }, [isSupported, adStatuses, loadAd]);

  // 모든 광고 인스턴스 리셋
  const resetAllAdInstances = useCallback(() => {
    Object.keys(adInstancesRef.current).forEach(adType => {
      resetAdInstance(adType as AdType);
    });
  }, [resetAdInstance]);

  // 모든 광고 로드
  const loadAllAds = useCallback(async () => {
    const loadPromises = Object.keys(adInstancesRef.current).map(adType => 
      loadAd(adType as AdType)
    );
    await Promise.all(loadPromises);
  }, [loadAd]);

  return {
    getAdStatus,
    loadAd,
    showAd,
    isSupported,
    autoLoadAd,
    reloadAd,
    resetAdInstance,
    resetAllAdInstances,
    loadAllAds,
  };
};