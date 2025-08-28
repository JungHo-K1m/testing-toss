import api from '@/shared/api/axiosInstance';

// USDT 클래임 요청 API
export const requestUSDTClaim = async (amount: string, walletAddress: string): Promise<any> => {
  const claimInfo = {
    amount,
    walletAddress
  };

  try {
    const response = await api.post('/claim/usdt', claimInfo);

    // 서버 응답 처리: code가 OK이면 response.data 반환
    if (response.data.code === 'OK') {
        // console.log("check claim: ", response);
        return response.data;
    } else {
        console.error('예상치 못한 응답:', response);
        throw new Error(response.data.message || '클레임 요청에 실패했습니다.');
    }
  } catch (error) {
    console.error('클레임 요청 중 오류 발생:', error);
    throw error;
  }
};

export default requestUSDTClaim;
