import api from '@/shared/api/axiosInstance';
import Cookies from 'js-cookie';

// API 응답 타입 정의 - API 문서 기준으로 수정
interface TossLoginResponse {
  code: string;
  message: string;
  data: {
    userId: string; // API 문서에 따르면 string
    userName: string;
    referrerId: string;
    isInitial: boolean;
  };
}

// API 에러 응답 타입
interface TossLoginErrorResponse {
  code: string;
  message: string;
  data?: any;
}

// 토스 로그인
export const tossLogin = async (authorizationCode: string, referrer: string): Promise<TossLoginResponse['data']> => {
    const userInfo = {
        authorizationCode,
        referrer
    }

    try {
        console.log('[loginToss] tossLogin 시작:', { authorizationCode: authorizationCode.substring(0, 10) + '...', referrer });
        
        const response = await api.post('/auth/login/toss', userInfo);
        console.log('[loginToss] tossLogin 응답 수신:', response);
        
        // 응답 데이터 구조 확인 및 로깅
        console.log('[loginToss] 응답 데이터 구조:', {
            hasData: !!response.data,
            dataType: typeof response.data,
            dataKeys: response.data ? Object.keys(response.data) : [],
            fullData: response.data
        });
        
        // 응답 데이터 타입 가드
        if (!response.data || typeof response.data !== 'object') {
            throw new Error('Invalid response data');
        }

        // API 문서에 따르면 액세스 토큰은 헤더에 있음
        let accessToken = null;
        
        // 1. Authorization 헤더에서 accessToken 확인 (API 문서 기준)
        if (response.headers['authorization'] || response.headers['Authorization']) {
            const authHeader = response.headers['authorization'] || response.headers['Authorization'];
            accessToken = authHeader.replace('Bearer ', '');
            console.log('[loginToss] Authorization 헤더에서 accessToken 발견');
        } else {
            console.warn('[loginToss] Authorization 헤더에서 accessToken을 찾을 수 없습니다');
        }
        
        // accessToken 저장
        if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
            console.log('[loginToss] accessToken 저장 완료');
        } else {
            console.error('[loginToss] accessToken이 없어서 저장할 수 없습니다');
        }

        // 서버 응답 구조에 따라 사용자 데이터 추출
        let userData: TossLoginResponse['data'];
        
        // 1. response.data.data 형태인지 확인 (일반적인 API 응답 구조)
        if (response.data.data && typeof response.data.data === 'object') {
            console.log('[loginToss] response.data.data 구조 사용');
            userData = response.data.data as TossLoginResponse['data'];
        } 
        // 2. response.data가 직접 userData인지 확인
        else if (response.data.userId !== undefined) {
            console.log('[loginToss] response.data 직접 사용');
            userData = response.data as TossLoginResponse['data'];
        } 
        // 3. 그 외의 경우
        else {
            console.error('[loginToss] 알 수 없는 응답 데이터 구조:', response.data);
            throw new Error('Unknown response data structure');
        }
        
        console.log('[loginToss] 추출된 사용자 데이터:', userData);

        // Set-Cookie 헤더 확인 (HttpOnly 쿠키는 JavaScript에서 직접 접근할 수 없음)
        const setCookieHeader = response.headers['set-cookie'];
        console.log('[loginToss] Set-Cookie 헤더 확인:', setCookieHeader ? '존재함' : '없음');
        
        // Set-Cookie 헤더 상세 로깅
        if (setCookieHeader) {
          console.log('[loginToss] Set-Cookie 헤더 상세:', setCookieHeader);
          // refreshToken 쿠키가 포함되어 있는지 확인
          const hasRefreshToken = setCookieHeader.some(cookie => 
            cookie.includes('refreshToken') || cookie.includes('RefreshToken')
          );
          console.log('[loginToss] refreshToken 쿠키 포함 여부:', hasRefreshToken);
        }

        // HttpOnly 쿠키는 JavaScript에서 직접 접근할 수 없으므로 확인하지 않음
        console.log('[loginToss] ✅ HttpOnly 쿠키는 서버에서 자동으로 관리됩니다');
        
        console.log('[loginToss] ✅ tossLogin 성공:', { 
            userId: userData.userId, 
            userName: userData.userName, 
            isInitial: userData.isInitial,
            hasAccessToken: !!localStorage.getItem('accessToken'),
            hasSetCookieHeader: !!setCookieHeader
        });
        
        return userData;
    } catch (error: any) {
        console.error('[loginToss] ❌ tossLogin 실패:', error);
        
        if (error.response) {
            console.error('[loginToss] 에러 응답 상태:', error.response.status);
            console.error('[loginToss] 에러 응답 데이터:', error.response.data);
            console.error('[loginToss] 에러 응답 헤더:', error.response.headers);
        }
        
        throw error;
    }
};

export default tossLogin;