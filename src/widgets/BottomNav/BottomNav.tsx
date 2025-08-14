import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useNavigationStore } from "@/shared/store/navigationStore";
import { useSound } from "@/shared/provider/SoundProvider";
import Images from "@/shared/assets/images";
import Audios from "@/shared/assets/audio";

interface BottomNavigationProps {
  hidden?: boolean;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ hidden }) => {
  const { selected, setSelected } = useNavigationStore();
  // 사운드 훅
  const { playSfx } = useSound();

  const handleNavigation = (path: string) => {
    setSelected(path);
    playSfx(Audios.button_click);
  };

  return (
    <div
      id="bottomNav"
      className={`fixed bottom-8 self-center rounded-full flex flex-row items-center justify-evenly bottomNav-bg h-16 w-80 font-medium text-[10px] shadow-lg z-30 ${
        hidden ? "hidden" : ""
      }`}
      style={{
        background: "rgba(255,255,255,0.65)",
        borderRadius: "52px",
        boxShadow: "0px 2px 2px 0px rgba(0,0,0,0.4)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <Link to="/inventory" onClick={() => handleNavigation("/inventory")}>
        <motion.div
          className="flex flex-col items-center justify-center rounded-lg w-12 h-12 relative"
          animate={{
            scale: selected === "/inventory" ? 1 : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          {selected === "/inventory" && (
            <motion.div
              className="absolute"
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "76px",
                backgroundColor: "#005EAA80",
                zIndex: 0,
                boxShadow: "inset 0px 0px 4px 3px rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
          <motion.div
            className="flex items-center justify-center relative z-10"
            animate={{
              scale: selected === "/inventory" ? 1 : 1,
              y: selected === "/inventory" ? -8 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={Images.MenuShop}
              className="w-10 h-10"
              style={{ width: "40px", height: "40px" }}
            />
          </motion.div>
          {selected === "/inventory" && (
            <motion.p
              className="absolute -bottom-0.5"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "12px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              인벤토리
            </motion.p>
          )}
        </motion.div>
      </Link>

      <Link to="/reward" onClick={() => handleNavigation("/reward")}>
        <motion.div
          className="flex flex-col items-center justify-center rounded-lg w-12 h-12 relative"
          animate={{
            scale: selected === "/reward" ? 1 : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          {selected === "/reward" && (
            <motion.div
              className="absolute"
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "76px",
                backgroundColor: "#005EAA80",
                zIndex: 0,
                boxShadow: "inset 0px 0px 4px 3px rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
          <motion.div
            className="flex items-center justify-center relative z-10"
            animate={{
              scale: selected === "/reward" ? 1 : 1,
              y: selected === "/reward" ? -8 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={Images.MenuReward}
              className="w-10 h-10"
              style={{ width: "40px", height: "40px" }}
            />
          </motion.div>
          {selected === "/reward" && (
            <motion.p
              className="absolute -bottom-0.5"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "12px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              리워드
            </motion.p>
          )}
        </motion.div>
      </Link>

      <Link to="/dice-event" onClick={() => handleNavigation("/dice-event")}>
        <motion.div
          className="flex flex-col items-center justify-center rounded-lg w-12 h-12 relative"
          animate={{
            scale: selected === "/dice-event" ? 1 : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          {selected === "/dice-event" && (
            <motion.div
              className="absolute"
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "76px",
                backgroundColor: "#005EAA80",
                zIndex: 0,
                boxShadow: "inset 0px 0px 4px 3px rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
          <motion.div
            className="flex items-center justify-center relative z-10"
            animate={{
              scale: selected === "/dice-event" ? 1 : 1,
              y: selected === "/dice-event" ? -8 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={Images.MenuMain}
              className="w-10 h-10"
              style={{ width: "40px", height: "40px" }}
            />
          </motion.div>
          {selected === "/dice-event" && (
            <motion.p
              className="absolute -bottom-0.5"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "12px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              게임
            </motion.p>
          )}
        </motion.div>
      </Link>

      <Link to="/mission" onClick={() => handleNavigation("/mission")}>
        <motion.div
          className="flex flex-col items-center justify-center rounded-lg w-12 h-12 relative"
          animate={{
            scale: selected === "/mission" ? 1 : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          {selected === "/mission" && (
            <motion.div
              className="absolute"
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "76px",
                backgroundColor: "#005EAA80",
                zIndex: 0,
                boxShadow: "inset 0px 0px 4px 3px rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
          <motion.div
            className="flex items-center justify-center relative z-10"
            animate={{
              scale: selected === "/mission" ? 1 : 1,
              y: selected === "/mission" ? -8 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={Images.MenuMission}
              className="w-10 h-10"
              style={{ width: "40px", height: "40px" }}
            />
          </motion.div>
          {selected === "/mission" && (
            <motion.p
              className="absolute -bottom-0.5"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "12px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              미션
            </motion.p>
          )}
        </motion.div>
      </Link>

      <Link to="/my-assets" onClick={() => handleNavigation("/my-assets")}>
        <motion.div
          className="flex flex-col items-center justify-center rounded-lg w-12 h-12 relative"
          animate={{
            scale: selected === "/my-assets" ? 1 : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          {selected === "/my-assets" && (
            <motion.div
              className="absolute"
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "76px",
                backgroundColor: "#005EAA80",
                zIndex: 0,
                boxShadow: "inset 0px 0px 4px 3px rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
          <motion.div
            className="flex items-center justify-center relative z-10"
            animate={{
              scale: selected === "/my-assets" ? 1 : 1,
              y: selected === "/my-assets" ? -8 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={Images.MenuWallet}
              className="w-10 h-10"
              style={{ width: "40px", height: "40px" }}
            />
          </motion.div>
          {selected === "/my-assets" && (
            <motion.p
              className="absolute -bottom-0.5"
              style={{
                fontFamily: "'ONE Mobile POP', sans-serif",
                fontSize: "12px",
                fontWeight: 400,
                color: "#FFFFFF",
                WebkitTextStroke: "1px #000000",
              }}
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              에셋
            </motion.p>
          )}
        </motion.div>
      </Link>
    </div>
  );
};

export default BottomNavigation;
