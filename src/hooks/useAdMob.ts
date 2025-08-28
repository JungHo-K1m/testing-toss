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
  showAd: (adType?: AdType, requestData?: any) => Promise<any>;// 광고 보상 결과를 반환하도록 수정
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
  // pendingAdPromiseRef 타입 수정
  const pendingAdPromiseRef = useRef<{ 
    resolve: (value: any) => void; 
    reject: (reason: any) => void;   
    requestData?: Record<string, any>; // requestData 필드 추가
  } | null>(null);
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
  const callAdRewardAPI = async (adType: AdType, requestData?: any): Promise<any> => {
    try {
      console.log(`${adType} 광고 보상 API 호출 시작`, requestData);
      
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

  // 광고 로딩 함수 수정
  const loadAd = useCallback(async (adType?: AdType) => {
    if (!isSupported) {
      console.log('광고가 지원되지 않는 환경입니다');
      return;
    }

    // �� 핵심 수정: 이미 로딩 중이면 중복 실행 방지  
    if (adLoadStatus === 'loading') {
      console.log('이미 광고 로딩 중 - 중복 실행 방지');
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
            case 'clicked':
              console.log('광고 클릭');
              break;
            case 'dismissed':
              console.log('광고 닫힘 - 광고 초기화 시작');
              resetAdInstance(); // 완전한 초기화
              break;
            case 'failedToShow':
              console.log('광고 보여주기 실패 - 광고 초기화 시작');
              resetAdInstance(); // 완전한 초기화
              break;
            case 'impression':
              console.log('광고 노출');
              break;
            case 'show':
              console.log('광고 컨텐츠 보여졌음');
              break;
            case 'userEarnedReward':
              // LoadAd에서 userEarnedReward 이벤트를 처리하여 showAd의 Promise를 resolve
              console.log('loadAd: userEarnedReward 이벤트 발생 - 보상 처리 및 초기화 시작');
              if (pendingAdPromiseRef.current) {
                console.log('loadAd: 보류 중인 광고 Promise 발견 - 보상 API 호출 시작');
                
                // 🔥 핵심 수정: RPS_RETRY와 CARD_FLIP_RETRY는 즉시 API 호출하지 않음
                if (currentAdTypeRef.current === 'CARD_FLIP_RETRY' || currentAdTypeRef.current === 'RPS_RETRY') {
                  console.log(`${currentAdTypeRef.current} 재시도 - 게임 재시도 기회만 제공 (API 호출 없음)`);
                  
                  // Promise resolve (requestData 포함하여 전달)
                  if (pendingAdPromiseRef.current) {
                    const rewardResponse = {
                      type: currentAdTypeRef.current,
                      message: '게임 재시도 기회를 획득했습니다',
                      requestData: pendingAdPromiseRef.current.requestData,
                      success: true
                    };
                    
                    console.log(`${currentAdTypeRef.current} 광고 보상 응답 생성:`, rewardResponse);
                    pendingAdPromiseRef.current.resolve(rewardResponse);
                    pendingAdPromiseRef.current = null;
                  }
                  
                  // 🔥 핵심 수정: 광고 시청 완료 후 자동으로 인스턴스 정리 (즉시)
                  console.log('게임 재시도 광고 시청 완료 후 자동 인스턴스 정리 시작');
                  resetAdInstance();
                  return; // 여기서 함수 종료하여 아래 API 호출 방지
                }

                // 🔥 핵심 수정: 다른 광고 타입들만 API 호출
                (async () => {
                  try {
                    // currentAdTypeRef.current가 제대로 설정되었는지 확인
                    const adType = currentAdTypeRef.current || 'RANDOM_BOX';
                    console.log(`loadAd: ${adType} 광고 보상 API 호출 시작`);
                    
                    // 광고 보상 API 호출
                    const rewardData = await callAdRewardAPI(
                      adType,
                      pendingAdPromiseRef.current?.requestData
                    );
                    console.log('loadAd: 광고 보상 API 응답:', rewardData);
                    console.log('loadAd: rewardData 타입: ', typeof rewardData);
                    console.log('loadAd: rewardData.type:', rewardData?.type);
                    
                    // Promise resolve
                    if (pendingAdPromiseRef.current) {
                      pendingAdPromiseRef.current.resolve(rewardData);
                      pendingAdPromiseRef.current = null;
                    }
                  } catch (error) {
                    console.error('loadAd: 광고 보상 API 호출 실패:', error);
                    if (pendingAdPromiseRef.current) {
                      pendingAdPromiseRef.current.reject(error);
                      pendingAdPromiseRef.current = null;
                    }
                  }
                })();
                
                // 🔥 핵심 수정: 다른 광고 타입들도 광고 시청 완료 후 자동으로 인스턴스 정리
                console.log('일반 광고 시청 완료 후 자동 인스턴스 정리 시작');
                resetAdInstance();
              }
              break;
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
  }, [isSupported, callAdRewardAPI]);

  // 광고 표시 함수 수정 - 광고 타입 설정 개선 및 에러 처리 개선
  const showAd = useCallback(async (adType: AdType = 'RANDOM_BOX', requestData?: any): Promise<any> => {
    if (!isSupported) {
      throw new Error('광고가 지원되지 않는 환경입니다');
    }
    
    // 🔥 핵심 수정: 광고 타입을 명시적으로 설정
    currentAdTypeRef.current = adType;
    console.log(`showAd: 광고 타입 설정됨 - ${adType}`);
    
    // 🔥 핵심 수정: 광고 시청 전 강제 상태 확인
    console.log('광고 시청 전 상태 확인:', { 
      adLoadStatus, 
      isAdReady: isAdReadyRef.current,
      hasPendingPromise: !!pendingAdPromiseRef.current,
      currentAdType: currentAdTypeRef.current
    });

    // 보류 중인 Promise가 있으면 정리
    if (pendingAdPromiseRef.current) {
      console.log('보류 중인 Promise 발견 - 정리 후 진행');
      pendingAdPromiseRef.current = null;
    }

    // 광고 상태 재확인 및 재로드 시도
    if (adLoadStatus !== 'loaded' || !isAdReadyRef.current) {
      console.log('광고 상태 확인 중...', { adLoadStatus, isAdReady: isAdReadyRef.current });
      
      // 광고가 로드 중이거나 실패한 경우 재로드 시도
      if (adLoadStatus === 'failed' || adLoadStatus === 'not_loaded') {
        console.log('광고 재로드 시도...');
        await loadAd(adType);
        
        // 재로드 후 상태 확인 - 최대 5초 대기
        let waitCount = 0;
        while (waitCount < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          waitCount++;
          // 현재 상태 확인 - 타입 단언 사용
          const currentStatus = adLoadStatus;
          if ((currentStatus as any) === 'loaded' && isAdReadyRef.current) {
            break;
          }
        }
        
        // 최종 상태 확인
        if ((adLoadStatus as any) !== 'loaded' || !isAdReadyRef.current) {
          throw new Error('광고 로드에 실패했습니다');
        }
      } else if (adLoadStatus === 'loading') {
        // 로딩 중인 경우 최대 5초 대기
        console.log('광고 로딩 대기 중...');
        let waitCount = 0;
        while (waitCount < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          waitCount++;
          // 현재 상태 확인 - 타입 단언 사용
          const currentStatus = adLoadStatus;
          if ((currentStatus as any) === 'loaded' && isAdReadyRef.current) {
            break;
          }
        }
        
        // 최종 상태 확인
        if ((adLoadStatus as any) !== 'loaded' || !isAdReadyRef.current) {
          throw new Error('광고 로딩 시간 초과');
        }
      } else {
        throw new Error('광고가 로드되지 않았습니다');
      }
    }

    return new Promise((resolve, reject) => {
      try {
        console.log(`${adType} 광고 표시 시작`);
        
        // 보류 중인 광고 Promise 참조 저장 (requestData 포함)
        pendingAdPromiseRef.current = { resolve, reject, requestData };
        
        // 광고 표시
        showAdMobRewardedAd({
          options: { adUnitId: getAdUnitId() },
          onEvent: (event: ShowAdMobRewardedAdEvent) => {
            console.log('showAd: 광고 이벤트:', event.type);
          },
          onError: (error: unknown) => {
            console.error('showAd: 광고 표시 중 오류:', error);
            
            // 🔥 핵심 수정: 에러 발생 시 Promise reject
            if (pendingAdPromiseRef.current) {
              const errorResponse = {
                type: adType,
                message: '광고 시청에 실패했습니다',
                error: true,
                success: false,
                errorDetails: error
              };
              
              console.log('광고 에러 응답 생성:', errorResponse);
              pendingAdPromiseRef.current.reject(errorResponse); // resolve → reject로 변경
              pendingAdPromiseRef.current = null;
            }
          }
        });
        
        // 타임아웃 설정을 90초로 증가
        const timeoutId = setTimeout(() => {
          if (pendingAdPromiseRef.current) {
            console.error('showAd: 광고 표시 타임아웃 (90초)');
            
            // 🔥 핵심 수정: 타임아웃 시 적절한 에러 응답 생성
            const timeoutResponse = {
              type: adType,
              message: '광고 시청 시간이 초과되었습니다. 다시 시도해주세요.',
              error: true,
              success: false,
              errorDetails: 'timeout'
            };
            
            console.log('광고 타임아웃 응답 생성:', timeoutResponse);
            pendingAdPromiseRef.current.resolve(timeoutResponse);
            pendingAdPromiseRef.current = null;
          }
        }, 90000);

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
  
  // resetAdInstance 함수 수정
  const resetAdInstance = useCallback(() => {
    console.log('광고 인스턴스 리셋 시작');
    
    // 기존 인스턴스 정리
    if (cleanupRef.current && typeof cleanupRef.current === 'function') {
      try {
        cleanupRef.current();
        console.log('기존 cleanup 함수 실행 완료');
      } catch (error) {
        console.error('cleanup 함수 실행 중 오류:', error);
      }
    }
    
    // �� 핵심 수정: 상태 변경 순서 조정
    // 1. 먼저 참조 정리
    adInstanceRef.current = null;
    isAdReadyRef.current = false;
    
    // 2. 마지막에 상태 업데이트
    setAdLoadStatus('not_loaded');
    
    // 3. 보류 중인 Promise 정리
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