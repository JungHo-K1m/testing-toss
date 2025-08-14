// src/pages/DiceEventPage.tsx
import React, { useEffect, useState, useRef } from "react";
import UserLevel from "@/entities/User/components/UserLevel";
import "@/features/DiceEvent/DiceEvent.css";
import Images from "@/shared/assets/images";
import { MonthlyPrize } from "@/entities/MonthlyPrize";
import Attendance from "@/widgets/Attendance";
import MyRankingWidget from "@/widgets/MyRanking/MyRankingWidget";
import MissionWidget from "@/widgets/MissionWidget/MissionWidget";
import { useNavigate } from "react-router-dom";
import useDiceGame from "./useDiceGame";
import GameBoard from "./GameBoard";
import { Board } from "@/features/DiceEvent";
import RPSGame from "../RPSGame";
import SpinGame from "../SpinGame";
import { useUserStore } from "@/entities/User/model/userModel";
import LoadingSpinner from "@/shared/components/ui/loadingSpinner";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/shared/components/ui";
import { formatNumber } from "@/shared/utils/formatNumber";
import LevelRewards from "@/widgets/LevelRewards";
import LeaderBoard from "@/widgets/LeaderBoard";
import { HiX } from "react-icons/hi";
import { DialogClose } from "@radix-ui/react-dialog";
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";
import getRewardPoints from "@/entities/Mission/api/fromRewardPoint";
import updateTimeZone from "@/entities/User/api/updateTimeZone";
import useWalletStore from "@/shared/store/useWalletStore";
import getKaiaRedirection from "@/entities/User/api/getKaiaRedirect";
import { InlineRanking } from "@/widgets/MyRanking/InlineRanking";
import { ModalRanking } from "@/widgets/MyRanking/ModalRanking";
import BottomNav from "@/widgets/BottomNav/BottomNav";
import NewMyRanking from "@/widgets/NewMyRanking";

const levelRewards = [
  // 2~9 레벨 보상 예시
  { level: 2, dice: 10, points: 1000 },
  { level: 3, dice: 15, points: 2000 },
  { level: 4, dice: 20, points: 3000 },
  { level: 5, dice: 30, points: 5000, tickets: 3 },
  { level: 6, dice: 40, points: 7000, tickets: 3 },
  { level: 7, dice: 50, points: 10000, tickets: 3 },
  { level: 8, dice: 60, points: 15000, tickets: 4 },
  { level: 9, dice: 70, points: 20000, tickets: 5 },

  // 10~14 레벨 보상 예시
  { level: 10, dice: 100, points: 30000, tickets: 7 },
  { level: 11, dice: 100, points: 30000, tickets: 7 },
  { level: 12, dice: 100, points: 30000, tickets: 7 },
  { level: 13, dice: 100, points: 30000, tickets: 7 },
  { level: 14, dice: 100, points: 30000, tickets: 7 },

  // 15~19 레벨 보상 예시
  { level: 15, dice: 200, points: 50000, tickets: 15 },
  { level: 16, dice: 200, points: 50000, tickets: 15 },
  { level: 17, dice: 200, points: 50000, tickets: 15 },
  { level: 18, dice: 200, points: 50000, tickets: 15 },
  { level: 19, dice: 200, points: 50000, tickets: 15 },

  // 20 레벨 보상 예시
  { level: 20, dice: 500, points: 100000, tickets: 100 },
];

const DiceEventPage: React.FC = () => {
  const {
    fetchUserData,
    isLoading,
    error,
    userLv,
    characterType,
    position,
    monthlyPrize,
    isAuto,
    pet,
    suspend,
    setSuspend,
    redirect,
    items,
  } = useUserStore();

  const game = useDiceGame();
  const { playSfx } = useSound();
  const [initialX, setInitialX] = useState<number>(140);
  const [initialY, setInitialY] = useState<number>(474);
  const [delta, setDelta] = useState<number>(56);
  const navigate = useNavigate();

  // AirDrop 팝업 표시를 위한 상태
  const [showAirDrop, setShowAirDrop] = useState<boolean>(false);

  // URL 보상 팝업 표시를 위한 상태
  const [showUrlReward, setShowUrlReward] = useState<boolean>(false);

  // 레벨 업 시 팝업 표시를 위한 상태
  const [showLevelUpDialog, setShowLevelUpDialog] = useState<boolean>(false);
  const [prevLevel, setPrevLevel] = useState<number>(userLv);

  // 레벨별 보상 다이얼로그 표시를 위한 상태
  const [showLevelRewardsDialog, setShowLevelRewardsDialog] =
    useState<boolean>(false);

  // 장착된 아이템 상태 (예시로 몇 개 아이템을 장착한 상태로 설정)
  const [equippedItems, setEquippedItems] = useState<
    Array<"balloon" | "crown" | "muffler" | "ribbon" | "sunglasses" | "wing">
  >([
    "crown",
    "sunglasses", // 예시: 왕관과 선글라스 장착
  ]);

  // 레벨 업 감지: userLv가 이전 레벨보다 커질 때만 팝업 표시
  useEffect(() => {
    if (userLv > prevLevel) {
      playSfx(Audios.level_up);
      setShowLevelUpDialog(true);
    }
    setPrevLevel(userLv);
  }, [userLv, prevLevel]);

  // 보상 링크를 통한 접근 여부 확인 및 보상 API 호출
  useEffect(() => {
    const referralCode = localStorage.getItem("referralCode");
    if (referralCode === "from-dapp-portal") {
      // console.log("[DiceEventPage] Dapp Portal referral detected. Calling reward API...");
      getRewardPoints()
        .then((message) => {
          // console.log("[DiceEventPage] Reward API response:", message);
          // 응답 메시지가 "Success"인 경우에만 다이얼로그 표시
          if (message === "Success") {
            setShowUrlReward(true);
          } else if (message === "Already Rewarded") {
            // console.log("[DiceEventPage] Reward already claimed.");
          }
          // 중복 호출 방지를 위해 referralCode 삭제
          localStorage.removeItem("referralCode");
        })
        .catch((error) => {
          // console.error("[DiceEventPage] Reward API error:", error);
        });
    }
  }, []);

  // 소유한 아이템 갯수에 따른 목록 표시 함수
  const getItemLabel = (label: string, count: number) => {
    if (count === 0) {
      return <span className="text-[#737373]">{label}</span>;
    } else if (count === 1) {
      return <span className="text-white">{label}</span>;
    } else {
      return (
        <span className="text-white">
          {label} x{count}
        </span>
      );
    }
  };

  // 아이템 목록에 적용
  const itemList = [
    {
      label: "GOLD PASS",
      icon: Images.GoldIcon,
      count: items.goldCount,
      gradient: "linear-gradient(180deg, #FDE047 0%, #FFFFFF 100%)",
    },
    {
      label: "SILVER PASS",
      icon: Images.SilverIcon,
      count: items.silverCount,
      gradient: "linear-gradient(180deg, #22C55E 0%, #FFFFFF 100%)",
    },
    {
      label: "BRONZE PASS",
      icon: Images.BronzeIcon,
      count: items.bronzeCount,
      gradient: "linear-gradient(180deg, #F59E0B 0%, #FFFFFF 100%)",
    },
    {
      label: "AUTO ITEM",
      icon: Images.AutoIcon,
      count: items.autoNftCount,
      gradient: "linear-gradient(180deg, #0147E5 0%, #FFFFFF 100%)",
    },
    {
      label: "REWARD BOOSTER",
      icon: Images.RewardIcon,
      count: items.rewardNftCount,
      gradient: "linear-gradient(180deg, #FF4F4F 0%, #FFFFFF 100%)",
    },
  ];

  // 현재 레벨 보상 찾기
  const currentReward = levelRewards.find((r) => r.level === userLv);

  const getCharacterImageSrc = () => {
    const index = Math.floor((userLv - 1) / 4);

    const catImages = [
      Images.Cat1,
      Images.Cat2,
      Images.Cat3,
      Images.Cat4,
      Images.Cat5,
    ];

    const dogImages = [
      Images.Dog1,
      Images.Dog2,
      Images.Dog3,
      Images.Dog4,
      Images.Dog5,
    ];

    if (characterType === "cat") {
      return catImages[index] || catImages[catImages.length - 1];
    } else {
      return dogImages[index] || dogImages[dogImages.length - 1];
    }
  };

  const getLevelEffectImageSrc = () => {
    const level = Math.min(userLv, 20);
    const effectImageKey = `LevelEffect${level}` as keyof typeof Images;
    return Images[effectImageKey] || Images.LevelEffect1;
  };

  const charactorImageSrc = getCharacterImageSrc();

  useEffect(() => {
    return () => {
      game.setIsAuto(false);
    };
  }, []);

  useEffect(() => {
    // SDK가 초기화되고 지갑이 연결된 후에 사용자 데이터를 가져옵니다.
    const initializeUserData = async () => {
      await fetchUserData();
    };

    initializeUserData();
  }, [fetchUserData]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setInitialX(250);
        setInitialY(730);
        setDelta(100);
      } else {
        setInitialX(140);
        setInitialY(474);
        setDelta(56);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ===============================
  //  모달 스케줄링 로직
  // ===============================
  const scheduledSlots = [16];
  const itemGuideSlots = [0, 9, 18];

  const [abuseModal, setabuseModal] = useState<boolean>(false);
  // 랭킹 보상 팝업 표시를 위한 상태
  const [showRankingModal, setShowRankingModal] = useState<boolean>(false);
  const [showItemGuideModal, setShowItemGuideModal] = useState(false);

  useEffect(() => {
    const checkAndShowModals = () => {
      const now = new Date();
      const hour = now.getHours();
      const dateKey = `${now.getFullYear()}-${
        now.getMonth() + 1
      }-${now.getDate()}`;

      // ——————————————
      // 1) abuseModal + 래플권 모달
      // ——————————————
      let currentAbuseSlot: number | null = null;
      for (let slot of scheduledSlots) {
        if (hour >= slot) currentAbuseSlot = slot;
      }
      if (currentAbuseSlot !== null) {
        const slotId = `${dateKey}-${currentAbuseSlot}`;
        const lastShown = localStorage.getItem("abuseModalLastShown");
        const dismissed = localStorage.getItem("abuseModalDismissed");
        if (lastShown !== slotId && dismissed !== slotId) {
          setabuseModal(true);
          setShowRankingModal(true);
        }
      }

      // ——————————————
      // 2) 아이템 가이드 모달
      // ——————————————
      const currentItemSlot = itemGuideSlots
        .filter((slot) => hour >= slot)
        .pop();
      if (currentItemSlot != null) {
        const key = `${dateKey}-${currentItemSlot}-itemGuide`;
        if (!localStorage.getItem(key)) {
          setShowItemGuideModal(true);
        }
      }
    };

    // 최초 5초간 2초마다
    const fastInterval = window.setInterval(checkAndShowModals, 2000);

    // 5초 후 1시간 간격으로 전환
    let slowInterval: number;
    const switchTimeout = window.setTimeout(() => {
      clearInterval(fastInterval);
      slowInterval = window.setInterval(checkAndShowModals, 3600_000);
    }, 5000);

    return () => {
      clearInterval(fastInterval);
      clearTimeout(switchTimeout);
      if (slowInterval) clearInterval(slowInterval);
    };
  }, []);

  // 모달 닫을 때 현재 슬롯 정보를 기록하는 함수
  const handleCloseItemGuideModal = () => {
    const now = new Date();
    const hour = now.getHours();
    const dateKey = `${now.getFullYear()}-${
      now.getMonth() + 1
    }-${now.getDate()}`;
    const slot = itemGuideSlots.filter((s) => hour >= s).pop();
    if (slot != null) {
      localStorage.setItem(`${dateKey}-${slot}-itemGuide`, "shown");
    }
    setShowItemGuideModal(false);
  };

  const handleCloseRankingModal = () => {
    const now = new Date();
    let currentSlot: number | null = null;
    for (let slot of scheduledSlots) {
      if (now.getHours() >= slot) {
        currentSlot = slot;
      }
    }
    if (currentSlot !== null) {
      const slotId = `${now.getFullYear()}-${
        now.getMonth() + 1
      }-${now.getDate()}-${currentSlot}`;
      localStorage.setItem("abuseModalLastShown", slotId);
      localStorage.setItem("abuseModalDismissed", slotId);
    }
    setShowRankingModal(false);
  };
  // ===============================

  // 1. 상태 추가
  const [showRaffleBoxModal, setShowRaffleBoxModal] = useState(false);
  const [showRaffleBoxOpenModal, setShowRaffleBoxOpenModal] = useState(false);
  const [isVibrating, setIsVibrating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [boxResult, setBoxResult] = useState<{ type: string; value: number; image: string } | null>(null);

  if (isLoading) {
    return <LoadingSpinner className="h-screen" />;
  }

  // 에러가 있어도 기본 UI 표시 (토큰 없음 등의 경우)
  if (error) {
    console.log("[DiceEvent] Data loading error:", error);
    // 에러가 있어도 기본 UI를 표시하도록 주석 처리
    // return <div>Error loading data: {error}</div>;
  }

  // 랜덤박스 열기 함수
  const handleOpenRaffleBox = () => {
    setShowRaffleBoxOpenModal(true);
    setIsVibrating(false);
    setShowResult(false);
    setBoxResult(null);
    
    // 2초 후 진동 시작
    setTimeout(() => {
      setIsVibrating(true);
      playSfx(Audios.button_click);
      
      // 2초 진동 후 결과 표시
      setTimeout(() => {
        setIsVibrating(false);
        setShowResult(true);
        
        // 랜덤 결과 생성 (예시)
        const results = [
          { type: "포인트", value: 1000, image: Images.StarpointIcon },
          { type: "다이스", value: 50, image: Images.DiceIcon },
          { type: "티켓", value: 5, image: Images.LotteryTicket },
        ];
        const randomResult = results[Math.floor(Math.random() * results.length)];
        setBoxResult(randomResult);
        
        // 자동 닫기 제거 - 사용자가 "받기" 버튼을 클릭해야 닫힘
      }, 2000);
    }, 500);
  };

  const handleRPSGameEnd = (result: "win" | "lose", winnings: number) => {
    // console.log(`RPS Game Ended: ${result}, Winnings: ${winnings}`);
    fetchUserData();
    game.handleRPSGameEnd(result, winnings);
  };

  return (
    <div className="flex flex-col items-center relative w-full h-full overflow-x-hidden min-h-screen">
      {/* 배경화면 추가 */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${Images.BackgroundTopview})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* 메인 컨텐츠를 위한 z-index 설정 */}
      <div className="relative z-10 w-full h-full flex flex-col items-center">
      {game.isRPSGameActive ? (
        <RPSGame
          onGameEnd={handleRPSGameEnd}
          onCancel={() => handleRPSGameEnd("lose", 0)}
        />
      ) : game.isSpinGameActive ? (
        <SpinGame onSpinEnd={game.handleSpinGameEnd} />
      ) : (
        <>
          <div className="w-full flex justify-center mb-4 mt-8 gap-[10px]">
            {/* 현재 캐릭터 레벨 및 AlertIcon 클릭 시 레벨 별 보상 다이얼로그 표시 */}
            <div
              onClick={(e) => {
                // AlertIcon 영역 클릭인지 확인 (좌측 상단 20x20 영역)
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;

                // AlertIcon은 좌측 상단 15px, 15px 위치에 20x20 크기
                if (
                  clickX >= 15 &&
                  clickX <= 35 &&
                  clickY >= 15 &&
                  clickY <= 35
                ) {
                  // AlertIcon 영역 클릭이면 navigation 방지
                  return;
                }

                // 다른 영역 클릭이면 inventory로 이동
                // navigate("/inventory", { state: { charactorImageSrc } });
              }}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label="Go to inventory"
              // onKeyDown={(e) => {
              //   if (e.key === "Enter" || e.key === " ") navigate("/inventory");
              // }}
            >
              <UserLevel
                userLv={userLv || 1}
                charactorImageSrc={charactorImageSrc || Images.Cat1}
                exp={pet?.exp || 0}
                characterType={characterType || "cat"}
                equippedItems={equippedItems}
                onAlertClick={() => {
                  playSfx(Audios.button_click);
                  setShowLevelRewardsDialog(true);
                }}
              />
            </div>

            {/* 이번 달 보상 내용 */}
            <MonthlyPrize
              month={monthlyPrize?.month || 1}
              prizeType={monthlyPrize?.prizeType || ""}
              amount={monthlyPrize?.amount || 0}
              eventFinishTime={monthlyPrize?.eventFinishTime || ""}
            />
          </div>

          <GameBoard
            position={position || 0}
            selectingTile={game?.selectingTile || false}
            handleTileClick={game?.handleTileClick || (() => {})}
            gaugeValue={game?.gaugeValue || 0}
            diceCount={game?.diceCount || 0}
            showDiceValue={game?.showDiceValue || false}
            rolledValue={game?.rolledValue || 0}
            buttonDisabled={game?.buttonDisabled || false}
            diceRef={game?.diceRef || null}
            handleRollComplete={game?.handleRollComplete || (() => {})}
            reward={game?.reward || null}
            isHolding={game?.isHolding || false}
            handleMouseDown={game?.handleMouseDown || (() => {})}
            handleMouseUp={game?.handleMouseUp || (() => {})}
            isLuckyVisible={game?.isLuckyVisible || false}
            rollDice={game?.rollDice || (() => {})}
          />
          {/* anywhere 시 표시되는 비행기 */}
          {game.selectingTile && !isAuto && (
            <div className="absolute md:top-0 top-0 left-0 w-full h-full flex justify-center items-center z-20 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-75 z-10"></div>
              <div className="text-white text-lg z-30 flex flex-col items-center justify-center mb-[200px] md:mb-[220px] font-semibold md:text-xl">
                <img
                  src={Images.Airplane}
                  alt="airplane"
                  className="h-20 md:h-28"
                />
                타일을 선택하세요.
              </div>
            </div>
          )}
          <Board
            position={position || 0}
            charactorImageSrc={charactorImageSrc || Images.Cat1}
            initialX={initialX}
            initialY={initialY}
            delta={delta}
            equippedItems={equippedItems}
            characterType={characterType || "cat"}
          />
          <br />

          {/* 랜덤박스스 아이콘 */}
          <div className="w-full max-w-[332px] md:max-w-full flex justify-center">
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: 12,
                margin: "0 0 8px 0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={() => setShowRaffleBoxModal(true)}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: "20px",
                    background: "rgba(255,255,255,0.65)",
                    boxShadow: "0px 2px 2px 0px rgba(0,0,0,0.4)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    marginBottom: 2,
                  }}
                >
                  <img
                    src={Images.RandomBox}
                    alt="Random Box"
                    style={{ width: 40, height: 40, objectFit: "contain" }}
                  />
                </button>
                <p
                  className="text-center mt-1"
                  style={{
                    fontFamily: "'ONE Mobile POP', sans-serif",
                    fontSize: "12px",
                    fontWeight: 400,
                    color: "#FFFFFF",
                    WebkitTextStroke: "1px #2A294E",
                  }}
                >
                  랜덤 박스
                </p>
              </div>
            </div>
          </div>

          {/* my-rank 위젯 표시 */}
          <Dialog>
            <DialogTrigger
              className="w-full flex justify-center"
              onClick={() => playSfx(Audios.button_click)}
            >
              <InlineRanking />
            </DialogTrigger>
            <DialogContent className="flex flex-col border-none text-white h-screen w-screen max-w-none max-h-none overflow-x-hidden font-semibold overflow-y-auto"
              style={{
                background: `url(${Images.BackgroundLobby})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
               <div 
                 className="absolute inset-0 z-0"
                 style={{
                   backgroundColor: "#42617D",
                   opacity: 0.6,
                 }}
               />
              <div className="relative z-10 flex flex-col h-full">
              <DialogHeader className="flex w-full items-end">
                <DialogClose>
                  <HiX className="w-5 h-5" />
                </DialogClose>
              </DialogHeader>
              <ModalRanking />
              <NewMyRanking />
              </div>
            </DialogContent>
          </Dialog>

          {/* 레벨별 보상 다이얼로그 */}
          <Dialog
            open={showLevelRewardsDialog}
            onOpenChange={setShowLevelRewardsDialog}
          >
            <DialogContent
              className="border-none rounded-3xl text-white h-svh overflow-x-hidden font-semibold overflow-y-auto max-w-[90%] md:max-w-lg max-h-[80%]"
              style={{
                background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
              }}
            >
              <DialogTitle className="sr-only">레벨별 보상</DialogTitle>
              <LevelRewards currentLevel={userLv} />
            </DialogContent>
          </Dialog>

          {/* 레벨 업 시 다이얼로그: 이전보다 레벨이 올라갔을 때만 표시 */}
          <Dialog open={showLevelUpDialog}>
            <DialogContent
              className="border-none rounded-3xl text-white h-svh overflow-x-hidden font-semibold overflow-y-auto max-w-[90%] md:max-w-lg max-h-[80%]"
              style={{
                background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
              }}
            >
              <div className="flex flex-col items-center justify-around">
                <div className=" flex flex-col items-center gap-2">
                  <h1
                    className="text-center"
                    style={{
                      fontFamily: "'ONE Mobile POP', sans-serif",
                      fontSize: "30px",
                      fontWeight: 400,
                      color: "#FDE047",
                      WebkitTextStroke: "2px #000000",
                    }}
                  >
                    레벨 업
                  </h1>
                  <div className="relative w-[250px] h-[204px]">
                    <img
                      src={Images.LevelUpBase}
                      alt="levelupEffect"
                      className="w-[250px] h-[204px]"
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        fontFamily: "'ONE Mobile POP', sans-serif",
                        fontSize: "40px",
                        fontWeight: 400,
                        background:
                          "radial-gradient(circle, #FDE047 0%, #F56800 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        WebkitTextStroke: "2px #000000",
                        textAlign: "center",
                        lineHeight: "1.2",
                      }}
                    >
                      {userLv}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-6">
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
                    지금 바로 당신의 보상을 챙기세요!
                  </p>
                  {currentReward && (
                    <div
                      className="flex flex-row items-center justify-center gap-6"
                      style={{
                        width: "70vw",
                        height: "120px",
                        background: "rgba(194, 213, 232, 0.1)",
                        border: "2px solid #B4CADA",
                        borderRadius: "20px",
                        padding: "16px",
                        boxShadow: "0px 4px 8px 0px rgba(0, 0, 0, 0.1)",
                        backdropFilter: "blur(15px)",
                        WebkitBackdropFilter: "blur(15px)",
                      }}
                    >
                      <div
                        className="rounded-xl w-20 h-20 flex flex-col items-center gap-2 justify-center"
                        style={{
                          background: "rgba(194, 213, 232, 0.5)",
                          border: "2px solid #B4CADA",
                          boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.04)",
                          backdropFilter: "blur(10px)",
                          WebkitBackdropFilter: "blur(10px)",
                        }}
                      >
                        <img
                          src={Images.Dice}
                          alt="dice"
                          className="w-10 h-10"
                        />
                        <p
                          className=" font-semibold text-xs"
                          style={{
                            fontFamily: "'ONE Mobile POP', sans-serif",
                            fontSize: "12px",
                            fontWeight: 400,
                            color: "#FFFFFF",
                            WebkitTextStroke: "1px #000000",
                          }}
                        >
                          +{currentReward.dice}
                        </p>
                      </div>
                      <div
                        className="rounded-xl w-20 h-20 flex flex-col items-center gap-2 justify-center"
                        style={{
                          background: "rgba(194, 213, 232, 0.5)",
                          border: "2px solid #B4CADA",
                          boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.04)",
                          backdropFilter: "blur(10px)",
                          WebkitBackdropFilter: "blur(10px)",
                        }}
                      >
                        <img
                          src={Images.StarpointIcon}
                          alt="star"
                          className="w-10 h-10"
                        />

                        <p
                          className=" font-semibold text-xs"
                          style={{
                            fontFamily: "'ONE Mobile POP', sans-serif",
                            fontSize: "12px",
                            fontWeight: 400,
                            color: "#FFFFFF",
                            WebkitTextStroke: "1px #000000",
                          }}
                        >
                          +{formatNumber(currentReward.points)}
                        </p>
                      </div>
                      {currentReward.tickets && (
                        <div
                          className="rounded-xl w-20 h-20 flex flex-col items-center gap-2 justify-center"
                          style={{
                            background: "rgba(194, 213, 232, 0.5)",
                            border: "2px solid #B4CADA",
                            boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.04)",
                            backdropFilter: "blur(10px)",
                            WebkitBackdropFilter: "blur(10px)",
                          }}
                        >
                          <img
                            src={Images.LotteryTicket}
                            alt="rapple"
                            className="w-10 h-10"
                          />
                          <p
                            className=" font-semibold text-xs"
                            style={{
                              fontFamily: "'ONE Mobile POP', sans-serif",
                              fontSize: "12px",
                              fontWeight: 400,
                              color: "#FFFFFF",
                              WebkitTextStroke: "1px #000000",
                            }}
                          >
                            +{currentReward.tickets}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowLevelUpDialog(false)}
                  className="rounded-[10px] w-[250px] h-14 relative"
                  style={{
                    background: "linear-gradient(180deg, #50B0FF 0%, #50B0FF 50%, #008DFF 50%, #008DFF 100%)",
                    border: "2px solid #76C1FF",
                    outline: "2px solid #000000",
                    boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 3px 0px 0px rgba(0, 0, 0, 0.1)",
                    color: "#FFFFFF",
                    fontFamily: "'ONE Mobile POP', sans-serif",
                    fontSize: "18px",
                    fontWeight: "400",
                    WebkitTextStroke: "1px #000000",
                    opacity: 1,
                  }}>
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
                  확인
                </button>
              </div>
            </DialogContent>
          </Dialog>

          {/* 사용 중지 다이얼로그 */}
          {/* <Dialog open={suspend}>
            <DialogTitle></DialogTitle>
            <DialogContent className=" bg-[#21212F] border-none rounded-3xl text-white h-svh overflow-x-hidden font-semibold overflow-y-auto max-w-[90%] md:max-w-lg max-h-[80%]">
              <div className="relative">
                <DialogClose className="absolute top-0 right-0 p-2">
                  <HiX
                    className="w-5 h-5"
                    onClick={() => {
                      playSfx(Audios.button_click);
                      setSuspend(false);
                    }}
                  />
                </DialogClose>
              </div>
              <div className="flex flex-col items-center justify-around">
                <div className=" flex flex-col items-center gap-2">
                  <h1 className=" font-bold text-xl  text-center">
                    {t("dice_event.account_suspended")}
                  </h1>
                </div>
                <div className="flex flex-col mt-5">
                  <p className="font-Pretendard text-center text-base font-semibold">
                    {t("dice_event.fair_play")}
                    <br />
                    {t("dice_event.mistake")}
                  </p>
                </div>

                <div className="flex flex-col mt-2">
                  <p className="font-Pretendard text-center text-sm font-semibold text-[#DD2726]">
                    {t("dice_event.reason")}
                  </p>
                </div>

                <div className="flex flex-col mt-2">
                  <p className="font-Pretendard text-center text-sm font-normal text-[#A3A3A3]">
                    {t("dice_event.if_error")}
                    <br />
                    {t("dice_event.contact_team")}
                  </p>
                </div>
                <button
                  onClick={() => setSuspend(false)}
                  className="bg-[#0147E5] text-base font-medium rounded-full w-40 h-14 mt-8 mb-7"
                >
                  {t("agree_page.close")}
                </button>
              </div>
            </DialogContent>
          </Dialog> */}

          {/* Random Box 모달 */}
          <Dialog
            open={showRaffleBoxModal}
            onOpenChange={setShowRaffleBoxModal}
          >
            <DialogContent 
              className="rounded-[24px]  max-w-[90%] md:max-w-md p-6 border-none"
              style={{
                background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
                boxShadow:
                  "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
              }}>
              <div className="flex flex-col items-center w-full">
                <h2 
                  className="font-bold text-lg mb-4"
                  style={{
                    fontFamily: "'ONE Mobile POP', sans-serif",
                    fontSize: "24px",
                    fontWeight: 400,
                    color: "#FFFFFF",
                    WebkitTextStroke: "1px #000000",
                  }}>
                    랜덤 박스
                </h2>
                <div 
                  className="flex items-center justify-center px-6 py-2 mb-6"
                  style={{
                    width: "165px",
                    height: "56px",
                    borderRadius: "62px",
                    background: "#0088FFBF",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    boxShadow: "inset 0px 0px 4px 3px rgba(255, 255, 255, 0.6)",
                  }}
                >
                  <img
                    src={Images.KeyIcon}
                    className="w-[44px] h-[44px] mr-2"
                    alt="ticket"
                  />
                  <span className="font-semibold text-lg"
                  style={{
                    fontFamily: "'ONE Mobile POP', sans-serif",
                    fontSize: "18px",
                    fontWeight: 400,
                    color: "#FFFFFF",
                  }}>1000</span>
                </div>
                <div className="flex flex-col gap-4 w-full">
                  {/* 랜덤 박스 */}
                  <div className="flex items-center justify-between px-1 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: 70,
                          height: 70,
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 13,
                          border: "2px solid #B4CADA",
                          padding: 5,
                        }}
                      >
                        {/* Background layer with blur effect */}
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            borderRadius: 11,
                            background: "#C2D5E8",
                            opacity: 0.5,
                            backdropFilter: "blur(10px)",
                            boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.04)",
                          }}
                        />
                        {/* Image layer without blur */}
                        <img
                          src={Images.RandomBox}
                          style={{ 
                            width: 60, 
                            height: 60,
                            position: "relative",
                            zIndex: 1
                          }}
                          alt="bronze"
                        />
                      </div>
                      <div>
                        <div 
                          className="font-semibold text-base"
                          style={{
                            fontFamily: "'ONE Mobile POP', sans-serif",
                            fontSize: "14px",
                            fontWeight: 400,
                            color: "#FFFFFF",
                            WebkitTextStroke: "1px #000000",
                          }}>
                          럭키 랜덤박스
                        </div>
                        <div 
                          className="flex items-center gap-1"
                          style={{
                              fontFamily: "'ONE Mobile POP', sans-serif",
                              fontSize: "14px",
                              fontWeight: 400,
                              color: "#FFFFFF",
                              WebkitTextStroke: "1px #000000",
                            }}>
                          <img
                            src={Images.KeyIcon}
                            className="w-[30px] h-[30px]"
                            alt="ticket"
                          />
                          100
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleOpenRaffleBox}
                      className="w-[80px] h-14 rounded-[10px] flex items-center justify-center relative"
                      style={{
                        background: "linear-gradient(180deg, #50B0FF 0%, #50B0FF 50%, #008DFF 50%, #008DFF 100%)",
                        border: "2px solid #76C1FF",
                        outline: "2px solid #000000",
                        boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 3px 0px 0px rgba(0, 0, 0, 0.1)",
                        color: "#FFFFFF",
                        fontFamily: "'ONE Mobile POP', sans-serif",
                        fontSize: "18px",
                        fontWeight: "400",
                        WebkitTextStroke: "1px #000000",
                        opacity: 1,
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
                    열기
                    </button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          
          {/* Random Box 열기 모달 */}
          <Dialog
            open={showRaffleBoxOpenModal}
            onOpenChange={setShowRaffleBoxOpenModal}
          >
            <DialogContent 
              className="rounded-[24px] max-w-[90%] md:max-w-md p-6 border-none"
              style={{
                background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
                boxShadow:
                  "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
              }}>
              <div className="flex flex-col items-center w-full">
                <h2 
                  className="font-bold text-lg mb-6"
                  style={{
                    fontFamily: "'ONE Mobile POP', sans-serif",
                    fontSize: "24px",
                    fontWeight: 400,
                    color: "#FFFFFF",
                    WebkitTextStroke: "1px #000000",
                  }}>
                  {showResult ? "축하합니다!" : "랜덤 박스"}
                </h2>
                
                                 {/* 랜덤박스 이미지 컨테이너 - 결과가 표시되지 않을 때만 보임 */}
                 {!showResult && (
                   <div 
                     className="relative mb-6"
                     style={{
                       width: 160,
                       height: 165,
                       display: "flex",
                       alignItems: "center",
                       justifyContent: "center",
                     }}
                   >
                     {/* 배경 레이어 */}
                     <div
                       style={{
                         position: "absolute",
                         top: 0,
                         left: 0,
                         width: "100%",
                         height: "100%",
                         opacity: 0.5,
                       }}
                     />
                     
                     {/* 랜덤박스 이미지 */}
                     <img
                       src={Images.RandomBox}
                       style={{
                         width: "100%",
                         height: "100%",
                         position: "relative",
                         zIndex: 1,
                         animation: isVibrating ? "vibrate 0.1s infinite" : "none",
                       }}
                       alt="random-box"
                     />
                   </div>
                 )}

                {/* 결과 표시 */}
                {showResult && boxResult && (
                  <div className="flex flex-col items-center mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={boxResult.image}
                        style={{ width: 40, height: 40 }}
                        alt={boxResult.type}
                      />
                      <span
                        style={{
                          fontFamily: "'ONE Mobile POP', sans-serif",
                          fontSize: "20px",
                          fontWeight: 400,
                          color: "#FFFFFF",
                          WebkitTextStroke: "1px #000000",
                        }}
                      >
                        {boxResult.value} {boxResult.type}
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: "'ONE Mobile POP', sans-serif",
                        fontSize: "16px",
                        fontWeight: 400,
                        color: "#FFFFFF",
                        WebkitTextStroke: "0.5px #000000",
                      }}
                    >
                      획득하셨습니다!
                    </p>
                  </div>
                )}

                {/* 받기 버튼 - 결과가 표시될 때만 보임 */}
                {showResult && (
                  <button
                    onClick={() => {
                      setShowRaffleBoxOpenModal(false);
                      setShowResult(false);
                      setBoxResult(null);
                    }}
                    className="w-32 h-10 rounded-[10px] flex items-center justify-center"
                    style={{
                      background: "linear-gradient(180deg, #50B0FF 0%, #50B0FF 50%, #008DFF 50%, #008DFF 100%)",
                      border: "2px solid #76C1FF",
                      outline: "2px solid #000000",
                      boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 3px 0px 0px rgba(0, 0, 0, 0.1)",
                      color: "#FFFFFF",
                      fontFamily: "'ONE Mobile POP', sans-serif",
                      fontSize: "16px",
                      fontWeight: "400",
                      WebkitTextStroke: "1px #000000",
                    }}
                  >
                    받기
                  </button>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <br />
          <br />
          <br />
          <br />
          <br />
          <div className="hidden md:block md:mb-40"> &nbsp;</div>
        </>
      )}
      
      {/* BottomNav - SpinGame이 활성화되지 않을 때만 표시 */}
      {!game.isSpinGameActive && !game.isRPSGameActive && <BottomNav />}
      </div>
    </div>
  );
};

export default DiceEventPage;
