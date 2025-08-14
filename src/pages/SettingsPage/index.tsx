import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TopTitle } from '@/shared/components/ui';
import { FaChevronLeft } from 'react-icons/fa';
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";
import deleteUser from '@/entities/User/api/delUser';
import CardGameModal from '../CardGame/CardGameModal';

const SettingsPage: React.FC =() => {
    const navigate = useNavigate();
    const { playSfx } = useSound();
    const [isCardFlipGameActive, setIsCardFlipGameActive] = useState(false);

    // navigate에 policyType을 전달
    const handleNavigation = (policyType: string) => {
        playSfx(Audios.button_click);
        navigate('/policy-detail', { state: { policyType } });
    };

    const handleLanguage = () => {
        playSfx(Audios.button_click);
        navigate('/choose-language');
    };

    const handleSound = () => {
        playSfx(Audios.button_click);
        navigate('/sound-setting');
    };

    const handleDel = async() => {
        deleteUser();
    }

    const handleCardFlipGameEnd = (result: 'win' | 'lose', reward?: { type: string; amount: number }) => {
        console.log('Game Result:', result, reward);
        setIsCardFlipGameActive(false);
    };

    return(
        <div className="flex flex-col items-center text-white px-6 min-h-screen">
            <TopTitle title="Settings" back={true} />

            <div className="w-full">
                {/* 서비스 이용 약관 */}
                <div 
                    className="bg-gray-800 p-4 rounded-lg mb-4 flex justify-between items-center"
                    onClick={() => handleNavigation('service')}>
                    <div>
                        <p className="font-semibold">서비스 이용 약관</p>
                    </div>
                    <FaChevronLeft className="text-lg cursor-pointer transform rotate-180" />
                </div>
                {/* 개인정보 처리 방침 */}
                <div 
                    className="bg-gray-800 p-4 rounded-lg mb-4 flex justify-between items-center"
                    onClick={() => handleNavigation('privacy')}>
                    <div>
                        <p className="font-semibold">개인정보 처리 방침</p>
                    </div>
                    <FaChevronLeft className="text-lg cursor-pointer transform rotate-180" />
                </div>
                {/* 전자상거래 이용약관 */}
                <div 
                    className="bg-gray-800 p-4 rounded-lg mb-4 flex justify-between items-center"
                    onClick={() => handleNavigation('commerce')}>
                    <div>
                        <p className="font-semibold">전자상거래 이용약관</p>
                    </div>
                    <FaChevronLeft className="text-lg cursor-pointer transform rotate-180" />
                </div>
                
                <div 
                    className="bg-gray-800 p-4 rounded-lg mb-4 flex justify-between items-center"
                    onClick={handleLanguage}>
                    <div>
                        <p className="font-semibold">언어</p>
                    </div>
                    <FaChevronLeft className="text-lg cursor-pointer transform rotate-180" />
                </div>
                <div 
                    className="bg-gray-800 p-4 rounded-lg mb-4 flex justify-between items-center"
                    onClick={handleSound}>
                    <div>
                        <p className="font-semibold">사운드</p>
                    </div>
                    <FaChevronLeft className="text-lg cursor-pointer transform rotate-180" />
                </div>

                {/* 카드 뒤집기 게임 테스트 버튼 */}
                <div 
                    className="bg-gray-800 p-4 rounded-lg mb-4 flex justify-between items-center"
                    onClick={() => setIsCardFlipGameActive(true)}>
                    <div>
                        <p className="font-semibold">카드 뒤집기 게임 테스트</p>
                    </div>
                    <FaChevronLeft className="text-lg cursor-pointer transform rotate-180" />
                </div>
            </div>

            
            {/* 카드 뒤집기 게임 */}
            {isCardFlipGameActive && (
                <CardGameModal
                    onClose={() => setIsCardFlipGameActive(false)}
                />
            )}
        </div>
    );
};

export default SettingsPage;