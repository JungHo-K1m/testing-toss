import { AdType, getAdUnitId, getAdGroupId } from '@/types/adMob';

// 광고 상태 타입
export type AdLoadStatus = 'not_loaded' | 'loading' | 'loaded' | 'failed';

// 광고 인스턴스 정보
interface AdInstance {
  cleanup: (() => void) | null;
  adUnitId: string | null;
  isReady: boolean;
  lastUsed: number;
}

// 광고 관리자 클래스
export class AdManager {
  private static instance: AdManager;
  private adInstances: Map<AdType, AdInstance> = new Map();
  private adStatuses: Map<AdType, AdLoadStatus> = new Map();
  private isSupported: boolean = false;

  private constructor() {
    // 모든 광고 타입 초기화
    const adTypes: AdType[] = ['RANDOM_BOX', 'DICE_REFILL', 'CARD_FLIP_RETRY', 'RPS_RETRY'];
    adTypes.forEach(type => {
      this.adInstances.set(type, {
        cleanup: null,
        adUnitId: null,
        isReady: false,
        lastUsed: 0
      });
      this.adStatuses.set(type, 'not_loaded');
    });
  }

  // 싱글톤 인스턴스 반환
  public static getInstance(): AdManager {
    if (!AdManager.instance) {
      AdManager.instance = new AdManager();
    }
    return AdManager.instance;
  }

  // 광고 지원 여부 설정
  public setSupported(supported: boolean): void {
    this.isSupported = supported;
  }

  // 광고 지원 여부 확인
  public getSupported(): boolean {
    return this.isSupported;
  }

  // 특정 타입의 광고 상태 가져오기
  public getAdStatus(adType: AdType): AdLoadStatus {
    return this.adStatuses.get(adType) || 'not_loaded';
  }

  // 특정 타입의 광고 인스턴스 가져오기
  public getAdInstance(adType: AdType): AdInstance | undefined {
    return this.adInstances.get(adType);
  }

  // 광고 상태 업데이트
  public updateAdStatus(adType: AdType, status: AdLoadStatus): void {
    this.adStatuses.set(adType, status);
  }

  // 광고 인스턴스 업데이트
  public updateAdInstance(adType: AdType, instance: Partial<AdInstance>): void {
    const current = this.adInstances.get(adType);
    if (current) {
      this.adInstances.set(adType, { ...current, ...instance });
    }
  }

  // 광고 ID 가져오기
  public getAdUnitId(adType: AdType): string {
    return getAdUnitId(adType);
  }

  // 광고 그룹 ID 가져오기 (새로운 API용)
  public getAdGroupId(adType: AdType): string {
    return getAdGroupId(adType);
  }

  // 모든 광고 상태 가져오기
  public getAllAdStatuses(): Record<AdType, AdLoadStatus> {
    const result: Record<AdType, AdLoadStatus> = {} as Record<AdType, AdLoadStatus>;
    this.adStatuses.forEach((status, type) => {
      result[type] = status;
    });
    return result;
  }

  // 특정 타입의 광고가 사용 가능한지 확인
  public isAdReady(adType: AdType): boolean {
    const status = this.getAdStatus(adType);
    const instance = this.getAdInstance(adType);
    return status === 'loaded' && instance?.isReady === true;
  }

  // 광고 사용 시간 업데이트
  public updateAdUsageTime(adType: AdType): void {
    const instance = this.getAdInstance(adType);
    if (instance) {
      this.updateAdInstance(adType, { lastUsed: Date.now() });
    }
  }

  // 가장 오래된 광고 타입 찾기 (메모리 관리용)
  public getOldestAdType(): AdType | null {
    let oldestType: AdType | null = null;
    let oldestTime = Date.now();

    this.adInstances.forEach((instance, type) => {
      if (instance.lastUsed < oldestTime) {
        oldestTime = instance.lastUsed;
        oldestType = type;
      }
    });

    return oldestType;
  }

  // 특정 타입의 광고 정리
  public cleanupAd(adType: AdType): void {
    const instance = this.getAdInstance(adType);
    if (instance?.cleanup) {
      try {
        instance.cleanup();
      } catch (error) {
        console.error(`광고 정리 중 오류 (${adType}):`, error);
      }
    }

    this.updateAdInstance(adType, {
      cleanup: null,
      adUnitId: null,
      isReady: false
    });
    this.updateAdStatus(adType, 'not_loaded');
  }

  // 모든 광고 정리
  public cleanupAllAds(): void {
    this.adInstances.forEach((_, type) => {
      this.cleanupAd(type);
    });
  }

  // 메모리 사용량이 많은 경우 오래된 광고 정리
  public cleanupOldAds(maxAge: number = 5 * 60 * 1000): void { // 기본 5분
    const now = Date.now();
    this.adInstances.forEach((instance, type) => {
      if (now - instance.lastUsed > maxAge) {
        this.cleanupAd(type);
      }
    });
  }

  // 디버깅용 정보 출력
  public getDebugInfo(): object {
    const debugInfo: any = {
      isSupported: this.isSupported,
      adStatuses: {},
      adInstances: {}
    };

    this.adStatuses.forEach((status, type) => {
      debugInfo.adStatuses[type] = status;
    });

    this.adInstances.forEach((instance, type) => {
      debugInfo.adInstances[type] = {
        isReady: instance.isReady,
        lastUsed: new Date(instance.lastUsed).toISOString(),
        hasCleanup: !!instance.cleanup
      };
    });

    return debugInfo;
  }
}

// 전역 인스턴스
export const adManager = AdManager.getInstance();
