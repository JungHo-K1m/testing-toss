import api from '@/shared/api/axiosInstance';

// 테스트 버전 로그인
export const webLoginWithAddress = async (userId: number): Promise<boolean | undefined> => {

    try {
        const response = await api.post('/auth/login/test', userId);

        const { code, data } = response.data;
        const authorizationHeader = response.headers['authorization'];

        if (code === "OK" && authorizationHeader) {
            // console.log("wallet Login: ", response);
            // Bearer 접두사를 제거하여 액세스 토큰 추출
            const accessToken = authorizationHeader.replace('Bearer ', '');
            // 로컬 스토리지에 액세스 토큰 저장
            localStorage.setItem('accessToken', accessToken);
            return true;
        }
    } catch (error) {
        console.error("인증 중 오류 발생:", error);
        throw error;
    }
};

export default webLoginWithAddress;
