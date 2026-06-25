import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, PhoneOff, Video, VideoOff, Volume2 } from "lucide-react";

interface CallScreenProps {
  type: "voice" | "video";
  contactName: string;
  contactAvatar?: string;
  onEnd: () => void;
}

const createRingtone = (ctx: AudioContext) => {
  const gain = ctx.createGain();
  gain.gain.value = 0.12;
  gain.connect(ctx.destination);
  const tone = (freq: number, t0: number, dur: number) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(1, t0 + 0.05);
    env.gain.setValueAtTime(1, t0 + dur - 0.05);
    env.gain.linearRampToValueAtTime(0, t0 + dur);
    osc.connect(env);
    env.connect(gain);
    osc.start(t0);
    osc.stop(t0 + dur);
  };
  for (let i = 0; i < 4; i++) {
    tone(440, i * 3, 0.4);
    tone(480, i * 3 + 0.5, 0.4);
  }
  return gain;
};

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};

const CallScreen = ({ type, contactName, contactAvatar, onEnd }: CallScreenProps) => {
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState<"ringing" | "connected">("ringing");
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    try {
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      createRingtone(ctx);
    } catch {
      // browser blocked, ignore
    }
    return () => {
      ctxRef.current?.close();
      ctxRef.current = null;
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setStatus("connected");
      ctxRef.current?.close();
      ctxRef.current = null;
    }, 2800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (status !== "connected") return;
    const i = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(i);
  }, [status]);

  const initials = contactName.charAt(0).toUpperCase();

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between text-primary-foreground"
      style={{
        background:
          "linear-gradient(180deg, hsl(220 25% 18%) 0%, hsl(220 30% 8%) 100%)",
      }}
    >
      {type === "video" && !videoOff && contactAvatar && (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={contactAvatar}
            alt=""
            className="w-full h-full object-cover blur-md scale-110 opacity-30"
          />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center pt-20">
        <div className="relative">
          {contactAvatar ? (
            <img
              src={contactAvatar}
              alt={contactName}
              className={`rounded-full object-cover border-4 border-primary-foreground/20 ${
                type === "video" ? "w-24 h-24" : "w-32 h-32"
              }`}
            />
          ) : (
            <div
              className={`rounded-full border-4 border-primary-foreground/20 bg-secondary flex items-center justify-center font-bold ${
                type === "video" ? "w-24 h-24 text-3xl" : "w-32 h-32 text-5xl"
              }`}
            >
              {initials}
            </div>
          )}
          {status === "ringing" && (
            <>
              <span className="absolute inset-[-8px] rounded-full border-2 border-primary-foreground/25 animate-ping" />
              <span
                className="absolute inset-[-16px] rounded-full border-2 border-primary-foreground/15 animate-ping"
                style={{ animationDelay: "0.6s" }}
              />
            </>
          )}
        </div>
        <h2 className="text-2xl font-semibold mt-6">{contactName}</h2>
        <p className="text-sm text-primary-foreground/60 mt-1">
          {status === "ringing"
            ? type === "video"
              ? "Видеовызов…"
              : "Вызов…"
            : fmt(duration)}
        </p>
      </div>

      {type === "video" && !videoOff && (
        <div className="absolute top-6 right-6 z-20 w-28 h-40 rounded-2xl overflow-hidden border-2 border-primary-foreground/20 bg-black/40 flex items-center justify-center">
          <span className="text-xs text-primary-foreground/60">Камера</span>
        </div>
      )}

      <div className="relative z-10 pb-16 flex flex-col items-center gap-8">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setMuted((m) => !m)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              muted ? "bg-primary-foreground/30" : "bg-primary-foreground/10 hover:bg-primary-foreground/20"
            }`}
            aria-label={muted ? "Включить микрофон" : "Выключить микрофон"}
          >
            {muted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          {type === "video" && (
            <button
              onClick={() => setVideoOff((v) => !v)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                videoOff ? "bg-primary-foreground/30" : "bg-primary-foreground/10 hover:bg-primary-foreground/20"
              }`}
              aria-label={videoOff ? "Включить камеру" : "Выключить камеру"}
            >
              {videoOff ? <VideoOff size={24} /> : <Video size={24} />}
            </button>
          )}

          <button
            className="w-14 h-14 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center"
            aria-label="Динамик"
          >
            <Volume2 size={24} />
          </button>
        </div>

        <button
          onClick={onEnd}
          className="w-16 h-16 rounded-full bg-destructive hover:bg-destructive/90 flex items-center justify-center transition-colors"
          aria-label="Завершить звонок"
        >
          <PhoneOff size={28} />
        </button>
      </div>
    </div>
  );
};

export default CallScreen;
