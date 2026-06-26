import { Play, Search, Download, ListMusic, Upload } from "lucide-react";
import { usePlayer } from "@/components/PlayerContext";
import { PlayerBar } from "@/components/player/PlayerBar";
import { useEffect } from "react";

const playlists = [
    { title: "Для вас", subtitle: "обновлён сегодня", gradient: "var(--gradient-music-1)" },
    { title: "Открытия", subtitle: "Новое для вас", gradient: "var(--gradient-music-2)" },
    { title: "Новинки", subtitle: "обновлён в субботу", gradient: "var(--gradient-music-3)" },
    { title: "Плейлист дня", subtitle: "Вы слушали: MXEEN", gradient: "var(--gradient-music-4)" },
];

const tabs = ["Главная", "Моя музыка", "Обзор", "Радио", "Обновления"];

const Music = () => {
    const { play, isActive } = usePlayer();
    useEffect(() => {
        if (!isActive) {
            play();
        }
    }, [isActive, play]);

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
                <div className="sticky top-15 z-30 bg-background pb-3 -mt-3 pt-3">
                    <PlayerBar />
                </div>

                <div className="panel-card p-4">
                    <div className="flex items-center gap-1 mb-4">
                        {tabs.map((t, i) => (
                            <button key={t} className={`px-4 py-1.5 rounded-full text-sm ${i === 0 ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60"}`}>{t}</button>
                        ))}
                        <div className="ml-auto flex gap-1 text-muted-foreground">
                            <Download className="w-4 h-4" /><ListMusic className="w-4 h-4" /><Upload className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="relative mb-8">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input className="w-full h-10 pl-9 pr-3 rounded-lg bg-secondary text-sm placeholder:text-muted-foreground focus:outline-none" placeholder="Поиск музыки" />
                    </div>
                    <div className="flex flex-col items-center py-12 gap-3">
                        <button
                            onClick={() => play({ title: "VK Микс", artist: "Персональные рекомендации", duration: "—" })}
                            className="w-14 h-14 rounded-full border-2 border-foreground/40 flex items-center justify-center hover:border-foreground transition-colors"
                        >
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                        </button>
                        <div className="font-semibold">Слушать VK Микс</div>
                        <div className="text-xs text-muted-foreground">Музыкальные рекомендации для вас</div>
                    </div>
                </div>

                <div className="panel-card p-4">
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold">Собрано алгоритмами</span>
                        <button className="text-xs text-primary hover:underline">Настроить рекомендации ›</button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {playlists.map((p) => (
                            <button
                                key={p.title}
                                onClick={() => play({ title: p.title, artist: "VK Музыка", duration: "—" })}
                                className="aspect-square rounded-2xl p-4 flex flex-col justify-between text-foreground relative overflow-hidden text-left hover:scale-[1.02] transition-transform"
                                style={{ background: p.gradient }}
                            >
                                <div>
                                    <div className="font-bold text-lg leading-tight">{p.title}</div>
                                    <div className="text-xs opacity-90 mt-1">{p.subtitle}</div>
                                </div>
                                <div className="w-7 h-7 rounded-full bg-background/20 backdrop-blur flex items-center justify-center">
                                    <ListMusic className="w-3.5 h-3.5" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="panel-card p-4">
                    <div className="font-semibold">Жанры</div>
                </div>
            </div>
        </div>
    );
};

export default Music;
