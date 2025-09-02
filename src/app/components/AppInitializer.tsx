import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { appLogin, isMinVersionSupported } from "@apps-in-toss/web-framework";
import { tossLogin } from "@/entities/User/api/loginToss";
import { useUserStore } from "@/entities/User/model/userModel";
import Cookies from "js-cookie";

// ReactNativeWebView 타입 선언
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

interface AppInitializerProps {
  onInitialized: () => void;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ onInitialized }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [authorizationCode, setAuthorizationCode] = useState<string | null>(
    null
  );
  const [referrer, setReferrer] = useState<string | null>(null);
  const [loginResult, setLoginResult] = useState<{
    authorizationCode: string;
    referrer: string;
  } | null>(null);
  const [serverLoginResult, setServerLoginResult] = useState<{
    userId?: string;
    userName?: string;
    referrerId?: string;
    isInitial?: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { fetchUserData } = useUserStore();

  // 앱인토스 웹뷰 환경에서 세션 스토리지 정리 함수
  const clearSessionStorageFlags = () => {
    const flagsToRemove = [
      "refreshAttempted",
      "restartAppInitializer",
      "redirectingToLogin",
    ];

    flagsToRemove.forEach((flag) => {
      if (sessionStorage.getItem(flag)) {
        sessionStorage.removeItem(flag);
        console.log(`[AppInitializer] ${flag} 플래그 정리 완료`);
      }
    });
  };

  // 페이지 최초 진입 시 자동 초기화 활성화
  useEffect(() => {
    console.log("[AppInitializer] 페이지 진입 - 플래그 정리 및 초기화 시작");

    // 앱인토스 웹뷰 환경에서 모든 세션 스토리지 플래그 정리
    clearSessionStorageFlags();

    // AppInitializer 재실행 플래그 확인
    if (sessionStorage.getItem("restartAppInitializer")) {
      sessionStorage.removeItem("restartAppInitializer");
      console.log(
        "[AppInitializer] 재실행 플래그 감지 - AppInitializer 로직 재실행"
      );

      // 액세스 토큰이 있다면 삭제 (리프레시 실패로 인한 재실행이므로)
      if (localStorage.getItem("accessToken")) {
        localStorage.removeItem("accessToken");
        console.log("[AppInitializer] 리프레시 실패로 인한 액세스 토큰 삭제");
      }

      // 초기화 플래그도 삭제 (새로운 로그인 시도이므로)
      localStorage.removeItem("isInitialized");
      console.log("[AppInitializer] 초기화 플래그 삭제 - 새로운 로그인 시도");

      // 모든 세션 스토리지 플래그 정리 (무한 루프 방지)
      clearSessionStorageFlags();

      // 새 로그인 플로우 시작
      handleNewTokenLogin();
      return;
    }

    // 페이지 진입 시 바로 appLogin 실행
    handleAppLoginOnEntry();
  }, []);

  // 웹뷰 환경에서의 라우팅 상태 모니터링
  useEffect(() => {
    const checkRoutingStatus = () => {
      // 현재 URL과 예상된 상태 확인
      const currentPath = window.location.pathname;
      const isInitialized = localStorage.getItem("isInitialized") === "true";
      const hasAccessToken = !!localStorage.getItem("accessToken");

      console.log("[AppInitializer] 라우팅 상태 체크:", {
        currentPath,
        isInitialized,
        hasAccessToken,
        timestamp: new Date().toISOString(),
      });

      // 초기화되지 않은 상태에서 루트가 아닌 페이지에 있는 경우
      if (!isInitialized && currentPath !== "/" && currentPath !== "/login") {
        console.log(
          "[AppInitializer] 초기화되지 않은 상태에서 잘못된 페이지 감지, 루트로 리다이렉트"
        );
        window.location.href = "/";
      }
    };

    // 초기 체크
    checkRoutingStatus();

    // 주기적 체크 (5초마다)
    const interval = setInterval(checkRoutingStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  // 페이지 진입 시 바로 appLogin 실행
  const handleAppLoginOnEntry = async () => {
    try {
      setIsInitializing(true);
      setError(null);

      // 환경 정보 로깅
      console.log("[AppInitializer] 환경 정보:", {
        userAgent: navigator.userAgent,
        url: window.location.href,
        hasReactNativeWebView: !!window.ReactNativeWebView,
      });

      // 토스 앱 환경 확인
      if (!window.ReactNativeWebView) {
        console.error("[AppInitializer] 토스 앱 웹뷰 환경이 아님");
        setError("토스 앱에서만 로그인할 수 있습니다.");
        return;
      }

      // 토스 앱 버전 확인
      const versionCheck = isMinVersionSupported({
        android: "5.219.0",
        ios: "5.219.0",
      });

      if (!versionCheck) {
        console.error("[AppInitializer] 토스 앱 버전이 지원되지 않음");
        setError("토스 앱 버전이 지원되지 않습니다.");
        return;
      }

      // appLogin 함수 호출하여 authorizationCode와 referrer 즉시 획득
      console.log("[AppInitializer] appLogin 호출 시작...");
      const loginResult = await appLogin();
      console.log("[AppInitializer] appLogin 응답:", loginResult);

      // 타입 안전성을 위한 검증
      if (!loginResult || typeof loginResult !== "object") {
        console.error(
          "[AppInitializer] appLogin 응답이 올바르지 않습니다:",
          loginResult
        );
        setError("appLogin 응답이 올바르지 않습니다.");
        return;
      }

      const { authorizationCode: authCode, referrer: refCode } = loginResult;
      console.log("[AppInitializer] 파싱된 값:", { authCode, refCode });

      if (!authCode || typeof authCode !== "string") {
        console.error(
          "[AppInitializer] authorizationCode가 올바르지 않습니다:",
          authCode
        );
        setError("authorizationCode가 올바르지 않습니다.");
        return;
      }

      if (!refCode || (refCode !== "DEFAULT" && refCode !== "SANDBOX")) {
        console.warn(
          "[AppInitializer] referrer가 예상된 값이 아닙니다:",
          refCode
        );
      }

      setAuthorizationCode(authCode);
      setReferrer(refCode);
      setLoginResult({ authorizationCode: authCode, referrer: refCode });

      // Native 앱에 성공 메시지 전송
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: "loginSuccess",
            authorizationCode: authCode,
            referrer: refCode,
            timestamp: Date.now(),
          })
        );
      }

      // authorizationCode와 referrer 획득 후 자동 초기화 진행
      await handleAutoInitialization(authCode, refCode);
    } catch (error: any) {
      console.error("[AppInitializer] appLogin 실패:", {
        error: error.message || error,
        errorType: error.constructor.name,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });

      let errorMessage = "알 수 없는 오류";

      if (error.message && error.message.includes("appLogin")) {
        console.error("[AppInitializer] appLogin 함수 관련 에러:", error);
        errorMessage = `appLogin 함수 에러: ${error.message}`;
      } else if (error.message) {
        errorMessage = `토스 로그인 실패: ${error.message}`;
      } else {
        errorMessage = "토스 로그인 실패: 알 수 없는 오류";
      }

      setError(errorMessage);

      // Native 앱에 에러 메시지 전송
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: "loginError",
            error: errorMessage,
            originalError: error?.message || "알 수 없는 에러",
            timestamp: Date.now(),
          })
        );
      }
    } finally {
      setIsInitializing(false);
    }
  };

  // 자동 초기화 핸들러
  const handleAutoInitialization = async (
    authCode?: string,
    refCode?: string
  ) => {
    try {
      // 무한 리프레시 방지 체크
      if (sessionStorage.getItem("redirectingToLogin")) {
        sessionStorage.removeItem("redirectingToLogin");
        console.log("[AppInitializer] 리다이렉트 상태 감지, 초기화 중단");
        return;
      }

      // authorizationCode와 referrer 확인 (매개변수 우선, 없으면 상태값 사용)
      const currentAuthCode = authCode || authorizationCode;
      const currentRefCode = refCode || referrer;

      if (!currentAuthCode || !currentRefCode) {
        console.error(
          "[AppInitializer] authorizationCode 또는 referrer가 설정되지 않음"
        );
        setError("로그인 정보가 올바르지 않습니다.");
        return;
      }

      setIsInitializing(true);
      setError(null);

      // 0. 로컬스토리지에 액세스토큰 확인
      const accessToken = localStorage.getItem("accessToken");

      if (accessToken) {
        // 1. 액세스토큰이 있는 경우
        console.log(
          "[AppInitializer] 기존 액세스 토큰 발견, 사용자 데이터 확인"
        );
        await handleExistingTokenLogin();
      } else {
        // 2. 액세스 토큰이 없는 경우
        console.log(
          "[AppInitializer] 액세스 토큰 없음, 리프레시 토큰으로 1회 시도"
        );
        await handleNoTokenFlow(authCode, refCode);
      }
    } catch (error) {
      console.error("[AppInitializer] 자동 초기화 중 오류:", error);
      setError("자동 초기화 중 오류가 발생했습니다.");
    } finally {
      setIsInitializing(false);
    }
  };

  // 액세스 토큰이 없는 경우의 처리 플로우
  const handleNoTokenFlow = async (authCode?: string, refCode?: string) => {
    try {
      // 2-1. 토큰 리프레시 1회만 시도
      console.log(
        "[AppInitializer] 리프레시 토큰으로 액세스 토큰 재발급 시도 (1회 시도)"
      );
      const refreshSuccessful = await handleRefreshTokenOnce();

      if (refreshSuccessful) {
        // 리프레시 성공 시 기존 토큰 로그인 플로우
        console.log(
          "[AppInitializer] 리프레시 토큰으로 액세스 토큰 재발급 성공"
        );
        await handleExistingTokenLogin();
        return;
      }

      // 2-2. 리프레시 실패 시 tossLogin 시도
      console.log("[AppInitializer] 리프레시 토큰 실패, tossLogin 시도");
      // 매개변수로 받은 값 우선 사용, 없으면 상태값 사용
      const currentAuthCode = authCode || authorizationCode;
      const currentRefCode = refCode || referrer;

      console.log("[AppInitializer] handleNoTokenFlow에서 사용할 값:", {
        authCode,
        refCode,
        authorizationCode,
        referrer,
        currentAuthCode,
        currentRefCode,
      });

      if (currentAuthCode && currentRefCode) {
        console.log("[AppInitializer] handleTossLoginFlow 호출:", {
          currentAuthCode,
          currentRefCode,
        });
        await handleTossLoginFlow(currentAuthCode, currentRefCode);
      } else {
        console.error(
          "[AppInitializer] authorizationCode 또는 referrer가 설정되지 않음"
        );
        setError("로그인 정보가 올바르지 않습니다.");
      }
    } catch (error: any) {
      console.error("[AppInitializer] 액세스 토큰 없는 경우 처리 실패:", error);
      setError("로그인 처리 중 오류가 발생했습니다.");
    }
  };

  // 리프레시 토큰으로 1회만 시도
  const handleRefreshTokenOnce = async (): Promise<boolean> => {
    try {
      // 이미 리프레시를 시도했는지 확인 (sessionStorage 기반)
      const hasAttemptedRefresh = sessionStorage.getItem("refreshAttempted");
      if (hasAttemptedRefresh) {
        console.log(
          "[AppInitializer] 이미 리프레시를 시도했음 - 중복 시도 방지"
        );
        return false;
      }

      // 리프레시 시도 플래그 설정
      sessionStorage.setItem("refreshAttempted", "true");

      console.log("[AppInitializer] 리프레시 토큰으로 액세스 토큰 재발급 요청");

      // useUserStore의 refreshToken 함수 호출하여 액세스 토큰 재발급
      const refreshSuccessful = await useUserStore.getState().refreshToken();

      if (refreshSuccessful) {
        const newAccessToken = localStorage.getItem("accessToken");

        if (newAccessToken) {
          console.log("[AppInitializer] 액세스 토큰 재발급 성공");
          // 성공 시 플래그 정리
          sessionStorage.removeItem("refreshAttempted");
          return true;
        }
      }

      console.log("[AppInitializer] 액세스 토큰 재발급 실패");

      // 실패 시 리프레시 토큰 만료 여부 확인
      // 실제 에러 메시지를 확인해야 함 (하드코딩된 문자열이 아님)
      console.log("[AppInitializer] 리프레시 실패 - tossLogin으로 전환");
      return false;
    } catch (error: any) {
      console.error("[AppInitializer] 리프레시 토큰 처리 중 오류:", error);

      // 에러 메시지에서 리프레시 토큰 만료 확인
      if (
        error.message &&
        error.message.includes("Invalid or expired Refresh Token")
      ) {
        console.log(
          "[AppInitializer] 리프레시 토큰 만료 에러 감지 - 새 로그인 플로우로 전환"
        );
        clearSessionStorageFlags();
      }

      return false;
    }
  };

  // tossLogin 플로우 처리
  const handleTossLoginFlow = async (authCode?: string, refCode?: string) => {
    try {
      console.log("[AppInitializer] tossLogin 시작");
      console.log("[AppInitializer] handleTossLoginFlow 매개변수:", {
        authCode,
        refCode,
      });

      // authorizationCode와 referrer 확인 (매개변수 우선, 없으면 상태값 사용)
      const currentAuthCode = authCode || authorizationCode;
      const currentRefCode = refCode || referrer;

      console.log("[AppInitializer] handleTossLoginFlow에서 사용할 값:", {
        authCode,
        refCode,
        authorizationCode,
        referrer,
        currentAuthCode,
        currentRefCode,
      });

      if (!currentAuthCode || !currentRefCode) {
        console.error(
          "[AppInitializer] authorizationCode 또는 referrer가 설정되지 않음"
        );
        setError("로그인 정보가 올바르지 않습니다.");
        return;
      }

      // 서버 로그인 처리
      await handleServerLogin(currentAuthCode, currentRefCode);
    } catch (error: any) {
      console.error("[AppInitializer] tossLogin 실패:", error);
      setError(`토스 로그인 실패: ${error.message || "알 수 없는 오류"}`);
    }
  };

  // 기존 토큰으로 로그인 처리
  const handleExistingTokenLogin = async () => {
    try {
      // 초기화 플래그 true로 설정
      localStorage.setItem("isInitialized", "true");

      // fetchUserData 호출하여 사용자 데이터 확인
      await handleFetchUserDataWithRetry();
    } catch (error: any) {
      console.error("[AppInitializer] 기존 토큰 로그인 실패:", error);

      // 인증 관련 에러인 경우 특별 처리
      if (
        error.message &&
        error.message.includes(
          "Full authentication is required to access this resource"
        )
      ) {
        setError("인증이 필요합니다. 다시 로그인해주세요.");
        // 기존 토큰 제거
        localStorage.removeItem("accessToken");
        Cookies.remove("refreshToken");
        localStorage.removeItem("isInitialized");
        return; // 새 로그인 시도하지 않음
      }

      // 기존 토큰이 유효하지 않은 경우 새로 로그인
      await handleNewTokenLogin();
    }
  };

  // fetchUserData 재시도 로직을 포함한 처리
  const handleFetchUserDataWithRetry = async (isRetry: boolean = false) => {
    try {
      await fetchUserData();

      // fetchUserData 성공 시 적절한 페이지로 이동
      await handleNavigationAfterLogin();
    } catch (error: any) {
      // "Please choose your character first." 메시지 처리 (에러로 던져진 경우)
      if (
        error.message &&
        error.message.includes("Please choose your character first")
      ) {
        safeNavigate("/choose-character");
        onInitialized();
        return; // 재시도하지 않고 함수 종료
      }

      // 인증 관련 에러 특별 처리
      if (
        error.message &&
        error.message.includes(
          "Full authentication is required to access this resource"
        )
      ) {
        setError("인증이 필요합니다. 다시 로그인해주세요.");
        return; // 재시도하지 않고 함수 종료
      }

      if (!isRetry) {
        // 첫 번째 실패 시 1회 재시도
        await handleFetchUserDataWithRetry(true);
      } else {
        // 재시도도 실패한 경우 리프레시 토큰으로 액세스 토큰 재발급
        await handleRefreshTokenAndRetry();
      }
    }
  };

  // 리프레시 토큰으로 액세스 토큰 재발급 및 재시도
  const handleRefreshTokenAndRetry = async () => {
    try {
      console.log("[AppInitializer] 리프레시 토큰으로 액세스 토큰 재발급 시도");

      // 재발급된 토큰으로 fetchUserData 재시도
      await handleFetchUserDataWithRetry();
    } catch (error: any) {
      console.error("[AppInitializer] 액세스 토큰 재발급 실패:", error);
      setError("토큰 재발급에 실패했습니다. 다시 로그인해주세요.");

      // 재발급 실패 시 로그아웃 처리
      localStorage.removeItem("accessToken");
      Cookies.remove("refreshToken");
      localStorage.removeItem("isInitialized");

      // 무한 리프레시 방지를 위해 sessionStorage 플래그 설정
      sessionStorage.setItem("redirectingToLogin", "true");
    }
  };

  // 로그인 후 적절한 페이지로 이동하는 로직
  const handleNavigationAfterLogin = async () => {
    try {
      const { characterType } = useUserStore.getState();

      if (!characterType) {
        // 캐릭터가 선택되지 않은 경우 (신규 사용자)
        safeNavigate("/choose-character");
      } else {
        // 캐릭터가 선택된 경우 (기존 사용자)
        safeNavigate("/dice-event");
      }

      // 초기화 완료 처리
      onInitialized();
    } catch (error) {
      console.error("[AppInitializer] 페이지 이동 중 오류:", error);
      setError("페이지 이동 중 오류가 발생했습니다.");
    }
  };

  // 새로운 토큰으로 로그인 처리
  const handleNewTokenLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // authorizationCode와 referrer가 이미 설정되어 있는지 확인
      if (!authorizationCode || !referrer) {
        console.error(
          "[AppInitializer] authorizationCode 또는 referrer가 설정되지 않음"
        );
        setError("로그인 정보가 올바르지 않습니다.");
        return;
      }

      // 서버 로그인 처리
      await handleServerLogin(authorizationCode, referrer);

      // 자동 초기화 완료 처리
      onInitialized();
    } catch (error: any) {
      console.error("[AppInitializer] 토스 로그인 실패:", error);
      setError(`토스 로그인 실패: ${error.message || "알 수 없는 오류"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 안전한 페이지 이동 함수
  const safeNavigate = (
    path: string,
    fallbackToWindowLocation: boolean = true
  ) => {
    try {
      console.log("[AppInitializer] safeNavigate 호출:", {
        path,
        hasReactNativeWebView: !!window.ReactNativeWebView,
        currentPath: window.location.pathname,
      });

      // React Native WebView 환경에서는 window.location을 직접 사용
      if (window.ReactNativeWebView) {
        // localStorage 상태 확인
        const initializationFlag = localStorage.getItem("isInitialized");
        const accessToken = localStorage.getItem("accessToken");

        console.log("[AppInitializer] WebView 환경에서 페이지 이동:", {
          initializationFlag,
          hasAccessToken: !!accessToken,
          targetPath: path,
        });

        // 상태가 제대로 설정되었는지 확인 후 페이지 이동
        if (initializationFlag === "true" && accessToken) {
          // 초기화 완료 처리
          onInitialized();

          // 약간의 지연 후 페이지 이동 (초기화 상태 업데이트를 위해)
          setTimeout(() => {
            console.log("[AppInitializer] WebView에서 페이지 이동 실행:", path);
            window.location.href = path;
          }, 100);
        } else {
          console.error("[AppInitializer] 초기화 상태 또는 토큰이 없음:", {
            initializationFlag,
            hasAccessToken: !!accessToken,
          });
          setError("초기화 상태 설정에 실패했습니다. 다시 시도해주세요.");
        }

        return;
      }

      // 일반 브라우저 환경에서는 React Router navigate 시도
      console.log(
        "[AppInitializer] 일반 브라우저에서 React Router navigate 시도:",
        path
      );
      navigate(path);

      // 초기화 완료 처리
      onInitialized();

      // 약간의 지연 후 페이지 이동 상태 확인
      setTimeout(() => {
        if (window.location.pathname !== path) {
          console.warn(
            "[AppInitializer] React Router navigate 실패, window.location으로 fallback:",
            path
          );
          if (fallbackToWindowLocation) {
            window.location.href = path;
            onInitialized();
          }
        } else {
          console.log("[AppInitializer] React Router navigate 성공:", path);
        }
      }, 100);
    } catch (error) {
      console.error("[AppInitializer] safeNavigate 에러:", error);
      if (fallbackToWindowLocation) {
        console.log(
          "[AppInitializer] 에러 발생으로 window.location fallback:",
          path
        );
        window.location.href = path;
        onInitialized();
      }
    }
  };

  // 서버 로그인 처리
  const handleServerLogin = async (authCode?: string, refCode?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // authorizationCode와 referrer 확인 (매개변수 우선, 없으면 상태값 사용)
      const currentAuthCode = authCode || authorizationCode;
      const currentRefCode = refCode || referrer;

      if (!currentAuthCode || !currentRefCode) {
        console.error(
          "[AppInitializer] handleServerLogin: authorizationCode 또는 referrer가 없음"
        );
        setError("로그인 정보가 올바르지 않습니다.");
        return;
      }

      console.log("[AppInitializer] handleServerLogin 시작:", {
        currentAuthCode: currentAuthCode.substring(0, 10) + "...",
        currentRefCode,
      });

      const result = await tossLogin(currentAuthCode, currentRefCode);

      if (!result) {
        console.error(
          "[AppInitializer] handleServerLogin: tossLogin 결과가 없음"
        );
        setError("로그인 응답이 올바르지 않습니다.");
        return;
      }

      console.log(
        "[AppInitializer] handleServerLogin: tossLogin 성공, 결과 확인:",
        result
      );

      // tossLogin 응답에서 사용자 정보 가져오기
      const { userId, userName, referrerId, isInitial } = result;
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = Cookies.get("refreshToken");

      console.log(
        "[AppInitializer] handleServerLogin: 토큰 및 사용자 정보 확인:",
        {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          userId,
          userName,
          isInitial,
        }
      );

      // userId는 API 문서에 따라 이미 string 타입
      const userIdStr = userId;

      // 토큰이 제대로 저장되었는지 확인
      if (!accessToken) {
        console.error(
          "[AppInitializer] handleServerLogin: accessToken이 없음 - tossLogin은 성공했지만 토큰이 저장되지 않음"
        );
        setError(
          "로그인은 성공했지만 인증 토큰을 받지 못했습니다. 다시 시도해주세요."
        );
        return;
      }

      setServerLoginResult({
        userId: userIdStr,
        userName: userName || undefined,
        referrerId: referrerId || undefined,
        isInitial,
      });

      console.log(
        "[AppInitializer] handleServerLogin: 서버 로그인 결과 설정 완료, 페이지 이동 로직 시작"
      );

      // isInitial에 따른 페이지 이동 로직
      if (isInitial === true) {
        console.log(
          "[AppInitializer] handleServerLogin: 신규 사용자 (isInitial: true) - fetchUserData 호출"
        );
        // 신규 사용자: fetchUserData 호출
        try {
          await fetchUserData();
          console.log(
            "[AppInitializer] handleServerLogin: 신규 사용자 fetchUserData 성공"
          );

          // fetchUserData 성공 시 적절한 페이지로 이동
          await handleNavigationAfterLogin();
        } catch (error: any) {
          console.error(
            "[AppInitializer] handleServerLogin: 신규 사용자 fetchUserData 실패:",
            error
          );

          // "Please choose your character first." 메시지 확인 (에러로 던져진 경우)
          if (
            error.message &&
            error.message.includes("Please choose your character first")
          ) {
            console.log(
              "[AppInitializer] handleServerLogin: 캐릭터 선택 페이지로 이동"
            );
            safeNavigate("/choose-character");
            onInitialized();
          } else {
            setError(
              `fetchUserData 에러: ${error.message || "알 수 없는 오류"}`
            );
          }
        }
      } else {
        // 기존 사용자: fetchUserData 호출하여 실제 캐릭터 상태 확인
        console.log(
          "[AppInitializer] 기존 사용자 (isInitial: false), fetchUserData 호출하여 캐릭터 상태 확인"
        );
        try {
          await fetchUserData();
          console.log(
            "[AppInitializer] handleServerLogin: 기존 사용자 fetchUserData 성공"
          );

          // fetchUserData 성공 시 적절한 페이지로 이동
          await handleNavigationAfterLogin();
        } catch (error: any) {
          console.error(
            "[AppInitializer] 기존 사용자 fetchUserData 에러:",
            error
          );

          // "Please choose your character first." 메시지 확인 (에러로 던져진 경우)
          if (
            error.message &&
            error.message.includes("Please choose your character first")
          ) {
            console.log(
              "[AppInitializer] handleServerLogin: 기존 사용자 캐릭터 선택 페이지로 이동"
            );
            safeNavigate("/choose-character");
            onInitialized();
          } else {
            // 다른 에러인 경우 에러 표시
            setError(
              `기존 사용자 fetchUserData 에러: ${
                error.message || "알 수 없는 오류"
              }`
            );
          }
        }
      }
    } catch (error: any) {
      console.error("[AppInitializer] 서버 로그인 실패:", error);
      setError(`서버 로그인 실패: ${error.message || "알 수 없는 오류"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 중 표시
  if (isInitializing) {
    return (
      <div
        style={{
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          maxWidth: "400px",
          margin: "20px auto",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "20px", color: "#333" }}>
          🔄 토스 로그인 진행 중...
        </h2>
        <div style={{ color: "#666" }}>
          자동으로 로그인을 진행하고 있습니다.
        </div>
      </div>
    );
  }

  // 에러 상태 표시
  if (error) {
    return (
      <div
        style={{
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          maxWidth: "400px",
          margin: "20px auto",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "20px", color: "#e74c3c" }}>
          ❌ 로그인 오류
        </h2>
        <div style={{ color: "#666", marginBottom: "20px" }}>{error}</div>
        <div style={{ fontSize: "14px", color: "#999", marginBottom: "20px" }}>
          <p>• 토스 앱이 최신 버전인지 확인해주세요</p>
          <p>• 네트워크 연결을 확인해주세요</p>
          <p>• 토스 앱에서 다시 시도해주세요</p>
        </div>
        <button
          onClick={() => {
            setError(null);
            handleAppLoginOnEntry();
          }}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        maxWidth: "400px",
        margin: "20px auto",
        textAlign: "center",
      }}
    >
      <h2 style={{ marginBottom: "20px", color: "#333" }}>
        🔄 토스 로그인 진행 중...
      </h2>
      <div style={{ color: "#666" }}>자동으로 로그인을 진행하고 있습니다.</div>
    </div>
  );
};

export default AppInitializer;
