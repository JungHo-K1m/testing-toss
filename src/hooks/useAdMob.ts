import { useState, useCallback, useEffect, useRef } from 'react';
import { getAdUnitId } from '@/types/adMob';
import { AdMobRewardedAdEvent, ShowAdMobRewardedAdEvent } from '@/types/adMob';
import { getRandomBoxAdReward } from '@/entities/User/api/randomBoxAdReward';

// 광고 상태 타입
export type AdLoadStatus = 'not_loaded' | 'loading' | 'loaded' | 'failed';

// 광고 훅 반환 타입
export interface UseAdMobReturn {
  adLoadStatus: AdLoadStatus;
  loadAd: () => void;
  showAd: () => Promise<any>; // 광고 보상 결과를 반환하도록 수정
  isSupported: boolean;
  autoLoadAd: () => void;
  reloadAd: () => void; // reloadAd 함수 추가
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

  // 광고 로딩 함수
  const loadAd = useCallback(async () => {
    if (!isSupported) {
      console.log('광고가 지원되지 않는 환경입니다');
      return;
    }

    // 이미 로드되고 사용 가능한 상태면 다시 로드하지 않음
    if (adLoadStatus === 'loaded' && isAdReadyRef.current) {
      console.log('이미 로드된 광고가 있습니다');
      return;
    }

    try {
      setAdLoadStatus('loading');
      
      const adUnitId = getAdUnitId();
      console.log('광고 ID:', adUnitId);
      
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
              console.log('광고 닫힘');
              // 광고가 닫혀도 재사용 가능하도록 상태 유지
              setAdLoadStatus('loaded');
              isAdReadyRef.current = true;
              break;
            case 'failedToShow':
              console.log('광고 보여주기 실패');
              setAdLoadStatus('failed');
              isAdReadyRef.current = false;
              adInstanceRef.current = null;
              break;
            case 'impression':
              console.log('광고 노출');
              break;
            case 'show':
              console.log('광고 컨텐츠 보여졌음');
              break;
            case 'userEarnedReward':
              console.log('loadAd: userEarnedReward 이벤트 발생 - 보상 처리 시작');
              
              if (pendingAdPromiseRef.current) {
                console.log('loadAd: 보류 중인 광고 Promise 발견 - 보상 API 호출 시작');
                
                (async () => {
                  try {
                    // 광고 보상 API 호출
                    const rewardData = await getRandomBoxAdReward();
                    console.log('loadAd: 광고 보상 API 응답:', rewardData);
                    console.log('loadAd: rewardData 타입:', typeof rewardData);
                    console.log('loadAd: rewardData.type:', rewardData?.type);
                    console.log('loadAd: rewardData.equipment:', rewardData?.equipment);
                    
                    // 데이터 유효성 검사
                    if (!rewardData || !rewardData.type) {
                      console.error('loadAd: 유효하지 않은 보상 데이터:', rewardData);
                      throw new Error('유효하지 않은 보상 데이터');
                    }
                    
                    console.log('loadAd: 보상 데이터 유효성 검사 통과:', rewardData);
                    
                    // Promise resolve
                    pendingAdPromiseRef.current!.resolve(rewardData);
                    pendingAdPromiseRef.current = null;
                    console.log('loadAd: 광고 Promise resolve 완료');
                    
                    // 보상 결과에 따른 처리
                    if (rewardData.type === 'EQUIPMENT') {
                      console.log('loadAd: 장비 보상 획득!', rewardData.equipment);
                    } else if (rewardData.type === 'DICE') {
                      console.log('loadAd: 주사위 보상 획득!');
                    } else if (rewardData.type === 'SL') {
                      console.log('loadAd: 슬롯 보상 획득!');
                    } else if (rewardData.type === 'NONE') {
                      console.log('loadAd: 보상 없음');
                    } else {
                      console.log('loadAd: 알 수 없는 보상 타입:', rewardData.type);
                    }
                    
                    // 광고 인스턴스는 유지하고 재사용 가능하도록 설정
                    isAdReadyRef.current = true;
                    setAdLoadStatus('loaded');
                  } catch (error: any) {
                    console.error('loadAd: 광고 보상 API 호출 실패:', error);
                    // Promise reject
                    pendingAdPromiseRef.current!.reject(error);
                    pendingAdPromiseRef.current = null;
                    // 오류 발생 시에도 광고를 재사용할 수 있도록 설정
                    isAdReadyRef.current = true;
                    setAdLoadStatus('loaded');
                  }
                })();
              } else {
                console.log('loadAd: 보류 중인 광고 Promise 없음 - 이벤트 무시');
                // Promise가 없어도 광고를 재사용할 수 있도록 설정
                isAdReadyRef.current = true;
                setAdLoadStatus('loaded');
              }
              break;
          }
        },
        onError: (error: unknown) => {
          console.error('광고 불러오기 실패:', error);
          setAdLoadStatus('failed');
          isAdReadyRef.current = false;
          adInstanceRef.current = null; // 광고 인스턴스 정리
        }
      });
      
      // 정리 함수 저장 (cleanup은 함수여야 함)
      cleanupRef.current = cleanup;
      // 광고 인스턴스는 별도로 관리
      adInstanceRef.current = { cleanup, adUnitId };
    } catch (error) {
      console.error('광고 로딩 중 오류:', error);
      setAdLoadStatus('failed');
      isAdReadyRef.current = false;
      adInstanceRef.current = null; // 광고 인스턴스 정리
    }
  }, [isSupported, adLoadStatus]);

  // 광고 표시 함수
  const showAd = useCallback(async () => {
    if (!isSupported) {
      console.log('광고가 지원되지 않는 환경입니다');
      return null;
    }

    // 광고가 로드되고 사용 가능한 상태인지 확인
    if (adLoadStatus !== 'loaded' || !isAdReadyRef.current) {
      console.log('광고가 로드되지 않았거나 사용할 수 없습니다');
      return null;
    }

    if (!adInstanceRef.current) {
      console.log('광고 인스턴스가 없습니다. 다시 로드해주세요.');
      setAdLoadStatus('not_loaded');
      isAdReadyRef.current = false;
      return null;
    }

    try {
      const adUnitId = adInstanceRef.current.adUnitId || getAdUnitId();
      console.log('광고 표시 시작, adUnitId:', adUnitId);
      
      // 광고 표시 시작 시 상태를 'loading'으로 변경하여 중복 사용 방지
      setAdLoadStatus('loading');
      isAdReadyRef.current = false;
      
      return new Promise((resolve, reject) => {
        let isResolved = false;
        
        // 타임아웃 시간을 2분으로 늘림 (광고 시청 시간 고려)
        const timeoutId = setTimeout(() => {
          if (!isResolved) {
            console.log('showAd: 광고 응답 시간 초과 - 타임아웃');
            isResolved = true;
            pendingAdPromiseRef.current = null;
            // 타임아웃 시에도 광고를 재사용할 수 있도록 설정
            isAdReadyRef.current = true;
            setAdLoadStatus('loaded');
            reject(new Error('광고 응답 시간 초과'));
          }
        }, 120000); // 2분 타임아웃
        
        // Promise를 pendingAdPromiseRef에 저장하여 loadAd에서 resolve할 수 있도록 함
        pendingAdPromiseRef.current = { resolve, reject };
        console.log('showAd: 광고 Promise를 pendingAdPromiseRef에 저장');
        
        // 기존 광고 인스턴스를 사용하여 광고 표시
        // loadAd에서 이미 이벤트 핸들러가 연결되어 있으므로
        // 여기서는 Promise만 관리하고 이벤트는 loadAd의 핸들러에서 처리
        
        // 광고 표시 시작
        showAdMobRewardedAd({
          options: { adUnitId },
          onEvent: async (event: ShowAdMobRewardedAdEvent) => {
            console.log('showAd: 광고 표시 이벤트:', event.type);
            
            if (event.type === 'requested') {
              console.log('showAd: 광고 보여주기 요청 완료');
            }
            // userEarnedReward는 loadAd의 이벤트 핸들러에서 처리됨
          },
          onError: (error: unknown) => {
            console.error('showAd: 광고 표시 중 오류:', error);
            if (!isResolved) {
              console.log('showAd: Promise reject - 광고 표시 오류');
              isResolved = true;
              pendingAdPromiseRef.current = null;
              clearTimeout(timeoutId);
              // 오류 발생 시에도 광고를 재사용할 수 있도록 설정
              isAdReadyRef.current = true;
              setAdLoadStatus('loaded');
              reject(error);
            }
          }
        });
      });
    } catch (error) {
      console.error('광고 표시 중 오류:', error);
      // 오류 발생 시에도 광고를 재사용할 수 있도록 설정
      isAdReadyRef.current = true;
      setAdLoadStatus('loaded');
      throw error;
    }
  }, [isSupported, adLoadStatus]);

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
    reloadAd // 새로 추가된 함수
  };
};