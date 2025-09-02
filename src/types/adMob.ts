// 광고 관련 타입 정의
export interface AdMobRewardedAdParams {
  options: {
    adUnitId: string;
  };
  onEvent: (event: AdMobRewardedAdEvent) => void;
  onError: (reason: unknown) => void;
}

export interface AdMobRewardedAdEvent {
  type: 'loaded' | 'clicked' | 'dismissed' | 'failedToShow' | 'impression' | 'show' | 'userEarnedReward';
  data?: any;
}

export interface ShowAdMobRewardedAdParams {
  options: {
    adUnitId: string;
  };
  onEvent: (event: ShowAdMobRewardedAdEvent) => void;
  onError: (reason: unknown) => void;
}

export interface ShowAdMobRewardedAdEvent {
  type: 'requested';
}

export interface RewardedAd {
  adUnitId: string;
  responseInfo: ResponseInfo;
}

export interface ResponseInfo {
  adNetworkInfoArray: Array<AdNetworkResponseInfo>;
  loadedAdNetworkInfo: AdNetworkResponseInfo | null;
  responseId: string | null;
}

export interface AdNetworkResponseInfo {
  adSourceId: string;
  adSourceName: string;
  adSourceInstanceId: string;
  adSourceInstanceName: string;
  adNetworkClassName: string | null;
}

// 광고 타입 정의
export type AdType = 'RANDOM_BOX' | 'DICE_REFILL' | 'CARD_FLIP_RETRY' | 'RPS_RETRY';

// 플랫폼별, 광고 타입별 광고 ID
export const AD_UNIT_IDS = {
  android: {
    RANDOM_BOX: 'ca-app-pub-8316376994464037/9670672503',      // 랜덤박스 광고
    DICE_REFILL: 'ca-app-pub-8316376994464037/9670672503',     // 주사위 리필 광고
    CARD_FLIP_RETRY: 'ca-app-pub-8316376994464037/9670672503', // 카드플립 재시도 광고
    RPS_RETRY: 'ca-app-pub-8316376994464037/9670672503',       // RPS 재시도 광고
  },
  ios: {
    RANDOM_BOX: 'ca-app-pub-8316376994464037/9774614282',      // 랜덤박스 광고
    DICE_REFILL: 'ca-app-pub-8316376994464037/9774614282',     // 주사위 리필 광고
    CARD_FLIP_RETRY: 'ca-app-pub-8316376994464037/9774614282', // 카드플립 재시도 광고
    RPS_RETRY: 'ca-app-pub-8316376994464037/9774614282',       // RPS 재시도 광고
  }
} as const;

// 플랫폼 감지
export const getPlatform = (): 'android' | 'ios' | 'web' => {
  if (typeof window === 'undefined') return 'web';
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (/android/.test(userAgent)) return 'android';
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  return 'web';
};

export const getAdUnitId = (adType: AdType): string => {
  const platform = getPlatform();
  
  if (platform === 'android') {
    return AD_UNIT_IDS.android[adType];
  }
  
  if (platform === 'ios') {
    return AD_UNIT_IDS.ios[adType];
  }
  
  // 웹의 경우 Android ID를 기본값으로 사용
  return AD_UNIT_IDS.android[adType];
};
