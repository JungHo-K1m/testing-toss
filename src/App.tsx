// import React, { useState, useEffect } from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import ScrollToTop from "./shared/components/ui/scrollTop";
// import AppInitializer from "./app/components/AppInitializer";
// import { SoundProvider } from "./shared/provider/SoundProvider";
// import Audios from "./shared/assets/audio";
// import "./App.css";

// // 페이지 컴포넌트들
// import SelectCharacterPage from "./pages/SelectCharacter";
// import DiceEvent from "@/pages/DiceEvent";
// import MissionPage from "@/pages/MissionPage";
// import Reward from "@/pages/RewardPage";
// import InviteFriends from "@/pages/InviteFriends";
// import InviteFriendsList from "./pages/InviteFriendsList";
// import SlotMachine from "@/pages/SlotMachine";
// import DiceEventLayout from "./app/layout/DiceEventLayout";
// import MyAssets from "./pages/MyAssets";
// import RewardHistory from "./pages/RewardHistory";
// import FirstRewardPage from "./pages/FirstReward";
// import SettingsPage from "./pages/SettingsPage";
// import PolicyDetailPage from "./pages/PolicyDetail";
// import SoundSetting from "./pages/SoundSetting";
// import PreviousRanking from "./pages/PreviousRanking";
// import EditNickname from "./pages/EditNickname";
// import Inventory from "./pages/Inventory";
// import HallofFame from "./pages/HallofFame";

// const App: React.FC = () => {
//   const [isInitialized, setIsInitialized] = useState(false);

//   console.log("[App] Component rendered, isInitialized:", isInitialized);
//   console.log("[App] Component state:", { isInitialized });

//   useEffect(() => {
//     console.log("[App] useEffect triggered");
//     const preventContextMenu = (e: { preventDefault: () => void }) => {
//       e.preventDefault();
//     };

//     document.addEventListener("contextmenu", preventContextMenu);

//     return () => {
//       document.removeEventListener("contextmenu", preventContextMenu);
//     };
//   }, []);

//   const handleInitialized = () => {
//     console.log("[App] handleInitialized called");
//     setIsInitialized(true);
//   };

//   console.log("[App] About to render, isInitialized:", isInitialized);

//   return (
//     <div style={{ 
//       minHeight: "100vh", 
//       backgroundColor: "#f0f0f0",
//       padding: "20px"
//     }}>
//       <h1 style={{ color: "red", textAlign: "center" }}>App 컴포넌트가 렌더링됨</h1>
//       <ScrollToTop />
//       {!isInitialized ? (
//         <>
//           <div style={{ padding: "20px", textAlign: "center", backgroundColor: "yellow" }}>
//             <h1>AppInitializer 로딩 중...</h1>
//             <p>현재 상태: {isInitialized ? "초기화됨" : "초기화 중"}</p>
//           </div>
//           <AppInitializer onInitialized={handleInitialized} />
//         </>
//       ) : (
//         <SoundProvider bgmSrc={Audios.bgm}>
//           <Routes>
//             {/* DiceEventLayout Pages */}
//             <Route path="/" element={<Navigate to="/dice-event" />} />
//             <Route path="/dice-event" element={<DiceEvent />} />
//             <Route path="/mission" element={<DiceEventLayout><MissionPage /></DiceEventLayout>} />
//             <Route path="/reward" element={<DiceEventLayout><Reward /></DiceEventLayout>} />
//             <Route path="/invite-friends" element={<DiceEventLayout><InviteFriends /></DiceEventLayout>} />
//             <Route path="/my-assets" element={<DiceEventLayout><MyAssets /></DiceEventLayout>} />
//             <Route path="/test" element={<DiceEventLayout><SlotMachine /></DiceEventLayout>} />
//             <Route path="/inventory" element={<DiceEventLayout><Inventory /></DiceEventLayout>} />

//             {/* Hidden Pages */}
//             <Route path="/choose-character" element={<DiceEventLayout hidden={true}><SelectCharacterPage /></DiceEventLayout>} />
//             <Route path="/reward-history" element={<DiceEventLayout hidden={true}><RewardHistory /></DiceEventLayout>} />
//             <Route path="/first-reward" element={<DiceEventLayout hidden={true}><FirstRewardPage /></DiceEventLayout>} />
//             <Route path="/settings" element={<DiceEventLayout hidden={true}><SettingsPage /></DiceEventLayout>} />
//             <Route path="/policy-detail" element={<DiceEventLayout hidden={true}><PolicyDetailPage /></DiceEventLayout>} />
//             <Route path="/invite-friends-list" element={<DiceEventLayout hidden={true}><InviteFriendsList /></DiceEventLayout>} />
//             <Route path="/sound-setting" element={<DiceEventLayout hidden={true}><SoundSetting /></DiceEventLayout>} />
//             <Route path="/previous-ranking" element={<DiceEventLayout hidden={true}><PreviousRanking /></DiceEventLayout>} />
//             <Route path="/edit-nickname" element={<DiceEventLayout hidden={true}><EditNickname /></DiceEventLayout>} />
//             <Route path="/hall-of-fame" element={<DiceEventLayout hidden={true}><HallofFame /></DiceEventLayout>} />
//           </Routes>
//         </SoundProvider>
//       )}
//     </div>
//   );
// };

// export default App;

// 간단한 테스트용 App 컴포넌트
import React, { useState } from "react";
import AppInitializer from "./app/components/AppInitializer";

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  console.log("[App] Simple App component rendered, isInitialized:", isInitialized);

  const handleInitialized = () => {
    console.log("[App] handleInitialized called");
    setIsInitialized(true);
  };

  return (
    <div>
      {/* {!isInitialized ? (
        <div>
          <AppInitializer onInitialized={handleInitialized} />
        </div>
      ) : (
        <div style={{
          padding: "40px",
          backgroundColor: "lightgreen",
          textAlign: "center",
          borderRadius: "8px",
          border: "2px solid green"
        }}>
          <h2 style={{ color: "green" }}>✅ 초기화 완료!</h2>
          <p>AppInitializer가 성공적으로 작동했습니다.</p>
          
          <AppInitializer onInitialized={handleInitialized} />
        </div>
      )} */}
      <AppInitializer onInitialized={handleInitialized} />
    </div>
  );
};

export default App;