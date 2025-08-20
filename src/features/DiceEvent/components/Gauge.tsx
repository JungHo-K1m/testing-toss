//src\features\DiceEvent/components\Gauge.tsx

import React from 'react';

const Gauge: React.FC<{ gaugeValue: number }> = ({ gaugeValue }) => {
  // 게이지 값을 0-100%로 변환 (정확한 범위 보장)
  const percentage = Math.max(0, Math.min((gaugeValue / 6) * 100, 100));
  
  return (
    <div 
      id="second-step"
      className="z-10 w-[190px] h-[12px] top-[8px] absolute flex items-center justify-center"
    >
      <div className="w-full h-[12px] bg-gray-300 rounded-full overflow-hidden relative border-[2px] border-[#000000]">
        {/* 게이지 채움 - 더 선명한 그라데이션 (먼저 렌더링) */}
        <div 
          className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 transition-all duration-300 ease-out absolute top-0 left-0"
          style={{ width: `${percentage}%` }}
        />
        
        {/* 6개 세그먼트 구분선 - 더 명확한 격자 (나중에 렌더링하여 위에 표시) */}
        <div className="absolute inset-0 flex">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="flex-1 border-r-[2px] border-[#000000] last:border-r-0"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gauge;
