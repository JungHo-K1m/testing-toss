import api from '@/shared/api/axiosInstance';

// OKX 지갑 출석 API 
export const okxAttendance = async(): Promise<any> => {
    const response = await api.get("/attendance/okx");
    // console.log("뭐지: ", response);
    if(response){
        // console.log("출첵 확인 응답 : ", response);
        return true;
    }else{
        return false;
    }
};

export default okxAttendance;