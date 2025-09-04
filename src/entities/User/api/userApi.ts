// src/entities/user/api/userApi.ts
import api from '@/shared/api/axiosInstance';

export const fetchHomeData = async () => {
  try {
    const response = await api.get('/home');
    return response.data;
  } catch (error: any) {    
    throw error;
  }
};

// Authorization 헤더 없이 /home API 호출 테스트 (단순 요청)
export const fetchHomeDataWithoutAuth = async () => {
  try {    
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
    return data;
  } catch (error: any) {
    throw error;
  }
};
