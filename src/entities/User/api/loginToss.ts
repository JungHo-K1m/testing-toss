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
        const response = await api.post('/auth/login/toss', userInfo);
        
        // 타입 가드를 사용한 안전한 응답 처리
        if (!response.data || typeof response.data !== 'object') {
            throw new Error('Invalid response format');
        }

        const responseData = response.data as TossLoginResponse | TossLoginErrorResponse;
        
        // 성공 응답인지 확인
        if (responseData.code === "OK" && 'data' in responseData) {
            const { data } = responseData as TossLoginResponse;
            
            // 액세스 토큰 저장 (헤더 대소문자 고려)
            const authorizationHeader = response.headers['authorization'] || response.headers['Authorization'];
            if (authorizationHeader) {
                const accessToken = authorizationHeader.replace('Bearer ', '');
                
                // 액세스 토큰 형식 검증
                if (accessToken.length < 10) {
                    console.warn('⚠️ 액세스 토큰이 너무 짧습니다:', accessToken);
                }
                
                localStorage.setItem('accessToken', accessToken);
                console.log('✅ 액세스 토큰이 localStorage에 저장되었습니다');
            } else {
                console.warn('⚠️ Authorization 헤더를 찾을 수 없습니다');
                console.log('응답 헤더:', response.headers);
            }
            // 리프레시 토큰 확인 (HttpOnly 쿠키로 자동 설정됨)
            const setCookieHeader = response.headers['set-cookie'] || response.headers['Set-Cookie'];
            if (setCookieHeader) {
                // HttpOnly 쿠키는 자동으로 브라우저에서 관리되므로 별도 저장 불필요
                console.log('✅ 리프레시 토큰이 HttpOnly 쿠키로 설정되었습니다');
                console.log('Set-Cookie 헤더:', setCookieHeader);
            } else {
                console.warn('⚠️ Set-Cookie 헤더에서 리프레시 토큰을 찾을 수 없습니다');
            }

            return data;
        } else {
            // 에러 응답 처리
            const errorData = responseData as TossLoginErrorResponse;
            throw new Error(`Login failed: ${errorData.message}`); // 에러를 다시 던지지 않고 예외 발생
        }
    } catch (error: any) {
        console.error('[tossLogin] 에러 발생:', error);
        
        // HTTP 에러 응답 처리
        if (error.response) {
            const { status, data } = error.response;
            console.error('[tossLogin] HTTP 에러:', { status, data });
            
            // 서버에서 반환한 에러 메시지가 있는 경우
            if (data && data.message) {
                throw new Error(data.message);
            }
            
            // 상태 코드별 기본 메시지
            switch (status) {
                case 400:
                    throw new Error('잘못된 요청입니다. 입력값을 확인해주세요.');
                case 401:
                    throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
                case 403:
                    throw new Error('접근 권한이 없습니다.');
                case 404:
                    throw new Error('로그인 서비스를 찾을 수 없습니다.');
                case 500:
                    throw new Error('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
                case 502:
                    throw new Error('서버 게이트웨이 오류가 발생했습니다.');
                case 503:
                    throw new Error('서비스가 일시적으로 사용할 수 없습니다.');
                default:
                    throw new Error(`서버 오류 (${status})`);
            }
        } else if (error.request) {
            // 요청은 보냈지만 응답을 받지 못한 경우
            console.error('[tossLogin] 네트워크 에러:', error.request);
            throw new Error('네트워크 연결을 확인해주세요.');
        } else {
            // 요청 자체를 보내지 못한 경우
            throw new Error(error.message || '로그인 요청을 처리할 수 없습니다.');
        }
    }
};

export default tossLogin;