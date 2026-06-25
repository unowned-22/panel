import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Music2, Play, Pause, SkipBack, SkipForward, Search } from "lucide-react";
import { usePlayer } from "../PlayerContext";
import { useState } from "react";

const recent = [
  { title: "Happy Nation", artist: "MXEEN", duration: "2:20" },
  { title: "Cheri Cheri Lady", artist: "DJ JEDY, Niki Four", duration: "2:52" },
];

export const PlayerPopover = () => {
  const { isActive, isPlaying, current, toggle, play } = usePlayer();
  const [tab, setTab] = useState<"queue" | "home" | "my">("queue");
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`flex items-center gap-2 h-10 rounded-full px-2.5 transition-colors ${
            isActive ? "bg-secondary/60 hover:bg-secondary" : "hover:bg-secondary"
          }`}
          aria-label="Плеер"
        >
          {isActive ? (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); toggle(); }}
                className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center"
              >
                {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
              </button>
              <span className="text-xs text-foreground/80 max-w-45 truncate">
                {current.artist} — {current.title}
              </span>
            </>
          ) : (
            <Music2 className="w-5 h-5 text-foreground/80" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-95 p-0 bg-popover border-border" sideOffset={8}>
        <div className="p-3 border-b border-border flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center text-muted-foreground"><SkipBack className="w-4 h-4 fill-current" /></button>
          <button onClick={toggle} className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center">
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-muted-foreground"><SkipForward className="w-4 h-4 fill-current" /></button>
          <div className="w-9 h-9 rounded-md ml-1 shrink-0" style={{ background: "var(--gradient-story)" }} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{current.title}</div>
            <div className="text-xs text-muted-foreground truncate">{current.artist}</div>
          </div>
        </div>
        <div className="p-3">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input className="w-full h-9 pl-9 pr-3 rounded-lg bg-secondary text-sm placeholder:text-muted-foreground focus:outline-none" placeholder="Поиск музыки" />
          </div>
          <div className="flex gap-1 mb-2">
            {([["queue","Очередь"],["home","Главная"],["my","Моя музыка"]] as const).map(([k,l]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`px-3 py-1 rounded-full text-xs ${tab === k ? "bg-secondary text-foreground font-semibold" : "text-muted-foreground hover:bg-secondary/60"}`}
              >{l}</button>
            ))}
          </div>
          <div className="flex flex-col">
            {recent.map((t) => (
              <button
                key={t.title}
                onClick={() => play(t)}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-secondary/60 text-left"
              >
                <div className="w-10 h-10 rounded shrink-0" style={{ background: "var(--gradient-story)" }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{t.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{t.artist}</div>
                </div>
                <span className="text-xs text-muted-foreground">{t.duration}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{isActive ? "Сейчас играет: VK Микс" : "Плеер не активен"}</span>
          <button className="text-primary hover:underline">Очистить очередь</button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
