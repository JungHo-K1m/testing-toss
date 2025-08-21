import React from 'react';
import { HiCheck, HiX } from 'react-icons/hi';
import Images from '@/shared/assets/images';

interface AttendanceDayProps {
  day: string;
  status: 'checked' | 'missed' | 'default' | 'today';
  displayDay: string;
  onClick?: () => void;
}

const AttendanceDay: React.FC<AttendanceDayProps> = ({ day, status, displayDay, onClick  }) => {
  const getStatusClass = () => {
    switch (status) {
      case 'checked':
        return 'text-white'; // 테두리 제거
      case 'missed':
        return 'text-white'; // 테두리 제거
      case 'default':
        return 'border-slate-200'; // 기본 상태는 테두리 유지
      case 'today':
        return 'border-yellow-400 animate-pulse'; // 오늘 날짜는 테두리 유지
      default:
        return '';
    }
  };

  // 출석 상태에 따른 아이콘 렌더링
  const renderStatusIcon = () => {
    switch (status) {
      case 'checked':
        return (
          <img
            src={Images.CheckIcon}
            alt="출석 완료"
            className="w-8 h-8" // 40x40 사이즈
            style={{ width: '32px', height: '32px' }}
          />
        );
      case 'missed':
        return (
          <img
            src={Images.CloseIcon}
            alt="출석 실패"
            className="w-8 h-8" // 40x40 사이즈
            style={{ width: '32px', height: '32px' }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={`flex flex-col items-center justify-center gap-2 ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick} // 클릭 핸들러 부여
    >
      <p className="font-semibold">{displayDay}</p>
      <div
        className={`w-8 h-8 rounded-full flex justify-center items-center ${
          status === 'checked' || status === 'missed' ? '' : 'border-2'
        } ${getStatusClass()}`}
      >
        {renderStatusIcon()}
      </div>
    </div>
  );
};

export default AttendanceDay;
