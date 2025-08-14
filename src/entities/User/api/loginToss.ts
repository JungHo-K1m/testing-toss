import api from '@/shared/api/axiosInstance';

// API 응답 타입 정의 - Postman 응답 기준으로 수정
interface TossLoginResponse {
  code: string;
  message: string;
  data: {
    userId: number; // Postman에서 number로 확인
    userName: string;
    referrerId: string | null; // null 허용
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
export const tossLogin = async (authorizationCode: string, referrer: string): Promise<boolean> => {
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
            
            // 1. 액세스 토큰 저장 (헤더 대소문자 고려)
            const authorizationHeader = response.headers['authorization'] || response.headers['Authorization'];
            if (authorizationHeader) {
                const accessToken = authorizationHeader.replace('Bearer ', '');
                localStorage.setItem('accessToken', accessToken);
                console.log('✅ Access token saved to localStorage:', accessToken.substring(0, 20) + '...');
            } else {
                console.warn('⚠️ Authorization header not found in response');
            }
            
            // 2. 사용자 정보 저장
            // if (data) {
            //     localStorage.setItem('userId', data.userId.toString());
            //     localStorage.setItem('userName', data.userName);
            //     localStorage.setItem('referrerId', data.referrerId || '');
            //     localStorage.setItem('isInitial', data.isInitial.toString());
            //     console.log('✅ User data saved to localStorage:', {
            //         userId: data.userId,
            //         userName: data.userName,
            //         referrerId: data.referrerId,
            //         isInitial: data.isInitial
            //     });
            // }

            // 3. 리프레시 토큰 확인 (Set-Cookie는 브라우저가 자동 처리)
            const setCookieHeader = response.headers['set-cookie'] || response.headers['Set-Cookie'];
            if (setCookieHeader) {
                console.log('✅ Refresh token cookie set by browser:', setCookieHeader);
            } else {
                console.warn('⚠️ Set-Cookie header not found in response');
            }

            return true;
        } else {
            // 에러 응답 처리
            const errorData = responseData as TossLoginErrorResponse;
            console.error('❌ Login failed:', {
                code: errorData.code,
                message: errorData.message,
                data: errorData.data
            });
            return false;
        }
    } catch (error) {
        console.error("❌ 인증 중 오류 발생:", error);
        // 에러를 다시 던지지 않고 false 반환으로 변경
        return false;
    }
};

export default tossLogin;