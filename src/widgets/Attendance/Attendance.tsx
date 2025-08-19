// // Attendance.tsx
// import React, { useState } from "react";
// import AttendanceDay from "@/features/AttendanceDay/components/AttendanceDay";
// import { useUserStore } from "@/entities/User/model/userModel";
// import requestAttendance from "@/entities/User/api/requestAttendance";
// import Images from "@/shared/assets/images";
// import useWalletStore from "@/shared/store/useWalletStore";
// import { connectWallet } from "@/shared/services/walletService";
// import testingAttendance from "@/entities/User/api/testAttendance";
// import { useSound } from "@/shared/provider/SoundProvider";
// import Audios from "@/shared/assets/audio";
// import okxAttendance from "@/entities/User/api/okxAttendance";
// import { useSDK } from '@/shared/hooks/useSDK';



// type DayKeys = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

// interface AttendanceProps {
//   /** Tailwind width 클래스를 지정해 너비를 커스터마이징 */
//   customWidth?: string;
// };

// const getTodayDay = (): DayKeys => {
//   const days: DayKeys[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
//   const today = new Date();
//   return days[today.getDay()];
// };

// const Attendance: React.FC<AttendanceProps> = ({ customWidth }) => {
//    const { weekAttendance, setWeekAttendance } = useUserStore();
//    const [today] = useState<DayKeys>(getTodayDay());
//    const { playSfx } = useSound();
//    const { walletAddress, provider, sdk, walletType } = useWalletStore();
//    const [isConnecting, setIsConnecting] = useState(false);
//    const [showModal, setShowModal] = useState(false);
//    const [message, setMessage] = useState("");
//    const { isInitialized } = useSDK();

//   // 출석 상태 결정 로직
//   const getStatus = (day: DayKeys) => {
//     const attendanceData: { [key in DayKeys]: boolean | null } = {
//       SUN: weekAttendance.sun,
//       MON: weekAttendance.mon,
//       TUE: weekAttendance.tue,
//       WED: weekAttendance.wed,
//       THU: weekAttendance.thu,
//       FRI: weekAttendance.fri,
//       SAT: weekAttendance.sat
//     };

//     if (attendanceData[day]) return "checked";
//     if (day === today) return "today";

//     const daysOfWeek: DayKeys[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
//     const todayIndex = daysOfWeek.indexOf(today);
//     const dayIndex = daysOfWeek.indexOf(day);

//     return dayIndex < todayIndex ? "missed" : "default";
//   };

//   const days: DayKeys[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
//   const isTodayUnattended = days.some((day) => getStatus(day) === "today");



//    const handleAttendanceClick = async () => {
//       try {
//          if (!isInitialized) {
//             console.log('[Attendance] SDK가 아직 초기화되지 않았습니다.');
//             setShowModal(true);
//             setMessage("출석 체크 중 오류가 발생했습니다.");
//             return;
//          }

//          if (!sdk) {
//             console.log('[Attendance] SDK가 초기화되지 않았습니다.');
//             setShowModal(true);
//             setMessage("출석 체크 중 오류가 발생했습니다.");
//             return;
//          }

//          const provider = sdk.getWalletProvider();
//          const accounts = await provider.request({ method: 'kaia_accounts' }) as string[];
//          const isConnected = accounts && accounts.length > 0;

//          if (!isConnected) {
//             console.log('[Attendance] 지갑이 연결되어 있지 않습니다.');
//             setShowModal(true);
//             setMessage("출석 체크 중 오류가 발생했습니다.");
//             return;
//          }

        
//       } catch (error: any) {
//          console.error('[Attendance] 출석체크 중 오류 발생:', error);
//          setShowModal(true);
//          setMessage("출석 체크 중 오류가 발생했습니다.");
//       }
//    };

//   return (
//     <div className="mt-4">
//       <div
//         id="attendance"
//         onClick={isTodayUnattended ? handleAttendanceClick : undefined}
//         className={`relative grid grid-cols-7 gap-2 bg-box min-h-24 md:h-32 text-white text-xs ${
//           customWidth ? customWidth : "w-full md:w-[552px]"
//         } ${isTodayUnattended ? "border-2 border-yellow-400 animate-pulse rounded-lg" : ""}`}
//       >
//         {days.map((day) => {
//           const status = getStatus(day);
//          const displayDay = `출석.day.${day}`;
//           return (
//             <AttendanceDay
//               key={day}
//               day={day}
//               displayDay={displayDay}
//               status={status}
//             />
//           );
//         })}
//         {isTodayUnattended && (
//           <img
//             src={Images.attendanceNote}
//             alt="Attendance Note"
//             className="absolute top-[-4px] right-[-4px] w-[20px] h-[20px]"
//           />
//         )}
//       </div>
//       <p className="flex items-start justify-start w-full font-medium text-xs md:text-sm mt-2 text-white">
//         * 별 보상 <br/> * 7일 연속 출석 시 보상
//       </p>
      

//       {/* 출첵 성공 여부 알림 모달창 */}
//       {showModal && (
//          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 w-full z-[9999]">
//             <div className="bg-white text-black p-6 rounded-lg text-center w-[70%] max-w-[550px]">
//                   {/* 문구 설정 */}
//                   <p>{message}</p>
//                   <button
//                      className="mt-4 px-4 py-2 bg-[#0147E5] text-white rounded-lg"
//                      onClick={() => {
//                         playSfx(Audios.button_click);
//                         setShowModal(false);
//                      }}>
//                      OK
//                   </button>
//             </div>
//          </div>
//       )}
//     </div>
//   );
// };

// export default Attendance;
