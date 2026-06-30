import { useEffect, useRef, useState, useCallback, useMemo, type RefObject } from "react";
import Hls from "hls.js";
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    SkipBack,
    SkipForward,
    Settings,
    Subtitles,
    PictureInPicture2,
    X,
} from "lucide-react";

export type Chapter = {
    label: string;
    time: number;
};

export type Watermark = {
    logoSrc: string;
    channelLink: string;
    channelName?: string;
    // "always" — виден постоянно во время плейбэка; "hover" — только когда показаны контролы (по ховеру)
    visibility?: "always" | "hover";
};

export type EndscreenItem = {
    id: string;
    title: string;
    thumbnail: string;
    link: string;
    duration?: string; // например "12:34"
    views?: string; // например "1.2M просмотров"
};

export type EndscreenConfig = {
    // "grid" — сетка превью (классический YouTube), "featured" — большая карточка автоплея + список,
    // "list" — вертикальный список
    layout?: "grid" | "featured" | "list";
    items?: EndscreenItem[];
    subscribe?: {
        logoSrc: string;
        channelName: string;
        channelLink: string;
        subscriberCount?: string;
    };
    showReplay?: boolean; // кнопка "Смотреть снова"
    // Автовоспроизведение следующего видео с обратным отсчётом (только для layout="featured")
    autoplayNext?: {
        item: EndscreenItem;
        countdownSeconds?: number; // по умолчанию 5
    };
};

export type VideoCard = {
    id: string;
    time: number; // секунда появления
    duration?: number; // сколько секунд показывать (по умолчанию 8)
    title: string;
    thumbnail?: string;
    link: string;
};

type Props = {
    src: string;
    poster?: string;
    heatmap?: number[];
    onTimeUpdate?: (current: number, duration: number) => void;
    seekRef?: React.MutableRefObject<((t: number) => void) | null>;
    chapters?: Chapter[];
    progressStyle?: "classic" | "chapters";
    ambientMode?: boolean;
    // Mini-player: title shown in the mini-player card
    title?: string;
    // Логотип канала-водяной знак (как на YouTube), кликабельный
    watermark?: Watermark;
    // Всплывающие карточки-подсказки со ссылкой на другое видео в нужный момент
    cards?: VideoCard[];
    // Экран по завершении видео — конфигурируемый (grid/featured/list)
    endscreen?: EndscreenConfig;
};

function formatTime(s: number) {
    if (!isFinite(s)) return "0:00";
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60)
        .toString()
        .padStart(2, "0");
    return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

// ─── Ambient color hook ───────────────────────────────────────────────────────
function useAmbientColor(videoRef: RefObject<HTMLVideoElement | null>, enabled: boolean) {
    const [color, setColor] = useState("0,0,0");
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (!enabled) return;
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 18;
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
        let frame = 0;
        const loop = () => {
            frame++;
            if (frame % 8 === 0) {
                const v = videoRef.current;
                if (v && !v.paused && v.readyState >= 2) {
                    ctx.drawImage(v, 0, 0, 32, 18);
                    const d = ctx.getImageData(0, 0, 32, 18).data;
                    let r = 0,
                        g = 0,
                        b = 0;
                    const total = d.length / 4;
                    for (let i = 0; i < d.length; i += 4) {
                        r += d[i];
                        g += d[i + 1];
                        b += d[i + 2];
                    }
                    setColor(`${Math.round(r / total)},${Math.round(g / total)},${Math.round(b / total)}`);
                }
            }
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [enabled, videoRef]);

    return color;
}

// ─── Frame preview hook ───────────────────────────────────────────────────────
// Uses a hidden second <video> + canvas to capture frames without disturbing playback.
function useFramePreview(src: string, enabled: boolean) {
    const previewVideoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [dataUrl, setDataUrl] = useState<string | null>(null);
    const seekingRef = useRef(false);

    // Init hidden video + HLS once
    useEffect(() => {
        if (!enabled) return;
        const video = document.createElement("video");
        video.muted = true;
        video.playsInline = true;
        video.crossOrigin = "anonymous";
        video.preload = "auto";
        previewVideoRef.current = video;

        const canvas = document.createElement("canvas");
        canvas.width = 160;
        canvas.height = 90;
        canvasRef.current = canvas;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
        } else if (Hls.isSupported()) {
            const hls = new Hls({ enableWorker: false, maxBufferLength: 10 });
            hlsRef.current = hls;
            hls.loadSource(src);
            hls.attachMedia(video);
        } else {
            video.src = src;
        }

        // When seeked, grab frame
        const onSeeked = () => {
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(video, 0, 0, 160, 90);
            setDataUrl(canvas.toDataURL("image/jpeg", 0.7));
            seekingRef.current = false;
        };
        video.addEventListener("seeked", onSeeked);

        return () => {
            video.removeEventListener("seeked", onSeeked);
            hlsRef.current?.destroy();
            hlsRef.current = null;
            previewVideoRef.current = null;
        };
    }, [src, enabled]);

    const seekPreview = useCallback((time: number) => {
        const video = previewVideoRef.current;
        if (!video || seekingRef.current) return;
        seekingRef.current = true;
        video.currentTime = time;
    }, []);

    const clearPreview = useCallback(() => setDataUrl(null), []);

    return { dataUrl, seekPreview, clearPreview };
}

// ─── Chapter track ────────────────────────────────────────────────────────────
function ChapterTrack({
                          chapters,
                          current,
                          duration,
                          buffered,
                          hoverPct,
                          hoverTime,
                          hoverX,
                          previewDataUrl,
                          heatmapPath,
                          pullUp = 0,
                          touchActive = false,
                      }: {
    chapters: Chapter[];
    current: number;
    duration: number;
    buffered: number;
    hoverPct: number | null;
    hoverTime: number | null;
    hoverX: number;
    previewDataUrl: string | null;
    heatmapPath?: string;
    pullUp?: number;
    touchActive?: boolean;
}) {
    const segments = useMemo(() => {
        if (!duration) return [];
        const sorted = [...chapters].sort((a, b) => a.time - b.time);
        return sorted.map((ch, i) => ({
            label: ch.label,
            start: ch.time,
            end: sorted[i + 1]?.time ?? duration,
        }));
    }, [chapters, duration]);

    const currentChapter =
        segments.find((s) => current >= s.start && current < s.end) ?? segments[segments.length - 1];
    const hoverChapter =
        hoverPct !== null
            ? (segments.find((s) => hoverPct * duration >= s.start && hoverPct * duration < s.end) ??
                segments[segments.length - 1])
            : null;

    return (
        <>
            {currentChapter && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/70 text-white/80 text-xs font-medium pointer-events-none whitespace-nowrap">
                    {currentChapter.label}
                </div>
            )}

            <div className="relative w-full" style={{ height: "24px" }}>
                {heatmapPath && (
                    <svg
                        viewBox="0 0 1000 100"
                        preserveAspectRatio="none"
                        className="absolute inset-x-0 bottom-0 w-full h-8 opacity-60 pointer-events-none"
                    >
                        <defs>
                            <linearGradient id="heatGradChapters" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
                                <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
                            </linearGradient>
                        </defs>
                        <path d={heatmapPath} fill="url(#heatGradChapters)" />
                    </svg>
                )}
                {segments.map((seg, idx) => {
                    const leftPct = (seg.start / duration) * 100;
                    const rightPct = ((duration - seg.end) / duration) * 100;
                    const isLast = idx === segments.length - 1;
                    const passed = current >= seg.end;
                    const active = current >= seg.start && current < seg.end;
                    const fillPct = active
                        ? ((current - seg.start) / (seg.end - seg.start)) * 100
                        : passed
                            ? 100
                            : 0;
                    const bufferedInSeg = Math.max(0, Math.min(seg.end, buffered) - seg.start);
                    const bufferedPct = (bufferedInSeg / (seg.end - seg.start)) * 100;

                    return (
                        <div
                            key={seg.start}
                            className="absolute bottom-0 group/seg"
                            style={{ left: `${leftPct}%`, right: `${rightPct}%`, paddingRight: isLast ? 0 : 2 }}
                        >
                            <div className="relative w-full h-1 group-hover/seg:h-1.5 transition-all rounded-sm bg-white/25 overflow-hidden">
                                <div
                                    className="absolute inset-y-0 left-0 bg-white/30 rounded-sm"
                                    style={{ width: `${bufferedPct}%` }}
                                />
                                <div
                                    className="absolute inset-y-0 left-0 bg-red-500 rounded-sm"
                                    style={{ width: `${fillPct}%` }}
                                />
                            </div>
                            {active && (
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full opacity-0 group-hover/seg:opacity-100 transition pointer-events-none"
                                    style={{ left: `calc(${fillPct}% - 6px)` }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Hover/touch tooltip + frame preview */}
            {hoverTime !== null && (
                <div
                    className="absolute pointer-events-none transition-[bottom,width,height] duration-100"
                    style={{
                        left: `${hoverX}px`,
                        bottom: `${32 + pullUp * 110}px`,
                        transform: "translateX(-50%)",
                    }}
                >
                    {previewDataUrl && (
                        <img
                            src={previewDataUrl}
                            className="rounded-md object-cover mb-1 border border-white/20 mx-auto"
                            style={{
                                width: `${160 + pullUp * 140}px`,
                                height: `${90 + pullUp * 79}px`,
                            }}
                            alt="preview"
                        />
                    )}
                    <div className="px-2 py-1 rounded bg-black/90 text-white text-xs font-medium whitespace-nowrap text-center">
                        {formatTime(hoverTime)}
                        {hoverChapter ? ` · ${hoverChapter.label}` : ""}
                    </div>
                    {touchActive && pullUp < 0.25 && (
                        <div className="mt-1 text-[11px] text-white/70 text-center whitespace-nowrap">
                            Потяните вверх для точной перемотки
                        </div>
                    )}
                </div>
            )}

            <div className="relative w-full h-0" aria-hidden="true">
                {segments.slice(1).map((seg) => (
                    <div
                        key={seg.start}
                        className="absolute top-0 w-0.5 h-2 bg-white/40 -translate-x-1/2 -translate-y-2 pointer-events-none"
                        style={{ left: `${(seg.start / duration) * 100}%` }}
                    />
                ))}
            </div>
        </>
    );
}

// ─── Mini-player ──────────────────────────────────────────────────────────────
function MiniPlayer({
                        videoRef,
                        playing,
                        current,
                        duration,
                        title,
                        onTogglePlay,
                        onClose,
                    }: {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    playing: boolean;
    current: number;
    duration: number;
    title?: string;
    onTogglePlay: () => void;
    onClose: () => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Mirror the main video onto the mini canvas every frame
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        let raf: number;
        const draw = () => {
            const v = videoRef.current;
            if (v && v.readyState >= 2) ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
            raf = requestAnimationFrame(draw);
        };
        raf = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(raf);
    }, [videoRef]);

    const progressPct = duration ? (current / duration) * 100 : 0;

    return (
        <div
            className="fixed bottom-4 right-4 z-50 w-72 rounded-xl overflow-hidden bg-black shadow-2xl border border-white/10"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
        >
            {/* Video mirror */}
            <div className="relative aspect-video bg-black group/mini">
                <canvas ref={canvasRef} width={288} height={162} className="w-full h-full" />

                {/* Controls overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/mini:opacity-100 transition flex items-center justify-center gap-4">
                    <button
                        onClick={onTogglePlay}
                        className="size-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
                    >
                        {playing ? (
                            <Pause className="size-5" fill="currentColor" />
                        ) : (
                            <Play className="size-5 ml-0.5" fill="currentColor" />
                        )}
                    </button>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 size-6 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition"
                    aria-label="Закрыть мини-плеер"
                >
                    <X className="size-3.5" />
                </button>
            </div>

            {/* Progress bar */}
            <div className="h-0.5 bg-white/20">
                <div className="h-full bg-red-500 transition-all" style={{ width: `${progressPct}%` }} />
            </div>

            {/* Title + time */}
            <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-xs text-white/70 truncate max-w-[160px]">{title ?? "Видео"}</span>
                <span className="text-xs text-white/50 tabular-nums shrink-0 ml-2">
          {formatTime(current)} / {formatTime(duration)}
        </span>
            </div>
        </div>
    );
}

// ─── Channel watermark (логотип канала со ссылкой, как на YouTube) ───────────
function WatermarkLogo({
                           watermark,
                           playing,
                           showControls,
                       }: {
    watermark: Watermark;
    playing: boolean;
    showControls: boolean;
}) {
    const [hovered, setHovered] = useState(false);
    const mode = watermark.visibility ?? "always";
    // "always" — видна всё время плейбэка; "hover" — только когда видны контролы
    const visible = mode === "always" ? playing : showControls;

    return (
        <a
            href={watermark.channelLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={`absolute bottom-16 right-3 z-10 flex items-center gap-2 transition-opacity duration-300 ${
                visible ? "opacity-90 hover:opacity-100" : "opacity-0"
            }`}
            aria-label={watermark.channelName ?? "Канал"}
        >
            <img
                src={watermark.logoSrc}
                alt={watermark.channelName ?? "logo"}
                className="size-9 rounded-full border-2 border-white/80 shadow-lg object-cover bg-black"
            />
            <span
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide bg-[#cc0000] text-white shadow-lg whitespace-nowrap transition-all duration-200 ${
                    hovered ? "opacity-100 max-w-[140px] ml-0" : "opacity-0 max-w-0 ml-[-8px] overflow-hidden"
                }`}
            >
        Подписаться
      </span>
        </a>
    );
}

// ─── Info card (всплывающая подсказка-ссылка на другое видео) ────────────────
function InfoCard({ card, onClose }: { card: VideoCard; onClose: () => void }) {
    return (
        <div className="absolute top-3 right-3 z-20 w-64 rounded-lg overflow-hidden bg-[#1f1f1f]/95 border border-white/15 shadow-2xl animate-in fade-in slide-in-from-top-2">
            <a
                href={card.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex gap-2 p-2 hover:bg-white/5 transition"
            >
                {card.thumbnail && (
                    <img
                        src={card.thumbnail}
                        alt=""
                        className="w-20 h-12 rounded object-cover shrink-0 bg-black"
                    />
                )}
                <div className="min-w-0">
                    <div className="text-[11px] text-white/50 mb-0.5">Похожее видео</div>
                    <div className="text-xs font-medium text-white leading-snug line-clamp-2">
                        {card.title}
                    </div>
                </div>
            </a>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className="absolute top-1 right-1 size-5 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white"
                aria-label="Закрыть"
            >
                <X className="size-3" />
            </button>
        </div>
    );
}

// ─── Endscreen (экран по завершении видео) ───────────────────────────────────
function EndscreenItemCard({ item, big = false }: { item: EndscreenItem; big?: boolean }) {
    return (
        <a
            href={item.link}
            onClick={(e) => e.stopPropagation()}
            className="group block rounded-lg overflow-hidden bg-white/5 hover:bg-white/10 transition"
        >
            <div className="relative aspect-video bg-black">
                <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                {item.duration && (
                    <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-white text-[10px] font-medium">
            {item.duration}
          </span>
                )}
                {!big && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition">
                        <Play
                            className="size-8 text-white opacity-0 group-hover:opacity-100 transition"
                            fill="currentColor"
                        />
                    </div>
                )}
            </div>
            <div className="pt-1.5">
                <div
                    className={`text-white font-medium leading-snug line-clamp-2 ${big ? "text-sm" : "text-xs"}`}
                >
                    {item.title}
                </div>
                {item.views && <div className="text-white/50 text-[11px] mt-0.5">{item.views}</div>}
            </div>
        </a>
    );
}

function CountdownRing({ progress, size = 64 }: { progress: number; size?: number }) {
    const r = size / 2 - 4;
    const c = 2 * Math.PI * r;
    return (
        <svg width={size} height={size} className="absolute inset-0 -rotate-90">
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth={3}
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="#fff"
                strokeWidth={3}
                strokeDasharray={c}
                strokeDashoffset={c * (1 - progress)}
                strokeLinecap="round"
                className="transition-[stroke-dashoffset] duration-200 linear"
            />
        </svg>
    );
}

function Endscreen({ config, onReplay }: { config: EndscreenConfig; onReplay: () => void }) {
    const layout = config.layout ?? "grid";
    const items = config.items ?? [];
    const total = config.autoplayNext?.countdownSeconds ?? 5;
    const [secondsLeft, setSecondsLeft] = useState(total);
    const [cancelled, setCancelled] = useState(false);

    useEffect(() => {
        if (!config.autoplayNext || cancelled) return;
        if (secondsLeft <= 0) {
            window.location.href = config.autoplayNext.item.link;
            return;
        }
        const t = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
        return () => window.clearTimeout(t);
    }, [secondsLeft, cancelled, config.autoplayNext]);

    const SubscribeBlock = config.subscribe && (
        <a
            href={config.subscribe.channelLink}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition"
        >
            <img
                src={config.subscribe.logoSrc}
                alt=""
                className="size-12 rounded-full object-cover border border-white/20"
            />
            <div className="min-w-0">
                <div className="text-white text-sm font-semibold truncate">
                    {config.subscribe.channelName}
                </div>
                {config.subscribe.subscriberCount && (
                    <div className="text-white/50 text-xs">{config.subscribe.subscriberCount}</div>
                )}
            </div>
            <span className="ml-auto px-3 py-1.5 rounded-full bg-[#cc0000] hover:bg-[#e00000] text-white text-xs font-bold uppercase shrink-0">
        Подписаться
      </span>
        </a>
    );

    const ReplayButton = config.showReplay && (
        <button
            onClick={onReplay}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium"
        >
            <Play className="size-4" fill="currentColor" />
            Смотреть снова
        </button>
    );

    return (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto">
            {/* ── Layout: featured — большая карточка автоплея + список рядом ── */}
            {layout === "featured" && (
                <div className="w-full max-w-3xl flex flex-col gap-4">
                    {config.autoplayNext && (
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <div className="relative w-full sm:w-72 shrink-0">
                                <EndscreenItemCard item={config.autoplayNext.item} big />
                                {!cancelled && (
                                    <button
                                        onClick={() => setSecondsLeft(0)}
                                        className="absolute top-2 left-2 size-12 rounded-full bg-black/60 flex items-center justify-center"
                                        aria-label="Воспроизвести сейчас"
                                    >
                                        <CountdownRing progress={1 - secondsLeft / total} size={48} />
                                        <span className="relative text-white text-xs font-bold tabular-nums">
                      {secondsLeft}
                    </span>
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-col gap-2 text-center sm:text-left">
                                <div className="text-white/70 text-sm">
                                    {cancelled
                                        ? "Автовоспроизведение отменено"
                                        : `Следующее видео через ${secondsLeft} с`}
                                </div>
                                <div className="flex gap-2 justify-center sm:justify-start">
                                    {!cancelled ? (
                                        <button
                                            onClick={() => setCancelled(true)}
                                            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium"
                                        >
                                            Отмена
                                        </button>
                                    ) : (
                                        <a
                                            href={config.autoplayNext.item.link}
                                            className="px-3 py-1.5 rounded-full bg-white text-black text-xs font-medium"
                                        >
                                            Смотреть сейчас
                                        </a>
                                    )}
                                    {ReplayButton}
                                </div>
                            </div>
                        </div>
                    )}
                    {SubscribeBlock}
                    {items.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {items.map((it) => (
                                <EndscreenItemCard key={it.id} item={it} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Layout: grid — классическая сетка превью (как YouTube) ── */}
            {layout === "grid" && (
                <div className="w-full max-w-3xl flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        {SubscribeBlock}
                        {ReplayButton}
                    </div>
                    {items.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {items.map((it) => (
                                <EndscreenItemCard key={it.id} item={it} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Layout: list — вертикальный список ── */}
            {layout === "list" && (
                <div className="w-full max-w-sm flex flex-col gap-3">
                    {SubscribeBlock}
                    {items.length > 0 && (
                        <div className="flex flex-col gap-2">
                            {items.map((it) => (
                                <a
                                    key={it.id}
                                    href={it.link}
                                    onClick={(e) => e.stopPropagation()}
                                    className="group flex gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
                                >
                                    <div className="relative w-28 aspect-video rounded overflow-hidden bg-black shrink-0">
                                        <img src={it.thumbnail} alt="" className="w-full h-full object-cover" />
                                        {it.duration && (
                                            <span className="absolute bottom-0.5 right-0.5 px-1 rounded bg-black/80 text-white text-[10px]">
                        {it.duration}
                      </span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-white text-xs font-medium leading-snug line-clamp-2">
                                            {it.title}
                                        </div>
                                        {it.views && <div className="text-white/50 text-[11px] mt-0.5">{it.views}</div>}
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                    {ReplayButton && <div className="self-center">{ReplayButton}</div>}
                </div>
            )}
        </div>
    );
}

export function VideoPlayer({
                                src,
                                poster,
                                heatmap,
                                onTimeUpdate,
                                seekRef,
                                chapters,
                                progressStyle = "classic",
                                ambientMode = false,
                                title,
                                watermark,
                                cards,
                                endscreen,
                            }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const hideTimer = useRef<number | null>(null);

    const [playing, setPlaying] = useState(false);
    const [current, setCurrent] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [hoverX, setHoverX] = useState(0);
    const [touchActive, setTouchActive] = useState(false);
    const [pullUp, setPullUp] = useState(0); // 0..1, насколько "потянули вверх" превью
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);
    const [levels, setLevels] = useState<{ height: number; index: number }[]>([]);
    const [currentLevel, setCurrentLevel] = useState(-1);
    const [showSettings, setShowSettings] = useState(false);
    const [rate, setRate] = useState(1);
    const [pip, setPip] = useState(false);
    const [showMini, setShowMini] = useState(false);
    // Пока не нажали play в первый раз — показываем статичную обложку (как YouTube)
    const [started, setStarted] = useState(false);
    const [dismissedCards, setDismissedCards] = useState<Set<string>>(new Set());
    // Видео закончилось — показываем endscreen
    const [ended, setEnded] = useState(false);
    // Хотя бы раз видео реально начало проигрываться (получили событие 'play')
    const [everPlayed, setEverPlayed] = useState(false);
    const hlsRef = useRef<Hls | null>(null);

    const ambientColor = useAmbientColor(videoRef, ambientMode);
    const { dataUrl: previewDataUrl, seekPreview, clearPreview } = useFramePreview(src, true);

    // Init HLS
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
        } else if (Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true });
            hlsRef.current = hls;
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setLevels(hls.levels.map((l, i) => ({ height: l.height, index: i })));
            });
            hls.on(Hls.Events.LEVEL_SWITCHED, (_e, d) => setCurrentLevel(d.level));
            return () => {
                hls.destroy();
                hlsRef.current = null;
            };
        } else {
            video.src = src;
        }
    }, [src]);

    // Video event listeners
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        const onTime = () => {
            setCurrent(v.currentTime);
            if (v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1));
            onTimeUpdate?.(v.currentTime, v.duration || 0);
        };
        const onMeta = () => setDuration(v.duration);
        const onPlay = () => {
            setPlaying(true);
            setEnded(false);
            setEverPlayed(true);
        };
        const onPause = () => setPlaying(false);
        const onEnded = () => {
            setPlaying(false);
            setEnded(true);
        };
        const onVol = () => {
            setVolume(v.volume);
            setMuted(v.muted);
        };
        v.addEventListener("timeupdate", onTime);
        v.addEventListener("loadedmetadata", onMeta);
        v.addEventListener("durationchange", onMeta);
        v.addEventListener("progress", onTime);
        v.addEventListener("play", onPlay);
        v.addEventListener("pause", onPause);
        v.addEventListener("ended", onEnded);
        v.addEventListener("volumechange", onVol);
        return () => {
            v.removeEventListener("timeupdate", onTime);
            v.removeEventListener("loadedmetadata", onMeta);
            v.removeEventListener("durationchange", onMeta);
            v.removeEventListener("progress", onTime);
            v.removeEventListener("play", onPlay);
            v.removeEventListener("pause", onPause);
            v.removeEventListener("ended", onEnded);
            v.removeEventListener("volumechange", onVol);
        };
    }, [onTimeUpdate]);

    // Fullscreen
    useEffect(() => {
        const onFs = () => setFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", onFs);
        return () => document.removeEventListener("fullscreenchange", onFs);
    }, []);

    // PiP
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        const onEnter = () => setPip(true);
        const onLeave = () => setPip(false);
        v.addEventListener("enterpictureinpicture", onEnter);
        v.addEventListener("leavepictureinpicture", onLeave);
        return () => {
            v.removeEventListener("enterpictureinpicture", onEnter);
            v.removeEventListener("leavepictureinpicture", onLeave);
        };
    }, []);

    // Intersection Observer → show mini-player when main player scrolls out of view
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                // Only show mini-player if video is actually playing
                setShowMini(!entry.isIntersecting && playing);
            },
            { threshold: 0.2 },
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [playing]);

    // Also update showMini when playing state changes (so it hides when paused)
    useEffect(() => {
        if (!playing) setShowMini(false);
    }, [playing]);

    const togglePlay = useCallback(() => {
        const v = videoRef.current;
        if (!v) return;
        if (v.paused) {
            setStarted(true);
            v.play();
        } else v.pause();
    }, []);

    const handleReplay = useCallback(() => {
        const v = videoRef.current;
        if (!v) return;
        v.currentTime = 0;
        setEnded(false);
        v.play();
    }, []);

    const toggleMute = useCallback(() => {
        const v = videoRef.current;
        if (!v) return;
        v.muted = !v.muted;
    }, []);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
        else document.exitFullscreen();
    }, []);

    const seek = useCallback(
        (t: number) => {
            const v = videoRef.current;
            if (!v) return;
            const clamped = Math.max(0, Math.min(duration, t));
            v.currentTime = clamped;
            setCurrent(clamped);
            setStarted(true);
            v.play().catch(() => {});
        },
        [duration],
    );

    useEffect(() => {
        if (seekRef) seekRef.current = seek;
        return () => {
            if (seekRef) seekRef.current = null;
        };
    }, [seek, seekRef]);

    const togglePip = useCallback(async () => {
        const v = videoRef.current;
        if (!v) return;
        try {
            if (document.pictureInPictureElement) await document.exitPictureInPicture();
            else if ((document as any).pictureInPictureEnabled)
                await (v as any).requestPictureInPicture();
        } catch {
            /* ignore */
        }
    }, []);

    // Keyboard
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (
                !containerRef.current?.contains(document.activeElement) &&
                document.activeElement !== document.body
            )
                return;
            const tag = (document.activeElement?.tagName || "").toLowerCase();
            if (tag === "input" || tag === "textarea") return;
            switch (e.key) {
                case " ":
                case "k":
                    e.preventDefault();
                    togglePlay();
                    break;
                case "ArrowRight":
                    seek(current + 5);
                    break;
                case "ArrowLeft":
                    seek(current - 5);
                    break;
                case "ArrowUp":
                    if (videoRef.current) videoRef.current.volume = Math.min(1, volume + 0.1);
                    break;
                case "ArrowDown":
                    if (videoRef.current) videoRef.current.volume = Math.max(0, volume - 0.1);
                    break;
                case "m":
                    toggleMute();
                    break;
                case "f":
                    toggleFullscreen();
                    break;
                case "i":
                    togglePip();
                    break;
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [togglePlay, seek, current, volume, toggleMute, toggleFullscreen, togglePip]);

    // Auto-hide controls
    const wakeControls = useCallback(() => {
        setShowControls(true);
        if (hideTimer.current) window.clearTimeout(hideTimer.current);
        hideTimer.current = window.setTimeout(() => {
            if (videoRef.current && !videoRef.current.paused) setShowControls(false);
        }, 2500);
    }, []);

    // Heatmap path
    const heatmapPath = useMemo(() => {
        if (!heatmap || heatmap.length === 0) return "";
        const n = heatmap.length;
        const w = 1000,
            h = 100;
        const pts = heatmap.map((v, i) => [(i / (n - 1)) * w, h - v * h] as const);
        let d = `M 0 ${h} L ${pts[0][0]} ${pts[0][1]}`;
        for (let i = 1; i < pts.length; i++) {
            const [x1, y1] = pts[i - 1];
            const [x2, y2] = pts[i];
            const cx = (x1 + x2) / 2;
            const cy = (y1 + y2) / 2;
            d += ` Q ${x1} ${y1}, ${cx} ${cy}`;
        }
        d += ` L ${w} ${h} Z`;
        return d;
    }, [heatmap]);

    const onProgressMove = (e: React.MouseEvent) => {
        const el = progressRef.current;
        if (!el || !duration) return;
        updateFromPoint(e.clientX);
    };
    const onProgressLeave = () => {
        setHoverTime(null);
        clearPreview();
    };
    const onProgressClick = (e: React.MouseEvent) => {
        const el = progressRef.current;
        if (!el || !duration) return;
        const rect = el.getBoundingClientRect();
        seek((Math.max(0, Math.min(rect.width, e.clientX - rect.left)) / rect.width) * duration);
    };

    const updateFromPoint = (clientX: number) => {
        const el = progressRef.current;
        if (!el || !duration) return;
        const rect = el.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const t = (x / rect.width) * duration;
        setHoverX(x);
        setHoverTime(t);
        seekPreview(t);
    };

    const onProgressTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
        setTouchActive(true);
        setPullUp(0);
        updateFromPoint(touch.clientX);
    };
    const onProgressTouchMove = (e: React.TouchEvent) => {
        e.preventDefault(); // не даём странице скроллиться, пока тянем по прогресс-бару
        const touch = e.touches[0];
        updateFromPoint(touch.clientX);
        if (touchStartRef.current) {
            const dy = touchStartRef.current.y - touch.clientY; // >0 = потянули вверх
            setPullUp(Math.max(0, Math.min(1, dy / 90)));
        }
    };
    const onProgressTouchEnd = () => {
        if (hoverTime !== null) seek(hoverTime);
        setTouchActive(false);
        setPullUp(0);
        touchStartRef.current = null;
        clearPreview();
        setHoverTime(null);
    };

    const progressPct = duration ? (current / duration) * 100 : 0;
    const bufferedPct = duration ? (buffered / duration) * 100 : 0;
    const hoverPct = hoverTime !== null && duration ? hoverTime / duration : null;
    const useChapters =
        progressStyle === "chapters" && chapters && chapters.length > 0 && duration > 0;

    const activeCard = useMemo(() => {
        if (!cards || !cards.length) return null;
        return (
            cards.find(
                (c) =>
                    !dismissedCards.has(c.id) && current >= c.time && current < c.time + (c.duration ?? 8),
            ) ?? null
        );
    }, [cards, current, dismissedCards]);

    return (
        <>
            <div
                className="relative rounded-xl transition-shadow duration-700"
                style={
                    ambientMode
                        ? {
                            boxShadow: `0 0 80px 20px rgba(${ambientColor},0.55), 0 0 160px 60px rgba(${ambientColor},0.25)`,
                        }
                        : undefined
                }
            >
                <div
                    ref={containerRef}
                    className="relative w-full bg-black aspect-video group/player overflow-hidden rounded-xl"
                    onMouseMove={wakeControls}
                    onMouseLeave={() => playing && setShowControls(false)}
                    tabIndex={0}
                >
                    <video
                        ref={videoRef}
                        className="w-full h-full"
                        onClick={togglePlay}
                        playsInline
                        crossOrigin="anonymous"
                        preload="metadata"
                    />

                    {/* Обложка перед первым запуском — как на YouTube: статичная картинка + кнопка play,
              видео не "подгружает" кадры пока пользователь явно не нажал play */}
                    {!started && poster && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                togglePlay();
                            }}
                            className="absolute inset-0 group"
                            aria-label="Воспроизвести"
                        >
                            <img
                                src={poster}
                                alt={title ?? "Обложка видео"}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition" />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="size-20 rounded-full bg-white/90 text-black flex items-center justify-center shadow-2xl">
                                    <Play className="size-10 ml-1" fill="currentColor" />
                                </div>
                            </div>
                        </button>
                    )}

                    {(started || !poster) && !playing && !ended && everPlayed && (
                        <button
                            onClick={togglePlay}
                            className="absolute inset-0 flex items-center justify-center bg-black/30 transition"
                            aria-label="Play"
                        >
                            <div className="size-20 rounded-full bg-white/90 text-black flex items-center justify-center shadow-2xl">
                                <Play className="size-10 ml-1" fill="currentColor" />
                            </div>
                        </button>
                    )}

                    {/* Логотип канала-водяной знак со ссылкой */}
                    {started && !ended && watermark && (
                        <WatermarkLogo watermark={watermark} playing={playing} showControls={showControls} />
                    )}

                    {/* Всплывающая карточка-подсказка на заданное время */}
                    {started && !ended && activeCard && (
                        <InfoCard
                            card={activeCard}
                            onClose={() => setDismissedCards((prev) => new Set(prev).add(activeCard.id))}
                        />
                    )}

                    {/* Endscreen — экран по завершении видео */}
                    {ended && endscreen && <Endscreen config={endscreen} onReplay={handleReplay} />}

                    <div
                        className={`absolute inset-x-0 bottom-0 px-4 pb-3 pt-16 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity ${started && showControls && !ended ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                    >
                        {/* Progress area */}
                        <div
                            ref={progressRef}
                            className="relative h-12 cursor-pointer group/progress touch-none"
                            onMouseMove={onProgressMove}
                            onMouseLeave={onProgressLeave}
                            onClick={onProgressClick}
                            onTouchStart={onProgressTouchStart}
                            onTouchMove={onProgressTouchMove}
                            onTouchEnd={onProgressTouchEnd}
                            onTouchCancel={onProgressTouchEnd}
                        >
                            {useChapters ? (
                                <div className="absolute bottom-0 left-0 right-0">
                                    <ChapterTrack
                                        chapters={chapters!}
                                        current={current}
                                        duration={duration}
                                        buffered={buffered}
                                        hoverPct={hoverPct}
                                        hoverTime={hoverTime}
                                        hoverX={hoverX}
                                        previewDataUrl={previewDataUrl}
                                        heatmapPath={heatmapPath}
                                        pullUp={pullUp}
                                        touchActive={touchActive}
                                    />
                                </div>
                            ) : (
                                <>
                                    {heatmap && heatmap.length > 0 && (
                                        <svg
                                            viewBox="0 0 1000 100"
                                            preserveAspectRatio="none"
                                            className="absolute inset-x-0 bottom-0 w-full h-8 opacity-70 group-hover/progress:opacity-100 transition"
                                        >
                                            <defs>
                                                <linearGradient id="heatGrad" x1="0" x2="0" y1="0" y2="1">
                                                    <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
                                                    <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
                                                </linearGradient>
                                            </defs>
                                            <path d={heatmapPath} fill="url(#heatGrad)" />
                                        </svg>
                                    )}

                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-full group-hover/progress:h-1.5 transition-all">
                                        <div
                                            className="absolute inset-y-0 left-0 bg-white/40 rounded-full"
                                            style={{ width: `${bufferedPct}%` }}
                                        />
                                        <div
                                            className="absolute inset-y-0 left-0 bg-red-600 rounded-full"
                                            style={{ width: `${progressPct}%` }}
                                        />
                                        <div
                                            className="absolute top-1/2 -translate-y-1/2 size-3 bg-red-600 rounded-full opacity-0 group-hover/progress:opacity-100 transition"
                                            style={{ left: `calc(${progressPct}% - 6px)` }}
                                        />
                                    </div>

                                    {/* Classic hover tooltip + preview */}
                                    {hoverTime !== null && (
                                        <div
                                            className="absolute pointer-events-none transition-[bottom,width,height] duration-100"
                                            style={{
                                                left: `${hoverX}px`,
                                                bottom: `${10 + pullUp * 110}px`,
                                                transform: "translateX(-50%)",
                                            }}
                                        >
                                            {previewDataUrl && (
                                                <img
                                                    src={previewDataUrl}
                                                    className="rounded-md object-cover mb-1 border border-white/20 mx-auto"
                                                    style={{
                                                        width: `${160 + pullUp * 140}px`,
                                                        height: `${90 + pullUp * 79}px`,
                                                    }}
                                                    alt="preview"
                                                />
                                            )}
                                            <div className="px-2 py-1 rounded bg-black/90 text-white text-xs font-medium whitespace-nowrap text-center">
                                                {formatTime(hoverTime)}
                                            </div>
                                            {touchActive && pullUp < 0.25 && (
                                                <div className="mt-1 text-[11px] text-white/70 text-center whitespace-nowrap">
                                                    Потяните вверх для точной перемотки
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Bottom row */}
                        <div className="flex items-center gap-2 mt-2 text-white">
                            <button onClick={togglePlay} className="hover:text-red-500 transition p-1">
                                {playing ? (
                                    <Pause className="size-5" fill="currentColor" />
                                ) : (
                                    <Play className="size-5" fill="currentColor" />
                                )}
                            </button>
                            <button
                                onClick={() => seek(current - 10)}
                                className="hover:text-red-500 transition p-1"
                            >
                                <SkipBack className="size-5" />
                            </button>
                            <button
                                onClick={() => seek(current + 10)}
                                className="hover:text-red-500 transition p-1"
                            >
                                <SkipForward className="size-5" />
                            </button>

                            <div className="flex items-center gap-2 group/vol">
                                <button onClick={toggleMute} className="hover:text-red-500 transition p-1">
                                    {muted || volume === 0 ? (
                                        <VolumeX className="size-5" />
                                    ) : (
                                        <Volume2 className="size-5" />
                                    )}
                                </button>
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={muted ? 0 : volume}
                                    onChange={(e) => {
                                        if (videoRef.current) {
                                            videoRef.current.muted = false;
                                            videoRef.current.volume = parseFloat(e.target.value);
                                        }
                                    }}
                                    className="w-0 group-hover/vol:w-20 transition-all accent-white"
                                />
                            </div>

                            <div className="text-sm tabular-nums ml-2">
                                {formatTime(current)} / {formatTime(duration)}
                            </div>

                            <div className="ml-auto flex items-center gap-1 relative">
                                <button className="hover:text-red-500 transition p-1" aria-label="Subtitles">
                                    <Subtitles className="size-5" />
                                </button>
                                <button
                                    onClick={togglePip}
                                    className={`hover:text-red-500 transition p-1 ${pip ? "text-red-500" : ""}`}
                                    aria-label="Picture in Picture"
                                >
                                    <PictureInPicture2 className="size-5" />
                                </button>
                                <button
                                    onClick={() => setShowSettings((s) => !s)}
                                    className="hover:text-red-500 transition p-1"
                                    aria-label="Settings"
                                >
                                    <Settings className="size-5" />
                                </button>
                                {showSettings && (
                                    <div className="absolute right-0 bottom-10 bg-black/95 border border-white/10 rounded-lg p-3 min-w-48 text-sm space-y-3">
                                        <div>
                                            <div className="text-white/60 text-xs mb-1">Speed</div>
                                            <div className="flex flex-wrap gap-1">
                                                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((r) => (
                                                    <button
                                                        key={r}
                                                        onClick={() => {
                                                            if (videoRef.current) videoRef.current.playbackRate = r;
                                                            setRate(r);
                                                        }}
                                                        className={`px-2 py-0.5 rounded ${rate === r ? "bg-white text-black" : "hover:bg-white/10"}`}
                                                    >
                                                        {r}x
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        {levels.length > 0 && (
                                            <div>
                                                <div className="text-white/60 text-xs mb-1">Quality</div>
                                                <div className="flex flex-col gap-0.5">
                                                    <button
                                                        onClick={() => {
                                                            if (hlsRef.current) hlsRef.current.currentLevel = -1;
                                                        }}
                                                        className={`px-2 py-1 rounded text-left ${currentLevel === -1 ? "bg-white text-black" : "hover:bg-white/10"}`}
                                                    >
                                                        Auto
                                                    </button>
                                                    {levels
                                                        .slice()
                                                        .reverse()
                                                        .map((l) => (
                                                            <button
                                                                key={l.index}
                                                                onClick={() => {
                                                                    if (hlsRef.current) hlsRef.current.currentLevel = l.index;
                                                                }}
                                                                className={`px-2 py-1 rounded text-left ${currentLevel === l.index ? "bg-white text-black" : "hover:bg-white/10"}`}
                                                            >
                                                                {l.height}p
                                                            </button>
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <button onClick={toggleFullscreen} className="hover:text-red-500 transition p-1">
                                    {fullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mini-player — appears when main player scrolls out of view */}
            {showMini && (
                <MiniPlayer
                    videoRef={videoRef}
                    playing={playing}
                    current={current}
                    duration={duration}
                    title={title}
                    onTogglePlay={togglePlay}
                    onClose={() => setShowMini(false)}
                />
            )}
        </>
    );
}
