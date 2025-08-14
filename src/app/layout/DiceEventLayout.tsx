import React from "react";
import BottomNavigation from "@/widgets/BottomNav/BottomNav";
import Images from "@/shared/assets/images";
import { useLocation } from "react-router-dom";

const backgroundMap: Record<string, string> = {
  "/previous-rewards": Images.BackgroundLobby,
  "/mission": Images.BackgroundLobby,
  "/reward": Images.BackgroundLobby,
  "/choose-character": Images.BackgroundLobby,
  "/dice-event": Images.BackgroundTopview,
  "/first-reward": Images.BackgroundLobby,
  "/previous-ranking": Images.BackgroundLobby,
  "/edit-nickname": Images.BackgroundLobby,
  "/my-assets": Images.BackgroundLobby,
  "/invite-friends": Images.BackgroundLobby,
  "/invite-friends-list": Images.BackgroundLobby,
  "/reward-history": Images.BackgroundLobby,
  "/hall-of-fame": Images.BackgroundLobby,
  "/inventory": Images.BackgroundHome,
  // 필요시 추가
};

interface DiveEventLayoutProps {
  children: React.ReactNode;
  className?: string;
  hidden?: boolean;
}

const DiceEventLayout: React.FC<DiveEventLayoutProps> = ({
  children,
  className,
  hidden,
}) => {
  const location = useLocation();
  const bgImage = backgroundMap[location.pathname] || Images.BackgroundHome;
  const isInventory = location.pathname === "/inventory";

  // 블러 처리할 페이지 목록
  const blurPages = [
    "/reward",
    "/previous-ranking",
    "/mission",
    "/edit-nickname",
    "/my-assets",
    "/invite-friends",
    "/invite-friends-list",
    "/reward-history",
    "/hall-of-fame",
  ];

  const shouldBlur = blurPages.includes(location.pathname);

  return (
    <div className="relative">
      {/* 블러된 배경 레이어 - 여러 페이지에 적용 */}
      {shouldBlur && (
        <>
          <div
            className="fixed inset-0 z-0"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(15px)",
            }}
          />
          {/* 색상 오버레이 */}
          <div
            className="fixed inset-0 z-0"
            style={{
              backgroundColor: "#42617D",
              opacity: 0.6,
            }}
          />
        </>
      )}

      {/* 메인 컨테이너 */}
      <div
        className={`flex flex-col bg-[#0D1226] items-center ${className || ""}`}
        style={{
          backgroundImage:
            shouldBlur || isInventory ? "none" : `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
        }}
      >
        <div className={`max-w-[600px] w-full h-full relative z-10`}>
          {children}
        </div>
        <BottomNavigation hidden={hidden} />
      </div>
    </div>
  );
};

export default DiceEventLayout;
