// src//widgets/MyRanking/ModalRanking.tsx
import React, { useEffect } from 'react';
import { useUserStore } from '@/entities/User/model/userModel';
import { BaseRanking } from './BaseRanking';
import { DialogClose } from '@/shared/components/ui/dialog';

export const ModalRanking: React.FC = () => {
    const {
        modalRank, modalPreviousRank,
        modalStarPoints, modalLotteryCount, modalSlToken,
        fetchLeaderTab, resetModalData
    } = useUserStore();

    // 모달 오픈 시마다 최신 랭크 가져오기
    useEffect(() => {
        fetchLeaderTab();
        // 모달이 닫힐 때 데이터 초기화
        return () => {
            resetModalData();
        };
    }, [fetchLeaderTab, resetModalData]);

    // 모달 데이터가 없으면 기본값 사용
    const rank = modalRank ?? 0;
    const previousRank = modalPreviousRank ?? 0;
    const starPoints = modalStarPoints ?? 0;
    const lotteryCount = modalLotteryCount ?? 0;
    const slToken = modalSlToken ?? 0;

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
