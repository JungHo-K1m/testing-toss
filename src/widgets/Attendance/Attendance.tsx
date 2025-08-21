// Attendance.tsx
import React, { useState } from "react";
import AttendanceDay from "@/features/AttendanceDay/components/AttendanceDay";
import { useUserStore } from "@/entities/User/model/userModel";
import { requestAttendance, AttendanceResponse } from "@/entities/User/api/requestAttendance";
import Images from "@/shared/assets/images";
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";
import { Dialog, DialogContent, DialogHeader, DialogClose } from "@/shared/components/ui/dialog";
import { HiX } from "react-icons/hi";

// 진동 애니메이션 CSS - index.tsx와 동일
const vibrateAnimation = `
  @keyframes vibrate {
    0% { transform: translate(0); }
    20% { transform: translate(-2px, 2px); }
    40% { transform: translate(-2px, -2px); }
    60% { transform: translate(2px, 2px); }
    80% { transform: translate(2px, -2px); }
    100% { transform: translate(0); }
  }
`;

// 등급별 색상 매핑 함수
const getRarityImageIndex = (rarity: number): number => {
  if (rarity <= 1) return 1;      // 보라색
  if (rarity <= 3) return 2;      // 하늘색
  if (rarity <= 5) return 3;      // 초록색
  if (rarity <= 7) return 4;      // 노란색
  return 5;                        // 빨간색
};

// 장비 타입별 이미지 가져오기 함수
const getEquipmentIcon = (type: string, rarity: number) => {
  const imageIndex = getRarityImageIndex(rarity);
  
  console.log('getEquipmentIcon called:', { type, rarity, imageIndex });
  
  let result;
  switch (type.toUpperCase()) {
    case 'HEAD': 
      result = Images[`Crown${imageIndex}` as keyof typeof Images];
      break;
    case 'EAR': 
      result = Images[`Hairpin${imageIndex}` as keyof typeof Images];
      break;
    case 'EYE': 
      result = Images[`Sunglass${imageIndex}` as keyof typeof Images];
      break;
    case 'NECK': 
      result = Images[`Muffler${imageIndex}` as keyof typeof Images];
      break;
    case 'BACK': 
      result = Images[`Ballon${imageIndex}` as keyof typeof Images];
      break;
    default: 
      result = Images.Ballon1; // 기본값
  }
  
  console.log('Selected image:', result);
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

type DayKeys = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

interface AttendanceProps {
  /** Tailwind width 클래스를 지정해 너비를 커스터마이징 */
  customWidth?: string;
};

const getTodayDay = (): DayKeys => {
  const days: DayKeys[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const today = new Date();
  return days[today.getDay()];
};

const Attendance: React.FC<AttendanceProps> = ({ customWidth }) => {
   const { weekAttendance, setWeekAttendance } = useUserStore();
   const [today] = useState<DayKeys>(getTodayDay());
   const { playSfx } = useSound();
   const [isConnecting, setIsConnecting] = useState(false);
   const [showModal, setShowModal] = useState(false);
   const [message, setMessage] = useState("");

   // 출석 보상 모달 상태
   const [showAttendanceRewardModal, setShowAttendanceRewardModal] = useState(false);
   const [showAttendanceBoxOpenModal, setShowAttendanceBoxOpenModal] = useState(false);
   const [isVibrating, setIsVibrating] = useState(false);
   const [showResult, setShowResult] = useState(false);
   const [attendanceResult, setAttendanceResult] = useState<AttendanceResponse | null>(null);

  // 출석 상태 결정 로직
  const getStatus = (day: DayKeys) => {
    const attendanceData: { [key in DayKeys]: boolean | null } = {
      SUN: weekAttendance.sun,
      MON: weekAttendance.mon,
      TUE: weekAttendance.tue,
      WED: weekAttendance.wed,
      THU: weekAttendance.thu,
      FRI: weekAttendance.fri,
      SAT: weekAttendance.sat
    };

    if (attendanceData[day]) return "checked";
    if (day === today) return "today";

    const daysOfWeek: DayKeys[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    const todayIndex = daysOfWeek.indexOf(today);
    const dayIndex = daysOfWeek.indexOf(day);

    return dayIndex < todayIndex ? "missed" : "default";
  };

  const days: DayKeys[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const isTodayUnattended = days.some((day) => getStatus(day) === "today");

  // 출석 체크 핸들러
  const handleAttendanceClick = async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    try {
      const result = await requestAttendance();
      setAttendanceResult(result);
      
      // 주간 출석 데이터 업데이트
      setWeekAttendance(result.weekly);
      
      // 출석 보상 모달 표시
      setShowAttendanceRewardModal(true);
      setIsVibrating(false);
      setShowResult(false);
      
      // 2초 후 진동 시작
      setTimeout(() => {
        setIsVibrating(true);
        playSfx(Audios.button_click);
        
        // 2초 진동 후 결과 표시
        setTimeout(() => {
          setIsVibrating(false);
          setShowResult(true);
        }, 2000);
      }, 500);
      
    } catch (error: any) {
      setMessage(error.message || "출석 체크에 실패했습니다.");
      setShowModal(true);
    } finally {
      setIsConnecting(false);
    }
  };

  // 보상 결과 렌더링
  const renderRewardResult = () => {
    if (!attendanceResult) return null;
    
    const { randomBox } = attendanceResult;
    
    console.log('renderRewardResult called:', randomBox);
    
    // randomBox.result → randomBox.type으로 변경
    switch (randomBox.type) {
      case 'EQUIPMENT':
        if (randomBox.equipment) {
          const { type, rarity } = randomBox.equipment;
          const equipmentIcon = getEquipmentIcon(type, rarity);
          
          console.log('Equipment details:', { type, rarity, equipmentIcon });
          
          return (
            <div className="flex items-center gap-3 mb-2">
              <img
                src={equipmentIcon}
                style={{ width: 40, height: 40 }}
                alt={`${type} equipment`}
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
                {type} 장비
              </span>
            </div>
          );
        }
        break;
        
      case 'DICE':
        return (
          <div className="flex items-center gap-3 mb-2">
            <img
              src={Images.Dice}
              style={{ width: 40, height: 40 }}
              alt="Dice"
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
              주사위 보상
            </span>
          </div>
        );
        
      case 'SL':
        return (
          <div className="flex items-center gap-3 mb-2">
            <img
              src={Images.SLToken}
              style={{ width: 40, height: 40 }}
              alt="SL Token"
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
              SL 토큰 보상
            </span>
          </div>
        );
        
      case 'NONE':
        return (
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
              꽝!
            </span>
          </div>
        );
        
      default:
        console.log('Unknown result type:', randomBox.type);
        return null;
    }
  };

  return (
    <div className="mt-4">
      {/* 진동 애니메이션 CSS 주입 */}
      <style>{vibrateAnimation}</style>
      
      <div
        id="attendance"
        onClick={isTodayUnattended ? handleAttendanceClick : undefined}
        className={`relative grid grid-cols-7 gap-2 bg-box min-h-24 md:h-32 text-white text-xs ${
          customWidth ? customWidth : "w-full md:w-[552px]"
        } ${isTodayUnattended ? "border-2 border-yellow-400 animate-pulse rounded-lg" : ""}`}
        style={{
            fontFamily: "'ONE Mobile POP', sans-serif",
            fontSize: "14px",
            fontWeight: 400,
            color: "#FFFFFF",
            WebkitTextStroke: "1px #000000",
        }}
      >
        {days.map((day) => {
          const status = getStatus(day);
          const displayDay = `${day}`;
          return (
            <AttendanceDay
              key={day}
              day={day}
              displayDay={displayDay}
              status={status}
            />
          );
        })}
        {isTodayUnattended && (
          <img
            src={Images.attendanceNote}
            alt="Attendance Note"
            className="absolute top-[-4px] right-[-4px] w-[20px] h-[20px]"
          />
        )}
      </div>
      {/* <p className="flex items-start justify-start w-full font-medium text-xs md:text-sm mt-2 text-white">
        * 별 보상 <br/> * 7일 연속 출석 시 보상
      </p> */}
      
      {/* 출첵 성공 여부 알림 모달창 */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
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
              {showResult ? "축하합니다!" : "출석 체크"}
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
                {/* 랜덤박스스 이미지 */}
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
                  alt="attendance-check"
                />
              </div>
            )}

            {/* 결과 표시 */}
            {showResult && attendanceResult && (
              <div className="flex flex-col items-center mb-4">
                <div className="flex items-center gap-3 mb-2">
                  {/* 보상 타입에 따른 아이콘 */}
                  {attendanceResult.randomBox.type === 'EQUIPMENT' && attendanceResult.randomBox.equipment && (
                    <img
                      src={getEquipmentIcon(attendanceResult.randomBox.equipment.type, attendanceResult.randomBox.equipment.rarity)}
                      style={{ width: 40, height: 40 }}
                      alt="equipment"
                    />
                  )}
                  {attendanceResult.randomBox.type === 'DICE' && (
                    <img
                      src={Images.Dice}
                      style={{ width: 40, height: 40 }}
                      alt="dice"
                    />
                  )}
                  {attendanceResult.randomBox.type === 'SL' && (
                    <img
                      src={Images.SLToken}
                      style={{ width: 40, height: 40 }}
                      alt="sl-token"
                    />
                  )}
                  {attendanceResult.randomBox.type === 'NONE' && (
                    <img
                      src={Images.airDropBox}
                      style={{ width: 40, height: 40 }}
                      alt="no-reward"
                    />
                  )}
                  
                  <span
                    style={{
                      fontFamily: "'ONE Mobile POP', sans-serif",
                      fontSize: "20px",
                      fontWeight: 400,
                      color: "#FFFFFF",
                      WebkitTextStroke: "1px #000000",
                    }}
                  >
                    {attendanceResult.randomBox.type === 'EQUIPMENT' && attendanceResult.randomBox.equipment
                      ? `${getEquipmentName(attendanceResult.randomBox.equipment.type)} 장비`
                      : attendanceResult.randomBox.type === 'DICE'
                      ? '주사위 보상'
                      : attendanceResult.randomBox.type === 'SL'
                      ? 'SL 토큰'
                      : '보상 없음'}
                  </span>
                </div>
                
                {/* 장비인 경우 희귀도 표시 */}
                {attendanceResult.randomBox.type === 'EQUIPMENT' && attendanceResult.randomBox.equipment && (
                  <p
                    style={{
                      fontFamily: "'ONE Mobile POP', sans-serif",
                      fontSize: "16px",
                      fontWeight: 400,
                      color: "#FFFFFF",
                      WebkitTextStroke: "0.5px #000000",
                    }}
                  >
                    희귀도: {attendanceResult.randomBox.equipment.rarity}
                  </p>
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
                  {attendanceResult.randomBox.type === 'NONE' ? '다음에 다시 시도해보세요!' : '획득하셨습니다!'}
                </p>
              </div>
            )}

            {/* 받기 버튼 - 결과가 표시될 때만 보임 */}
            {showResult && (
              <button
                onClick={() => {
                  setShowModal(false);
                  setShowResult(false);
                  setAttendanceResult(null);
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

      {/* 출석 보상 모달 */}
      {showAttendanceRewardModal && (
        <Dialog
          open={showAttendanceRewardModal}
          onOpenChange={setShowAttendanceRewardModal}
        >
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
                {showResult ? "축하합니다!" : "출석 체크"}
              </h2>

              {/* 출석 체크 이미지 컨테이너 - 결과가 표시되지 않을 때만 보임 */}
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

                  {/* 출석 체크 이미지 */}
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
                    alt="attendance-check"
                  />
                </div>
              )}

              {/* 결과 표시 */}
              {showResult && attendanceResult && (
                <div className="flex flex-col items-center mb-4">
                  {/* 보상 결과 렌더링 함수 사용 */}
                  {renderRewardResult()}
                  
                  {/* 장비인 경우 희귀도 표시 */}
                  {attendanceResult.randomBox.type === 'EQUIPMENT' && attendanceResult.randomBox.equipment && (
                    <p
                      style={{
                        fontFamily: "'ONE Mobile POP', sans-serif",
                        fontSize: "16px",
                        fontWeight: 400,
                        color: "#FFFFFF",
                        WebkitTextStroke: "0.5px #000000",
                      }}
                    >
                      희귀도: {attendanceResult.randomBox.equipment.rarity}
                    </p>
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
                    {attendanceResult.randomBox.type === 'NONE' ? '다음에 다시 시도해보세요!' : '획득하셨습니다!'}
                  </p>
                </div>
              )}

              {/* 받기 버튼 - 결과가 표시될 때만 보임 */}
              {showResult && (
                <button
                  onClick={() => {
                    setShowAttendanceRewardModal(false);
                    setShowResult(false);
                    setAttendanceResult(null);
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
      )}
    </div>
  );
};

export default Attendance;
