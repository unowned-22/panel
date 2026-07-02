import { useState } from "react";
import { Play, Plus, Disc3, X } from "lucide-react";
import { usePlayer } from "@/components/PlayerContext";

type AlbumTrack = { title: string; duration: string };

type Album = {
    id: string;
    title: string;
    type: "Альбом" | "EP" | "Сингл";
    cover: string;
    releaseDate: string;
    tracks: AlbumTrack[];
};

const seedAlbums: Album[] = [
    {
        id: "a1",
        title: "The Isle",
        type: "EP",
        cover: "var(--gradient-music-3)",
        releaseDate: "10 окт. 2025 г.",
        tracks: [
            { title: "Meridian", duration: "3:45" },
            { title: "Foreign Frequency", duration: "4:02" },
            { title: "Terraform", duration: "3:14" },
        ],
    },
    {
        id: "a2",
        title: "Mask",
        type: "Сингл",
        cover: "var(--gradient-music-1)",
        releaseDate: "1 нояб. 2025 г.",
        tracks: [{ title: "Mask [dub]", duration: "3:57" }],
    },
    {
        id: "a3",
        title: "Mythical and Mystical",
        type: "Альбом",
        cover: "var(--gradient-music-2)",
        releaseDate: "9 окт. 2025 г.",
        tracks: [
            { title: "Untamed Dreams", duration: "6:05" },
            { title: "Space Movie Soundtrack", duration: "17:03" },
        ],
    },
];

function totalDuration(tracks: AlbumTrack[]) {
    const totalSec = tracks.reduce((sum, t) => {
        const [m, s] = t.duration.split(":").map(Number);
        return sum + m * 60 + s;
    }, 0);
    const m = Math.floor(totalSec / 60);
    return `${m} мин`;
}

export function MusicAlbums() {
    const { play } = usePlayer();
    const [albums, setAlbums] = useState<Album[]>(seedAlbums);
    const [open, setOpen] = useState<Album | null>(null);
    const [creating, setCreating] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newType, setNewType] = useState<Album["type"]>("EP");

    const createAlbum = () => {
        if (!newTitle.trim()) return;
        const album: Album = {
            id: crypto.randomUUID(),
            title: newTitle.trim(),
            type: newType,
            cover: "var(--gradient-music-4)",
            releaseDate: "черновик",
            tracks: [],
        };
        setAlbums((a) => [album, ...a]);
        setNewTitle("");
        setCreating(false);
        setOpen(album);
    };

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 w-full flex flex-col gap-4">
                <section className="panel-card rounded-xl border border-border/70">
                    <header className="flex items-center justify-between px-5 py-4 border-b border-border/70">
                        <h1 className="text-lg font-bold">Релизы</h1>
                        <button
                            onClick={() => setCreating(true)}
                            className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-foreground text-background text-xs font-bold hover:opacity-90"
                        >
                            <Plus className="size-4" /> Новый релиз
                        </button>
                    </header>

                    {creating && (
                        <div className="px-5 py-4 border-b border-border/70 flex flex-wrap items-center gap-2">
                            <input
                                autoFocus
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Название релиза"
                                className="h-9 rounded-lg bg-secondary px-3 text-sm focus:outline-none flex-1 min-w-40"
                            />
                            <select
                                value={newType}
                                onChange={(e) => setNewType(e.target.value as Album["type"])}
                                className="h-9 rounded-lg bg-secondary px-3 text-sm focus:outline-none"
                            >
                                <option value="Сингл">Сингл</option>
                                <option value="EP">EP</option>
                                <option value="Альбом">Альбом</option>
                            </select>
                            <button
                                onClick={createAlbum}
                                className="h-9 px-4 rounded-lg bg-foreground text-background text-xs font-bold hover:opacity-90"
                            >
                                Создать
                            </button>
                            <button
                                onClick={() => setCreating(false)}
                                className="h-9 px-3 rounded-lg text-xs font-medium hover:bg-secondary"
                            >
                                Отмена
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 p-5">
                        {albums.map((a) => (
                            <button
                                key={a.id}
                                onClick={() => setOpen(a)}
                                className="text-left group"
                            >
                                <div
                                    className="aspect-square rounded-xl relative overflow-hidden flex items-end p-3"
                                    style={{ background: a.cover }}
                                >
                                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-background/30 backdrop-blur text-[10px] font-bold text-white">
                                        {a.type}
                                    </div>
                                    <div className="absolute bottom-3 right-3 size-9 rounded-full bg-background/30 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Play className="size-4 fill-white text-white ml-0.5" />
                                    </div>
                                </div>
                                <h3 className="text-sm font-bold mt-2 line-clamp-1">{a.title}</h3>
                                <p className="text-xs text-muted-foreground">
                                    {a.tracks.length} трек{a.tracks.length === 1 ? "" : a.tracks.length < 5 ? "а" : "ов"} · {a.releaseDate}
                                </p>
                            </button>
                        ))}
                    </div>
                </section>
            </div>

            {open && (
                <div
                    className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center p-4"
                    onClick={() => setOpen(null)}
                >
                    <div
                        className="panel-card w-full max-w-lg rounded-xl border border-border/70 p-5 max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-4">
                            <div className="size-24 rounded-xl shrink-0" style={{ background: open.cover }} />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-muted-foreground">{open.type}</p>
                                <h2 className="text-xl font-bold mt-0.5">{open.title}</h2>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {open.releaseDate} · {totalDuration(open.tracks)}
                                </p>
                            </div>
                            <button onClick={() => setOpen(null)} className="p-1.5 rounded-full hover:bg-secondary shrink-0" aria-label="Закрыть">
                                <X className="size-4" />
                            </button>
                        </div>

                        <div className="mt-5 divide-y divide-border/70">
                            {open.tracks.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                                    <Disc3 className="size-7" />
                                    <p className="text-sm">В релизе пока нет треков</p>
                                </div>
                            ) : (
                                open.tracks.map((t, i) => (
                                    <button
                                        key={t.title}
                                        onClick={() => play({ title: t.title, artist: open.title, duration: t.duration })}
                                        className="w-full flex items-center gap-3 py-2.5 hover:bg-secondary/50 -mx-1 px-1 rounded-lg text-left"
                                    >
                                        <span className="w-4 text-xs text-muted-foreground tabular-nums">{i + 1}</span>
                                        <span className="flex-1 text-sm font-medium truncate">{t.title}</span>
                                        <span className="text-xs text-muted-foreground">{t.duration}</span>
                                    </button>
                                ))
                            )}
                        </div>

                        <button className="mt-4 flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
                            <Plus className="size-3.5" /> Добавить трек в релиз
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MusicAlbums;