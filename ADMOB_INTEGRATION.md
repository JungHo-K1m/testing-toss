# 📱 AdMob 광고 시스템 통합 문서

> **프로젝트**: Lucky Dice (Toss Apps-in-Toss Integration)  
> **버전**: 2.0  
> **최종 업데이트**: 2024

---

## 📑 목차

1. [시스템 개요](#시스템-개요)
2. [아키텍처](#아키텍처)
3. [광고 타입](#광고-타입)
4. [API 명세](#api-명세)
5. [Hook 사용법](#hook-사용법)
6. [UI 통합 가이드](#ui-통합-가이드)
7. [에러 처리](#에러-처리)
8. [베스트 프랙티스](#베스트-프랙티스)

---

## 🎯 시스템 개요

### 목적

Toss Apps-in-Toss 프레임워크를 통해 네이티브 AdMob 광고를 웹뷰에서 통합하여, 사용자에게 보상형 광고를 제공합니다.

### 주요 기능

- ✅ 4가지 타입의 보상형 광고 지원
- ✅ 광고 타입별 독립적인 인스턴스 관리
- ✅ 자동 로드 및 재로드 시스템
- ✅ 사운드 제어 (광고 재생 시 배경음 음소거)
- ✅ 에러 핸들링 및 재시도 메커니즘
- ✅ 연속 시청 방지 (최소 3초 간격)
- ✅ Promise 기반 비동기 처리

### 기술 스택

- **SDK**: `@apps-in-toss/web-framework`
- **Framework**: React + TypeScript
- **State Management**: React Hooks (useRef, useState, useCallback)

---

## 🏗️ 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                        UI Layer (React)                          │
│  📄 DiceEvent/index.tsx                                          │
│  - 광고 버튼 UI                                                  │
│  - 상태 표시 (로딩/완료/실패)                                    │
│  - 보상 모달 표시                                                │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                           │
│  🎣 useAdMob Hook                                                │
│  - 광고 인스턴스 관리                                            │
│  - 로딩/표시 제어                                                │
│  - 사운드 제어                                                   │
│  - 에러 처리                                                     │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SDK Layer                                   │
│  📦 @apps-in-toss/web-framework                                  │
│  - loadAppsInTossAdMob()                                         │
│  - showAppsInTossAdMob()                                         │
│  - isSupported()                                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend API                                 │
│  🔌 Reward Endpoints                                             │
│  - POST /randombox/ad                                            │
│  - GET  /home/refill-dice/ad                                     │
│  - POST /cardflip/retry                                          │
│  - POST /rps/retry                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎮 광고 타입

### AdType 정의

```typescript
export type AdType =
  | "RANDOM_BOX" // 랜덤박스 광고
  | "DICE_REFILL" // 주사위 리필 광고
  | "CARD_FLIP_RETRY" // 카드플립 재시도 광고
  | "RPS_RETRY"; // RPS 게임 재시도 광고
```

### 광고 타입별 설명

| 타입              | 설명                   | 보상             | API 호출 시점          |
| ----------------- | ---------------------- | ---------------- | ---------------------- |
| `RANDOM_BOX`      | 랜덤박스 아이템 획득   | 장비/주사위/열쇠 | 광고 시청 완료 후 즉시 |
| `DICE_REFILL`     | 주사위 무료 리필       | 주사위 10개      | 광고 시청 완료 후 즉시 |
| `CARD_FLIP_RETRY` | 카드플립 게임 재시도   | 재시도 기회      | 사용자가 게임 실행 시  |
| `RPS_RETRY`       | 가위바위보 게임 재시도 | 재시도 기회      | 사용자가 게임 실행 시  |

### 환경변수 설정

```env
# .env 파일
VITE_AD_GROUP_RANDOM_BOX=your-ad-group-id-here
VITE_AD_GROUP_DICE_REFILL=your-ad-group-id-here
VITE_AD_GROUP_CARD_FLIP_RETRY=your-ad-group-id-here
VITE_AD_GROUP_RPS_RETRY=your-ad-group-id-here
```

---

## 📡 API 명세

### 1. 랜덤박스 광고 보상

#### Endpoint

```
GET /randombox/ad
```

#### Request

- **Headers**: Authorization Bearer Token (자동 포함)
- **Body**: 없음

#### Response

```typescript
interface RandomBoxAdRewardResponse {
  type: "EQUIPMENT" | "DICE" | "SL" | "NONE";
  equipment?: {
    ownedEquipmentId: number;
    type: "HEAD" | "EYE" | "EAR" | "NECK" | "BACK";
    rarity: number; // 0~9
  };
}
```

#### 예시

```json
{
  "code": "OK",
  "message": "Success",
  "data": {
    "type": "EQUIPMENT",
    "equipment": {
      "ownedEquipmentId": 12345,
      "type": "HEAD",
      "rarity": 5
    }
  }
}
```

---

### 2. 주사위 리필 광고 보상

#### Endpoint

```
GET /home/refill-dice/ad
```

#### Request

- **Headers**: Authorization Bearer Token (자동 포함)
- **Body**: 없음

#### Response

```typescript
interface DiceRefillAdRewardResponse {
  nowDice: {
    dice: number; // 현재 주사위 개수
  };
  rank: {
    diceRefilledAt: string; // 리필 시간 (ISO 8601)
  };
}
```

#### 예시

```json
{
  "code": "OK",
  "message": "Success",
  "data": {
    "nowDice": {
      "dice": 10
    },
    "rank": {
      "diceRefilledAt": "2024-10-15T14:30:00Z"
    }
  }
}
```

---

### 3. 카드플립 재시도 광고

#### Endpoint

```
POST /cardflip/retry
```

#### Request

```typescript
interface CardFlipRetryRequest {
  cardFlipId: number; // 카드플립 게임 ID
  type: "COLOR" | "FLIP"; // 게임 타입
  num: number; // 선택 값 (왼쪽부터 1)
}
```

#### Request 예시

```json
{
  "cardFlipId": 67890,
  "type": "COLOR",
  "num": 2
}
```

#### Response

```typescript
interface CardFlipRetryResponse {
  success: boolean;
  message: string;
  data?: {
    bettingAmount: number;
    reward: number;
    result: string; // "WIN" | "DEFEAT"
    rank: number;
    starCount: number;
    cardFlipId: number;
  };
}
```

#### Response 예시

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "bettingAmount": 100,
    "reward": 200,
    "result": "WIN",
    "rank": 1500,
    "starCount": 15000,
    "cardFlipId": 67890
  }
}
```

---

### 4. RPS 재시도 광고

#### Endpoint

```
POST /rps/retry
```

#### Request

```typescript
interface RPSRetryRequest {
  rpsId: number; // RPS 게임 ID
  value: number; // 0 = 가위, 1 = 바위, 2 = 보
}
```

#### Request 예시

```json
{
  "rpsId": 54321,
  "value": 1
}
```

#### Response

```typescript
interface RPSRetryResponse {
  success: boolean;
  message: string;
  code?: string;
  data?: {
    bettingAmount: number;
    reward: number;
    result: string; // "WIN" | "DEFEAT"
    pcValue: number; // 컴퓨터 선택값
    rank: number;
    starCount: number;
    rpsId: number;
  };
}
```

#### Response 예시

```json
{
  "success": true,
  "message": "Success",
  "code": "OK",
  "data": {
    "bettingAmount": 100,
    "reward": 200,
    "result": "WIN",
    "pcValue": 0,
    "rank": 1500,
    "starCount": 15000,
    "rpsId": 54321
  }
}
```

---

## 🎣 Hook 사용법

### useAdMob Hook

#### Import

```typescript
import { useAdMob } from "@/hooks/useAdMob";
```

#### 반환 값

```typescript
interface UseAdMobReturn {
  // 광고 상태 조회
  getAdStatus: (adType: AdType) => AdLoadStatus;

  // 광고 로드
  loadAd: (adType: AdType) => Promise<void>;

  // 광고 표시 (보상 데이터 반환)
  showAd: (adType: AdType, requestData?: any) => Promise<any>;

  // 광고 지원 여부
  isSupported: boolean;

  // 자동 로드 (이미 로드된 경우 스킵)
  autoLoadAd: (adType: AdType) => Promise<void>;

  // 광고 재로드 (리셋 후 로드)
  reloadAd: (adType: AdType) => Promise<void>;

  // 광고 인스턴스 리셋
  resetAdInstance: (adType: AdType) => void;

  // 전체 광고 관리
  resetAllAdInstances: () => void;
  loadAllAds: () => Promise<void>;
}
```

#### 광고 상태 (AdLoadStatus)

```typescript
type AdLoadStatus =
  | "not_loaded" // 로드되지 않음
  | "loading" // 로딩 중
  | "loaded" // 로드 완료
  | "failed" // 로드 실패
  | "cleaning"; // 정리 중
```

---

## 🔌 UI 통합 가이드

### 1. 기본 사용 예시 (랜덤박스)

```typescript
import { useAdMob } from "@/hooks/useAdMob";
import { useState, useEffect } from "react";

const MyComponent = () => {
  const { getAdStatus, loadAd, showAd, autoLoadAd, reloadAd, resetAdInstance } =
    useAdMob();

  const [showModal, setShowModal] = useState(false);
  const [rewardData, setRewardData] = useState(null);

  // 모달이 열릴 때 자동으로 광고 로드
  useEffect(() => {
    if (showModal) {
      autoLoadAd("RANDOM_BOX");
    }
  }, [showModal, autoLoadAd]);

  // 광고 버튼 클릭 핸들러
  const handleAdClick = async () => {
    try {
      // 광고 표시 및 보상 대기
      const result = await showAd("RANDOM_BOX");

      if (result) {
        // 보상 데이터 저장 및 모달 표시
        setRewardData(result);

        // 사용자 데이터 새로고침
        await fetchUserData();

        // 다음 사용을 위해 광고 재로드
        setTimeout(() => {
          reloadAd("RANDOM_BOX");
        }, 1000);
      }
    } catch (error) {
      console.error("광고 시청 실패:", error);
      alert("광고 시청에 실패했습니다.");

      // 에러 발생 시 광고 리셋 및 재로드
      resetAdInstance("RANDOM_BOX");
      setTimeout(() => {
        reloadAd("RANDOM_BOX");
      }, 2000);
    }
  };

  // 광고 상태에 따른 버튼 텍스트
  const getButtonText = () => {
    const status = getAdStatus("RANDOM_BOX");
    switch (status) {
      case "not_loaded":
        return "광고 로드하기";
      case "loading":
        return "광고 로딩 중...";
      case "loaded":
        return "광고 시청하기";
      case "failed":
        return "로드 실패 - 다시 시도";
      case "cleaning":
        return "정리 중...";
      default:
        return "광고 시청하기";
    }
  };

  return (
    <button
      onClick={handleAdClick}
      disabled={getAdStatus("RANDOM_BOX") === "loading"}
    >
      {getButtonText()}
    </button>
  );
};
```

---

### 2. 게임 재시도 광고 (RPS 예시)

```typescript
const RPSComponent = () => {
  const { showAd, autoLoadAd } = useAdMob();
  const [rpsId, setRpsId] = useState(null);
  const [playerChoice, setPlayerChoice] = useState(null);

  // 컴포넌트 마운트 시 광고 로드
  useEffect(() => {
    autoLoadAd("RPS_RETRY");
  }, [autoLoadAd]);

  // 재시도 광고 시청
  const handleRetry = async (choice: number) => {
    try {
      // requestData와 함께 광고 표시
      const result = await showAd("RPS_RETRY", {
        rpsId,
        value: choice,
      });

      if (result.success) {
        // 게임 재시도 성공
        console.log("재시도 성공:", result);
        // 게임 로직 실행...
      }
    } catch (error) {
      console.error("재시도 실패:", error);
    }
  };

  return (
    <div>
      <button onClick={() => handleRetry(0)}>가위로 재시도</button>
      <button onClick={() => handleRetry(1)}>바위로 재시도</button>
      <button onClick={() => handleRetry(2)}>보로 재시도</button>
    </div>
  );
};
```

---

### 3. 주사위 리필 광고

```typescript
const DiceRefillComponent = () => {
  const { getAdStatus, showAd, autoLoadAd, reloadAd } = useAdMob();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (showModal) {
      autoLoadAd("DICE_REFILL");
    }
  }, [showModal, autoLoadAd]);

  const handleRefillDice = async () => {
    try {
      const result = await showAd("DICE_REFILL");

      if (result) {
        alert(`주사위가 ${result.nowDice.dice}개로 리필되었습니다!`);
        await fetchUserData();
        setShowModal(false);

        setTimeout(() => reloadAd("DICE_REFILL"), 1000);
      }
    } catch (error) {
      alert("주사위 리필에 실패했습니다.");
    }
  };

  return (
    <div>
      <button onClick={handleRefillDice}>
        {getAdStatus("DICE_REFILL") === "loaded"
          ? "광고 시청 후 주사위 리필"
          : "광고 로딩 중..."}
      </button>
    </div>
  );
};
```

---

## 🔄 광고 생명주기

### 전체 흐름

```
[사용자 버튼 클릭]
       ↓
[광고 상태 확인] ──→ not_loaded? ──→ loadAd()
       ↓                                   ↓
    loaded?                          [광고 로딩]
       ↓                                   ↓
  [showAd() 호출]                   [loaded 이벤트]
       ↓                                   ↓
[광고 SDK에 표시 요청]              [상태: 'loaded']
       ↓
  [show 이벤트]
       ↓
  [사운드 음소거]
       ↓
[사용자가 광고 시청]
       ↓
[userEarnedReward 이벤트]
       ↓
  게임 재시도? ──Yes─→ [즉시 resolve + requestData 전달]
       │
       No
       ↓
  [Backend API 호출]
       ↓
  [보상 데이터 수신]
       ↓
  [Promise resolve]
       ↓
  [UI에서 보상 모달 표시]
       ↓
  [사용자 데이터 새로고침]
       ↓
  [2초 후 광고 인스턴스 정리]
       ↓
  [사운드 재생]
       ↓
  [다음 사용을 위해 광고 재로드]
```

### 상태 전이 다이어그램

```
not_loaded ──[loadAd()]──→ loading ──[성공]──→ loaded
                              │
                              └──[실패]──→ failed ──[reloadAd()]──→ loading

loaded ──[showAd()]──→ [광고 표시] ──[시청 완료]──→ cleaning ──→ not_loaded
                                       │
                                       └──[시청 실패]──→ failed
```

---

## ⚠️ 에러 처리

### 1. 광고 로드 실패

```typescript
try {
  await loadAd("RANDOM_BOX");
} catch (error) {
  console.error("광고 로드 실패:", error);
  // 상태가 자동으로 'failed'로 변경됨
  // 재시도: reloadAd('RANDOM_BOX')
}
```

### 2. 광고 표시 실패

```typescript
try {
  const result = await showAd("RANDOM_BOX");
} catch (error) {
  if (error.message?.includes("간격이 너무 짧습니다")) {
    alert("광고 시청 간격이 너무 짧습니다. 잠시 후 다시 시도해주세요.");
  } else {
    alert("광고 시청에 실패했습니다.");
  }

  // 광고 인스턴스 리셋 및 재로드
  resetAdInstance("RANDOM_BOX");
  setTimeout(() => reloadAd("RANDOM_BOX"), 2000);
}
```

### 3. 타임아웃 처리

광고 표시 후 45초가 경과하면 자동으로 타임아웃 처리됩니다.

```typescript
// useAdMob 내부에서 자동 처리
setTimeout(() => {
  if (instance.pendingPromise) {
    instance.pendingPromise.resolve({
      type: adType,
      error: true,
      success: false,
      message: "광고 시청 시간이 초과되었습니다.",
    });
  }
}, 45000);
```

### 4. API 에러 처리

```typescript
try {
  const result = await showAd("RANDOM_BOX");

  if (!result || result.error) {
    throw new Error(result?.message || "보상 받기 실패");
  }

  // 정상 처리
} catch (error) {
  console.error("API 에러:", error);
  alert("보상 처리 중 오류가 발생했습니다.");
}
```

---

## 📋 베스트 프랙티스

### 1. 광고 로드 타이밍

✅ **권장**: 모달/페이지 진입 시 자동 로드

```typescript
useEffect(() => {
  if (showModal) {
    autoLoadAd("RANDOM_BOX");
  }
}, [showModal, autoLoadAd]);
```

❌ **비권장**: 버튼 클릭 시 로드 (사용자 대기 시간 증가)

---

### 2. 에러 복구

✅ **권장**: 에러 발생 시 자동 리셋 및 재로드

```typescript
catch (error) {
  resetAdInstance(adType);
  setTimeout(() => reloadAd(adType), 2000);
}
```

❌ **비권장**: 에러 발생 시 아무 조치 없이 종료

---

### 3. 사용자 피드백

✅ **권장**: 광고 상태를 UI에 명확히 표시

```typescript
const getButtonText = () => {
  switch (getAdStatus("RANDOM_BOX")) {
    case "loading":
      return "광고 로딩 중...";
    case "loaded":
      return "광고 시청하기";
    // ...
  }
};
```

❌ **비권장**: 정적인 버튼 텍스트

---

### 4. 연속 시청 방지

시스템에서 자동으로 3초 간격을 체크하지만, UI에서도 추가 제어 가능:

```typescript
const [isWatching, setIsWatching] = useState(false);

const handleAdClick = async () => {
  if (isWatching) {
    alert("광고 시청 중입니다.");
    return;
  }

  setIsWatching(true);
  try {
    await showAd("RANDOM_BOX");
  } finally {
    setIsWatching(false);
  }
};
```

---

### 5. 광고 인스턴스 정리

컴포넌트 언마운트 시 자동 정리되지만, 필요 시 수동 정리:

```typescript
useEffect(() => {
  return () => {
    resetAllAdInstances();
  };
}, []);
```

---

## 🐛 디버깅

### 광고 상태 확인

```typescript
console.log("광고 상태:", getAdStatus("RANDOM_BOX"));
```

### RPS API 로그 확인 (개발자 도구)

```javascript
// 콘솔에서 실행
checkRPSApiLogs(); // 모든 로그 확인
getLastRPSApiLog(); // 마지막 로그 확인
exportRPSApiLogs(); // JSON으로 다운로드
clearRPSApiLogs(); // 로그 초기화
```

---

## 📊 성능 최적화

### 1. 광고 미리 로드

사용자가 광고를 시청하기 전에 미리 로드하여 대기 시간 단축

### 2. 인스턴스 재사용

광고 시청 후 자동으로 재로드하여 다음 사용 준비

### 3. 타임아웃 설정

45초 타임아웃으로 무한 대기 방지

### 4. 메모리 관리

cleanup 함수로 광고 인스턴스 메모리 해제

---

## 🔐 보안 고려사항

### 1. 토큰 관리

- Authorization 헤더는 `axiosInstance`에서 자동 관리
- 토큰 만료 시 자동 갱신 또는 로그인 페이지로 리다이렉트

### 2. API 검증

- 서버 응답 검증 필수 (`code === "OK"` 확인)
- 필수 필드 존재 여부 확인

### 3. 클라이언트 검증

- 광고 시청 간격 체크 (3초)
- 중복 요청 방지

---

## 📚 참고 자료

- **Toss SDK**: `@apps-in-toss/web-framework`
- **API Base URL**: 환경변수 `VITE_API_BASE_URL`
- **광고 그룹 ID**: 환경변수 `VITE_AD_GROUP_*`

---

## 📝 변경 이력

| 버전 | 날짜    | 변경 사항            |
| ---- | ------- | -------------------- |
| 2.0  | 2024-10 | Toss Ad 2.0 API 적용 |
| 1.0  | 2024-09 | 초기 버전            |

---

## 💬 문의

문제가 발생하거나 질문이 있으신 경우:

1. 코드 리뷰 요청
2. 이슈 트래커 등록
3. 개발팀 문의

---

**📌 주의**: 이 문서는 프로젝트의 광고 통합 시스템을 설명합니다. 실제 구현 시 최신 버전의 SDK 문서를 참조하세요.
