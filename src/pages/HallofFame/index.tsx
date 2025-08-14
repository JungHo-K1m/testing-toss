import React from "react";
import { TopTitle } from "@/shared/components/ui";
import Images from "@/shared/assets/images";

// 더미 데이터 타입 정의
interface WinnerData {
  round: number;
  username: string;
  reward: number;
  characterImage: string;
}

// 더미 데이터 생성
const generateDummyData = (): WinnerData[] => {
  const data: WinnerData[] = [];
  for (let i = 7; i >= 2; i--) {
    data.push({
      round: i,
      username: "User-23456",
      reward: 9000000,
      characterImage: i % 2 === 0 ? Images.DogSmile : Images.CatSmile, // 짝수는 강아지, 홀수는 고양이
    });
  }
  return data;
};

const HallofFame: React.FC = () => {
  const winners = generateDummyData();

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <div className="min-h-screen mb-20 flex-col items-center mx-2 relative ">
        <TopTitle title="명예의 전당" back={true} />

        {/* 메인 컨텐츠 */}
       <div className="px-4 py-6">
         {winners.map((winner, index) => (
           <div key={winner.round}>
             {index === 0 ? (
                               // 가장 최근 회차 - 카드 형태
                <div 
                  className="mb-4"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.5)', // #FFFFFF with 50% opacity
                    borderRadius: '20px',
                    padding: '10px 16px', // top/bottom 10px, left/right 16px
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)', // Safari 지원
                  }}
                >
                 <div className="flex items-start space-x-3">
                   {/* 캐릭터 이미지 */}
                   <div className="w-[120px] h-[120px] flex-shrink-0">
                     <img
                       src={winner.characterImage}
                       alt={`Round ${winner.round} Winner`}
                       className="w-full h-full object-contain"
                     />
                   </div>
                   
                   {/* 사용자 정보와 보상 정보 */}
                   <div className="flex-1">
                     <div className="flex flex-col">
                       <span 
                            style={{
                                fontFamily: "'ONE Mobile POP', sans-serif",
                                fontSize: "18px",
                                fontWeight: 400,
                                color: "#FDE047",
                                WebkitTextStroke: "1px #000000",
                            }}>
                         {winner.round}회차 우승자
                       </span>
                       <span 
                            className="mb-2"
                            style={{
                                fontFamily: "'ONE Mobile POP', sans-serif",
                                fontSize: "18px",
                                fontWeight: 400,
                                color: "#FFFFFF",
                                WebkitTextStroke: "1px #000000",
                            }}>
                            {winner.username}
                        </span>
                       
                       {/* 보상 정보 - 유저 아이디 아래에 배치 */}
                       <div 
                        className="rounded-[66px] px-3 py-2 flex items-center space-x-2 self-start w-[170px] h-[48px]"
                        style={{
                            background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
                            boxShadow:
                            "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
                        }}>
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
                            }}>
                           {formatNumber(winner.reward)}
                         </span>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             ) : (
               // 나머지 회차 - 경계선으로 구분
               <div className="py-3">
                 <div className="flex items-center justify-between">
                   {/* 캐릭터 이미지와 사용자 정보 */}
                   <div className="flex items-center space-x-3">
                     <div className="w-[80px] h-[80px] flex-shrink-0">
                       <img
                         src={winner.characterImage}
                         alt={`Round ${winner.round} Winner`}
                         className="w-full h-full object-contain"
                       />
                     </div>
                     <div className="flex flex-col">
                       <span
                            style={{
                                fontFamily: "'ONE Mobile POP', sans-serif",
                                fontSize: "14px",
                                fontWeight: 400,
                                color: "#FFFFFF",
                                WebkitTextStroke: "1px #000000",
                            }}>
                            {winner.round}회차 우승자
                       </span>
                       <span
                           style={{
                                fontFamily: "'ONE Mobile POP', sans-serif",
                                fontSize: "14px",
                                fontWeight: 400,
                                color: "#FFFFFF",
                                WebkitTextStroke: "1px #000000",
                            }}>
                            {winner.username}
                        </span>
                     </div>
                   </div>

                   {/* 보상 정보 */}
                   <div 
                        className="rounded-[66px] px-3 py-2 flex items-center space-x-2 w-[140px] h-[40px]"
                        style={{
                            background: "linear-gradient(180deg, #282F4E 0%, #0044A3 100%)",
                            boxShadow:
                            "0px 2px 2px 0px rgba(0, 0, 0, 0.5), inset 0px 0px 2px 2px rgba(74, 149, 255, 0.5)",
                        }}>
                     <img
                       src={Images.StarIcon}
                       alt="Star"
                       className="w-[24px] h-[24px]"
                     />
                     <span
                        style={{
                            fontFamily: "'ONE Mobile POP', sans-serif",
                            fontSize: "16px",
                            fontWeight: 400,
                            color: "#FFFFFF",
                            WebkitTextStroke: "1px #000000",
                        }}>
                       {formatNumber(winner.reward)}
                     </span>
                   </div>
                 </div>
                 {/* 하단 경계선 */}
                 <div className="border-b border-[#D9D9D9] mt-3"></div>
               </div>
             )}
           </div>
         ))}
       </div>
    </div>
  );
};

export default HallofFame;