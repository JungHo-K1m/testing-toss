import React from "react";
import { useNavigate } from "react-router-dom";
import Images from "@/shared/assets/images";
import { IoCaretDown } from "react-icons/io5";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { PlayerData } from "@/features/PreviousRewards/types/PlayerData";
import LoadingSpinner from "@/shared/components/ui/loadingSpinner";
import ErrorMessage from "@/shared/components/ui/ErrorMessage";

interface RankingSectionProps {
  myData: PlayerData | null;
  topRankings: PlayerData[];
  isReceived: boolean;
  onGetReward: () => void;
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  dialogTitle: string;
  dialogRankings: PlayerData[];
  isLoadingRange: boolean;
  rangeError: string | null;
  handleRangeClick: (start: number, end: number) => void;
}

const RankingSection: React.FC<RankingSectionProps> = ({
  myData = null,
  topRankings = [],
  isReceived,
  onGetReward,
  dialogOpen,
  onDialogOpenChange,
  dialogTitle,
  dialogRankings,
  isLoadingRange,
  rangeError,
  handleRangeClick,
}) => {
  const navigate = useNavigate();
  const showMyInDialog =
    myData !== null && dialogRankings.some((r) => r.rank === myData.rank);

  return (
    <div className="p-6 w-full">
      {/* 상단 myData & topRankings 렌더링 */}
      {myData ? (
        myData.rank > 1000 ? (
          <div
            className="relative flex flex-col rounded-3xl p-5 h-24 justify-center items-center"
            style={{
              background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
              boxShadow:
                "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
              borderRadius: "24px",
            }}
          >
            <p
              className="text-center"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              당신의 순위:
              <span
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#FDE047",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                #{myData.rank}
              </span>
              <br />
              게임을 계속 플레이하고 다음에 다시 도전해 보세요!
            </p>
          </div>
        ) : (
          <>
            <p
              className="font-semibold"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              축하합니다! 보상은 다음과 같습니다:
            </p>
            <div
              className="relative flex flex-row items-center rounded-3xl h-24 mt-3 p-5 gap-3"
              style={{
                background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
                boxShadow:
                  "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
                borderRadius: "24px",
              }}
            >
              <p
                className="text-center w-1/6"
                style={{
                  fontFamily: "'ONE Mobile POP', sans-serif",
                  fontSize: "18px",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                {myData.rank}
              </p>
              <div className="flex flex-col justify-center items-center gap-1 flex-1">
                <p
                  className="text-center"
                  style={{
                    fontFamily: "'ONE Mobile POP', sans-serif",
                    fontSize: "14px",
                    fontWeight: 400,
                    color: "#FFFFFF",
                    WebkitTextStroke: "1px #000000",
                  }}
                >
                  {myData.name}
                </p>
                <div className="flex flex-row items-center gap-1">
                  <img
                    src={Images.TossPoint}
                    alt="token"
                    className="w-[34px] h-[34px]"
                  />
                  <p
                    style={{
                      fontFamily: "'ONE Mobile POP', sans-serif",
                      fontSize: "14px",
                      fontWeight: 400,
                      color: "#FFFFFF",
                      WebkitTextStroke: "1px #000000",
                    }}
                  >
                    {(myData.slRewards ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </>
        )
      ) : (
        <div className="flex flex-col gap-4 items-center justify-center">
          {/* 상단 메시지 박스 */}
          <div
            className="w-full rounded-3xl p-6 text-center"
            style={{
              width: "342px",
              height: "90px",
              background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
              boxShadow:
                "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
              borderRadius: "58px",
            }}
          >
            <p
              className="text-white text-base font-semibold"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "16px",
                fontWeight: 600,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
                lineHeight: "1.5",
              }}
            >
              아직 보상이 없습니다.
              <br />
              시작하려면 아래를 탭하세요!
            </p>
          </div>

          {/* 하단 버튼 */}
          <div
            className="w-full rounded-3xl p-4 text-center cursor-pointer"
            style={{
              width: "336px",
              height: "56px",
              background: "linear-gradient(180deg, #50B0FF 0%, #008DFF 100%)",
              border: "2px solid #76C1FF",
              boxShadow:
                "0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 3px 0px 0px rgba(0, 0, 0, 0.1)",
              borderRadius: "28px",
              position: "relative",
            }}
            onClick={() => {
              navigate("/dice-event");
            }}
          >
            {/* 하이라이트 효과 */}
            {/* <div
              className="absolute top-2 left-4 w-3 h-3 rounded-full"
              style={{
                background: "rgba(255, 255, 255, 0.8)",
                boxShadow: "0px 0px 4px rgba(255, 255, 255, 0.6)",
              }}
            /> */}

            <p
              className="text-white text-base font-semibold"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "16px",
                fontWeight: 600,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              게임에 참여하기
            </p>
          </div>
        </div>
      )}

      {/* Top Rankings */}
      <div className="flex flex-col mt-8">
        <p className="font-semibold">랭킹 보상</p>
        {topRankings.length > 0 ? (
          topRankings.slice(0, 20).map((r) => {
            return (
              <div
                key={r.rank}
                className="relative flex flex-row items-center p-4 border-b gap-4"
              >
                <p className="w-1/6 text-center">{r.rank}</p>
                <div className="flex flex-col flex-1">
                  <p>{r.name}</p>
                  <div className="flex flex-row items-center gap-1">
                    <img
                      src={Images.TossPoint}
                      alt="token"
                      className="w-5 h-5"
                    />
                    <p className="text-sm font-semibold">
                      {(r.slRewards ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-sm mt-7">랭킹 정보가 없습니다.</p>
        )}
      </div>

      {/* Range Dialogs */}
      <div className="mt-7 space-y-4">
        <Dialog open={dialogOpen} onOpenChange={onDialogOpenChange}>
          {/* Dialog 트리거 목록 */}
          <div className="space-y-2">
            <DialogTrigger
              className="w-full cursor-pointer flex flex-row justify-between items-center p-4 rounded-2xl"
              onClick={() => handleRangeClick(21, 100)}
            >
              <span>
                21 - 100 <IoCaretDown className="inline-block ml-1" />
              </span>
              <span className="flex items-center gap-1">
                <img src={Images.TossPoint} alt="token" className="w-5 h-5" />
                <span className="text-sm font-semibold">500</span>
              </span>
            </DialogTrigger>
            <DialogTrigger
              className="w-full cursor-pointer flex flex-row justify-between items-center p-4 rounded-2xl"
              onClick={() => handleRangeClick(101, 500)}
            >
              <span>
                101 - 500 <IoCaretDown className="inline-block ml-1" />
              </span>
              <span className="flex items-center gap-1">
                <img src={Images.TossPoint} alt="token" className="w-5 h-5" />
                <span className="text-sm font-semibold">300</span>
              </span>
            </DialogTrigger>
            <DialogTrigger
              className="w-full cursor-pointer flex flex-row justify-between items-center p-4 rounded-2xl"
              onClick={() => handleRangeClick(501, 1000)}
            >
              <span>
                501 - 1000 <IoCaretDown className="inline-block ml-1" />
              </span>
              <span className="flex items-center gap-1">
                <img src={Images.TossPoint} alt="token" className="w-5 h-5" />
                <span className="text-sm font-semibold">20</span>
              </span>
            </DialogTrigger>
          </div>

          <DialogContent className="text-white rounded-3xl w-[80%] md:w-full border-none max-h-[80%] flex flex-col overflow-hidden text-sm">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
            </DialogHeader>

            {/* 순위 리스트 스크롤 영역 */}
            <div className="overflow-y-auto flex-1">
              {isLoadingRange && <LoadingSpinner className="h-full" />}
              {rangeError && <ErrorMessage message={rangeError} />}
              {!isLoadingRange &&
                !rangeError &&
                dialogRankings.map((r) => (
                  <div
                    key={r.rank}
                    className={`flex flex-row items-center p-4 border-b gap-10 truncate ${
                      r.itsMe ? "text-[#FDE047] font-bold" : ""
                    }`}
                  >
                    <p className="w-1/6 text-center">{r.rank}</p>
                    <p className="flex-1 text-center">{r.name}</p>
                  </div>
                ))}
            </div>

            {/* 내 순위 고정 영역 */}
            {showMyInDialog && (
              <div className="relative flex flex-row justify-center items-center box-bg rounded-3xl h-24 border-2 border-[#0147E5] p-5 gap-3">
                <p className="text-center w-1/6">{myData!.rank}</p>
                <p className="flex-1 text-center">{myData!.name}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default RankingSection;
