// src/pages/MissionPage.tsx
import React, { useEffect, useState, useRef } from "react";
import { TopTitle } from "@/shared/components/ui";
import "./MissionPage.css";
import Images from "@/shared/assets/images";
import missionImageMap from "@/shared/assets/images/missionImageMap";
import { missionNamesMap } from "./missionNameMap";
import { Link } from "react-router-dom";
import {
  useMissionStore,
  Mission,
} from "@/entities/Mission/model/missionModel";
import { formatNumber } from "@/shared/utils/formatNumber";
import LoadingSpinner from "@/shared/components/ui/loadingSpinner";
import { preloadImages } from "@/shared/utils/preloadImages";
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";
import Attendance from "@/widgets/Attendance/Attendance";
import { contactsViral } from "@apps-in-toss/web-framework";
import { getViralReward } from "@/entities/User/api/getViralReward";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/shared/components/ui";

interface RewardFromContactsViralEvent {
  type: "sendViral";
  data: {
    rewardAmount: number;
    rewardUnit: string;
  };
}

interface ContactsViralSuccessEvent {
  type: "close";
  data: {
    closeReason: "clickBackButton" | "noReward";
    sentRewardAmount?: number;
    sendableRewardsCount?: number;
    sentRewardsCount: number;
    rewardUnit?: string;
  };
}

type ContactsViralEvent =
  | RewardFromContactsViralEvent
  | ContactsViralSuccessEvent;

const MissionPage: React.FC = () => {
  const cleanupRef = useRef<(() => void) | null>(null); // contactsViral cleanup 함수를 useRef로 변경
  // 친구 초대 보상 모달 상태 추가
  const [showViralRewardModal, setShowViralRewardModal] =
    useState<boolean>(false);

  const handleInviteClick = async () => {
    playSfx(Audios.button_click);
    // console.log('🚀 친구초대 시작');
    // console.log('📍 현재 페이지:', window.location.href);
    // console.log('📍 User Agent:', navigator.userAgent);

    // 환경 체크 - 공식 문서 기반
    // console.log('🔍 환경 체크 시작');

    // 1. Toss 앱 환경 체크
    const isTossApp =
      navigator.userAgent.includes("Toss") ||
      (window as any).TossBridge ||
      (window as any).ReactNativeWebView;
    // console.log('📱 Toss 앱 환경 여부:', isTossApp);

    // 2. 모바일 환경 체크
    const isMobile =
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    // console.log('📱 모바일 환경 여부:', isMobile);

    // 3. contactsViral 함수 존재 여부 체크
    if (typeof contactsViral !== "function") {
      console.error("❌ contactsViral 함수를 찾을 수 없습니다");
      console.error("contactsViral 타입:", typeof contactsViral);
      console.error("전역 객체에서 확인:", (window as any).contactsViral);

      // 공식 문서: 하위 버전에서는 undefined 반환
      if (!isTossApp) {
        console.error(
          "⚠️ Toss 앱 환경이 아닙니다. contactsViral은 Toss 앱 5.223.0+ 버전에서만 지원됩니다."
        );
      }
      return;
    }

    // console.log('✅ contactsViral 함수 확인됨');

    // 4. 미니앱 승인 상태 체크 (간접적)
    if (!isTossApp) {
      console.warn(
        "⚠️ Toss 앱 환경이 아닙니다. 미니앱 승인이 필요한 기능입니다."
      );
      console.warn(
        "⚠️ 테스트 환경에서는 빈 화면으로 표시되고 실제 동작하지 않을 수 있습니다."
      );
    }

    try {
      // 기존 cleanup 함수가 있다면 호출
      if (cleanupRef.current) {
        // console.log('🧹 기존 cleanup 함수 실행');
        cleanupRef.current();
      }

      // console.log('📱 contactsViral API 호출 시작');
      // console.log('모듈 ID:', '5682bc17-9e30-4491-aed0-1cd0f1f36f4b');

      // contactsViral API 호출
      const cleanupFn = contactsViral({
        options: {
          moduleId: "5682bc17-9e30-4491-aed0-1cd0f1f36f4b", // 앱인토스 콘솔에서 설정한 moduleId로 변경 필요
        },
        onEvent: (event: ContactsViralEvent) => {
          if (event.type === "sendViral") {
            // console.log('리워드 지급:', event.data.rewardAmount, event.data.rewardUnit);
          } else if (event.type === "close") {
            // console.log('종료 사유:', event.data.closeReason);
            // console.log('공유 완료한 친구 수:', event.data.sentRewardsCount);

            // 공유 완료한 친구 수가 1명 이상이면 보상 API 호출
            if (
              event.data.sentRewardsCount &&
              event.data.sentRewardsCount >= 1
            ) {
              // console.log('🎁 친구 초대 보상 획득 시도:', event.data.sentRewardsCount, '명');

              getViralReward(event.data.sentRewardsCount)
                .then((response) => {
                  // console.log('✅ 친구 초대 보상 획득 성공:', response);

                  // message가 "Success"인 경우 모달창 표시
                  if (response.message === "Success") {
                    setShowViralRewardModal(true);
                  }
                })
                .catch((error) => {
                  console.error("❌ 친구 초대 보상 획득 실패:", error);
                });
            } else {
              // console.log('⚠️ 공유 완료한 친구가 없어 보상을 받을 수 없습니다');
            }
          }
        },
        onError: (error) => {
          console.error("에러 발생:", error);
        },
      });

      // console.log('✅ contactsViral API 호출 성공');
      // console.log('cleanup 함수 설정:', typeof cleanupFn);
      // console.log('cleanup 함수 내용:', cleanupFn);
      // console.log('이벤트 핸들러 등록 완료');
      // console.log('이제 친구 초대 모듈이 열릴 때까지 대기 중...');

      // cleanup 함수가 실제로 함수인지 확인
      if (typeof cleanupFn === "function") {
        // console.log('✅ cleanup 함수가 올바르게 반환됨');
        cleanupRef.current = cleanupFn;
      } else {
        console.error("❌ cleanup 함수가 올바르지 않음:", cleanupFn);
        console.error("cleanup 함수 타입:", typeof cleanupFn);
      }

      // API 호출 후 상태 확인
      setTimeout(() => {
        // console.log('⏰ 3초 후 상태 확인:');
        // console.log('cleanup 상태:', cleanupRef.current);
        // console.log('현재 페이지:', window.location.href);
        // console.log('이벤트 발생 여부 확인 중...');
        // contactsViral 모듈 상태 확인
        // console.log('🔍 contactsViral 모듈 상태 확인:');
        // console.log('cleanup 함수 존재 여부:', !!cleanupRef.current);
        // console.log('cleanup 함수 타입:', typeof cleanupRef.current);
        // 전역 객체에서 contactsViral 상태 확인
        // console.log('🌐 전역 객체 상태 확인:');
        // console.log('window.contactsViral:', (window as any).contactsViral);
        // console.log('window.TossBridge:', (window as any).TossBridge);
        // console.log('window.ReactNativeWebView:', (window as any).ReactNativeWebView);
      }, 3000);

      // 추가 상태 모니터링
      setTimeout(() => {
        // console.log('⏰ 10초 후 상태 확인:');
        // console.log('cleanup 상태:', cleanupRef.current);
        // console.log('현재 페이지:', window.location.href);
        // console.log('이벤트 발생 여부 확인 중...');
        // 전역 이벤트 리스너 확인
        // console.log('전역 이벤트 리스너 확인:');
        // console.log('window.addEventListener 리스너 수:', (window as any).__eventListeners?.length || '알 수 없음');
        // console.log('document.addEventListener 리스너 수:', (document as any).__eventListeners?.length || '알 수 없음');
      }, 10000);
    } catch (error) {
      console.error("💥 친구초대 실행 중 에러 발생");
      console.error("에러 상세:", error);
      console.error("에러 스택:", (error as Error).stack);
    }
  };
  const [isLoading, setIsLoading] = useState(true);
  const { playSfx } = useSound();
  const { missions, fetchMissions, clearMission } = useMissionStore();

  // 공통 텍스트 스타일 정의
  const commonTextStyle = {
    fontFamily: "'ONE Mobile POP', sans-serif",
    fontWeight: 400,
    WebkitTextStroke: "1px #000000",
  };

  const whiteTextStyle = {
    ...commonTextStyle,
    color: "#FFFFFF",
  };

  const yellowTextStyle = {
    ...commonTextStyle,
    color: "#FDE047",
  };

  // 보상 다이얼로그 상태
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rewardData, setRewardData] = useState<{
    diceReward: number;
    starReward: number;
    amount?: number;
    spinType: string;
  } | null>(null);

  // 로컬 스토리지에서 보상 표시된 미션 ID를 초기화
  const [rewardShownMissions, setRewardShownMissions] = useState<number[]>(
    () => {
      const stored = localStorage.getItem("rewardShownMissions");
      return stored ? JSON.parse(stored) : [];
    }
  );

  const mappedImages = Object.values(missionImageMap).flatMap((item) =>
    Images[item.imageKey] ? [Images[item.imageKey]] : []
  );

  const imagesToLoad = [
    Images.IconCheck,
    Images.LargeTwitter,
    Images.Star,
    Images.Dice,
    Images.InviteFriend,
    ...mappedImages,
  ];

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
  }, [imagesToLoad]);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  // 미션 클리어 시 보상 처리 (이미 보상 모달이 표시된 미션은 건너뜁니다)
  const handleMissionCleared = (mission: Mission) => {
    if (rewardShownMissions.includes(mission.id)) {
      return;
    }
    setRewardData({
      diceReward: mission.diceReward,
      starReward: mission.starReward,
      spinType: "MISSION",
    });
    // setIsDialogOpen(true);
    // 상태와 로컬 스토리지에 미션 ID 추가
    setRewardShownMissions((prev) => {
      const updated = [...prev, mission.id];
      localStorage.setItem("rewardShownMissions", JSON.stringify(updated));
      return updated;
    });
  };

  // const handleCloseDialog = () => {
  //   playSfx(Audios.button_click);
  //   setIsDialogOpen(false);
  //   setRewardData(null);
  // };

  const handleClearMission = async (id: number) => {
    await clearMission(id);
    const clearedMission = missions.find((m: { id: number }) => m.id === id);
    if (clearedMission) {
      handleMissionCleared(clearedMission);
    }
  };

  if (isLoading) {
    return <LoadingSpinner className="h-screen" />;
  }

  return (
    <div className="flex flex-col text-white mb-20 md:mb-96 min-h-screen mx-6">
      <TopTitle title="미션" />

      {/* 출석 위젯 */}
      <h1
        className="text-center mt-10"
        style={{
          ...whiteTextStyle,
          fontSize: "18px",
        }}
      >
        일일 출석
      </h1>
      <div className="mb-6">
        <Attendance />
      </div>

      <h1
        className="text-center mt-10"
        style={{
          ...whiteTextStyle,
          fontSize: "18px",
        }}
      >
        친구 초대
      </h1>
      <div className="invite-reward-box w-full h-[340px] rounded-3xl flex flex-col items-center justify-center mt-2 gap-4">
        <div className="flex flex-row items-center">
          <div className="flex flex-col items-center gap-2 justify-center">
            <img src={Images.KeyIcon} alt="star" className="h-16 w-16 mt-4" />
            <p
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              +10
            </p>
          </div>
        </div>

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
          친구를 초대하면,
          <br />
          <span
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: "18px",
              fontWeight: 400,
              color: "#FEE900",
              WebkitTextStroke: "1px #000000",
            }}
          >
            열쇠 10개
          </span>
          <span
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: "18px",
              fontWeight: 400,
              color: "#FFFFFF",
              WebkitTextStroke: "1px #000000",
            }}
          >
            를 즉시 지급!
          </span>
        </p>

        <p
          className="mt-2 text-center"
          style={{
            fontFamily: "'ONE Mobile POP', sans-serif",
            fontSize: "12px",
            fontWeight: 400,
            color: "#FFFFFF",
            WebkitTextStroke: "1px #000000",
          }}
        >
          지금 바로 친구를 초대하고,
          <br />
          열쇠로 랜덤박스를 열어 다양한 보상을 받아보세요!
        </p>

        <button
          className="flex relative items-center justify-center rounded-[10px] font-medium h-14 w-[300px]"
          onClick={handleInviteClick}
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
          친구를 초대하면 보상이 팡팡!
        </button>
      </div>

      <div className="my-10"></div>

      {/* 친구 초대 보상 모달 */}
      <Dialog
        open={showViralRewardModal}
        onOpenChange={setShowViralRewardModal}
      >
        <DialogContent
          className="border-none rounded-3xl text-white h-svh overflow-x-hidden font-semibold overflow-y-auto max-w-[90%] md:max-w-lg max-h-[60%]"
          style={{
            background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="flex flex-col items-center justify-around h-full">
            <div className="flex flex-col items-center gap-6">
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
                친구 초대 보상
              </h1>

              <div className="flex items-center justify-center w-16 h-16">
                <img
                  src={Images.KeyIcon}
                  alt="Key Icon"
                  className="w-16 h-16"
                />
              </div>

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
                친구를 초대하고 열쇠를 획득하였습니다!
              </p>
            </div>

            <button
              onClick={() => setShowViralRewardModal(false)}
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
    </div>
  );
};

export default MissionPage;
