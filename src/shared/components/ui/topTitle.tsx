import { IoChevronBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useSound } from "@/shared/provider/SoundProvider";
import Audios from "@/shared/assets/audio";

interface TopTitleProps {
  title: string;
  className?: string;
  back?: boolean;
}

const TopTitle: React.FC<TopTitleProps> = ({ title, className, back }) => {
  const navigate = useNavigate();
  const { playSfx } = useSound();

  const handleBackClick = () => {
    if (back) {
      playSfx(Audios.button_click);
      navigate(-1);
    }
  };

  return (
    <div
      className={`h-14 flex items-center  w-full font-bold text-xl ${className} ${
        back ? "justify-between" : "justify-center"
      }`}
      onClick={handleBackClick}
    >
      <IoChevronBackOutline className={`w-6 h-6 ${back ? "" : "hidden"}`} />
      <p
        style={{
          fontFamily: "'ONE Mobile POP', sans-serif",
          fontSize: "30px",
          fontWeight: 400,
          color: "#FFFFFF",
          WebkitTextStroke: "1px #000000",
        }}
      >
        {title}
      </p>
      <div className={`w-6 h-6 ${back ? "" : "hidden"}`}></div>
    </div>
  );
};

export { TopTitle };
