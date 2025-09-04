import api from '@/shared/api/axiosInstance';

export const paymentSession = async (itemId: number, pgType: string, buyerDappPortalAddress: string, idempotencyKey: string): Promise<any> => {
    const paymentInfo = {
        itemId,
        pgType,
        buyerDappPortalAddress,
        idempotencyKey
    };

    try {
    const response = await api.post('/payment/session', paymentInfo);

    // 서버 응답 처리
    if (response.data.code === 'OK') {
        if (response.data.data === null) {
            throw new Error('결제 시도에 실패했습니다.');
        }
        return response.data.data;
    } else {
        throw new Error(response.data.message || 'Failed to fetch wallet information');
    }
    } catch (error) {
        throw error;
    }
};

export default paymentSession;
