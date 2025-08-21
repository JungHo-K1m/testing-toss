import api from '@/shared/api/axiosInstance';

// 출석 체크 API 응답 타입 정의
export interface AttendanceResponse {
  weekly: {
    mon: boolean;
    tue: boolean;
    wed: boolean;
    thu: boolean;
    fri: boolean;
    sat: boolean;
    sun: boolean;
  };
  randomBox: {
    result: 'EQUIPMENT' | 'DICE' | 'SL' | 'NONE';
    equipment?: {
      ownedEquipmentId: number;
      type: 'HEAD' | 'EYE' | 'EAR' | 'NECK' | 'BACK';
      rarity: number; // 0~9
    };
  };
}

// 출석 체크 API (GET 요청으로 변경)
export const requestAttendance = async (): Promise<AttendanceResponse> => {
  const response = await api.get("/attendance");

  if (response.data.message === "Success") {
    return response.data.data;
  } else {
    throw new Error(response.data.message || "출석 체크에 실패했습니다.");
  }
};

export default requestAttendance;