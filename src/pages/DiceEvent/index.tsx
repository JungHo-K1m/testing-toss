// src/pages/DiceEventPage.tsx
import React, { useEffect, useState, useRef } from "react";
import UserLevel from "@/entities/User/components/UserLevel";
import "@/features/DiceEvent/DiceEvent.css";
import Images from "@/shared/assets/images";
import { MonthlyPrize } from "@/entities/MonthlyPrize";
import { useNavigate } from "react-router-dom";
import useDiceGame from "./useDiceGame";
import GameBoard from "./GameBoard";
import { Board } from "@/features/DiceEvent";
import RPSGame from "../RPSGame";
import SpinGame from "../SpinGame";
import CardGameModal from "../CardGame/CardGameModal";
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
import { InlineRanking } from "@/widgets/MyRanking/InlineRanking";
import { ModalRanking } from "@/widgets/MyRanking/ModalRanking";
import BottomNav from "@/widgets/BottomNav/BottomNav";
import NewMyRanking from "@/widgets/NewMyRanking";
import {
  purchaseRandomBox,
  RandomBoxResult,
} from "@/entities/User/api/purchaseRandomBox";
import { getRandomBoxAdReward, RandomBoxAdRewardResponse } from "@/entities/User/api/randomBoxAdReward";
import { useAdMob } from "@/hooks/useAdMob";
import { getPlatform } from "@/types/adMob";

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
    // monthlyPrize,
    isAuto,
    pet,
    suspend,
    setSuspend,
    lotteryCount, // lotteryCount로 변경 (열쇠 개수)
  } = useUserStore();

  const game = useDiceGame();
  const { playSfx } = useSound();
  const [initialX, setInitialX] = useState<number>(140);
  const [initialY, setInitialY] = useState<number>(474);
  const [delta, setDelta] = useState<number>(56);
  const navigate = useNavigate();
  const { walletAddress } = useWalletStore();

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

  // 사용자 데이터 초기 로딩
  useEffect(() => {
    const initializeUserData = async () => {
      try {
        await fetchUserData();
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
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
  const [showItemDialog, setShowItemDialog] = useState(false);

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
  const [boxResult, setBoxResult] = useState<RandomBoxResult | null>(null);
  const [isLoadingBox, setIsLoadingBox] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [refillTimeInfo, setRefillTimeInfo] = useState<{ canRefill: boolean; timeUntilRefill: string } | null>(null);
  
  // 광고 관련 상태 및 훅
  const { adLoadStatus, loadAd, showAd, isSupported, autoLoadAd } = useAdMob();
  const [platform] = useState(getPlatform());

  // 리필 시간 클릭 핸들러
  const handleRefillTimeClick = (timeInfo: { canRefill: boolean; timeUntilRefill: string }) => {
    // if (!timeInfo.canRefill) {
    //   alert(`다이스 리필까지 ${timeInfo.timeUntilRefill} 남았습니다.`);
    // }
    setRefillTimeInfo(timeInfo); // 시간 정보를 상태에 저장
    setShowAdModal(true);
  };

  // 광고 버튼 클릭 핸들러
  const handleAdButtonClick = async () => {
    if (adLoadStatus === 'not_loaded') {
      // 광고가 로드되지 않은 경우 로드 시작
      await loadAd();
    } else if (adLoadStatus === 'loaded') {
      // 광고가 로드된 경우 표시
      await showAd();
    }
  };

  // 광고 상태에 따른 버튼 텍스트 및 비활성화 여부
  const getAdButtonText = () => {
    switch (adLoadStatus) {
      case 'not_loaded':
        return '광고 로드하기';
      case 'loading':
        return '광고 로딩 중...';
      case 'loaded':
        return '광고 시청 후 주사위 얻기';
      case 'failed':
        return '광고 로드 실패 - 다시 시도';
      default:
        return '광고 시청 후 주사위 얻기';
    }
  };

  // 광고보고 랜덤박스 열기 핸들러
  const handleAdRandomBox = async () => {
    if (!isSupported) {
      console.log('광고가 지원되지 않는 환경입니다');
      return;
    }

    try {
      console.log('광고보고 랜덤박스 시작 - 광고 상태:', adLoadStatus);
      
      // 광고가 로드되지 않은 경우 먼저 로드
      if (adLoadStatus !== 'loaded') {
        console.log('광고 로드 시작...');
        await loadAd();
        console.log('광고 로드 완료 후 상태:', adLoadStatus);
        return;
      }

      console.log('광고 표시 시작...');
      
      // 광고 표시 및 보상 결과 대기
      console.log('showAd() Promise 대기 시작...');
      const rewardData: RandomBoxAdRewardResponse = await showAd();
      console.log('showAd() Promise 완료 - 보상 결과:', rewardData);
      
      if (rewardData) {
        console.log('보상 결과 처리 시작...');
        console.log('원본 rewardData:', rewardData);
        
        // rewardData 구조 확인 및 안전한 매핑
        if (!rewardData.type) {
          console.error('rewardData.type이 없습니다:', rewardData);
          alert('보상 데이터 형식이 올바르지 않습니다.');
          return;
        }
        
        // 보상 결과를 상태에 저장
        const newBoxResult: RandomBoxResult = {
          type: rewardData.type,  // type → type으로 매핑
          equipment: rewardData.equipment || undefined
        };
        
        console.log('새로운 boxResult 설정:', newBoxResult);
        console.log('boxResult.type 확인:', newBoxResult.type);
        console.log('boxResult.equipment 확인:', newBoxResult.equipment);
        
        setBoxResult(newBoxResult);
        
        console.log('결과 모달 표시 설정...');
        // 결과 모달 표시
        setShowResult(true);
        setShowRaffleBoxOpenModal(true);
        
        console.log('진동 효과 시작...');
        // 진동 효과 (선택사항)
        setIsVibrating(true);
        setTimeout(() => setIsVibrating(false), 1000);
        
        console.log('사용자 데이터 새로고침 시작...');
        // 사용자 데이터 새로고침 (보상 반영)
        await fetchUserData();
        
        console.log('광고보고 랜덤박스 완료!');
      } else {
        console.log('보상 결과가 없습니다.');
      }
      
    } catch (error: any) {
      console.error('광고 표시 중 오류:', error);
      console.error('에러 상세 정보:', {
        message: error.message,
        stack: error.stack
      });
      alert('광고 시청에 실패했습니다. 다시 시도해주세요.');
    }
  };


  // 랜덤박스 모달이 열릴 때 자동으로 광고 로드
  useEffect(() => {
    if (showRaffleBoxModal) {
      autoLoadAd();
    }
  }, [showRaffleBoxModal, autoLoadAd]);

  const isAdButtonDisabled = adLoadStatus === 'loading' || adLoadStatus === 'failed';

  // 보유 열쇠 개수는 lotteryCount를 직접 사용

  // 디버깅용: 랜덤박스 결과 로깅
  useEffect(() => {
    if (boxResult) {
      console.log("랜덤박스 결과:", boxResult);
      console.log("결과 타입:", boxResult.type);
      if (boxResult.equipment) {
        console.log("장비 정보:", boxResult.equipment);
        console.log("장비 타입:", boxResult.equipment.type);
        console.log("장비 희귀도:", boxResult.equipment.rarity);
        console.log(
          "이미지 경로:",
          getEquipmentIcon(boxResult.equipment.type, boxResult.equipment.rarity)
        );
      }
    }
  }, [boxResult]);

  // 디버깅용: 모달 상태 변경 감지
  useEffect(() => {
    console.log("모달 상태 변경:", {
      showResult,
      showRaffleBoxOpenModal,
      boxResult: boxResult ? '있음' : '없음'
    });
  }, [showResult, showRaffleBoxOpenModal, boxResult]);

  // 사용자 데이터 초기 로딩
  useEffect(() => {
    const initializeUserData = async () => {
      try {
        await fetchUserData();
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    initializeUserData();
  }, [fetchUserData]);
  
  useEffect(() => {
    if (showAdModal) {
      autoLoadAd();
    }
  }, [showAdModal, autoLoadAd]);

  if (isLoading) {
    return <LoadingSpinner className="h-screen" />;
  }

  if (error) {
    return <div>Error loading data: {error}</div>;
  }

  // 장비 타입별 이미지 가져오기 함수 (Attendance.tsx와 동일)
  const getEquipmentIcon = (type: string, rarity: number) => {
    const getRarityImageIndex = (rarity: number): number => {
      if (rarity <= 1) return 1; // 보라색
      if (rarity <= 3) return 2; // 하늘색
      if (rarity <= 5) return 3; // 초록색
      if (rarity <= 7) return 4; // 노란색
      return 5; // 빨간색
    };

    const imageIndex = getRarityImageIndex(rarity);

    // 기본값으로 초기화하여 초기화되지 않은 변수 사용 방지
    let imageKey: string = "Ballon1"; // 기본값 설정

    switch (type.toUpperCase()) {
      case "HEAD":
        imageKey = `Crown${imageIndex}`;
        break;
      case "EAR":
        imageKey = `Hairpin${imageIndex}`;
        break;
      case "EYE":
        imageKey = `Sunglass${imageIndex}`;
        break;
      case "NECK":
        imageKey = `Muffler${imageIndex}`;
        break;
      case "BACK":
        imageKey = `Ballon${imageIndex}`;
        break;
      default:
        imageKey = "Ballon1"; // 기본값 유지
        break;
    }

    // 디버깅용 로그
    console.log("이미지 키:", imageKey);
    console.log("Images 객체에서 해당 키 존재 여부:", imageKey in Images);
    console.log(
      "사용 가능한 이미지 키들:",
      Object.keys(Images).filter(
        (key) =>
          key.includes("Crown") ||
          key.includes("Hairpin") ||
          key.includes("Sunglass") ||
          key.includes("Muffler") ||
          key.includes("Ballon")
      )
    );

    const result = Images[imageKey as keyof typeof Images];

    if (!result) {
      console.error(`이미지를 찾을 수 없습니다: ${imageKey}`);
      console.error("사용 가능한 이미지들:", Object.keys(Images));
      return Images.Ballon1; // 기본값
    }

    return result;
  };

  // 장비 타입별 이름 가져오기 함수
  const getEquipmentName = (type: string): string => {
    const itemNames: { [key: string]: string } = {
      HEAD: "크라운",
      EAR: "머리핀",
      EYE: "선글라스",
      NECK: "목도리",
      BACK: "풍선",
    };
    return itemNames[type] || type;
  };

  // 랜덤박스 열기 함수
  const handleOpenRaffleBox = async () => {
    if (lotteryCount < 100) {
      alert("열쇠가 부족합니다. 최소 100개가 필요합니다.");
      return;
    }

    setShowRaffleBoxOpenModal(true);
    setIsVibrating(false);
    setShowResult(false);
    setBoxResult(null);
    setIsLoadingBox(true);

    try {
      // 2초 후 진동 시작
      setTimeout(async () => {
        setIsVibrating(true);
        playSfx(Audios.button_click);

        // 2초 진동 후 결과 표시
        setTimeout(async () => {
          try {
            // 실제 API 호출
            const result = await purchaseRandomBox();
            setBoxResult(result);

            // 보유 열쇠 차감 - lotteryCount 직접 업데이트
            // TODO: API 응답에서 업데이트된 열쇠 개수를 받아와서 업데이트
            // 현재는 임시로 로컬 상태만 업데이트

            setIsVibrating(false);
            setShowResult(true);
          } catch (error) {
            console.error("랜덤박스 구매 실패:", error);
            alert("랜덤박스 구매에 실패했습니다. 다시 시도해주세요.");
            setShowRaffleBoxOpenModal(false);
          } finally {
            setIsLoadingBox(false);
          }
        }, 2000);
      }, 500);
    } catch (error) {
      console.error("랜덤박스 열기 오류:", error);
      setIsLoadingBox(false);
    }
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

                  // 다른 영역 클릭이면 착용중인 아이템 모달창 표시
                  setShowItemDialog(true);
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
                  userLv={userLv}
                  charactorImageSrc={charactorImageSrc}
                  exp={pet.exp}
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
                month={1}
                prizeType="token"
                amount={1000}
                eventFinishTime="2025-08-20T15:00:00Z"
              />
            </div>

            <GameBoard
              position={position}
              selectingTile={game.selectingTile}
              handleTileClick={game.handleTileClick}
              gaugeValue={game.gaugeValue}
              diceCount={game.diceCount}
              showDiceValue={game.showDiceValue}
              rolledValue={game.rolledValue}
              buttonDisabled={game.buttonDisabled}
              diceRef={game.diceRef}
              handleRollComplete={game.handleRollComplete}
              reward={game.reward}
              isHolding={game.isHolding}
              handleMouseDown={game.handleMouseDown}
              handleMouseUp={game.handleMouseUp}
              isLuckyVisible={game.isLuckyVisible}
              rollDice={game.rollDice}
              isCardGameActive={game.isCardGameActive}
              handleCardGameEnd={game.handleCardGameEnd}
              onRefillTimeClick={handleRefillTimeClick} 
            />

            {/* 카드게임 모달 - 한 번만 진행되는 게임 */}
            {game.isCardGameActive && (
              <CardGameModal onClose={game.handleCardGameEnd} />
            )}
            {/* anywhere 시 표시되는 비행기 */}
            {game.selectingTile && !isAuto && (
              <div className="absolute md:top-0 top-0 left-0 w-full h-full flex justify-center items-center z-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-black opacity-75 z-10"></div>
                <div className="text-white text-lg z-30 flex flex-col items-center justify-center mb-[200px] md:mb-[220px] font-semibold md:text-xl">
                  <img
                    src={Images.AirplaneIcon}
                    alt="airplane"
                    className="h-20 md:h-28"
                  />
                  타일을 선택하세요.
                </div>
              </div>
            )}
            {/* 카드게임이 활성화되지 않았을 때만 Board(캐릭터) 표시 */}
            {!game.isCardGameActive && (
              <Board
                position={position}
                charactorImageSrc={charactorImageSrc}
                initialX={initialX}
                initialY={initialY}
                delta={delta}
                equippedItems={equippedItems}
                characterType={characterType || "cat"}
              />
            )}
            <br />

            {/* 랜덤박스 아이콘 */}
            <div className="w-full max-w-[332px] md:max-w-full flex justify-center -mt-4">
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
                style={{
                  backgroundColor: "transparent",
                  outline: "none",
                  border: "none",
                }}
              >
                <InlineRanking />
              </DialogTrigger>
              <DialogContent
                className="flex flex-col border-none text-white h-screen w-screen max-w-none max-h-none overflow-x-hidden font-semibold overflow-y-auto"
                style={{
                  background: `url(${Images.BackgroundLobby})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
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
                      <HiX
                        className="w-5 h-5"
                        style={{
                          backgroundColor: "transparent",
                          outline: "none",
                          border: "none",
                        }}
                      />
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
                  background:
                    "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
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
                  background:
                    "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
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
                      background:
                        "linear-gradient(180deg, #50B0FF 0%, #50B0FF 50%, #008DFF 50%, #008DFF 100%)",
                      border: "2px solid #76C1FF",
                      outline: "2px solid #000000",
                      boxShadow:
                        "0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 3px 0px 0px rgba(0, 0, 0, 0.1)",
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
                    확인
                  </button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Random Box 모달 */}
            <Dialog
              open={showRaffleBoxModal}
              onOpenChange={setShowRaffleBoxModal}
            >
              <DialogTitle></DialogTitle>
              <DialogContent
                className="rounded-[24px] max-w-[80%] sm:max-w-[70%] md:max-w-md p-6 border-none mx-auto relative"
                style={{
                  background:
                    "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
                  boxShadow:
                    "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* 닫기 버튼 */}
                <button
                  onClick={() => setShowRaffleBoxModal(false)}
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center"
                >
                  <HiX className="w-5 h-5 text-white" />
                </button>

                <div className="flex flex-col items-center w-full">
                  <h2
                    className="font-bold text-lg mb-4"
                    style={{
                      fontFamily: "'ONE Mobile POP', sans-serif",
                      fontSize: "24px",
                      fontWeight: 400,
                      color: "#FFFFFF",
                      WebkitTextStroke: "1px #000000",
                    }}
                  >
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
                      boxShadow:
                        "inset 0px 0px 4px 3px rgba(255, 255, 255, 0.6)",
                    }}
                  >
                    <img
                      src={Images.KeyIcon}
                      className="w-[44px] h-[44px] mr-2"
                      alt="ticket"
                    />
                    <span
                      className="font-semibold text-lg"
                      style={{
                        fontFamily: "'ONE Mobile POP', sans-serif",
                        fontSize: "18px",
                        fontWeight: 400,
                        color: "#FFFFFF",
                      }}
                    >
                      {lotteryCount}
                    </span>
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
                              zIndex: 1,
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
                            }}
                          >
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
                            }}
                          >
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
                        className="w-[80px] h-14 rounded-[10px] flex items-center justify-center relative whitespace-nowrap"
                        style={{
                          background:
                            "linear-gradient(180deg, #50B0FF 0%, #50B0FF 50%, #008DFF 50%, #008DFF 100%)",
                          border: "2px solid #76C1FF",
                          outline: "2px solid #000000",
                          boxShadow:
                            "0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 3px 0px 0px rgba(0, 0, 0, 0.1)",
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

                    <div className="mt-3 mb-5 w-full flex justify-center">
                      <button
                        onClick={handleAdRandomBox}
                        disabled={adLoadStatus !== 'loaded'}
                        className="relative flex items-center justify-center gap-3 px-6 py-4 rounded-[10px] transition-transform active:scale-95"
                        style={{
                          background:
                            "linear-gradient(180deg, #50B0FF 0%, #50B0FF 50%, #008DFF 50%, #008DFF 100%)",
                          border: "2px solid #76C1FF",
                          outline: "2px solid #000000",
                          boxShadow:
                            "0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 3px 0px 0px rgba(0, 0, 0, 0.1)",
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
                        <img
                          src={Images.AdButton}
                          alt="광고 버튼"
                          style={{
                            width: "32px",
                            height: "32px",
                          }}
                        />

                        <span>
                          {adLoadStatus === 'loading' && '로딩 중...'}
                          {adLoadStatus === 'loaded' && '광고보고 램덤박스 열기'}
                          {adLoadStatus === 'failed' && '로드 실패'}
                          {adLoadStatus === 'not_loaded' && '준비 중...'}
                        </span>
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
              <DialogTitle className="sr-only"></DialogTitle>
              <DialogContent
                className="rounded-[24px] max-w-[80%] sm:max-w-[70%] md:max-w-md p-6 border-none mx-auto relative"
                style={{
                  background:
                    "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
                  boxShadow:
                    "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* 닫기 버튼 */}
                <DialogHeader className="flex w-full items-end">
                  <DialogClose>
                    <HiX className="w-5 h-5 text-white" />
                  </DialogClose>
                </DialogHeader>

                <div className="flex flex-col items-center w-full">
                  <h2
                    className="font-bold text-lg mb-6"
                    style={{
                      fontFamily: "'ONE Mobile POP', sans-serif",
                      fontSize: "24px",
                      fontWeight: 400,
                      color: "#FFFFFF",
                      WebkitTextStroke: "1px #000000",
                    }}
                  >
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
                          animation: isVibrating
                            ? "vibrate 0.1s infinite"
                            : "none",
                        }}
                        alt="random-box"
                      />
                    </div>
                  )}

                  {/* 결과 표시 */}
                  {showResult && boxResult && (
                    <div className="flex flex-col items-center mb-4">
                      {boxResult.type && ['EQUIPMENT', 'DICE', 'SL', 'NONE'].includes(boxResult.type) ? (
                        <>
                          {boxResult.type === "EQUIPMENT" && boxResult.equipment ? (
                            <div className="flex items-center gap-3 mb-2">
                              <img
                                src={getEquipmentIcon(
                                  boxResult.equipment.type,
                                  boxResult.equipment.rarity
                                )}
                                style={{ width: 40, height: 40 }}
                                alt={boxResult.equipment.type}
                                onError={(e) => {
                                  console.error("이미지 로드 실패:", e);
                                  if (boxResult.equipment) {
                                    console.error(
                                      "시도한 이미지 경로:",
                                      getEquipmentIcon(
                                        boxResult.equipment.type,
                                        boxResult.equipment.rarity
                                      )
                                    );
                                  }
                                }}
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
                                {getEquipmentName(boxResult.equipment.type)} 장비
                              </span>
                            </div>
                          ) : boxResult.type === "DICE" ? (
                            <div className="flex items-center gap-3 mb-2">
                              <img
                                src={Images.Dice}
                                style={{ width: 40, height: 40 }}
                                alt="dice"
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
                                다이스 획득!
                              </span>
                            </div>
                          ) : boxResult.type === "SL" ? (
                            <div className="flex items-center gap-3 mb-2">
                              <img
                                src={Images.LotteryTicket}
                                style={{ width: 40, height: 40 }}
                                alt="lottery"
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
                                래플권 획득!
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 mb-2">
                              <span
                                style={{
                                  fontFamily: "'ONE Mobile POP', sans-serif",
                                  fontSize: "20px",
                                  fontWeight: 400,
                                  color: "#FFFFFF",
                                  WebkitTextStroke: "1px #000000",
                                }}
                              >
                                아쉽게도 아무것도...
                              </span>
                            </div>
                          )}
                          <p
                            style={{
                              fontFamily: "'ONE Mobile POP', sans-serif",
                              fontSize: "16px",
                              fontWeight: 400,
                              color: "#FFFFFF",
                              WebkitTextStroke: "0.5px #000000",
                            }}
                          >
                            {boxResult.type === "NONE"
                              ? "다음 기회에!"
                              : "획득하셨습니다!"}
                          </p>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <span
                            style={{
                              fontFamily: "'ONE Mobile POP', sans-serif",
                              fontSize: "18px",
                              fontWeight: 400,
                              color: "#FF6B6B",
                              WebkitTextStroke: "1px #000000",
                            }}
                          >
                            보상 데이터 오류
                          </span>
                          <p
                            style={{
                              fontFamily: "'ONE Mobile POP', sans-serif",
                              fontSize: "14px",
                              fontWeight: 400,
                              color: "#FFFFFF",
                              WebkitTextStroke: "0.5px #000000",
                            }}
                          >
                            다시 시도해주세요
                          </p>
                          <button
                            onClick={() => {
                              setShowRaffleBoxOpenModal(false);
                              setShowResult(false);
                              setBoxResult(null);
                            }}
                            className="mt-2 px-4 py-2 rounded bg-red-500 text-white"
                          >
                            닫기
                          </button>
                        </div>
                      )}
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
                        background:
                          "linear-gradient(180deg, #50B0FF 0%, #50B0FF 50%, #008DFF 50%, #008DFF 100%)",
                        border: "2px solid #76C1FF",
                        outline: "2px solid #000000",
                        boxShadow:
                          "0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 3px 0px 0px rgba(0, 0, 0, 0.1)",
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

            {/* 장착 중인 아이템 모달 */}
            <Dialog open={showItemDialog}>
              <DialogTitle className="sr-only">장착 중인 아이템</DialogTitle>
              <DialogContent
                className="border-none rounded-3xl text-white h-svh overflow-x-hidden font-semibold overflow-y-auto max-w-[90%] md:max-w-lg max-h-[80%]"
                style={{
                  background:
                    "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="relative">
                  <DialogClose className="absolute top-0 right-0 p-2">
                    <HiX
                      className="w-5 h-5"
                      onClick={() => {
                        playSfx(Audios.button_click);
                        setShowItemDialog(false);
                      }}
                    />
                  </DialogClose>
                </div>
                <div className="flex flex-col items-center justify-around">
                  <div className=" flex flex-col items-center gap-2 mb-[30px]">
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
                      장착된 아이템
                    </h1>
                    <div className="flex items-center justify-center w-[150px] h-[150px] mb-5">
                      <img
                        src={Images.DogSmile}
                        alt="levelupEffect"
                        className="w-[150px] h-[150px]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-6">
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
                      <p
                        className="text-center p-4"
                        style={{
                          fontFamily: "'ONE Mobile POP', sans-serif",
                          fontSize: "24px",
                          fontWeight: 400,
                          color: "#FFFFFF",
                          WebkitTextStroke: "1px #000000",
                        }}
                      >
                        현재 장착 중인 아이템이 없습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* 리필 시간 및 광고 버튼 모달 */} 
            <Dialog open={showAdModal}>
              <DialogTitle></DialogTitle>
              <DialogContent
                className="border-none rounded-3xl text-white h-svh overflow-x-hidden font-semibold overflow-y-auto max-w-[90%] md:max-w-lg max-h-[80%]"
                style={{
                  background:
                    "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="relative">
                  <DialogClose className="absolute top-0 right-0 p-2">
                    <HiX
                      className="w-5 h-5"
                      onClick={() => {
                        playSfx(Audios.button_click);
                        setShowAdModal(false);
                        setRefillTimeInfo(null); // 모달 닫을 때 시간 정보 초기화
                      }}
                    />
                  </DialogClose>
                </div>
                <div className="flex flex-col items-center justify-around">
                  <div className="flex flex-col items-center gap-2 mb-[30px]">
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
                      주사위 리필
                    </h1>
                    <div className="flex items-center justify-center w-[150px] h-[150px] mb-5">
                      {/* 리필 시간 표시 */}
                      {refillTimeInfo ? (
                        <div className="flex flex-col items-center gap-3">
                          <img
                            src={Images.RefillDice}
                            alt="Refill Dice"
                            className="w-16 h-16"
                          />
                          <div className="text-center">
                            <p
                              style={{
                                fontFamily: "'ONE Mobile POP', sans-serif",
                                fontSize: "18px",
                                fontWeight: 400,
                                color: "#FFFFFF",
                                WebkitTextStroke: "1px #000000",
                              }}
                            >
                              다음 리필까지
                            </p>
                            <p
                              style={{
                                fontFamily: "'ONE Mobile POP', sans-serif",
                                fontSize: "24px",
                                fontWeight: 400,
                                color: "#FDE047",
                                WebkitTextStroke: "1px #000000",
                              }}
                            >
                              {refillTimeInfo.timeUntilRefill}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <img
                            src={Images.RefillDice}
                            alt="Refill Dice"
                            className="w-16 h-16"
                          />
                          <div className="text-center">
                            <p
                              style={{
                                fontFamily: "'ONE Mobile POP', sans-serif",
                                fontSize: "18px",
                                fontWeight: "400",
                                color: "#FFFFFF",
                                WebkitTextStroke: "1px #000000",
                              }}
                            >
                              대기 중...
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 광고 상태 및 플랫폼 정보 표시 */}
                  <div className="flex flex-col items-center gap-2 mb-4">
                    <div className="text-center">
                      <p
                        style={{
                          fontFamily: "'ONE Mobile POP', sans-serif",
                          fontSize: "14px",
                          fontWeight: "400",
                          color: "#B4CADA",
                          WebkitTextStroke: "0.5px #000000",
                        }}
                      >
                        플랫폼: {platform.toUpperCase()}
                      </p>
                      <p
                        style={{
                          fontFamily: "'ONE Mobile POP', sans-serif",
                          fontSize: "14px",
                          fontWeight: "400",
                          color: "#B4CADA",
                          WebkitTextStroke: "0.5px #000000",
                        }}
                      >
                        광고 상태: {adLoadStatus === 'not_loaded' ? '대기 중' : 
                                  adLoadStatus === 'loading' ? '로딩 중' : 
                                  adLoadStatus === 'loaded' ? '로드 완료' : '로드 실패'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-6">
                    <button
                      className={`relative flex items-center justify-center gap-3 px-6 py-4 rounded-[10px] transition-transform active:scale-95 ${
                        isAdButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                      }`}
                      style={{
                        background:
                          "linear-gradient(180deg, #50B0FF 0%, #50B0FF 50%, #008DFF 50%, #008DFF 100%)",
                        border: "2px solid #76C1FF",
                        outline: "2px solid #000000",
                        boxShadow:
                          "0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 3px 0px 0px rgba(0, 0, 0, 0.1)",
                        color: "#FFFFFF",
                        fontFamily: "'ONE Mobile POP', sans-serif",
                        fontSize: "18px",
                        fontWeight: "400",
                        WebkitTextStroke: "1px #000000",
                        opacity: isAdButtonDisabled ? 0.5 : 1,
                      }}
                      onClick={handleAdButtonClick}
                      disabled={isAdButtonDisabled}
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
                      <img
                        src={Images.AdButton}
                        alt="광고 버튼"
                        style={{
                          width: "32px",
                          height: "32px",
                        }}
                      />
                      <span>{getAdButtonText()}</span>
                    </button>
                  </div>
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


        {/* BottomNav - 게임이 활성화되지 않을 때만 표시 */}
        {!game.isSpinGameActive &&
          !game.isRPSGameActive &&
          !game.isCardGameActive && <BottomNav />}
      </div>
    </div>
  );
};

export default DiceEventPage;