import { useEffect, useState } from "react";
import { ThumbsUp, ThumbsDown, Clock } from "lucide-react";

type Comment = {
    id: string;
    author: string;
    avatar: string;
    text: string;
    createdAt: number;
    likes: number;
    liked?: boolean;
    disliked?: boolean;
    timestamp?: number; // seconds in the video
};

const STORAGE_KEY = "video_comments_v2";

const seed: Comment[] = [
    { id: "1", author: "alex.dev", avatar: "AD", text: "Этот момент огонь, пересматриваю каждый раз.", createdAt: Date.now() - 1000 * 60 * 60 * 5, likes: 432, timestamp: 42 },
    { id: "2", author: "mira.k", avatar: "MK", text: "Качество видео топ, спасибо за плеер!", createdAt: Date.now() - 1000 * 60 * 60 * 24, likes: 128 },
    { id: "3", author: "nightowl", avatar: "NO", text: "Heatmap — отличная фича, сразу видно где основной дроп.", createdAt: Date.now() - 1000 * 60 * 60 * 50, likes: 76, timestamp: 128 },
    { id: "4", author: "mira.k.3", avatar: "MKS", text: "Качество видео топ, спасибо за плеер!", createdAt: Date.now() - 1000 * 60 * 60 * 24, likes: 128 },
];

function relTime(ts: number) {
    const d = (Date.now() - ts) / 1000;
    if (d < 60) return "только что";
    if (d < 3600) return `${Math.floor(d / 60)} мин назад`;
    if (d < 86400) return `${Math.floor(d / 3600)} ч назад`;
    return `${Math.floor(d / 86400)} дн назад`;
}

function formatTs(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
}

type Props = {
    currentTime?: number;
    onSeek?: (t: number) => void;
};

export function Comments({ currentTime = 0, onSeek }: Props) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [text, setText] = useState("");
    const [attachTs, setAttachTs] = useState(true);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            setComments(raw ? JSON.parse(raw) : seed);
        } catch { setComments(seed); }
    }, []);

    useEffect(() => {
        if (comments.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
    }, [comments]);

    const submit = () => {
        if (!text.trim()) return;
        setComments((c) => [
            {
                id: crypto.randomUUID(),
                author: "вы",
                avatar: "ВЫ",
                text: text.trim(),
                createdAt: Date.now(),
                likes: 0,
                timestamp: attachTs && currentTime > 0 ? currentTime : undefined,
            },
            ...c,
        ]);
        setText("");
    };

    const toggleLike = (id: string, kind: "like" | "dislike") => {
        setComments((cs) => cs.map((c) => {
            if (c.id !== id) return c;
            if (kind === "like") {
                const liked = !c.liked;
                return { ...c, liked, disliked: false, likes: c.likes + (liked ? 1 : -1) };
            }
            return { ...c, disliked: !c.disliked, liked: false };
        }));
    };

    return (
        <section className="mt-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
                {comments.length} комментариев
            </h2>

            <div className="flex gap-3 mb-8">
                <div className="size-10 rounded-full bg-linear-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                    ВЫ
                </div>
                <div className="flex-1">
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && submit()}
                        placeholder="Добавьте комментарий..."
                        className="w-full bg-transparent border-b border-white/20 focus:border-white outline-none py-2 text-foreground placeholder:text-muted-foreground"
                    />
                    {text && (
                        <div className="flex items-center justify-between gap-2 mt-2">
                            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={attachTs}
                                    onChange={(e) => setAttachTs(e.target.checked)}
                                    className="accent-red-600"
                                />
                                <Clock className="size-3.5" />
                                Привязать к {formatTs(currentTime)}
                            </label>
                            <div className="flex gap-2">
                                <button onClick={() => setText("")} className="px-3 py-1.5 rounded-full text-sm hover:bg-white/10">
                                    Отмена
                                </button>
                                <button onClick={submit} className="px-3 py-1.5 rounded-full text-sm bg-red-600 hover:bg-red-700 text-white">
                                    Отправить
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {comments.map((c) => (
                    <div key={c.id} className="flex gap-3">
                        <div className="size-10 rounded-full bg-white/10 flex items-center justify-center text-foreground text-sm font-semibold shrink-0">
                            {c.avatar}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-semibold text-foreground">@{c.author}</span>
                                <span className="text-muted-foreground text-xs">{relTime(c.createdAt)}</span>
                            </div>
                            <p className="text-foreground mt-1 whitespace-pre-wrap">
                                {c.timestamp !== undefined && (
                                    <button
                                        onClick={() => onSeek?.(c.timestamp!)}
                                        className="inline-flex items-center gap-1 mr-2 px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 text-xs font-medium tabular-nums align-middle"
                                    >
                                        <Clock className="size-3" />
                                        {formatTs(c.timestamp)}
                                    </button>
                                )}
                                {c.text}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-muted-foreground">
                                <button onClick={() => toggleLike(c.id, "like")} className={`flex items-center gap-1 hover:text-foreground transition ${c.liked ? "text-red-500" : ""}`}>
                                    <ThumbsUp className="size-4" /> <span className="text-xs">{c.likes}</span>
                                </button>
                                <button onClick={() => toggleLike(c.id, "dislike")} className={`hover:text-foreground transition ${c.disliked ? "text-red-500" : ""}`}>
                                    <ThumbsDown className="size-4" />
                                </button>
                                <button className="text-xs font-medium hover:text-foreground">Ответить</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}