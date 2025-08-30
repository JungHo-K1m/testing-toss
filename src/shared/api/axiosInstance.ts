import axios from 'axios';
import Cookies from 'js-cookie';
import { useUserStore } from '@/entities/User/model/userModel';



// Axios 인스턴스 생성
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://appsintoss.savethelife.io/api/',
  headers: {
    'Content-Type': 'application/json', // 기본 Content-Type
  },
  withCredentials: true, // true로 설정하여 쿠키 전송 활성화
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
        // 무한 리프레시 방지를 위해 한 번만 리다이렉트
        if (!sessionStorage.getItem('redirectingToLogin')) {
          sessionStorage.setItem('redirectingToLogin', 'true');
          console.log('[axiosInstance] 액세스 토큰 없음, 로그인 페이지로 리다이렉트');
          // window.location.href = "/";
        }
      }
      // 에러 던지기 주석처리 (테스트용)
      // return Promise.reject(new Error("Access token not found."));
      console.log('[axiosInstance] 액세스 토큰 없음 - 에러 던지기 주석처리됨 (테스트용)');
      return Promise.reject(error); // 원래 에러를 그대로 반환
    }

    const errorMessage =
      error.response && typeof error.response.data === "string"
        ? error.response.data
        : "";

    // 401 에러인 경우 특별 처리
    if (error.response && error.response.status === 401) {
      // "Full authentication is required" 에러인 경우 리다이렉트 방지
      if (errorMessage.includes("Full authentication is required to access this resource")) {
        return Promise.reject(error);
      }
    }

    // 리프레시 토큰으로 액세스 토큰 재발급 시도 (딱 한 번만)
    if (
      error.response &&
      !originalRequest._retry && // 아직 재시도하지 않은 요청
      (
        error.response.status === 401 ||
        error.response.status === 403 ||        // 403 에러 추가
        error.response.status === 404 ||
        errorMessage.includes("Token not found in Redis or expired")
      ) &&
      // "Full authentication" 에러가 아닌 경우에만 리프레시 토큰 로직 실행
      !errorMessage.includes("Full authentication is required to access this resource")
    ) {
      // 재시도 플래그 설정 (한 번만 시도)
      originalRequest._retry = true;
      
      try {
        console.log('[axiosInstance] 리프레시 토큰으로 액세스 토큰 재발급 시도');
        
        // 이미 리프레시를 시도했는지 확인 (sessionStorage 기반)
        const hasAttemptedRefresh = sessionStorage.getItem('refreshAttempted');
        if (hasAttemptedRefresh) {
          console.log('[axiosInstance] 이미 리프레시를 시도했음 - 중복 시도 방지');
          return Promise.reject(error);
        }
        
        // 리프레시 시도 플래그 설정
        sessionStorage.setItem('refreshAttempted', 'true');
        
        // 리프레시 토큰이 쿠키에 있는지 확인
        const refreshToken = Cookies.get('refreshToken');
        
        if (!refreshToken) {
          console.error('[axiosInstance] 쿠키에서 리프레시 토큰을 찾을 수 없습니다');
          console.log('[axiosInstance] 에러를 던지지 않고 콘솔에만 기록');
          return Promise.reject(error);
        }

        console.log('[axiosInstance] 리프레시 토큰 발견, 토큰 재발급 요청');
        
        // useUserStore의 refreshToken 함수 호출하여 액세스 토큰 재발급
        const refreshSuccessful = await useUserStore.getState().refreshToken();
        
        if (refreshSuccessful) {
          const newAccessToken = localStorage.getItem("accessToken");
          
          if (newAccessToken) {
            console.log('[axiosInstance] 액세스 토큰 재발급 성공, 원래 요청 재시도');
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          } else {
            console.error('[axiosInstance] 액세스 토큰이 localStorage에 저장되지 않음');
            console.log('[axiosInstance] 에러를 던지지 않고 콘솔에만 기록');
            return Promise.reject(error);
          }
        } else {
          console.error('[axiosInstance] 리프레시 토큰 재발급 실패 (1회 시도 완료)');
          console.log('[axiosInstance] 에러를 던지지 않고 콘솔에만 기록');
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error('[axiosInstance] 토큰 재발급 중 오류 발생:', refreshError);
        
        // 재발급 실패 시 기존 토큰 제거
        localStorage.removeItem('accessToken');
        Cookies.remove('refreshToken');
        
        // 무한 리프레시 방지를 위해 한 번만 리다이렉트
        if (!sessionStorage.getItem('redirectingToLogin')) {
          sessionStorage.setItem('redirectingToLogin', 'true');
          console.log('[axiosInstance] 토큰 재발급 실패, 로그인 페이지로 리다이렉트');
          // window.location.href = "/";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;