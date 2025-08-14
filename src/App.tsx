import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./shared/components/ui/scrollTop";
import AppInitializer from "./app/components/AppInitializer";
import { SoundProvider } from "./shared/provider/SoundProvider";
import Audios from "./shared/assets/audio";
import "./App.css";

// 페이지 컴포넌트들
import SelectCharacterPage from "./pages/SelectCharacter";
import DiceEvent from "@/pages/DiceEvent";
import MissionPage from "@/pages/MissionPage";
import Reward from "@/pages/RewardPage";
import InviteFriends from "@/pages/InviteFriends";
import InviteFriendsList from "./pages/InviteFriendsList";
import SlotMachine from "@/pages/SlotMachine";
import DiceEventLayout from "./app/layout/DiceEventLayout";
import MyAssets from "./pages/MyAssets";
import RewardHistory from "./pages/RewardHistory";
import FirstRewardPage from "./pages/FirstReward";
import SettingsPage from "./pages/SettingsPage";
import PolicyDetailPage from "./pages/PolicyDetail";
import SoundSetting from "./pages/SoundSetting";
import PreviousRanking from "./pages/PreviousRanking";
import EditNickname from "./pages/EditNickname";
import Inventory from "./pages/Inventory";
import HallofFame from "./pages/HallofFame";

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCheckingInitialization, setIsCheckingInitialization] =
    useState(true);

  console.log("[App] Component rendered, isInitialized:", isInitialized);

  useEffect(() => {
    console.log("[App] useEffect triggered");

    // 컨텍스트 메뉴 방지
    const preventContextMenu = (e: { preventDefault: () => void }) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", preventContextMenu);

    // 초기화 상태 확인
    const checkInitializationStatus = () => {
      const initializationFlag = localStorage.getItem("isInitialized");
      const accessToken = localStorage.getItem("accessToken");

      console.log("[App] 초기화 상태 확인:", {
        initializationFlag,
        accessToken: accessToken ? "존재함" : "존재하지 않음",
      });

      if (initializationFlag === "true" && accessToken) {
        console.log("[App] 이미 초기화된 상태로 확인됨");
        setIsInitialized(true);
      } else {
        console.log("[App] 초기화가 필요한 상태로 확인됨");
        setIsInitialized(false);
      }

      setIsCheckingInitialization(false);
    };

    // 페이지 로드 시 초기화 상태 확인
    checkInitializationStatus();

    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
    };
  }, []);

  const handleInitialized = () => {
    console.log("[App] handleInitialized called");
    setIsInitialized(true);
    // localStorage에 초기화 완료 플래그 설정
    localStorage.setItem("isInitialized", "true");
  };

  console.log("[App] About to render, isInitialized:", isInitialized);

  // 초기화 상태 확인 중일 때 로딩 표시
  if (isCheckingInitialization) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f0f0f0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            padding: "40px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <h2 style={{ color: "#333", marginBottom: "20px" }}>
            🔄 초기화 상태 확인 중...
          </h2>
          <div style={{ color: "#666" }}>
            사용자 로그인 상태를 확인하고 있습니다.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f0f0f0",
      }}
    >
      <ScrollToTop />
      {!isInitialized ? (
        <>
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              backgroundColor: "#fff3cd",
              border: "1px solid #ffeaa7",
              borderRadius: "4px",
              margin: "20px",
              color: "#856404",
            }}
          >
            <h1>🔐 로그인 필요</h1>
            <p>현재 상태: {isInitialized ? "초기화됨" : "초기화 필요"}</p>
            <p>토스 앱을 통해 로그인을 진행해주세요.</p>
          </div>
          <AppInitializer onInitialized={handleInitialized} />
        </>
      ) : (
        <SoundProvider bgmSrc={Audios.bgm}>
          <Routes>
            {/* DiceEventLayout Pages */}
            <Route path="/" element={<Navigate to="/dice-event" />} />
            <Route path="/dice-event" element={<DiceEvent />} />
            <Route
              path="/mission"
              element={
                <DiceEventLayout>
                  <MissionPage />
                </DiceEventLayout>
              }
            />
            <Route
              path="/reward"
              element={
                <DiceEventLayout>
                  <Reward />
                </DiceEventLayout>
              }
            />
            <Route
              path="/invite-friends"
              element={
                <DiceEventLayout>
                  <InviteFriends />
                </DiceEventLayout>
              }
            />
            <Route
              path="/my-assets"
              element={
                <DiceEventLayout>
                  <MyAssets />
                </DiceEventLayout>
              }
            />
            <Route
              path="/test"
              element={
                <DiceEventLayout>
                  <SlotMachine />
                </DiceEventLayout>
              }
            />
            <Route
              path="/inventory"
              element={
                <DiceEventLayout>
                  <Inventory />
                </DiceEventLayout>
              }
            />

            {/* Hidden Pages */}
            <Route
              path="/choose-character"
              element={
                <DiceEventLayout hidden={true}>
                  <SelectCharacterPage />
                </DiceEventLayout>
              }
            />
            <Route
              path="/reward-history"
              element={
                <DiceEventLayout hidden={true}>
                  <RewardHistory />
                </DiceEventLayout>
              }
            />
            <Route
              path="/first-reward"
              element={
                <DiceEventLayout hidden={true}>
                  <FirstRewardPage />
                </DiceEventLayout>
              }
            />
            <Route
              path="/settings"
              element={
                <DiceEventLayout hidden={true}>
                  <SettingsPage />
                </DiceEventLayout>
              }
            />
            <Route
              path="/policy-detail"
              element={
                <DiceEventLayout hidden={true}>
                  <PolicyDetailPage />
                </DiceEventLayout>
              }
            />
            <Route
              path="/invite-friends-list"
              element={
                <DiceEventLayout hidden={true}>
                  <InviteFriendsList />
                </DiceEventLayout>
              }
            />
            <Route
              path="/sound-setting"
              element={
                <DiceEventLayout hidden={true}>
                  <SoundSetting />
                </DiceEventLayout>
              }
            />
            <Route
              path="/previous-ranking"
              element={
                <DiceEventLayout hidden={true}>
                  <PreviousRanking />
                </DiceEventLayout>
              }
            />
            <Route
              path="/edit-nickname"
              element={
                <DiceEventLayout hidden={true}>
                  <EditNickname />
                </DiceEventLayout>
              }
            />
            <Route
              path="/hall-of-fame"
              element={
                <DiceEventLayout hidden={true}>
                  <HallofFame />
                </DiceEventLayout>
              }
            />
          </Routes>
        </SoundProvider>
      )}
    </div>
  );
};

export default App;
