import { Play, Pause, Plus, Mic2, MoreHorizontal, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/components/PlayerContext";

type Episode = {
    id: string;
    number: number;
    title: string;
    description: string;
    date: string;
    duration: string;
    plays: number;
};

const episodes: Episode[] = [
    {
        id: "e1",
        number: 12,
        title: "Как мы делали heatmap-график для плеера",
        description: "Разбираем архитектуру плеера, почему выбрали HLS и как считали популярность моментов видео.",
        date: "12 мая 2026 г.",
        duration: "42:18",
        plays: 1240,
    },
    {
        id: "e2",
        number: 11,
        title: "HLS-стриминг с нуля",
        description: "Гость выпуска — инженер видео-инфраструктуры. Обсуждаем сегментацию и адаптивный битрейт.",
        date: "28 апр. 2026 г.",
        duration: "55:02",
        plays: 980,
    },
    {
        id: "e3",
        number: 10,
        title: "Touch-жесты для видеоплееров",
        description: "Почему мобильный UX плеера — отдельная дисциплина, и какие жесты реально нужны.",
        date: "14 апр. 2026 г.",
        duration: "31:47",
        plays: 2110,
    },
];

function fmtN(n: number) {
    return n.toLocaleString("ru-RU");
}

export function MusicPodcasts() {
    const { play, isActive, isPlaying, current, toggle } = usePlayer();

    const isCurrent = (e: Episode) => isActive && current.title === e.title;

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 w-full flex flex-col gap-4">
                <section className="panel-card rounded-xl border border-border/70 p-5">
                    <div className="flex items-start gap-4">
                        <div className="size-20 rounded-xl shrink-0 flex items-center justify-center" style={{ background: "var(--gradient-music-4)" }}>
                            <Mic2 className="size-8 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-muted-foreground">Подкаст</p>
                            <h1 className="text-xl font-bold mt-0.5">resoul.ua — за кадром</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Разговоры о звуке, видео и инструментах, которыми мы пользуемся каждый день
                            </p>
                        </div>
                        <button className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-foreground text-background text-xs font-bold hover:opacity-90 shrink-0">
                            <Plus className="size-4" /> Новый выпуск
                        </button>
                    </div>
                </section>

                <section className="panel-card rounded-xl border border-border/70">
                    <header className="flex items-center justify-between px-5 py-4 border-b border-border/70">
                        <h2 className="text-lg font-bold">Выпуски</h2>
                        <span className="text-sm text-muted-foreground">{episodes.length} выпусков</span>
                    </header>
                    <div className="divide-y divide-border/70">
                        {episodes.map((e) => {
                            const playing = isCurrent(e) && isPlaying;
                            return (
                                <div key={e.id} className="flex items-start gap-3 px-5 py-4">
                                    <button
                                        onClick={() =>
                                            isCurrent(e)
                                                ? toggle()
                                                : play({ title: e.title, artist: `Выпуск ${e.number}`, duration: e.duration })
                                        }
                                        className="size-10 rounded-full bg-secondary flex items-center justify-center hover:bg-accent shrink-0 mt-0.5"
                                    >
                                        {playing ? (
                                            <Pause className="size-4 fill-current" />
                                        ) : (
                                            <Play className="size-4 fill-current ml-0.5" />
                                        )}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>Выпуск {e.number}</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="size-3" /> {e.date}
                                            </span>
                                        </div>
                                        <h3 className={cn("text-sm font-bold mt-1", playing && "text-primary")}>{e.title}</h3>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{e.description}</p>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                            <span>{e.duration}</span>
                                            <span>{fmtN(e.plays)} прослушиваний</span>
                                        </div>
                                    </div>
                                    <button className="size-8 flex items-center justify-center rounded-full hover:bg-secondary text-muted-foreground shrink-0" aria-label="Меню">
                                        <MoreHorizontal className="size-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default MusicPodcasts;