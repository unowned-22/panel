import { useState } from "react";
import { Play, Pause, Radio as RadioIcon, SkipForward, Shuffle, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/components/PlayerContext";

type SeedSource = { id: string; label: string; active: boolean };

const sources: SeedSource[] = [
    { id: "my-tracks", label: "Мои треки", active: true },
    { id: "similar", label: "Похожие артисты", active: true },
    { id: "listeners", label: "Что слушают мои слушатели", active: false },
];

const upNext = [
    { title: "Glich", artist: "resoul.ua", cover: "var(--gradient-music-2)", duration: "3:46" },
    { title: "Terraform", artist: "resoul.ua", cover: "var(--gradient-music-3)", duration: "3:14" },
    { title: "Foreign Frequency", artist: "resoul.ua", cover: "var(--gradient-music-4)", duration: "4:02" },
    { title: "Meridian", artist: "resoul.ua", cover: "var(--gradient-music-1)", duration: "3:45" },
];

export function MusicRadio() {
    const { play, isActive, isPlaying, current, toggle } = usePlayer();
    const [enabledSources, setEnabledSources] = useState(sources);
    const [history, setHistory] = useState<typeof upNext>([]);

    const radioActive = isActive && current.title === "Радио resoul.ua";

    const startRadio = () => {
        play({ title: "Радио resoul.ua", artist: "Бесконечный плейлист по артисту", duration: "—" });
    };

    const skipNext = () => {
        const [next, ...rest] = upNext;
        console.log(...rest, history)
        if (!next) return;
        setHistory((h) => [next, ...h]);
        play({ title: next.title, artist: next.artist, duration: next.duration });
    };

    const toggleSource = (id: string) => {
        setEnabledSources((s) => s.map((x) => (x.id === id ? { ...x, active: !x.active } : x)));
    };

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 w-full flex flex-col gap-4">
                <section className="panel-card rounded-xl border border-border/70 p-6 flex flex-col items-center text-center">
                    <div
                        className={cn(
                            "size-24 rounded-full flex items-center justify-center mb-4 transition-all",
                            radioActive && isPlaying && "animate-pulse"
                        )}
                        style={{ background: "var(--gradient-story)" }}
                    >
                        <RadioIcon className="size-9 text-white" />
                    </div>
                    <h1 className="text-xl font-bold">Радио resoul.ua</h1>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                        Бесконечный плейлист на основе ваших треков и похожих исполнителей — для слушателей,
                        которые хотят просто включить и не выбирать
                    </p>

                    <div className="flex items-center gap-3 mt-5">
                        <button
                            onClick={() => (radioActive ? toggle() : startRadio())}
                            className="size-14 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-90"
                        >
                            {radioActive && isPlaying ? (
                                <Pause className="size-5 fill-current" />
                            ) : (
                                <Play className="size-5 fill-current ml-0.5" />
                            )}
                        </button>
                        <button
                            onClick={skipNext}
                            className="size-10 rounded-full bg-secondary flex items-center justify-center hover:bg-accent text-muted-foreground"
                            aria-label="Следующий трек"
                        >
                            <SkipForward className="size-4 fill-current" />
                        </button>
                    </div>

                    {radioActive && (
                        <p className="text-xs text-muted-foreground mt-3">
                            Сейчас играет: <span className="text-foreground font-medium">{current.title}</span>
                        </p>
                    )}
                </section>

                <section className="panel-card rounded-xl border border-border/70 p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Settings2 className="size-4 text-muted-foreground" />
                        <h2 className="text-sm font-bold">Источники для радио</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {enabledSources.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => toggleSource(s.id)}
                                className={cn(
                                    "h-9 px-3 rounded-full text-xs font-medium transition-colors",
                                    s.active ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:bg-accent"
                                )}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="panel-card rounded-xl border border-border/70">
                    <header className="flex items-center justify-between px-5 py-4 border-b border-border/70">
                        <h2 className="text-lg font-bold">Дальше в эфире</h2>
                        <Shuffle className="size-4 text-muted-foreground" />
                    </header>
                    <div className="divide-y divide-border/70">
                        {upNext.map((t) => (
                            <button
                                key={t.title}
                                onClick={() => play({ title: t.title, artist: t.artist, duration: t.duration })}
                                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-secondary/50 text-left"
                            >
                                <div className="size-10 rounded-lg shrink-0" style={{ background: t.cover }} />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">{t.title}</div>
                                    <div className="text-xs text-muted-foreground truncate">{t.artist}</div>
                                </div>
                                <span className="text-xs text-muted-foreground">{t.duration}</span>
                            </button>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default MusicRadio;