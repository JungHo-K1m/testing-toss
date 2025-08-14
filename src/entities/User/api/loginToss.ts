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

// 웹 버전 지갑 로그인
export const tossLogin = async (authorizationCode: string, referrer: string): Promise<boolean | undefined> => {
    const userInfo = {
        authorizationCode,
        referrer
    }

    try {
        const response = await api.post('/auth/login/toss', userInfo);

        const { code, data } = response.data as TossLoginResponse;
        
        // Postman 응답 기준: Authorization 헤더에서 액세스 토큰 추출
        const authorizationHeader = response.headers['authorization'];
        const setCookieHeader = response.headers['set-cookie'];

        if (code === "OK") {
            // 1. 액세스 토큰 저장 (Authorization 헤더)
            if (authorizationHeader) {
                const accessToken = authorizationHeader.replace('Bearer ', '');
                localStorage.setItem('accessToken', accessToken);
                console.log('✅ Access token saved to localStorage:', accessToken.substring(0, 20) + '...');
            } else {
                console.warn('⚠️ Authorization header not found in response');
            }
            
            // 2. 사용자 정보 저장
            if (data) {
                localStorage.setItem('userId', data.userId.toString());
                localStorage.setItem('userName', data.userName);
                localStorage.setItem('referrerId', data.referrerId || '');
                localStorage.setItem('isInitial', data.isInitial.toString());
                console.log('✅ User data saved to localStorage:', {
                    userId: data.userId,
                    userName: data.userName,
                    referrerId: data.referrerId,
                    isInitial: data.isInitial
                });
            }

            // 3. 리프레시 토큰 확인 (Set-Cookie는 브라우저가 자동 처리)
            if (setCookieHeader) {
                console.log('✅ Refresh token cookie set by browser:', setCookieHeader);
            } else {
                console.warn('⚠️ Set-Cookie header not found in response');
            }

            return true;
        } else {
            console.error('❌ Login failed:', response.data);
            return false;
        }
    } catch (error) {
        console.error("❌ 인증 중 오류 발생:", error);
        throw error;
    }
};

export default tossLogin;