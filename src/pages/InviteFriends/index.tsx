import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TopTitle } from "@/shared/components/ui";
import "./InviteFriends.css";
import Images from "@/shared/assets/images";
import { BiCopy } from "react-icons/bi";
import LoadingSpinner from "@/shared/components/ui/loadingSpinner";
import getFriends from "@/entities/Mission/api/friends";
import { formatNumber } from "@/shared/utils/formatNumber";
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";
import { contactsViral } from "@apps-in-toss/web-framework";

// contactsViral 이벤트 타입 정의 - 공식 문서 기반으로 수정
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

interface TruncateMiddleProps {
  text: string;
  maxLength: number;
  className?: string;
}

// 주소 중간 생략
const TruncateMiddle: React.FC<TruncateMiddleProps> = ({
  text,
  maxLength,
  className,
}) => {
  const truncateMiddle = (str: string, maxLen: number): string => {
    if (str.length <= maxLen) return str;

    const charsToShow = maxLen - 3; // 3 characters for "..."
    const frontChars = Math.ceil(charsToShow / 2);
    const backChars = Math.floor(charsToShow / 2);

    return (
      str.substr(0, frontChars) + "..." + str.substr(str.length - backChars)
    );
  };

  const truncatedText = truncateMiddle(text, maxLength);

  return <div className={`font-semibold ${className}`}>{truncatedText}</div>;
};

interface Friend {
  userId: string;
}

const InviteFriends: React.FC = () => {
  const navigate = useNavigate();
  const { playSfx } = useSound();
  const [copySuccess, setCopySuccess] = useState<string>(""); // 클립보드 복사 결과 메시지
  const [referralLink, setReferralLink] = useState<string>(""); // 레퍼럴 코드 상태
  const [friends, setFriends] = useState<Friend[]>([]); // 친구 목록 상태
  const [loading, setLoading] = useState<boolean>(true); // 로딩 상태
  const cleanupRef = useRef<(() => void) | null>(null); // contactsViral cleanup 함수를 useRef로 변경

  // 클립보드 복사 함수
  const copyToClipboard = async () => {
    playSfx(Audios.button_click);

    try {
      await navigator.clipboard.writeText(referralLink);
      setCopySuccess("Copied to clipboard!");
      setTimeout(() => setCopySuccess(""), 2000); // 2초 후에 알림 메시지 제거
    } catch (err) {
      setCopySuccess("Failed to copy!");
    }
  };

  // 친구 목록 새로고침 함수
  const fetchFriendsData = async () => {
    try {
      const data = await getFriends(); // API 호출
      setReferralLink(data.referralCode.referralUrl); // 레퍼럴 코드 설정
      setFriends(data.friends || []); // 친구 목록 설정 (없으면 빈 배열)
      setLoading(false); // 로딩 완료
    } catch (error) {
      // console.error('Error fetching friends data:', error);
      setLoading(false); // 에러 시 로딩 종료
    }
  };

  // 페이지 로드 시 API 호출
  useEffect(() => {
    fetchFriendsData();
  }, []);

  // 기존 Web Share API 방식으로 fallback
  const fallbackToWebShare = async () => {
    // console.log('🔄 Web Share API fallback 시작');

    try {
      const shareData = {
        title: "Awesome App Invitation",
        text: "Join me on this awesome app! Use my referral link:",
        url: referralLink,
      };

      // console.log('공유 데이터:', shareData);

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        // console.log('📤 네이티브 공유 API 사용');
        await navigator.share(shareData);
        // console.log('✅ 네이티브 공유 완료');
      } else {
        // console.log('📋 클립보드 복사로 fallback');
        await navigator.clipboard.writeText(referralLink);
        setCopySuccess("Referral link copied to clipboard!");
        setTimeout(() => setCopySuccess(""), 2000);
        // console.log('✅ 클립보드 복사 완료');
      }
    } catch (error) {
      console.error("❌ fallback 공유 실패:", error);
    }
  };

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

      fallbackToWebShare();
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
      // 에러 발생 시 기존 공유 방식으로 fallback
      fallbackToWebShare();
    }
  };

  // 컴포넌트 언마운트 시 cleanup 실행
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  // 로딩 상태 처리
  if (loading) {
    return <LoadingSpinner className="h-screen" />;
  }

  return (
    <div className="flex flex-col mx-6 mb-44 text-white items-center min-h-screen pt-20">
      <TopTitle title="친구 초대" back={true} />

      <div className="invite-reward-box w-full md:w-[500px] h-[332px] rounded-3xl flex flex-col items-center justify-center mt-9 gap-4">
        <div className="flex flex-row items-center">
          <div className="flex flex-col items-center gap-2 justify-center">
            <img src={Images.KeyIcon} alt="star" className="h-16 w-16" />
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
          className="mt-2"
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
          className="h-14 w-[302px] rounded-full my-5"
          onClick={handleInviteClick}
          style={{
            background: "linear-gradient(180deg, #50B0FF 0%, #008DFF 100%)",
            border: "2px solid #76C1FF",
            boxShadow:
              "0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 3px 0px 0px rgba(0, 0, 0, 0.1)",
          }}
        >
          친구를 초대하면 보상이 팡팡!
        </button>
      </div>

      {friends.length > 0 ? ( // 친구 목록이 존재하는 경우에만 렌더링
        <div className="flex flex-col mt-8 w-full gap-3">
          <div className="flex flex-row justify-between items-center mb-[6px]">
            <p
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "18px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              초대된 친구
            </p>
            <div
              className="flex items-center justify-center text-sm font-medium w-[72px] h-8 rounded-full bg-[#21212f]"
              onClick={() => {
                playSfx(Audios.button_click);
                navigate("/invite-friends-list");
              }}
            >
              Total : <span className="text-[#FDE047]">{friends.length}</span>
            </div>
          </div>
          {friends.map((friend, index) => (
            <div
              key={index}
              className="rounded-3xl flex flex-row items-center justify-start gap-4 h-16 text-base font-medium px-5"
              style={{
                background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
                borderRadius: "24px",
                boxShadow: "none",
              }}
            >
              <p
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "18px",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                {index + 1}
              </p>
              <p
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "12px",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                {friend.userId}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p
          className="mt-8"
          style={{
            fontFamily: "'ONE Mobile POP', sans-serif",
            fontSize: "14px",
            fontWeight: 400,
            color: "#FFFFFF",
            WebkitTextStroke: "1px #000000",
          }}
        >
          친구를 초대하세요!
        </p> // 친구가 없을 경우
      )}
    </div>
  );
};

export default InviteFriends;
