import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { appLogin, isMinVersionSupported } from "@apps-in-toss/web-framework";
import { tossLogin } from "@/entities/User/api/loginToss";
import { useUserStore } from "@/entities/User/model/userModel";

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
  const [isInitializing, setIsInitializing] = useState(true);
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

  // 페이지 최초 진입 시 자동 초기화
  useEffect(() => {
    console.log("[AppInitializer] 페이지 최초 진입 - 자동 초기화 시작");
    handleAutoInitialization();
  }, []);

  // 자동 초기화 핸들러
  const handleAutoInitialization = async () => {
    try {
      setIsInitializing(true);

      // 0. 로컬스토리지에 액세스토큰 확인
      const accessToken = localStorage.getItem("accessToken");
      console.log(
        "[AppInitializer] 액세스 토큰 확인:",
        accessToken ? "존재함" : "존재하지 않음"
      );

      if (accessToken) {
        // 2. 액세스 토큰이 존재하는 경우
        console.log("[AppInitializer] 기존 액세스 토큰으로 자동 로그인 시도");
        await handleExistingTokenLogin();
      } else {
        // 1. 액세스 토큰이 존재하지 않는 경우
        console.log("[AppInitializer] 액세스 토큰 없음 - 토스 로그인 필요");
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
      console.log("[AppInitializer] 초기화 플래그 설정 완료");

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
      console.log(
        `[AppInitializer] fetchUserData ${isRetry ? "재시도" : "시도"}`
      );
      await fetchUserData();

      // fetchUserData 성공 시 사용자 상태 확인
      const { uid, nickName, characterType } = useUserStore.getState();

      if (uid && nickName) {
        console.log("[AppInitializer] fetchUserData 성공:", {
          uid,
          nickName,
          characterType,
        });

        // 사용자 데이터를 잘 가져온 경우 적절한 페이지로 이동
        await handleNavigationAfterLogin();
      } else {
        throw new Error("사용자 데이터가 불완전합니다.");
      }
    } catch (error: any) {
      console.error(
        `[AppInitializer] fetchUserData ${isRetry ? "재시도" : ""} 실패:`,
        error
      );

      if (!isRetry) {
        // 첫 번째 실패 시 1회 재시도
        console.log("[AppInitializer] fetchUserData 1회 재시도");
        await handleFetchUserDataWithRetry(true);
      } else {
        // 재시도도 실패한 경우 리프레시 토큰으로 액세스 토큰 재발급
        console.log(
          "[AppInitializer] fetchUserData 재시도 실패, 리프레시 토큰으로 재발급 시도"
        );
        await handleRefreshTokenAndRetry();
      }
    }
  };

  // 리프레시 토큰으로 액세스 토큰 재발급 및 재시도
  const handleRefreshTokenAndRetry = async () => {
    try {
      console.log("[AppInitializer] 리프레시 토큰으로 액세스 토큰 재발급 시작");

      // TODO: 리프레시 토큰 API 호출 (추후 구현 예정)
      // const newAccessToken = await refreshAccessToken();
      // localStorage.setItem('accessToken', newAccessToken);

      console.log(
        "[AppInitializer] 액세스 토큰 재발급 완료, fetchUserData 재시도"
      );

      // 재발급된 토큰으로 fetchUserData 재시도
      await handleFetchUserDataWithRetry();
    } catch (error: any) {
      console.error("[AppInitializer] 액세스 토큰 재발급 실패:", error);
      setError("토큰 재발급에 실패했습니다. 다시 로그인해주세요.");

      // 재발급 실패 시 로그아웃 처리
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("isInitialized");
    }
  };

  // 로그인 후 적절한 페이지로 이동하는 로직
  const handleNavigationAfterLogin = async () => {
    try {
      const { characterType } = useUserStore.getState();

      if (!characterType) {
        // 캐릭터가 선택되지 않은 경우 (신규 사용자)
        console.log("[AppInitializer] 신규 사용자 - /choose-character로 이동");
        navigate("/choose-character");
      } else {
        // 캐릭터가 선택된 경우 (기존 사용자)
        console.log("[AppInitializer] 기존 사용자 - /dice-event로 이동");
        navigate("/dice-event");
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
      console.log("[AppInitializer] 토스 로그인 시작");

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

      // appLogin 함수 호출
      const { authorizationCode, referrer } = await appLogin();
      setAuthorizationCode(authorizationCode);
      setReferrer(referrer);
      setLoginResult({ authorizationCode, referrer });

      console.log("[AppInitializer] 토스 로그인 성공:", {
        authorizationCode,
        referrer,
      });

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
      }

      // 서버 로그인 진행
      await handleServerLogin(authorizationCode, referrer);
    } catch (error: any) {
      console.error("[AppInitializer] 토스 로그인 실패:", error);
      setError(`토스 로그인 실패: ${error.message || "알 수 없는 오류"}`);

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
    }
  };

  // 서버 로그인 처리
  const handleServerLogin = async (authCode: string, ref: string) => {
    try {
      console.log("[AppInitializer] 서버 로그인 시작");

      const loginSuccess = await tossLogin(authCode, ref);
      console.log("[AppInitializer] tossLogin 응답:", loginSuccess);

      if (loginSuccess) {
        // 액세스 토큰, 리프레시 토큰 저장 (tossLogin에서 처리됨)
        console.log("[AppInitializer] 토큰 저장 완료");

        // 초기화 플래그 true로 설정
        localStorage.setItem("isInitialized", "true");
        console.log("[AppInitializer] 초기화 플래그 설정 완료");

        // 로컬 스토리지에서 사용자 정보 가져오기
        const userId = localStorage.getItem("userId") || undefined;
        const userName = localStorage.getItem("userName") || undefined;
        const referrerId = localStorage.getItem("referrerId") || undefined;
        const isInitial = localStorage.getItem("isInitial") === "true";

        setServerLoginResult({ userId, userName, referrerId, isInitial });

        console.log("[AppInitializer] 서버 로그인 성공:", {
          userId,
          userName,
          referrerId,
          isInitial,
        });

        // Native 앱에 서버 로그인 성공 메시지 전송
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              type: "serverLoginSuccess",
              userId,
              userName,
              referrerId,
              isInitial,
              timestamp: Date.now(),
            })
          );
        }

        // isInitial 값에 따른 분기 처리
        if (isInitial) {
          // 1. 신규 사용자인 경우 - 캐릭터 선택 페이지로 이동
          console.log(
            "[AppInitializer] 신규 사용자 - /choose-character로 이동"
          );
          navigate("/choose-character");
          onInitialized();
        } else {
          // 2. 기존 사용자인 경우 - fetchUserData 호출 후 적절한 페이지로 이동
          console.log("[AppInitializer] 기존 사용자 - fetchUserData 호출");
          await handleFetchUserDataWithRetry();
        }
      } else {
        console.error("[AppInitializer] 서버 로그인 실패");
        setError("서버 로그인에 실패했습니다.");

        // Native 앱에 서버 로그인 실패 메시지 전송
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              type: "serverLoginError",
              error: "서버 로그인에 실패했습니다.",
              timestamp: Date.now(),
            })
          );
        }
      }
    } catch (error: any) {
      console.error("[AppInitializer] 서버 로그인 중 오류:", error);
      setError(`서버 로그인 중 오류: ${error.message || "알 수 없는 오류"}`);

      // Native 앱에 에러 메시지 전송
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: "serverLoginError",
            error: error?.message || "서버 로그인 중 오류가 발생했습니다.",
            timestamp: Date.now(),
          })
        );
      }
    }
  };

  // 수동 토스 로그인 (테스트용)
  const handleManualTossLogin = async () => {
    await handleNewTokenLogin();
  };

  // 수동 서버 로그인 (테스트용)
  const handleManualServerLogin = async () => {
    if (authorizationCode && referrer) {
      await handleServerLogin(authorizationCode, referrer);
    } else {
      setError("토스 로그인을 먼저 진행해주세요.");
    }
  };

  // 수동 초기화 (테스트용)
  const handleManualInitialization = async () => {
    await handleAutoInitialization();
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
        <h2 style={{ marginBottom: "20px", color: "#333" }}>🔄 초기화 중...</h2>
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
      }}
    >
      <h2 style={{ marginBottom: "20px", color: "#333", textAlign: "center" }}>
        토스 앱 로그인 테스트
      </h2>

      {/* 수동 테스트 버튼들 */}
      <button
        onClick={handleManualInitialization}
        style={{
          padding: "15px 30px",
          fontSize: "18px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          width: "100%",
          marginBottom: "20px",
        }}
      >
        🔄 수동 초기화
      </button>

      <button
        onClick={handleManualTossLogin}
        style={{
          padding: "15px 30px",
          fontSize: "18px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          width: "100%",
          marginBottom: "20px",
        }}
      >
        토스 로그인
      </button>

      <button
        onClick={handleManualServerLogin}
        style={{
          padding: "15px 30px",
          fontSize: "18px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          width: "100%",
          marginBottom: "20px",
        }}
      >
        우리 서버 로그인
      </button>

      {/* 환경 정보 */}
      <div
        style={{
          marginBottom: "20px",
          padding: "12px",
          fontSize: "14px",
          backgroundColor: window.ReactNativeWebView ? "#e8f5e8" : "#fff3cd",
          color: window.ReactNativeWebView ? "#2d5a2d" : "#856404",
          borderRadius: "4px",
          border: `1px solid ${
            window.ReactNativeWebView ? "#c3e6c3" : "#ffeaa7"
          }`,
        }}
      >
        <strong>환경:</strong>{" "}
        {window.ReactNativeWebView ? "토스 앱 웹뷰" : "브라우저"}
        <br />
        <strong>토스 앱 버전:</strong>{" "}
        {isMinVersionSupported({ android: "5.219.0", ios: "5.219.0" })
          ? "✅ 지원됨"
          : "❌ 지원 안됨"}
        <br />
        <strong>초기화 상태:</strong>{" "}
        {localStorage.getItem("isInitialized") === "true"
          ? "✅ 완료"
          : "❌ 미완료"}
      </div>

      {/* 토스 로그인 결과 */}
      {loginResult && (
        <div
          style={{
            marginBottom: "20px",
            padding: "16px",
            backgroundColor: "#e8f5e8",
            color: "#2d5a2d",
            borderRadius: "4px",
            border: "1px solid #c3e6c3",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
            ✅ 토스 로그인 성공!
          </div>
          <div style={{ marginBottom: "4px" }}>
            <strong>authorizationCode:</strong> {loginResult.authorizationCode}
          </div>
          <div style={{ marginBottom: "8px" }}>
            <strong>referrer:</strong> {loginResult.referrer}
          </div>
        </div>
      )}

      {/* 서버 로그인 결과 */}
      {serverLoginResult && (
        <div
          style={{
            marginBottom: "20px",
            padding: "16px",
            backgroundColor: "#e3f2fd",
            color: "#1976d2",
            borderRadius: "4px",
            border: "1px solid #bbdefb",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
            ✅ 서버 로그인 성공!
          </div>
          <div style={{ marginBottom: "4px" }}>
            <strong>userId:</strong> {serverLoginResult.userId}
          </div>
          <div style={{ marginBottom: "4px" }}>
            <strong>userName:</strong> {serverLoginResult.userName}
          </div>
          <div style={{ marginBottom: "4px" }}>
            <strong>referrerId:</strong>{" "}
            {serverLoginResult.referrerId || "없음"}
          </div>
          <div style={{ marginBottom: "8px" }}>
            <strong>isInitial:</strong>{" "}
            {serverLoginResult.isInitial ? "신규 사용자" : "기존 사용자"}
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "16px",
            backgroundColor: "#ffebee",
            color: "#c62828",
            borderRadius: "4px",
            border: "1px solid #ef5350",
          }}
        >
          <strong>오류:</strong> {error}
        </div>
      )}
    </div>
  );
};

export default AppInitializer;
