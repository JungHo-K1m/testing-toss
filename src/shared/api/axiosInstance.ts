import axios from 'axios';
import Cookies from 'js-cookie';
import { useUserStore } from '@/entities/User/model/userModel';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://28d8c99bdda5.ngrok-free.app/api/',
  headers: {
    'Content-Type': 'application/json', // 기본 Content-Type
  },
  withCredentials: true, // false에서 true로 변경하여 쿠키 전송 활성화
});

// 요청 인터셉터 설정
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');

    // Authorization 헤더를 제외할 엔드포인트 목록
    const excludeAuthEndpoints = [
      '/auth/login',
      '/auth/refresh',
      '/auth/login/line',
      '/auth/login/web',
      '/auth/login/toss'
    ];

    // 현재 요청의 경로(pathname)를 추출
    const url = new URL(config.url || '', config.baseURL);
    const pathname = url.pathname;

    // 제외할 엔드포인트에 포함되는지 확인
    const isExcluded = excludeAuthEndpoints.includes(pathname);

    // 제외할 엔드포인트가 아닌 경우에만 Authorization 헤더 추가
    if (!isExcluded && token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // multipart/form-data 요청 시 Content-Type을 자동 설정하도록 설정
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']; // Axios가 자동으로 Content-Type을 설정하도록 함
    }
    
    // 샌드박스 디버깅을 위한 상세 URL 정보
    const fullUrl = `${config.baseURL}${config.url}`;
    
    // ngrok 경고 우회 헤더 추가
    if (fullUrl.includes('ngrok-free.app') || fullUrl.includes('ngrok.io')) {
      config.headers['ngrok-skip-browser-warning'] = 'true';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 설정 (하나만 유지)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    
    const originalRequest = error.config;

    // 리프레시 엔드포인트 자체의 에러라면 재시도 로직을 실행하지 않음
    if (originalRequest.url.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    // 로그인 관련 엔드포인트에서는 토큰 체크를 하지 않음
    const loginEndpoints = [
      '/auth/login',
      '/auth/login/line',
      '/auth/login/web',
      '/auth/login/toss'
    ];
    
    const isLoginEndpoint = loginEndpoints.some(endpoint => 
      originalRequest.url?.includes(endpoint)
    );

    // 로그인 엔드포인트에서는 토큰 체크를 하지 않음
    if (isLoginEndpoint) {
      return Promise.reject(error);
    }

    // 액세스 토큰이 없는 경우 처리 (로그인 페이지 등으로 이동)
    if (!localStorage.getItem('accessToken')) {
      // 현재 경로가 루트가 아닌 경우에만 리다이렉트
      const currentPath = window.location.pathname;
      if (currentPath !== "/" && currentPath !== "/login") {
        window.location.href = "/"; // 로그인 페이지 등으로 리다이렉트
      }
      return Promise.reject(new Error("Access token not found."));
    }

    const errorMessage =
      error.response && typeof error.response.data === "string"
        ? error.response.data
        : "";

    if (
      error.response &&
      (!originalRequest._retry) &&
      (
        error.response.status === 401 ||
        error.response.status === 404 ||
        errorMessage.includes("Token not found in Redis or expired")
      )
    ) {
      originalRequest._retry = true;
      try {
        const refreshSuccessful = await useUserStore.getState().refreshToken();
        if (refreshSuccessful) {
          const newAccessToken = localStorage.getItem("accessToken");
          if (newAccessToken) {
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        }
        localStorage.removeItem('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = "/";
        return Promise.reject(error);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;