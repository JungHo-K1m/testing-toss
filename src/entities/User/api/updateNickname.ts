import api from '@/shared/api/axiosInstance';

// 사용자 이름 업데이트 API 
export const updateNickname = async(name: string): Promise<any> => {
    const response = await api.post("/name", {name});

    if(response.data.code === "OK"){
        return response.data;
    }else {
        throw new Error(response.data.message || 'Failed to fetch nickname update');
    }
};

export default updateNickname;