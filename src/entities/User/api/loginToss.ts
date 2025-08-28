import api from '@/shared/api/axiosInstance';
import Cookies from 'js-cookie';

// API 응답 타입 정의 - Postman 응답 기준으로 수정
interface TossLoginResponse {
  code: string;
  message: string;
  data: {
    userId: number; // Postman에서 number로 확인
    userName: string;
    referrerId: string | null; // null 허용
    isInitial: boolean;
    refreshToken: string; // 추가된 필드
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
        // // console.log('🔍 [tossLogin] API 요청 시작:', { authorizationCode, referrer });
        const response = await api.post('/auth/login/toss', userInfo);
        
        // // console.log('🔍 [tossLogin] 전체 응답:', response);
        // // console.log('🔍 [tossLogin] 응답 헤더:', response.headers);
        // // console.log('🔍 [tossLogin] 응답 데이터:', response.data);

        // 타입 가드를 사용한 안전한 응답 처리
        if (!response.data || typeof response.data !== 'object') {
            throw new Error('Invalid response format');
        }

        const responseData = response.data as TossLoginResponse | TossLoginErrorResponse;
        
        // 성공 응답인지 확인
        if (responseData.code === "OK" && 'data' in responseData) {
            const { data } = responseData as TossLoginResponse;
            
            // // console.log('🔍 [tossLogin] 성공 응답 데이터:', data);
            
            // 1. 액세스 토큰 저장 (헤더 대소문자 고려)
            const authorizationHeader = response.headers['authorization'] || response.headers['Authorization'];
            if (authorizationHeader) {
                const accessToken = authorizationHeader.replace('Bearer ', '');
                localStorage.setItem('accessToken', accessToken);
                // // console.log('✅ Access token saved to localStorage:', accessToken.substring(0, 20) + '...');
            } else {
                // console.warn('⚠️ Authorization header not found in response');
                // // console.log('🔍 [tossLogin] 사용 가능한 헤더 키들:', Object.keys(response.headers));
            }

            // 2. 사용자 정보 저장 (주석 해제)
            // if (data) {
            //     // localStorage.setItem('userId', data.userId.toString());
            //     // localStorage.setItem('userName', data.userName);
            //     // localStorage.setItem('referrerId', data.referrerId || '');
            //     // localStorage.setItem('isInitial', data.isInitial.toString());
            //     // // console.log('✅ User data saved to localStorage:', {
            //     //     userId: data.userId,
            //     //     userName: data.userName,
            //     //     referrerId: data.referrerId,
            //     //     isInitial: data.isInitial
            //     // });
            // } else {
            //     console.warn('⚠️ User data is missing in response');
            // }

            // 3. 리프레시 토큰 저장 (응답 바디에서 추출하여 쿠키에 저장)
            if (data && data.refreshToken) {
                // 쿠키에 리프레시 토큰 저장 (7일 만료)
                Cookies.set('refreshToken', data.refreshToken, { 
                    expires: 7, 
                    secure: true, 
                    sameSite: 'strict' 
                });
                // // console.log('✅ Refresh token saved to cookies from response body:', data.refreshToken.substring(0, 20) + '...');
            } else {
                // console.warn('⚠️ Refresh token not found in response body');
                // // console.log('🔍 [tossLogin] 응답 바디 데이터:', data);
            }

            // 4. 기존 Set-Cookie 헤더 확인 (참고용)
            const setCookieHeader = response.headers['set-cookie'] || response.headers['Set-Cookie'];
            if (setCookieHeader) {
                // // console.log('ℹ️ Set-Cookie 헤더 발견 (참고용):', setCookieHeader);
            } else {
                // // console.log('ℹ️ Set-Cookie 헤더 없음 (withCredentials: false로 설정됨)');
            }

            // 5. 쿠키 확인 (HttpOnly 쿠키는 접근 불가하지만 시도)
            // // console.log('🔍 [tossLogin] 쿠키 확인:');
            // // console.log('  - 전체 쿠키 (HttpOnly 제외):', document.cookie);
            // // console.log('  - refreshToken 포함 여부:', document.cookie.includes('refreshToken') ? '✅ 포함됨' : '❌ 포함되지 않음 (HttpOnly일 가능성)');
            
            // 6. 브라우저별 쿠키 확인 방법 안내
            // // console.log('💡 리프레시 토큰 확인 방법:');
            // // console.log('  1. 브라우저 개발자 도구 → Application/Storage → Cookies');
            // // console.log('  2. Network 탭에서 /auth/login/toss 응답의 Set-Cookie 헤더 확인');
            // // console.log('  3. HttpOnly 쿠키는 JavaScript로 접근 불가능');

            return data;
        } else {
            // 에러 응답 처리
            const errorData = responseData as TossLoginErrorResponse;
            // console.error('❌ Login failed:', {
            //     code: errorData.code,
            //     message: errorData.message,
            //     data: errorData.data
            // });
            throw new Error(`Login failed: ${errorData.message}`); // 에러를 다시 던지지 않고 예외 발생
        }
    } catch (error) {
        // console.error("❌ 인증 중 오류 발생:", error);
        // 에러를 다시 던지지 않고 false 반환으로 변경
        throw error; // 예외를 다시 던지지 않고 예외 발생
    }
};

export default tossLogin;