import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { appLogin, isMinVersionSupported } from "@apps-in-toss/web-framework";
import { tossLogin } from "@/entities/User/api/loginToss";

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
  const [isServerLoginLoading, setIsServerLoginLoading] = useState(false);
  const [authorizationCode, setAuthorizationCode] = useState<string | null>(null);
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

  const handleTossLogin = async () => {
    console.log("[AppInitializer] 토스 로그인 시작");
    console.log("[AppInitializer] 현재 환경:", {
      ReactNativeWebView: !!window.ReactNativeWebView,
      userAgent: navigator.userAgent,
      hostname: window.location.hostname,
      protocol: window.location.protocol
    });
    
    try {
      // 토스 앱 환경 확인
      if (!window.ReactNativeWebView) {
        console.error("[AppInitializer] 토스 앱 웹뷰 환경이 아님");
        return;
      }
      
      // 토스 앱 버전 확인
      const versionCheck = isMinVersionSupported({
        android: '5.219.0',
        ios: '5.219.0'
      });
      
      console.log("[AppInitializer] 토스 앱 버전 체크 결과:", versionCheck);
      
      if (!versionCheck) {
        console.error("[AppInitializer] 토스 앱 버전이 지원되지 않음");
        return;
      }
      
      // appLogin 함수 존재 여부 확인
      if (typeof appLogin !== 'function') {
        console.error("[AppInitializer] appLogin 함수를 찾을 수 없음");
        return;
      }
      
      console.log("[AppInitializer] appLogin() 호출 시작");
      
      // appLogin 호출 전 추가 체크
      console.log("[AppInitializer] appLogin 함수 타입:", typeof appLogin);
      console.log("[AppInitializer] appLogin 함수 내용:", appLogin.toString().substring(0, 100) + "...");
      
      const { authorizationCode, referrer } = await appLogin();
      setAuthorizationCode(authorizationCode);
      setReferrer(referrer);
      console.log("[AppInitializer] appLogin() 성공적으로 완료됨");
      console.log("[AppInitializer] 토스 로그인 성공:", { authorizationCode, referrer });
      
      // Native 앱에 성공 메시지 전송
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: "loginSuccess",
            authorizationCode,
            referrer,
            timestamp: Date.now()
          })
        );
      }
      
    } catch (err: any) {
      console.error("[AppInitializer] 에러 발생:", err);
      console.error("[AppInitializer] 에러 상세 정보:", {
        name: err?.name,
        message: err?.message,
        code: err?.code,
        stack: err?.stack,
        cause: err?.cause,
        response: err?.response,
        status: err?.response?.status,
        data: err?.response?.data
      });
      
      // Native 앱에 에러 메시지 전송
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: "loginError",
            error: err?.message || "알 수 없는 에러",
            details: {
              name: err?.name,
              message: err?.message,
              code: err?.code,
              stack: err?.stack
            },
            timestamp: Date.now()
          })
        );
      }
    }
  };

  const handleWebLogin = async () => {
    console.log("[AppInitializer] 우리 서버 로그인 시작");

    if(authorizationCode && referrer) {
      try {
        setIsServerLoginLoading(true);
        const loginSuccess = await tossLogin(authorizationCode, referrer);
        console.log("[AppInitializer] tossLogin 응답:", loginSuccess);
        
        if (loginSuccess) {
          // 로그인 성공 시 로컬 스토리지에서 사용자 정보 가져오기
          const userId = localStorage.getItem('userId') || undefined;
          const userName = localStorage.getItem('userName') || undefined;
          const referrerId = localStorage.getItem('referrerId') || undefined;
          const isInitial = localStorage.getItem('isInitial') === 'true';
          
          // 서버 로그인 결과 상태 업데이트
          setServerLoginResult({
            userId,
            userName,
            referrerId,
            isInitial
          });
          
          console.log("[AppInitializer] 서버 로그인 성공:", {
            userId,
            userName,
            referrerId,
            isInitial
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
                timestamp: Date.now()
              })
            );
          }
          
          // 로그인 성공 후 초기화 완료 처리
          onInitialized();
        } else {
          console.error("[AppInitializer] 서버 로그인 실패");
          setError("서버 로그인에 실패했습니다.");
          
          // Native 앱에 서버 로그인 실패 메시지 전송
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({
                type: "serverLoginError",
                error: "서버 로그인에 실패했습니다.",
                timestamp: Date.now()
              })
            );
          }
        }
      } catch (err: any) {
        console.error("[AppInitializer] 에러 발생:", err);
        setError(err?.message || "서버 로그인 중 오류가 발생했습니다.");
        
        // Native 앱에 에러 메시지 전송
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              type: "serverLoginError",
              error: err?.message || "서버 로그인 중 오류가 발생했습니다.",
              details: {
                name: err?.name,
                message: err?.message,
                code: err?.code
              },
              timestamp: Date.now()
            })
          );
        }
      } finally {
        setIsServerLoginLoading(false);
      }
    } else {
      setError("토스 로그인을 먼저 진행해주세요.");
    }
  };

  // const handleComplete = () => {
  //   console.log("[AppInitializer] 초기화 완료");
  //   onInitialized();
  // };

  // // 로그인 성공 후 페이지 이동 함수들
  // const goToDiceEvent = () => {
  //   console.log("[AppInitializer] /dice-event 페이지로 이동");
  //   navigate("/dice-event");
  // };

  // const goToChooseCharacter = () => {
  //   console.log("[AppInitializer] /choose-character 페이지로 이동");
  //   navigate("/choose-character");
  // };

  // const goToMission = () => {
  //   console.log("[AppInitializer] /mission 페이지로 이동");
  //   navigate("/mission");
  // };

  // const goToReward = () => {
  //   console.log("[AppInitializer] /reward 페이지로 이동");
  //   navigate("/reward");
  // };

  return (
    <div style={{
      padding: "20px",
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      maxWidth: "400px",
      margin: "20px auto"
    }}>
      <h2 style={{ marginBottom: "20px", color: "#333", textAlign: "center" }}>
        토스 앱 로그인 테스트
      </h2>
      
      
      {/* 로그인 버튼 */}
      <button
        onClick={handleWebLogin}
        style={{ 
          padding: "15px 30px", 
          fontSize: "18px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          width: "100%",
          marginBottom: "20px"
        }}
      >
        우리 서버 로그인
      </button>
      <button
        onClick={handleTossLogin}
        style={{ 
          padding: "15px 30px", 
          fontSize: "18px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          width: "100%",
          marginBottom: "20px"
        }}
      >
        토스 로그인
      </button>
      {/* 환경 정보 */}
      <div style={{ 
        marginBottom: "20px", 
        padding: "12px", 
        fontSize: "14px",
        backgroundColor: window.ReactNativeWebView ? "#e8f5e8" : "#fff3cd",
        color: window.ReactNativeWebView ? "#2d5a2d" : "#856404",
        borderRadius: "4px",
        border: `1px solid ${window.ReactNativeWebView ? "#c3e6c3" : "#ffeaa7"}`
      }}>
        <strong>환경:</strong> {window.ReactNativeWebView ? "토스 앱 웹뷰" : "브라우저"}<br />
        <strong>토스 앱 버전:</strong> {isMinVersionSupported({android: '5.219.0', ios: '5.219.0'}) ? "✅ 지원됨" : "❌ 지원 안됨"}
      </div>

      {/* 토스 로그인 결과 */}
      {loginResult && (
        <div style={{ 
          marginBottom: "20px", 
          padding: "16px",
          backgroundColor: "#e8f5e8",
          color: "#2d5a2d",
          borderRadius: "4px",
          border: "1px solid #c3e6c3"
        }}>
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>✅ 토스 로그인 성공!</div>
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
        <div style={{ 
          marginBottom: "20px", 
          padding: "16px",
          backgroundColor: "#e3f2fd",
          color: "#1976d2",
          borderRadius: "4px",
          border: "1px solid #bbdefb"
        }}>
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>✅ 서버 로그인 성공!</div>
          <div style={{ marginBottom: "4px" }}>
            <strong>userId:</strong> {serverLoginResult.userId}
          </div>
          <div style={{ marginBottom: "4px" }}>
            <strong>userName:</strong> {serverLoginResult.userName}
          </div>
          <div style={{ marginBottom: "4px" }}>
            <strong>referrerId:</strong> {serverLoginResult.referrerId || '없음'}
          </div>
          <div style={{ marginBottom: "8px" }}>
            <strong>isInitial:</strong> {serverLoginResult.isInitial ? "신규 사용자" : "기존 사용자"}
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div style={{ 
          marginBottom: "20px", 
          padding: "16px",
          backgroundColor: "#ffebee",
          color: "#c62828",
          borderRadius: "4px",
          border: "1px solid #ef5350"
        }}>
          <strong>오류:</strong> {error}
        </div>
      )}
          {/* 페이지 이동 버튼들 */}
          {/* <div style={{ marginTop: "16px" }}>
            <h4 style={{ marginBottom: "12px", color: "#1976d2" }}>페이지 이동:</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <button
                onClick={goToDiceEvent}
                style={{ 
                  padding: "8px 12px", 
                  fontSize: "14px",
                  backgroundColor: "#4caf50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                🎲 Dice Event
              </button>
              <button
                onClick={goToChooseCharacter}
                style={{ 
                  padding: "8px 12px", 
                  fontSize: "14px",
                  backgroundColor: "#ff9800",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                👤 캐릭터 선택
              </button>
              <button
                onClick={goToMission}
                style={{ 
                  padding: "8px 12px", 
                  fontSize: "14px",
                  backgroundColor: "#9c27b0",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                📋 미션
              </button>
              <button
                onClick={goToReward}
                style={{ 
                  padding: "8px 12px", 
                  fontSize: "14px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                🎁 보상
              </button>
            </div> */}
          {/* </div> */}
        {/* </div> */}
      {/* )} */}

      {/* 에러 메시지 */}
      {/* {error && (
        <div style={{ 
          marginBottom: "20px", 
          padding: "16px",
          backgroundColor: "#ffebee",
          color: "#c62828",
          borderRadius: "4px",
          border: "1px solid #ef5350"
        }}>
          <strong>오류:</strong> {error}
        </div>
      )} */}

      {/* 초기화 완료 버튼 */}
      {/* <button
        onClick={handleComplete}
        style={{ 
          padding: "12px 24px", 
          fontSize: "16px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          width: "100%"
        }}
      >
        초기화 완료
      </button> */}
    </div>
  );
};

export default AppInitializer;
