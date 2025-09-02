import axios from 'axios';
import Cookies from 'js-cookie';
import { useUserStore } from '@/entities/User/model/userModel';



// 개발 환경과 프로덕션 환경에 따른 API Base URL 설정
const getApiBaseUrl = () => {
  // 앱인토스 웹뷰 환경에서는 항상 프로덕션 API 사용
  return import.meta.env.VITE_API_BASE_URL || 'https://appsintoss.savethelife.io/api/';
};

// Axios 인스턴스 생성 (기존 방식으로 단순화)
const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // true로 설정하여 쿠키 전송 활성화
});



// 요청 인터셉터 설정 (기존 방식으로 단순화)
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
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 설정 (기존 방식으로 단순화)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 리프레시 엔드포인트 자체의 에러라면 재시도 로직을 실행하지 않음
    if (originalRequest.url.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    // 액세스 토큰이 없는 경우 처리 (로그인 페이지 등으로 이동)
    if (!localStorage.getItem('accessToken')) {
      const currentPath = window.location.pathname;
      if (currentPath !== "/" && currentPath !== "/login") {
        window.location.href = "/";
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
      
      // 인터셉터 로깅
      const interceptorLog = {
        timestamp: new Date().toISOString(),
        action: 'axios_interceptor_retry',
        url: originalRequest.url,
        status: error.response.status,
        message: '토큰 만료 감지, 리프레시 토큰으로 재시도'
      };
      localStorage.setItem('refreshToken_logs', JSON.stringify(interceptorLog));
      console.log('[axiosInstance] 토큰 만료 감지 - 로그 저장됨');
      
      try {
        const refreshSuccessful = await useUserStore.getState().refreshToken();
        if (refreshSuccessful) {
          const newAccessToken = localStorage.getItem("accessToken");
          if (newAccessToken) {
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            
            // 재시도 성공 로깅
            const retrySuccessLog = {
              timestamp: new Date().toISOString(),
              action: 'axios_interceptor_retry_success',
              url: originalRequest.url,
              message: '리프레시 토큰으로 원래 요청 재시도 성공'
            };
            localStorage.setItem('refreshToken_logs', JSON.stringify(retrySuccessLog));
            console.log('[axiosInstance] 재시도 성공 - 로그 저장됨');
            
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