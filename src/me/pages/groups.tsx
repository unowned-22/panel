import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PostCard } from "@/components/feed/PostCard";
import type { Post } from "@/components/feed/types";
import {
    BadgeCheck,
    Bell,
    Calendar,
    ChevronDown,
    CircleAlert,
    Globe2,
    HeartHandshake,
    Image as ImageIcon,
    Link as LinkIcon,
    List,
    MessageCircle,
    MoreHorizontal,
    Music,
    PlaySquare,
    Search,
    UserPlus,
    Users,
    Video,
    X,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toAbsoluteUrl } from "@/lib/helpers";

const tabs = [
    { id: "video", label: "Видео", icon: PlaySquare },
    { id: "clips", label: "Клипы", icon: Video },
    { id: "photo", label: "Фото", icon: ImageIcon },
    { id: "music", label: "Музыка", icon: Music },
    { id: "events", label: "Мероприятия", icon: Calendar },
    { id: "discussions", label: "Обсуждения", icon: MessageCircle },
];

const videos = [
    { title: "Добавленные", date: "6 марта 2025", src: "/post-video-thumb.jpg", views: "4" },
    { title: "Французский поцелуй (Teaser,...", date: "20 октября 2020", src: "/post-photo-3.jpg", views: "8" },
    { title: "Mood video", date: "21 апреля 2021", src: "/post-photo-4.jpg", views: "4" },
];

const clips = [
    { src: "/post-photo-4.jpg", views: "17,4К" },
    { src: "/avatar-1.jpg", views: "26,9К" },
    { src: "/post-photo-2.jpg", views: "101,6К" },
];

const photos = ["/photo-1.jpg", "/avatar-1.jpg", "/avatar-me.jpg", "/post-photo-1.jpg", "/post-photo-2.jpg", "/post-photo-3.jpg", "/post-photo-4.jpg", "/post-video-thumb.jpg"];
const tracks = ["ШАНС", "Небо", "Навсегда твоя", "Не теряй", "Трогать запрещено", "Запрещённая любовь", "Музыка звучит"];
const fans = [
    { name: "Юля", src: "/avatar-1.jpg" },
    { name: "Екатерина", src: "/avatar-2.jpg" },
    { name: "Юлия", src: "/avatar-3.jpg" },
    { name: "Максим", src: "/avatar-4.jpg" },
    { name: "Наталья", src: "/avatar-5.jpg" },
    { name: "Натали", src: "/avatar-6.jpg" },
];

const recent = [
    { name: "SunShow", color: "from-yellow-400 to-orange-500" },
    { name: "Комбинац...", color: "from-pink-500 to-purple-600" },
];

const recs = [
    { name: "ХАННА", category: "Музыкант", verified: true },
    { name: "Мобильная фотография", category: "Фотография" },
    { name: "Семья, дети и отношен...", category: "Родители и дети" },
    { name: "visualgram", category: "Бизнес", verified: true },
    { name: "Nika.family", category: "Родители и дети", verified: true },
    { name: "ржпг | комиксы", category: "Художник" },
    { name: "Академия Леди", category: "Общество", verified: true },
    { name: "EDISON FAMILY ™", category: "Блогер" },
];

const forYou = [
    { name: "Чижик", subs: "2,2М подписчиков", color: "bg-yellow-500" },
    { name: "Психология и Отн...", subs: "539,5К подписчиков", color: "bg-zinc-700" },
    { name: "Мудрая книга жиз...", subs: "329,1К подписчиков", color: "bg-rose-200" },
];

const Groups = () => {
    const [activeTab, setActiveTab] = useState("video");
    const [selectedCommunity, setSelectedCommunity] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const featured = useMemo(() => ["/post-music-cover.jpg", "/avatar-me.jpg", "/post-photo-2.jpg"], []);

    // Автооткрытие сообщества по query (?id=hanna и т.п.)
    useEffect(() => {
        if (searchParams.get("id")) setSelectedCommunity(true);
    }, [searchParams]);

    const closeCommunity = () => {
        setSelectedCommunity(false);
        if (searchParams.has("id")) {
            const next = new URLSearchParams(searchParams);
            next.delete("id");
            setSearchParams(next, { replace: true });
        }
    };

    const communityPosts: Post[] = useMemo(
        () => [
            {
                id: "hanna-post-1",
                author: { id: "hanna", kind: "group", name: "ХАННА", avatar: "/post-music-cover.jpg", subtitle: "Сообщество · только что" },
                time: "только что",
                text: "Премьера трека «Русская красавица» уже сегодня вечером! Кто ждёт?",
                media: [{ type: "photo", images: ["/post-photo-2.jpg"] }],
                stats: { likes: 12400, comments: 842, shares: 318 },
            },
            {
                id: "hanna-post-2",
                author: { id: "hanna", kind: "group", name: "ХАННА", avatar: "/post-music-cover.jpg", subtitle: "Сообщество · вчера" },
                time: "вчера",
                text: "Backstage съёмок нового клипа 🎬",
                media: [{ type: "photo", images: ["/post-photo-3.jpg", "/post-photo-4.jpg"] }],
                stats: { likes: 9800, comments: 410, shares: 122 },
            },
        ],
        [],
    );

    const renderTabContent = () => {
        if (activeTab === "clips") {
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                        {clips.map((clip) => (
                            <div key={clip.src} className="relative aspect-9/16 overflow-hidden rounded-lg bg-secondary">
                                <img src={clip.src} alt="Клип сообщества" className="h-full w-full object-cover" loading="lazy" />
                                <div className="absolute bottom-2 left-2 flex items-center gap-1 text-sm font-bold text-foreground drop-shadow"><Search className="h-4 w-4" />{clip.views}</div>
                            </div>
                        ))}
                    </div>
                    <button className="button-pill w-full rounded-lg bg-secondary/80!">Показать все 872</button>
                </div>
            );
        }

        if (activeTab === "photo") {
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-0.5 overflow-hidden rounded-lg">
                        {photos.map((src, index) => <img key={`${src}-${index}`} src={src} alt={`Фото сообщества ${index + 1}`} className="aspect-square w-full object-cover" loading="lazy" />)}
                    </div>
                    <button className="button-pill w-full rounded-lg bg-secondary/80!">Показать все 2,4К</button>
                </div>
            );
        }

        if (activeTab === "music") {
            return (
                <div className="space-y-3">
                    {tracks.map((track, index) => (
                        <div key={track} className="flex items-center gap-3">
                            <div className={cn("h-12 w-12 rounded-lg bg-(--gradient-music-3)", index < 4 && "bg-(--gradient-music-2)")} />
                            <div>
                                <div className="text-sm font-semibold">{track}</div>
                                <div className="text-xs text-muted-foreground">ХАННА</div>
                            </div>
                        </div>
                    ))}
                    <button className="button-pill w-full rounded-lg bg-secondary/80!">Показать все 37</button>
                </div>
            );
        }

        if (activeTab === "discussions") {
            return (
                <div className="space-y-5 px-1 py-2">
                    <div><div className="font-semibold">Тексты песен</div><div className="text-sm text-muted-foreground">93 комментария · 31 января в 12:27</div></div>
                    <div><div className="font-semibold">Интересно знать</div><div className="text-sm text-muted-foreground">495 комментариев · 31 января в 12:27</div></div>
                    <button className="button-pill w-full rounded-lg bg-secondary/80!">Показать все 2</button>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                    {videos.map((video) => (
                        <article key={video.title} className="min-w-0">
                            <div className="relative aspect-video overflow-hidden rounded-lg bg-secondary">
                                <img src={video.src} alt={video.title} className="h-full w-full object-cover" loading="lazy" />
                                <div className="absolute right-2 top-2 rounded bg-background/70 px-1.5 py-0.5 text-sm font-bold">≡›</div>
                                <div className="absolute bottom-2 right-2 rounded bg-background/70 px-1.5 py-0.5 text-xs font-bold">{video.views}</div>
                            </div>
                            <h3 className="mt-2 truncate text-sm font-bold">{video.title}</h3>
                            <p className="text-xs text-muted-foreground">{video.date}</p>
                        </article>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-3 border-t border-border pt-4">
                    {featured.slice(0, 2).map((src, index) => (
                        <article key={src}>
                            <div className="relative aspect-video overflow-hidden rounded-lg bg-secondary">
                                <img src={src} alt={`Видео сообщества ${index + 1}`} className="h-full w-full object-cover" loading="lazy" />
                                <span className="absolute bottom-2 right-2 rounded bg-background/70 px-1.5 py-0.5 text-xs font-bold">{index ? "1:52" : "3:03"}</span>
                            </div>
                            <h3 className="mt-2 line-clamp-2 text-sm font-bold">ХАННА — Премьера трека 2025</h3>
                        </article>
                    ))}
                </div>
            </div>
        );
    };

    if (!selectedCommunity) {
        return (
            <div className="flex gap-4">
                <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input className="h-12 w-full rounded-2xl bg-card pl-11 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none" placeholder="Поиск сообществ" />
                    </div>

                    <div className="panel-card p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <span className="font-semibold">Недавно посещали</span>
                            <button className="text-muted-foreground"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="flex gap-4">
                            {recent.map((r) => (
                                <button key={r.name} onClick={() => r.name === "SunShow" && setSelectedCommunity(true)} className="flex flex-col items-center gap-2">
                                    <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${r.color}`} />
                                    <span className="text-xs">{r.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="panel-card p-4">
                        <div className="mb-4 flex items-baseline gap-2">
                            <span className="font-semibold">Рекомендации</span>
                            <span className="text-sm text-muted-foreground">163</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                            {recs.map((r) => (
                                <button key={r.name} onClick={() => r.name === "ХАННА" && setSelectedCommunity(true)} className="flex min-w-0 items-center gap-3 text-left">
                                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-secondary">
                                        {r.name === "ХАННА" && <img src={toAbsoluteUrl("/post-music-cover.jpg")} alt="ХАННА" className="h-full w-full object-cover" />}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1 truncate text-sm font-medium">
                                            {r.name} {r.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 fill-primary text-background" />}
                                        </div>
                                        <div className="truncate text-xs text-muted-foreground">{r.category}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <button className="mt-4 w-full text-center text-sm text-primary hover:underline">Показать все ›</button>
                    </div>

                    <div className="panel-card p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <span className="font-semibold">Для вас</span>
                            <button className="text-sm text-primary hover:underline">Показать все</button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {forYou.map((f) => (
                                <div key={f.name} className={`relative aspect-square overflow-hidden rounded-2xl ${f.color}`}>
                                    <div className="absolute bottom-2 left-2 right-2">
                                        <span className="rounded bg-background/60 px-1.5 py-0.5 text-[10px] font-semibold backdrop-blur">{f.subs}</span>
                                        <div className="mt-1 text-sm font-semibold text-foreground drop-shadow">{f.name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <aside className="hidden xl:flex flex-col w-70 shrink-0 py-0 gap-3 sticky top-18 self-start max-h-[calc(100vh-72px)]">
                    <button className="button-pill w-full bg-secondary! py-3!">Создать сообщество</button>
                    <div className="panel-card p-2">
                        <button className="w-full rounded-lg bg-secondary px-3 py-2 text-left text-sm">Главная</button>
                        <button className="mt-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/60">
                            Мероприятия <Calendar className="h-4 w-4" />
                        </button>
                    </div>
                </aside>
            </div>
        );
    }

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
                <button onClick={closeCommunity} className="w-fit text-sm font-semibold text-primary hover:underline">‹ Все сообщества</button>
                <section className="panel-card overflow-hidden rounded-xl">
                    <div className="relative h-76.25 overflow-hidden bg-[radial-gradient(circle_at_22%_36%,hsl(var(--primary)/0.42),transparent_24%),radial-gradient(circle_at_78%_20%,hsl(var(--destructive)/0.28),transparent_30%),linear-gradient(105deg,hsl(var(--secondary)),hsl(var(--background)))]">
                        <img src={toAbsoluteUrl("/avatar-me.jpg")} alt="Обложка сообщества ХАННА" className="absolute left-[21%] top-4 h-68 w-68 object-cover" loading="lazy" />
                        <div className="absolute right-[13%] top-24 text-center tracking-[0.35em] text-foreground/75">ПРЕМЬЕРА</div>
                        <div className="absolute right-[11%] top-32 max-w-sm text-center text-5xl font-black leading-tight">РУССКАЯ<br />КРАСАВИЦА</div>
                        <div className="absolute bottom-4 right-4 rounded bg-background/70 px-1.5 py-0.5 text-xs font-bold">A+</div>
                    </div>
                    <div className="relative flex min-h-29.5 items-center gap-4 bg-card px-5 py-4">
                        <img src={toAbsoluteUrl("/post-music-cover.jpg")} alt="ХАННА" className="absolute -top-8 left-5 h-28 w-28 rounded-full border-4 border-primary object-cover ring-4 ring-card" />
                        <div className="ml-32 min-w-0 flex-1">
                            <h1 className="flex items-center gap-2 text-2xl font-black">ХАННА <BadgeCheck className="h-5 w-5 fill-primary text-card" /></h1>
                            <p className="mt-1 text-sm text-muted-foreground">305,3К подписчиков</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="button-pill rounded-lg bg-foreground px-5 text-background hover:bg-foreground/90">Подписаться</button>
                            <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary hover:bg-accent" aria-label="Написать"><MessageCircle className="h-5 w-5" /></button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><button className="button-pill gap-2 rounded-lg px-4">Ещё <ChevronDown className="h-4 w-4" /></button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-80 rounded-xl border-border bg-popover p-4 shadow-elevated">
                                    <div className="mb-3 grid grid-cols-2 gap-3 border-b border-border pb-4 text-primary">
                                        <button className="flex flex-col items-center gap-2 rounded-lg p-2 hover:bg-secondary"><HeartHandshake className="h-5 w-5" />Избранное</button>
                                        <button className="flex flex-col items-center gap-2 rounded-lg p-2 hover:bg-secondary"><Bell className="h-5 w-5" />Уведомления</button>
                                    </div>
                                    <DropdownMenuItem className="gap-3 py-3"><UserPlus className="h-4 w-4 text-primary" />Пригласить друзей</DropdownMenuItem>
                                    <DropdownMenuItem className="gap-3 py-3"><MessageCircle className="h-4 w-4 text-primary" />Разрешить сообщения</DropdownMenuItem>
                                    <DropdownMenuItem className="gap-3 py-3"><Users className="h-4 w-4 text-primary" />Похожие сообщества</DropdownMenuItem>
                                    <DropdownMenuItem className="gap-3 py-3 text-destructive"><CircleAlert className="h-4 w-4" />Пожаловаться</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-[minmax(0,1fr)_344px] gap-4 max-xl:grid-cols-1">
                    <div className="space-y-4">
                        <div className="panel-card overflow-hidden rounded-xl p-4">
                            <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-none">
                                {tabs.map(({ id, label, icon: Icon }) => (
                                    <button key={id} onClick={() => setActiveTab(id)} className={cn("flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-colors", activeTab === id ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60")}>
                                        <Icon className="h-4 w-4" />{label}
                                    </button>
                                ))}
                            </div>
                            {renderTabContent()}
                        </div>
                        <div className="panel-card p-4">
                            <div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Рады видеть тебя, Mark!</h2><MoreHorizontal className="h-5 w-5 text-muted-foreground" /></div>
                            <div className="grid grid-cols-3 gap-3">
                                {featured.map((src) => <img key={src} src={src} alt="Премьера трека" className="aspect-square rounded-lg object-cover" loading="lazy" />)}
                            </div>
                            <div className="mt-2 grid grid-cols-3 gap-3 text-sm"><b>ПРЕМЬЕРА ТРЕКА!</b><b>ПРЕМЬЕРА ТРЕКА!</b><b>ПРЕМЬЕРА ТРЕКА!</b></div>
                        </div>

                        {/* Записи сообщества — можно репостнуть к себе в ленту */}
                        <div className="flex flex-col gap-3">
                            <div className="px-1 text-sm font-semibold text-muted-foreground">Записи сообщества</div>
                            {communityPosts.map((p) => (
                                <PostCard key={p.id} post={p} />
                            ))}
                        </div>
                    </div>
                    <RightCommunityPanel fans={fans} inline />
                </section>
            </div>
            <aside className="hidden xl:flex flex-col w-70 shrink-0 py-0 gap-3 sticky top-18 self-start max-h-[calc(100vh-72px)]">
                <RightCommunityPanel fans={fans} />
            </aside>
        </div>
    );
};

const RightCommunityPanel = ({ fans, inline = false }: { fans: { name: string; src: string }[]; inline?: boolean }) => (
    <div className={cn("flex flex-col gap-4", !inline && "xl:hidden", inline && "max-xl:hidden")}>
        <div className="panel-card rounded-xl p-5">
            <div className="flex gap-4"><List className="mt-1 h-5 w-5 text-muted-foreground" /><div><p className="font-bold leading-snug">«Я создаю музыку, под которую хочется танцевать!»</p><p className="text-sm text-muted-foreground">(с) Ханна <span className="text-primary">Ещё</span></p></div></div>
            <div className="mt-4 flex items-center gap-3 text-primary"><Globe2 className="h-5 w-5 text-muted-foreground" />https://taplink.cc/offihanna</div>
            <div className="mt-4 flex items-center gap-3 text-primary"><CircleAlert className="h-5 w-5 text-muted-foreground" />Подробная информация</div>
        </div>
        <button className="panel-card flex items-center gap-4 rounded-xl p-5 text-left font-bold"><LinkIcon className="h-5 w-5 text-primary" />Перейти к музыканту</button>
        <div className="panel-card rounded-xl p-5">
            <h2 className="mb-4 font-bold">Подписчики <span className="font-medium text-muted-foreground">305 335</span></h2>
            <div className="grid grid-cols-4 gap-4 text-center text-xs font-semibold">
                {fans.map((fan) => <div key={fan.name}><img src={fan.src} alt={fan.name} className="mx-auto mb-2 h-14 w-14 rounded-full object-cover" loading="lazy" />{fan.name}</div>)}
            </div>
        </div>
    </div>
);

export default Groups;