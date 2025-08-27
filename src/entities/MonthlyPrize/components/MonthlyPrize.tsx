import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Images from "@/shared/assets/images";
import { useNavigate } from "react-router-dom";
import { useNavigationStore } from "@/shared/store/navigationStore";
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";

interface MonthlyPrizeProps {
  month: number;
  prizeType: string;
  amount: number;
  eventFinishTime: string;
}

const MonthlyPrize: React.FC<MonthlyPrizeProps> = ({
  month,
  prizeType,
  amount,
  eventFinishTime,
}) => {
  const navigate = useNavigate();
  const { playSfx } = useSound();
  const setSelected = useNavigationStore((state) => state.setSelected);

  // 월 이름 배열
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // 남은 시간 표시용 state
  const [timeLeft, setTimeLeft] = useState("");

  // "눈 표시 여부" 관리
  const [showSnow, setShowSnow] = useState(false);

  // 10초 간격으로 2초 동안 눈이 내리고, 8초 쉬는 로직
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     // 눈 내림 시작
  //     setShowSnow(true);

  //     // 3초 뒤 멈춤
  //     setTimeout(() => {
  //       setShowSnow(false);
  //     }, 3000);
  //   }, 30000);

  //   return () => clearInterval(interval);
  // }, []);

  // 카운트다운 업데이트
  useEffect(() => {
    const endDate = new Date(eventFinishTime);

    const updateCountdown = () => {
      const now = Date.now();
      const distance = endDate.getTime() - now;
      if (distance < 0) {
        setTimeLeft("Event has ended");
        return;
      }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);

      setTimeLeft(`Time Left: ${days}d ${hours}h ${minutes}m`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [eventFinishTime]);

  // 클릭 -> /reward
  const handleRankingClick = () => {
    playSfx(Audios.button_click);
    setSelected("/reward");
    if (window.location.pathname !== "/reward") {
      navigate("/reward");
    }
  };

  // Snowfall에 쓸 이미지
  const slTokenImage = new Image();
  slTokenImage.src = Images.TokenReward;
  const usdtImage = new Image();
  usdtImage.src = Images.USDT;
  const images = [slTokenImage, usdtImage];

  return (
    <div
      onClick={handleRankingClick}
      // className="
      //   relative z-10 flex flex-col items-center justify-center
      //   w-[210px] h-[160px] md:w-[340px] md:h-44
      //   text-white border-2 border-[#BBA361] rounded-3xl
      //   overflow-visible bg-neutral-900
      // "
      className="z-10 flex flex-col items-center justify-center relative"
      style={{
        width: "210px",
        height: "160px",
        background: "rgba(255,255,255,0.65)",
        borderRadius: 20,
        boxShadow: "0px 2px 2px 0px rgba(0,0,0,0.4)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      {/* 상단 텍스트 - 위치 조정 */}
      <div className="flex flex-col items-center text-center mt-1">
        <p
          className="text-center"
          style={{
            fontFamily: "'ONE Mobile POP', sans-serif",
            fontSize: "18px",
            fontWeight: 400,
            color: "#FFFFFF",
            WebkitTextStroke: "1px #000000",
          }}
        >
          이번 주 보상
        </p>
      </div>

      {/* 메인 상품 이미지 - 위치 조정 */}
      <motion.img
        src={Images.Prizes}
        alt="token logo"
        className="w-[150px] -mt-3"
      />

      {/* 상품 정보 - 위치 조정 */}
      <div className="flex flex-col items-center text-center -mt-4">
        <p
          className="text-center"
          style={{
            fontFamily: "'ONE Mobile POP', sans-serif",
            fontSize: "18px",
            fontWeight: 400,
            color: "#0147E5",
          }}
        >
          Toss Point
        </p>
        <p
          className="text-center"
          style={{
            fontFamily: "'ONE Mobile POP', sans-serif",
            fontSize: "12px",
            fontWeight: 400,
            color: "#2A294E",
          }}
        >
          (총 100만원 상당)
        </p>
      </div>
    </div>
  );
};

export default MonthlyPrize;
