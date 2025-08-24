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
}

// 광고 지원 여부 확인 (실제 구현에서는 @apps-in-toss/framework의 GoogleAdMob 사용)
const checkAdSupport = (): boolean => {
  // 실제 구현에서는 다음과 같이 사용:
  // import { GoogleAdMob } from '@apps-in-toss/framework';
  // return GoogleAdMob.loadAdMobRewardedAd.isSupported();
  
  // 현재는 웹 환경에서 테스트할 수 있도록 true 반환
  return true;
};

// 광고 로딩 함수 (실제 구현에서는 @apps-in-toss/framework의 GoogleAdMob 사용)
const loadAdMobRewardedAd = async (
  params: {
    options: { adUnitId: string };
    onEvent: (event: AdMobRewardedAdEvent) => void;
    onError: (reason: unknown) => void;
  }
): Promise<() => void> => {
  // 실제 구현에서는 다음과 같이 사용:
  // import { GoogleAdMob } from '@apps-in-toss/framework';
  // return GoogleAdMob.loadAdMobRewardedAd(params);
  
  // 현재는 시뮬레이션을 위한 더미 구현
  console.log('광고 로딩 시작:', params.options.adUnitId);
  
  // 광고 로딩 시뮬레이션 (2초 후 로드 완료)
  setTimeout(() => {
    params.onEvent({ type: 'loaded', data: { adUnitId: params.options.adUnitId } });
  }, 2000);
  
  // 클린업 함수 반환
  return () => {
    console.log('광고 로딩 정리');
  };
};

// 광고 표시 함수 (실제 구현에서는 @apps-in-toss/framework의 GoogleAdMob 사용)
const showAdMobRewardedAd = async (
  params: {
    options: { adUnitId: string };
    onEvent: (event: ShowAdMobRewardedAdEvent) => void;
    onError: (reason: unknown) => void;
  }
): Promise<void> => {
  // 실제 구현에서는 다음과 같이 사용:
  // import { GoogleAdMob } from '@apps-in-toss/framework';
  // await GoogleAdMob.showAdMobRewardedAd(params);
  
  // 현재는 시뮬레이션을 위한 더미 구현
  console.log('광고 표시 시작:', params.options.adUnitId);
  
  // 광고 표시 시뮬레이션
  params.onEvent({ type: 'requested' });
  
  // 광고 시청 완료 시뮬레이션 (5초 후)
  setTimeout(() => {
    console.log('사용자가 광고 시청을 완료했습니다');
  }, 5000);
};

export const useAdMob = (): UseAdMobReturn => {
  const [adLoadStatus, setAdLoadStatus] = useState<AdLoadStatus>('not_loaded');
  const [isSupported] = useState<boolean>(checkAdSupport());
  const cleanupRef = useRef<(() => void) | null>(null);

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
        onEvent: async (event) => {
          console.log('광고 이벤트:', event.type);
          
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
                try {
                  // 광고 보상 API 호출
                  const rewardData = await getRandomBoxAdReward();
                  console.log('광고 보상 API 응답:', rewardData);
                  
                  // 보상 결과에 따른 처리
                  if (rewardData.randomBox.result === 'DICE') {
                    console.log('주사위 보상 획득!');
                    // TODO: 주사위 개수 증가 로직 추가
                  } else if (rewardData.randomBox.result === 'EQUIPMENT') {
                    console.log('장비 보상 획득!', rewardData.randomBox.equipment);
                    // TODO: 장비 획득 로직 추가
                  } else if (rewardData.randomBox.result === 'SL') {
                    console.log('슬롯 보상 획득!');
                    // TODO: 슬롯 증가 로직 추가
                  } else {
                    console.log('보상 없음');
                  }
                } catch (error) {
                  console.error('광고 보상 API 호출 실패:', error);
                  // 에러 처리: 사용자에게 알림 등
                }
                setAdLoadStatus('not_loaded');
                break;
            }
        },
        onError: (error) => {
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
      
      await showAdMobRewardedAd({
        options: { adUnitId },
        onEvent: (event) => {
          if (event.type === 'requested') {
            console.log('광고 보여주기 요청 완료');
            setAdLoadStatus('not_loaded');
          }
        },
        onError: (error) => {
          console.error('광고 보여주기 실패:', error);
          setAdLoadStatus('failed');
        }
      });
    } catch (error) {
      console.error('광고 표시 중 오류:', error);
      setAdLoadStatus('failed');
    }
  }, [isSupported, adLoadStatus]);

  return {
    adLoadStatus,
    loadAd,
    showAd,
    isSupported
  };
};
