import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { appLogin, isMinVersionSupported } from "@apps-in-toss/web-framework";
import { tossLogin } from "@/entities/User/api/loginToss";
import { useUserStore } from "@/entities/User/model/userModel";
import useWalletStore from '@/shared/store/useWalletStore';
import Cookies from 'js-cookie';

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
  
  // navigate 함수 동작 확인
  // console.log('[AppInitializer] useNavigate 훅 초기화:', { 
  //   navigate: typeof navigate,
  //   currentPath: window.location.pathname
  // });
  
  // 웹뷰 환경 상세 정보 로깅
  // console.log('[AppInitializer] 웹뷰 환경 정보:', {
  //   isWebView: !!window.ReactNativeWebView,
  //   userAgent: navigator.userAgent,
  //   platform: navigator.platform,
  //   location: {
  //     href: window.location.href,
  //     pathname: window.location.pathname,
  //     search: window.location.search,
  //     hash: window.location.hash,
  //     origin: window.location.origin
  //   }
  // });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false); // 자동 초기화 비활성화
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
  const [manualLoginMode, setManualLoginMode] = useState(false);
  const [manualAuthCode, setManualAuthCode] = useState("");
  const [manualReferrer, setManualReferrer] = useState("");
  const { fetchUserData } = useUserStore();

  // 페이지 최초 진입 시 자동 초기화 활성화
  useEffect(() => {
    // console.log("[AppInitializer] 페이지 최초 진입 - 자동 초기화 시작");
    handleAutoInitialization();
  }, []);
  
  // // 페이지 이동 모니터링
  // useEffect(() => {
  //   // console.log('[AppInitializer] 현재 경로 변경 감지:', window.location.pathname);
  //   // console.log('[AppInitializer] 전체 URL 정보:', {
  //     href: window.location.href,
  //     pathname: window.location.pathname,
  //     search: window.location.search,
  //     hash: window.location.hash,
  //     origin: window.location.origin
  //   });
  // }, [window.location.pathname]);
  
  // 웹뷰 환경에서의 라우팅 상태 모니터링
  useEffect(() => {
    const checkRoutingStatus = () => {
      // console.log('[AppInitializer] 라우팅 상태 체크:', {
      //   timestamp: new Date().toISOString(),
      //   currentPath: window.location.pathname,
      //   isWebView: !!window.ReactNativeWebView,
      //   canNavigate: typeof window.location.href !== 'undefined'
      // });
    };
    
    // 초기 체크
    checkRoutingStatus();
    
    // 주기적 체크 (5초마다)
    const interval = setInterval(checkRoutingStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // 자동 초기화 핸들러
  const handleAutoInitialization = async () => {
    try {
      setIsInitializing(true);
      setError(null); // 에러 초기화

      // 0. 로컬스토리지에 액세스토큰 확인
      const accessToken = localStorage.getItem("accessToken");
      // console.log(
      //   "[AppInitializer] 액세스 토큰 확인:",
      //   accessToken ? "존재함" : "존재하지 않음"
      // );

      if (accessToken) {
        // 2. 액세스 토큰이 존재하는 경우
        // console.log("[AppInitializer] 기존 액세스 토큰으로 자동 로그인 시도");
        await handleExistingTokenLogin();
      } else {
        // 1. 액세스 토큰이 존재하지 않는 경우
        // console.log("[AppInitializer] 액세스 토큰 없음 - 토스 로그인 필요");
        await handleNewTokenLogin();
      }
    } catch (error) {
      console.error("[AppInitializer] 자동 초기화 중 오류:", error);
      setError("자동 초기화 중 오류가 발생했습니다.");
    } finally {
      setIsInitializing(false);
    }
  };

  // 기존 토큰으로 로그인 처리
  const handleExistingTokenLogin = async () => {
    try {
      // 초기화 플래그 true로 설정
      localStorage.setItem("isInitialized", "true");
      // console.log("[AppInitializer] 초기화 플래그 설정 완료");

      // fetchUserData 호출하여 사용자 데이터 확인
      await handleFetchUserDataWithRetry();
    } catch (error) {
      console.error("[AppInitializer] 기존 토큰 로그인 실패:", error);
      // 기존 토큰이 유효하지 않은 경우 새로 로그인
      await handleNewTokenLogin();
    }
  };

  // fetchUserData 재시도 로직을 포함한 처리
  const handleFetchUserDataWithRetry = async (isRetry: boolean = false) => {
    try {
      // // console.log(
      //   `[AppInitializer] fetchUserData ${isRetry ? "재시도" : "시도"}`
      // );
      await fetchUserData();

      // fetchUserData 성공 시 사용자 상태 확인
      const { uid, nickName, characterType } = useUserStore.getState();

      if (uid && nickName) {
        // console.log("[AppInitializer] fetchUserData 성공:", {
        //   uid,
        //   nickName,
        //   characterType,
        // });

        // 사용자 데이터를 잘 가져온 경우 적절한 페이지로 이동
        await handleNavigationAfterLogin();
      } else {
        throw new Error("사용자 데이터가 불완전합니다.");
      }
    } catch (error: any) {
      // console.error(
      //   `[AppInitializer] fetchUserData ${isRetry ? "재시도" : ""} 실패:`,
      //   error
      // );

      if (!isRetry) {
        // 첫 번째 실패 시 1회 재시도
        // console.log("[AppInitializer] fetchUserData 1회 재시도");
        await handleFetchUserDataWithRetry(true);
      } else {
        // 재시도도 실패한 경우 리프레시 토큰으로 액세스 토큰 재발급
        // console.log(
        //   "[AppInitializer] fetchUserData 재시도 실패, 리프레시 토큰으로 재발급 시도"
        // );
        await handleRefreshTokenAndRetry();
      }
    }
  };

  // 리프레시 토큰으로 액세스 토큰 재발급 및 재시도
  const handleRefreshTokenAndRetry = async () => {
    try {
      // console.log("[AppInitializer] 리프레시 토큰으로 액세스 토큰 재발급 시작");

      // TODO: 리프레시 토큰 API 호출 (추후 구현 예정)
      // const newAccessToken = await refreshAccessToken();
      // localStorage.setItem('accessToken', newAccessToken);

      // console.log(
      //   "[AppInitializer] 액세스 토큰 재발급 완료, fetchUserData 재시도"
      // );

      // 재발급된 토큰으로 fetchUserData 재시도
      await handleFetchUserDataWithRetry();
    } catch (error: any) {
      console.error("[AppInitializer] 액세스 토큰 재발급 실패:", error);
      setError("토큰 재발급에 실패했습니다. 다시 로그인해주세요.");

      // 재발급 실패 시 로그아웃 처리
      localStorage.removeItem("accessToken");
      Cookies.remove("refreshToken");
      localStorage.removeItem("isInitialized");
    }
  };

  // 로그인 후 적절한 페이지로 이동하는 로직
  const handleNavigationAfterLogin = async () => {
    try {
      const { characterType } = useUserStore.getState();

      if (!characterType) {
        // 캐릭터가 선택되지 않은 경우 (신규 사용자)
        // console.log("[AppInitializer] 신규 사용자 - /choose-character로 이동");
        safeNavigate("/choose-character");
      } else {
        // 캐릭터가 선택된 경우 (기존 사용자)
        // console.log("[AppInitializer] 기존 사용자 - /dice-event로 이동");
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
    // console.log("[AppInitializer] 토스 로그인 시작");
    // console.log("[AppInitializer] 현재 상태:", {
    //   authorizationCode,
    //   referrer,
    //   isLoading,
    //   error
    // });
    
    try {
      setIsLoading(true);
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

      // console.log("[AppInitializer] 토스 앱 환경 및 버전 확인 완료");

      // appLogin 함수 호출
      // console.log("[AppInitializer] appLogin 함수 호출 시작");
      const loginResult = await appLogin();
      // console.log("[AppInitializer] appLogin 응답:", loginResult);
      
      // 타입 안전성을 위한 검증
      if (!loginResult || typeof loginResult !== 'object') {
        throw new Error('appLogin 응답이 올바르지 않습니다.');
      }
      
      const { authorizationCode, referrer } = loginResult;
      
      if (!authorizationCode || typeof authorizationCode !== 'string') {
        throw new Error('authorizationCode가 올바르지 않습니다.');
      }
      
      if (!referrer || (referrer !== 'DEFAULT' && referrer !== 'SANDBOX')) {
        console.warn('[AppInitializer] referrer가 예상된 값이 아닙니다:', referrer);
      }
      
      setAuthorizationCode(authorizationCode);
      setReferrer(referrer);
      setLoginResult({ authorizationCode, referrer });

      // console.log("[AppInitializer] 토스 로그인 성공:", {
      //   authorizationCode,
      //   referrer,
      // });

      // Native 앱에 성공 메시지 전송
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: "loginSuccess",
            authorizationCode,
            referrer,
            timestamp: Date.now(),
          })
        );
        // console.log("[AppInitializer] Native 앱에 성공 메시지 전송 완료");
      }

      // 자동 초기화 모드에서는 토스 로그인 성공 후 서버 로그인 자동 진행
      if (isInitializing) {
        // console.log("[AppInitializer] 자동 초기화 모드 - 서버 로그인 자동 진행");
        await handleServerLogin();
        // console.log("[AppInitializer] 서버 로그인 자동 시도 완료");
      }
      
      // 자동 초기화 완료 처리
      onInitialized();
      
    } catch (error: any) {
      console.error("[AppInitializer] 토스 로그인 실패:", error);
      
      // appLogin 관련 에러 상세 분석
      if (error.message && error.message.includes('appLogin')) {
        console.error('[AppInitializer] appLogin 함수 관련 에러:', error);
        setError(`appLogin 함수 에러: ${error.message}`);
      } else {
        setError(`토스 로그인 실패: ${error.message || "알 수 없는 오류"}`);
      }

      // Native 앱에 에러 메시지 전송
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: "loginError",
            error: error?.message || "알 수 없는 에러",
            timestamp: Date.now(),
          })
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 안전한 페이지 이동 함수
  const safeNavigate = (path: string, fallbackToWindowLocation: boolean = true) => {
    // console.log(`[AppInitializer] 안전한 페이지 이동 시도: ${path}`);
    // console.log(`[AppInitializer] 현재 환경:`, {
    //   isWebView: !!window.ReactNativeWebView,
    //   currentPath: window.location.pathname,
    //   currentHref: window.location.href,
    //   userAgent: navigator.userAgent,
    // });
    
    try {
      // React Native WebView 환경에서는 window.location을 직접 사용
      if (window.ReactNativeWebView) {
        // console.log(`[AppInitializer] React Native WebView 환경에서 window.location 사용: ${path}`);
        // console.log(`[AppInitializer] 이동 전 상태:`, {
        //   pathname: window.location.pathname,
        //   href: window.location.href,
        //   search: window.location.search,
        //   hash: window.location.hash,
        // });
        
        // 초기화 완료 처리 (페이지 이동 전에 호출)
        // console.log(`[AppInitializer] onInitialized 호출 시작`);
        onInitialized();
        // console.log(`[AppInitializer] onInitialized 호출 완료`);
        
        // localStorage 상태 확인
        const initializationFlag = localStorage.getItem("isInitialized");
        const accessToken = localStorage.getItem("accessToken");
        // console.log(`[AppInitializer] localStorage 상태 확인:`, {
        //   initializationFlag,
        //   accessToken: accessToken ? "존재함" : "존재하지 않음",
        // });
        
        // 상태가 제대로 설정되었는지 확인 후 페이지 이동
        if (initializationFlag === "true" && accessToken) {
          // console.log(`[AppInitializer] 초기화 상태 확인 완료, 페이지 이동 실행: ${path}`);
          
          // 약간의 지연 후 페이지 이동 (초기화 상태 업데이트를 위해)
          setTimeout(() => {
            // console.log(`[AppInitializer] 페이지 이동 실행: ${path}`);
            window.location.href = path;
            // console.log(`[AppInitializer] window.location.href 설정 완료: ${path}`);
          }, 100); // 지연 시간을 줄임
        } else {
          console.error(`[AppInitializer] 초기화 상태가 제대로 설정되지 않음!`);
          setError('초기화 상태 설정에 실패했습니다. 다시 시도해주세요.');
        }
        
        return;
      }
      
      // 일반 브라우저 환경에서는 React Router navigate 시도
      navigate(path);
      // console.log(`[AppInitializer] navigate 성공: ${path}`);
      
      // 초기화 완료 처리
      onInitialized();
      
      // 약간의 지연 후 페이지 이동 상태 확인
      setTimeout(() => {
        if (window.location.pathname !== path) {
          // console.warn(`[AppInitializer] navigate 후 경로 불일치, window.location 사용: ${path}`);
          if (fallbackToWindowLocation) {
            window.location.href = path;
            onInitialized();
          }
        }
      }, 100);
      
    } catch (error) {
      // console.error(`[AppInitializer] navigate 실패: ${path}`, error);
      
      if (fallbackToWindowLocation) {
        // console.log(`[AppInitializer] fallback으로 window.location 사용: ${path}`);
        window.location.href = path;
        onInitialized();
      }
    }
  };

  // 서버 로그인 처리
  const handleServerLogin = async () => {
    // console.log('[AppInitializer] 서버 로그인 시작');
    // console.log('[AppInitializer] 현재 상태:', {
    //   authorizationCode,
    //   referrer,
    //   manualAuthCode,
    //   manualReferrer,
    //   isLoading,
    //   error
    // });
    
    try {
      setIsLoading(true);
      setError(null);

      // authorizationCode와 referrer가 있으면 우선 사용, 없으면 manual 값 사용
      const authCode = authorizationCode || manualAuthCode || 'test-auth-code';
      const referrerValue = referrer || manualReferrer || 'test-referrer';
      
      // console.log('[AppInitializer] 사용할 인증 정보:', { 
      //   authCode, 
      //   referrerValue,
      //   source: authorizationCode ? 'toss login' : (manualAuthCode ? 'manual input' : 'default')
      // });

      // console.log('[AppInitializer] tossLogin 함수 호출 시작');
      const result = await tossLogin(authCode, referrerValue);
      // console.log('[AppInitializer] tossLogin 응답:', result);

      if (!result) {
        throw new Error('tossLogin에서 응답을 받지 못했습니다.');
      }

      // localStorage에서 사용자 정보 가져오기 (tossLogin에서 저장된 데이터)
      const userId = localStorage.getItem("userId");
      const userName = localStorage.getItem("userName");
      const referrerId = localStorage.getItem("referrerId");
      const isInitial = localStorage.getItem("isInitial") === "true";
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = Cookies.get("refreshToken");
      
      // console.log('[AppInitializer] localStorage에서 가져온 데이터:', {
      //   userId,
      //   userName,
      //   referrerId,
      //   isInitial,
      //   accessToken: accessToken ? "존재함" : "존재하지 않음",
      //   refreshToken: refreshToken ? "존재함" : "존재하지 않음",
      // });

      // 토큰이 제대로 저장되었는지 확인
      if (!accessToken) {
        console.error('[AppInitializer] 액세스 토큰이 저장되지 않음!');
        setError('액세스 토큰 저장에 실패했습니다. 다시 시도해주세요.');
        return;
      }

      setServerLoginResult({ 
        userId: userId || undefined, 
        userName: userName || undefined, 
        referrerId: referrerId || undefined, 
        isInitial 
      });

      // isInitial에 따른 페이지 이동 로직
      if (isInitial === true) {
        // console.log('[AppInitializer] 신규 사용자: fetchUserData 호출 후 응답 확인');
        
        try {
          // fetchUserData 호출 (Promise<void> 반환)
          // console.log('[AppInitializer] fetchUserData 호출 시작');
          await fetchUserData();
          // console.log('[AppInitializer] fetchUserData 완료');
          
          // fetchUserData 완료 후 사용자 상태 확인
          const { uid, nickName, characterType } = useUserStore.getState();
          // console.log('[AppInitializer] 사용자 상태:', { uid, nickName, characterType });
          
          if (uid && nickName) {
            // console.log('[AppInitializer] 사용자 데이터 완성, dice-event 페이지로 이동');
            safeNavigate('/dice-event');
          } else {
            // console.log('[AppInitializer] 사용자 데이터 불완전, choose-character 페이지로 이동');
            safeNavigate('/choose-character');
          }
        } catch (error: any) {
          console.error('[AppInitializer] fetchUserData 에러:', error);
          
          // "Please choose your character first." 메시지 확인 (대소문자 구분 없이)
          if (error.message && error.message.toLowerCase().includes('please choose your character first')) {
            // console.log('[AppInitializer] 캐릭터 선택 필요 확인, choose-character 페이지로 이동');
            safeNavigate('/choose-character');
          } else {
            // 다른 에러인 경우 에러 표시
            setError(`fetchUserData 에러: ${error.message || '알 수 없는 오류'}`);
          }
        }
      } else {
        // console.log('[AppInitializer] 기존 사용자: dice-event 페이지로 이동');
        safeNavigate('/dice-event');
      }

    } catch (error: any) {
      console.error('[AppInitializer] 서버 로그인 실패:', error);
      setError(`서버 로그인 실패: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
      // console.log('[AppInitializer] 서버 로그인 완료');
    }
  };

  // 수동 토스 로그인 (테스트용)
  const handleManualTossLogin = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    await handleNewTokenLogin();
  };

  // 수동 서버 로그인 (테스트용)
  const handleManualServerLogin = async () => {
    // console.log('[AppInitializer] 수동 서버 로그인 시작');
    // console.log('[AppInitializer] 사용 가능한 값들:', { 
    //   authorizationCode,
    //   referrer,
    //   manualAuthCode: `"${manualAuthCode}"`, 
    //   manualReferrer: `"${manualReferrer}"`
    // });
    
    // authorizationCode와 referrer가 있으면 바로 진행, 없으면 manual 값 확인
    if (!authorizationCode && !referrer && (!manualAuthCode || !manualReferrer)) {
      const errorMsg = "토스 로그인을 진행하거나 수동으로 인증 코드와 추천인을 모두 입력해주세요.";
      console.error('[AppInitializer] 필요한 값 없음:', errorMsg);
      setError(errorMsg);
      return;
    }
    
    // console.log('[AppInitializer] 값 확인 완료, handleServerLogin 호출');
    await handleServerLogin();
  };

  // 수동 초기화 (테스트용) - 주석처리
  // const handleManualInitialization = async (e?: React.MouseEvent) => {
  //   if (e) {
  //     e.preventDefault();
  //   }
  //   await handleAutoInitialization();
  // };

  // 수동 인증 코드와 리퍼러로 서버 로그인 (주석처리)
  // const handleManualAuthCodeLogin = async (e: React.FormEvent) => {
  //   e.preventDefault();
    
  //   if (!manualAuthCode.trim() || !manualReferrer.trim()) {
  //     setError("인증 코드와 리퍼러를 모두 입력해주세요.");
  //     return;
  //   }

  //   try {
  //     setIsLoading(true);
  //     setError(null);
      
  //     await handleServerLogin(manualAuthCode.trim(), manualReferrer.trim());
      
  //       // 성공 시 입력 필드 초기화
  //       setManualAuthCode("");
  //       setManualReferrer("");
  //   } catch (error) {
  //     console.error("[AppInitializer] 수동 인증 코드 로그인 실패:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // 에러 메시지 지우기
  const clearError = () => {
    setError(null);
  };

  // 샌드박스 디버깅 정보 출력
  const showSandboxDebugInfo = () => {
    // console.log('🔍 [Sandbox Debug] 환경 정보 확인');
    // console.log('🔍 [Sandbox Debug] 현재 환경:', import.meta.env.MODE);
    // console.log('🔍 [Sandbox Debug] VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
    // console.log('🔍 [Sandbox Debug] 기본 API URL:', import.meta.env.VITE_API_BASE_URL || 'https://28d8c99bdda5.ngrok-free.app/api/');
    // console.log('🔍 [Sandbox Debug] localStorage 액세스 토큰:', localStorage.getItem('accessToken') ? '존재함' : '없음');
    // console.log('🔍 [Sandbox Debug] 쿠키 정보:', document.cookie);
    
    // API 설정 테스트
    const testUrl = `${import.meta.env.VITE_API_BASE_URL || 'https://28d8c99bdda5.ngrok-free.app/api/'}home`;
    // console.log('🌐 [Sandbox Debug] 테스트 URL:', testUrl);
    
    // 환경 변수 전체 확인
    // console.log('⚙️ [Sandbox Debug] 모든 환경 변수:', {
    //   MODE: import.meta.env.MODE,
    //   DEV: import.meta.env.DEV,
    //   PROD: import.meta.env.PROD,
    //   VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    //   NODE_ENV: import.meta.env.NODE_ENV
    // });
    
    // 현재 프론트엔드 실행 URL 정보
    // console.log('🏠 [Sandbox Debug] 프론트엔드 실행 정보:', {
    //   currentURL: window.location.href,
    //   protocol: window.location.protocol,
    //   hostname: window.location.hostname,
    //   port: window.location.port,
    //   pathname: window.location.pathname,
    //   origin: window.location.origin
    // });
    
    // Vite 개발 서버 정보
    // console.log('⚡ [Sandbox Debug] Vite 개발 서버 정보:', {
    //   isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    //   isDevelopment: import.meta.env.DEV,
    //   vitePort: window.location.port || '기본 포트 (80/443)'
    // });
  };

  // OPTIONS preflight 요청 테스트 함수
  const testOptionsPreflight = async () => {
    try {
      // console.log('🚨 [OPTIONS Test] CORS preflight 요청 테스트 시작');
      
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://28d8c99bdda5.ngrok-free.app/api/';
      const testUrl = `${baseURL}home`;
      
      // console.log('🚨 [OPTIONS Test] 테스트 URL:', testUrl);
      // console.log('🚨 [OPTIONS Test] Authorization 헤더 포함 요청 시도');
      
      // fetch API를 사용하여 OPTIONS 요청 시뮬레이션
      const response = await fetch(testUrl, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'test-token'}`,
          'Content-Type': 'application/json',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Authorization, Content-Type',
          'ngrok-skip-browser-warning': 'true', // ngrok 경고 우회
        }
      });
      
      // console.log('✅ [OPTIONS Test] OPTIONS 요청 성공:', response);
      // console.log('✅ [OPTIONS Test] 응답 상태:', response.status);
      // console.log('✅ [OPTIONS Test] 응답 헤더:', response.headers);
      
    } catch (error: any) {
      // console.error('❌ [OPTIONS Test] OPTIONS 요청 실패:', error);
      // console.error('❌ [OPTIONS Test] 에러 타입:', error.name);
      // console.error('❌ [OPTIONS Test] 에러 메시지:', error.message);
      
      if (error.message.includes('CORS') || error.message.includes('Network Error')) {
        // console.error('🚨 [OPTIONS Test] CORS 에러로 판단됨');
        // console.error('🚨 [OPTIONS Test] 서버에서 OPTIONS 요청에 대한 응답이 없거나 CORS 헤더 부족');
      }
    }
  };

  // 쿼리 파라미터로 토큰 전달하는 /home API 테스트
  const testHomeApiWithQueryToken = async () => {
    try {
      // console.log('🔍 [Query Token Test] 쿼리 파라미터로 토큰 전달하는 /home API 테스트');
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('액세스 토큰이 없습니다. 먼저 로그인해주세요.');
        return;
      }
      
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://28d8c99bdda5.ngrok-free.app/api/';
      const testUrl = `${baseURL}home?token=${encodeURIComponent(token)}`;
      
      // console.log('🌐 [Query Token Test] 테스트 URL:', testUrl);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'text/plain', // 단순 요청으로 만들기
          'ngrok-skip-browser-warning': 'true', // ngrok 경고 우회
        },
        mode: 'cors',
      });
      
      const data = await response.json();
      // console.log('✅ [Query Token Test] /home API 성공:', data);
      setError(null);
      
    } catch (error: any) {
      console.error('❌ [Query Token Test] /home API 실패:', error);
      setError(`쿼리 파라미터 테스트 실패: ${error.message || "알 수 없는 오류"}`);
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
        <h2 style={{ marginBottom: "20px", color: "#333" }}>🔄 토스 로그인 진행 중...</h2>
        <div style={{ color: "#666" }}>
          자동으로 로그인을 진행하고 있습니다.
        </div>
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
      <h2 style={{ marginBottom: "20px", color: "#333" }}>🔄 토스 로그인 진행 중...</h2>
      <div style={{ color: "#666" }}>
        자동으로 로그인을 진행하고 있습니다.
      </div>
    </div>
  );
};

export default AppInitializer;
