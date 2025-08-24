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
  showAd: () => void;
  isSupported: boolean;
  autoLoadAd: () => void;
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

  // 광고 지원 여부 확인
  useEffect(() => {
    checkAdSupport().then(setIsSupported);
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  // 광고 로딩 함수
  const loadAd = useCallback(async () => {
    if (!isSupported) {
      console.log('광고가 지원되지 않는 환경입니다');
      return;
    }

    try {
      setAdLoadStatus('loading');
      
      const adUnitId = getAdUnitId();
      console.log('광고 ID:', adUnitId);
      
      const cleanup = await loadAdMobRewardedAd({
        options: { adUnitId },
        onEvent: async (event: AdMobRewardedAdEvent) => {
          console.log('광고 로딩 이벤트:', event.type);
          
          switch (event.type) {
            case 'loaded':
              setAdLoadStatus('loaded');
              break;
            case 'clicked':
              console.log('광고 클릭');
              break;
            case 'dismissed':
              console.log('광고 닫힘');
              setAdLoadStatus('not_loaded');
              break;
            case 'failedToShow':
              console.log('광고 보여주기 실패');
              setAdLoadStatus('failed');
              break;
            case 'impression':
              console.log('광고 노출');
              break;
            case 'show':
              console.log('광고 컨텐츠 보여졌음');
              break;
            case 'userEarnedReward':
              console.log('사용자가 광고 시청을 완료했습니다');
              console.log('광고 보상 API 호출 시작...');
              try {
                // 광고 보상 API 호출
                const rewardData = await getRandomBoxAdReward();
                console.log('광고 보상 API 응답:', rewardData);
                
                // 보상 결과에 따른 처리
                if (rewardData.result === 'EQUIPMENT') {
                  console.log('장비 보상 획득!', rewardData.equipment);
                  // TODO: 장비 획득 로직 추가
                } else if (rewardData.result === 'DICE') {
                  console.log('주사위 보상 획득!');
                  // TODO: 주사위 개수 증가 로직 추가
                } else if (rewardData.result === 'SL') {
                  console.log('슬롯 보상 획득!');
                  // TODO: 슬롯 증가 로직 추가
                } else if (rewardData.result === 'NONE') {
                  console.log('보상 없음');
                }
              } catch (error: any) {
                console.error('광고 보상 API 호출 실패:', error);
                console.error('에러 상세 정보:', {
                  message: error.message,
                  stack: error.stack,
                  response: error.response
                });
              }
              setAdLoadStatus('not_loaded');
              break;
          }
        },
        onError: (error: unknown) => {
          console.error('광고 불러오기 실패:', error);
          setAdLoadStatus('failed');
        }
      });
      
      cleanupRef.current = cleanup;
    } catch (error) {
      console.error('광고 로딩 중 오류:', error);
      setAdLoadStatus('failed');
    }
  }, [isSupported]);

  // 광고 표시 함수
  const showAd = useCallback(async () => {
    if (!isSupported) {
      console.log('광고가 지원되지 않는 환경입니다');
      return;
    }

    if (adLoadStatus !== 'loaded') {
      console.log('광고가 로드되지 않았습니다');
      return;
    }

    try {
      const adUnitId = getAdUnitId();
      console.log('광고 표시 시작, adUnitId:', adUnitId);
      
      await showAdMobRewardedAd({
        options: { adUnitId },
        onEvent: async (event: ShowAdMobRewardedAdEvent) => {
          console.log('광고 표시 이벤트:', event.type);
          
          if (event.type === 'requested') {
            console.log('광고 보여주기 요청 완료');
            setAdLoadStatus('not_loaded');
          } else if (event.type === 'userEarnedReward') {
            console.log('사용자가 광고 시청을 완료했습니다');
            console.log('광고 보상 API 호출 시작...');
            try {
              // 광고 보상 API 호출
              const rewardData = await getRandomBoxAdReward();
              console.log('광고 보상 API 응답:', rewardData);
              
              // 보상 결과에 따른 처리
              if (rewardData.result === 'EQUIPMENT') {
                console.log('장비 보상 획득!', rewardData.equipment);
                // TODO: 장비 획득 로직 추가
              } else if (rewardData.result === 'DICE') {
                console.log('주사위 보상 획득!');
                // TODO: 주사위 개수 증가 로직 추가
              } else if (rewardData.result === 'SL') {
                console.log('슬롯 보상 획득!');
                // TODO: 슬롯 증가 로직 추가
              } else if (rewardData.result === 'NONE') {
                console.log('보상 없음');
              }
            } catch (error: any) {
              console.error('광고 보상 API 호출 실패:', error);
              console.error('에러 상세 정보:', {
                message: error.message,
                stack: error.stack,
                response: error.response
              });
            }
            setAdLoadStatus('not_loaded');
          }
        },
        onError: (error: unknown) => {
          console.error('광고 보여주기 실패:', error);
          setAdLoadStatus('failed');
        }
      });
    } catch (error) {
      console.error('광고 표시 중 오류:', error);
      setAdLoadStatus('failed');
    }
  }, [isSupported, adLoadStatus]);

  // 자동 광고 로드 함수 (모달 열릴 때 호출)
  const autoLoadAd = useCallback(async () => {
    if (!isSupported) {
      console.log('광고가 지원되지 않는 환경입니다');
      return;
    }

    // 이미 로드된 상태면 다시 로드하지 않음
    if (adLoadStatus === 'loaded' || adLoadStatus === 'loading') {
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
    autoLoadAd
  };
};