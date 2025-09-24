# Toss Ad 2.0 보상형 광고 구현 가이드

## 개요

이 프로젝트는 Toss Ad 2.0의 새로운 광고 API를 사용하여 보상형 광고를 React Native 앱에 통합하는 방법을 보여줍니다. 사용자가 광고를 끝까지 시청하면 주사위를 리필할 수 있는 보상을 제공합니다.

## Toss Ad 2.0 주요 변경사항

### 1. 새로운 API 함수
- `loadAdMobRewardedAd` → `loadAppsInTossAdMob`
- `showAdMobRewardedAd` → `showAppsInTossAdMob`

### 2. 광고 ID 체계 변경
- 기존: `adUnitId` 사용
- 신규: `adGroupId` 사용 (모든 함수에서 통일)

### 3. 환경변수 구조 업데이트

## 구현된 기능

### 1. 플랫폼별 광고 ID 관리
- **Android**: `ca-app-pub-8316376994464037/9670672503`
- **iOS**: `ca-app-pub-8316376994464037/9774614282`
- 자동 플랫폼 감지 및 적절한 광고 ID 선택

### 2. 광고 상태 관리
- `not_loaded`: 광고가 로드되지 않음
- `loading`: 광고 로딩 중
- `loaded`: 광고 로드 완료
- `failed`: 광고 로드 실패

### 3. 광고 이벤트 처리
- `loaded`: 광고 로드 성공
- `clicked`: 광고 클릭
- `dismissed`: 광고 닫힘
- `failedToShow`: 광고 표시 실패
- `impression`: 광고 노출
- `show`: 광고 컨텐츠 표시
- `userEarnedReward`: 사용자 보상 획득

## 파일 구조

```
src/
├── types/
│   └── adMob.ts          # 광고 관련 타입 정의
├── hooks/
│   └── useAdMob.ts       # 광고 관리 커스텀 훅
└── pages/
    └── DiceEvent/
        └── index.tsx      # 메인 게임 페이지 (광고 통합)
```

## 사용법

### 1. 광고 훅 사용

```typescript
import { useAdMob } from '@/hooks/useAdMob';

const MyComponent = () => {
  const { adLoadStatus, loadAd, showAd, isSupported } = useAdMob();
  
  const handleAdButtonClick = async () => {
    if (adLoadStatus === 'not_loaded') {
      await loadAd(); // 광고 로드
    } else if (adLoadStatus === 'loaded') {
      await showAd(); // 광고 표시
    }
  };
  
  return (
    <button 
      onClick={handleAdButtonClick}
      disabled={adLoadStatus === 'loading' || adLoadStatus === 'failed'}
    >
      {adLoadStatus === 'not_loaded' ? '광고 로드하기' : '광고 시청하기'}
    </button>
  );
};
```

### 2. 플랫폼별 광고 ID 자동 선택

```typescript
import { getAdUnitId, getPlatform } from '@/types/adMob';

const platform = getPlatform(); // 'android', 'ios', 'web'
const adUnitId = getAdUnitId(); // 플랫폼에 맞는 광고 ID 반환
```

## 실제 프로덕션 환경 적용

### 1. @apps-in-toss/framework 설치

```bash
npm install @apps-in-toss/framework
```

### 2. 광고 훅 수정

`src/hooks/useAdMob.ts`에서 더미 구현을 실제 AdMob API로 교체:

```typescript
import { GoogleAdMob } from '@apps-in-toss/framework';

// 광고 지원 여부 확인
const checkAdSupport = (): boolean => {
  return GoogleAdMob.loadAdMobRewardedAd.isSupported();
};

// 광고 로딩
const loadAdMobRewardedAd = async (params) => {
  return GoogleAdMob.loadAdMobRewardedAd(params);
};

// 광고 표시
const showAdMobRewardedAd = async (params) => {
  await GoogleAdMob.showAdMobRewardedAd(params);
};
```

### 3. 환경 설정

`.env` 파일에 새로운 광고 그룹 ID 설정:

```env
# Toss Ad 2.0 - 새로운 광고 그룹 ID 체계 (플랫폼 구분 없음)
# 실제 발급받은 광고 그룹 ID로 교체해주세요
VITE_AD_GROUP_RANDOM_BOX=ait.live.eb3bfcaaa7a74e02
VITE_AD_GROUP_DICE_REFILL=ait.live.e96cc8f4ad184fc4
VITE_AD_GROUP_CARD_FLIP_RETRY=ait.live.31a2431a6dec4886
VITE_AD_GROUP_RPS_RETRY=ait.live.0acb63d15f8c45d4

# 기존 환경변수 (하위 호환성을 위해 유지)
VITE_AD_ANDROID_RANDOM_BOX=ca-app-pub-8316376994464037/3096004724
VITE_AD_ANDROID_DICE_REFILL=ca-app-pub-8316376994464037/2030883800
VITE_AD_ANDROID_CARD_FLIP_RETRY=ca-app-pub-8316376994464037/7502702330
VITE_AD_ANDROID_RPS_RETRY=ca-app-pub-8316376994464037/3884404413

VITE_AD_IOS_RANDOM_BOX=ca-app-pub-8316376994464037/4409086390
VITE_AD_IOS_DICE_REFILL=ca-app-pub-8316376994464037/6670349857
VITE_AD_IOS_CARD_FLIP_RETRY=ca-app-pub-8316376994464037/1711319609
VITE_AD_IOS_RPS_RETRY=ca-app-pub-8316376994464037/8676183201
```

### ⚠️ 중요: 환경변수 필수 설정

**모든 광고 ID는 `.env` 파일에서 반드시 설정해야 합니다.** 환경변수가 설정되지 않으면 런타임 에러가 발생합니다.

- `VITE_AD_GROUP_*`: 새로운 Toss Ad 2.0 광고 그룹 ID (권장)
- `VITE_AD_ANDROID_*`: 기존 Android 광고 ID (하위 호환성)
- `VITE_AD_IOS_*`: 기존 iOS 광고 ID (하위 호환성)

## 주의사항

### 1. React 문법 준수
- `useEffect`의 의존성 배열을 올바르게 설정
- `useCallback`을 사용하여 함수 메모이제이션
- 컴포넌트 언마운트 시 정리 함수 실행

### 2. 에러 처리
- 광고 로딩/표시 실패 시 적절한 에러 처리
- 사용자에게 명확한 피드백 제공

### 3. 성능 최적화
- 불필요한 리렌더링 방지
- 광고 상태 변경 시 적절한 UI 업데이트

## 테스트

### 1. 웹 환경 테스트
- 현재 구현된 더미 광고로 기능 테스트
- 콘솔 로그를 통한 광고 이벤트 확인

### 2. 모바일 환경 테스트
- 실제 AdMob SDK 설치 후 테스트
- 다양한 기기에서 광고 표시 확인

## 문제 해결

### 1. 광고가 로드되지 않는 경우
- 네트워크 연결 상태 확인
- 광고 ID 유효성 검증
- AdMob 계정 설정 확인

### 2. 광고가 표시되지 않는 경우
- 광고 로드 상태 확인
- 기기 호환성 검증
- 광고 정책 준수 여부 확인

## 추가 개선 사항

### 1. 광고 캐싱
- 미리 광고를 로드하여 사용자 경험 개선
- 광고 로딩 시간 단축

### 2. A/B 테스트
- 다양한 광고 형식 테스트
- 사용자 참여도 분석

### 3. 분석 및 모니터링
- 광고 성과 지표 추적
- 사용자 행동 분석

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
