import { IoDice, IoGameController, IoTicket } from 'react-icons/io5';
import Images from '@/shared/assets/images';
import { useNavigate } from "react-router-dom";

interface NFTReward {
  imgSrc: string;
  altText: string;
  title: string;
  rewards: { icon: React.ReactNode; description: string }[];
}

const NFTRewardCard: React.FC<NFTReward> = ({ imgSrc, altText, title, rewards }) => (
  <div className="relative space-y-2">
    <div className="flex flex-row items-center gap-2">
      <img src={imgSrc} alt={altText} className="w-6 h-6" />
      <p className="font-semibold">{title}</p>
    </div>
    <div className="pl-6 text-sm space-y-1">
      {rewards.map((reward, index) => (
        <div key={index} className="flex flex-row items-center gap-2">
          {reward.icon}
          <p>{reward.description}</p>
        </div>
      ))}
    </div>
  </div>
);

const NFTRewardList: React.FC = () => {
  const navigate = useNavigate();

  const nftRewards = [
    {
      imgSrc: Images.Gold,
      altText: 'Gold',
      title: 'GOLD PASS',
      rewards: [
        { 
          icon: <IoGameController className="w-5 h-5" />, 
          description: `게임 보드 포인트 : x3` 
        },
        { 
          icon: <IoTicket className="w-5 h-5" />, 
          description: `랜덤박스 열쇠 : x2` 
        },
      ],
    },
    {
      imgSrc: Images.Silver,
      altText: 'Silver',
      title: 'SILVER PASS',
      rewards: [
        { 
          icon: <IoGameController className="w-5 h-5" />, 
          description: `게임 보드 포인트 : x2` 
        },
        { 
          icon: <IoTicket className="w-5 h-5" />, 
          description: `랜덤박스 열쇠 : x2` 
        },
      ],
    },
    {
      imgSrc: Images.Bronze,
      altText: 'Bronze',
      title: 'BRONZE PASS',
      rewards: [
        { 
          icon: <IoGameController className="w-5 h-5" />, 
          description: `게임 보드 포인트 : x1` 
        },
        { 
          icon: <IoTicket className="w-5 h-5" />, 
          description: `랜덤박스 열쇠 : x2` 
        },
      ],
    },
    {
      imgSrc: Images.RewardNFT,
      altText: 'Reward Booster(x2)',
      title: 'REWARD BOOSTER(x2)',
      rewards: [
        { 
          icon: <IoGameController className="w-5 h-5" />, 
          description: `보드 스핀 보상 : x2` 
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <div className="flex flex-col bg-[#1F1E27] p-5 rounded-3xl border-2 border-[#35383F] font-medium gap-4">
        {nftRewards.map((nft, index) => (
          <NFTRewardCard key={index} {...nft} />
        ))}
      </div>
      <button onClick={()=>{navigate("/item-store")}} className=" sticky bottom-0 font-medium bg-[#0147E5] rounded-full h-14 w-[165px] self-center">
        아이템 상점
      </button>
    </div>
  );
};

export default NFTRewardList;
