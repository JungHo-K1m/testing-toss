import api from '@/shared/api/axiosInstance';

// 사용자 타임존 업데이트 api
export const updateTimeZone = async(timeZone : string): Promise<any> => {
    const response = await api.post("/timezone ", {timeZone });

    if(response.data.message === "Success"){
        return true;
    }else{
        return false;
    }
};

export default updateTimeZone;