# AdMob 보상형 광고 구현 가이드

## 개요

이 프로젝트는 Google AdMob 보상형 광고를 React Native 앱에 통합하는 방법을 보여줍니다. 사용자가 광고를 끝까지 시청하면 주사위를 리필할 수 있는 보상을 제공합니다.

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

`.env` 파일에 광고 ID 설정:

```env
REACT_APP_ADMOB_ANDROID_ID=ca-app-pub-8316376994464037/9670672503
REACT_APP_ADMOB_IOS_ID=ca-app-pub-8316376994464037/9774614282
```

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
