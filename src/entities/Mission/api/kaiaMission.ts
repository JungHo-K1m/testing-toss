import api from '@/shared/api/axiosInstance';

// Level2 KAIA 보상 api 
export const requestKaiaMission = async(signedTx:string, walletAddress: string): Promise<any> => {
    const info = {
        userSignedTx: signedTx,
        walletAddress: walletAddress
    }

    const response = await api.post("/mission/kaia", info);

    if(response.data.code === "OK"){
        // console.log("kaia mission response: ", response);
        return response.data;
    }else {
        console.error('Unexpected response:', response);
        throw new Error(response.data.message || 'Failed to fetch get Kaia Mission');
    }
};

export default requestKaiaMission;