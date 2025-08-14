import React, { useState, useEffect } from "react";
import { FaRegQuestionCircle } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";
import Images from "@/shared/assets/images";
import ReactCardFlip from "react-card-flip";
import { motion, AnimatePresence } from "framer-motion";

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

const CardBettingModal = ({ myPoint, onStart, onCancel }: any) => {
  const [bet, setBet] = useState("");
  const [error, setError] = useState("");
  const [showGameGuide, setShowGameGuide] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const numericValue = parseInt(value);

    console.log("=== 입력값 변화 ===");
    console.log("입력된 값:", value);
    console.log("숫자 변환 결과:", numericValue);
    console.log("보유 포인트:", myPoint);
    console.log(
      "입력 허용 조건:",
      value === "" || (/^\d+$/.test(value) && numericValue <= myPoint + 1)
    );

    // 빈 값이거나 숫자인 경우에만 입력 허용 (100단위 제한 제거)
    if (value === "" || (/^\d+$/.test(value) && numericValue <= myPoint + 1)) {
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

    if (amount > myPoint) {
      console.log("❌ 포인트 초과:", amount, ">", myPoint);
      console.log("모달창 열기 시도...");
      setAlertMessage("베팅 가능한 금액보다 많이 입력하였습니다.");
      setIsAlertOpen(true);
      console.log("모달창 상태:", isAlertOpen);
      return;
    }
    console.log("✅ 포인트 검증 통과:", amount, "<=", myPoint);

    // 모든 검증을 통과한 경우 에러와 알림 초기화
    console.log("🎉 모든 검증 통과! 게임 시작:", amount);
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
          fontWeight: 400,
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
      <div className="flex flex-col items-center justify-center mt-4 mb-6">
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
              fontWeight: 400,
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
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              내 포인트
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
                  fontWeight: 400,
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                {myPoint.toLocaleString()}
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
            placeholder="베팅할 별 개수를 입력하세요!(100단위로 입력)"
            type="number"
            step="100"
            min="100"
            value={bet}
            onChange={handleInputChange}
            max={myPoint}
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
                !bet || parseInt(bet) <= 0 || parseInt(bet) > myPoint
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
                  !bet || parseInt(bet) <= 0 || parseInt(bet) > myPoint
                    ? 0.7
                    : 1,
              }}
              disabled={!bet || parseInt(bet) <= 0 || parseInt(bet) > myPoint}
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
                    fontWeight: 400,
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
                  fontWeight: 400,
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
    </div>
  );
};

const CardGameBoard = ({ betAmount, onResult, onCancel }: any) => {
  const [mode, setMode] = useState<"color" | "suit" | null>(null);
  const [selectedColor, setSelectedColor] = useState<"RED" | "BLACK" | null>(
    null
  );
  const [selectedSuit, setSelectedSuit] = useState<string | null>(null);
  const [cardRevealed, setCardRevealed] = useState(false);
  const [topSelected, setTopSelected] = useState(false);
  const [bottomSelected, setBottomSelected] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [screenHeight, setScreenHeight] = useState(0);
  const [animationDistance, setAnimationDistance] = useState(40);

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

  const answer = React.useMemo(() => {
    const color = COLORS[Math.floor(Math.random() * 2)];
    const suit = SUITS[Math.floor(Math.random() * 4)];
    return { color, suit };
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
  const handleSubmit = () => {
    let win = false;
    let reward = 0;
    if (mode === "color") {
      win = selectedColor === answer.color;
      reward = win ? betAmount * 2 : 0;
    } else if (mode === "suit") {
      win = selectedSuit === answer.suit.value;
      reward = win ? betAmount * 4 : 0;
    }
    onResult(win, reward, answer);
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
                      fontWeight: 400,
                      color: "#FFFFFF",
                      WebkitTextStroke: "1px #000000",
                    }}
                  >
                    {betAmount}
                  </p>
                </div>
                <div
                  className="rounded-full flex items-center justify-center h-[35px] w-[66px] "
                  style={{
                    background: "rgba(0, 94, 170, 0.5)",
                    backdropFilter: "blur(10px)",
                    boxShadow: "inset 0px 0px 4px 3px rgba(255, 255, 255, 0.6)",
                    fontFamily: "'ONE Mobile POP', sans-serif",
                    fontSize: "18px",
                    fontWeight: 400,
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
                    fontWeight: 400,
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
                    fontWeight: 400,
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
            className="mb-4 w-[200px] h-[280px] rounded-xl shadow-lg bg-transparent object-cover cursor-pointer border-none"
            onClick={() => {
              if (!cardRevealed && (mode === "color" || mode === "suit")) {
                // TODO: API 호출로 카드 오픈 (추후 개발)
                setCardRevealed(true);
              }
            }}
          />
          <img
            src={Images.CardGame}
            alt="card-game"
            className="w-[155px] bg-transparent object-cover"
          />
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
                      fontWeight: 400,
                      color: "#FFFFFF",
                      WebkitTextStroke: "1px #000000",
                    }}
                  >
                    {betAmount}
                  </p>
                </div>
                <div
                  className="rounded-full flex items-center justify-center h-[35px] w-[66px]"
                  style={{
                    background: "rgba(0, 94, 170, 0.5)",
                    backdropFilter: "blur(10px)",
                    boxShadow: "inset 0px 0px 4px 3px rgba(255, 255, 255, 0.6)",
                    fontFamily: "'ONE Mobile POP', sans-serif",
                    fontSize: "18px",
                    fontWeight: 400,
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
}: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#2d2060] rounded-3xl p-8 max-w-md w-full mx-4 text-white text-center">
        <h3 className="text-2xl font-bold mb-4">{win ? "성공!" : "실패!"}</h3>
        <div className="mb-4">
          <p className="text-lg">
            정답: {answer.color} / {answer.suit.label}
          </p>
          <p className="text-xl font-bold text-yellow-400 mt-2">
            획득 금액: {reward.toLocaleString()}
          </p>
        </div>
        <button
          className="w-full py-3 rounded-xl bg-blue-500 text-white font-bold"
          onClick={onClose}
        >
          종료
        </button>
      </div>
    </div>
  );
};

const CardGameModal = ({ onClose }: any) => {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [betAmount, setBetAmount] = useState(500);
  const [myPoint, setMyPoint] = useState(12345);
  const [result, setResult] = useState({ win: false, reward: 0, answer: null });
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [mode, setMode] = useState<"color" | "suit" | null>(null);
  const [selectedColor, setSelectedColor] = useState<"RED" | "BLACK" | null>(
    null
  );
  const [selectedSuit, setSelectedSuit] = useState<string | null>(null);
  const [cardRevealed, setCardRevealed] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center h-screen w-full"
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
            myPoint={myPoint}
            onStart={(amount: React.SetStateAction<number>) => {
              setBetAmount(amount);
              setIsGameStarted(true);
            }}
            onCancel={onClose}
          />
        ) : (
          <CardGameBoard
            betAmount={betAmount}
            onResult={(win: boolean, reward: number, answer: any) => {
              setResult({ win, reward, answer });
              setIsResultOpen(true);
              if (win) setMyPoint((p: number) => p + reward);
              else setMyPoint((p: number) => p - betAmount);
            }}
            onCancel={onClose}
          />
        )}
        <CardGameResultDialog
          isOpen={isResultOpen}
          win={result.win}
          reward={result.reward}
          answer={result.answer || { color: "", suit: { label: "" } }}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default CardGameModal;
