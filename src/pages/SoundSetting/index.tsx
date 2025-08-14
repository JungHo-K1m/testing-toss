// SoundSetting.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TopTitle } from '@/shared/components/ui';
import { useSoundStore } from '@/shared/store/useSoundStore';
import saveSoundSetting from '@/entities/User/api/saveSoundSetting';
import { HiVolumeOff, HiVolumeUp } from 'react-icons/hi';
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";

const SoundSetting: React.FC = () => {
  const navigate = useNavigate();
  const { playSfx } = useSound();
  const {
    // 마스터
    masterVolume,
    masterMuted,
    setMasterVolume,
    toggleMasterMute,
    // 배경음(BGM)
    bgmVolume,
    bgmMuted,
    setBgmVolume,
    toggleBgmMute,
    // 효과음(SFX)
    sfxVolume,
    sfxMuted,
    setSfxVolume,
    toggleSfxMute,
  } = useSoundStore();

  const handleSave = async () => {
    try {
      // 내부 상대값(0~0.3)을 서버의 절대값(0~10)으로 변환하여 전송
      const soundData = {
        masterVolume: Math.round((masterVolume / 0.3) * 10),
        masterMute: masterMuted,
        backVolume: Math.round((bgmVolume / 0.3) * 10),
        backMute: bgmMuted,
        effectVolume: Math.round((sfxVolume / 0.3) * 10),
        effectMute: sfxMuted,
      };

      const saveResponse = await saveSoundSetting(soundData);

      if (saveResponse) {
        navigate("/dice-event");
      } else {
        alert("사운드 설정 저장에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error: any) {
      alert("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <div className="flex flex-col items-center text-white px-6 min-h-screen">
      <TopTitle title="사운드 설정" back={true} />

      <div className="w-full">
        {/* 1) 마스터 볼륨 */}
        <div className="mb-3">
          <h2 className="text-lg font-semibold mb-2">마스터</h2>
          <div className="bg-gray-800 rounded-full w-full h-14 flex items-center justify-between py-2 px-4">
            <button
              className="bg-[#0147E5] px-4 py-1 rounded-2xl text-sm"
              onClick={() => {
                playSfx(Audios.button_click);
                toggleMasterMute();
              }}
            >
              {masterMuted ? (
                <HiVolumeOff className="text-xl" />
              ) : (
                <HiVolumeUp className="text-xl" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              // 슬라이더 값은 내부 상대값을 0~10 범위로 변환
              value={masterMuted ? 0 : (masterVolume / 0.3) * 10}
              // onChange 시, 내부 상대값으로 변환하여 저장
              onChange={(e) => {
                setMasterVolume((Number(e.target.value) / 10) * 0.3);
              }}
              disabled={masterMuted}
              className="mx-2 flex-1"
            />
            <div className="ml-2 w-10 text-center">
              {masterMuted ? 0 : Math.round((masterVolume / 0.3) * 10)}/10
            </div>
          </div>
        </div>

        {/* 2) 배경음(BGM) */}
        <div className="mb-3">
          <h2 className="text-lg font-semibold mb-2">배경음(BGM)</h2>
          <div className="bg-gray-800 rounded-full w-full h-14 flex items-center justify-between py-2 px-4">
            <button
              className="bg-[#0147E5] px-4 py-1 rounded-2xl text-sm"
              onClick={() => {
                playSfx(Audios.button_click);
                toggleBgmMute();
              }}
            >
              {bgmMuted ? (
                <HiVolumeOff className="text-xl" />
              ) : (
                <HiVolumeUp className="text-xl" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={bgmMuted ? 0 : (bgmVolume / 0.3) * 10}
              onChange={(e) => {
                setBgmVolume((Number(e.target.value) / 10) * 0.3);
              }}
              disabled={bgmMuted}
              className="mx-2 flex-1"
            />
            <div className="ml-2 w-10 text-center">
              {bgmMuted ? 0 : Math.round((bgmVolume / 0.3) * 10)}/10
            </div>
          </div>
        </div>

        {/* 3) 효과음(SFX) */}
        <div className="mb-3">
          <h2 className="text-lg font-semibold mb-2">효과음(SFX)</h2>
          <div className="bg-gray-800 rounded-full w-full h-14 flex items-center justify-between py-2 px-4">
            <button
              className="bg-[#0147E5] px-4 py-1 rounded-2xl text-sm"
              onClick={() => {
                playSfx(Audios.button_click);
                toggleSfxMute();
              }}
            >
              {sfxMuted ? (
                <HiVolumeOff className="text-xl" />
              ) : (
                <HiVolumeUp className="text-xl" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={sfxMuted ? 0 : (sfxVolume / 0.3) * 10}
              onChange={(e) => {
                setSfxVolume((Number(e.target.value) / 10) * 0.3);
              }}
              disabled={sfxMuted}
              className="mx-2 flex-1"
            />
            <div className="ml-2 w-10 text-center">
              {sfxMuted ? 0 : Math.round((sfxVolume / 0.3) * 10)}/10
            </div>
          </div>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="w-full mt-auto mb-6">
        <button
          onClick={() => {
            playSfx(Audios.button_click);
            handleSave();
          }}
          className="bg-[#0147E5] w-full py-4 rounded-full text-base font-medium"
        >
          저장
        </button>
      </div>
    </div>
  );
};

export default SoundSetting;
