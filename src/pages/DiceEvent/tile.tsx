import React from "react";
import { StarTile, DiceTile, AirplaneTile } from "@/features/DiceEvent";
import Images from "@/shared/assets/images";

interface TileProps {
  id: number;
  onClick: () => void;
  position: number;
  selectingTile: boolean;
  children?: React.ReactNode;
  "data-star"?: string;
  "data-dice"?: string;
}

const Tile: React.FC<TileProps> = ({
  id,
  onClick,
  position,
  selectingTile,
  children,
  "data-star": dataStar,
  "data-dice": dataDice,
}) => {
  const getTileImage = (tileNumber: number): string => {
    switch (tileNumber) {
      case 0:
        return Images.TileHome; // 홈 타일
      case 1:
      case 2:
      case 4:
      case 6:
      case 9:
      case 11:
      case 13:
      case 14:
      case 16:
      case 19:
        return Images.TileStar; // StarTile
      case 3:
      case 7:
      case 12:
      case 17:
        return Images.TileDice; // DiceTile
      case 8:
      case 18:
        return Images.TileAirplane; // AirplaneTile
      case 5:
      case 10:
      case 15:
        return Images.TileGame; // 게임 타일 (SPIN, RPS)
      default:
        return Images.TileDice;
    }
  };

  return (
    <div
      id={id.toString()}
      className={`tile-container ${selectingTile ? 'active' : ''}`}
      onClick={onClick}
      data-star={dataStar}
      data-dice={dataDice}
    >
      {/* 타일 배경 이미지 */}
      <img
        src={getTileImage(id)}
        alt={`Tile ${id}`}
        className="tile-background"
      />
      
      {/* 타일 내용 (아이콘, 텍스트 등) */}
      <div className="tile-content">
        {children}
      </div>
    </div>
  );
};

export default Tile;
