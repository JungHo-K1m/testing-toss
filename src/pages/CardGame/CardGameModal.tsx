import React, { useState, useEffect } from "react";
import { useUserStore } from "@/entities/User/model/userModel";
import { FaRegQuestionCircle } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";
import Images from "@/shared/assets/images";
import ReactCardFlip from "react-card-flip";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/shared/api/axiosInstance";
import {
  flipCard,
  CardFlipRequest,
  CardFlipResponseData,
} from "@/features/DiceEvent/api/cardFlipApi";
import { useAdMob } from "@/hooks/useAdMob";
import { getPlatform } from "@/types/adMob";

const COLORS: ("RED" | "BLACK")[] = ["RED", "BLACK"];
const SUITS = [
  { label: "Spade", value: "SPADE", color: "BLACK" },
  { label: "Diamond", value: "DIAMOND", color: "RED" },
  { label: "Heart", value: "HEART", color: "RED" },
  { label: "Club", value: "CLUB", color: "BLACK" },
];

const CARD_IMAGES = [
  { suit: "DIAMOND", url: Images.CardDiamond },
  { suit: "SPADE", url: Images.CardSpade },
  { suit: "HEART", url: Images.CardHeart },
  { suit: "CLUB", url: Images.CardClover },
];

const AnimatedCard = () => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % CARD_IMAGES.length);
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <img
      src={CARD_IMAGES[index].url}
      alt={CARD_IMAGES[index].suit}
      className="w-[200px] h-[280px] rounded-xl shadow-lg bg-transparent mb-6 object-cover border-none"
    />
  );
};

const CardBettingModal = ({ myPoint, allowedBetting, onStart, onCancel }: any) => {
  const [bet, setBet] = useState("");
  const [error, setError] = useState("");
  const [showGameGuide, setShowGameGuide] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");

  // 디버깅을 위한 로깅
  console.log("CardBettingModal 렌더링:", { myPoint, allowedBetting });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const numericValue = parseInt(value);

    console.log("=== 입력값 변화 ===");
    console.log("입력된 값:", value);
    console.log("숫자 변환 결과:", numericValue);
    console.log("베팅 가능 금액:", allowedBetting);
    console.log(
      "입력 허용 조건:",
      value === "" || (/^\d+$/.test(value) && numericValue <= allowedBetting)
    );

    // 빈 값이거나 숫자인 경우에만 입력 허용 (100단위 제한 제거)
    if (value === "" || (/^\d+$/.test(value) && numericValue <= allowedBetting)) {
      setBet(value);
      console.log("✅ 입력값 설정됨:", value);
      console.log("현재 bet 상태:", value);
      console.log("bet 상태 타입:", typeof value);
    } else {
      console.log("❌ 입력값 거부됨:", value);
    }
  };

  const handleBet = () => {
    console.log("=== 베팅 시도 ===");
    console.log("입력된 베팅 금액:", bet);
    console.log("입력된 베팅 금액 (숫자):", Number(bet));
    console.log("보유 포인트:", myPoint);
    console.log("베팅 버튼 클릭됨!");

    const amount = Number(bet);

    // 100단위 검증
    if (amount % 100 !== 0) {
      console.log("❌ 100단위 검증 실패:", amount, "는 100의 배수가 아님");
      console.log("모달창 열기 시도...");
      setAlertMessage("베팅 금액은 100단위로 입력해주세요.");
      setIsAlertOpen(true);
      console.log("모달창 상태:", isAlertOpen);
      return;
    }
    console.log("✅ 100단위 검증 통과:", amount, "는 100의 배수");

    if (amount > allowedBetting) {
      console.log("❌ 베팅 가능 금액 초과:", amount, ">", allowedBetting);
      console.log("모달창 열기 시도...");
      setAlertMessage("베팅 가능한 금액보다 많이 입력하였습니다.");
      setIsAlertOpen(true);
      console.log("모달창 상태:", isAlertOpen);
      return;
    }
    console.log("✅ 베팅 가능 금액 검증 통과:", amount, "<=", allowedBetting);

    // 모든 검증을 통과한 경우 에러와 알림 초기화
    console.log("�� 모든 검증 통과! 게임 시작:", amount);
    setError("");
    setIsAlertOpen(false);
    onStart(amount);
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center px-12">
      {/* 1. 상단 타이틀 */}
      <div
        className="text-center mt-4"
        style={{
          fontFamily: "'ONE Mobile POP', sans-serif",
          fontSize: "30px",
          fontWeight: "400",
          color: "#FDE047",
          WebkitTextStroke: "1px #000000",
          lineHeight: "36px",
        }}
      >
        당신의 선택이
        <br />
        승부를 가릅니다!
      </div>
      {/* 2. 카드 애니메이션 */}
      <div className="flex flex-col items-center justify-center mt-4 mb-2">
        <AnimatedCard />
      </div>
      {/* 3. 설명/포인트 영역 - 중앙으로 이동 */}
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="flex flex-row gap-3">
          <button
            className="flex flex-row gap-1 rounded-[56px] text-center w-[165px] h-[72px] items-center justify-center"
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: "14px",
              fontWeight: "400",
              color: "#FFFFFF",
              WebkitTextStroke: "1px #000000",
              background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
              boxShadow:
                "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
            }}
            onClick={() => setShowGameGuide(true)}
          >
            <img src={Images.QuestionCircle} className="w-[30px] h-[30px]" />
            게임 방법
          </button>
          <div
            className="flex flex-col gap-1 rounded-[56px] text-center w-[165px] h-[72px] items-center justify-center"
            style={{
              background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
              boxShadow:
                "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
            }}
          >
            <span
              className="text-center"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "14px",
                fontWeight: "400",
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              베팅 가능
            </span>
            <div className="flex flex-row items-center justify-center gap-3">
              <img
                src={Images.StarIcon}
                alt="Star"
                className="w-[30px] h-[30px]"
              />
              <span
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "18px",
                  fontWeight: "400",
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                {(allowedBetting || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        
        {/* 4. 배팅 입력 */}
        <form
          className="w-full"
          onSubmit={(e) => {
            console.log("폼 제출 이벤트 발생!");
            e.preventDefault();
            handleBet();
          }}
        >
          <input
            placeholder={`베팅할 포인트를 입력하세요! (100단위)`}
            type="number"
            step="100"
            min="100"
            value={bet}
            onChange={handleInputChange}
            max={allowedBetting}
            className="h-12 px-4 mt-4 w-[342px] text-start"
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: "12px",
              fontWeight: "400",
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
          {/* 5. 버튼 영역 */}
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
                !bet || parseInt(bet) <= 0 || parseInt(bet) > allowedBetting
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
                opacity:
                  !bet || parseInt(bet) <= 0 || parseInt(bet) > allowedBetting
                    ? 0.7
                    : 1,
              }}
              disabled={!bet || parseInt(bet) <= 0 || parseInt(bet) > allowedBetting}
              onClick={handleBet}
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

      {/* 게임 가이드 모달 */}
      {showGameGuide && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="rounded-[24px] max-w-lg w-full mx-4 max-h-[65vh] overflow-y-auto"
            style={{
              background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div className="p-4 rounded-lg shadow-lg w-full">
              <div className="flex justify-between items-center mb-4">
                <h2
                  className="text-start"
                  style={{
                    fontFamily: "'ONE Mobile POP', sans-serif",
                    fontSize: "12px",
                    fontWeight: "400",
                    color: "#FDE047",
                    WebkitTextStroke: "1px #000000",
                  }}
                >
                  ✼ 게임 방법 ✼
                </h2>
                <button
                  onClick={() => setShowGameGuide(false)}
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
                  fontWeight: "400",
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                <li>
                  <p>1. 베팅하기</p>
                  <ul className="list-disc pl-5">
                    <li>
                      오늘의 행운을 믿어보세요! 원하는 스타 수를 입력하세요.
                    </li>
                    <li>최대 베팅은 보유 스타의 절반까지만 가능합니다.</li>
                  </ul>
                </li>
                <li>
                  <p>2. 카드 색상 / 문양 맞추기</p>
                  <ul className="list-disc pl-5">
                    <li>카드를 뽑기 전에 다음 중 하나를 선택하세요:</li>
                    <li>색상: 🔴레드 / ⚫블랙(확률 50%)</li>
                    <li>
                      문양: ♠스페이드 / ♦다이아 / ♥하트 / ♣클로버 (확률 25%)
                    </li>
                  </ul>
                </li>
                <li>
                  <p>3. 보상 받기</p>
                  <ul className="list-disc pl-5">
                    <li>색상을 맞추면 베팅 금액의 2배를 획득합니다.</li>
                    <li>문양을 맞추면 베팅 금액의 4배를 획득합니다.</li>
                    <li>틀릴 경우 베팅한 스타는 소멸됩니다.</li>
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
                className="text-center"
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "24px",
                  fontWeight: "400",
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
                fontWeight: "400",
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              {alertMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const CardGameBoard = ({ betAmount, onResult, onCancel, resetAnimationState }: any) => {
  const [mode, setMode] = useState<"color" | "suit" | null>(null);
  const [selectedColor, setSelectedColor] = useState<"RED" | "BLACK" | null>(null);
  const [selectedSuit, setSelectedSuit] = useState<string | null>(null);
  const [cardRevealed, setCardRevealed] = useState(false);
  const [topSelected, setTopSelected] = useState(false);
  const [bottomSelected, setBottomSelected] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [screenHeight, setScreenHeight] = useState(0);
  const [animationDistance, setAnimationDistance] = useState(40);
  const [isLoading, setIsLoading] = useState(false);

  // 🔥 핵심 수정: 외부에서 애니메이션 상태 리셋 가능하도록 useEffect 추가
  useEffect(() => {
    if (resetAnimationState) {
      setTopSelected(false);
      setBottomSelected(false);
    }
  }, [resetAnimationState]);

  // 화면 높이 측정 및 애니메이션 거리 계산
  useEffect(() => {
    const updateScreenHeight = () => {
      const height = window.innerHeight;
      setScreenHeight(height);

      // 화면 높이에 따른 애니메이션 거리 계산
      // 작은 화면에서는 더 작은 거리, 큰 화면에서는 더 큰 거리
      let distance = 40; // 기본값

      if (height < 600) {
        distance = 20; // 매우 작은 화면
      } else if (height < 700) {
        distance = 30; // 작은 화면
      } else if (height > 900) {
        distance = 60; // 큰 화면
      }

      setAnimationDistance(distance);
    };

    updateScreenHeight();
    window.addEventListener("resize", updateScreenHeight);

    return () => window.removeEventListener("resize", updateScreenHeight);
  }, []);

  const handleSelect = (type: any, value: any) => {
    if (isAnimating) return; // 애니메이션 중에는 추가 선택 방지

    setIsAnimating(true);

    if (type === "color") {
      setMode("color");
      setSelectedColor(value as "RED" | "BLACK");
      setSelectedSuit(null);
      setTopSelected(true);
    } else if (type === "suit") {
      setMode("suit");
      setSelectedSuit(value as string);
      setSelectedColor(null);
      setBottomSelected(true);
    }

    // 애니메이션 완료 후 상태 리셋
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const handleSubmit = async () => {
    if (!mode || isLoading) return;

    try {
      setIsLoading(true);

      // API 요청 데이터 준비 - API 문서에 따른 num 값 매핑
      const requestData: CardFlipRequest = {
        type: mode === "color" ? "COLOR" : "FLIP",
        bettingAmount: betAmount,
        num:
          mode === "color"
            ? selectedColor === "RED"
              ? 1
              : 2 // RED = 1, BLACK = 2 (왼쪽부터 1)
            : SUITS.findIndex((suit) => suit.value === selectedSuit) + 1, // 스페이드=1, 다이아=2, 하트=3, 클럽=4 (왼쪽부터 1)
      };

      console.log("카드 플립 API 요청:", requestData);

      // API 호출
      const response: CardFlipResponseData = await flipCard(requestData);

      console.log("카드 플립 API 응답:", response);

      // API 응답 구조에 맞게 결과 처리 수정
      // result가 문자열 타입이므로 "WIN"이면 승리, "DEFEAT"이면 패배로 처리
      const win = response.result === "WIN";
      const reward = response.reward || 0;

      // API 응답에서 정답 정보 추출
      // 서버에서 실제 카드 정보를 제공한다면 그것을 사용하고, 
      // 그렇지 않다면 사용자의 선택을 기반으로 결과 표시
      const answer = {
        color: mode === "color" ? selectedColor : "UNKNOWN",
        suit: mode === "suit" 
          ? SUITS.find((suit) => suit.value === selectedSuit) || SUITS[0]
          : { label: "UNKNOWN", value: "UNKNOWN", color: "UNKNOWN" },
      };

      // 🔥 핵심 수정: 현재 게임 상태를 함께 전달
      const gameState = {
        mode: mode,
        selectedColor: selectedColor,
        selectedSuit: selectedSuit
      };

      console.log("게임 결과 처리 - 현재 게임 상태:", gameState);
      
      // �� 핵심 수정: gameState를 5번째 매개변수로 전달
      onResult(win, reward, answer, response.cardFlipId, gameState);

      // 게임 상태 리셋
      setMode(null);
      setSelectedColor(null);
      setSelectedSuit(null);
      setCardRevealed(false);
      setTopSelected(false);
      setBottomSelected(false);
    } catch (error: any) {
      console.error("카드 플립 API 에러:", error);
      
      // 🔥 에러 발생 시 게임 종료
      alert('게임 진행 중 오류가 발생했습니다. 게임을 종료합니다.');
      onCancel(); // 게임 종료
      return;
    } finally {
      setIsLoading(false);
    }
  };

  // 게임 플레이 화면
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl my-8">
        {/* 상단 2배율+RED/BLACK */}
        <AnimatePresence mode="wait">
          {!bottomSelected && (
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{
                opacity: bottomSelected ? 0 : 1,
                y: bottomSelected ? animationDistance : 0,
              }}
              exit={{ opacity: 0, y: animationDistance }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center"
            >
              {/* 배팅 금액, 2배율 */}
              <div
                className="flex flex-row items-center justify-center h-[54px] w-[264px] rounded-[58px] gap-3 mb-3 mx-auto"
                style={{
                  background:
                    "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
                  boxShadow:
                    "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
                }}
              >
                <div className="flex flex-row items-center gap-1">
                  <img src={Images.StarIcon} alt="Star" className="w-9 h-9" />
                  <p
                    className="text-center"
                    style={{
                      fontFamily: "'ONE Mobile POP', sans-serif",
                      fontSize: "18px",
                      fontWeight: "400",
                      color: "#FFFFFF",
                      WebkitTextStroke: "1px #000000",
                    }}
                  >
                    {betAmount}
                  </p>
                </div>
                <div
                  className="rounded-full flex items-center justify-center h-[32px] w-[66px] "
                  style={{
                    background: "rgba(0, 94, 170, 0.5)",
                    backdropFilter: "blur(10px)",
                    boxShadow: "inset 0px 0px 4px 3px rgba(255, 255, 255, 0.6)",
                    fontFamily: "'ONE Mobile POP', sans-serif",
                    fontSize: "18px",
                    fontWeight: "400",
                    color: "#FDE047",
                    WebkitTextStroke: "1px #000000",
                    padding: "20px",
                    gap: "25px",
                  }}
                >
                  x2
                </div>
              </div>
              {/* Red 버튼 + Black 버튼 */}
              <div className="flex flex-row gap-3 mb-[21px]">
                <button
                  onClick={() => handleSelect("color", "RED")}
                  className={`flex flex-row gap-1 rounded-[10px] text-center font-bold text-xl w-[150px] h-[45px] items-center justify-center ${
                    selectedColor === "RED"
                      ? "text-black"
                      : selectedColor === "BLACK"
                      ? "bg-[#35383F] text-white"
                      : "text-black"
                  }`}
                  style={{
                    background:
                      selectedColor === "RED" || selectedColor === "BLACK"
                        ? "rgba(255, 0, 4, 0.75)"
                        : "rgba(255, 0, 4, 0.75)",
                    boxShadow:
                      selectedColor === "RED" || selectedColor === "BLACK"
                        ? "inset 0px 0px 4px 3px rgba(255, 255, 255, 0.6)"
                        : "inset 0px 0px 4px 3px rgba(255, 255, 255, 0.6)",
                    fontFamily: "'ONE Mobile POP', sans-serif",
                    fontSize: "24px",
                    fontWeight: "400",
                    color: "#FFFFFF",
                    WebkitTextStroke: "1px #000000",
                  }}
                >
                  Red
                </button>
                <button
                  onClick={() => handleSelect("color", "BLACK")}
                  className={`flex flex-row gap-1 rounded-[10px] text-center font-bold text-xl w-[150px] h-[45px] items-center justify-center ${
                    selectedColor === "BLACK"
                      ? "text-white"
                      : selectedColor === "RED"
                      ? "text-white"
                      : "text-white"
                  }`}
                  style={{
                    background:
                      selectedColor === "BLACK" || selectedColor === "RED"
                        ? "rgba(0, 0, 0, 0.75)"
                        : "rgba(0, 0, 0, 0.75)",
                    boxShadow:
                      selectedColor === "BLACK" || selectedColor === "RED"
                        ? "inset 0px 0px 4px 3px rgba(255, 255, 255, 0.6)"
                        : "inset 0px 0px 4px 3px rgba(255, 255, 255, 0.6)",
                    fontFamily: "'ONE Mobile POP', sans-serif",
                    fontSize: "24px",
                    fontWeight: "400",
                    color: "#FFFFFF",
                    WebkitTextStroke: "1px #000000",
                  }}
                >
                  Black
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* 중앙 카드 */}
        <motion.div
          animate={{
            y: topSelected
              ? animationDistance
              : bottomSelected
              ? -animationDistance
              : 0,
          }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col items-center mb-[28px] border-none"
        >
          <img
            src={Images.CardBack}
            alt="card"
            className={`mb-4 w-[200px] h-[280px] rounded-xl shadow-lg bg-transparent object-cover border-none ${
              !cardRevealed &&
              (mode === "color" || mode === "suit") &&
              !isLoading
                ? "cursor-pointer"
                : "cursor-not-allowed opacity-50"
            }`}
            onClick={() => {
              if (
                !cardRevealed &&
                (mode === "color" || mode === "suit") &&
                !isLoading
              ) {
                handleSubmit();
              }
            }}
          />
          <img
            src={Images.CardGame}
            alt="card-game"
            className="w-[155px] bg-transparent object-cover"
          />

          {/* 로딩 인디케이터 */}
          {isLoading && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <p
                className="mt-2 text-sm"
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                카드를 확인하는 중...
              </p>
            </div>
          )}
        </motion.div>
        {/* 하단 4배율+카드들 */}
        <AnimatePresence mode="wait">
          {!topSelected && (
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{
                opacity: topSelected ? 0 : 1,
                y: topSelected ? -animationDistance : 0,
              }}
              exit={{ opacity: 0, y: -animationDistance }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center"
            >
              {/* 배팅 금액, 4배율 */}
              <div
                className="flex flex-row items-center justify-center h-[54px] w-[264px] gap-3 mb-3 mx-auto rounded-[58px]"
                style={{
                  background:
                    "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
                  boxShadow:
                    "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
                }}
              >
                <div className="flex flex-row items-center gap-1">
                  <img
                    src={Images.StarIcon}
                    alt="Star"
                    className="w-[30px] h-[30px]"
                  />
                  <p
                    className="text-ccenter"
                    style={{
                      fontFamily: "'ONE Mobile POP', sans-serif",
                      fontSize: "18px",
                      fontWeight: "400",
                      color: "#FFFFFF",
                      WebkitTextStroke: "1px #000000",
                    }}
                  >
                    {betAmount}
                  </p>
                </div>
                <div
                  className="rounded-full flex items-center justify-center h-[32px] w-[66px]"
                  style={{
                    background: "rgba(0, 94, 170, 0.5)",
                    backdropFilter: "blur(10px)",
                    boxShadow: "inset 0px 0px 4px 3px rgba(255, 255, 255, 0.6)",
                    fontFamily: "'ONE Mobile POP', sans-serif",
                    fontSize: "18px",
                    fontWeight: "400",
                    color: "#FDE047",
                    WebkitTextStroke: "1px #000000",
                    padding: "20px",
                    gap: "25px",
                  }}
                >
                  x4
                </div>
              </div>
              {/* 카드 선택 */}
              <div className="flex flex-row gap-[6px] justify-center items-center">
                {[
                  { key: "SPADE", img: Images.CardSpade, alt: "spade" },
                  { key: "DIAMOND", img: Images.CardDiamond, alt: "diamond" },
                  { key: "HEART", img: Images.CardHeart, alt: "heart" },
                  { key: "CLUB", img: Images.CardClover, alt: "clover" },
                ].map((card) => {
                  return (
                    <button
                      key={card.key}
                      type="button"
                      onClick={() => {
                        handleSelect("suit", card.key);
                      }}
                      className={`focus:outline-none rounded-[7px] bg-transparent p-0 ${
                        selectedSuit === card.key
                          ? "border-2 border-none shadow-lg"
                          : ""
                      }`}
                      style={{ lineHeight: 0 }}
                    >
                      <ReactCardFlip
                        isFlipped={!!selectedSuit && selectedSuit !== card.key}
                        flipDirection="horizontal"
                      >
                        <img
                          src={card.img}
                          alt={card.alt}
                          className="w-[80px] h-[110px] bg-transparent object-cover border-none"
                          key="front"
                        />
                        <img
                          src={Images.CardBack}
                          alt="card-back"
                          className="w-[80px] h-[110px] bg-transparent object-cover border-none"
                          key="back"
                        />
                      </ReactCardFlip>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const CardGameResultDialog = ({
  isOpen,
  win,
  reward,
  answer,
  onClose,
  onRetry,
  cardFlipId,
  hasUsedAdForGame,
  setHasUsedAdForGame,
  // 게임 상태 추가
  gameMode,           // "color" 또는 "suit"
  selectedColor,      // "RED" 또는 "BLACK"
  selectedSuit,       // 선택된 카드 문양
}: any) => {
  // CardGameResultDialog에서 광고 로드
  const { adLoadStatus, loadAd, showAd, isSupported, autoLoadAd, reloadAd, resetAdInstance } = useAdMob();

  const [platform] = useState(getPlatform());
  const [isAdLoading, setIsAdLoading] = useState(false);

  useEffect(() => {
    if (cardFlipId) {
      const usedGames = localStorage.getItem('cardFlipAdUsedGames') || '[]';
      const usedGameIds = JSON.parse(usedGames);
      if (usedGameIds.includes(cardFlipId)) {
        setHasUsedAdForGame(true);
      }
    }
  }, [cardFlipId, setHasUsedAdForGame]);

  // 게임 패배 시 자동으로 광고 로드 시작
  useEffect(() => {
    if (isOpen && !win && !hasUsedAdForGame && isSupported) {
      console.log('게임 패배 시 자동 광고 로드 시작');
      
      // 🔥 핵심 수정: 이미 로딩 중이거나 로드된 상태면 건너뛰기
      if (adLoadStatus === 'loading' || adLoadStatus === 'loaded') {
        console.log('이미 광고 로딩 중이거나 로드됨 - 자동 로드 건너뛰기');
        return;
      }
      
      // 🔥 핵심 수정: 한 번만 실행되도록 플래그 추가
      let isAutoLoading = false;  
      if (!isAutoLoading) {
        isAutoLoading = true;
        try {
          loadAd('CARD_FLIP_RETRY');
        } catch (error: any) {
          console.error('자동 광고 로드 실패:', error);
          isAutoLoading = false;
        }
      }
    }
  }, [isOpen, win, hasUsedAdForGame, isSupported]); // loadAd 의존성 제거


  // 광고 시청 핸들러 수정
  const handleAdWatch = async () => {
    if (!isSupported) {
      console.log('광고가 지원되지 않는 환경입니다');
      return;
    }

    if (hasUsedAdForGame) {
      alert('이미 광고를 시청한 게임입니다.');
      return;
    }

    if (!cardFlipId) {
      alert('게임 ID를 찾을 수 없습니다.');
      return;
    }

    try {
      setIsAdLoading(true);
      console.log('카드게임 재시도 광고 시작 - 게임 ID:', cardFlipId);
      
      //  핵심 수정: 광고 로딩 상태 확인 및 재시도 로직
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          // 광고가 로드되지 않은 경우 먼저 로드
          if (adLoadStatus !== 'loaded') {
            console.log(`광고 로드 시도 ${retryCount + 1}/${maxRetries}...`);
            await loadAd('CARD_FLIP_RETRY');
            
            // 로드 후 상태 확인 - 최대 3초 대기
            let waitCount = 0;
            while (waitCount < 30) {
              await new Promise(resolve => setTimeout(resolve, 100));
              waitCount++;
              if ((adLoadStatus as any) === 'loaded') {
                break;
              }
            }
            
            if ((adLoadStatus as any) !== 'loaded') {
              throw new Error('광고 로드에 실패했습니다');
            }
          }
          
          // 광고 로드 성공 시 루프 탈출
          break;
          
        } catch (error) {
          retryCount++;
          console.error(`광고 로드 시도 ${retryCount}/${maxRetries} 실패:`, error);
          
          if (retryCount >= maxRetries) {
            throw new Error('광고 로드를 여러 번 시도했지만 실패했습니다.');
          }
          
          // 재시도 전 잠시 대기
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // 카드플립 재시도에 필요한 데이터 준비
      const requestData = {
        cardFlipId: cardFlipId,
        type: gameMode === "color" ? "COLOR" : "FLIP",
        num: gameMode === "color" 
          ? (selectedColor === "RED" ? 1 : 2)
          : SUITS.findIndex((suit) => suit.value === selectedSuit) + 1
      };

      console.log('카드플립 재시도 요청 데이터:', requestData);

      // 광고 표시 및 보상 결과 대기
      const rewardData = await showAd('CARD_FLIP_RETRY', requestData);
      console.log('카드게임 재시도 광고 완료 - 보상 결과:', rewardData);
      
      // 🔥 핵심 수정: 광고 완료 후 게임 재시도 화면으로 이동
      if (rewardData && rewardData.type === 'CARD_FLIP_RETRY') {
        console.log('광고 시청 완료 - 게임 재시도 화면으로 이동');
        
        // 🔥 핵심 수정: localStorage 처리 개선 - 에러 방지
        try {
          if (cardFlipId) {
            const usedGamesStr = localStorage.getItem('cardFlipAdUsedGames');
            let usedGameIds: number[] = [];
            
            if (usedGamesStr) {
              try {
                usedGameIds = JSON.parse(usedGamesStr);
                if (!Array.isArray(usedGameIds)) {
                  usedGameIds = [];
                }
              } catch (parseError) {
                console.warn('localStorage 파싱 에러, 빈 배열로 초기화:', parseError);
                usedGameIds = [];
              }
            }
            
            if (!usedGameIds.includes(cardFlipId)) {
              usedGameIds.push(cardFlipId);
              localStorage.setItem('cardFlipAdUsedGames', JSON.stringify(usedGameIds));
              console.log('게임 ID 저장 완료:', cardFlipId);
            }
          }
        } catch (storageError) {
          console.error('localStorage 저장 중 에러:', storageError);
          // localStorage 에러가 있어도 게임 재시도는 계속 진행
        }
        
        // 로컬 상태 업데이트
        setHasUsedAdForGame(true);
        
        // 🔥 핵심 수정: 모달을 닫지 않고 바로 게임 재시도 실행
        if (onRetry) {
          onRetry();
        }
        
        return; // 함수 종료
      }
      
    } catch (error: any) {
      console.error('카드게임 재시도 광고 중 오류:', error);
      
      let errorMessage = '광고 시청에 실패했습니다. 다시 시도해주세요.';
      
      if (error.message) {
        if (error.message.includes('시간 초과')) {
          errorMessage = '광고 로딩 시간이 초과되었습니다. 다시 시도해주세요.';
        } else if (error.message.includes('로드에 실패')) {
          errorMessage = '광고를 불러올 수 없습니다. 네트워크 상태를 확인해주세요.';
        } else if (error.message.includes('여러 번 시도')) {
          errorMessage = '광고 로드에 실패했습니다. 잠시 후 다시 시도해주세요.';
        }
      }
      
      alert(errorMessage);
      
      // 🔥 핵심 수정: 에러 발생 시 광고 상태 리셋
      setTimeout(() => {
        resetAdInstance();
      }, 1000);
    } finally {
      setIsAdLoading(false);
    }
  };

  // 광고 버튼 비활성화 여부 수정
  const isAdButtonDisabled = () => {
    // 🔥 핵심 수정: 게임 ID별 광고 사용 여부 확인
    if (hasUsedAdForGame) return true;
    if (isAdLoading) return true;
    if (adLoadStatus === 'loading') return true;
    if (adLoadStatus === 'failed') return false; // 실패 시에는 재시도 가능
    return adLoadStatus !== 'loaded';
  };

  // 광고 상태에 따른 버튼 텍스트 개선
  const getAdButtonText = () => {
    if (hasUsedAdForGame) {
      return '이미 광고를 시청한 게임입니다';
    }
    
    if (isAdLoading) {
      return '광고 시청 중...';
    }
    
    switch (adLoadStatus) {
      case 'not_loaded':
        return '광고 로드 중...';
      case 'loading':
        return '광고 로드 중...';
      case 'loaded':
        return '광고 시청 후 재시도';
      case 'failed':
        return '광고 로드 실패 - 다시 시도';
      default:
        return '광고 시청 후 재시도';
    }
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div
        className="rounded-[24px] max-w-md w-full mx-4 p-6"
        style={{
          background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
          boxShadow:
            "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
        }}
      >
        <div className="text-center">
          {/* 결과 아이콘 */}
          <div className="mb-4">
            {win ? (
              <div className="text-6xl mb-2">🎉</div>
            ) : (
              <div className="text-6xl mb-2">😢</div>
            )}
          </div>

          {/* 결과 텍스트 */}
          <h3
            className="text-2xl font-bold mb-4"
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              color: win ? "#FDE047" : "#FF6D70",
              WebkitTextStroke: "1px #000000",
            }}
          >
            {win ? "성공!" : "실패!"}
          </h3>

          {/* 상세 정보 */}
          <div className="mb-6 space-y-2">
            {answer && (
              <p
                className="text-lg"
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                {answer.color !== "UNKNOWN" && `색상: ${answer.color}`}
                {answer.suit.label !== "UNKNOWN" &&
                  ` 문양: ${answer.suit.label}`}
              </p>
            )}

            <p
              className="text-xl font-bold"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                color: "#FDE047",
                WebkitTextStroke: "1px #000000",
              }}
            >
              {win
                ? `획득 금액: ${(reward || 0).toLocaleString()}`
                : "베팅 금액이 차감되었습니다"}
            </p>
          </div>

          {/* 버튼 영역 */}
          <div className="flex flex-col gap-3">
            {/* 패배 시에만 광고보기 버튼 표시 - 이미 광고를 사용한 게임이 아닌 경우에만 */}
            {!win && !hasUsedAdForGame && (
              <button
                className={`relative flex items-center justify-center gap-3 px-6 py-4 rounded-[10px] transition-transform active:scale-95 ${
                  isAdButtonDisabled() ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
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
                  opacity: isAdButtonDisabled() ? 0.5 : 1,
                }}
                onClick={handleAdWatch}
                disabled={isAdButtonDisabled()}
              >
                <span>{getAdButtonText()}</span>
              </button>
            )}

            {/* 종료 버튼 */}
            <button
              className="w-full py-3 rounded-xl font-bold text-white"
              style={{
                background: win
                  ? "linear-gradient(180deg, #50B0FF 0%, #008DFF 100%)"
                  : "linear-gradient(180deg, #FF6D70 0%, #FF2F32 100%)",
                fontFamily: "'ONE Mobile POP', sans-serif",
                WebkitTextStroke: "1px #000000",
              }}
              onClick={onClose}
            >
              종료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CardGameModal = ({ onClose }: any) => {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [betAmount, setBetAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState({ win: false, reward: 0, answer: null });
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [mode, setMode] = useState<"color" | "suit" | null>(null);
  const [selectedColor, setSelectedColor] = useState<"RED" | "BLACK" | null>(null);
  const [selectedSuit, setSelectedSuit] = useState<string | null>(null);
  const [cardRevealed, setCardRevealed] = useState(false);
    
  // 게임 ID 및 광고 사용 상태 추가
  const [currentCardFlipId, setCurrentCardFlipId] = useState<number | null>(null);
  const [hasUsedAdForGame, setHasUsedAdForGame] = useState(false);

  // 🔥 핵심 수정: 게임 상태 저장을 위한 변수 추가
  const [savedGameState, setSavedGameState] = useState<{
    mode: "color" | "suit" | null;
    selectedColor: "RED" | "BLACK" | null;
    selectedSuit: string | null;
  } | null>(null);

  // 사용자의 보유 포인트 가져오기
  const starPoints = useUserStore((state) => state.starPoints);
  
  // 새로운 베팅 규칙에 따른 베팅 가능 금액 계산
  const allowedBetting = starPoints >= 2000 ? 1000 : Math.floor(starPoints / 2);

  // 게임 시작 시 고유 ID 생성
  const generateGameId = () => {
    return Date.now() + Math.random();
  };

  const handleGameStart = (amount: number) => {
    const gameId = generateGameId();
    setCurrentCardFlipId(gameId);
    setHasUsedAdForGame(false); // 새 게임 시작 시 광고 사용 상태 리셋
    setBetAmount(amount);
    setIsGameStarted(true);
    
    // 🔥 핵심 수정: 게임 상태 초기화
    setMode(null);
    setSelectedColor(null);
    setSelectedSuit(null);
    setCardRevealed(false);
    setSavedGameState(null);
    
    console.log('새로운 카드게임 시작 - ID:', gameId);
  };

  // �� 핵심 수정: 게임 상태 저장 함수 개선
  const saveGameState = (gameState: {
    mode: "color" | "suit" | null;
    selectedColor: "RED" | "BLACK" | null;
    selectedSuit: string | null;
  }) => {
    console.log('게임 상태 저장 시작:', gameState);
    
    // 전달받은 게임 상태를 저장
    setSavedGameState(gameState);
    
    // 로컬 상태도 동기화
    setMode(gameState.mode);
    setSelectedColor(gameState.selectedColor);
    setSelectedSuit(gameState.selectedSuit);
    
    console.log('게임 상태 저장 완료:', gameState);
  };

  // 🔥 핵심 수정: 게임 재시도 핸들러 개선
  const handleGameRetry = () => {
    console.log('카드게임 재시도 시작');
    console.log('저장된 게임 상태:', savedGameState);
    
    if (!savedGameState) {
      console.error('저장된 게임 상태가 없습니다. 게임을 종료합니다.');
      onClose();
      return;
    }
    
    // 게임 상태 복원 (베팅 금액은 유지)
    setMode(savedGameState.mode);
    setSelectedColor(savedGameState.selectedColor);
    setSelectedSuit(savedGameState.selectedSuit);
    console.log('게임 상태 복원 완료:', savedGameState);
    
    // �� 핵심 수정: 결과 모달만 닫고 게임 플레이 화면으로 전환
    setIsResultOpen(false);
    setResult({ win: false, reward: 0, answer: null });
    setCardRevealed(false);
    
    console.log('카드게임 재시도 완료 - CardGameBoard 화면으로 이동');
  };


  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center h-screen w-full"
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        background: "#2d2060",
      }}
    >
      <div
        style={{
          width: "100vw",
          height: "100vh",
          backgroundImage: `url(${Images.BackgroundCard})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          minWidth: "320px",
          boxShadow: "0 0 40px rgba(0,0,0,0.2)",
        }}
        className="shadow-2xl overflow-hidden"
      >
        {!isGameStarted ? (
          <CardBettingModal
            myPoint={starPoints}
            allowedBetting={allowedBetting}
            onStart={handleGameStart}
            onCancel={onClose}
          />
        ) : (
          <CardGameBoard
            betAmount={betAmount}
            onResult={async (win: boolean, reward: number, answer: any, cardFlipId: number, gameState: any) => {
              //  핵심 수정: 결과 처리 전에 게임 상태 저장 (전달받은 gameState 사용)
              console.log('게임 결과 수신 - 게임 상태:', gameState);
              saveGameState(gameState);
              
              setResult({ win, reward, answer });
              setCurrentCardFlipId(cardFlipId);
              setIsResultOpen(true);
            }}
            onCancel={onClose}
          />
        )}
        <CardGameResultDialog
          isOpen={isResultOpen}
          win={result.win}
          reward={result.reward}
          answer={result.answer || { color: "", suit: { label: "" } }}
          onClose={() => {
            // 🔥 핵심 수정: 결과 모달 닫기 시 게임 완전 종료
            setIsResultOpen(false);
            onClose(); // 게임 완전 종료
          }}
          onRetry={handleGameRetry}
          cardFlipId={currentCardFlipId}
          hasUsedAdForGame={hasUsedAdForGame}
          setHasUsedAdForGame={setHasUsedAdForGame}
          // 게임 상태 추가
          gameMode={mode}
          selectedColor={selectedColor}
          selectedSuit={selectedSuit}
        />
      </div>
    </div>
  );
};

export default CardGameModal;
