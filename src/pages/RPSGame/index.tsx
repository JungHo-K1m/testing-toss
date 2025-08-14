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
    winMultiplier,
    isSpinning,
    isDialogOpen,
    gameResult,
    consecutiveWins,
    lastReward,
    isGameStarted,
    startGame,
    spin,
    stopSpin,
    continueGame,
    endGame,
    closeDialog,
    playRound,
    allowedBetting,
    currentRound,
    handleRPSGameEnd,
    totalRounds,
    fetchAllowedBetting,
  } = useRPSGameStore();

  const { starPoints } = useUserStore();
  const { playSfx } = useSound();

  // -----------------------
  // 슬롯 애니메이션 상태
  // -----------------------
  const [slotStates, setSlotStates] = useState<("spinning" | "stopped")[]>([
    "stopped",
    "stopped",
    "stopped",
  ]);
  const isAnySlotSpinning = slotStates.some((state) => state === "spinning");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // -----------------------
  // 게임 흐름
  // -----------------------
  const handleGameStart = () => {
    startGame();
    setSlotStates(["spinning", "spinning", "spinning"]);
    setIsAnimating(true);
    // console.log("Game started with betAmount:", betAmount);
  };

  const handleSpin = async (userChoice: string) => {
    playSfx(Audios.button_click);

    if (isSpinning || !isAnySlotSpinning) return;
    spin();

    playSfx(Audios.rps_slot);

    setTimeout(async () => {
      try {
        const response = await playRound(userChoice);

        // console.log("Server response =>", response);
        if (response) {
          stopSpin(userChoice, response.computerChoice);

          // 현재 라운드 슬롯만 정지
          setSlotStates((prev) => {
            const newStates = [...prev];
            newStates[currentRound - 1] = "stopped";
            return newStates;
          });

          // 모든 라운드 다 돌았다면 애니메이션 종료
          if (currentRound >= totalRounds) {
            setIsAnimating(false);
          }
        } else {
          throw new Error("Failed to play round.");
        }
      } catch (error) {
        // console.error("Error during RPS playRound:", error);
        alert(
          "An error occurred while playing Rock-Paper-Scissors. The page will reload."
        );
        window.location.reload();
      }
    }, 2000);
  };

  const handleContinue = () => {
    if (consecutiveWins >= totalRounds) {
      handleQuit();
    } else {
      continueGame();
      // console.log("Continuing game with betAmount:", betAmount);
    }
  };

  const handleQuit = () => {
    endGame();
    onGameEnd(gameResult!, lastReward);
    // console.log(`Game ended with ${gameResult}:`, lastReward);
  };

  // -----------------------
  // allowedBetting 불러오기
  // -----------------------
  useEffect(() => {
    fetchAllowedBetting();
    // console.log("Component mounted");
  }, [fetchAllowedBetting]);

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
            allowedBetting={allowedBetting}
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
              x{winMultiplier * 3 > 27 ? 27 : winMultiplier * 3}
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

            {/* 슬롯(라운드) 3개 표시 */}
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                style={{
                  left: `${54 + index * 82}px`,
                  position: "absolute",
                  bottom: "192px",
                }}
                className="gap-2 flex flex-row items-center justify-center pl-1 w-[87px] overflow-y-hidden h-[80px]"
              >
                <motion.div
                  className="flex flex-col items-center justify-center h-full"
                  initial={{ y: 0 }}
                  animate={{
                    y:
                      slotStates[index] === "spinning" ? ["-100%", "0%"] : "0%",
                  }}
                  transition={{
                    duration: slotStates[index] === "spinning" ? 0.1 : 0.5,
                    ease: "linear",
                    repeat: slotStates[index] === "spinning" ? Infinity : 0,
                  }}
                >
                  {slotStates[index] === "spinning" ? (
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
                      {useRPSGameStore.getState().slotResults[index] ? (
                        <img
                          src={
                            rpsImages[
                              useRPSGameStore.getState().slotResults[index]
                                .computerChoice as keyof typeof rpsImages
                            ]
                          }
                          alt={`slot-${index}`}
                          className="h-[70px] min-w-[50px] self-center"
                        />
                      ) : (
                        <img
                          src={Images.Scissors}
                          alt={`slot-${index}`}
                          className="h-[70px] min-w-[50px] self-center"
                        />
                      )}
                    </div>
                  )}
                </motion.div>
              </div>
            ))}

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
                  isSpinning || !isAnySlotSpinning
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={() => handleSpin("rock")}
              />
              <img
                src={Images.IconPaper}
                alt="Paper"
                className={`w-[68px] h-[68px] cursor-pointer ${
                  isSpinning || !isAnySlotSpinning
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={() => handleSpin("paper")}
              />
              <img
                src={Images.IconScissors}
                alt="Scissors"
                className={`w-[68px] h-[68px] cursor-pointer ${
                  isSpinning || !isAnySlotSpinning
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={() => handleSpin("scissors")}
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* 결과 다이얼로그 */}
      <RPSResultDialog
        isOpen={isDialogOpen}
        onClose={closeDialog}
        result={gameResult}
        winnings={lastReward}
        onContinue={handleContinue}
        onQuit={handleQuit}
        consecutiveWins={consecutiveWins}
        winMultiplier={winMultiplier}
      />
    </div>
  );
};

export default RPSGame;
