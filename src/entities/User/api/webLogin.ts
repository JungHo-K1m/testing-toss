import api from '@/shared/api/axiosInstance';

// 웹 버전 지갑 로그인
export const webLoginWithAddress = async (walletAddress: string, referrerCode: string | null): Promise<boolean | undefined> => {
    const userInfo = {
        walletAddress,
        referrerCode
    }

    try {
        const response = await api.post('/auth/login/web', userInfo);

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
