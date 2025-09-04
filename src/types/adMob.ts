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

// 플랫폼별, 광고 타입별 광고 ID (환경변수 사용)
export const AD_UNIT_IDS = {
  android: {
    RANDOM_BOX: import.meta.env.VITE_AD_ANDROID_RANDOM_BOX || 'ca-app-pub-8316376994464037/3096004724',
    DICE_REFILL: import.meta.env.VITE_AD_ANDROID_DICE_REFILL || 'ca-app-pub-8316376994464037/2030883800',
    CARD_FLIP_RETRY: import.meta.env.VITE_AD_ANDROID_CARD_FLIP_RETRY || 'ca-app-pub-8316376994464037/7502702330',
    RPS_RETRY: import.meta.env.VITE_AD_ANDROID_RPS_RETRY || 'ca-app-pub-8316376994464037/3884404413',
  },
  ios: {
    RANDOM_BOX: import.meta.env.VITE_AD_IOS_RANDOM_BOX || 'ca-app-pub-8316376994464037/4409086390',
    DICE_REFILL: import.meta.env.VITE_AD_IOS_DICE_REFILL || 'ca-app-pub-8316376994464037/6670349857',
    CARD_FLIP_RETRY: import.meta.env.VITE_AD_IOS_CARD_FLIP_RETRY || 'ca-app-pub-8316376994464037/1711319609',
    RPS_RETRY: import.meta.env.VITE_AD_IOS_RPS_RETRY || 'ca-app-pub-8316376994464037/8676183201',
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
