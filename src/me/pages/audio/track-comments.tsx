import { useMemo, useState } from "react";
import { ThumbsUp, Clock, MessageSquare, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type TrackComment = {
    id: string;
    author: string;
    avatar: string;
    avatarColor: string;
    text: string;
    createdAt: number;
    likes: number;
    liked?: boolean;
    timestamp?: number; // seconds in track
};

type TrackWithComments = {
    id: string;
    title: string;
    cover: string;
    duration: number; // seconds
    comments: TrackComment[];
};

const tracksWithComments: TrackWithComments[] = [
    {
        id: "t1",
        title: "Mask [dub]",
        cover: "var(--gradient-music-1)",
        duration: 237,
        comments: [
            {
                id: "c1",
                author: "alex.dev",
                avatar: "AD",
                avatarColor: "bg-blue-600",
                text: "этот дроп на 1:20 просто космос",
                createdAt: Date.now() - 1000 * 60 * 60 * 5,
                likes: 12,
                timestamp: 80,
            },
            {
                id: "c2",
                author: "mira.k",
                avatar: "MK",
                avatarColor: "bg-pink-600",
                text: "качество сведения топ",
                createdAt: Date.now() - 1000 * 60 * 60 * 24,
                likes: 4,
            },
        ],
    },
    {
        id: "t2",
        title: "Glich",
        cover: "var(--gradient-music-2)",
        duration: 226,
        comments: [
            {
                id: "c3",
                author: "nightowl",
                avatar: "NO",
                avatarColor: "bg-green-700",
                text: "бас на 0:42 ломает динамики, обожаю",
                createdAt: Date.now() - 1000 * 60 * 60 * 50,
                likes: 9,
                timestamp: 42,
            },
        ],
    },
];

function relTime(ts: number) {
    const d = (Date.now() - ts) / 1000;
    if (d < 3600) return `${Math.floor(d / 60)} мин назад`;
    if (d < 86400) return `${Math.floor(d / 3600)} ч назад`;
    return `${Math.floor(d / 86400)} дн назад`;
}

function fmtTs(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
}

export function MusicTrackComments() {
    const [tracks, setTracks] = useState(tracksWithComments);
    const [expanded, setExpanded] = useState<Set<string>>(new Set(tracks.map((t) => t.id)));
    const [drafts, setDrafts] = useState<Record<string, string>>({});

    const toggleExpand = (id: string) => {
        setExpanded((e) => {
            const next = new Set(e);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const submit = (trackId: string) => {
        const text = (drafts[trackId] || "").trim();
        if (!text) return;
        setTracks((ts) =>
            ts.map((t) =>
                t.id !== trackId
                    ? t
                    : {
                        ...t,
                        comments: [
                            {
                                id: crypto.randomUUID(),
                                author: "вы",
                                avatar: "ВЫ",
                                avatarColor: "bg-red-600",
                                text,
                                createdAt: Date.now(),
                                likes: 0,
                            },
                            ...t.comments,
                        ],
                    }
            )
        );
        setDrafts((d) => ({ ...d, [trackId]: "" }));
    };

    const toggleLike = (trackId: string, commentId: string) => {
        setTracks((ts) =>
            ts.map((t) =>
                t.id !== trackId
                    ? t
                    : {
                        ...t,
                        comments: t.comments.map((c) =>
                            c.id !== commentId ? c : { ...c, liked: !c.liked, likes: c.likes + (c.liked ? -1 : 1) }
                        ),
                    }
            )
        );
    };

    const totalComments = useMemo(() => tracks.reduce((s, t) => s + t.comments.length, 0), [tracks]);

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 w-full flex flex-col gap-4">
                <section className="panel-card rounded-xl border border-border/70 p-5 flex items-center justify-between">
                    <h1 className="text-lg font-bold">Комментарии к трекам</h1>
                    <span className="text-sm text-muted-foreground">{totalComments} комментариев</span>
                </section>

                {tracks.map((t) => {
                    const isOpen = expanded.has(t.id);
                    return (
                        <section key={t.id} className="panel-card rounded-xl border border-border/70">
                            <button
                                onClick={() => toggleExpand(t.id)}
                                className="w-full flex items-center gap-3 px-5 py-4"
                            >
                                <div className="size-11 rounded-lg shrink-0" style={{ background: t.cover }} />
                                <div className="flex-1 min-w-0 text-left">
                                    <h2 className="text-sm font-bold truncate">{t.title}</h2>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                        <MessageSquare className="size-3" /> {t.comments.length} комментариев
                                    </p>
                                </div>
                                <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                            </button>

                            {isOpen && (
                                <div className="px-5 pb-5">
                                    {/* Mini waveform with comment pins, illustrative */}
                                    <div className="relative h-10 mb-4 rounded-lg bg-secondary overflow-hidden">
                                        <div className="absolute inset-0 flex items-end gap-0.5 px-1 pb-1">
                                            {Array.from({ length: 60 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="flex-1 bg-foreground/15 rounded-sm"
                                                    style={{ height: `${20 + Math.sin(i / 3) * 15 + Math.random() * 15}%` }}
                                                />
                                            ))}
                                        </div>
                                        {t.comments
                                            .filter((c) => c.timestamp !== undefined)
                                            .map((c) => (
                                                <div
                                                    key={c.id}
                                                    title={`${fmtTs(c.timestamp!)} — ${c.author}`}
                                                    className="absolute bottom-0 size-2.5 rounded-full bg-primary -translate-x-1/2"
                                                    style={{ left: `${(c.timestamp! / t.duration) * 100}%` }}
                                                />
                                            ))}
                                    </div>

                                    <div className="flex gap-2 mb-4">
                                        <input
                                            value={drafts[t.id] || ""}
                                            onChange={(e) => setDrafts((d) => ({ ...d, [t.id]: e.target.value }))}
                                            onKeyDown={(e) => e.key === "Enter" && submit(t.id)}
                                            placeholder="Добавить комментарий..."
                                            className="flex-1 h-9 rounded-full bg-secondary px-4 text-sm focus:outline-none"
                                        />
                                        <button
                                            onClick={() => submit(t.id)}
                                            className="h-9 px-4 rounded-full bg-foreground text-background text-xs font-bold hover:opacity-90"
                                        >
                                            Отправить
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {t.comments.map((c) => (
                                            <div key={c.id} className="flex gap-3">
                                                <div className={cn("size-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0", c.avatarColor)}>
                                                    {c.avatar}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="font-semibold">@{c.author}</span>
                                                        <span className="text-xs text-muted-foreground">{relTime(c.createdAt)}</span>
                                                    </div>
                                                    <p className="text-sm mt-0.5">
                                                        {c.timestamp !== undefined && (
                                                            <span className="inline-flex items-center gap-1 mr-2 px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 text-xs font-medium tabular-nums align-middle">
                                                                <Clock className="size-3" />
                                                                {fmtTs(c.timestamp)}
                                                            </span>
                                                        )}
                                                        {c.text}
                                                    </p>
                                                    <button
                                                        onClick={() => toggleLike(t.id, c.id)}
                                                        className={cn(
                                                            "flex items-center gap-1 mt-1.5 text-xs hover:text-foreground transition",
                                                            c.liked ? "text-red-500" : "text-muted-foreground"
                                                        )}
                                                    >
                                                        <ThumbsUp className="size-3.5" /> {c.likes}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    );
                })}
            </div>
        </div>
    );
}

export default MusicTrackComments;