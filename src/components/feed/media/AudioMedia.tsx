import { useState } from "react";
import { Play, Pause, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AudioMedia as AudioMediaT, AudioTrack } from "../types";

const TrackRow = ({ track }: { track: AudioTrack }) => {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/40 transition-colors">
      <button
        onClick={() => setPlaying((p) => !p)}
        className="relative w-12 h-12 rounded-lg overflow-hidden bg-secondary shrink-0 flex items-center justify-center group"
        aria-label={playing ? "Pause" : "Play"}
      >
        {track.cover && (
          <img src={track.cover} alt={track.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        )}
        <div className="absolute inset-0 bg-background/40 group-hover:bg-background/60 transition-colors flex items-center justify-center">
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </div>
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{track.title}</div>
        <div className="text-xs text-muted-foreground truncate">{track.artist}</div>
      </div>
      <div className="text-xs text-muted-foreground tabular-nums">{track.duration}</div>
    </div>
  );
};

const VoiceMessage = ({ duration, waveform }: { duration: string; waveform: number[] }) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/40">
      <button
        onClick={() => {
          setPlaying((p) => !p);
          setProgress((p) => (p === 0 ? 0.4 : p));
        }}
        className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0"
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>
      <div className="flex-1 flex items-center gap-0.75 h-8">
        {waveform.map((v, i) => {
          const active = i / waveform.length < progress;
          return (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-full transition-colors",
                active ? "bg-primary" : "bg-muted-foreground/40",
              )}
              style={{ height: `${Math.max(15, v * 100)}%` }}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
        <Mic className="w-3.5 h-3.5" />
        {duration}
      </div>
    </div>
  );
};

interface Props {
  audio: AudioMediaT;
}

export const AudioMedia = ({ audio }: Props) => {
  if (audio.kind === "voice") {
    return (
      <div className="px-4 pb-3">
        <VoiceMessage duration={audio.duration} waveform={audio.waveform} />
      </div>
    );
  }
  return (
    <div className="px-2 pb-2">
      <TrackRow track={audio} />
    </div>
  );
};

export const AudioCollection = ({ tracks }: { tracks: AudioTrack[] }) => (
  <div className="px-2 pb-2 flex flex-col">
    {tracks.map((t, i) => (
      <TrackRow key={i} track={t} />
    ))}
  </div>
);
