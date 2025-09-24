import React from "react";
import { useNavigate } from "react-router-dom";
import { TopTitle } from "@/shared/components/ui";
import Images from "@/shared/assets/images";

const RewardInfo: React.FC = () => {
  const navigate = useNavigate();

  const handleChallengeClick = () => {
    // 스크롤을 상단으로 이동
    window.scrollTo({ top: 0, behavior: "smooth" });

    // 주사위 이벤트 페이지로 이동
    navigate("/dice-event");
  };

  return (
    <div className="min-h-screen mb-20 flex-col items-center mx-2 relative pt-20">
      <TopTitle title="보상 지급 안내" back={true} />

      {/* 메인 카드 */}
      <div
        className="w-full max-w-sm mt-8 px-6 py-8 relative z-10"
        style={{
          background: "rgba(255,255,255,0.65)",
          borderRadius: 20,
          boxShadow: "0px 2px 2px 0px rgba(0,0,0,0.4)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        {/* 메인 슬로건 */}
        <div className="text-center mb-6">
          <h2
            className="mb-4"
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: "30px",
              fontWeight: 400,
              color: "#FDE047",
              WebkitTextStroke: "1px #000000",
            }}
          >
            주사위를 던지고,
            <br />
            아이패드를 잡아라!
          </h2>

          <p
            className="leading-relaxed"
            style={{
              color: "#FFFFFF",
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: "12px",
              fontWeight: "400",
              WebkitTextStroke: "1px #000000",
            }}
          >
            "럭키다이스가 toss 런칭을 기념하여
            <br /> 특별 이벤트를 진행합니다.
            <br />
            주사위를 굴려 포인트를 획득하고
            <br />타 유저들과 경쟁하여 경품을 받아가세요!"
          </p>
        </div>

        {/* 이벤트 정보 섹션들 */}
        <div className="space-y-4 mb-6">
          {/* 이벤트 기간 */}
          <div className="flex items-start">
            <div>
              <h3
                className="mb-2"
                style={{
                  color: "#FFFFFF",
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "16px",
                  fontWeight: "400",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                ✅ 이벤트 기간
              </h3>
              <ul
                className="space-y-1"
                style={{
                  color: "#FFFFFF",
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "12px",
                  fontWeight: "400",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                <li>- 런칭 시점으로부터 45일간 진행</li>
                <li>* 게임 상단에서 이벤트 잔여 기간 확인이 가능합니다.</li>
                <li>* 결과 발표 및 지급은 11월 말 진행 예정입니다.</li>
              </ul>
            </div>
          </div>

          {/* 경품 */}
          <div className="flex items-start">
            <div>
              <h3
                className="mb-2"
                style={{
                  color: "#FFFFFF",
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "16px",
                  fontWeight: "400",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                ✅ 경품
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <img
                    src={Images.JamIcon}
                    alt="jam-icon"
                    className="w-5 h-5"
                  />
                  <span
                    className=""
                    style={{
                      fontFamily: "'ONE Mobile POP', sans-serif",
                      color: "#FFFFFF",
                      fontSize: "12px",
                      fontWeight: "400",
                      WebkitTextStroke: "1px #000000",
                    }}
                  >
                    1-3등: 아이패드
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <img src={Images.Raffle} alt="raffle" className="w-5 h-5" />
                  <span
                    className=""
                    style={{
                      fontFamily: "'ONE Mobile POP', sans-serif",
                      fontSize: "12px",
                      color: "#FFFFFF",
                      fontWeight: "400",
                      WebkitTextStroke: "1px #000000",
                    }}
                  >
                    4-100등: 가정용 전자기기
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 경품 지급 방법 */}
          <div className="flex items-start">
            <div>
              <h3
                className="mb-2"
                style={{
                  color: "#FFFFFF",
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "16px",
                  fontWeight: "400",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                ✅ 경품 지급 방법
              </h3>
              <ul
                className="space-y-1"
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "12px",
                  fontWeight: "400",
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                <li>- 당첨자 선정 및 발표 → 11월 내 경품제공</li>
                <li>* 당첨자에게는 개별 안내드릴 예정입니다.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 마지막 메시지 */}
        <div className="text-center mb-6">
          <p
            className=""
            style={{
              color: "#FFFFFF",
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: "12px",
              fontWeight: "400",
              WebkitTextStroke: "1px #000000",
            }}
          >
            여러분도 경품의 주인공이 되실 수 있습니다.
            <br /> 지금 바로 도전하세요!
          </p>
        </div>

        <button
          onClick={handleChallengeClick}
          className="flex relative items-center justify-center h-14 mt-8 w-full rounded-[10px]"
          style={{
            background:
              "linear-gradient(180deg, #50B0FF 0%, #50B0FF 50%, #008DFF 50%, #008DFF 100%)",
            border: "2px solid #76C1FF",
            outline: "2px solid #000000",
            boxShadow:
              "0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 3px 0px 0px rgba(0, 0, 0, 0.1)",
            fontFamily: "'ONE Mobile POP', sans-serif",
            fontSize: "18px",
            fontWeight: "400",
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
          지금 바로 도전하기
        </button>
      </div>
    </div>
  );
};

export default RewardInfo;
