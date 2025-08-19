import React from 'react';
import SelectCharacter from './SelectCharacter';
import { chooseCharacter } from '@/entities/User/api/chooseCharacter';
import { useNavigate } from 'react-router-dom';
import Images from '@/shared/assets/images';

const SelectCharacterPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPet, setSelectedPet] = React.useState<'DOG' | 'CAT'>('DOG');
  
  const handleCharacterSelect = async () => {
    try{
      const response = await chooseCharacter(selectedPet);
      if(response){
        // 정상 반환이면 메인 페이지로 이동
        navigate('/first-reward');
      }else{
        // console.log("캐릭터 선택 에러 발생");
        localStorage.removeItem('accessToken');
        navigate('/');
      }
    }catch(error: any){
      // console.log("다시 시작해보아요.");
      localStorage.removeItem('accessToken');
      navigate('/');
    }
  };

  return (
    <div className="relative min-h-screen">
      <SelectCharacter selectedPet={selectedPet} setSelectedPet={setSelectedPet} />
      <div className="bottom-10 left-0 right-0 absolute flex w-full self-center px-6">
          <button
            className={`h-14 text-white rounded-[10px] w-full mx-6 relative ${
              selectedPet ? 'opacity-100' : 'opacity-50 cursor-not-allowed'
            }`}
            style={{
              background: "linear-gradient(180deg, #50B0FF 0%, #50B0FF 50%, #008DFF 50%, #008DFF 100%)",
              border: "2px solid #76C1FF",
              outline: "2px solid #000000",
              boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 0px 3px 0px 0px rgba(0, 0, 0, 0.1)",
              fontFamily: "'ONE Mobile POP OTF', sans-serif",
              fontSize: '18px',
              fontWeight: 400,
              lineHeight: '22px',
              letterSpacing: '-2.5%',
              textAlign: 'center',
              verticalAlign: 'middle',
              color: '#fff',
              WebkitTextStroke: '2px #000',
            }}
            disabled={!selectedPet}
            onClick={handleCharacterSelect}
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
              확인
          </button>
        </div>
    </div>
  );
};

export default SelectCharacterPage;
