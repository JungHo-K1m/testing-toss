// src/pages/DiceEvent/GameBoard.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, backIn } from "framer-motion";
import Tile from "./tile";
import { StarTile, DiceTile, AirplaneTile, Gauge } from "@/features/DiceEvent";
import Dice from "@/widgets/Dice";
import Images from "@/shared/assets/images";
import { Switch } from "@/shared/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui";
import { IoDice, IoGameController, IoTicket } from "react-icons/io5";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { useUserStore } from "@/entities/User/model/userModel";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc"; // UTC 플러그인 추가
import { RollDiceResponseData } from "@/features/DiceEvent/api/rollDiceApi";
import NFTRewardList from "@/widgets/NFTRewardCard";
import { PiSpinnerBallFill } from "react-icons/pi";
import { formatNumber } from "@/shared/utils/formatNumber";
import { FaBookTanakh } from "react-icons/fa6";
import { useTour } from "@reactour/tour";
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";
import { HiVolumeOff, HiVolumeUp } from "react-icons/hi";
import { useSoundStore } from "@/shared/store/useSoundStore";
import saveSoundSetting from "@/entities/User/api/saveSoundSetting";

dayjs.extend(duration);
dayjs.extend(utc); // UTC 플러그인 적용
dayjs.extend(timezone); // 타임존 플러그인 적용

interface GameBoardProps {
  position: number;
  selectingTile: boolean;
  handleTileClick: (tileId: number) => void;
  gaugeValue: number;
  diceCount: number;
  showDiceValue: boolean;
  rolledValue: number;
  buttonDisabled: boolean;
  diceRef: React.RefObject<any>;
  handleRollComplete: (value: number, data: RollDiceResponseData) => void;
  reward: { type: string; value: number; top: string; left: string } | null;
  isHolding: boolean;
  handleMouseDown: () => void;
  handleMouseUp: () => void;
  isLuckyVisible: boolean;
  rollDice: () => void;
  isCardGameActive: boolean; // 카드게임 활성화 상태 추가
  handleCardGameEnd: () => void; // 카드게임 종료 함수 추가
}

const GameBoard: React.FC<GameBoardProps> = ({
  position,
  selectingTile,
  handleTileClick,
  gaugeValue,
  diceCount,
  showDiceValue,
  rolledValue,
  buttonDisabled,
  diceRef,
  handleRollComplete,
  reward,
  isHolding,
  handleMouseDown,
  handleMouseUp,
  isLuckyVisible,
  rollDice,
  isCardGameActive,
  handleCardGameEnd,
}) => {
  // Zustand 스토어에서 필요한 상태와 함수 가져오기
  const {
    diceRefilledAt,
    boards,
    fetchUserData,
    completeTutorial,
    error,
    isAuto,
    setIsAuto,
    refillDice, // refillDice 함수 추가
    addGoldItem,
    removeGoldItem,
    addSilverItem,
    removeSilverItem,
    addBronzeItem,
    removeBronzeItem,
    addRewardItem,
    removeRewardItem,
    addAutoItem,
    removeAutoItem,
    addAllItems,
    addDice,
    addSLToken,
    removeDice,
    removeSLToken,
    autoSwitch,
  } = useUserStore();
  const [timeUntilRefill, setTimeUntilRefill] = useState("");
  const [isRefilling, setIsRefilling] = useState(false); // 리필 중 상태 관리
  const [isCardGameOpen, setIsCardGameOpen] = useState(false); // 카드게임 모달 상태
  const { setIsOpen } = useTour();
  const { playSfx } = useSound();
  const {
    masterMuted,
    bgmVolume,
    sfxVolume,
    masterVolume,
    bgmMuted,
    sfxMuted,
    toggleMasterMute,
  } = useSoundStore();

  // timeUntilRefill 최신값을 보관할 ref 생성
  const timeUntilRefillRef = useRef(timeUntilRefill);

  // timeUntilRefill이 변경될 때마다 ref.current에 최신 값 반영
  useEffect(() => {
    timeUntilRefillRef.current = timeUntilRefill;
  }, [timeUntilRefill]);

  useEffect(() => {
    // completeTutorial가 false일 때만 setIsOpen(true) 실행
    if (!completeTutorial) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [completeTutorial, setIsOpen]);

  // 음소거 버튼 클릭
  const handleMute = async () => {
    // 현재 상태를 가져옴 (현재 음소거 여부는 아직 토글 전의 값)
    const {
      masterVolume,
      masterMuted,
      bgmVolume,
      bgmMuted,
      sfxVolume,
      sfxMuted,
      toggleMasterMute,
    } = useSoundStore.getState();

    // 음소거 상태 토글 (UI 이미지 변경)
    toggleMasterMute();

    // 토글 후의 새로운 음소거 상태 (현재 값의 반대)
    const newMasterMute = !masterMuted;

    // 서버에 전송할 데이터: 볼륨 값은 상대값(0~0.3)을 0~10 범위로 변환
    const soundData = {
      masterVolume: Math.round((masterVolume / 0.3) * 10),
      masterMute: newMasterMute,
      backVolume: Math.round((bgmVolume / 0.3) * 10),
      backMute: bgmMuted,
      effectVolume: Math.round((sfxVolume / 0.3) * 10),
      effectMute: sfxMuted,
    };

    try {
      await saveSoundSetting(soundData);
      // 서버 저장 성공 시 추가 처리(예: 토스트 메시지 등) 가능
    } catch (error) {
      console.error("음소거 상태 저장 실패:", error);
      // 실패 시 오류 처리 (예: alert 등)
    }
  };

  // Refill Dice API 호출 함수
  const handleRefillDice = async () => {
    // 소리 추가
    playSfx(Audios.button_click);

    try {
      setIsRefilling(true);
      await refillDice();
      // refillDice 호출 후 fetchUserData를 통해 diceRefilledAt이 갱신된다고 가정
      // 여기서 별도로 diceRefilledAt을 조정할 필요 없음
      setIsRefilling(false);
      playSfx(Audios.reward);
    } catch (error: any) {
      // console.error("주사위 리필 실패:", error);
      setIsRefilling(false);
    }
  };

  const handleAutoSwitch = async () => {
    // 소리 추가
    playSfx(Audios.button_click);

    try {
      await autoSwitch();
    } catch (error: any) {
      // console.error("오토 스위치 변경 실패:", error);
    }
  };

  useEffect(() => {
    const updateRefillTime = () => {
      if (diceRefilledAt) {
        const refillTime = dayjs.tz(diceRefilledAt, "Asia/Seoul");
        const now = dayjs().tz("Asia/Seoul");
        const diff = refillTime.diff(now);

        if (diff <= 0 && diceCount === 0) {
          setTimeUntilRefill("Refill dice");
        } else if (diff > 0) {
          const remainingDuration = dayjs.duration(diff);
          const minutes = remainingDuration.minutes();
          const seconds = remainingDuration.seconds();
          setTimeUntilRefill(`${minutes}m ${seconds}s`);
        } else {
          setTimeUntilRefill("Waiting");
        }
      } else {
        setTimeUntilRefill("Waiting");
      }
    };

    updateRefillTime();
    const interval = setInterval(updateRefillTime, 1000);
    return () => clearInterval(interval);
  }, [diceRefilledAt, diceCount]);
  // fetchUserData, items.autoNftCount 의존성 제거(필요하면 남기되 최소화)

  useEffect(() => {
    let autoInterval: ReturnType<typeof setInterval>;

    if (isAuto) {
      autoInterval = setInterval(() => {
        // 이곳에서 최신 timeUntilRefill 값 참조
        const currentTimeUntilRefill = timeUntilRefillRef.current;

        if (diceCount > 0 && !buttonDisabled) {
          // diceRef.current?.roll();
          rollDice();
        } else if (diceCount === 0) {
          if (currentTimeUntilRefill === "Refill dice" && !isRefilling) {
            handleRefillDice().catch((err) =>
              console.error("오토 리필 실패:", err)
            );
          } else {
          }
        }
      }, 1000);
    }

    return () => {
      if (autoInterval) {
        clearInterval(autoInterval);
      }
    };
  }, [isAuto, diceCount, buttonDisabled, rollDice, isRefilling]);
  // timeUntilRefill 제거

  // Mapping from front-end tile IDs to server tile sequences
  const tileIdToSequenceMap: { [key: number]: number } = {
    // Front-end tile ID: Server tile sequence
    10: 10,
    9: 9,
    8: 8,
    7: 7,
    6: 6,
    5: 5,
    11: 11,
    4: 4,
    12: 12,
    3: 3,
    13: 13,
    2: 2,
    14: 14,
    1: 1,
    15: 15,
    16: 16,
    17: 17,
    18: 18,
    19: 19,
    0: 0,
  };

  const renderTile = (id: number) => {
    const sequence = tileIdToSequenceMap[id];
    const tileData = boards.find((tile) => tile.sequence === sequence);

    let content: React.ReactNode = null;
    let dataStar = "0";
    let dataDice = "0";

    // 새로운 타일 구성에 따른 내용 설정
    if (id === 0) {
      // 홈 타일
      content = (
        <div className="flex flex-col items-center">
          <img src={Images.HomeIcon} alt="Home" className="h-[44px] w-[44px]" />
        </div>
      );
    } else if ([1, 2, 4, 6, 9, 11, 13, 14, 16, 19].includes(id)) {
      // StarTile
      content = <StarTile count={tileData?.rewardAmount || 0} />;
      dataStar = (tileData?.rewardAmount || 0).toString();
    } else if ([3, 7, 12, 17].includes(id)) {
      // DiceTile
      content = <DiceTile count={tileData?.rewardAmount || 0} />;
      dataDice = (tileData?.rewardAmount || 0).toString();
    } else if ([8, 18].includes(id)) {
      // AirplaneTile - anywhere 기능
      if (id === 8) {
        // 8번 타일은 anywhere 타일 - 플레이어가 원하는 위치로 이동 가능
        content = <AirplaneTile text="ANYWHERE" />;
      } else {
        // 18번 타일은 기존대로
        content = <AirplaneTile text={tileData?.moveType || ""} />;
      }
    } else if ([5, 10, 15].includes(id)) {
      // 게임 타일들
      let gameIcon;
      switch (id) {
        case 5:
          gameIcon = Images.RpsIcon;
          break;
        case 10:
          gameIcon = Images.CardIcon;
          break;
        case 15:
          gameIcon = Images.SpinIcon;
          break;
        default:
          gameIcon = Images.SpinImage;
      }
      content = <img src={gameIcon} alt="Game" className="h-[44px] w-[44px]" />;
    } else if (tileData) {
      // 기존 서버 데이터 기반 타일들
      switch (tileData.tileType) {
        case "JAIL":
          content = (
            <img
              src={Images.DesertIsland}
              alt="Jail"
              className="h-[44px] w-[44px]"
            />
          );
          break;
        default:
          content = null;
      }
    }

    return (
      <Tile
        key={id}
        id={id}
        onClick={() => handleTileClick(id)}
        position={position}
        selectingTile={selectingTile}
        data-star={dataStar}
        data-dice={dataDice}
      >
        {content}
      </Tile>
    );
  };

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {/* 중앙 배경을 absolute로 배치 */}
      <div
        className="rotate-background"
        style={{
          width: 280,
          height: 280,
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
      {/* 그리드(타일들) */}
      <div
        className="grid grid-cols-6 grid-rows-6 gap-0 text-xs relative z-30"
        style={{
          width: "360px",
          height: "360px",
          maxWidth: "100%",
          maxHeight: "100%",
        }}
      >
        {/* 에러 메시지 표시 */}
        {error && (
          <div className="absolute top-0 left-0 w-full bg-red-500 text-white p-2 text-center z-50">
            {error}
          </div>
        )}

        {/* Tile rendering */}
        {renderTile(10)}
        {renderTile(9)}
        {renderTile(8)}
        {renderTile(7)}
        {renderTile(6)}
        {renderTile(5)}
        {renderTile(11)}

        {/* Central board */}
        <div
          className="col-span-4 row-span-4 flex flex-col items-center justify-evenly bg-center"
          style={{ zIndex: 2, position: "relative" }}
        >
          <div className="w-full flex justify-center mb-4" style={{ zIndex: 20 }}>
            <Gauge gaugeValue={gaugeValue} />
          </div>

          {/* 음소거 버튼 */}
          <button
              onClick={handleMute}
              className="absolute top-11 left-9 z-50 bg-gray-800 rounded-full flex items-center justify-center focus:outline-none focus:ring-0"
              style={{
                backgroundColor: "transparent",
                outline: "none",
                border: "none",
              }}
            >
              {masterMuted ? (
                <img src={Images.VolumeOff} alt="Volume Off" className="w-5 h-5" />
              ) : (
                <img src={Images.VolumeOn} alt="Volume On" className="w-5 h-5" />
              )}
          </button>

          <div className="relative w-[120px] h-[120px] md:w-44 md:h-44">
            <AnimatePresence>
              {showDiceValue && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 1 }}
                  className="absolute flex items-center justify-center w-24 h-24 bg-white rounded-full text-black text-4xl font-bold -top-4 left-3 md:left-10"
                  style={{
                    transform: "translate(-50%, -50%)",
                    zIndex: 50,
                  }}
                >
                  {rolledValue}
                </motion.div>
              )}
            </AnimatePresence>
            {/* <AnimatePresence>
              {reward && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 1 }}
                  className="absolute flex items-center justify-center w-16 h-16 bg-white rounded-full text-black text-sm font-bold border-4 border-yellow-200"
                  style={{
                    top: reward.top,
                    left: reward.left,
                    zIndex: 50,
                  }}
                >
                  {reward.type === "STAR" && (
                    <div className="flex flex-col items-center">
                      <img src={Images.Star} alt="star" className="h-6" />
                      <span className="mt-1 ">
                        +{formatNumber(reward.value * items.boardRewardTimes)}
                      </span>
                    </div>
                  )}
                  {reward.type === "DICE" && (
                    <div className="flex flex-col items-center">
                      <img src={Images.Dice} alt="dice" className="h-6" />
                      <span className="mt-1">
                        +{formatNumber(reward.value)}
                      </span>
                    </div>
                  )}
                  {reward.type === "lottery" && (
                    <div className="flex flex-col items-center">
                      <img
                        src={Images.LotteryTicket}
                        alt="lottery"
                        className="h-6"
                      />
                      <span className="mt-1">
                        +{formatNumber(reward.value * items.ticketTimes)}
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence> */}

            {/* anywhere 비행기 활성화 시에는 주사위를 숨김 */}
            {!selectingTile && (
              <div 
                className="flex flex-col w-full h-full items-center justify-center dice-container"
                style={{
                  transform: 'translateY(20px)'
                }}
              >
                <Dice
                  ref={diceRef}
                  onRollComplete={(value: number, data: RollDiceResponseData) =>
                    handleRollComplete(value, data)
                  }
                  gaugeValue={gaugeValue}
                />
              </div>
            )}
            {/* anywhere 비행기 활성화 시에는 주사위 개수 텍스트도 숨김 */}
            {!selectingTile && (
              <div className="absolute bottom-[-30px] left-1/2 transform  z-20">
                <p
                  className="text-center whitespace-nowrap"
                  style={{
                    fontFamily: "'ONE Mobile POP', sans-serif",
                    fontSize: "18px",
                    fontWeight: 400,
                    color: "#FFFFFF",
                    WebkitTextStroke: "1px #2A294E",
                    transform: 'translateX(-18px)'
                  }}
                >
                  x {formatNumber(diceCount)}
                </p>
              </div>
            )}
            {/* "LUCKY" image animation */}
            <AnimatePresence>
              {isLuckyVisible && (
                <motion.img
                  src={Images.Lucky}
                  alt="Lucky Dice"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="absolute bottom-0 -left-8 md:-left-14 md:-bottom-4  min-w-[180px] md:min-w-[280px] z-50"
                />
              )}
            </AnimatePresence>

          </div>
          <div
            id="third-step"
            className="flex flex-row text-white items-center justify-between mt-12 translate-y-2"
          >
            {/* Auto 스위치 부분 - 왼쪽 */}
            <div
              id="fifth-step"
              className="flex flex-row items-center gap-0.5 text-white"
              style={{
                transform: 'translate(-6px, 12px)'
              }}
            >
              <p
                className="opacity-0"
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "12px",
                  fontWeight: 400,
                  color: "#2A294E",
                }}
              >
                Auto
              </p>
              <Switch
                className="w-[26px] h-4 md:h-6 md:w-11 text-[#0147E5] opacity-0"
                checked={isAuto} // isAuto 상태에 따라 스위치의 체크 상태를 설정
                onCheckedChange={handleAutoSwitch} // 스위치 토글 시 isAuto 상태를 반전
                disabled={false} // items.autoNftCount가 1 미만일 때 스위치 비활성화
              />
            </div>

            {/* 리필 영역 - 중앙 */}
            <div 
              className="flex flex-row items-center justify-center w-[72px]"
              style={{
                transform: 'translateY(8px)'
              }}
            >
              {timeUntilRefill === "Refill dice" ? (
                <motion.div
                  onClick={handleRefillDice}
                  className="flex flex-row items-center justify-center gap-1 cursor-pointer w-full"
                  animate={{
                    opacity: [1, 0.5, 1], // 반짝이는 효과
                  }}
                  transition={{
                    duration: 1, // 1초 동안 애니메이션 반복
                    repeat: Infinity, // 무한 반복
                  }}
                >
                  <img
                    src={Images.RefillDice}
                    alt="Refill Dice"
                    className="w-4 h-4"
                  />
                  <p
                    className="whitespace-nowrap"
                    style={{
                      fontFamily: "'ONE Mobile POP', sans-serif",
                      fontSize: "12px",
                      fontWeight: 400,
                      color: "#2A294E",
                    }}
                  >
                    : "리필"
                  </p>
                </motion.div>
              ) : (
                <div className="flex flex-row items-center justify-center gap-1 w-full">
                  <img
                    src={Images.RefillDice}
                    alt="Refill Dice"
                    className="w-4 h-4"
                  />
                  <p
                    className="whitespace-nowrap"
                    style={{
                      fontFamily: "'ONE Mobile POP', sans-serif",
                      fontSize: "12px",
                      fontWeight: 400,
                      color: "#2A294E",
                    }}
                  >
                    : {timeUntilRefill}
                  </p>
                </div>
              )}
            </div>

            {/* Roll Dice 버튼 - 오른쪽 */}
            <button
              id="first-step"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
              className={`w-[68px] h-[68px] flex flex-col items-center justify-center focus:outline-none focus:ring-0 ${
                buttonDisabled || diceCount < 1 || isAuto
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              style={{
                backgroundImage: `url(${Images.RollDice})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundColor: "transparent",
                transform: 'translate(10px, -18px)',
                outline: "none",
                border: "none",
              }}
              disabled={buttonDisabled || diceCount < 1 || isAuto}
            >
              <span
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "18px",
                  fontWeight: 400,
                  color: "#FDE047",
                  WebkitTextStroke: "1px #2A294E",
                  textAlign: "center",
                  lineHeight: "1.2",
                }}
              >
                Roll
                <br />
                Dice
              </span>
            </button>
          </div>
        </div>

        {/* Additional tile rendering */}
        {renderTile(4)}
        {renderTile(12)}
        {renderTile(3)}
        {renderTile(13)}
        {renderTile(2)}
        {renderTile(14)}
        {renderTile(1)}
        {renderTile(15)}
        {renderTile(16)}
        {renderTile(17)}
        {renderTile(18)}
        {renderTile(19)}
        {renderTile(0)}
      </div>
      

    </div>
  );
};

export default GameBoard;
