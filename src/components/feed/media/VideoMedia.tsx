import { useState } from "react";
import { Play, SquarePlay } from "lucide-react";
import type { VideoMedia as VideoMediaT } from "../types";

interface Props {
  video: VideoMediaT;
}

export const VideoMedia = ({ video }: Props) => {
  const [playing, setPlaying] = useState(false);

  if (video.kind === "youtube") {
    if (playing) {
      return (
        <div className="relative w-full aspect-video bg-black">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    const thumb =
      video.thumbnail ?? `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
    return (
      <button
        onClick={() => setPlaying(true)}
        className="relative w-full aspect-video bg-black group block"
        aria-label={`Play ${video.title}`}
      >
        <img
          src={thumb}
          alt={video.title}
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center shadow-elevated">
            <Play className="w-7 h-7 text-destructive-foreground fill-current ml-1" />
          </div>
        </div>
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/70 backdrop-blur text-xs font-medium">
          <SquarePlay className="w-3.5 h-3.5 text-destructive" /> YouTube
        </div>
      </button>
    );
  }

  // upload
  if (playing && video.src) {
    return (
      <video
        src={video.src}
        controls
        autoPlay
        className="w-full max-h-160 bg-black"
      />
    );
  }
  return (
    <button
      onClick={() => setPlaying(true)}
      className="relative w-full aspect-video bg-black group block"
      aria-label="Play video"
    >
      <img
        src={video.thumbnail}
        alt="video"
        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
        loading="lazy"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-background/80 backdrop-blur flex items-center justify-center">
          <Play className="w-7 h-7 fill-current ml-1" />
        </div>
      </div>
      <span className="absolute bottom-3 right-3 text-xs font-medium bg-background/70 backdrop-blur px-2 py-1 rounded-md">
        {video.duration}
      </span>
    </button>
  );
};
