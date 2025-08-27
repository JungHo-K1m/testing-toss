// src/pages/SpinGame/index.tsx

import React, { useEffect, useState } from "react";
import Images from "@/shared/assets/images";
import { preloadImages } from "@/shared/utils/preloadImages";
import LoadingSpinner from "@/shared/components/ui/loadingSpinner"; // ★ 이 로딩 스피너 사용
import { motion } from "framer-motion";
import { useUserStore } from "@/entities/User/model/userModel";
import { formatNumber } from "@/shared/utils/formatNumber";
import { IoGameController } from "react-icons/io5";
import { Wheel } from "react-custom-roulette";
import { AlertDialog, AlertDialogContent } from "@/shared/components/ui";
import api from "@/shared/api/axiosInstance";
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";

// 10개 아이템으로 구성된 스핀 게임 데이터
// API 문서의 spinType (SL, KEY, BOOM)에 맞춰 구성
// 확률은 서버에서 관리하므로 클라이언트에서는 표시용으로만 사용
// 아이템 순서를 조절하여 돌림판의 시각적 균형과 다채로움을 개선
// 각 아이템마다 개별적인 각도 조정을 위한 angleOffset 추가 (사용자가 직접 수정 가능)
// 각 아이템마다 회전 속성을 위한 rotationOffset 추가 (사용자가 직접 수정 가능)
const data = [
  {
    option: "3 Keys",
    image: {
      uri: `${Images.KeyIcon}`,
      sizeMultiplier: 0.7,
      offsetY: 150,
    },
    prize: { type: "KEY", amount: 3 },
    style: { backgroundColor: "#FFD700" },
    angleOffset: 0, // 사용자가 직접 수정 가능한 각도 오프셋
    rotationOffset: 0, // 사용자가 직접 수정 가능한 회전 오프셋 (아이템과 텍스트 회전)
  },
  {
    option: "SL Points",
    image: {
      uri: `${Images.TokenReward}`,
      sizeMultiplier: 0.7,
      offsetY: 150,
    },
    prize: { type: "SL", amount: 100 },
    style: { backgroundColor: "#3498DB" },
    angleOffset: 0, // 사용자가 직접 수정 가능한 각도 오프셋
    rotationOffset: 35, // 사용자가 직접 수정 가능한 회전 오프셋 (아이템과 텍스트 회전)
  },
  {
    option: "10 Keys",
    image: {
      uri: `${Images.KeyIcon}`,
      sizeMultiplier: 0.7,
      offsetY: 150,
    },
    prize: { type: "KEY", amount: 10 },
    style: { backgroundColor: "#FF6B6B" },
    angleOffset: 0, // 사용자가 직접 수정 가능한 각도 오프셋
    rotationOffset: 80, // 사용자가 직접 수정 가능한 회전 오프셋 (아이템과 텍스트 회전)
  },
  {
    option: "20 Keys",
    image: {
      uri: `${Images.KeyIcon}`,
      sizeMultiplier: 0.7,
      offsetY: 150,
    },
    prize: { type: "KEY", amount: 20 },
    style: { backgroundColor: "#4ECDC4" },
    angleOffset: 0, // 사용자가 직접 수정 가능한 각도 오프셋
    rotationOffset: 110, // 사용자가 직접 수정 가능한 회전 오프셋 (아이템과 텍스트 회전)
  },
  {
    option: "SL Points",
    image: {
      uri: `${Images.TokenReward}`,
      sizeMultiplier: 0.7,
      offsetY: 150,
    },
    prize: { type: "SL", amount: 200 },
    style: { backgroundColor: "#2ECC71" },
    angleOffset: 0, // 사용자가 직접 수정 가능한 각도 오프셋
    rotationOffset: 140, // 사용자가 직접 수정 가능한 회전 오프셋 (아이템과 텍스트 회전)
  },
  {
    option: "50 Keys",
    image: {
      uri: `${Images.KeyIcon}`,
      sizeMultiplier: 0.7,
      offsetY: 150,
    },
    prize: { type: "KEY", amount: 50 },
    style: { backgroundColor: "#9B59B6" },
    angleOffset: 0, // 사용자가 직접 수정 가능한 각도 오프셋
    rotationOffset: 180, // 사용자가 직접 수정 가능한 회전 오프셋 (아이템과 텍스트 회전)
  },
  {
    option: "3 Keys",
    image: {
      uri: `${Images.KeyIcon}`,
      sizeMultiplier: 0.7,
      offsetY: 150,
    },
    prize: { type: "KEY", amount: 3 },
    style: { backgroundColor: "#E67E22" },
    angleOffset: 0, // 사용자가 직접 수정 가능한 각도 오프셋
    rotationOffset: 210, // 사용자가 직접 수정 가능한 회전 오프셋 (아이템과 텍스트 회전)
  },
  {
    option: "Boom!",
    image: {
      uri: `${Images.Boom}`,
      sizeMultiplier: 0.7,
      offsetY: 150,
    },
    prize: { type: "BOOM", amount: 0 },
    style: { backgroundColor: "#E74C3C" },
    angleOffset: 0, // 사용자가 직접 수정 가능한 각도 오프셋
    rotationOffset: 260, // 사용자가 직접 수정 가능한 회전 오프셋 (아이템과 텍스트 회전)
  },
  {
    option: "10 Keys",
    image: {
      uri: `${Images.KeyIcon}`,
      sizeMultiplier: 0.7,
      offsetY: 150,
    },
    prize: { type: "KEY", amount: 10 },
    style: { backgroundColor: "#1ABC9C" },
    angleOffset: 0, // 사용자가 직접 수정 가능한 각도 오프셋
    rotationOffset: 300, // 사용자가 직접 수정 가능한 회전 오프셋 (아이템과 텍스트 회전)
  },
  {
    option: "20 Keys",
    image: {
      uri: `${Images.KeyIcon}`,
      sizeMultiplier: 0.7,
      offsetY: 150,
    },
    prize: { type: "KEY", amount: 20 },
    style: { backgroundColor: "#F39C12" },
    angleOffset: 0, // 사용자가 직접 수정 가능한 각도 오프셋
    rotationOffset: 330, // 사용자가 직접 수정 가능한 회전 오프셋 (아이템과 텍스트 회전)
  },
];

// 커스텀 휠 컴포넌트
const CustomWheel: React.FC<{
  mustSpin: boolean;
  prizeNumber: number;
  onSpinEnd: () => void;
  data: any[];
}> = ({ mustSpin, prizeNumber, onSpinEnd, data }) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    if (mustSpin && !isSpinning) {
      setIsSpinning(true);

      // 핀의 위치를 기준으로 정확한 칸에 멈추도록 각도 계산 조정
      // 핀은 상단(12시 방향)에 위치하므로, 각도 계산을 조정
      // prizeNumber가 0일 때 핀이 첫 번째 칸(3 Keys)을 가리키도록
      const segmentAngle = 360 / data.length; // 각 세그먼트의 각도 (36도)
      const targetAngle = segmentAngle * prizeNumber; // 목표 칸의 각도
      
      // 5바퀴 + 목표 각도로 회전 (핀 위치에 맞춰 조정)
      const totalRotation = 360 * 5 + targetAngle;
      const duration = 3000; // 3초

      setRotation(totalRotation);

      // 회전 완료 후 콜백
      setTimeout(() => {
        setIsSpinning(false);
        onSpinEnd();
      }, duration);
    }
  }, [mustSpin, prizeNumber, data.length, onSpinEnd, isSpinning]);

  return (
    <div className="relative min-[376px]:w-[328px] min-[376px]:h-[328px] w-[280px] h-[280px]">
      {/* 배경 돌림판 이미지 */}
      <div
        className="relative w-full h-full"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning
            ? `transform ${3000}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
            : "none",
        }}
      >
        <img
          src={Images.NewWheel} // 새로운 회전판 이미지 사용
          alt="Spin Wheel"
          className="w-full h-full"
        />

                 {/* 보상 내용 오버레이 */}
         {data.map((item, index) => {
           // 핀 위치(상단)에 맞춰 각도 계산 조정
           // 첫 번째 아이템(3 Keys)이 상단(12시 방향)에 오도록
           const baseAngle = (360 / data.length) * index - 90; // -90도로 시작하여 상단부터 시작
           // 각 아이템의 개별적인 각도 조정 적용 (사용자가 직접 수정 가능)
           const angle = baseAngle + (item.angleOffset || 0);
           // 10개 아이템에 맞는 radius 계산 (돌림판 크기의 30% 반지름)
           const radius = 30; // 휠 크기의 30% 반지름으로 조정
           const x = Math.cos((angle * Math.PI) / 180) * radius;
           const y = Math.sin((angle * Math.PI) / 180) * radius;

          return (
            <div
              key={index}
              className="absolute w-[12%] h-[12%]"
              style={{
                left: `calc(50% + ${x}% - 6%)`,
                top: `calc(50% + ${y}% - 6%)`,
                transform: `rotate(${angle}deg)`, // 휠의 각도에 맞게 회전
              }}
            >
              <div 
                className="text-center w-full h-full"
                style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  justifyContent: "center",
                  position: "relative"
                }}
              >
                {/* 아이템 이미지 */}
                <img
                  src={item.image.uri}
                  alt={item.option}
                  className="w-[44px] h-[44px]"
                  style={{
                    // 이미지가 돌림판 중앙을 바라보도록 각도 조정 + 사용자 정의 회전 오프셋
                    transform: `rotate(${-angle + (item.rotationOffset || 0)}deg)`,
                    marginBottom: "2px", // 이미지 아래 여백
                  }}
                />
                {/* 수량 텍스트 - 아이템 아래에 배치 */}
                 <div
                   style={{ 
                     fontFamily: "'ONE Mobile POP', sans-serif",
                     fontSize: "12px", // 텍스트 크기를 더 줄여서 공간 확보
                     fontWeight: 400,
                     color: "#FFFFFF",
                     WebkitTextStroke: "0.5px #000000",
                     textAlign: "center",
                     lineHeight: "1",
                     position: "absolute",
                     bottom: "50%",
                     left: "-20%",
                     transform: `translateX(-50%) rotate(${-angle + (item.rotationOffset || 0)}deg)`,
                     whiteSpace: "nowrap",
                   }}
                 >
                  {item.prize.type === "BOOM" ? "꽝!" : `+${item.prize.amount}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 스핀 시작 컴포넌트
const SpinGameStart: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div
      className="flex flex-col items-center justify-center px-12 pb-8 h-full w-full"
      style={{
        backgroundImage: `url(${Images.BackgroundRulette})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1
        className="text-center mt-8 "
        style={{
          fontFamily: "'ONE Mobile POP', sans-serif",
          fontSize: "30px",
          fontWeight: 400,
          color: "#FDE047",
          WebkitTextStroke: "1px #000000",
        }}
      >
        돌림판을 돌리고,
        <br />
        상품을 받아보세요!
      </h1>

      <img
        src={Images.SpinExample}
        alt="spin-prop"
        className="w-[280px] h-[402px] md:w-[328px] md:h-[470px] self-center"
      />
      <div
        className="rounded-[20px] text-center w-[260px] md:w-[300px] h-[110px] flex items-center justify-center -mt-10"
        style={{
          background: "rgba(0, 94, 170, 0.5)",
          backdropFilter: "blur(10px)",
          boxShadow: "inset 0px 0px 4px 3px rgba(255, 255, 255, 0.6)",
          fontFamily: "'ONE Mobile POP', sans-serif",
          fontSize: "14px",
          fontWeight: 400,
          color: "#FFFFFF",
          WebkitTextStroke: "1px #000000",
        }}
      >
        <p>
          ※ 안내 ※
          <br />
          룰렛을 돌리지 않고 나가면,
          <br />
          차례가 사라집니다.
        </p>
      </div>
      <button
        className="flex relative items-center justify-center h-14 mt-8 w-[260px] md:w-[300px] rounded-[10px]"
        onClick={onStart}
        style={{
          background:
            "linear-gradient(180deg, #50B0FF 0%, #50B0FF 50%, #008DFF 50%, #008DFF 100%)",
          border: "2px solid #76C1FF",
          outline: "2px solid #000000",
          boxShadow:
            "0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 3px 0px 0px rgba(0, 0, 0, 0.1)",
          fontFamily: "'ONE Mobile POP', sans-serif",
          fontSize: "18px",
          fontWeight: 400,
          color: "#FFFFFF",
          WebkitTextStroke: "1px #000000",
        }}
      >
        <img
          src={Images.ButtonPointBlue}
          alt="button-point-blue"
          style={{
            position: "absolute",
            top: "3px",
            left: "3px",
            width: "8.47px",
            height: "6.3px",
            pointerEvents: "none",
          }}
        />
        시작하기
      </button>
    </div>
  );
};

// 실제 스핀 컴포넌트
const Spin: React.FC<{ onSpinEnd: () => void }> = ({ onSpinEnd }) => {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [prizeData, setPrizeData] = useState<{
    spinType: string;
    amount: number;
    baseAmount: number;
    rank?: number;
    diceCount?: number;
    starCount?: number;
    slCount?: number;
  } | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const { playSfx } = useSound();

  const { setStarPoints, setDiceCount, setSlToken, setLotteryCount } =
    useUserStore();

  const handleSpinClick = async () => {
    playSfx(Audios.button_click);

    if (isSpinning) return;

    try {
      setIsSpinning(true);

      playSfx(Audios.spin_game);

      // /play-spin API 호출
      const response = await api.get("/play-spin");
      console.log("Server response:", response.data);
      
      if (response.data.code === "OK" && response.data.data) {
        // API 응답 구조 안전하게 처리
        const responseData = response.data.data;
        const spinType = responseData.spinType || "";
        const amount = responseData.amount || 0;
        const baseAmount = responseData.baseAmount || 0;
        const rank = responseData.rank;
        const diceCount = responseData.diceCount;
        const starCount = responseData.starCount;
        const slCount = responseData.slCount;
        
        console.log("Received data:", { spinType, amount, baseAmount, rank, diceCount, starCount, slCount });
        console.log("Available prize types in data array:", data.map(item => ({ type: item.prize.type, amount: item.prize.amount })));

        // data 배열에서 spinType과 baseAmount에 맞는 인덱스 찾기
        // API 응답의 spinType과 baseAmount를 기준으로 매칭
        const foundIndex = data.findIndex(
          (item) => {
            const match = item.prize.type === spinType.toUpperCase() && item.prize.amount === baseAmount;
            console.log(`Checking item:`, item.prize, `against API:`, { type: spinType.toUpperCase(), amount: baseAmount }, `Match:`, match);
            return match;
          }
        );

        if (foundIndex !== -1) {
          console.log("Prize index found:", foundIndex);
          setPrizeNumber(foundIndex);
          // API 문서에 맞게 모든 필드 포함
          setPrizeData({ 
            spinType, 
            amount, 
            baseAmount, 
            rank, 
            diceCount, 
            starCount, 
            slCount 
          });
          setMustSpin(true);
        } else {
          console.error("No matching prize found for given spinType and baseAmount");
          console.error("API Response:", { spinType, baseAmount });
          console.error("Available prizes:", data.map(item => ({ type: item.prize.type, amount: item.prize.amount })));
          
          // 에러 메시지 개선
          const errorMessage = `API 응답과 일치하는 상품을 찾을 수 없습니다.\n\n요청된 상품: ${spinType} ${baseAmount}\n\n사용 가능한 상품:\n${data.map((item, idx) => `${idx + 1}. ${item.prize.type} ${item.prize.amount}`).join('\n')}`;
          alert(errorMessage);
        }
      } else {
        console.error("Error in play-spin API:", response.data.message || "Unknown error");
        alert(`API 오류: ${response.data.message || "알 수 없는 오류가 발생했습니다."}`);
      }
    } catch (error) {
      console.error("Error calling play-spin API:", error);
      
      // 에러 타입에 따른 처리
      let errorMessage = "알 수 없는 오류가 발생했습니다.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(`API 호출 오류: ${errorMessage}`);
    } finally {
      setIsSpinning(false);
    }
  };

  const handleSpinEnd = () => {
    setMustSpin(false);
    // 사용자 상태 업데이트
    if (prizeData) {
      // console.log("Prize data:", prizeData);
      const { spinType, amount, baseAmount, rank, diceCount, starCount, slCount } = prizeData;

      const normalizedSpinType = spinType.trim().toUpperCase();

      // 결과 사운드 처리
      if (normalizedSpinType === "BOOM") {
        // 붐(꽝)이면 패배 사운드
        playSfx(Audios.rps_lose);
        // console.log("Boom! Better luck next time!");
      } else {
        // 그 외엔 보상 사운드
        playSfx(Audios.reward);
      }

      // API 문서에 따르면 amount는 배수가 적용된 최종 보상
      // baseAmount는 기본 보상
      if (normalizedSpinType === "KEY") {
        // KEY 타입은 열쇠로 처리
        setLotteryCount((prev: number) => prev + amount);
      } else if (normalizedSpinType === "SL") {
        setSlToken((prev: number) => prev + amount);
      } else if (normalizedSpinType === "BOOM") {
        // BOOM은 꽝이므로 보상 없음
        console.log("Boom! Better luck next time!");
      }

      // 추가 정보 로깅 (디버깅용)
      // console.log("Additional prize info:", { rank, diceCount, starCount, slCount });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    playSfx(Audios.button_click);
    setPrizeData(null);
    setIsDialogOpen(false);
    onSpinEnd();
    setIsSpinning(false);
  };

  const getPrizeDisplayName = (spinType: string | undefined, baseAmount?: number) => {
    if (!spinType) return "Unknown";
    const normalizedSpinType = spinType.trim().toUpperCase();

    switch (normalizedSpinType) {
      case "KEY":
        return `Keys ${baseAmount || ''}`;
      case "SL":
        return `SL Points ${baseAmount || ''}`;
      case "BOOM":
        return "Boom! Try Again";
      default:
        return "Unknown";
    }
  };

  // spinType에 따라 이미지 선택
  const getPrizeImage = (spinType: string | undefined) => {
    if (!spinType) return Images.Dice;
    const normalizedSpinType = spinType.trim().toUpperCase();
    switch (normalizedSpinType) {
      case "KEY":
        return Images.KeyIcon; // 열쇠 이미지
      case "SL":
        return Images.TokenReward; // SL 포인트 이미지
      case "BOOM":
        return Images.Boom; // 붐 이미지
      default:
        return Images.Dice; // 기본값으로 주사위 이미지
    }
  };

  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 376);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

     // 핀 위치를 반응형으로 설정 - 돌림판 상단 정확한 위치
   const pinStyle = {
     left: isLargeScreen ? "calc(50% - 35px)" : "calc(50% - 25px)", // 70px vs 50px
     top: isLargeScreen ? "-45px" : "-25px", // 핀을 돌림판 상단에 더 정확하게 위치
   };

  return (
    <div
      className="relative flex flex-col items-center h-screen justify-start w-full pt-4"
      style={{
        backgroundImage: `url(${Images.BackgroundRulette})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1
        className="text-center mt-10"
        style={{
          fontFamily: "'ONE Mobile POP', sans-serif",
          fontSize: "30px",
          fontWeight: 400,
          color: "#FDE047",
          WebkitTextStroke: "1px #000000",
        }}
      >
        돌림판을 돌리고,
        <br />
        상품을 받아보세요!
      </h1>

      <div
        className="relative w-full h-[402px] md:h-[471px] mt-16"
      >
        {/* SpinProp을 받침대로 사용 */}
        <img
          src={Images.SpinProp}
          alt="Spin-prop"
          className="min-[376px]:w-[220px] min-[376px]:h-[220px] w-[190px] h-[190px] absolute"
          loading="lazy"
          style={{
            top: "50%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />

                 {/* NewPin을 받침대 위에 고정 - 돌림판 상단 정확한 위치 */}
         <img
           src={Images.NewPin}
           alt="Spin-pin"
           className="absolute z-20 min-[376px]:w-[70px] min-[376px]:h-[70px] w-[50px] h-[50px]"
           style={{
             ...pinStyle,
             // 핀을 돌림판의 정확한 상단에 위치하도록 미세 조정
             transform: "translateY(-6px)",
           }}
           loading="lazy"
         />

        {/* NewWheel을 받침대 위에서 회전 - 비율 기반 위치 */}
        <div
          className="absolute z-10"
          style={{
            top: "35%", // 더 위로 이동
            left: "50%",
            transform: "translateX(-50%) translateY(-50%)",
          }}
        >
          <CustomWheel
            mustSpin={mustSpin}
            prizeNumber={prizeNumber}
            onSpinEnd={handleSpinEnd}
            data={data}
          />
        </div>
      </div>

      <button
        onClick={handleSpinClick}
        disabled={isSpinning || mustSpin}
        style={{
          fontFamily: "'ONE Mobile POP', sans-serif",
          fontSize: "18px",
          fontWeight: 400,
          color: "#FFFFFF",
          WebkitTextStroke: "1px #000000",
          background:
            "linear-gradient(180deg, #50B0FF 0%, #50B0FF 50%, #008DFF 50%, #008DFF 100%)",
          border: "2px solid #76C1FF",
          outline: "2px solid #000000",
          boxShadow:
            "0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 3px 0px 0px rgba(0, 0, 0, 0.1)",
        }}
        className={`flex relative items-center justify-center h-14 mt-2 mb-2 w-[300px] md:w-[342px] rounded-[10px] ${
          isSpinning || mustSpin ? "cursor-not-allowed" : ""
        }`}
      >
        <img
          src={Images.ButtonPointBlue}
          alt="button-point-blue"
          style={{
            position: "absolute",
            top: "3px",
            left: "3px",
            width: "8.47px",
            height: "6.3px",
            pointerEvents: "none",
          }}
        />
        {isSpinning ? "돌리는 중..." : "스핀을 돌려라!"}
      </button>

      {/* 결과 모달 */}
      <AlertDialog open={isDialogOpen}>
        <AlertDialogContent
          className="rounded-3xl  border-none max-w-[90%] md:max-w-lg"
          style={{
            background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
            boxShadow:
              "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
          }}
        >
          <div className="flex flex-col items-center justify-center w-full h-full gap-4">
            <h1
              className="mt-10 text-center"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "18px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              보상 받기
            </h1>
            <div className="flex items-center justify-center">
              <div
                className="w-[120px] h-[120px] rounded-[12px] flex items-center justify-center flex-col gap-2"
                style={{
                  background: "rgba(0, 94, 170, 0.5)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "inset 0px 0px 4px 3px rgba(255, 255, 255, 0.6)",
                }}
              >
                <img
                  src={getPrizeImage(prizeData?.spinType)}
                  className="w-12 h-12"
                  alt="Prize"
                />
              </div>
            </div>
            <div className="flex flex-col w-full mt-4">
              <p
                className="text-center"
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                다음 보상을 받았습니다:{" "}
              </p>
              <div
                className="rounded-[20px] p-5 mt-2"
                style={{
                  background: "rgba(0, 94, 170, 0.5)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "inset 0px 0px 4px 3px rgba(255, 255, 255, 0.6)",
                }}
              >
                <div className="flex flex-row items-center gap-2">
                  <img
                    src={Images.RewardNFT}
                    alt="rewardBooster"
                    className="w-6 h-6"
                  />
                  <p
                    style={{
                      fontFamily: "'ONE Mobile POP', sans-serif",
                      fontSize: "14px",
                      fontWeight: 400,
                      color: "#FFFFFF",
                      WebkitTextStroke: "1px #000000",
                    }}
                  >
                    {getPrizeDisplayName(prizeData?.spinType, prizeData?.baseAmount)}
                  </p>
                </div>
                <div className="flex flex-row items-center gap-1 mt-2 ml-6">
                  <IoGameController className="text-xl" />
                  <p
                    style={{
                      fontFamily: "'ONE Mobile POP', sans-serif",
                      fontSize: "14px",
                      fontWeight: 400,
                      color: "#FFFFFF",
                      WebkitTextStroke: "1px #000000",
                    }}
                  >
                    {prizeData?.spinType === "BOOM" ? "Boom! Try Again" : 
                     `${getPrizeDisplayName(prizeData?.spinType, prizeData?.baseAmount)}: ${prizeData?.amount || 0}`}
                  </p>
                </div>
                
              </div>
            </div>
            <div className="space-y-3 w-[300px] h-14 mt-4">
              <button
                className="w-full h-14 rounded-[10px] relative"
                onClick={handleCloseDialog}
                style={{
                  background:
                    "linear-gradient(180deg, #FF6D70 0%, #FF6D70 50%, #FF2F32 50%, #FF2F32 100%)",
                  border: "2px solid #FF8E8E",
                  outline: "2px solid #000000",
                  boxShadow:
                    "0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 3px 0px 0px rgba(0, 0, 0, 0.1)",
                  fontFamily: "18px",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                <img
                  src={Images.ButtonPointRed}
                  alt="button-point-red"
                  style={{
                    position: "absolute",
                    top: "3px",
                    left: "3px",
                    width: "8.47px",
                    height: "6.3px",
                    pointerEvents: "none",
                  }}
                />
                닫기
              </button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// 메인 SpinGame 컴포넌트
const SpinGame: React.FC<{ onSpinEnd: () => void }> = ({ onSpinEnd }) => {
  const [showSpin, setShowSpin] = useState(false);
  const { playSfx } = useSound();

  // 이미지 로딩 여부 (true일 때 로딩 중)
  const [isLoading, setIsLoading] = useState(true);

  // preload할 이미지 목록
  const imagesToLoad = [
    Images.BackgroundRulette,
    Images.SpinExample,
    Images.SpinProp,
    Images.Spin,
    Images.SpinPin,
    Images.NewWheel, // 새로운 회전판 이미지 추가
    Images.NewPin, // 핀 이미지 추가
    Images.RewardNFT,
    // 새로운 보상 타입에 필요한 이미지들
    Images.KeyIcon, // 열쇠 이미지
    Images.TokenReward, // SL 포인트 이미지
    Images.Boom, // 붐 이미지
    // 기본 이미지들
    Images.Dice, // 기본값 이미지

    // 필요한 이미지가 더 있다면 모두 추가...
  ];

  useEffect(() => {
    // 컴포넌트가 마운트되면 이미지 모두 로딩
    const loadAllImages = async () => {
      try {
        await preloadImages(imagesToLoad);
      } catch (error) {
        // console.error("이미지 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllImages();
  }, []);

  const handleStartClick = () => {
    playSfx(Audios.button_click);
    setShowSpin(true);
  };

  // 로딩 중이면 LoadingSpinner 보여주고, 끝나면 실제 화면
  if (isLoading) {
    return <LoadingSpinner className="h-screen" />;
  }

  return (
    <div className="flex flex-col z-50 h-screen w-full items-center min-w-[320px] md:min-w-[600px]">
      {showSpin ? (
        <Spin onSpinEnd={onSpinEnd} />
      ) : (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
          className="flex h-full w-full"
        >
          <SpinGameStart onStart={handleStartClick} />
        </motion.div>
      )}
    </div>
  );
};

export default SpinGame;
