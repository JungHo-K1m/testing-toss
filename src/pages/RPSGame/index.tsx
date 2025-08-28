// src/pages/RPSGame/index.tsx

import React, { useEffect, useState } from "react";
import Images from "@/shared/assets/images";
import { motion } from "framer-motion";
import { formatNumber } from "@/shared/utils/formatNumber";
import RPSResultDialog from "./ui/RPSResultDialog";
import RPSGameStart from "./ui/RPSGameStart";
import { useRPSGameStore } from "./store";
import { useUserStore } from "@/entities/User/model/userModel";
import LoadingSpinner from "@/shared/components/ui/loadingSpinner"; // ★ 로딩 스피너
import { preloadImages } from "@/shared/utils/preloadImages"; // ★ 이미지 프리로딩 함수
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";
import { getRPSRetryAdReward } from "@/entities/User/api/RetryRPS";

interface RPSGameProps {
  onGameEnd: (result: "win" | "lose", winnings: number) => void;
  onCancel: () => void;
}

const rpsImages = {
  rock: Images.IconRock,
  paper: Images.IconPaper,
  scissors: Images.IconScissors,
};

const RPSGame: React.FC<RPSGameProps> = ({ onGameEnd, onCancel }) => {
  // -----------------------
  // 1) 로딩 상태 관리
  // -----------------------
  const [isLoading, setIsLoading] = useState(true);

  // -----------------------
  // 필요한 이미지 모두 담기
  // -----------------------
  const imagesToLoad = [
    Images.BGRPSGame,
    Images.RPSExample,
    Images.RPSGame,
    Images.Rock,
    Images.Paper,
    Images.Scissors,
    Images.RockButton,
    Images.PaperButton,
    Images.ScissorsButton,
    Images.Star,
    // 혹시 RPSGameStart, RPSResultDialog 등에서 추가로 쓰는 이미지도 여기 포함
  ];

  // -----------------------
  // 이미지 프리로드
  // -----------------------
  useEffect(() => {
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

  // -----------------------
  // RPS 게임 관련 상태
  // -----------------------
  const {
    betAmount,
    isSpinning,
    isDialogOpen,
    gameResult,
    lastReward,
    isGameStarted,
    rpsId, // store에서 rpsId 가져오기
    startGame,
    spin,
    stopSpin,
    endGame,
    closeDialog,
    playRound,
    handleRPSGameEnd,
    handleRetryGameResult, // 재시도 게임용 결과 처리 함수
    setRpsId, // rpsId 설정 함수
    resetForRetry, // 재시도를 위한 상태 리셋 함수
  } = useRPSGameStore();

  const { starPoints } = useUserStore();
  const { playSfx } = useSound();

  // -----------------------
  // 슬롯 애니메이션 상태
  // -----------------------
  const [slotState, setSlotState] = useState<"spinning" | "stopped">("stopped");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // -----------------------
  // RPS 게임 재시도 관련 상태 추가
  // -----------------------
  const [lastPlayerChoice, setLastPlayerChoice] = useState<number | null>(null);
  const [canStartGame, setCanStartGame] = useState<boolean>(true);

  // -----------------------
  // 게임 흐름
  // -----------------------
  const handleGameStart = () => {
    startGame();
    setSlotState("spinning");
    setIsAnimating(true);
    setCanStartGame(false);
    // console.log("Game started with betAmount:", betAmount);
  };

  
  const handleSpin = async (userChoice: string) => {
    playSfx(Audios.button_click);
  
    if (isSpinning || slotState !== "spinning") return;
    spin();
  
    // 사용자 선택을 숫자로 변환하여 저장
    const choiceMap: { [key: string]: number } = {
      rock: 0,
      paper: 1,
      scissors: 2
    };
    setLastPlayerChoice(choiceMap[userChoice]);
  
    playSfx(Audios.rps_slot);
  
    setTimeout(async () => {
      try {
        // �� 핵심 수정: 재시도 게임인지 확인
        const usedGames = localStorage.getItem('rpsAdUsedGames') || '[]';
        const usedGameIds = JSON.parse(usedGames);
        
        // handleSpin 함수 내부의 재시도 게임 처리 부분 수정
        if (rpsId && usedGameIds.includes(rpsId)) {
          // 광고를 시청한 재시도 게임인 경우 RetryRPS.ts API 호출
          console.log('재시도 게임 - RetryRPS.ts API 호출');
          const retryResponse = await getRPSRetryAdReward({
            rpsId: rpsId,
            value: choiceMap[userChoice]
          });
          
          // �� 핵심 수정: 응답 데이터 상세 로깅
          console.log('=== 재시도 게임 API 응답 전체 ===');
          console.log('retryResponse:', retryResponse);
          console.log('retryResponse.success:', retryResponse.success);
          console.log('retryResponse.data:', retryResponse.data);
          console.log('retryResponse.message:', retryResponse.message);
          console.log('================================');
          
          if (retryResponse.success && retryResponse.data) {
            const { result, reward, pcValue } = retryResponse.data;
            
            // �� 핵심 수정: 게임 데이터 상세 로깅
            console.log('=== 재시도 게임 데이터 상세 ===');
            console.log('result (승패):', result);
            console.log('reward (보상):', reward);
            console.log('pcValue (컴퓨터 선택):', pcValue);
            console.log('userChoice (사용자 선택):', userChoice);
            console.log('choiceMap[userChoice]:', choiceMap[userChoice]);
            console.log('================================');
            
            const computerChoice = pcValue === 0 ? "scissors" : pcValue === 1 ? "rock" : "paper";
            
            // �� 핵심 수정: 컴퓨터 선택 변환 로깅
            console.log('=== 컴퓨터 선택 변환 ===');
            console.log('pcValue:', pcValue, '→ computerChoice:', computerChoice);
            console.log('========================');
            
            stopSpin(userChoice, computerChoice);
            setSlotState("stopped");
            setIsAnimating(false);
            
            // 게임 결과 처리 로직
            if (result === "WIN") {
              console.log('🎉 재시도 게임 승리! 보상:', reward);
              // 승리 결과 처리 - 결과 다이얼로그 표시
              handleRetryGameResult("win", reward);
            } else if (result === "DEFEAT") {
              console.log(' 재시도 게임 패배');
              // 패배 결과 처리 - 결과 다이얼로그 표시
              handleRetryGameResult("lose", 0);
            } else {
              console.log('❓ 알 수 없는 게임 결과:', result);
              // 무승부 또는 에러 처리 - 패배로 처리
              handleRetryGameResult("lose", 0);
            }
          } else {
            //  핵심 수정: 에러 응답 상세 로깅
            console.error('❌ 재시도 게임 API 응답 실패 상세:');
            console.error('retryResponse 전체:', retryResponse);
            console.error('success 필드:', retryResponse.success);
            console.error('data 필드:', retryResponse.data);
            console.error('message 필드:', retryResponse.message);
            // 에러 발생 시 패배로 처리하여 결과 다이얼로그 표시
            handleRetryGameResult("lose", 0);
          }
        } else {
          // 일반 게임인 경우 기존 playRound API 호출
          console.log('일반 게임 - playRound API 호출');
          const response = await playRound(userChoice);

          if (response) {
            // �� 핵심 수정: 일반 게임 응답 로깅
            console.log('=== 일반 게임 응답 ===');
            console.log('response:', response);
            console.log('response.rpsId:', response.rpsId);
            console.log('response.computerChoice:', response.computerChoice);
            console.log('=====================');
            
            if (response.rpsId) {
              setRpsId(response.rpsId);
            }
            
            stopSpin(userChoice, response.computerChoice);
            setSlotState("stopped");
            setIsAnimating(false);
          } else {
            console.error('일반 게임 API 응답 실패:', response);
            // API 응답 실패 시 패배로 처리
            handleRPSGameEnd("lose", 0);
          }
        }
      } catch (error) {
        // �� 핵심 수정: catch 블록에서도 페이지 리프레시 방지
        console.error("Error during RPS playRound:", error);
        // alert와 window.location.reload() 제거
        // 에러 발생 시 패배로 처리하여 결과 다이얼로그 표시
        handleRPSGameEnd("lose", 0);
      }
    }, 2000);
  };

  
  // -----------------------
  // 게임 종료 핸들러
  // -----------------------
  const handleQuit = () => {
    endGame();
    onGameEnd(gameResult!, lastReward);
    // console.log(`Game ended with ${gameResult}:`, lastReward);
  };

  
  // handleGameRetry 함수 수정
  const handleGameRetry = async () => {
    console.log('RPS 게임 진행 페이지로 이동');
    
    // �� 핵심 수정: 즉시 API 호출하지 않고 게임 상태만 리셋
    // 이미 광고를 사용한 게임인지 확인
    const usedGames = localStorage.getItem('rpsAdUsedGames') || '[]';
    const usedGameIds = JSON.parse(usedGames);
    
    if (!rpsId || !usedGameIds.includes(rpsId)) {
      console.error('RPS 재시도 권한이 없습니다. rpsId:', rpsId, 'usedGameIds:', usedGameIds);
      alert('게임 재시도 권한이 없습니다.');
      return;
    }
    
    try {
      // �� 핵심 수정: API 호출하지 않고 게임 상태만 리셋
      console.log('RPS 재시도 권한 확인됨 - 게임 진행 페이지로 이동');
      
      // 게임 상태 리셋 (베팅은 유지)
      resetForRetry();
      closeDialog();
      
      // 로컬 상태 리셋
      setLastPlayerChoice(null);
      setCanStartGame(true);
      
      // 슬롯 애니메이션 상태를 게임 시작 상태로 설정
      setSlotState("spinning");
      setIsAnimating(true);
      
      console.log('RPS 게임 진행 페이지 이동 완료 - 사용자가 가위바위보 선택할 때까지 대기');
    } catch (error) {
      console.error('RPS 게임 진행 페이지 이동 중 오류:', error);
      alert('게임 진행 페이지 이동 중 오류가 발생했습니다.');
    }
  };

  // -----------------------
  // 가로 스크롤 막기
  // -----------------------
  useEffect(() => {
    document.body.style.overflowX = "hidden";
    return () => {
      document.body.style.overflowX = "auto";
    };
  }, []);

  // -----------------------
  // 2) 로딩 중이면 스피너, 아니라면 실제 화면
  // -----------------------
  if (isLoading) {
    return <LoadingSpinner className="h-screen" />;
  }

  // -----------------------
  // 실제 RPS 게임 화면
  // -----------------------
  return (
    <div
      className="flex flex-col z-50 bg-white h-screen justify-items-center drop-shadow overflow-x-hidden"
      style={{
        backgroundImage: `url(${Images.BackgroundSlot})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {!isGameStarted ? (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
          className="flex h-full w-full"
        >
          <RPSGameStart
            onStart={handleGameStart}
            onCancel={() => {
              onCancel();
              handleRPSGameEnd("lose", 0);
            }}
          />
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full w-[600px] overflow-hidden mx-auto">
          {/* 배팅 금액, 배율 */}
          <div
            className="flex flex-row items-center justify-center h-[86px] w-[264px] rounded-[58px] gap-3 relative"
            style={{
              background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
              boxShadow:
                "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
            }}
          >
            <div className="flex flex-row items-center gap-1">
              <img
                src={Images.StarIcon}
                alt="Star"
                className="w-[46px] h-[46px]"
              />
              <p
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "24px",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                {formatNumber(betAmount)}
              </p>
            </div>
            <div
              className="flex items-center justify-center h-[35px] w-[66px] rounded-[53px]"
              style={{
                background: "rgba(0, 94, 170, 0.5)",
                backdropFilter: "blur(10px)",
                boxShadow: "inset 0px 0px 4px 3px rgba(255, 255, 255, 0.6)",
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "18px",
                fontWeight: 400,
                color: "#FDE047",
                WebkitTextStroke: "1px #000000",
                padding: "20px",
                gap: "25px",
              }}
            >
              x3
            </div>
          </div>

          {/* 게임 보드 */}
          <motion.div
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 1,
              ease: "easeOut",
            }}
            className="mt-8 relative"
          >
            <img
              src={Images.NewRPSGame}
              alt="RPS Game"
              className="w-[373px] mx-auto"
            />

            {/* 슬롯 표시 */}
            <div
              style={{
                left: "54px",
                position: "absolute",
                bottom: "192px",
              }}
              className="gap-0 flex flex-row items-center justify-center pl-0 w-[261px] overflow-y-hidden h-[80px]"
            >
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center justify-center h-full w-[80px]"
                  initial={{ y: 0 }}
                  animate={{
                    y: slotState === "spinning" ? ["-100%", "0%"] : "0%",
                  }}
                  transition={{
                    duration: slotState === "spinning" ? 0.1 : 0.5,
                    ease: "linear",
                    repeat: slotState === "spinning" ? Infinity : 0,
                    delay: index * 0.1, // 각 슬롯마다 약간의 지연 효과
                  }}
                >
                  {slotState === "spinning" ? (
                    <div className="slot-item text-5xl flex items-center justify-center">
                      <img
                        src={rpsImages.scissors}
                        alt="Spinning"
                        className="h-[70px] min-w-[50px] self-center"
                      />
                    </div>
                  ) : (
                    <div
                      className="slot-item text-5xl flex items-center justify-center"
                      style={{ height: "100%", width: "100%" }}
                    >
                      {useRPSGameStore.getState().slotResults[0] ? (
                        <img
                          src={
                            rpsImages[
                              useRPSGameStore.getState().slotResults[0]
                                .computerChoice as keyof typeof rpsImages
                            ]
                          }
                          alt="slot"
                          className="h-[70px] min-w-[50px] self-center"
                        />
                      ) : (
                        <img
                          src={Images.Scissors}
                          alt="slot"
                          className="h-[70px] min-w-[50px] self-center"
                        />
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* 가위바위보 선택 버튼 */}
            <div
              style={{
                position: "absolute",
                bottom: "86px",
                left: "72px",
              }}
              className="flex flex-row gap-2 items-center"
            >
              <img
                src={Images.IconRock}
                alt="Rock"
                className={`w-[68px] h-[68px] cursor-pointer ${
                  isSpinning || slotState !== "spinning"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={() => handleSpin("rock")}
              />
              <img
                src={Images.IconPaper}
                alt="Paper"
                className={`w-[68px] h-[68px] cursor-pointer ${
                  isSpinning || slotState !== "spinning"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={() => handleSpin("paper")}
              />
              <img
                src={Images.IconScissors}
                alt="Scissors"
                className={`w-[68px] h-[68px] cursor-pointer ${
                  isSpinning || slotState !== "spinning"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={() => handleSpin("scissors")}
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* 결과 다이얼로그 - 재시도 기능 추가 */}
      <RPSResultDialog
        isOpen={isDialogOpen}
        onClose={closeDialog}
        result={gameResult}
        winnings={lastReward}
        onQuit={handleQuit}
        rpsId={rpsId || undefined}
        lastPlayerChoice={lastPlayerChoice || undefined}
        onRetry={handleGameRetry}  // 재시도 핸들러 연결
      />
    </div>
  );
};

export default RPSGame;