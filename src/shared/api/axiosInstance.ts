import axios from 'axios';
import Cookies from 'js-cookie';
import { useUserStore } from '@/entities/User/model/userModel';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://appsintoss.savethelife.io/api/',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // true로 설정하여 쿠키 전송 활성화
  timeout: 10000, // 10초 타임아웃 추가
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
      console.log('[axiosInstance] 요청 인터셉터: Authorization 헤더 추가됨 -', {
        endpoint: pathname,
        hasToken: !!token
      });
    }

    // multipart/form-data 요청 시 Content-Type을 자동 설정하도록 설정
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
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

// 응답 인터셉터 설정
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.error('[axiosInstance] API 요청 실패:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    });
    
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

    if (isLoginEndpoint) {
      return Promise.reject(error);
    }

    // 액세스 토큰이 없는 경우 처리
    if (!localStorage.getItem('accessToken')) {
      const currentPath = window.location.pathname;
      if (currentPath !== "/" && currentPath !== "/login") {
        if (!sessionStorage.getItem('redirectingToLogin')) {
          sessionStorage.setItem('redirectingToLogin', 'true');
          console.log('[axiosInstance] 액세스 토큰 없음, 로그인 페이지로 리다이렉트');
        }
      }
      return Promise.reject(error);
    }

    const errorMessage =
      error.response && typeof error.response.data === "string"
        ? error.response.data
        : "";

    // 401 에러인 경우 특별 처리
    if (error.response && error.response.status === 401) {
      if (errorMessage.includes("Full authentication is required to access this resource")) {
        return Promise.reject(error);
      }
    }

    // 리프레시 토큰으로 액세스 토큰 재발급 시도 (딱 한 번만)
    if (
      error.response &&
      !originalRequest._retry &&
      (
        error.response.status === 401 ||
        error.response.status === 403 ||
        error.response.status === 404 ||
        errorMessage.includes("Token not found in Redis or expired")
      ) &&
      !errorMessage.includes("Full authentication is required to access this resource")
    ) {
      originalRequest._retry = true;
      
      try {
        console.log('[axiosInstance] 리프레시 토큰으로 액세스 토큰 재발급 시도');
        
        const hasAttemptedRefresh = sessionStorage.getItem('refreshAttempted');
        if (hasAttemptedRefresh) {
          console.log('[axiosInstance] 이미 리프레시를 시도했음 - 중복 시도 방지');
          return Promise.reject(error);
        }
        
        sessionStorage.setItem('refreshAttempted', 'true');
        
        // HttpOnly 쿠키는 JavaScript에서 직접 접근할 수 없으므로
        // 서버에 직접 리프레시 요청을 보내고, 서버에서 쿠키를 확인하도록 함
        console.log('[axiosInstance] 서버에 리프레시 토큰 요청 전송 (HttpOnly 쿠키 자동 전송)');
        
        const refreshSuccessful = await useUserStore.getState().refreshToken();
        
        if (refreshSuccessful) {
          const newAccessToken = localStorage.getItem("accessToken");
          
          if (newAccessToken) {
            console.log('[axiosInstance] 액세스 토큰 재발급 성공, 원래 요청 재시도');
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          } else {
            console.error('[axiosInstance] 액세스 토큰이 localStorage에 저장되지 않음');
            console.log('[axiosInstance] 액세스 토큰 저장 실패 - 액세스 토큰 삭제 및 AppInitializer 재실행');
            
            localStorage.removeItem('accessToken');
            
            if (!sessionStorage.getItem('restartAppInitializer')) {
              sessionStorage.setItem('restartAppInitializer', 'true');
              console.log('[axiosInstance] AppInitializer 재실행 플래그 설정');
            }
            
            return Promise.reject(error);
          }
        } else {
          console.error('[axiosInstance] 리프레시 토큰 재발급 실패 (1회 시도 완료)');
          console.log('[axiosInstance] 리프레시 실패 - 액세스 토큰 삭제 및 AppInitializer 재실행');
          
          localStorage.removeItem('accessToken');
          
          if (!sessionStorage.getItem('restartAppInitializer')) {
            sessionStorage.setItem('restartAppInitializer', 'true');
            console.log('[axiosInstance] AppInitializer 재실행 플래그 설정');
          }
          
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error('[axiosInstance] 토큰 재발급 중 오류 발생:', refreshError);
        
        localStorage.removeItem('accessToken');
        Cookies.remove('refreshToken');
        
        if (!sessionStorage.getItem('restartAppInitializer')) {
          sessionStorage.setItem('restartAppInitializer', 'true');
          console.log('[axiosInstance] AppInitializer 재실행 플래그 설정');
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;