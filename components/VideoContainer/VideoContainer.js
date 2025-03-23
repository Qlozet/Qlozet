import posterImage from "../../public/assets/image/dashboard.png"
import { Play } from "lucide-react";

const VideoContainer = ({ height }) => {
  return (
    <div className="relative w-full h-auto lg:h-[611px] lg:w-[915px] px-6 lg:mx-auto my-6 ">
      <video
        src=""
        style={{
          height,
          backgroundImage: `url(${posterImage.src})`,
          backgroundPosition: "center",
          backgroundSize: "100%",
          backgroundRepeat: "no-repeat",
        }}
        className="w-full h-full shadow-lg rounded-[26px]"
      />
      <div className="w-full h-full flex items-center justify-center absolute top-0 left-0">
        <button className="border-none outline-none w-[100px] h-[100px] rounded-full bg-[rgba(255,255,255,.97)] shadow-md flex items-center justify-center">
          <Play />
        </button>
      </div>
    </div>
  );
};

export default VideoContainer