import api from '@/shared/api/axiosInstance';

// 친구목록
export const getReferralDetail = async (
    assetType: any, 
    startDate: any, 
    endDate: any, 
    friendId: any
): Promise<any> => {
    
    const filters = {
        assetType,
        startDate,
        endDate,
        friendId
    }
    
    const response = await api.post('/friends/reward/details', filters);

    if (response.data.code === 'OK') {
        return response.data.data;
    } else {
        // console.error('Unexpected response:', response);
        throw new Error(response.data.message || 'Failed to fetch pet information');
    }
};


export default getReferralDetail;
