import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TopTitle } from "@/shared/components/ui";
import LoadingSpinner from "@/shared/components/ui/loadingSpinner";
import Images from "@/shared/assets/images";
import { FaChevronRight } from "react-icons/fa";
import getFriends from "@/entities/Mission/api/friends";
import getFriendsReward from "@/entities/Asset/api/friendsReward";
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";

interface Friend {
  userId: string;
}

const InviteFriendsList: React.FC = () => {
  const navigate = useNavigate();
  const { playSfx } = useSound();
  const [friends, setFriends] = useState<Friend[]>([]); // 친구 목록 상태
  const [loading, setLoading] = useState<boolean>(true); // 로딩 상태
  const [star, setStar] = useState(0.0);
  const [sl, setSL] = useState(0.0);
  const [usdt, setUsdt] = useState(0.0);

  useEffect(() => {
    const fetchFriendsData = async () => {
      try {
        const data = await getFriends(); // API 호출
        const reward = await getFriendsReward();
        setFriends(data.friends || []); // 친구 목록 설정 (없으면 빈 배열)
        setStar(reward.starTotal);
        setSL(reward.slTotal);
        setUsdt(reward.usdtTotal);
        setLoading(false); // 로딩 완료
      } catch (error) {
        // console.error('Error fetching friends data:', error);
        setLoading(false); // 에러 시 로딩 종료
      }
    };

    fetchFriendsData();
  }, []);

  // 로딩 상태 처리
  if (loading) {
    return <LoadingSpinner className="h-screen" />;
  }

  // 숫자 콤마(,) 표기를 위한 변환: toLocaleString()
  const formattedStar = star.toLocaleString();
  const formattedSL = sl.toLocaleString();
  const formattedUSDT = usdt.toLocaleString();

  return (
    <div className="flex flex-col items-center text-white mx-6 relative min-h-screen pb-32">
      {/* 상단 타이틀 */}
      <TopTitle title="친구 초대 리스트" back={true} />

      {/* 레퍼럴 보상 내용 */}
      <div className="w-full">
        <div className="flex justify-between items-center">
          <h2
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: "18px",
              fontWeight: 400,
              color: "#FFFFFF",
              WebkitTextStroke: "1px #000000",
            }}
          >
            누적 추천 보상
          </h2>
          <button
            className="flex items-center text-white text-xs font-medium"
            onClick={() => {
              playSfx(Audios.button_click);
              navigate("/referral-rewards");
            }}
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: "14px",
              fontWeight: 400,
              color: "#FFFFFF",
              WebkitTextStroke: "1px #000000",
            }}
          >
            상세 보기 <FaChevronRight className="ml-1 w-3 h-3" />
          </button>
        </div>
        <div
          className="rounded-3xl flex flex-col justify-center gap-4 h-[62px] mt-3"
          style={{
            backgroundColor: "rgba(0, 136, 255, 0.75)",
            padding: "16px 10px 16px 10px",
            gap: "4px",
            boxShadow: "0px 2px 2px 0px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div className="flex items-center">
            <img
              src={Images.StarIcon}
              alt="Points Earned"
              className="w-[44px] h-[44px]"
            />
            <p
              className=" flex-1 ml-12"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              획득 포인트
            </p>
            <p
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "18px",
                fontWeight: 400,
                color: "#FEE900",
                WebkitTextStroke: "1px #000000",
              }}
            >
              +{formattedStar}P
            </p>
          </div>
          {/* <div className="flex items-center">
            <img src={Images.SLToken} alt="SL Earned" className="w-6 h-6" />
            <p className="text-base font-medium flex-1 ml-1">
              {t("mission_page.sl")}
            </p>
            <p className="text-[#3B82F6] text-lg font-semibold">
              +{formattedSL}SLT
            </p>
          </div>
          <div className="flex items-center">
            <img src={Images.USDT} alt="USDT Earned" className="w-6 h-6" />
            <p className="text-base font-medium flex-1 ml-1">
              {t("mission_page.usdt")}
            </p>
            <p className="text-[#3B82F6] text-lg font-semibold">
              +{formattedUSDT}USDT
            </p>
          </div> */}
        </div>
      </div>

      {/* 초대한 친구 목록 */}
      {friends.length > 0 ? ( // 친구 목록이 존재하는 경우에만 렌더링
        <div className="flex flex-col mt-12 w-full gap-3">
          <div className="flex flex-row justify-between items-center mb-[6px]">
            <p
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "18px",
                fontWeight: 400,
                color: "#FEE900",
                WebkitTextStroke: "1px #000000",
              }}
            >
              초대된 친구
            </p>
            <div className="flex items-center justify-center text-sm font-medium w-[72px] h-8 rounded-full bg-[#21212f]">
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
                className="text-[#D4D4D4]"
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "18px",
                  fontWeight: 400,
                  color: "#FEE900",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                {index + 1}
              </p>
              <p
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#FEE900",
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
          className="text-gray-400 mt-8"
          style={{
            fontFamily: "'ONE Mobile POP', sans-serif",
            fontSize: "12px",
            fontWeight: 400,
            color: "#FEE900",
            WebkitTextStroke: "1px #000000",
          }}
        >
          친구를 초대하세요!
        </p> // 친구가 없을 경우
      )}
    </div>
  );
};

export default InviteFriendsList;
