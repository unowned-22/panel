import { Play } from "lucide-react";

interface Props {
  thumbnail: string;
  duration: string;
  url: string;
}

const VideoMessage = ({ thumbnail, duration }: Props) => (
  <div className="relative mt-1 rounded-lg overflow-hidden cursor-pointer">
    <img src={thumbnail} alt="" className="w-full max-h-50 object-cover" />
    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
      <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
        <Play size={22} className="text-white ml-0.5" fill="white" />
      </div>
    </div>
    <span className="absolute bottom-2 right-2 text-[11px] text-white bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm">
      {duration}
    </span>
  </div>
);

export default VideoMessage;
