import api from '@/shared/api/axiosInstance';

export const getMyAssets = async(walletAddress: string): Promise<any> => {
    const response = await api.post('/assets', {walletAddress});

    if(response.data.code === 'OK'){
        return response.data.data;
    }else{
        throw new Error(response.data.message || 'Failed to fetch wallet information');
    }
};

export default getMyAssets;