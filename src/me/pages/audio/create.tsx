import { useCallback, useRef, useState } from "react";
import {
    Upload,
    Play,
    Pause,
    MoreHorizontal,
    Music2,
    Eye,
    Heart,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/components/PlayerContext";

type TrackStatus = "uploading" | "processing" | "published";

type MyTrack = {
    id: string;
    title: string;
    artist: string;
    cover: string;
    duration: string;
    date: string;
    plays: number;
    likes: number;
    visibility: "Для всех" | "Не в списке" | "Доступ ограничен";
    status: TrackStatus;
    progress?: number;
};

const seedTracks: MyTrack[] = [
    {
        id: "t1",
        title: "Mask [dub]",
        artist: "resoul.ua",
        cover: "var(--gradient-music-1)",
        duration: "3:57",
        date: "1 нояб. 2025 г.",
        plays: 412,
        likes: 38,
        visibility: "Для всех",
        status: "published",
    },
    {
        id: "t2",
        title: "Glich",
        artist: "resoul.ua",
        cover: "var(--gradient-music-2)",
        duration: "3:46",
        date: "16 окт. 2025 г.",
        plays: 1280,
        likes: 95,
        visibility: "Для всех",
        status: "published",
    },
    {
        id: "t3",
        title: "Space Movie Soundtrack",
        artist: "Starlight UA, Vence, resoul.ua",
        cover: "var(--gradient-music-3)",
        duration: "17:03",
        date: "13 окт. 2025 г.",
        plays: 5021,
        likes: 340,
        visibility: "Для всех",
        status: "published",
    },
];

function formatN(n: number) {
    return n.toLocaleString("ru-RU");
}

export function CreateMusic() {
    const { play, isActive, current, isPlaying, toggle } = usePlayer();
    const [tracks, setTracks] = useState<MyTrack[]>(seedTracks);
    const [dragOver, setDragOver] = useState(false);
    const [editing, setEditing] = useState<MyTrack | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const ingestFiles = useCallback((files: FileList | File[]) => {
        const list = Array.from(files).filter((f) => f.type.startsWith("audio/"));
        if (!list.length) return;

        const covers = [
            "var(--gradient-music-1)",
            "var(--gradient-music-2)",
            "var(--gradient-music-3)",
            "var(--gradient-music-4)",
        ];

        const created: MyTrack[] = list.map((file, i) => ({
            id: crypto.randomUUID(),
            title: file.name.replace(/\.[^/.]+$/, ""),
            artist: "Вы",
            cover: covers[i % covers.length],
            duration: "0:00",
            date: "сейчас",
            plays: 0,
            likes: 0,
            visibility: "Не в списке",
            status: "uploading",
            progress: 0,
        }));

        setTracks((t) => [...created, ...t]);

        created.forEach((track, i) => {
            const id = track.id;
            let progress = 0;
            const tick = () => {
                progress += 10 + Math.random() * 15;
                if (progress >= 100) {
                    setTracks((ts) =>
                        ts.map((t) => (t.id === id ? { ...t, status: "processing", progress: 100 } : t))
                    );
                    setTimeout(() => {
                        setTracks((ts) => ts.map((t) => (t.id === id ? { ...t, status: "published" } : t)));
                    }, 1100);
                    return;
                }
                setTracks((ts) => ts.map((t) => (t.id === id ? { ...t, progress } : t)));
                setTimeout(tick, 220);
            };
            setTimeout(tick, 200 + i * 150);
        });
    }, []);

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.length) ingestFiles(e.dataTransfer.files);
        },
        [ingestFiles]
    );

    const isCurrentTrack = (t: MyTrack) => isActive && current.title === t.title;

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 w-full flex flex-col gap-4">
                <section
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    className={cn(
                        "panel-card rounded-xl border-2 border-dashed p-10 flex flex-col items-center justify-center text-center transition-colors",
                        dragOver ? "border-primary bg-primary/5" : "border-border/70"
                    )}
                >
                    <div className="size-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                        <Upload className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <h2 className="text-lg font-bold">Перетащите треки сюда</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        mp3, wav, flac — или выберите файлы на компьютере
                    </p>
                    <button
                        onClick={() => inputRef.current?.click()}
                        className="mt-5 h-10 px-5 rounded-xl bg-foreground text-background text-sm font-bold hover:opacity-90"
                    >
                        Выбрать файлы
                    </button>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="audio/*"
                        multiple
                        className="hidden"
                        onChange={(e) => e.target.files && ingestFiles(e.target.files)}
                    />
                </section>

                <section className="panel-card rounded-xl border border-border/70">
                    <header className="flex items-center justify-between px-5 py-4 border-b border-border/70">
                        <h2 className="text-lg font-bold">Треки на канале</h2>
                        <span className="text-sm text-muted-foreground">{tracks.length} треков</span>
                    </header>

                    {tracks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
                            <Music2 className="h-8 w-8" />
                            <p className="text-sm">Пока нет загруженных треков</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/70">
                            <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-2 text-xs font-bold text-muted-foreground">
                                <span>Трек</span>
                                <span className="w-28">Доступ</span>
                                <span className="w-20 text-right">Прослушив.</span>
                                <span className="w-20 text-right">Лайки</span>
                                <span className="w-8" />
                            </div>

                            {tracks.map((t) => {
                                const playing = isCurrentTrack(t) && isPlaying;
                                return (
                                    <div
                                        key={t.id}
                                        className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto_auto] gap-3 sm:gap-4 px-5 py-3 items-center"
                                    >
                                        <div className="flex gap-3 min-w-0 items-center">
                                            <button
                                                onClick={() =>
                                                    t.status === "published" &&
                                                    (isCurrentTrack(t)
                                                        ? toggle()
                                                        : play({ title: t.title, artist: t.artist, duration: t.duration }))
                                                }
                                                className="relative size-11 rounded-lg shrink-0 flex items-center justify-center group"
                                                style={{ background: t.cover }}
                                            >
                                                {t.status === "published" ? (
                                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {playing ? (
                                                            <Pause className="size-4 fill-white text-white" />
                                                        ) : (
                                                            <Play className="size-4 fill-white text-white ml-0.5" />
                                                        )}
                                                    </span>
                                                ) : (
                                                    <Music2 className="size-4 text-white/80" />
                                                )}
                                                {t.status !== "published" && (
                                                    <div className="absolute inset-0 rounded-lg bg-background/60 flex items-end p-1">
                                                        <div className="w-full h-1 rounded-full bg-white/20 overflow-hidden">
                                                            <div
                                                                className="h-full bg-white transition-all"
                                                                style={{
                                                                    width: `${t.status === "processing" ? 100 : Math.round(t.progress ?? 0)}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => t.status === "published" && setEditing(t)}
                                                className="min-w-0 text-left"
                                            >
                                                <h3 className={cn("text-sm font-bold line-clamp-1", playing && "text-primary")}>
                                                    {t.title}
                                                </h3>
                                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                                    {t.status === "uploading"
                                                        ? `Загрузка... ${Math.round(t.progress ?? 0)}%`
                                                        : t.status === "processing"
                                                            ? "Обработка трека..."
                                                            : `${t.artist} · ${t.duration}`}
                                                </p>
                                            </button>
                                        </div>

                                        <span className="hidden sm:block w-28 text-xs font-medium text-muted-foreground">
                                            {t.status === "published" ? t.visibility : "Черновик"}
                                        </span>

                                        <span className="hidden sm:flex w-20 items-center justify-end gap-1 text-xs text-muted-foreground tabular-nums">
                                            <Eye className="h-3.5 w-3.5" />
                                            {t.status === "published" ? formatN(t.plays) : "—"}
                                        </span>

                                        <span className="hidden sm:flex w-20 items-center justify-end gap-1 text-xs text-muted-foreground tabular-nums">
                                            <Heart className="h-3.5 w-3.5" />
                                            {t.status === "published" ? formatN(t.likes) : "—"}
                                        </span>

                                        <button
                                            className="hidden sm:flex w-8 h-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
                                            aria-label="Меню трека"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            {editing && (
                <div
                    className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center p-4"
                    onClick={() => setEditing(null)}
                >
                    <div
                        className="panel-card w-full max-w-lg rounded-xl border border-border/70 p-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Детали трека</h3>
                            <button onClick={() => setEditing(null)} className="p-1.5 rounded-full hover:bg-secondary" aria-label="Закрыть">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex gap-3 mb-4">
                            <div className="size-20 rounded-lg shrink-0" style={{ background: editing.cover }} />
                            <div className="min-w-0 text-sm text-muted-foreground">
                                <p>{editing.date}</p>
                                <p>{formatN(editing.plays)} прослушиваний</p>
                                <p>{formatN(editing.likes)} лайков</p>
                            </div>
                        </div>

                        <label className="block text-xs font-bold text-muted-foreground mb-1">Название</label>
                        <input
                            value={editing.title}
                            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                            className="w-full h-10 rounded-lg bg-secondary px-3 text-sm mb-3 focus:outline-none"
                        />

                        <label className="block text-xs font-bold text-muted-foreground mb-1">Исполнитель</label>
                        <input
                            value={editing.artist}
                            onChange={(e) => setEditing({ ...editing, artist: e.target.value })}
                            className="w-full h-10 rounded-lg bg-secondary px-3 text-sm mb-4 focus:outline-none"
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setEditing(null)}
                                className="h-9 px-4 rounded-xl text-sm font-medium hover:bg-secondary"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={() => {
                                    setTracks((ts) => ts.map((t) => (t.id === editing.id ? editing : t)));
                                    setEditing(null);
                                }}
                                className="h-9 px-4 rounded-xl bg-foreground text-background text-sm font-bold hover:opacity-90"
                            >
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CreateMusic;