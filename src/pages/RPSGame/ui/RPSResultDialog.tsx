// src/pages/RPSGame/ui/RPSResultDialog.tsx

import React, { useEffect, useState } from "react";
import { AlertDialog, AlertDialogContent } from "@/shared/components/ui";
import Images from "@/shared/assets/images";
import { formatNumber } from "@/shared/utils/formatNumber";
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";
import { useAdMob } from "@/hooks/useAdMob";
import { getPlatform } from "@/types/adMob";

interface ResultWinProps {
  winnings: number;
  onQuit: () => void;
}

interface ResultLoseProps {
  winnings: number;
  onQuit: () => void;
  rpsId: number;           // RPS 게임 ID 추가
  lastPlayerChoice: number; // 마지막 플레이어 선택 추가
  onRetry: () => void;     // 재시도 콜백 추가
}

const ResultWin: React.FC<ResultWinProps> = ({
  winnings,
  onQuit,
}) => {
  const { playSfx } = useSound();

  // 승리 효과음 재생
  useEffect(() => {
    playSfx(Audios.rps_win);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center ">
      {/* 파란색 배경 영역 */}
      <div
        className="relative rounded-[10px] w-[234px] h-[228px] mb-8"
        style={{
          background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
          boxShadow:
            "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
          marginTop: "180px",
          marginLeft: "-2px",
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
                fontWeight: "400",
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              +{formatNumber(winnings)}
            </p>
            <img src={Images.StarIcon} className="w-9 h-9" />
          </div>
          <div
            className="text-center"
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: "14px",
              fontWeight: "400",
              color: "#FFFFFF",
              WebkitTextStroke: "1px #000000",
            }}
          >
            축하합니다!
            <br />
            베팅 금액의 3배를 획득하셨습니다!
          </div>
        </div>
      </div>
      {/* 버튼 */}
      <div className="mt-4">
        <button
          className="flex relative items-center justify-center rounded-[10px] font-medium h-14 w-[160px]"
          onClick={onQuit}
          style={{
            background: "linear-gradient(180deg, #50B0FF 0%, #50B0FF 50%, #008DFF 50%, #008DFF 100%)",
            border: "2px solid #76C1FF",
            outline: "2px solid #000000",
            boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 3px 0px 0px rgba(0, 0, 0, 0.1)",
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
            }}/>
          완료
        </button>
      </div>
    </div>
  );
};

const ResultLose: React.FC<ResultLoseProps> = ({ 
  winnings, 
  onQuit, 
  rpsId, 
  lastPlayerChoice,
  onRetry  // 재시도 콜백 추가
}) => {
  const { playSfx } = useSound();
  
  // 광고 관련 훅 추가
  const { adLoadStatus, loadAd, showAd, isSupported, autoLoadAd, reloadAd } = useAdMob();
  const [platform] = useState(getPlatform());
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [hasUsedAdForGame, setHasUsedAdForGame] = useState(false);

  // 이미 광고를 사용한 게임인지 확인
  useEffect(() => {
    const usedGames = localStorage.getItem('rpsAdUsedGames') || '[]';
    const usedGameIds = JSON.parse(usedGames);
    if (usedGameIds.includes(rpsId)) {
      setHasUsedAdForGame(true);
    }
  }, [rpsId]);

  // 광고 시청 핸들러
  const handleAdWatch = async () => {
    if (!isSupported) {
      console.log('광고가 지원되지 않는 환경입니다');
      return;
    }

    if (hasUsedAdForGame) {
      alert('이미 광고를 시청한 게임입니다.');
      return;
    }

    try {
      setIsAdLoading(true);
      console.log('RPS 재시도 광고 시작');

      // 광고가 로드되지 않은 경우 먼저 로드
      if (adLoadStatus !== 'loaded') {
        console.log('광고 로드 시작...');
        await loadAd('RPS_RETRY');
        return;
      }

      // 광고 표시 및 보상 결과 대기
      const rewardData = await showAd('RPS_RETRY');
      console.log('RPS 재시도 광고 완료:', rewardData);

      if (rewardData) {
        // 광고 사용 기록
        const usedGames = localStorage.getItem('rpsAdUsedGames') || '[]';
        const usedGameIds = JSON.parse(usedGames);
        usedGameIds.push(rpsId);
        localStorage.setItem('rpsAdUsedGames', JSON.stringify(usedGameIds));
        
        // 게임 재시도 콜백 호출
        if (onRetry) {
          onRetry();
        }
      }
    } catch (error) {
      console.error('RPS 재시도 광고 중 오류:', error);
      alert('광고 시청에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsAdLoading(false);
    }
  };

  // 광고 상태에 따른 버튼 텍스트
  const getAdButtonText = () => {
    switch (adLoadStatus) {
      case 'not_loaded':
        return '준비 중...';
      case 'loading':
        return '로딩 중...';
      case 'loaded':
        return '광고 시청 후 재시도';
      case 'failed':
        return '로드 실패 - 다시 시도';
      default:
        return '광고 시청 후 재시도';
    }
  };

  // 광고 버튼 비활성화 여부
  const isAdButtonDisabled = adLoadStatus === 'loading' || isAdLoading;

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
                fontWeight: "400",
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
                fontWeight: "400",
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
      
      {/* 버튼 영역 - 세로로 배치 */}
      <div className="flex flex-col gap-3 mt-10">
        {/* 광고보기 버튼 */}
        <button
          className={`relative flex items-center justify-center gap-3 px-6 py-4 rounded-[10px] transition-transform active:scale-95 ${
            isAdButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
          }`}
          style={{
            width: "300px",
            height: "56px",
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
            opacity: isAdButtonDisabled ? 0.5 : 1,
          }}
          onClick={handleAdWatch}
          disabled={isAdButtonDisabled}
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
          <img
            src={Images.AdButton}
            alt="광고 버튼"
            style={{
              width: "32px",
              height: "32px",
            }}
          />
          <span>{getAdButtonText()}</span>
        </button>

        {/* 나가기 버튼 */}
        <button
          className="flex relative items-center justify-center rounded-[10px] font-medium"
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
          나가기
        </button>
      </div>
    </div>
  );
};

// RPSResultDialogProps 인터페이스 수정
interface RPSResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  result: "win" | "lose" | null;
  winnings: number;
  onQuit: () => void;
  rpsId?: number;           // RPS 게임 ID 추가 (선택적)
  lastPlayerChoice?: number; // 마지막 플레이어 선택 추가 (선택적)
  onRetry?: () => void;     // 재시도 콜백 추가 (선택적)
}

const RPSResultDialog: React.FC<RPSResultDialogProps> = ({
  isOpen,
  onClose,
  result,
  winnings,
  onQuit,
  rpsId,
  lastPlayerChoice,
  onRetry,
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
            onQuit={onQuit}
          />
        ) : result === "lose" ? (
          <ResultLose 
            winnings={winnings} 
            onQuit={onQuit}
            rpsId={rpsId || 0}
            lastPlayerChoice={lastPlayerChoice || 0}
            onRetry={onRetry || (() => {})}
          />
        ) : null}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RPSResultDialog;