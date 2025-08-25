import api from '@/shared/api/axiosInstance';

// 테스트 버전 로그인 API
export const testLogin = async (): Promise<{
  userId: string;
  userName: string;
  referrerId: string;
  isInitial: boolean;
  accessToken: string;
  refreshToken: string;
}> => {
  try {
    // 하드코딩된 테스트 userId
    const userId = 1234;
    console.log(`[testLogin] 테스트 userId: ${userId}`);
    
    // API 명세에 따라 userId를 request body에 포함
    const response = await api.post('/auth/login/test', { userId });

    const { code, data } = response.data;
    
    // Authorization 헤더에서 액세스 토큰 추출
    const authorizationHeader = response.headers['authorization'];
    const accessToken = authorizationHeader ? authorizationHeader.replace('Bearer ', '') : '';
    
    // Set-Cookie 헤더에서 리프레시 토큰 추출 (선택사항)
    const setCookieHeader = response.headers['set-cookie'];
    let refreshToken = '';
    if (setCookieHeader) {
      const refreshTokenMatch = setCookieHeader.find(cookie => cookie.includes('refreshToken='));
      if (refreshTokenMatch) {
        refreshToken = refreshTokenMatch.split('refreshToken=')[1].split(';')[0];
      }
    }

    if (code === "OK" && accessToken) {
      // 응답 데이터에서 사용자 정보 추출
      const { userId: responseUserId, userName, referrerId, isInitial } = data;
      
      // 로컬 스토리지에 토큰 저장
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      // 사용자 정보도 로컬 스토리지에 저장
      localStorage.setItem('userId', responseUserId);
      localStorage.setItem('userName', userName);
      localStorage.setItem('referrerId', referrerId || '');
      localStorage.setItem('isInitial', isInitial ? 'true' : 'false');
      
      return {
        userId: responseUserId,
        userName,
        referrerId: referrerId || '',
        isInitial,
        accessToken,
        refreshToken
      };
    } else {
      throw new Error('로그인 응답이 올바르지 않습니다.');
    }
  } catch (error) {
    console.error("테스트 로그인 중 오류 발생:", error);
    throw error;
  }
};

export default testLogin;
