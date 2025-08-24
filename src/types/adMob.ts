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

// 플랫폼별 광고 ID
export const AD_UNIT_IDS = {
  android: 'ca-app-pub-8316376994464037/9670672503',
  ios: 'ca-app-pub-8316376994464037/9774614282'
} as const;

// 플랫폼 감지
export const getPlatform = (): 'android' | 'ios' | 'web' => {
  if (typeof window === 'undefined') return 'web';
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (/android/.test(userAgent)) return 'android';
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  return 'web';
};

export const getAdUnitId = (): string => {
  const platform = getPlatform();
  if (platform === 'android') return AD_UNIT_IDS.android;
  if (platform === 'ios') return AD_UNIT_IDS.ios;
  return AD_UNIT_IDS.android; // 웹의 경우 기본값
};
