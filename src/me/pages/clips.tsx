import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Heart, MessageCircle, Share2, ThumbsDown, MoreHorizontal, VolumeX, Volume2,
    Play, Pause, ChevronUp, ChevronDown, BadgeCheck, Plus, Search, Smile, Paperclip, Send, Music as MusicIcon, Zap,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toAbsoluteUrl } from "@/lib/helpers";

type Clip = {
    id: string;
    cover: string;
    author: string;
    authorAvatar: string;
    followers: string;
    verified?: boolean;
    description: string;
    hashtags: string[];
    track: string;
    trend?: boolean;
    likes: string;
    comments: number;
    shares: string;
    views: string;
    date: string;
};

const CLIPS: Clip[] = [
    {
        id: "c1",
        cover: "/post-photo-1.jpg",
        author: "мартин",
        authorAvatar: "/avatar-1.jpg",
        followers: "48,4K подписчиков",
        verified: true,
        description: "трек: мартин - ты случилась",
        hashtags: ["рекомендации", "музыка", "мартин"],
        track: "мартин · ты случилась",
        trend: true,
        likes: "6,5K",
        comments: 130,
        shares: "280",
        views: "320,8K просмотров",
        date: "11 дней назад",
    },
    {
        id: "c2",
        cover: "/post-photo-2.jpg",
        author: "Женский тренер | Алина",
        authorAvatar: "/avatar-2.jpg",
        followers: "63,1K подписчиков",
        description: "👇 За 2 года набрала ЛИШНЕГО??",
        hashtags: ["фитнес", "тренировка"],
        track: "Валерий Меладзе · Салют, Вера",
        trend: true,
        likes: "15,8K",
        comments: 133,
        shares: "10,6K",
        views: "663,1K просмотров",
        date: "12 дней назад",
    },
    {
        id: "c3",
        cover: "/post-photo-3.jpg",
        author: "Travel Show",
        authorAvatar: "/avatar-3.jpg",
        followers: "120K подписчиков",
        verified: true,
        description: "Дубай за 24 часа — что успели увидеть",
        hashtags: ["путешествия", "дубай"],
        track: "DJ JEDY, Niki Four · Cheri Cheri Lady",
        likes: "9,1K",
        comments: 412,
        shares: "1,2K",
        views: "412K просмотров",
        date: "3 дня назад",
    },
    {
        id: "c4",
        cover: "/post-photo-4.jpg",
        author: "Ильдар Авто-Подбор",
        authorAvatar: "/avatar-4.jpg",
        verified: true,
        followers: "1,4M подписчиков",
        description: "Range Rover за 2 миллиона — стоит ли?",
        hashtags: ["авто", "подбор"],
        track: "оригинальный звук",
        likes: "23,4K",
        comments: 980,
        shares: "3,1K",
        views: "1,4M просмотров",
        date: "7 дней назад",
    },
];

const SUGGESTED = [
    { id: "s1", cover: "/post-photo-1.jpg", author: "Полина Создатель Видео", title: "Мои штаны, которые ищут все!💔 Арт..." },
    { id: "s2", cover: "/post-photo-2.jpg", author: "Анастасия Головина", title: "Шоколадные яйца из КБ. Апрель 2026..." },
    { id: "s3", cover: "/photo-1.jpg", author: "Зайцева_Хоум", title: "Моя самая эстетичная покупка 🥰 ..." },
    { id: "s4", cover: "/post-photo-3.jpg", author: "Кристина", title: "3949₽ — стоит ли своих денег?" },
    { id: "s5", cover: "/post-photo-4.jpg", author: "Lays", title: "НОВЫЙ LAYS? ОПЯТЬ НОВИНКА" },
    { id: "s6", cover: "/story-1.jpg", author: "VS", title: "кроссовки+джинсы vs туфли+джинсы" },
    { id: "s7", cover: "/post-video-thumb.jpg", author: "Tech Media", title: "Большой разговор про технологии" },
    { id: "s8", cover: "/post-music-cover.jpg", author: "ХАННА", title: "Музыка, тренды и закулисье" },
    { id: "s9", cover: "/avatar-5.jpg", author: "Urban Lab", title: "Тайные маршруты старого города" },
];

const COMMENTS = [
    { id: 1, author: "Ольга Кузнецова", avatar: "/avatar-2.jpg", time: "14 апр в 17:33", text: "Скоро будет иностранная фан база Мартина 😍", likes: 4 },
    { id: 2, author: "Мария Саблина", avatar: "/avatar-3.jpg", time: "14 апр в 18:04", text: "Канешна давно", likes: 0 },
    { id: 3, author: "Saint Agatha", avatar: "/avatar-5.jpg", time: "14 апр в 19:02", text: "хаха я помню тебя еще с Евровидения", likes: 3 },
    { id: 4, author: "Мийка Пуська", avatar: "/avatar-6.jpg", time: "14 апр в 11:41", text: "ХА ХА 🦊🦊", likes: 12 },
    { id: 5, author: "Вера Вера", avatar: "/avatar-7.jpg", time: "14 апр в 11:32", text: "Вам прям идёт 🤣", likes: 2 },
];

type Tab = "mine" | "for-you" | "subs" | "search";

const TabButton = ({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full text-left px-4 py-3 rounded-lg text-[15px] transition-colors",
            active ? "bg-secondary text-foreground font-medium" : "hover:bg-secondary/60 text-foreground/85",
        )}
    >
        {children}
    </button>
);

const RoundIconButton = ({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
    <button
        onClick={onClick}
        className={cn("w-12 h-12 rounded-full bg-surface-elevated/80 backdrop-blur flex items-center justify-center hover:bg-surface-elevated transition-colors", className)}
    >
        {children}
    </button>
);

const ClipPlayer = ({ clip, muted, onToggleMute, playing, onTogglePlay, onPrev, onNext }: {
    clip: Clip;
    muted: boolean;
    onToggleMute: () => void;
    playing: boolean;
    onTogglePlay: () => void;
    onPrev: () => void;
    onNext: () => void;
}) => (
    <div className="flex gap-4">
        {/* Vertical video */}
        <div className="relative bg-black rounded-2xl overflow-hidden" style={{ width: 360, aspectRatio: "9/16" }}>
            <img src={toAbsoluteUrl(clip.cover)} alt={clip.description} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/60" />

            {/* Center play/pause overlay */}
            <button
                onClick={onTogglePlay}
                className="absolute inset-0 flex items-center justify-center group"
                aria-label={playing ? "Пауза" : "Воспроизвести"}
            >
        <span className="w-16 h-16 rounded-full bg-black/40 backdrop-blur flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
          {playing ? <Pause className="w-7 h-7 text-white" fill="white" /> : <Play className="w-7 h-7 text-white ml-1" fill="white" />}
        </span>
            </button>

            {/* Bottom track pill */}
            <div className="absolute left-3 right-3 bottom-6 flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded-full bg-black/45 backdrop-blur text-white text-xs">
          <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center shrink-0">
            <MusicIcon className="w-3.5 h-3.5" />
          </span>
                    <span className="truncate">{clip.track}</span>
                </div>
                {clip.trend && (
                    <span className="px-2 py-1.5 rounded-full bg-black/55 backdrop-blur text-white text-xs flex items-center gap-1">
            Тренд <Zap className="w-3 h-3" fill="currentColor" />
          </span>
                )}
            </div>

            {/* Progress bar */}
            <div className="absolute left-0 right-0 bottom-0 h-1 bg-white/20">
                <div className="h-full bg-white" style={{ width: "32%" }} />
            </div>
        </div>

        {/* Action rail */}
        <div className="flex flex-col items-center justify-end gap-3 pb-8">
            <RoundIconButton onClick={onToggleMute}>
                {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </RoundIconButton>

            <div className="flex flex-col items-center gap-1 mt-2">
                <RoundIconButton><Heart className="w-5 h-5" /></RoundIconButton>
                <span className="text-xs text-foreground/80">{clip.likes}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
                <RoundIconButton><MessageCircle className="w-5 h-5" /></RoundIconButton>
                <span className="text-xs text-foreground/80">{clip.comments}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
                <RoundIconButton><Share2 className="w-5 h-5" /></RoundIconButton>
                <span className="text-xs text-foreground/80">{clip.shares}</span>
            </div>
            <RoundIconButton><ThumbsDown className="w-5 h-5" /></RoundIconButton>
            <RoundIconButton><MoreHorizontal className="w-5 h-5" /></RoundIconButton>

            <div className="mt-2 flex flex-col gap-2">
                <RoundIconButton onClick={onPrev}><ChevronUp className="w-5 h-5" /></RoundIconButton>
                <RoundIconButton onClick={onNext}><ChevronDown className="w-5 h-5" /></RoundIconButton>
            </div>
        </div>
    </div>
);

const ClipInfoCard = ({ clip }: { clip: Clip }) => (
    <div className="panel-card p-4 rounded-xl">
        <div className="flex items-start gap-3">
            <img src={toAbsoluteUrl(clip.authorAvatar)} alt={clip.author} className="w-10 h-10 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 font-semibold text-[15px]">
                    <span className="truncate">{clip.author}</span>
                    {clip.verified && <BadgeCheck className="w-4 h-4 text-primary shrink-0" fill="currentColor" />}
                </div>
                <div className="text-xs text-muted-foreground">{clip.followers}</div>
            </div>
            <button className="px-3 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                Подписаться
            </button>
        </div>

        <p className="mt-3 text-sm leading-snug">{clip.description}</p>
        <p className="mt-1 text-sm text-primary">
            {clip.hashtags.map((h) => `#${h}`).join(" ")}
        </p>
        <div className="mt-3 text-xs text-muted-foreground">
            {clip.views} · {clip.date}
        </div>
    </div>
);

const CommentsCard = ({ count }: { count: number }) => (
    <div className="panel-card rounded-xl flex flex-col" style={{ minHeight: 360 }}>
        <div className="px-4 py-3 border-b border-border/60 font-semibold">
            Комментарии <span className="text-muted-foreground font-normal">{count}</span>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 max-h-80">
            {COMMENTS.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5">
                    <img src={toAbsoluteUrl(c.avatar)} alt={c.author} className="w-8 h-8 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                        <div className="text-sm">
                            <span className="font-semibold">{c.author}</span>
                            <span className="text-muted-foreground text-xs ml-2">{c.time}</span>
                        </div>
                        <div className="text-sm mt-0.5 leading-snug">{c.text}</div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <button className="flex items-center gap-1 hover:text-foreground">
                                <Heart className="w-3.5 h-3.5" /> {c.likes > 0 ? c.likes : ""}
                            </button>
                            <button className="hover:text-foreground">Ответить</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        <div className="px-3 py-3 border-t border-border/60 flex items-center gap-2">
            <img src={toAbsoluteUrl("/avatar-me.jpg")} alt="Я" className="w-8 h-8 rounded-full object-cover" />
            <div className="flex-1 flex items-center gap-1 px-3 py-2 rounded-full bg-secondary">
                <input className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground" placeholder="Комментарий" />
                <button className="text-muted-foreground hover:text-foreground"><Paperclip className="w-4 h-4" /></button>
                <button className="text-muted-foreground hover:text-foreground"><Smile className="w-4 h-4" /></button>
            </div>
            <button className="text-primary hover:opacity-80"><Send className="w-5 h-5" /></button>
        </div>
    </div>
);

const SearchGrid = ({ onOpen }: { onOpen: (clip: Clip) => void }) => (
    <div className="panel-card rounded-xl p-4">
        <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary outline-none placeholder:text-muted-foreground text-sm" placeholder="Поиск клипов" />
        </div>
        <h3 className="text-lg font-semibold mb-3">Может заинтересовать</h3>
        <div className="grid grid-cols-3 gap-3">
            {SUGGESTED.map((s, i) => (
                <button
                    key={s.id}
                    onClick={() => onOpen(CLIPS[i % CLIPS.length])}
                    className="text-left group"
                >
                    <div className="relative rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "9/16" }}>
                        <img src={s.cover} alt={s.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute left-2 right-2 bottom-2 text-white text-xs font-medium leading-snug line-clamp-2">
                            {s.author}
                        </div>
                    </div>
                    <div className="mt-2 text-sm leading-snug line-clamp-2">{s.title}</div>
                </button>
            ))}
        </div>
    </div>
);

const EmptyState = ({ title }: { title: string }) => (
    <div className="panel-card rounded-xl flex flex-col items-center justify-center py-24 text-center">
        <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center mb-3">
            <span className="text-2xl">✌️</span>
        </div>
        <div className="font-semibold">{title}</div>
    </div>
);

const RightTabs = ({ tab, setTab, onPublish }: { tab: Tab; setTab: (t: Tab) => void; onPublish: () => void }) => (
    <div className="panel-card rounded-xl p-2">
        <div className="flex items-center justify-between gap-2 px-2 pt-1">
            <TabButton active={tab === "mine"} onClick={() => setTab("mine")}>Мои клипы</TabButton>
            <button
                onClick={onPublish}
                className="shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-secondary hover:bg-accent text-sm font-medium"
            >
                <Plus className="w-4 h-4" /> Опубликовать
            </button>
        </div>
        <TabButton active={tab === "for-you"} onClick={() => setTab("for-you")}>Для вас</TabButton>
        <TabButton active={tab === "subs"} onClick={() => setTab("subs")}>Подписки</TabButton>
        <TabButton active={tab === "search"} onClick={() => setTab("search")}>Поиск клипов</TabButton>
    </div>
);

const PublishModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-120 rounded-2xl border-border bg-popover p-8 text-center">
            <h2 className="text-xl font-semibold">Новый клип</h2>
            <p className="mt-2 text-sm text-muted-foreground">
                Выберите или перетащите в это окно вертикальное<br />
                видео длиной от 1 секунды до 3 минут
            </p>
            <button className="mt-6 w-full h-12 rounded-xl bg-foreground text-background font-medium hover:opacity-90">
                Выбрать файл
            </button>
            <p className="mt-5 text-xs text-muted-foreground leading-relaxed">
                У роликов с разрешением 1080×1920 px<br />
                больше шансов попасть в рекомендации.<br />
                Другие советы для авторов клипов читайте <a className="text-primary" href="#">здесь</a>.
            </p>
        </DialogContent>
    </Dialog>
);

const Clips = () => {
    const [tab, setTab] = useState<Tab>("for-you");
    const [index, setIndex] = useState(0);
    const [muted, setMuted] = useState(true);
    const [playing, setPlaying] = useState(false);
    const [publishOpen, setPublishOpen] = useState(false);

    const clip = CLIPS[index];
    const next = () => setIndex((i) => (i + 1) % CLIPS.length);
    const prev = () => setIndex((i) => (i - 1 + CLIPS.length) % CLIPS.length);

    const right = (
        <RightTabs tab={tab} setTab={setTab} onPublish={() => setPublishOpen(true)} />
    );

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
                {tab === "for-you" || tab === "mine" ? (
                    <div className="flex flex-col gap-4">
                        <ClipPlayer
                            clip={clip}
                            muted={muted}
                            onToggleMute={() => setMuted((m) => !m)}
                            playing={playing}
                            onTogglePlay={() => setPlaying((p) => !p)}
                            onPrev={prev}
                            onNext={next}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ClipInfoCard clip={clip} />
                            <CommentsCard count={clip.comments} />
                        </div>
                    </div>
                ) : tab === "subs" ? (
                    <EmptyState title="У вас пока нет подписок" />
                ) : (
                    <SearchGrid onOpen={(c) => { setIndex(CLIPS.findIndex((x) => x.id === c.id)); setTab("for-you"); }} />
                )}

                <PublishModal open={publishOpen} onClose={() => setPublishOpen(false)} />
            </div>
            <aside className="hidden xl:flex flex-col w-70 shrink-0 py-0 gap-3 sticky top-18 self-start max-h-[calc(100vh-72px)]">
                {right}
            </aside>
        </div>
    );
};

export default Clips;
