import api from '@/shared/api/axiosInstance';

export const getMyAssets = async(walletAddress: string): Promise<any> => {
    const response = await api.post('/assets', {walletAddress});

    if(response.data.code === 'OK'){
        // // // console.log("my asset response: ", response);
        return response.data.data;
    }else{
        // // console.error('Unexpected response:', response);
        throw new Error(response.data.message || 'Failed to fetch wallet information');
    }
};

export default getMyAssets;