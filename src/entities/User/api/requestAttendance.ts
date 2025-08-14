import api from '@/shared/api/axiosInstance';

// 출석 API 
export const requestAttendance = async(transactionId: string): Promise<any> => {
    const response = await api.post("/attendance", {transactionId});

    if(response.data.message === "Success"){
        return true;
    }else{
        return false;
    }
};

export default requestAttendance;