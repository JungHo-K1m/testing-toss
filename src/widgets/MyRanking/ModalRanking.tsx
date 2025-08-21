// src//widgets/MyRanking/ModalRanking.tsx
import React, { useEffect } from 'react';
import { useUserStore } from '@/entities/User/model/userModel';
import { BaseRanking } from './BaseRanking';
import { DialogClose } from '@/shared/components/ui/dialog';

export const ModalRanking: React.FC = () => {
    // InlineRanking과 동일한 방식으로 데이터 구독
    const rank = useUserStore((state) => state.rank);
    const previousRank = useUserStore((state) => state.previousRank);
    const starPoints = useUserStore((state) => state.starPoints);
    const lotteryCount = useUserStore((state) => state.lotteryCount);
    const slToken = useUserStore((state) => state.slToken);
    
    const { fetchLeaderTab } = useUserStore();

    // 모달 오픈 시마다 최신 랭크 가져오기
    useEffect(() => {
        fetchLeaderTab();
    }, [fetchLeaderTab]);

    return (
        <div>
            <BaseRanking
                rank={rank}
                previousRank={previousRank}
                starPoints={starPoints}
                lotteryCount={lotteryCount}
                slToken={slToken}
                className="justify-center"
                titleHidden={false}
            />
        </div>
    );
};
