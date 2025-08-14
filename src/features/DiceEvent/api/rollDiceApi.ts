// src/features/DiceEvent/api/rollDiceApi.ts

import api from '@/shared/api/axiosInstance';

// RollDiceResponseData 인터페이스 정의 및 export (새로운 API 구조에 맞게 수정)
export interface RollDiceResponseData {
  rank: number;
  star: number;
  key: number;        // ticket에서 key로 변경
  dice: number;
  diceResult: number;
  tileSequence: number;
  level: number;
  exp: number;
}

export const rollDiceAPI = async (gauge: number, sequence: number): Promise<RollDiceResponseData> => {
  const response = await api.post('/roll-dice', { gauge, sequence });

  if (response.data.code === 'OK') {
    return response.data.data;
  } else {
    // console.error('rollDiceAPI Error:', response.data.message);
    throw new Error(response.data.message || 'Roll dice failed');
  }
};
