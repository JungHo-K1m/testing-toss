// src/pages/RewardPage/index.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopTitle } from "@/shared/components/ui";
import "./Reward.css";
import Images from "@/shared/assets/images";
import { useRewardStore } from "@/entities/RewardPage/model/rewardModel";
import LoadingSpinner from "@/shared/components/ui/loadingSpinner";
import RewardItem from "@/widgets/RewardItem";
import api from "@/shared/api/axiosInstance";
import { formatNumber } from "@/shared/utils/formatNumber";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import { useSound } from "@/shared/provider/SoundProvider";
import { InlineRanking } from "@/widgets/MyRanking/InlineRanking";
import { DialogClose } from "@radix-ui/react-dialog";
import { HiX } from "react-icons/hi";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/shared/components/ui";
import Audios from "@/shared/assets/audio";
import { ModalRanking } from "@/widgets/MyRanking/ModalRanking";
import NewMyRanking from "@/widgets/NewMyRanking";

const Reward: React.FC = () => {
  const navigate = useNavigate();
  const { playSfx } = useSound();
  const {
    fetchLeaderHome,
    rankingAwards,
    slDrawAwards,
    usdtDrawAwards,
    rank,
    isLoadingHome,
    errorHome,
  } = useRewardStore();

  const [showMoreRanking, setShowMoreRanking] = useState(false);
  const [showMoreUSDT, setShowMoreUSDT] = useState(false);
  const [showMoreSL, setShowMoreSL] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // useEffect(() => {
  //   fetchLeaderHome();
  // }, [fetchLeaderHome]);

  // 데이터 안전성 검증
  // if (!rankingAwards || !slDrawAwards || !usdtDrawAwards) {
  //   return <LoadingSpinner className="h-screen" />;
  // }

  // if (isLoadingHome) {
  //   return <LoadingSpinner className="h-screen" />;
  // }

  // if (errorHome) {
  //   return <div className="text-center text-red-500">Error: {errorHome}</div>;
  // }

  // 랭킹 보상
  const rankingProducts = (rankingAwards || []).slice(0, 3);
  const rankingOthers = (rankingAwards || []).slice(3);
  const currentRound =
    rankingProducts.length > 0 ? rankingProducts[0].round : null;

  // 래플 보상: USDT / SL
  const usdtProducts = (usdtDrawAwards || []).slice(0, 3);
  const usdtOthers = (usdtDrawAwards || []).slice(3);
  const slProducts = (slDrawAwards || []).slice(0, 3);
  const slOthers = (slDrawAwards || []).slice(3);

  // 에어드랍 회차
  const slRound = (slDrawAwards || []).length > 0 ? slDrawAwards[0].round : null;

  const handleShowMoreRanking = () => {
    playSfx(Audios.button_click);
    setShowMoreRanking(true);
  };
  const handleShowMoreUSDT = () => {
    playSfx(Audios.button_click);
    setShowMoreUSDT(true);
  };
  const handleShowMoreSL = () => {
    playSfx(Audios.button_click);
    setShowMoreSL(true);
  };

  const handlePreviousRewardPage = async () => {
    playSfx(Audios.button_click);
    const response = await api.get("/leader/ranking/initial");
    if (response.data.data === null) {
      setShowModal(true);
    } else {
      if (currentRound !== null) {
        navigate("/previous-ranking", {
          state: { round: currentRound - 1 },
        });
      }
    }
  };

  const handleCloseModal = () => {
    playSfx(Audios.button_click);
    setShowModal(false);
  };

  return (
    <div className="flex flex-col text-white mb-44 w-full min-h-screen">

      

      {/* my-rank 위젯 표시 */}
      <Dialog>
        <DialogTrigger
          className="w-full flex justify-center mt-20 mb-8"
          onClick={() => playSfx(Audios.button_click)}
          style={{
            backgroundColor: "transparent",
            outline: "none",
            border: "none",
          }}
        >
          <InlineRanking />
        </DialogTrigger>
        <DialogContent
          className="flex flex-col border-none text-white h-screen w-screen max-w-none max-h-none overflow-x-hidden font-semibold overflow-y-auto"
          style={{
            background: `url(${Images.BackgroundLobby})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundColor: "#42617D",
              opacity: 0.6,
            }}
          />
          <div className="relative z-10 flex flex-col h-full">
            <DialogHeader className="flex w-full items-end">
              <DialogClose>
                <HiX
                  className="w-5 h-5"
                  style={{
                    backgroundColor: "transparent",
                    outline: "none",
                    border: "none",
                  }}
                />
              </DialogClose>
            </DialogHeader>
            <ModalRanking />
            <NewMyRanking />
          </div>
        </DialogContent>
      </Dialog>
      

      {/* 월간 보상 영역 */}
      <div
        className="w-full max-w-md rounded-3xl p-6 mb-6 mx-auto"
      >
        {/* 제목 영역 */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <img
            src={Images.GoldMedalIcon} 
            alt="monthly-reward"
            className="w-[60px] h-[60px]"
          />
          <h2
            className="text-xl font-bold"
            style={{
              fontFamily: "'ONE Mobile POP', sans-serif",
              fontSize: "30px",
              fontWeight: 400,
              color: "#FEE900",
              WebkitTextStroke: "1px #000000",
            }}
          >
            월간 보상
          </h2>
        </div>

        {/* 보상 목록 */}
        <div className="space-y-3">
                     {/* 1-3위 보상 */}
           <div className="flex items-center p-3 rounded-[58px] bg-opacity-50 h-[64px] relative"
             style={{
               fontFamily: "'ONE Mobile POP', sans-serif",
               fontSize: "18px",
               fontWeight: 400,
               color: "#FFFFFF",
               WebkitTextStroke: "1px #000000",
               background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
               boxShadow:
                 "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
             }}>
             <span className="ml-3">1</span>
             <span className="absolute left-1/2 transform -translate-x-1/2">1,000,000</span>
           </div>
           
           <div className="flex items-center p-3 rounded-[58px] bg-opacity-50 h-[64px] relative"
             style={{
               fontFamily: "'ONE Mobile POP', sans-serif",
               fontSize: "18px",
               fontWeight: 400,
               color: "#FFFFFF",
               WebkitTextStroke: "1px #000000",
               background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
               boxShadow:
                 "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
             }}>
             <span className="ml-3">2</span>
             <span className="absolute left-1/2 transform -translate-x-1/2">1,000,000</span>
           </div>
           
           <div className="flex items-center p-3 rounded-[58px] bg-opacity-50 h-[64px] relative"
             style={{
               fontFamily: "'ONE Mobile POP', sans-serif",
               fontSize: "18px",
               fontWeight: 400,
               color: "#FFFFFF",
               WebkitTextStroke: "1px #000000",
               background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
               boxShadow:
                 "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
             }}>
             <span className="ml-3">3</span>
             <span className="absolute left-1/2 transform -translate-x-1/2">1,000,000</span>
           </div>
          
          
          {/* 4-100위 보상 */}
          <div className="flex justify-between items-center p-3"
          style={{
            fontFamily: "'ONE Mobile POP', sans-serif",
            fontWeight: 400,
            color: "#FFFFFF",
            WebkitTextStroke: "1px #000000",
          }}>
            <span className="text-lg">4-100</span>
            <span className="text-sm">50,000</span>
          </div>
          
          {/* 구분선 */}
          <div className="border-t border-[#E5E5E5] border-opacity-30 my-3"></div>
        </div>
      </div>

      {/* 명예의 전당 영역 */}
      <div
        className="w-[340px] max-w-md rounded-3xl p-6 cursor-pointer mx-auto"
        style={{
          background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
          boxShadow:
            "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
          borderRadius: "24px",
        }}
        onClick={() => navigate("/hall-of-fame")}
      >
        <div className="flex justify-between items-center">
          {/* 텍스트 영역 */}
          <div className="flex flex-col gap-2">
            <h2
              className="text-xl font-bold"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "24px",
                fontWeight: 400,
                color: "#FDE047",
                WebkitTextStroke: "1px #000000",
              }}
            >
              명예의 전당
            </h2>
            <p
              className="text-white text-sm"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              역대 우승자를 확인하고
            </p>
            <p
              className="text-white text-sm"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
            >
              다음 회차 주인공에 도전하세요!
            </p>
          </div>

          {/* 아이콘 영역 */}
          <img
            src={Images.HallofFame}
            alt="hall-of-fame"
            className="w-[120px] h-[120px]"
            style={{ width: "120px", height: "120px" }}
          />
        </div>
      </div>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 w-full">
          <div className="bg-white text-black p-6 rounded-lg text-center w-[70%] max-w-[550px]">
            <p>지난달 랭킹이 없습니다.</p>
            <button
              className="mt-4 px-4 py-2 bg-[#0147E5] text-white rounded-lg"
              onClick={handleCloseModal}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reward;
