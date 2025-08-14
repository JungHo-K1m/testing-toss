// src/pages/DiceEvent/GameBoard.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    autoSwitch,
  } = useUserStore();
  const [timeUntilRefill, setTimeUntilRefill] = useState("");
  const [isRefilling, setIsRefilling] = useState(false); // 리필 중 상태 관리
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
    let autoInterval: NodeJS.Timeout;

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
    const tileData = boards.find(
      (tile: { sequence: number }) => tile.sequence === sequence
    );

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
      // AirplaneTile
      content = <AirplaneTile text={tileData?.moveType || ""} />;
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

  // 테스트용 아이템 추가/삭제 함수들은 백엔드에서 items 필드가 제거되어 사용할 수 없음
  // 백엔드 API 변경으로 인해 더 이상 필요하지 않음

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
          <div className="w-full flex justify-center mb-4">
            <Gauge gaugeValue={gaugeValue} />
          </div>

          {/* 음소거 버튼 */}
          {/* <button
              onClick={handleMute}
              className="absolute top-1 left-1 z-50 bg-gray-800 rounded-full flex items-center justify-center"
            >
              {masterMuted ? (
                <HiVolumeOff className="text-white w-5 h-5" />
              ) : (
                <HiVolumeUp className="text-white w-5 h-5" />
              )}
          </button> */}

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
            <AnimatePresence>
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
                        +{formatNumber(reward.value)}{" "}
                        {/* items.boardRewardTimes 제거됨 */}
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
                        +{formatNumber(reward.value)}{" "}
                        {/* items.ticketTimes 제거됨 */}
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col w-full h-full items-center justify-center dice-container translate-y-5">
              <Dice
                ref={diceRef}
                onRollComplete={(value: number, data: RollDiceResponseData) =>
                  handleRollComplete(value, data)
                }
                gaugeValue={gaugeValue}
              />
            </div>
            <p
              className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 z-20"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "18px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #2A294E",
              }}
            >
              x {formatNumber(diceCount)}
            </p>
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

            {/* 보유 아이템 다이얼로그 */}
            <Dialog>
              <DialogTrigger>
                <div
                  id="fourth-step"
                  className="absolute text-white -left-11 -bottom-14 md:-left-24 md:-bottom-28 font-semibold text-xs md:text-sm md:space-y-1"
                >
                  {/* NFT display - 백엔드에서 items 필드가 제거되어 더 이상 표시할 수 없음 */}
                  <div className="text-center text-gray-400 text-sm">
                    NFT 정보는 백엔드 API 변경으로 인해
                    <br />더 이상 표시할 수 없습니다.
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className=" bg-[#21212F] border-none rounded-3xl text-white h-svh md:h-auto overflow-y-auto max-w-[90%] md:max-w-lg max-h-[80%]">
                <DialogHeader className="">
                  <DialogTitle>인벤토리</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col mt-4 gap-4">
                  <div className="flex flex-col bg-[#1F1E27] p-5 rounded-3xl border-2 border-[#35383F] font-medium gap-2">
                    <div className="flex flex-row items-center gap-2">
                      <IoGameController className="w-6 h-6" />
                      <p>
                        포인트 : x1{" "}
                        {/* items.boardRewardTimes 제거됨 - 기본값 1로 설정 */}
                      </p>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <IoTicket className="w-6 h-6" />
                      <p>
                        티켓 : x1{" "}
                        {/* items.ticketTimes 제거됨 - 기본값 1로 설정 */}
                      </p>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <PiSpinnerBallFill className="w-6 h-6" />
                      <p>
                        스핀 : x1{" "}
                        {/* items.spinTimes 제거됨 - 기본값 1로 설정 */}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row items-center justify-end gap-1">
                    <AiOutlineInfoCircle className=" w-5 h-5" />
                    <p className="text-end text-sm font-medium">추가 효과</p>
                  </div>
                  <NFTRewardList />
                </div>
              </DialogContent>
            </Dialog>

            {/**릴리스용 */}
            {/* <div onClick={()=>{setIsOpen(true)}} className="absolute cursor-pointer text-white -right-11 -top-8 md:-right-24 md:-top-20 font-semibold text-xs md:text-sm md:space-y-1">
              <FaBookTanakh  className=" w-5 h-5 md:w-8 md:h-8  " />
            </div> */}

            {/* *테스트용 마스터 컨텐츠 */}
            {/* <Dialog>
              <DialogTrigger>
                <div className="absolute text-white -right-11 -top-8 md:-right-24 md:-top-20 font-semibold text-xs md:text-sm md:space-y-1">
                  <FaBookTanakh  className=" w-5 h-5  " />
                </div>
              </DialogTrigger>
              <DialogContent className=" bg-[#21212F] border-none rounded-3xl text-white h-svh md:h-auto overflow-y-auto max-w-[90%] md:max-w-lg max-h-[80%]">
                <div className="flex flex-col gap-4 p-4">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleAddDice}
                      className="bg-green-400 hover:bg-green-600 text-white py-2 px-4 rounded"
                    >
                      Dice + 100
                    </button>
                    <button
                      onClick={handleAddSLToken}
                      className="bg-green-400 hover:bg-green-600 text-white py-2 px-4 rounded"
                    >
                      SL Token + 100
                    </button>
                    <button
                      onClick={handleAddGold}
                      className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                    >
                      Gold NFT + 1
                    </button>
                    <button
                      onClick={handleAddSilver}
                      className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                    >
                      Silver NFT + 1
                    </button>
                    <button
                      onClick={handleAddBronze}
                      className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                    >
                      Bronze NFT + 1
                    </button>
                    <button
                      onClick={handleAddAuto}
                      className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                    >
                      Auto NFT + 1
                    </button>
                    <button
                      onClick={handleAddReward}
                      className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                    >
                      Reward NFT + 1
                    </button>
                    <button
                      onClick={handleAddAll}
                      className="bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded"
                    >
                      All NFTs + 1
                    </button>
                  </div>

                  <div className="flex flex-col gap-2 mt-4">
                    <button
                      onClick={handleRemoveDice}
                      className="bg-red-400 hover:bg-red-600 text-white py-2 px-4 rounded"
                    >
                      Dice - 100
                    </button>
                    <button
                      onClick={handleRemoveSLToken}
                      className="bg-red-400 hover:bg-red-600 text-white py-2 px-4 rounded"
                    >
                      SL Token - 100
                    </button>
                    <button
                      onClick={handleRemoveGold}
                      className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                    >
                      Gold NFT - 1
                    </button>
                    <button
                      onClick={handleRemoveSilver}
                      className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                    >
                      Silver NFT - 1
                    </button>
                    <button
                      onClick={handleRemoveBronze}
                      className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                    >
                      Bronze NFT - 1
                    </button>
                    <button
                      onClick={handleRemoveAuto}
                      className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                    >
                      Auto NFT - 1
                    </button>
                    <button
                      onClick={handleRemoveReward}
                      className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                    >
                      Reward NFT - 1
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog> */}
          </div>
          <div
            id="third-step"
            className="flex flex-row text-white items-center justify-between mt-12 translate-y-2"
          >
            {/* Auto 스위치 부분 - 왼쪽 */}
            <div
              id="fifth-step"
              className="flex flex-row items-center gap-0.5 text-white -translate-x-1"
            >
              <p
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
                className="w-[26px] h-4 md:h-6 md:w-11 text-[#0147E5]"
                checked={isAuto} // isAuto 상태에 따라 스위치의 체크 상태를 설정
                onCheckedChange={handleAutoSwitch} // 스위치 토글 시 isAuto 상태를 반전
                disabled={false} // items.autoNftCount 제거됨 - 항상 활성화
              />
            </div>

            {/* 리필 영역 - 중앙 */}
            <div className="flex flex-row items-center justify-center w-[72px]">
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
                    : 리필
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
              className={`w-[68px] h-[68px] flex flex-col items-center justify-center translate-x-1 -translate-y-8 ${
                buttonDisabled || diceCount < 1 || isAuto
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              style={{
                backgroundImage: `url(${Images.RollDice})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
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
