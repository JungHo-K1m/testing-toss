// src/pages/RPSGame/ui/RPSResultDialog.tsx

import React, { useEffect } from "react";
import { AlertDialog, AlertDialogContent } from "@/shared/components/ui";
import Images from "@/shared/assets/images";
import { formatNumber } from "@/shared/utils/formatNumber";
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";

interface ResultWinProps {
  winnings: number;
  onContinue: () => void;
  onQuit: () => void;
  consecutiveWins: number;
  winMultiplier: number;
}

interface ResultLoseProps {
  winnings: number;
  onQuit: () => void;
}

const ResultWin: React.FC<ResultWinProps> = ({
  winnings,
  onContinue,
  onQuit,
  consecutiveWins,
  winMultiplier,
}) => {
  const isFinalWin = consecutiveWins >= 3;
  const { playSfx } = useSound();

  // 승리 효과음 재생
  useEffect(() => {
    playSfx(Audios.rps_win);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center">
      {/* 파란색 배경 영역 */}
      <div
        className="relative rounded-[10px] w-[234px] h-[228px] mb-8"
        style={{
          background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
          boxShadow:
            "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
          marginTop: "180px",
          opacity: 0.9,
        }}
      >
        {/* 컨텐츠 영역 */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-2">
          <div
            className="flex rounded-[20px] w-[200px] h-[70px] flex-row items-center justify-center gap-[26px]"
            style={{
              background:
                "linear-gradient(180deg, #0088FF 75%, transparent 25%)",
              border: "2px solid #76C1FF",
              boxShadow:
                "0px 2px 0px 0px #000000, inset 0px 2px 0px 0px #FFFFFF",
            }}
          >
            <p
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "24px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              +{formatNumber(winnings)}
            </p>
            <img src={Images.StarIcon} className="w-9 h-9" />
          </div>
          {isFinalWin ? (
            <div
              className="text-center"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "24px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              축하합니다!
              <br />
              베팅 금액의 27배를 획득하셨습니다!
            </div>
          ) : (
            <div className="text-center">
              <div
                className="flex flex-col justify-center items-center"
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "18px",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                계속하기 <br />
                <div className="flex flex-row items-center justify-center gap-[25px]">
                  <div
                    className="flex flex-row items-center justify-center w-[66px] h-[35px] px-[20px]"
                    style={{
                      background: "rgba(0, 94, 170, 0.5)",
                      borderRadius: "53px",
                      backdropFilter: "blur(10px)",
                      boxShadow:
                        "inset 0px 0px 4px 3px rgba(255, 255, 255, 0.6)",
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
                      ×{winMultiplier}
                    </p>
                  </div>
                  <div className="flex flex-row items-center justify-centers">
                    <p
                      style={{
                        fontFamily: "'ONE Mobile POP', sans-serif",
                        fontSize: "24px",
                        fontWeight: 400,
                        color: "#FFFFFF",
                        WebkitTextStroke: "1px #000000",
                      }}
                    >
                      ?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* 버튼들을 바깥 영역으로 이동 */}
      <div className="flex flex-row gap-[27px]">
        {isFinalWin ? (
          <button
            className="flex relative items-center justify-center rounded-[10px] font-medium h-14 w-[160px] mt-20"
            onClick={onQuit}
            style={{
              background: "linear-gradient(180deg, #50B0FF 0%, #50B0FF 50%, #008DFF 50%, #008DFF 100%)",
              border: "2px solid #76C1FF",
              outline: "2px solid #000000",
              boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 3px 0px 0px rgba(0, 0, 0, 0.1)",
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: "18px",
              fontWeight: 400,
              color: "#FFFFFF",
              WebkitTextStroke: "1px #000000",
            }}>
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
                }}/>
            완료
          </button>
        ) : (
          <>
            <button
              className="flex relative items-center justify-center rounded-[10px] font-medium h-14 w-[160px] mt-20"
              onClick={onQuit}
              style={{
                background: "linear-gradient(180deg, #50B0FF 0%, #50B0FF 50%, #008DFF 50%, #008DFF 100%)",
                border: "2px solid #76C1FF",
                outline: "2px solid #000000",
                boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 3px 0px 0px rgba(0, 0, 0, 0.1)",
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
                }}/>
              받기
            </button>
            <button
              className="flex relative items-center justify-center rounded-[10px] font-medium h-14 w-[160px]"
              onClick={onContinue}
              style={{
                background: "linear-gradient(180deg, #50B0FF 0%, #50B0FF 50%, #008DFF 50%, #008DFF 100%)",
                border: "2px solid #76C1FF",
                outline: "2px solid #000000",
                boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 3px 0px 0px rgba(0, 0, 0, 0.1)",
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
                }}/>
              도전하기
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const ResultLose: React.FC<ResultLoseProps> = ({ winnings, onQuit }) => {
  const { playSfx } = useSound();

  // 패배 효과음 재생
  useEffect(() => {
    playSfx(Audios.rps_lose);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center">
      {/* 파란색 배경 영역 */}
      <div
        className="relative rounded-[10px] w-[234px] h-[228px] mb-8"
        style={{
          background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
          boxShadow:
            "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
          marginTop: "180px",
          opacity: 0.9,
        }}
      >
        {/* 컨텐츠 영역 */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-4">
          <div
            className="flex rounded-[20px] w-[200px] h-[70px] flex-row items-center justify-center gap-[26px]"
            style={{
              background:
                "linear-gradient(180deg, #0088FF 75%, transparent 25%)",
              border: "2px solid #76C1FF",
              boxShadow:
                "0px 2px 0px 0px #000000, inset 0px 2px 0px 0px #FFFFFF",
            }}
          >
            <p
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "24px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              {formatNumber(winnings)}
            </p>
            <img src={Images.StarIcon} className="w-9 h-9" />
          </div>
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
              아쉬웠어요! <br />
              다음엔 행운이 함께하길!
            </p>
          </div>
        </div>
      </div>
      {/* 버튼을 바깥 영역으로 이동 */}
      <button
        className="flex relative items-center justify-center rounded-[10px] font-medium mt-20"
        onClick={onQuit}
        style={{
          width: "300px",
          height: "56px",
          background: "linear-gradient(180deg, #FF6D70 0%, #FF6D70 50%, #FF2F32 50%, #FF2F32 100%)",
          border: "2px solid #FF8E8E",
          outline: "2px solid #000000",
          boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 3px 0px 0px rgba(0, 0, 0, 0.1)",
          fontFamily: "'ONE Mobile POP', sans-serif",
          fontSize: "18px",
          fontWeight: 400,
          color: "#FFFFFF",
          WebkitTextStroke: "1px #000000",
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
          }}/>
          나가기
      </button>
    </div>
  );
};

interface RPSResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  result: "win" | "lose" | null;
  winnings: number;
  onContinue: () => void;
  onQuit: () => void;
  consecutiveWins: number;
  winMultiplier: number;
}

const RPSResultDialog: React.FC<RPSResultDialogProps> = ({
  isOpen,
  onClose,
  result,
  winnings,
  onContinue,
  onQuit,
  consecutiveWins,
  winMultiplier,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent
        className="w-[373px] h-[490px] object-cover"
        style={{
          background:
            result === "win"
              ? `url(${Images.RPSWin})`
              : `url(${Images.RPSDefeat})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: "none",
        }}
      >
        {result === "win" ? (
          <ResultWin
            winnings={winnings}
            onContinue={onContinue}
            onQuit={onQuit}
            consecutiveWins={consecutiveWins}
            winMultiplier={winMultiplier * 3}
          />
        ) : result === "lose" ? (
          <ResultLose winnings={winnings} onQuit={onQuit} />
        ) : null}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RPSResultDialog;
