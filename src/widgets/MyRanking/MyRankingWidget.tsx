// // src/widgets/MyRankingWidget.tsx
// import React, { useEffect, useRef, useState } from "react";
// import Images from "@/shared/assets/images";
// import { useUserStore } from "@/entities/User/model/userModel";
// import CountUp from "react-countup";
// import { IoIosArrowRoundUp, IoIosArrowRoundDown } from "react-icons/io";
// import { motion, AnimatePresence } from "framer-motion";

// interface MyRankingWidgetProps {
//   titleHidden?: boolean;
//   className?: string;
// }

// const MyRankingWidget: React.FC<MyRankingWidgetProps> = ({
//   className,
//   titleHidden = false,
// }) => {
//   // 1) 스토어에서 순위(tab API) 상태 및 fetch 액션
//   const {
//     rank,
//     previousRank,
//     starPoints,
//     lotteryCount,
//     slToken,
//     fetchLeaderTab,
//   } = useUserStore();

//   // 마운트 시 최신 데이터를 불러옵니다
//   useEffect(() => {
//     fetchLeaderTab();
//   }, []);

//   // 2) 애니메이션 트리거 state
//   const [showRankText, setShowRankText] = useState<
//     "myRank" | "rankUp" | "rankDown"
//   >("myRank");
//   const [rankChanged, setRankChanged] = useState(false);
//   const [starChanged, setStarChanged] = useState(false);
//   const [lotteryChanged, setLotteryChanged] = useState(false);
//   const [tokenChanged, setTokenChanged] = useState(false);

//   // 3) 변경 전 로컬 Ref (rank 외)
//   const prevStarRef = useRef(starPoints);
//   const prevLotteryRef = useRef(lotteryCount);
//   const prevTokenRef = useRef(slToken);

//   // 4) rank 변경 애니메이션
//   useEffect(() => {
//     if (previousRank !== rank) {
//       setRankChanged(true);
//       const timer = setTimeout(() => setRankChanged(false), 700);
//       return () => clearTimeout(timer);
//     }
//   }, [rank, previousRank]);

//   // 5) other metrics animation
//   useEffect(() => {
//     if (prevStarRef.current !== starPoints) {
//       setStarChanged(true);
//       const t = setTimeout(() => setStarChanged(false), 700);
//       prevStarRef.current = starPoints;
//       return () => clearTimeout(t);
//     }
//   }, [starPoints]);

//   useEffect(() => {
//     if (prevLotteryRef.current !== lotteryCount) {
//       setLotteryChanged(true);
//       const t = setTimeout(() => setLotteryChanged(false), 700);
//       prevLotteryRef.current = lotteryCount;
//       return () => clearTimeout(t);
//     }
//   }, [lotteryCount]);

//   useEffect(() => {
//     if (prevTokenRef.current !== slToken) {
//       setTokenChanged(true);
//       const t = setTimeout(() => setTokenChanged(false), 700);
//       prevTokenRef.current = slToken;
//       return () => clearTimeout(t);
//     }
//   }, [slToken]);

//   // 6) Rank Up/Down 텍스트 표시
//   useEffect(() => {
//     if (previousRank !== rank) {
//       if (rank < previousRank) setShowRankText("rankUp");
//       else if (rank > previousRank) setShowRankText("rankDown");
//       const t = setTimeout(() => setShowRankText("myRank"), 1500);
//       return () => clearTimeout(t);
//     }
//   }, [rank, previousRank]);

//   // 7) Framer motion variants
//   const scaleGlow = {
//     initial: { scale: 1, filter: "brightness(1)", rotate: 0 },
//     animate: {
//       scale: [1, 1.5, 1.2, 1],
//       filter: [
//         "brightness(1)",
//         "brightness(2)",
//         "brightness(1.5)",
//         "brightness(1)",
//       ],
//       rotate: [0, 5, -5, 0],
//       transition: { duration: 1, ease: "easeInOut" },
//     },
//   };

//   const scaleGlowImg = {
//     initial: {
//       scale: 1,
//       filter: "brightness(1) drop-shadow(0 0 0px rgba(255,255,255,0))",
//       rotate: 0,
//     },
//     animate: {
//       scale: [1, 1.3, 1.1, 1],
//       filter: [
//         "brightness(1) drop-shadow(0 0 0px rgba(255,255,255,0))",
//         "brightness(2) drop-shadow(0 0 10px rgba(255,255,255,0.8))",
//         "brightness(1.5) drop-shadow(0 0 5px rgba(255,255,255,0.5))",
//         "brightness(1) drop-shadow(0 0 0px rgba(255,255,255,0))",
//       ],
//       rotate: [0, 3, -3, 0],
//       transition: { duration: 1, ease: "easeInOut" },
//     },
//   };

//   const upDownVar = {
//     initial: { scale: 1, opacity: 0, y: 0 },
//     animate: {
//       scale: [1, 1.3, 1, 1.3, 1],
//       opacity: [0, 1, 1, 1, 0],
//       y: [0, -5, 0, -5, 5],
//       transition: { duration: 1.4, ease: "easeInOut" },
//     },
//     exit: { opacity: 0, scale: 1, y: 10, transition: { duration: 0.2 } },
//   };

//   const myVar = {
//     initial: { opacity: 0 },
//     animate: { opacity: 1, transition: { duration: 0.2 } },
//     exit: { opacity: 0, transition: { duration: 0.2 } },
//   };

//   const diff = previousRank - rank;
//   const isUp = diff > 0;

//   // 8) 렌더링
//   return (
//     <div
//       className={`flex flex-col items-center justify-center text-white cursor-pointer w-full ${className}`}
//       role="button"
//     >
//       {/* Title */}
//       <h1
//         className={`font-jalnan text-3xl ${titleHidden ? "hidden" : "block"}`}
//         style={{
//           fontFamily: "'ONE Mobile POP', sans-serif",
//           fontSize: "18px",
//           fontWeight: 400,
//           color: "#FFFFFF",
//           WebkitTextStroke: "1px #000000",
//         }}
//       >
//         내 랭킹
//       </h1>

//       <div
//         className={`bg-box px-8 w-full h-24 md:h-32 flex font-semibold ${
//           titleHidden ? "mt-0" : "mt-4"
//         }`}
//       >
//         {/* Rank text & number */}
//         <div className="relative w-[121px] h-full flex flex-col items-center justify-center gap-2">
//           <p
//             className="text-base font-semibold invisible"
//             style={{
//               fontFamily: "'ONE Mobile POP', sans-serif",
//               fontSize: "18px",
//               fontWeight: 400,
//               color: "#FFFFFF",
//               WebkitTextStroke: "1px #000000",
//             }}
//           >
//             내 랭킹
//           </p>
//           <div className="absolute top-[18%] md:top-[24%] w-full flex items-center justify-center">
//             <AnimatePresence mode="wait">
//               {showRankText === "myRank" && (
//                 <motion.p
//                   key="my"
//                   variants={myVar}
//                   initial="initial"
//                   animate="animate"
//                   exit="exit"
//                   className="text-base font-semibold"
//                 >
//                   내 랭킹
//                 </motion.p>
//               )}
//               {showRankText === "rankUp" && (
//                 <motion.p
//                   key="up"
//                   variants={upDownVar}
//                   initial="initial"
//                   animate="animate"
//                   exit="exit"
//                   className="font-jalnan text-[#22C55E]"
//                 >
//                   Rank Up!
//                 </motion.p>
//               )}
//               {showRankText === "rankDown" && (
//                 <motion.p
//                   key="down"
//                   variants={upDownVar}
//                   initial="initial"
//                   animate="animate"
//                   exit="exit"
//                   className="font-jalnan text-[#DD2726]"
//                 >
//                   Rank Down!
//                 </motion.p>
//               )}
//             </AnimatePresence>
//           </div>
//           <motion.p
//             variants={scaleGlow}
//             animate={rankChanged ? "animate" : "initial"}
//             className={`${
//               rank > 9999 ? "text-xl" : "text-2xl"
//             } text-[#fde047] font-jalnan`}
//           >
//             <CountUp start={0} end={rank} duration={1} separator="," />
//           </motion.p>
//           {diff !== 0 && (
//             <div
//               className={`absolute flex items-center -right-2 z-20 ${
//                 isUp ? "text-[#22C55E] top-[40%]" : "text-[#DD2726] bottom-1"
//               } text-[12px] font-semibold`}
//             >
//               <p>{Math.abs(diff)}</p>
//               {isUp ? (
//                 <IoIosArrowRoundUp className="w-4 h-4" />
//               ) : (
//                 <IoIosArrowRoundDown className="w-4 h-4" />
//               )}
//             </div>
//           )}
//         </div>

//         {/* Separator */}
//         <div className="w-[1px] h-full mx-6 flex items-center">
//           <div className="bg-white h-16 w-full" />
//         </div>

//         {/* Star, Ticket, Token */}
//         <div className="w-full h-full flex items-center justify-around text-xs">
//           <div className="flex flex-col items-center gap-2">
//             <motion.img
//               src={Images.Star}
//               alt="star"
//               className="w-6 h-6"
//               variants={scaleGlowImg}
//               animate={starChanged ? "animate" : "initial"}
//             />
//             <p>
//               <CountUp start={0} end={starPoints} duration={1} separator="," />
//             </p>
//           </div>
//           <div className="flex flex-col items-center gap-2">
//             <motion.img
//               src={Images.LotteryTicket}
//               alt="ticket"
//               className="w-6 h-6"
//               variants={scaleGlowImg}
//               animate={lotteryChanged ? "animate" : "initial"}
//             />
//             <p>
//               <CountUp
//                 start={0}
//                 end={lotteryCount}
//                 duration={1}
//                 separator=","
//               />
//             </p>
//           </div>
//           <div className="flex flex-col items-center gap-2">
//             <motion.img
//               src={Images.TokenReward}
//               alt="token"
//               className="w-6 h-6"
//               variants={scaleGlowImg}
//               animate={tokenChanged ? "animate" : "initial"}
//             />
//             <p>
//               <CountUp
//                 start={0}
//                 end={slToken}
//                 duration={1}
//                 separator=","
//                 preserveValue
//               />
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Footer text */}
//       <p
//         className="w-full font-medium text-xs md:text-sm mt-2 px-2 text-left"
//         style={{
//           fontFamily: "'ONE Mobile POP', sans-serif",
//           fontSize: "18px",
//           fontWeight: 400,
//           color: "#FFFFFF",
//           WebkitTextStroke: "1px #000000",
//         }}
//       >
//         *랭킹은 스타포인트 기준으로 산정됩니다.
//       </p>
//     </div>
//   );
// };

// export default MyRankingWidget;
