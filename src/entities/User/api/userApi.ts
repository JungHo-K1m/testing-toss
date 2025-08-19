// src/entities/user/api/userApi.ts
import api from '@/shared/api/axiosInstance';

export const fetchHomeData = async () => {
  try {
    console.log('🔍 [fetchHomeData] /home API 호출 시작');
    console.log('🔍 [fetchHomeData] 현재 액세스 토큰:', localStorage.getItem('accessToken') ? '존재함' : '없음');
    
    // API 설정 정보 로깅
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://28d8c99bdda5.ngrok-free.app/api/';
    const fullUrl = `${baseURL}home`;
    console.log('🌐 [fetchHomeData] API 설정 정보:', {
      baseURL,
      relativePath: '/home',
      fullURL: fullUrl,
      environment: import.meta.env.MODE,
      envVars: {
        VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
        NODE_ENV: import.meta.env.NODE_ENV
      }
    });
    
    const response = await api.get('/home');
    
    console.log('✅ [fetchHomeData] /home 응답 성공:', response.data);
    console.log('✅ [fetchHomeData] 응답 상태:', response.status);
    console.log('✅ [fetchHomeData] 응답 헤더:', response.headers);
    
    return response.data;
  } catch (error: any) {
    console.error('❌ [fetchHomeData] /home API 에러:', error);
    console.error('❌ [fetchHomeData] 에러 타입:', error.name);
    console.error('❌ [fetchHomeData] 에러 메시지:', error.message);
    
    // CORS 관련 에러 상세 분석
    if (error.message.includes('CORS') || error.message.includes('Network Error')) {
      console.error('🚨 [fetchHomeData] CORS 에러로 판단됨');
      console.error('🚨 [fetchHomeData] 이는 서버에서 OPTIONS preflight 요청에 대한 응답이 없거나 CORS 헤더가 부족함을 의미합니다.');
    }
    
    throw error;
  }
};

// Authorization 헤더 없이 /home API 호출 테스트 (단순 요청)
export const fetchHomeDataWithoutAuth = async () => {
  try {
    console.log('🔍 [fetchHomeDataWithoutAuth] /home API 호출 (Authorization 헤더 없음)');
    
    // axios 인스턴스를 직접 생성하여 Authorization 헤더 제거
    const response = await fetch('/home', {
      method: 'GET',
      headers: {
        'Content-Type': 'text/plain', // 단순 요청으로 만들기
        'ngrok-skip-browser-warning': 'true', // ngrok 경고 우회
      },
      mode: 'cors',
    });
    
    const data = await response.json();
    console.log('✅ [fetchHomeDataWithoutAuth] /home 응답 성공:', data);
    return data;
  } catch (error: any) {
    console.error('❌ [fetchHomeDataWithoutAuth] /home API 에러:', error);
    throw error;
  }
};
