import React from "react";
import { useNavigate } from "react-router-dom";
import Images from "@/shared/assets/images";
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";
import getPromotion from "@/entities/User/api/getPromotion";

const FirstRewardPage: React.FC = () => {
  const navigate = useNavigate();
  const { playSfx } = useSound();

  const handleReceiveReward = async () => {
    playSfx(Audios.button_click);
    const ref = localStorage.getItem("referralCode");
    if (ref === "dapp-portal-promotions") {
      try {
        const promo = await getPromotion();

        if (promo === "Success") {
          navigate("/promotion");
        } else {
          navigate("/dice-event");
        }
      } catch (error: any) {
        // console.error("[AppInitializer] 프로모션 수령 여부 확인 중 에러: ", error);
      }
    } else {
      navigate("/dice-event");
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* 스크롤 되는 상단 영역 */}
      <div className="flex-1 overflow-y-auto px-6 pt-10 text-white">
        {/* 상단 메시지 */}
        <h1
          className="text-center mt-[120px]"
          style={{
            fontFamily: "'ONE Mobile POP', sans-serif",
            fontSize: "24px",
            fontWeight: 400,
            lineHeight: "24px",
            letterSpacing: "-2.5%",
            color: "#fff",
            WebkitTextStroke: "2px #000",
            textAlign: "center",
            display: "block",
          }}
        >
          이제 시작해볼까요? <br />
          게임을 시작하기 위한 보상을 준비했어요!
        </h1>

        {/* 보상 아이콘 */}
        <div className="mt-6 flex justify-center gap-2">
          <div
            style={{
              width: "115px",
              height: "120px",
              background: "rgba(255,255,255,0.65)",
              borderRadius: 20,
              boxShadow: "0px 2px 2px 0px rgba(0,0,0,0.4)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={Images.StarIcon}
              alt="reward-icon"
              className="w-[62px] h-[62px]"
            />
            <span
              style={{
                marginTop: 8,
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "12px",
                fontWeight: 400,
                lineHeight: "15px",
                letterSpacing: "-2.5%",
                color: "#fff",
                WebkitTextStroke: "1px #000",
                textAlign: "center",
                display: "block",
              }}
            >
              +7,777
            </span>
          </div>
          <div
            style={{
              width: "115px",
              height: "120px",
              background: "rgba(255,255,255,0.65)",
              borderRadius: 20,
              boxShadow: "0px 2px 2px 0px rgba(0,0,0,0.4)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={Images.KeyIcon}
              alt="reward-icon"
              className="w-[62px] h-[62px]"
            />
            <span
              style={{
                marginTop: 8,
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "12px",
                fontWeight: 400,
                lineHeight: "15px",
                letterSpacing: "-2.5%",
                color: "#fff",
                WebkitTextStroke: "1px #000",
                textAlign: "center",
                display: "block",
              }}
            >
              +10
            </span>
          </div>
          <div
            style={{
              width: "115px",
              height: "120px",
              background: "rgba(255,255,255,0.65)",
              borderRadius: 20,
              boxShadow: "0px 2px 2px 0px rgba(0,0,0,0.4)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={Images.DiceIcon}
              alt="reward-icon"
              className="w-[62px] h-[62px]"
            />
            <span
              style={{
                marginTop: 8,
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "12px",
                fontWeight: 400,
                lineHeight: "15px",
                letterSpacing: "-2.5%",
                color: "#fff",
                WebkitTextStroke: "1px #000",
                textAlign: "center",
                display: "block",
              }}
            >
              +10
            </span>
          </div>
        </div>
      </div>

      {/* 하단 버튼 영역 고정 */}
      <div className="w-full px-6 pb-6 flex justify-center">
        <button
          className="font-medium h-14 w-full rounded-[10px] relative"
          type="button"
          onClick={handleReceiveReward}
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
    </div>
  );
};

export default FirstRewardPage;
