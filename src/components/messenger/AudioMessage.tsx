import { Play, Pause } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  url: string;
  duration: string;
  isOwn?: boolean;
}

const BAR_COUNT = 36;

const generateBars = (seed: string): number[] => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const x = Math.sin(hash * (i + 1) * 0.37) * 43758.5453;
    const raw = x - Math.floor(x);
    const env = Math.sin((i / (BAR_COUNT - 1)) * Math.PI);
    return 0.18 + raw * 0.6 * env + env * 0.2;
  });
};

const AudioMessage = ({ url, duration, isOwn }: Props) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState("0:00");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const bars = useRef<number[]>(generateBars(url));

  const tick = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    const p = a.duration ? a.currentTime / a.duration : 0;
    setProgress(p);
    const s = Math.floor(a.currentTime);
    setCurrent(`${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopTick = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.addEventListener("ended", () => {
        setPlaying(false);
        setProgress(0);
        setCurrent("0:00");
        stopTick();
      });
    }
    if (playing) {
      audioRef.current.pause();
      stopTick();
    } else {
      audioRef.current.play();
      rafRef.current = requestAnimationFrame(tick);
    }
    setPlaying(!playing);
  };

  useEffect(() => () => { stopTick(); audioRef.current?.pause(); }, []);

  const active = isOwn ? "rgba(255,255,255,0.95)" : "hsl(var(--primary))";
  const inactive = isOwn ? "rgba(255,255,255,0.4)" : "hsl(var(--primary) / 0.35)";
  const timeColor = isOwn ? "rgba(255,255,255,0.7)" : "hsl(var(--muted-foreground))";

  const bw = 2.5, bg = 1.5;
  const total = BAR_COUNT * (bw + bg) - bg;
  const h = 28;

  const onSeek = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const r = (e.clientX - rect.left) / rect.width;
    const a = audioRef.current;
    if (a && a.duration) {
      a.currentTime = r * a.duration;
      setProgress(r);
    }
  };

  return (
    <div className="flex items-center gap-2.5 min-w-[220px]">
      <button
        onClick={toggle}
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        style={{ background: isOwn ? "rgba(255,255,255,0.2)" : "hsl(var(--primary) / 0.12)" }}
        aria-label={playing ? "Пауза" : "Воспроизвести"}
      >
        {playing
          ? <Pause size={15} style={{ color: active }} />
          : <Play size={15} style={{ color: active, marginLeft: 2 }} />}
      </button>
      <div className="flex-1 flex flex-col gap-1">
        <svg
          width="100%" height={h} viewBox={`0 0 ${total} ${h}`} preserveAspectRatio="none"
          className="cursor-pointer block" onClick={onSeek}
        >
          {bars.current.map((bh, i) => {
            const x = i * (bw + bg);
            const barH = Math.max(3, bh * h);
            const y = (h - barH) / 2;
            const filled = i / BAR_COUNT < progress;
            return (
              <rect key={i} x={x} y={y} width={bw} height={barH} rx={bw / 2}
                fill={filled ? active : inactive} />
            );
          })}
        </svg>
        <div className="flex justify-between text-[11px]" style={{ color: timeColor, lineHeight: 1 }}>
          <span>{playing ? current : "0:00"}</span>
          <span>{duration}</span>
        </div>
      </div>
    </div>
  );
};

export default AudioMessage;
