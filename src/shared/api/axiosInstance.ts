import axios from 'axios';
import Cookies from 'js-cookie';
import { useUserStore } from '@/entities/User/model/userModel';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://28d8c99bdda5.ngrok-free.app/api/',
  headers: {
    'Content-Type': 'application/json', // 기본 Content-Type
  },
  withCredentials: false, // true에서 false로 변경
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
      console.log(`🔐 [axiosInstance] Authorization 헤더 추가: ${pathname}`);
    } else if (isExcluded) {
      console.log(`🚫 [axiosInstance] Authorization 헤더 제외: ${pathname}`);
    } else {
      console.log(`⚠️ [axiosInstance] 토큰 없음, Authorization 헤더 미추가: ${pathname}`);
    }

    // multipart/form-data 요청 시 Content-Type을 자동 설정하도록 설정
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']; // Axios가 자동으로 Content-Type을 설정하도록 함
    }

    console.log(`📤 [axiosInstance] 요청 전송: ${config.method?.toUpperCase()} ${pathname}`);
    console.log(`📤 [axiosInstance] 요청 헤더:`, config.headers);
    
    // 샌드박스 디버깅을 위한 상세 URL 정보
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`🌐 [axiosInstance] 전체 요청 URL: ${fullUrl}`);
    console.log(`🌐 [axiosInstance] baseURL: ${config.baseURL}`);
    console.log(`🌐 [axiosInstance] 상대 경로: ${config.url}`);
    console.log(`🌐 [axiosInstance] 최종 URL: ${fullUrl}`);
    
    // OPTIONS preflight 요청 감지 및 로깅
    if (config.method === 'OPTIONS') {
      console.log('🚨 [axiosInstance] OPTIONS preflight 요청 감지!');
      console.log('🚨 [axiosInstance] 이는 CORS preflight 요청으로, Authorization 헤더가 포함된 복잡한 요청에서 발생합니다.');
      console.log('🚨 [axiosInstance] 요청 헤더:', config.headers);
      console.log('🚨 [axiosInstance] 요청 URL:', fullUrl);
    }
    
    // 요청 설정 상세 정보
    console.log(`⚙️ [axiosInstance] 요청 설정:`, {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      fullURL: fullUrl,
      headers: config.headers,
      withCredentials: config.withCredentials,
      timeout: config.timeout
    });
    
    // ngrok 경고 우회 헤더 추가
    if (fullUrl.includes('ngrok-free.app') || fullUrl.includes('ngrok.io')) {
      config.headers['ngrok-skip-browser-warning'] = 'true';
      console.log('🚀 [axiosInstance] ngrok 경고 우회 헤더 추가됨');
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 설정 (하나만 유지)
api.interceptors.response.use(
  (response) => {
    console.log(`📥 [axiosInstance] 응답 수신: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    console.log(`📥 [axiosInstance] 응답 상태: ${response.status}`);
    console.log(`📥 [axiosInstance] 응답 헤더:`, response.headers);
    
    // CORS 관련 헤더 확인
    const corsHeaders = {
      'access-control-allow-origin': response.headers['access-control-allow-origin'],
      'access-control-allow-methods': response.headers['access-control-allow-methods'],
      'access-control-allow-headers': response.headers['access-control-allow-headers'],
      'access-control-allow-credentials': response.headers['access-control-allow-credentials'],
    };
    
    if (Object.values(corsHeaders).some(header => header)) {
      console.log(`🌐 [axiosInstance] CORS 헤더 발견:`, corsHeaders);
    }
    
    return response;
  },
  async (error) => {
    console.log(`❌ [axiosInstance] 응답 에러: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    console.log(`❌ [axiosInstance] 에러 상태: ${error.response?.status}`);
    console.log(`❌ [axiosInstance] 에러 메시지:`, error.message);
    
    // CORS 에러인지 확인
    if (error.message.includes('CORS') || error.message.includes('Network Error')) {
      console.error(`🚨 [axiosInstance] CORS 에러 감지:`, error.message);
    }
    
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
      window.location.href = "/"; // 로그인 페이지 등으로 리다이렉트
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