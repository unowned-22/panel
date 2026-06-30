import { useCallback, useRef, useState } from "react";
import {
    Upload,
    Play,
    MoreHorizontal,
    Globe,
    MessageSquare,
    Eye,
    X,
    Film,
} from "lucide-react";
import { cn } from "@/lib/utils";

type UploadStatus = "uploading" | "processing" | "published";

type MyVideo = {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    duration: string;
    date: string;
    views: number;
    comments: number;
    visibility: "Для всех" | "Не в списке" | "Доступ ограничен";
    status: UploadStatus;
    progress?: number; // 0-100, only while uploading
};

const seedVideos: MyVideo[] = [
    {
        id: "v1",
        title: "Mask - resoul.ua [dub]",
        description: "#neurofunk #neurofunkdnb #drumandbass #liquidfunk #resoul.ua",
        thumbnail: "/post-photo-1.jpg",
        duration: "3:57",
        date: "1 нояб. 2025 г.",
        views: 5,
        comments: 0,
        visibility: "Для всех",
        status: "published",
    },
    {
        id: "v2",
        title: "Glich - resoul.ua",
        description: "#house #music #electronicmusic #dubplate #housemusic",
        thumbnail: "/post-music-cover.jpg",
        duration: "3:46",
        date: "16 окт. 2025 г.",
        views: 17,
        comments: 0,
        visibility: "Для всех",
        status: "published",
    },
    {
        id: "v3",
        title: "Space Movie Soundtrack - Starlight UA & Vence & resoul.ua",
        description: "#house #music #electronicmusic #dubplate #neurofunk #drumandbass #techno",
        thumbnail: "/story-1.jpg",
        duration: "17:03",
        date: "13 окт. 2025 г.",
        views: 50,
        comments: 0,
        visibility: "Для всех",
        status: "published",
    },
];

function formatViews(n: number) {
    return n.toLocaleString("ru-RU");
}

function fileToDuration(): string {
    // Placeholder until real metadata is read from the file
    return "0:00";
}

export function CreateVideo() {
    const [videos, setVideos] = useState<MyVideo[]>(seedVideos);
    const [dragOver, setDragOver] = useState(false);
    const [editing, setEditing] = useState<MyVideo | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const ingestFiles = useCallback((files: FileList | File[]) => {
        const list = Array.from(files).filter((f) => f.type.startsWith("video/"));
        if (!list.length) return;

        const created: MyVideo[] = list.map((file, i) => ({
            id: crypto.randomUUID(),
            title: file.name.replace(/\.[^/.]+$/, ""),
            description: "test {count}".replace('{count}', String(i)),
            thumbnail: "",
            duration: fileToDuration(),
            date: "сейчас",
            views: 0,
            comments: 0,
            visibility: "Не в списке",
            status: "uploading",
            progress: 0,
        }));

        setVideos((v) => [...created, ...v]);

        created.forEach((video, i) => {
            const id = video.id;
            let progress = 0;
            const tick = () => {
                progress += 8 + Math.random() * 12;
                if (progress >= 100) {
                    setVideos((vs) =>
                        vs.map((v) => (v.id === id ? { ...v, status: "processing", progress: 100 } : v))
                    );
                    setTimeout(() => {
                        setVideos((vs) =>
                            vs.map((v) => (v.id === id ? { ...v, status: "published" } : v))
                        );
                    }, 1400);
                    return;
                }
                setVideos((vs) => vs.map((v) => (v.id === id ? { ...v, progress } : v)));
                setTimeout(tick, 250);
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
                    <h2 className="text-lg font-bold">Перетащите видео сюда</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        или выберите файл на компьютере — оно появится в списке ниже
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
                        accept="video/*"
                        multiple
                        className="hidden"
                        onChange={(e) => e.target.files && ingestFiles(e.target.files)}
                    />
                </section>

                <section className="panel-card rounded-xl border border-border/70">
                    <header className="flex items-center justify-between px-5 py-4 border-b border-border/70">
                        <h2 className="text-lg font-bold">Контент на канале</h2>
                        <span className="text-sm text-muted-foreground">{videos.length} видео</span>
                    </header>

                    {videos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
                            <Film className="h-8 w-8" />
                            <p className="text-sm">Пока нет загруженных видео</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/70">
                            <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-2 text-xs font-bold text-muted-foreground">
                                <span>Видео</span>
                                <span className="w-28">Доступ</span>
                                <span className="w-24 text-right">Просмотры</span>
                                <span className="w-24 text-right">Комментарии</span>
                                <span className="w-8" />
                            </div>

                            {videos.map((v) => (
                                <div
                                    key={v.id}
                                    className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto_auto] gap-3 sm:gap-4 px-5 py-3 items-center"
                                >
                                    <button
                                        onClick={() => v.status === "published" && setEditing(v)}
                                        className="flex gap-3 min-w-0 text-left"
                                    >
                                        <div className="relative w-28 sm:w-32 aspect-video rounded-lg overflow-hidden bg-secondary shrink-0">
                                            {v.thumbnail ? (
                                                <img src={v.thumbnail} alt={v.title} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center">
                                                    <Film className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                            )}
                                            {v.status === "published" && (
                                                <div className="absolute bottom-1 right-1 rounded bg-background/75 px-1 text-[10px] font-bold">
                                                    {v.duration}
                                                </div>
                                            )}
                                            {v.status !== "published" && (
                                                <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                                                    <div className="w-3/4 h-1 rounded-full bg-white/15 overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary transition-all"
                                                            style={{ width: `${v.status === "processing" ? 100 : Math.round(v.progress ?? 0)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-bold line-clamp-1">{v.title}</h3>
                                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                                {v.status === "uploading"
                                                    ? `Загрузка... ${Math.round(v.progress ?? 0)}%`
                                                    : v.status === "processing"
                                                        ? "Обработка видео..."
                                                        : v.description || v.date}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{v.date}</p>
                                        </div>
                                    </button>

                                    <span className="hidden sm:flex w-28 items-center gap-1 text-xs font-medium text-muted-foreground">
                                        <Globe className="h-3.5 w-3.5" />
                                        {v.status === "published" ? v.visibility : "Черновик"}
                                    </span>

                                    <span className="hidden sm:flex w-24 items-center justify-end gap-1 text-xs text-muted-foreground tabular-nums">
                                        <Eye className="h-3.5 w-3.5" />
                                        {v.status === "published" ? formatViews(v.views) : "—"}
                                    </span>

                                    <span className="hidden sm:flex w-24 items-center justify-end gap-1 text-xs text-muted-foreground tabular-nums">
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        {v.status === "published" ? formatViews(v.comments) : "—"}
                                    </span>

                                    <button
                                        className="hidden sm:flex w-8 h-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
                                        aria-label="Меню видео"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
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
                            <h3 className="text-lg font-bold">Детали видео</h3>
                            <button onClick={() => setEditing(null)} className="p-1.5 rounded-full hover:bg-secondary" aria-label="Закрыть">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex gap-3 mb-4">
                            <div className="relative w-32 aspect-video rounded-lg overflow-hidden bg-secondary shrink-0">
                                {editing.thumbnail ? (
                                    <img src={editing.thumbnail} alt={editing.title} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center">
                                        <Play className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 text-sm text-muted-foreground">
                                <p>{editing.date}</p>
                                <p>{formatViews(editing.views)} просмотров</p>
                                <p>{formatViews(editing.comments)} комментариев</p>
                            </div>
                        </div>

                        <label className="block text-xs font-bold text-muted-foreground mb-1">Название</label>
                        <input
                            value={editing.title}
                            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                            className="w-full h-10 rounded-lg bg-secondary px-3 text-sm mb-3 focus:outline-none"
                        />

                        <label className="block text-xs font-bold text-muted-foreground mb-1">Описание</label>
                        <textarea
                            value={editing.description}
                            onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                            rows={3}
                            className="w-full rounded-lg bg-secondary px-3 py-2 text-sm mb-4 focus:outline-none resize-none"
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
                                    setVideos((vs) => vs.map((v) => (v.id === editing.id ? editing : v)));
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

export default CreateVideo;