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
    Loader2,
    AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useMyChannel, useChannelVideos, useVideoUpload } from "@/hooks/use-videos";
import type { Video, VideoVisibility } from "@/api/videos";

const visibilityLabels: Record<string, string> = {
    public: "Для всех",
    unlisted: "Не в списке",
    private: "Доступ ограничен",
};

function formatViews(n: number) {
    return n.toLocaleString("ru-RU");
}

function formatDuration(sec: number) {
    if (!sec || sec <= 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDate(iso: string) {
    try {
        return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
    } catch {
        return iso;
    }
}

export function CreateVideo() {
    const { toast } = useToast();
    const { data: channel, isLoading: channelLoading, createChannel, creating } = useMyChannel();
    const {
        data: videos = [],
        isLoading: videosLoading,
        updateVideo,
        deleteVideo,
        publishVideo,
        unpublishVideo,
        refresh,
    } = useChannelVideos(channel?.id);
    const { uploads, upload, dismiss } = useVideoUpload(channel?.id, refresh);

    const [dragOver, setDragOver] = useState(false);
    const [editing, setEditing] = useState<Video | null>(null);
    const [savingEdit, setSavingEdit] = useState(false);
    const [channelName, setChannelName] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const ingestFiles = useCallback(
        (files: FileList | File[]) => {
            if (!channel) return;
            upload(files);
        },
        [channel, upload]
    );

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.length) ingestFiles(e.dataTransfer.files);
        },
        [ingestFiles]
    );

    const activeUploads = uploads.filter((u) => u.status === "uploading" || u.status === "error");

    const handleCreateChannel = async () => {
        if (!channelName.trim()) return;
        try {
            await createChannel({ name: channelName.trim() });
            toast({ title: "Канал создан" });
        } catch (err) {
            toast({ title: "Не удалось создать канал", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
        }
    };

    const handlePublishToggle = async (v: Video) => {
        try {
            if (v.status === "published") {
                await unpublishVideo(v.id);
            } else {
                await publishVideo(v.id);
            }
        } catch (err) {
            toast({ title: "Не удалось изменить статус", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
        }
    };

    const handleDelete = async (v: Video) => {
        if (!window.confirm(`Удалить видео «${v.title}»?`)) return;
        try {
            await deleteVideo(v.id);
        } catch (err) {
            toast({ title: "Не удалось удалить видео", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
        }
    };

    const handleSaveEdit = async () => {
        if (!editing) return;
        setSavingEdit(true);
        try {
            await updateVideo(editing.id, {
                title: editing.title,
                description: editing.description,
                category: editing.category,
                tags: editing.tags,
                visibility: editing.visibility,
            });
            setEditing(null);
        } catch (err) {
            toast({ title: "Не удалось сохранить изменения", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
        } finally {
            setSavingEdit(false);
        }
    };

    if (channelLoading) {
        return (
            <div className="flex items-center justify-center py-24 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
            </div>
        );
    }

    if (!channel) {
        return (
            <div className="flex-1 min-w-0 w-full flex flex-col gap-4">
                <section className="panel-card rounded-xl border-2 border-dashed border-border/70 p-10 flex flex-col items-center justify-center text-center">
                    <div className="size-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                        <Film className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <h2 className="text-lg font-bold">Сначала создайте видеоканал</h2>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                        Чтобы загружать видео, нужен канал. Придумайте название — остальное можно поменять позже.
                    </p>
                    <div className="mt-5 flex w-full max-w-xs gap-2">
                        <input
                            value={channelName}
                            onChange={(e) => setChannelName(e.target.value)}
                            placeholder="Название канала"
                            className="flex-1 h-10 rounded-xl bg-secondary px-3 text-sm focus:outline-none"
                        />
                        <button
                            onClick={handleCreateChannel}
                            disabled={!channelName.trim() || creating}
                            className="h-10 px-4 rounded-xl bg-foreground text-background text-sm font-bold hover:opacity-90 disabled:opacity-50"
                        >
                            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Создать"}
                        </button>
                    </div>
                </section>
            </div>
        );
    }

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

                {activeUploads.length > 0 && (
                    <section className="panel-card rounded-xl border border-border/70 divide-y divide-border/70">
                        {activeUploads.map((u) => (
                            <div key={u.localId} className="flex items-center gap-3 px-5 py-3">
                                <div className="relative w-14 h-9 rounded-md bg-secondary shrink-0 flex items-center justify-center overflow-hidden">
                                    {u.status === "error" ? (
                                        <AlertTriangle className="h-4 w-4 text-destructive" />
                                    ) : (
                                        <Film className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium line-clamp-1">{u.file.name}</p>
                                    {u.status === "error" ? (
                                        <p className="text-xs text-destructive line-clamp-1">{u.error || "Ошибка загрузки"}</p>
                                    ) : (
                                        <div className="w-full h-1 rounded-full bg-secondary overflow-hidden mt-1">
                                            <div className="h-full bg-primary transition-all" style={{ width: `${u.progress}%` }} />
                                        </div>
                                    )}
                                </div>
                                {u.status === "error" && (
                                    <button
                                        onClick={() => dismiss(u.localId)}
                                        className="p-1.5 rounded-full hover:bg-secondary shrink-0"
                                        aria-label="Скрыть"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </section>
                )}

                <section className="panel-card rounded-xl border border-border/70">
                    <header className="flex items-center justify-between px-5 py-4 border-b border-border/70">
                        <h2 className="text-lg font-bold">Контент на канале</h2>
                        <span className="text-sm text-muted-foreground">
                            {videosLoading ? "…" : `${videos.length} видео`}
                        </span>
                    </header>

                    {!videosLoading && videos.length === 0 ? (
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

                            {videos.map((v) => {
                                const isProcessing = v.status === "processing" || v.status === "draft";
                                return (
                                    <div
                                        key={v.id}
                                        className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto_auto] gap-3 sm:gap-4 px-5 py-3 items-center"
                                    >
                                        <button
                                            onClick={() => setEditing(v)}
                                            className="flex gap-3 min-w-0 text-left"
                                        >
                                            <div className="relative w-28 sm:w-32 aspect-video rounded-lg overflow-hidden bg-secondary shrink-0">
                                                {v.thumbnail_url || v.cover_url ? (
                                                    <img
                                                        src={v.thumbnail_url || v.cover_url}
                                                        alt={v.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center">
                                                        <Film className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                )}
                                                {!isProcessing && (
                                                    <div className="absolute bottom-1 right-1 rounded bg-background/75 px-1 text-[10px] font-bold">
                                                        {formatDuration(v.duration_sec)}
                                                    </div>
                                                )}
                                                {isProcessing && (
                                                    <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                                                        <div className="w-3/4 h-1 rounded-full bg-white/15 overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary transition-all"
                                                                style={{ width: `${v.processing_progress ?? 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-bold line-clamp-1">{v.title}</h3>
                                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                                    {v.status === "processing"
                                                        ? v.processing_stage || "Обработка видео..."
                                                        : v.description || formatDate(v.created_at)}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(v.created_at)}</p>
                                            </div>
                                        </button>

                                        <span className="hidden sm:flex w-28 items-center gap-1 text-xs font-medium text-muted-foreground">
                                            <Globe className="h-3.5 w-3.5" />
                                            {v.status === "published" ? visibilityLabels[v.visibility] ?? v.visibility : "Черновик"}
                                        </span>

                                        <span className="hidden sm:flex w-24 items-center justify-end gap-1 text-xs text-muted-foreground tabular-nums">
                                            <Eye className="h-3.5 w-3.5" />
                                            {formatViews(v.views_count)}
                                        </span>

                                        <span className="hidden sm:flex w-24 items-center justify-end gap-1 text-xs text-muted-foreground tabular-nums">
                                            <MessageSquare className="h-3.5 w-3.5" />
                                            {formatViews(v.comments_count)}
                                        </span>

                                        <div className="hidden sm:block relative group/menu">
                                            <button
                                                className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
                                                aria-label="Меню видео"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </button>
                                            <div className="hidden group-hover/menu:flex flex-col absolute right-0 top-full z-10 w-44 rounded-xl border border-border/70 bg-popover shadow-lg py-1">
                                                <button
                                                    onClick={() => handlePublishToggle(v)}
                                                    className="text-left px-3 py-2 text-sm hover:bg-secondary"
                                                >
                                                    {v.status === "published" ? "Снять с публикации" : "Опубликовать"}
                                                </button>
                                                <button
                                                    onClick={() => setEditing(v)}
                                                    className="text-left px-3 py-2 text-sm hover:bg-secondary"
                                                >
                                                    Редактировать
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(v)}
                                                    className="text-left px-3 py-2 text-sm text-destructive hover:bg-secondary"
                                                >
                                                    Удалить
                                                </button>
                                            </div>
                                        </div>
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
                    onClick={() => !savingEdit && setEditing(null)}
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
                                {editing.thumbnail_url || editing.cover_url ? (
                                    <img
                                        src={editing.thumbnail_url || editing.cover_url}
                                        alt={editing.title}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center">
                                        <Play className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 text-sm text-muted-foreground">
                                <p>{formatDate(editing.created_at)}</p>
                                <p>{formatViews(editing.views_count)} просмотров</p>
                                <p>{formatViews(editing.comments_count)} комментариев</p>
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
                            className="w-full rounded-lg bg-secondary px-3 py-2 text-sm mb-3 focus:outline-none resize-none"
                        />

                        <label className="block text-xs font-bold text-muted-foreground mb-1">Доступ</label>
                        <select
                            value={editing.visibility}
                            onChange={(e) => setEditing({ ...editing, visibility: e.target.value as VideoVisibility })}
                            className="w-full h-10 rounded-lg bg-secondary px-3 text-sm mb-4 focus:outline-none"
                        >
                            {Object.entries(visibilityLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setEditing(null)}
                                className="h-9 px-4 rounded-xl text-sm font-medium hover:bg-secondary"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={savingEdit}
                                className="h-9 px-4 rounded-xl bg-foreground text-background text-sm font-bold hover:opacity-90 disabled:opacity-50"
                            >
                                {savingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : "Сохранить"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CreateVideo;