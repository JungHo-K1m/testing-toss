import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { testLogin } from "@/entities/User/api/testLogin";
import { useUserStore } from "@/entities/User/model/userModel";
import useWalletStore from '@/shared/store/useWalletStore';

interface AppInitializerProps {
  onInitialized: () => void;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ onInitialized }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { fetchUserData } = useUserStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 컴포넌트 마운트 시 자동으로 테스트 로그인 실행
  useEffect(() => {
    handleTestLogin();
  }, []);

  // 테스트 로그인 처리
  const handleTestLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("[AppInitializer] 테스트 로그인 시작");
      
      // URL 파라미터에서 토큰 확인 (테스트용)
      const urlToken = searchParams.get('token');
      const urlUserId = searchParams.get('userId');
      
      if (urlToken) {
        console.log("[AppInitializer] URL 파라미터에서 토큰 발견");
        
        // ⚠️ 보안 경고: URL 파라미터로 토큰 전달은 보안상 위험합니다
        console.warn("[AppInitializer] 보안 경고: URL 파라미터로 토큰을 전달하는 것은 보안상 위험합니다!");
        
        // URL에서 받은 토큰을 localStorage에 저장
        localStorage.setItem('accessToken', urlToken);
        
        // 사용자 ID도 URL에서 가져오기
        if (urlUserId) {
          localStorage.setItem('userId', urlUserId);
        }
        
        // URL 파라미터 제거 (보안상 권장)
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('token');
        newUrl.searchParams.delete('userId');
        window.history.replaceState({}, '', newUrl.toString());
        
        console.log("[AppInitializer] URL 파라미터에서 토큰 추출 완료, fetchUserData 진행");
        
        // 토큰이 이미 있으므로 fetchUserData만 호출
        try {
          await fetchUserData();
          console.log("[AppInitializer] fetchUserData 성공");
        } catch (error: any) {
          // "Please choose your character first" 메시지는 에러가 아닌 정상적인 응답
          if (error.message && error.message.includes('Please choose your character first')) {
            console.log("[AppInitializer] 캐릭터 선택 필요 메시지 감지 - 정상 처리");
            // 에러가 아니므로 계속 진행
          } else {
            // 다른 에러인 경우 다시 throw
            throw error;
          }
        }
        
        // API 응답 메시지 저장 (캐릭터 선택 필요 여부 확인용)
        try {
          // fetchUserData의 응답을 확인하여 메시지 저장
          const lastMessage = localStorage.getItem('lastApiMessage');
          if (lastMessage) {
            console.log("[AppInitializer] 마지막 API 응답 메시지:", lastMessage);
          }
        } catch (error) {
          console.log("[AppInitializer] API 응답 메시지 확인 중 오류:", error);
        }
        
        // 사용자 상태 확인 및 페이지 이동
        await handleUserDataAndNavigation();
        
      } else {
        // 기존 방식: testLogin API 호출
        console.log("[AppInitializer] URL 파라미터에 토큰 없음, testLogin API 호출");
        
        const loginResult = await testLogin();
        console.log("[AppInitializer] 테스트 로그인 성공:", loginResult);

        // 로그인 성공 후 fetchUserData 호출
        try {
          await fetchUserData();
          console.log("[AppInitializer] fetchUserData 성공");
        } catch (error: any) {
          // "Please choose your character first" 메시지는 에러가 아닌 정상적인 응답
          if (error.message && error.message.includes('Please choose your character first')) {
            console.log("[AppInitializer] 캐릭터 선택 필요 메시지 감지 - 정상 처리");
            // 에러가 아니므로 계속 진행
          } else {
            // 다른 에러인 경우 다시 throw
            throw error;
          }
        }
        
        // API 응답 메시지 저장 (캐릭터 선택 필요 여부 확인용)
        try {
          // fetchUserData의 응답을 확인하여 메시지 저장
          const lastMessage = localStorage.getItem('lastApiMessage');
          if (lastMessage) {
            console.log("[AppInitializer] 마지막 API 응답 메시지:", lastMessage);
          }
        } catch (error) {
          console.log("[AppInitializer] API 응답 메시지 확인 중 오류:", error);
        }
        
        // 사용자 상태 확인 및 페이지 이동
        await handleUserDataAndNavigation();
      }

      // 초기화 완료 처리
      onInitialized();

    } catch (error: any) {
      console.error("[AppInitializer] 테스트 로그인 실패:", error);
      setError(`로그인 실패: ${error.message || "알 수 없는 오류"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자 데이터 확인 및 페이지 이동 로직
  const handleUserDataAndNavigation = async () => {
    try {
      // 사용자 상태 확인
      const { uid, nickName, characterType } = useUserStore.getState();
      console.log("[AppInitializer] 사용자 상태:", { uid, nickName, characterType });

      // localStorage에서 isInitial 확인
      const isInitial = localStorage.getItem('isInitial') === 'true';
      
      // 캐릭터 선택 필요 여부 판단
      // 1. 사용자 정보가 불완전한 경우
      // 2. isInitial이 true인 경우
      // 3. API에서 "Please choose your character first" 메시지가 온 경우
      const needsCharacterSelection = !uid || !nickName || isInitial;
      
      if (needsCharacterSelection) {
        console.log("[AppInitializer] 캐릭터 선택 필요 - choose-character 페이지로 이동");
        navigate("/choose-character");
      } else {
        console.log("[AppInitializer] 기존 사용자 - dice-event 페이지로 이동");
        navigate("/dice-event");
      }
    } catch (error) {
      console.error("[AppInitializer] 페이지 이동 중 오류:", error);
      setError("페이지 이동 중 오류가 발생했습니다.");
    }
  };

  // 로딩 중일 때 "로그인 중..." 텍스트를 화면 중앙에 표시
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100vw",
          backgroundColor: "white",
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontSize: "24px",
            color: "#333",
            fontWeight: "500",
          }}
        >
          로그인 중...
        </div>
      </div>
    );
  }

  // 에러가 발생한 경우 에러 메시지 표시
  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100vw",
          backgroundColor: "white",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            backgroundColor: "#ffebee",
            color: "#c62828",
            borderRadius: "8px",
            border: "1px solid #ef5350",
            maxWidth: "400px",
          }}
        >
          <h3 style={{ marginBottom: "16px" }}>로그인 오류</h3>
          <p style={{ marginBottom: "16px" }}>{error}</p>
          <button
            onClick={handleTestLogin}
            style={{
              padding: "12px 24px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 기본적으로는 아무것도 렌더링하지 않음 (로딩 중이거나 에러 상태)
  return null;
};

export default AppInitializer;
