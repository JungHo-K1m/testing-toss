// 새로운 광고 API 타입 정의
export interface LoadAdMobParams {
  options: {
    adGroupId: string;
  };
  onEvent: (event: LoadAdMobEvent) => void;
  onError: (reason: unknown) => void;
}

export interface LoadAdMobEvent {
  type: 'loaded';
  data?: any;
}

export interface ShowAdMobParams {
  options: {
    adGroupId: string;
  };
  onEvent: (event: ShowAdMobEvent) => void;
  onError: (reason: unknown) => void;
}

export interface ShowAdMobEvent {
  type: 'requested' | 'clicked' | 'dismissed' | 'failedToShow' | 'impression' | 'show' | 'userEarnedReward';
  data?: {
    unitType: string;
    unitAmount: number;
  };
}

// 기존 타입들 (하위 호환성을 위해 유지)
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

// Toss Ad 2.0 - 새로운 광고 그룹 ID 체계 (플랫폼 구분 없음)
export const AD_GROUP_IDS = {
  RANDOM_BOX: import.meta.env.VITE_AD_GROUP_RANDOM_BOX || import.meta.env.VITE_AD_ANDROID_RANDOM_BOX,
  DICE_REFILL: import.meta.env.VITE_AD_GROUP_DICE_REFILL || import.meta.env.VITE_AD_ANDROID_DICE_REFILL,
  CARD_FLIP_RETRY: import.meta.env.VITE_AD_GROUP_CARD_FLIP_RETRY || import.meta.env.VITE_AD_ANDROID_CARD_FLIP_RETRY,
  RPS_RETRY: import.meta.env.VITE_AD_GROUP_RPS_RETRY || import.meta.env.VITE_AD_ANDROID_RPS_RETRY,
} as const;

// 기존 광고 ID (하위 호환성을 위해 유지)
export const AD_UNIT_IDS = {
  android: {
    RANDOM_BOX: import.meta.env.VITE_AD_ANDROID_RANDOM_BOX,
    DICE_REFILL: import.meta.env.VITE_AD_ANDROID_DICE_REFILL,
    CARD_FLIP_RETRY: import.meta.env.VITE_AD_ANDROID_CARD_FLIP_RETRY,
    RPS_RETRY: import.meta.env.VITE_AD_ANDROID_RPS_RETRY,
  },
  ios: {
    RANDOM_BOX: import.meta.env.VITE_AD_IOS_RANDOM_BOX,
    DICE_REFILL: import.meta.env.VITE_AD_IOS_DICE_REFILL,
    CARD_FLIP_RETRY: import.meta.env.VITE_AD_IOS_CARD_FLIP_RETRY,
    RPS_RETRY: import.meta.env.VITE_AD_IOS_RPS_RETRY,
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
  
  let adUnitId: string | undefined;
  
  if (platform === 'android') {
    adUnitId = AD_UNIT_IDS.android[adType];
  } else if (platform === 'ios') {
    adUnitId = AD_UNIT_IDS.ios[adType];
  } else {
    // 웹의 경우 Android ID를 기본값으로 사용
    adUnitId = AD_UNIT_IDS.android[adType];
  }
  
  if (!adUnitId) {
    throw new Error(`광고 ID가 설정되지 않았습니다: ${adType} (${platform}). .env 파일에서 VITE_AD_${platform.toUpperCase()}_${adType}를 확인해주세요.`);
  }
  
  return adUnitId;
};

// 새로운 API용 adGroupId 가져오기 함수 (플랫폼 구분 없음)
export const getAdGroupId = (adType: AdType): string => {
  const adGroupId = AD_GROUP_IDS[adType];
  if (!adGroupId) {
    throw new Error(`광고 그룹 ID가 설정되지 않았습니다: ${adType}. .env 파일에서 VITE_AD_GROUP_${adType} 또는 VITE_AD_ANDROID_${adType}를 확인해주세요.`);
  }
  return adGroupId;
};
