import { useMemo, useState } from "react";
import {
    ThumbsUp,
    ThumbsDown,
    Heart,
    MoreVertical,
    Search,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CommentStatus = "answered" | "unanswered";

type ChannelComment = {
    id: string;
    author: string;
    avatar: string;
    avatarColor: string;
    text: string;
    createdAt: number;
    likes: number;
    liked?: boolean;
    disliked?: boolean;
    hearted?: boolean;
    status: CommentStatus;
    videoTitle: string;
    videoThumbnail: string;
};

const seed: ChannelComment[] = [
    {
        id: "c1",
        author: "cartman-k",
        avatar: "🙂",
        avatarColor: "bg-orange-500/20",
        text: "nice",
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 240,
        likes: 0,
        status: "unanswered",
        videoTitle: "Roberts - Wire",
        videoThumbnail: "/post-photo-2.jpg",
    },
    {
        id: "c2",
        author: "venceroberts3936",
        avatar: "V",
        avatarColor: "bg-green-600",
        text: "😮💪💪💪💪",
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 240,
        likes: 1,
        status: "unanswered",
        videoTitle: "2.4.0.2 - resoul.ua",
        videoThumbnail: "/post-video-thumb.jpg",
    },
    {
        id: "c3",
        author: "markroberts4777",
        avatar: "M",
        avatarColor: "bg-blue-600",
        text: "😱😱😱",
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 240,
        likes: 1,
        status: "unanswered",
        videoTitle: "2.4.0.2 - resoul.ua",
        videoThumbnail: "/post-video-thumb.jpg",
    },
    {
        id: "c4",
        author: "AvaLenhard",
        avatar: "A",
        avatarColor: "bg-pink-600",
        text: "Love it!!!",
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 270,
        likes: 0,
        status: "unanswered",
        videoTitle: "Water World - Roberts",
        videoThumbnail: "/post-photo-4.jpg",
    },
    {
        id: "c5",
        author: "gamer-007-pubg",
        avatar: "🎮",
        avatarColor: "bg-slate-600",
        text: "😐",
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 300,
        likes: 1,
        status: "unanswered",
        videoTitle: "Darkness - dub",
        videoThumbnail: "/post-photo-3.jpg",
    },
];

function relTime(ts: number) {
    const days = Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
    if (days < 1) return "сегодня";
    if (days < 30) return `${days} дн. назад`;
    const months = Math.floor(days / 30);
    return `${months} мес. назад`;
}

type Tab = "comments" | "posts" | "mentions";
type StatusFilter = "all" | CommentStatus;

export function CommunityComments() {
    const [tab, setTab] = useState<Tab>("comments");
    const [comments, setComments] = useState<ChannelComment[]>(seed);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("unanswered");
    const [query, setQuery] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [replyingId, setReplyingId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const filtered = useMemo(() => {
        return comments.filter((c) => {
            if (statusFilter !== "all" && c.status !== statusFilter) return false;
            if (query.trim() && !c.text.toLowerCase().includes(query.trim().toLowerCase()) && !c.author.toLowerCase().includes(query.trim().toLowerCase()))
                return false;
            return true;
        });
    }, [comments, statusFilter, query]);

    const toggleReaction = (id: string, kind: "like" | "dislike" | "heart") => {
        setComments((cs) =>
            cs.map((c) => {
                if (c.id !== id) return c;
                if (kind === "like") {
                    const liked = !c.liked;
                    return { ...c, liked, disliked: false, likes: c.likes + (liked ? 1 : -1) };
                }
                if (kind === "dislike") return { ...c, disliked: !c.disliked, liked: false };
                return { ...c, hearted: !c.hearted };
            })
        );
    };

    const sendReply = (id: string) => {
        if (!replyText.trim()) return;
        setComments((cs) => cs.map((c) => (c.id === id ? { ...c, status: "answered" } : c)));
        setReplyingId(null);
        setReplyText("");
    };

    const toggleSelect = (id: string) => {
        setSelected((s) => {
            const next = new Set(s);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const tabs: { id: Tab; label: string }[] = [
        { id: "comments", label: "Комментарии" },
        { id: "posts", label: "Записи зрителей" },
        { id: "mentions", label: "Упоминания" },
    ];

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
                <section className="panel-card rounded-xl border border-border/70">
                    <header className="px-5 pt-5">
                        <h1 className="text-xl font-bold">Сообщество</h1>
                        <nav className="flex gap-6 mt-4 border-b border-border/70">
                            {tabs.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTab(t.id)}
                                    className={cn(
                                        "pb-3 text-sm font-bold border-b-2 -mb-px transition-colors",
                                        tab === t.id
                                            ? "border-foreground text-foreground"
                                            : "border-transparent text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </nav>
                    </header>

                    {tab !== "comments" ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
                            <p className="text-sm">
                                {tab === "posts" ? "Записей зрителей пока нет" : "Упоминаний пока нет"}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-wrap items-center gap-2 px-5 py-3">
                                <select
                                    className="h-9 rounded-full bg-secondary px-3 text-xs font-medium text-foreground focus:outline-none"
                                    defaultValue="published"
                                >
                                    <option value="published">Опубликованные</option>
                                    <option value="held">На рассмотрении</option>
                                </select>
                                <select
                                    className="h-9 rounded-full bg-secondary px-3 text-xs font-medium text-foreground focus:outline-none"
                                    defaultValue="recent"
                                >
                                    <option value="recent">Самые актуальные</option>
                                    <option value="newest">Сначала новые</option>
                                    <option value="top">По популярности</option>
                                </select>

                                {searchOpen ? (
                                    <div className="flex items-center h-9 rounded-full bg-secondary px-3 gap-2">
                                        <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <input
                                            autoFocus
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder="Поиск по комментариям"
                                            className="bg-transparent text-xs focus:outline-none w-40"
                                        />
                                        <button
                                            onClick={() => {
                                                setSearchOpen(false);
                                                setQuery("");
                                            }}
                                            aria-label="Закрыть поиск"
                                        >
                                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setSearchOpen(true)}
                                        className="flex items-center gap-2 h-9 rounded-full bg-secondary px-3 text-xs font-medium hover:bg-accent"
                                    >
                                        <Search className="h-3.5 w-3.5" />
                                        Поиск
                                    </button>
                                )}

                                <button
                                    onClick={() => setStatusFilter(statusFilter === "unanswered" ? "all" : "unanswered")}
                                    className={cn(
                                        "flex items-center gap-2 h-9 rounded-full px-3 text-xs font-medium",
                                        statusFilter === "unanswered"
                                            ? "bg-foreground text-background"
                                            : "bg-secondary hover:bg-accent"
                                    )}
                                >
                                    Статус ответа: {statusFilter === "unanswered" ? "Без ответа" : "Все"}
                                    {statusFilter === "unanswered" && <X className="h-3.5 w-3.5" />}
                                </button>
                            </div>

                            {filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
                                    <p className="text-sm">Комментариев по заданным фильтрам нет</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/70">
                                    {filtered.map((c) => (
                                        <div key={c.id} className="px-5 py-4">
                                            <div className="flex gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selected.has(c.id)}
                                                    onChange={() => toggleSelect(c.id)}
                                                    className="mt-1.5 accent-foreground"
                                                />
                                                <div
                                                    className={cn(
                                                        "size-9 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0",
                                                        c.avatarColor
                                                    )}
                                                >
                                                    {c.avatar}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="font-semibold">@{c.author}</span>
                                                        <span className="text-xs text-muted-foreground">{relTime(c.createdAt)}</span>
                                                    </div>
                                                    <p className="text-sm mt-1 whitespace-pre-wrap">{c.text}</p>

                                                    <div className="flex items-center gap-3 mt-2 text-muted-foreground">
                                                        <button
                                                            onClick={() => setReplyingId(replyingId === c.id ? null : c.id)}
                                                            className="text-xs font-bold hover:text-foreground"
                                                        >
                                                            Ответить
                                                        </button>
                                                        {c.status === "answered" && (
                                                            <span className="text-xs text-green-500 font-medium">Есть ответ</span>
                                                        )}
                                                        <div className="ml-auto flex items-center gap-3">
                                                            <button
                                                                onClick={() => toggleReaction(c.id, "like")}
                                                                className={cn(
                                                                    "flex items-center gap-1 hover:text-foreground transition",
                                                                    c.liked && "text-foreground"
                                                                )}
                                                            >
                                                                <ThumbsUp className="size-3.5" />
                                                                {c.likes > 0 && <span className="text-xs">{c.likes}</span>}
                                                            </button>
                                                            <button
                                                                onClick={() => toggleReaction(c.id, "dislike")}
                                                                className={cn(
                                                                    "hover:text-foreground transition",
                                                                    c.disliked && "text-foreground"
                                                                )}
                                                            >
                                                                <ThumbsDown className="size-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => toggleReaction(c.id, "heart")}
                                                                className={cn(
                                                                    "hover:text-red-500 transition",
                                                                    c.hearted && "text-red-500"
                                                                )}
                                                            >
                                                                <Heart className="size-3.5" fill={c.hearted ? "currentColor" : "none"} />
                                                            </button>
                                                            <button className="hover:text-foreground" aria-label="Ещё">
                                                                <MoreVertical className="size-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {replyingId === c.id && (
                                                        <div className="flex gap-2 mt-3">
                                                            <input
                                                                autoFocus
                                                                value={replyText}
                                                                onChange={(e) => setReplyText(e.target.value)}
                                                                onKeyDown={(e) => e.key === "Enter" && sendReply(c.id)}
                                                                placeholder="Ответить..."
                                                                className="flex-1 h-9 rounded-full bg-secondary px-4 text-sm focus:outline-none"
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    setReplyingId(null);
                                                                    setReplyText("");
                                                                }}
                                                                className="h-9 px-3 rounded-full text-xs font-medium hover:bg-secondary"
                                                            >
                                                                Отмена
                                                            </button>
                                                            <button
                                                                onClick={() => sendReply(c.id)}
                                                                className="h-9 px-4 rounded-full bg-foreground text-background text-xs font-bold hover:opacity-90"
                                                            >
                                                                Отправить
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <a
                                                    href="#"
                                                    className="hidden sm:flex items-center gap-2 shrink-0 w-40 text-xs text-muted-foreground hover:text-foreground"
                                                >
                                                    <div className="size-9 rounded bg-secondary overflow-hidden shrink-0">
                                                        <img
                                                            src={c.videoThumbnail}
                                                            alt={c.videoTitle}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <span className="line-clamp-2">{c.videoTitle}</span>
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}

export default CommunityComments;