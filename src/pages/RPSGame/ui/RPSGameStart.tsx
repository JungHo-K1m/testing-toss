// src/pages/RPSGame/ui/RPSGameStart.tsx

import React, { useState } from "react";

import Images from "@/shared/assets/images";
import { formatNumber } from "@/shared/utils/formatNumber";
import { useRPSGameStore } from "../store";

interface RPSGameStartProps {
  onStart: () => void;
  allowedBetting: number;
  onCancel: () => void;
}

const RPSGameStart: React.FC<RPSGameStartProps> = ({
  onStart,
  allowedBetting,
  onCancel,
}) => {
  const [betAmount, setBetAmount] = useState<string>("");
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const setBetAmountStore = useRPSGameStore((state) => state.setBetAmount);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const numericValue = parseInt(value);

    // 빈 값이거나 숫자인 경우에만 입력 허용 (100단위 제한 제거)
    if (
      value === "" ||
      (/^\d+$/.test(value) && numericValue <= allowedBetting + 1)
    ) {
      setBetAmount(value);
      // console.log(`betAmount set to: ${value}`);
    }
  };

  const handleStartClick = (
    event:
      | React.FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault(); // 기본 폼 제출을 막습니다.

    // 빈 값 체크
    if (!betAmount || betAmount.trim() === "") {
      setAlertMessage("베팅 금액을 입력해주세요.");
      setIsAlertOpen(true);
      return;
    }

    const amount = parseInt(betAmount);

    // 유효한 숫자인지 체크
    if (isNaN(amount) || amount <= 0) {
      setAlertMessage("유효한 베팅 금액을 입력해주세요.");
      setIsAlertOpen(true);
      return;
    }

    // 100단위 검증 추가
    if (amount % 100 !== 0) {
      setAlertMessage("베팅 금액은 100단위로 입력해주세요.");
      setIsAlertOpen(true);
      return;
    }

    if (amount > 0 && amount <= allowedBetting + 1) {
      // console.log("Starting game with betAmount:", amount);
      setBetAmountStore(amount); // betAmount를 설정
      setIsAlertOpen(false); // 알림 모달 닫기
      onStart(); // 게임 시작
    } else {
      setAlertMessage(
        `The betting amount must be at least 1 star and up to a maximum of ${
          allowedBetting + 1
        } stars.`
      );
      setIsAlertOpen(true);
    }
  };

  const handleCancelClick = () => {
    onCancel(); // 취소 시 호출하여 주사위 게임으로 돌아감
    // console.log("Game canceled by user");
  };

  return (
    <>
      {/* 배경 블러 오버레이 */}
      {isPopoverOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{
            backdropFilter: "blur(4px)",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          }}
        />
      )}

      <div className="h-screen md:min-w-[600px] flex flex-col items-center justify-center px-12">
        <h1
          className="text-center mt-4 whitespace-nowrap"
          style={{
            fontFamily: "'ONE Mobile POP', sans-serif",
            fontSize: "30px",
            fontWeight: 400,
            color: "#FDE047",
            WebkitTextStroke: "1px #000000",
          }}
        >
          삼세판의 승부!
          <br />
          당신의 기회를 돌려보세요!
        </h1>

        <div className="flex flex-col items-center justify-center mt-4">
          <img src={Images.RPSExample} alt="RPSExample" className="w-[300px]" />

          <div className="flex flex-row gap-3 mt-6">
            <button
              className="flex flex-row gap-1 rounded-[56px] text-center font-medium w-[165px] h-[72px] items-center justify-center"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
                background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
                boxShadow:
                  "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
              }}
              onClick={() => setIsPopoverOpen(true)}
            >
              <img src={Images.InfoBtn} alt="InfoBtn" className="w-6 h-6" />
              <p>게임 방법</p>
            </button>

            <div
              className="flex flex-col gap-1 rounded-[56px] text-center font-medium w-[165px] h-[72px] items-center justify-center"
              style={{
                background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
                boxShadow:
                  "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
              }}
            >
              <p
                className="text-xs"
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "10px",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                내 포인트
              </p>
              <div className="flex flex-row items-center justify-center gap-1">
                <img
                  src={Images.StarIcon}
                  alt="Star"
                  className="w-[24px] h-[24px]"
                />
                <p
                  style={{
                    fontFamily: "'ONE Mobile POP', sans-serif",
                    fontSize: "16px",
                    fontWeight: 400,
                    color: "#FFFFFF",
                    WebkitTextStroke: "1px #000000",
                  }}
                >
                  {formatNumber(allowedBetting)}
                </p>
              </div>
              <span
                className="text-center text-xs"
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "8px",
                  fontWeight: 400,
                  color: "#FDE047",
                  WebkitTextStroke: "0.5px #000000",
                }}
              >
                베팅가능: {formatNumber(allowedBetting)}
              </span>
            </div>
          </div>
          <form onSubmit={handleStartClick}>
            <input
              placeholder="베팅할 별 개수를 입력하세요!(100단위로 입력)"
              type="number"
              step="100"
              min="100"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              max={allowedBetting}
              className="h-12 px-4 mt-4 w-[342px] text-start"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "12px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
                borderRadius: "44px",
                border: "none",
                background: "#0088FFBF",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                boxShadow: "inset 0px 0px 4px 3px rgba(255, 255, 255, 0.6)",
              }}
            />

            <div className="flex flex-row mt-4 gap-3">
              <button
                className="font-medium h-14 w-[160px] rounded-[10px] relative"
                type="button"
                onClick={onCancel}
                style={{
                  background:
                    "linear-gradient(180deg, #FF6D70 0%, #FF6D70 50%, #FF2F32 50%, #FF2F32 100%)",
                  border: "2px solid #FF8E8E",
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
                  src={Images.ButtonPointRed}
                  alt="button-point-red"
                  style={{
                    position: "absolute",
                    top: "3px",
                    left: "3px",
                    width: "8.47px",
                    height: "6.3px",
                    pointerEvents: "none",
                  }}
                />
                취소
              </button>
              <button
                type="button"
                className={`font-medium h-14 w-[160px] rounded-[10px] relative ${
                  !betAmount || parseInt(betAmount) <= 0
                    ? "opacity-70 cursor-not-allowed"
                    : ""
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
                  opacity: !betAmount || parseInt(betAmount) <= 0 ? 0.7 : 1,
                }}
                disabled={!betAmount || parseInt(betAmount) <= 0}
                onClick={handleStartClick}
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
                베팅
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 게임 가이드 모달 */}
      {isPopoverOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="rounded-3xl max-w-lg w-full mx-4 max-h-[65vh] overflow-y-auto"
            style={{
              background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
              boxShadow:
                "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
            }}
          >
            <div className="p-4 rounded-lg shadow-lg w-full">
              <div className="flex justify-between items-center mb-4">
                <h2
                  className="text-start"
                  style={{
                    fontFamily: "'ONE Mobile POP', sans-serif",
                    fontSize: "12px",
                    fontWeight: 400,
                    color: "#FDE047",
                    WebkitTextStroke: "1px #000000",
                  }}
                >
                  ✼ 게임 방법 ✼
                </h2>
                <button
                  onClick={() => setIsPopoverOpen(false)}
                  className="text-white hover:text-gray-300 text-xl font-bold"
                >
                  ×
                </button>
              </div>
              <ol
                className="leading-loose space-y-4"
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "12px",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                <li>
                  <strong>1. 베팅하기</strong>
                  <ul className="list-disc pl-5">
                    <li>
                      행운을 시험해보세요! 최대 27배 보상까지!
                      <br />
                      원하는 스타 수를 입력해주세요.
                      <br />
                      베팅은 보유 스타의 절반까지 가능합니다.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>2. 가위바위보 진행</strong>
                  <ul className="list-disc pl-5">
                    <li>
                      각 라운드마다 가위, 바위, 보 중 하나를 선택하세요. <br />{" "}
                      최대 3라운드까지 진행됩니다.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>3. 보상 받기</strong>
                  <ul className="list-disc pl-5">
                    <li>
                      한 번이라도 승리하면 보상은 3배! <br /> 3연승 시 최대
                      27배까지 보상이 누적됩니다.
                      <br />
                      (예: 1라운드 승리 시 3배 → 2라운드 승리 시 9배 → 3라운드
                      승리 시 27배)
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>4. 계속 도전 or 보상 수령 결정</strong>
                  <ul className="list-disc pl-5">
                    <li>
                      매 라운드 승리 후, 도전을 계속할지 보상을 받을지
                      선택하세요.
                      <br />
                      단, 한 번이라도 패배하면 모든 베팅이 사라집니다
                    </li>
                  </ul>
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* 안내 모달 */}
      {isAlertOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div
            className="rounded-[24px] max-w-md w-full mx-4 p-6"
            style={{
              background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
              boxShadow:
                "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2
                className="text-start"
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "24px",
                  fontWeight: 400,
                  color: "#FDE047",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                안내
              </h2>
              <button
                onClick={() => setIsAlertOpen(false)}
                className="text-white hover:text-gray-300 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <p
              className="text-center mb-4"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "18px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              {alertMessage}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default RPSGameStart;
