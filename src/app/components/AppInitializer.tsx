import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { appLogin, isMinVersionSupported } from "@apps-in-toss/web-framework";
import { tossLogin } from "@/entities/User/api/loginToss";
import { useUserStore } from "@/entities/User/model/userModel";
import Cookies from "js-cookie";
import api from "@/shared/api/axiosInstance";

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
      }
    });
  };

  // tossLogin 전에 모든 토큰 정리 함수 (Redis 충돌 방지)
  const clearAllTokensBeforeNewLogin = async () => {
    try {
      
      // 1. 로컬스토리지의 액세스 토큰 삭제
      if (localStorage.getItem("accessToken")) {
        localStorage.removeItem("accessToken");
      }
      
      // 2. 초기화 플래그 삭제
      if (localStorage.getItem("isInitialized")) {
        localStorage.removeItem("isInitialized");
      }
      
      // 3.  중요: 서버에 명시적 로그아웃 요청으로 Redis 리프레시 토큰 정리
      try {
        await api.post('/auth/logout', {}, {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true, // HttpOnly 쿠키 전송
          timeout: 10000 // 로그아웃은 빠르게 처리
        });
      } catch (logoutError: any) {
        console.warn("[AppInitializer] 서버 로그아웃 요청 실패:", {
          status: logoutError.response?.status,
          message: logoutError.message,
          note: "무시하고 계속 진행"
        });
      }
      
      // 4. 모든 세션 스토리지 플래그 정리
      clearSessionStorageFlags();
      
      // 5. ⭐ 서버 처리 완료를 위한 충분한 대기 시간
      await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5초 대기
      
    } catch (error) {
      console.error("[AppInitializer] 토큰 정리 중 오류:", error);
      // 토큰 정리 실패해도 계속 진행
    }
  };



  // 토큰 충돌 시 재시도 로직 (개선)
  const handleTokenConflictRetry = async (authCode?: string, refCode?: string) => {
    try {
      
      // 1. 더 강력한 토큰 정리 (Redis 포함)
      await clearAllTokensBeforeNewLogin();
      
      // 2. 새로운 appLogin으로 authorizationCode 재획득
      const newLoginResult = await appLogin();
      const { authorizationCode: newAuthCode, referrer: newRefCode } = newLoginResult;
      
      // 3. ⭐ 추가 대기 시간 (서버 Redis 상태 안정화)
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기
      
      // 4. 새로운 authorizationCode로 tossLogin 재시도
      await handleServerLogin(newAuthCode, newRefCode);
      
    } catch (retryError: any) {
      console.error("[AppInitializer] 토큰 충돌 재시도 실패:", retryError);
      setError(`로그인 재시도 실패: ${retryError.message || "알 수 없는 오류"}`);
    }
  };

  // 페이지 최초 진입 시 자동 초기화 활성화
  useEffect(() => {

    // 앱인토스 웹뷰 환경에서 모든 세션 스토리지 플래그 정리
    clearSessionStorageFlags();

    // AppInitializer 재실행 플래그 확인
    if (sessionStorage.getItem("restartAppInitializer")) {
      sessionStorage.removeItem("restartAppInitializer");

      // 액세스 토큰이 있다면 삭제 (리프레시 실패로 인한 재실행이므로)
      if (localStorage.getItem("accessToken")) {
        localStorage.removeItem("accessToken");
      }

      // 초기화 플래그도 삭제 (새로운 로그인 시도이므로)
      localStorage.removeItem("isInitialized");
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


      // 초기화되지 않은 상태에서 루트가 아닌 페이지에 있는 경우
      if (!isInitialized && currentPath !== "/" && currentPath !== "/login") {
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
      const loginResult = await appLogin();

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
        await handleExistingTokenLogin();
      } else {
        // 2. 액세스 토큰이 없는 경우
        await handleNoTokenFlow(authCode, refCode);
      }
    } catch (error) {
      console.error("[AppInitializer] 자동 초기화 중 오류:", error);
      setError("자동 초기화 중 오류가 발생했습니다.");
    } finally {
      setIsInitializing(false);
    }
  };

  // 액세스 토큰이 없는 경우의 처리 플로우 (개선)
  const handleNoTokenFlow = async (authCode?: string, refCode?: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        // 액세스 토큰이 없으면 리프레시 토큰으로 시도
        
        // 리프레시 시도 로깅
        const noTokenLog = {
          time: new Date().toLocaleTimeString(),
          action: 'app_no_token_refresh_attempt'
        };
        localStorage.setItem('refreshToken_logs', JSON.stringify(noTokenLog));
        
        try {
          // 리프레시 토큰으로 fetchUserData 시도
          await fetchUserData();
          
          // 리프레시 성공 로깅
          const refreshSuccessLog = {
            time: new Date().toLocaleTimeString(),
            action: 'app_no_token_refresh_success'
          };
          localStorage.setItem('refreshToken_logs', JSON.stringify(refreshSuccessLog));
          
          await handleNavigationAfterLogin();
          return;
        } catch (refreshError: any) {
          // 리프레시 실패 로깅
          const refreshFailLog = {
            time: new Date().toLocaleTimeString(),
            action: 'app_no_token_refresh_failed',
            error: refreshError.response?.status || 'No status'
          };
          localStorage.setItem('refreshToken_logs', JSON.stringify(refreshFailLog));
          
          // 리프레시 실패 시 tossLogin으로 진행
          const currentAuthCode = authCode || authorizationCode;
          const currentRefCode = refCode || referrer;

          if (currentAuthCode && currentRefCode) {
            await handleTossLoginFlow(currentAuthCode, currentRefCode);
          } else {
            console.error(
              "[AppInitializer] authorizationCode 또는 referrer가 설정되지 않음"
            );
            setError("로그인 정보가 올바르지 않습니다.");
          }
        }
        return;
      }
      
      // 액세스 토큰이 있으면 fetchUserData 시도 (axiosInstance에서 리프레시 처리)
      
      // 액세스 토큰 있음 로깅
      const hasTokenLog = {
        time: new Date().toLocaleTimeString(),
        action: 'app_has_token_fetch_user_data'
      };
      localStorage.setItem('refreshToken_logs', JSON.stringify(hasTokenLog));
      
      try {
        await fetchUserData();
        
        // fetchUserData 성공 로깅
        const fetchSuccessLog = {
          time: new Date().toLocaleTimeString(),
          action: 'app_fetch_user_data_success'
        };
        localStorage.setItem('refreshToken_logs', JSON.stringify(fetchSuccessLog));
        
        await handleNavigationAfterLogin();
        return;
      } catch (fetchError: any) {
        // fetchUserData 실패 로깅
        const fetchFailLog = {
          time: new Date().toLocaleTimeString(),
          action: 'app_fetch_user_data_failed',
          error: fetchError.response?.status || 'No status'
        };
        localStorage.setItem('refreshToken_logs', JSON.stringify(fetchFailLog));
        
        // fetchUserData 실패 시 tossLogin으로 새 토큰 발급
        const currentAuthCode = authCode || authorizationCode;
        const currentRefCode = refCode || referrer;

        if (currentAuthCode && currentRefCode) {
          await handleTossLoginFlow(currentAuthCode, currentRefCode);
        } else {
          console.error(
            "[AppInitializer] authorizationCode 또는 referrer가 설정되지 않음"
          );
          setError("로그인 정보가 올바르지 않습니다.");
        }
      }
    } catch (error: any) {
      // 전체 에러 로깅
      const generalErrorLog = {
        time: new Date().toLocaleTimeString(),
        action: 'app_handle_no_token_flow_error',
        error: error.response?.status || 'No status'
      };
      localStorage.setItem('refreshToken_logs', JSON.stringify(generalErrorLog));
      console.error("[AppInitializer] 액세스 토큰 없는 경우 처리 실패:", error);
      setError("로그인 처리 중 오류가 발생했습니다.");
    }
  };



  // tossLogin 플로우 처리
  const handleTossLoginFlow = async (authCode?: string, refCode?: string) => {
    try {
      
      // tossLogin 시작 로깅
      const tossLoginStartLog = {
        time: new Date().toLocaleTimeString(),
        action: 'app_toss_login_start'
      };
      localStorage.setItem('refreshToken_logs', JSON.stringify(tossLoginStartLog));
      

      // authorizationCode와 referrer 확인 (매개변수 우선, 없으면 상태값 사용)
      const currentAuthCode = authCode || authorizationCode;
      const currentRefCode = refCode || referrer;


      if (!currentAuthCode || !currentRefCode) {
        // 매개변수 없음 에러 로깅
        const noParamsLog = {
          time: new Date().toLocaleTimeString(),
          action: 'app_toss_login_no_params'
        };
        localStorage.setItem('refreshToken_logs', JSON.stringify(noParamsLog));
        
        console.error(
          "[AppInitializer] authorizationCode 또는 referrer가 설정되지 않음"
        );
        setError("로그인 정보가 올바르지 않습니다.");
        return;
      }

      // tossLogin 전에 기존 토큰 완전 정리 (Redis 충돌 방지)
      await clearAllTokensBeforeNewLogin();

      // 서버 로그인 처리
      await handleServerLogin(currentAuthCode, currentRefCode);
    } catch (error: any) {
      // tossLogin 실패 로깅
      const tossLoginFailLog = {
        time: new Date().toLocaleTimeString(),
        action: 'app_toss_login_failed',
        error: error.response?.status || 'No status'
      };
      localStorage.setItem('refreshToken_logs', JSON.stringify(tossLoginFailLog));
      
      console.error("[AppInitializer] tossLogin 실패:", error);
      
      // 특정 에러 타입에 따른 처리
      if (error.response?.status === 409 || error.message?.includes('conflict')) {
        // 토큰 충돌 로깅
        const conflictLog = {
          time: new Date().toLocaleTimeString(),
          action: 'app_token_conflict_detected'
        };
        localStorage.setItem('refreshToken_logs', JSON.stringify(conflictLog));
        
        await handleTokenConflictRetry(authCode, refCode);
      } else {
        setError(`토스 로그인 실패: ${error.message || "알 수 없는 오류"}`);
      }
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

  // fetchUserData 재시도 로직 (개선)
  const handleFetchUserDataWithRetry = async (isRetry: boolean = false) => {
    try {
      await fetchUserData();
      await handleNavigationAfterLogin();
    } catch (error: any) {
      // "Please choose your character first." 메시지 처리
      if (error.message && error.message.includes("Please choose your character first")) {
        safeNavigate("/choose-character");
        onInitialized();
        return;
      }

      // 인증 관련 에러 처리
      if (error.message && error.message.includes("Full authentication is required to access this resource")) {
        
        // ⭐ 토큰 정리 후 새 로그인 시도
        await clearAllTokensBeforeNewLogin();
        await handleNewTokenLogin();
        return;
      }

      if (!isRetry) {
        await handleFetchUserDataWithRetry(true);
      } else {
        await clearAllTokensBeforeNewLogin();
        await handleNewTokenLogin();
      }
    }
  };

  // 리프레시 토큰으로 액세스 토큰 재발급 및 재시도
  const handleRefreshTokenAndRetry = async () => {
    try {

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
      // React Native WebView 환경에서는 window.location을 직접 사용
      if (window.ReactNativeWebView) {
        // localStorage 상태 확인
        const initializationFlag = localStorage.getItem("isInitialized");
        const accessToken = localStorage.getItem("accessToken");

        // 상태가 제대로 설정되었는지 확인 후 페이지 이동
        if (initializationFlag === "true" && accessToken) {
          // 초기화 완료 처리
          onInitialized();

          // 약간의 지연 후 페이지 이동 (초기화 상태 업데이트를 위해)
          setTimeout(() => {
            window.location.href = path;
          }, 100);
        } else {
          setError("초기화 상태 설정에 실패했습니다. 다시 시도해주세요.");
        }

        return;
      }

      // 일반 브라우저 환경에서는 React Router navigate 시도
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
        }
      }, 100);
    } catch (error) {
      console.error("[AppInitializer] safeNavigate 에러:", error);
      if (fallbackToWindowLocation) {
        window.location.href = path;
        onInitialized();
      }
    }
  };

  // 서버 로그인 처리 (개선)
  const handleServerLogin = async (authCode?: string, refCode?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const currentAuthCode = authCode || authorizationCode;
      const currentRefCode = refCode || referrer;

      if (!currentAuthCode || !currentRefCode) {
        // 서버 로그인 매개변수 없음 로깅
        const noParamsLog = {
          time: new Date().toLocaleTimeString(),
          action: 'app_server_login_no_params'
        };
        localStorage.setItem('refreshToken_logs', JSON.stringify(noParamsLog));
        
        console.error("[AppInitializer] handleServerLogin: authorizationCode 또는 referrer가 없음");
        setError("로그인 정보가 올바르지 않습니다.");
        return;
      }

      // 서버 로그인 시작 로깅
      const serverLoginStartLog = {
        time: new Date().toLocaleTimeString(),
        action: 'app_server_login_start'
      };
      localStorage.setItem('refreshToken_logs', JSON.stringify(serverLoginStartLog));

      // tossLogin 전 토큰 정리 (Redis 동기화)
      await clearAllTokensBeforeNewLogin();

      // tossLogin 호출
      const result = await tossLogin(currentAuthCode, currentRefCode);

      if (!result) {
        // tossLogin 결과 없음 로깅
        const noResultLog = {
          time: new Date().toLocaleTimeString(),
          action: 'app_toss_login_no_result'
        };
        localStorage.setItem('refreshToken_logs', JSON.stringify(noResultLog));
        
        console.error("[AppInitializer] handleServerLogin: tossLogin 결과가 없음");
        setError("로그인 응답이 올바르지 않습니다.");
        return;
      }


      // tossLogin 성공 로깅
      const tossLoginSuccessLog = {
        time: new Date().toLocaleTimeString(),
        action: 'app_toss_login_success'
      };
      localStorage.setItem('refreshToken_logs', JSON.stringify(tossLoginSuccessLog));

      // tossLogin 응답에서 사용자 정보 가져오기
      const { userId, userName, referrerId, isInitial } = result;
      const accessToken = localStorage.getItem("accessToken");

      // 토큰 및 사용자 정보 로깅
      const tokenInfoLog = {
        time: new Date().toLocaleTimeString(),
        action: 'app_token_user_info',
        hasAccessToken: !!accessToken,
        isInitial: isInitial
      };
      localStorage.setItem('refreshToken_logs', JSON.stringify(tokenInfoLog));

      if (!accessToken) {
        // 액세스 토큰 없음 로깅
        const noAccessTokenLog = {
          time: new Date().toLocaleTimeString(),
          action: 'app_no_access_token_after_toss_login'
        };
        localStorage.setItem('refreshToken_logs', JSON.stringify(noAccessTokenLog));
        
        console.error("[AppInitializer] accessToken이 없음");
        setError("로그인은 성공했지만 인증 토큰을 받지 못했습니다. 다시 시도해주세요.");
        return;
      }

      setServerLoginResult({
        userId: userId,
        userName: userName || undefined,
        referrerId: referrerId || undefined,
        isInitial,
      });

      // 초기화 플래그 설정
      localStorage.setItem("isInitialized", "true");

      // 초기화 플래그 설정 로깅
      const initFlagLog = {
        time: new Date().toLocaleTimeString(),
        action: 'app_init_flag_set'
      };
      localStorage.setItem('refreshToken_logs', JSON.stringify(initFlagLog));

      // 새로운 토큰 발급 완료 후 잠시 대기 (토큰 동기화)
      await new Promise(resolve => setTimeout(resolve, 500));

      // 사용자 타입에 따른 페이지 이동
      if (isInitial === true) {
        
        // 신규 사용자 로깅
        const newUserLog = {
          time: new Date().toLocaleTimeString(),
          action: 'app_new_user_fetch_user_data'
        };
        localStorage.setItem('refreshToken_logs', JSON.stringify(newUserLog));
        
        try {
          await fetchUserData();
          await handleNavigationAfterLogin();
        } catch (error: any) {
          if (error.message && error.message.includes("Please choose your character first")) {
            safeNavigate("/choose-character");
            onInitialized();
          } else {
            setError(`fetchUserData 에러: ${error.message || "알 수 없는 오류"}`);
          }
        }
      } else {
        
        // 기존 사용자 로깅
        const existingUserLog = {
          time: new Date().toLocaleTimeString(),
          action: 'app_existing_user_fetch_user_data'
        };
        localStorage.setItem('refreshToken_logs', JSON.stringify(existingUserLog));
        
        try {
          await fetchUserData();
          await handleNavigationAfterLogin();
        } catch (error: any) {
          if (error.message && error.message.includes("Please choose your character first")) {
            safeNavigate("/choose-character");
            onInitialized();
          } else {
            setError(`기존 사용자 fetchUserData 에러: ${error.message || "알 수 없는 오류"}`);
          }
        }
      }

    } catch (error: any) {
      // 서버 로그인 실패 로깅
      const serverLoginFailLog = {
        time: new Date().toLocaleTimeString(),
        action: 'app_server_login_failed',
        error: error.response?.status || 'No status'
      };
      localStorage.setItem('refreshToken_logs', JSON.stringify(serverLoginFailLog));
      
      console.error("[AppInitializer] 서버 로그인 실패:", error);
      
      // ⭐ 토큰 충돌 에러 감지 및 처리
      if (
        error.response?.status === 409 || 
        error.message?.includes('conflict') ||
        error.message?.includes('already exists') ||
        error.response?.data?.message?.includes('Redis')
      ) {
        // 토큰 충돌 감지 로깅
        const conflictDetectedLog = {
          time: new Date().toLocaleTimeString(),
          action: 'app_token_conflict_redis_sync_issue',
          error: error.response?.status || 'No status'
        };
        localStorage.setItem('refreshToken_logs', JSON.stringify(conflictDetectedLog));
        
        await handleTokenConflictRetry(authCode, refCode);
      } else {
        setError(`서버 로그인 실패: ${error.message || "알 수 없는 오류"}`);
      }
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
