import { useEffect, useRef, useState, useCallback } from "react";
import { ThumbsUp, ThumbsDown, Share2, Download, Bookmark, MoreHorizontal } from "lucide-react";
import {
    VideoPlayer,
    type Chapter,
    type VideoCard,
    type Watermark,
    type EndscreenConfig,
} from "./player";
import { Comments } from "./video-comments";

const PLAYER_CONFIG = {
    // "classic" = обычный ползунок | "chapters" = разбитый по главам
    progressStyle: "chapters" as "classic" | "chapters",

    // true = ambient glow вокруг плеера подстраивается под цвет видео
    ambientMode: true,
} as const;
const VIDEO_CHAPTERS: Chapter[] = [
    { label: "Вступление", time: 0 },
    { label: "Знакомство", time: 30 },
    { label: "Основная часть", time: 90 },
    { label: "Кульминация", time: 200 },
    { label: "Развязка", time: 310 },
    { label: "Финал", time: 420 },
];
const VIDEO_POSTER = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1280&q=80";
const CHANNEL_WATERMARK: Watermark = {
    logoSrc: "https://images.unsplash.com/photo-1633613286991-611fe299c4be?w=200&q=80",
    channelLink: "https://t.me/example_channel",
    channelName: "Lovable Studio",
    // "always" — виден постоянно при плейбэке | "hover" — только при показе контролов
    visibility: "always",
};
const VIDEO_CARDS: VideoCard[] = [
    {
        id: "card-1",
        time: 60, // на 1-й минуте
        duration: 10,
        title: "Как мы делали heatmap-график для плеера",
        thumbnail: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=320&q=80",
        link: "https://t.me/example_channel/123",
    },
];
const VIDEO_ENDSCREEN: EndscreenConfig = {
    layout: "grid",
    showReplay: true,
    subscribe: {
        logoSrc: "https://images.unsplash.com/photo-1633613286991-611fe299c4be?w=200&q=80",
        channelName: "Lovable Studio",
        channelLink: "https://t.me/example_channel",
        subscriberCount: "1.2M подписчиков",
    },
    items: [
        {
            id: "next-1",
            title: "Как мы делали heatmap-график для плеера",
            thumbnail: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=320&q=80",
            link: "/",
            duration: "8:42",
            views: "120K просмотров",
        },
        {
            id: "next-2",
            title: "HLS-стриминг с нуля: разбор архитектуры",
            thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=320&q=80",
            link: "/",
            duration: "14:05",
            views: "58K просмотров",
        },
        {
            id: "next-3",
            title: "Touch-жесты для видеоплееров на мобильных",
            thumbnail: "https://images.unsplash.com/photo-1633613286991-611fe299c4be?w=320&q=80",
            link: "/",
            duration: "5:21",
            views: "30K просмотров",
        },
    ],
    // Чтобы включить автовоспроизведение следующего видео с countdown — поставьте
    // layout: "featured" и раскомментируйте:
    // autoplayNext: { item: { id: "next-1", title: "...", thumbnail: "...", link: "/" }, countdownSeconds: 5 },
};
function buildHeatmap(n = 64) {
    const out: number[] = [];
    for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const base =
            0.35 +
            0.55 * Math.exp(-Math.pow((t - 0.15) / 0.07, 2)) +
            0.85 * Math.exp(-Math.pow((t - 0.42) / 0.05, 2)) +
            0.95 * Math.exp(-Math.pow((t - 0.68) / 0.06, 2)) +
            0.4 * Math.exp(-Math.pow((t - 0.9) / 0.08, 2));
        out.push(Math.min(1, base + (Math.random() - 0.5) * 0.08));
    }
    const max = Math.max(...out);
    return out.map((v) => v / max);
}
const VIDEO_SRC = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

const VideoPage = () => {
    const [heatmap, setHeatmap] = useState<number[]>([]);
    const [currentTime, setCurrentTime] = useState(0);
    const seekRef = useRef<((t: number) => void) | null>(null);
    const [likes, setLikes] = useState(337_000);
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setHeatmap(buildHeatmap());
    }, []);

    const handleSeek = useCallback((t: number) => {
        seekRef.current?.(t);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const onLike = () => {
        if (liked) {
            setLiked(false);
            setLikes((l) => l - 1);
        } else {
            setLiked(true);
            setLikes((l) => l + (disliked ? 1 : 1));
            setDisliked(false);
        }
    };
    const onDislike = () => {
        if (liked) setLikes((l) => l - 1);
        setLiked(false);
        setDisliked((d) => !d);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            <VideoPlayer
                src={VIDEO_SRC}
                poster={VIDEO_POSTER}
                heatmap={heatmap}
                onTimeUpdate={(t) => setCurrentTime(t)}
                seekRef={seekRef}
                progressStyle={PLAYER_CONFIG.progressStyle}
                ambientMode={PLAYER_CONFIG.ambientMode}
                chapters={VIDEO_CHAPTERS}
                title="Big Buck Bunny — HLS Test Stream"
                watermark={CHANNEL_WATERMARK}
                cards={VIDEO_CARDS}
                endscreen={VIDEO_ENDSCREEN}
            />

            <h1 className="text-2xl font-bold mt-4 text-foreground">
                Big Buck Bunny — HLS Test Stream
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-3">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600" />
                    <div>
                        <div className="font-semibold text-foreground">Lovable Studio</div>
                        <div className="text-xs text-muted-foreground">1.2M подписчиков</div>
                    </div>
                    <button className="ml-2 px-4 py-2 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-90">
                        Подписаться
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white/10 rounded-full overflow-hidden">
                        <button
                            onClick={onLike}
                            className={`flex items-center gap-2 pl-4 pr-3 py-2 hover:bg-white/10 transition ${liked ? "text-red-500" : ""}`}
                        >
                            <ThumbsUp className="size-5" />
                            <span className="text-sm font-medium tabular-nums">
                  {likes >= 1000 ? `${(likes / 1000).toFixed(1)}K` : likes}
                </span>
                        </button>
                        <div className="w-px h-6 bg-white/20" />
                        <button
                            onClick={onDislike}
                            className={`px-3 py-2 hover:bg-white/10 transition ${disliked ? "text-red-500" : ""}`}
                        >
                            <ThumbsDown className="size-5" />
                        </button>
                    </div>

                    <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm font-medium">
                        <Share2 className="size-5" /> Поделиться
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm font-medium">
                        <Download className="size-5" /> Скачать
                    </button>
                    <button
                        onClick={() => setSaved((s) => !s)}
                        className={`p-2 rounded-full bg-white/10 hover:bg-white/20 ${saved ? "text-red-500" : ""}`}
                        aria-label="Save"
                    >
                        <Bookmark className="size-5" fill={saved ? "currentColor" : "none"} />
                    </button>
                    <button className="p-2 rounded-full bg-white/10 hover:bg-white/20" aria-label="More">
                        <MoreHorizontal className="size-5" />
                    </button>
                </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-white/5 text-sm">
                <div className="flex gap-3 font-medium text-foreground">
                    <span>50,714,219 просмотров</span>
                    <span>29 июн 2010</span>
                    <span className="text-blue-400">#lovable #hls</span>
                </div>
                <p className="mt-2 text-foreground/90">
                    Полноценный HLS-плеер с heatmap-графиком популярности, превью при наведении,
                    переключением качества, скоростью воспроизведения, горячими клавишами и адаптивной
                    вёрсткой.
                </p>
                <p className="mt-2 text-muted-foreground text-xs">
                    Горячие клавиши: пробел/K — пауза, ←/→ — ±5с, ↑/↓ — громкость, M — mute, F — fullscreen.
                </p>
            </div>

            <Comments currentTime={currentTime} onSeek={handleSeek} />
        </div>
    );
}

export default VideoPage