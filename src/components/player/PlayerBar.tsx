import { SkipBack, Play, Pause, SkipForward, Shuffle, Repeat, Plus, ThumbsDown, Sparkles, Type, Volume2, Radio, Share2, ListMusic, X } from "lucide-react";
import { usePlayer } from "../PlayerContext";

export const PlayerBar = () => {
  const { isActive, isPlaying, current, toggle, stop } = usePlayer();
  if (!isActive) return null;

  return (
    <div className="panel-card p-3 flex items-center gap-2">
      <button className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground"><SkipBack className="w-4 h-4 fill-current" /></button>
      <button onClick={toggle} className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center">
        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
      </button>
      <button className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground"><SkipForward className="w-4 h-4 fill-current" /></button>
      <button className="w-9 h-9 flex items-center justify-center text-muted-foreground"><Shuffle className="w-4 h-4" /></button>
      <button className="w-9 h-9 flex items-center justify-center text-muted-foreground"><Repeat className="w-4 h-4" /></button>
      <div className="w-10 h-10 rounded-md ml-2 shrink-0" style={{ background: "var(--gradient-story)" }} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate">{current.title}</div>
        <div className="text-xs text-muted-foreground truncate">{current.artist}</div>
        <div className="h-0.5 bg-secondary mt-1.5 rounded-full overflow-hidden"><div className="h-full w-1/3 bg-foreground rounded-full" /></div>
      </div>
      <button className="w-9 h-9 flex items-center justify-center text-muted-foreground"><Plus className="w-4 h-4" /></button>
      <button className="w-9 h-9 flex items-center justify-center text-muted-foreground"><ThumbsDown className="w-4 h-4" /></button>
      <button className="w-9 h-9 flex items-center justify-center text-muted-foreground"><Sparkles className="w-4 h-4" /></button>
      <button className="w-9 h-9 flex items-center justify-center text-muted-foreground"><Type className="w-4 h-4" /></button>
      <span className="text-xs text-muted-foreground px-2">0:27</span>
      <Volume2 className="w-4 h-4 text-muted-foreground" />
      <div className="w-20 h-0.5 bg-secondary rounded-full"><div className="h-full w-3/4 bg-foreground rounded-full" /></div>
      <button className="w-9 h-9 flex items-center justify-center text-muted-foreground"><ListMusic className="w-4 h-4" /></button>
      <button className="w-9 h-9 flex items-center justify-center text-muted-foreground"><Radio className="w-4 h-4" /></button>
      <button className="w-9 h-9 flex items-center justify-center text-muted-foreground"><Share2 className="w-4 h-4" /></button>
      <button onClick={stop} className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground" title="Закрыть"><X className="w-4 h-4" /></button>
    </div>
  );
};
