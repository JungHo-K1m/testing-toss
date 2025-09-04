/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LIFF_ID: string;
  readonly VITE_PROMOTION_CODE: string;
  
  // Android 광고 ID
  readonly VITE_AD_ANDROID_RANDOM_BOX: string;
  readonly VITE_AD_ANDROID_DICE_REFILL: string;
  readonly VITE_AD_ANDROID_CARD_FLIP_RETRY: string;
  readonly VITE_AD_ANDROID_RPS_RETRY: string;
  
  // iOS 광고 ID
  readonly VITE_AD_IOS_RANDOM_BOX: string;
  readonly VITE_AD_IOS_DICE_REFILL: string;
  readonly VITE_AD_IOS_CARD_FLIP_RETRY: string;
  readonly VITE_AD_IOS_RPS_RETRY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
