import { useMemo, useRef, useState } from "react";
import { CreatePost } from "@/components/feed/CreatePost";
import { PostCard } from "@/components/feed/PostCard";
import type { Post } from "@/components/feed/types";
import {
    AlertCircle,
    Music,
    Plus,
    RotateCcw,
    RotateCw,
    X,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useStories } from "@/hooks/use-stories";
import { useAccount } from "@/hooks/use-account";
import { CreateStoryModal } from "@/components/feed/CreateStoryModal";
import { StoriesViewer } from "@/components/stories";
import { toAbsoluteUrl } from "@/lib/helpers.ts";
import { CoverEditorModal } from "@/me/components/cover-editor";
import type { CoverCropResult } from "@/me/components/cover-editor";

// type TabKey = "photos" | "albums" | "videos" | "clips" | "music" | "articles";

// const tabs: { key: TabKey; label: string; icon: typeof ImageIcon }[] = [
//     { key: "photos", label: "Фото", icon: ImageIcon },
//     { key: "albums", label: "Альбомы", icon: ImageIcon },
//     { key: "videos", label: "Видео", icon: Video },
//     { key: "clips", label: "Клипы", icon: Crop },
//     { key: "music", label: "Музыка", icon: Music },
//     { key: "articles", label: "Статьи", icon: ListFilter },
// ];

const wave = (n: number, seed = 1) =>
    Array.from({ length: n }, (_, i) => 0.3 + 0.7 * Math.abs(Math.sin((i + seed) * 1.7)));

type FeedSort = "date" | "popular";

const userPosts: (Post & { createdAt: number })[] = [
    {
        id: "u1",
        author: { name: "Mark Roberts", avatar: "/avatar-me.jpg", subtitle: "2 ч назад" },
        time: "2 ч",
        createdAt: Date.now() - 2 * 60 * 60 * 1000,
        text: "Сегодня прогулялся по центру — поймал отличный свет на закате. Делюсь кадрами 🌇",
        media: [{ type: "photo", images: ["/post-photo-1.jpg", "/post-photo-2.jpg", "/post-photo-3.jpg"] }],
        stats: { likes: 184, comments: 23, shares: 4 },
    },
    {
        id: "u2",
        author: { name: "Mark Roberts", avatar: "/avatar-me.jpg", subtitle: "Вчера" },
        time: "вчера",
        createdAt: Date.now() - 24 * 60 * 60 * 1000,
        text: "Маленькая мысль на вечер: лучшее время начать — сейчас. Самые сложные шаги всегда первые, а потом дорога сама ведёт.",
        stats: { likes: 412, comments: 47, shares: 12 },
    },
    {
        id: "u3",
        author: { name: "Mark Roberts", avatar: "/avatar-me.jpg", subtitle: "3 д назад" },
        time: "3 д",
        createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        text: "Записал короткое видео из мастерской — показываю процесс 🎬",
        media: [{ type: "video", video: { kind: "upload", thumbnail: "/post-video-thumb.jpg", duration: "0:48" } }],
        stats: { likes: 96, comments: 11, shares: 2 },
    },
    {
        id: "u4",
        author: { name: "Mark Roberts", avatar: "/avatar-me.jpg", subtitle: "Неделю назад" },
        time: "1 нед",
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
        text: "Голосовое — поделился впечатлениями от поездки 🎙️",
        media: [{ type: "audio", audio: { kind: "voice", duration: "0:42", waveform: wave(36, 5) } }],
        stats: { likes: 58, comments: 6, shares: 1 },
    },
];

// const userVideos = [
//     { thumb: "/post-video-thumb.jpg", duration: "0:48", title: "В мастерской" },
//     { thumb: "/post-photo-4.jpg", duration: "1:24", title: "Закат у моря" },
//     { thumb: "/post-1.jpg", duration: "2:10", title: "Концерт" },
// ];
// const userClips = ["/post-photo-2.jpg", "/post-photo-3.jpg", "/post-photo-1.jpg", "/post-photo-4.jpg"];
// const userAlbums = [
//     { cover: "/post-photo-1.jpg", title: "Путешествия", count: 24 },
//     { cover: "/photo-1.jpg", title: "Семья", count: 12 },
//     { cover: "/post-1.jpg", title: "Концерты", count: 8 },
// ];
// const userTracks = [
//     { title: "Midnight Drive", artist: "Lo-Fi Bear", duration: "3:24" },
//     { title: "Soft Rain", artist: "Aurora", duration: "2:58" },
//     { title: "Coffee & Code", artist: "Nordic Loops", duration: "4:12" },
// ];
// const userArticles = [
//     { title: "Как я научился фотографировать на смартфон", time: "5 мин чтения", date: "20 апр" },
//     { title: "Минимализм в повседневной жизни", time: "8 мин чтения", date: "12 мар" },
// ];

type AvatarStep = "upload" | "crop" | "thumb" | "finish";

const Profile = () => {
    const { activeAccount } = useAccount();
    const [avatar, setAvatar] = useState<string|null>(() => {
        return activeAccount.user?.avatar_url ?? null;
    });
    const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
    const [avatarStep, setAvatarStep] = useState<AvatarStep>("upload");
    const [avatarError, setAvatarError] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // const [activeTab, setActiveTab] = useState<TabKey>("photos");
    const [feedSort, setFeedSort] = useState<FeedSort>("date");
    const { users } = useStories();
    const myStories = users.find((u) => u.isMe)?.items ?? [];
    const [createStoryOpen, setCreateStoryOpen] = useState(false);
    const [storyViewerOpen, setStoryViewerOpen] = useState(false);
    const [cover, setCover] = useState<string | null>(null);
    const [coverEditorOpen, setCoverEditorOpen] = useState(false);
    const user = activeAccount.user;

    const accountPosts = useMemo(
        () =>
            userPosts.map((p) => ({
                ...p,
                author: { ...p.author, name: activeAccount.name },
            })),
        [activeAccount],
    );

    const sortedPosts = useMemo(() => {
        const arr = [...accountPosts];
        if (feedSort === "popular") arr.sort((a, b) => b.stats.likes - a.stats.likes);
        else arr.sort((a, b) => (b as any).createdAt - (a as any).createdAt);
        return arr;
    }, [feedSort, accountPosts]);

    // const profilePhotos = useMemo(() => ["/post-photo-1.jpg", "/post-photo-2.jpg", "/post-photo-3.jpg", "/post-photo-4.jpg", "/photo-1.jpg", "/post-1.jpg"], []);

    const handlePickFile = () => {
        if (!avatarError) {
            setAvatarError(true);
            return;
        }
        setAvatarStep("crop");
    };

    const finishAvatar = () => {
        setAvatar("/avatar-me.jpg");
        setAvatarDialogOpen(false);
        setAvatarStep("upload");
        setAvatarError(false);
    };

    const renderAvatarDialog = () => {
        const title =
            avatarStep === "crop"
                ? "Фотография на вашей странице"
                : avatarStep === "thumb"
                    ? "Выбор миниатюры"
                    : avatarStep === "finish"
                        ? "Завершение"
                        : "Загрузка новой фотографии";

        return (
            <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
                <DialogContent className="max-w-160 overflow-hidden rounded-xl border-border bg-popover p-0 shadow-elevated [&>button]:-right-13.5 [&>button]:top-4 [&>button]:h-8 [&>button]:w-8 [&>button]:rounded-full [&>button]:bg-secondary [&>button]:opacity-100">
                    <DialogTitle className="border-b border-border px-6 py-4 text-base font-semibold">{title}</DialogTitle>

                    {avatarStep === "upload" && (
                        <div className="space-y-8 py-9 text-center">
                            {avatarError && (
                                <div className="mx-auto flex max-w-137 items-start gap-3 rounded bg-destructive/30 px-4 py-3 text-left text-destructive-foreground">
                                    <AlertCircle className="mt-0.5 h-8 w-8 shrink-0" />
                                    <div>
                                        <div className="font-semibold">Произошла ошибка</div>
                                        <div className="text-sm font-medium">Фотография должна иметь размер не менее 400 точек в ширину и не менее 400 точек в высоту.</div>
                                    </div>
                                </div>
                            )}
                            <p className="mx-auto max-w-130 text-sm font-semibold leading-relaxed text-foreground/90">
                                Друзьям будет проще узнать вас, если вы загрузите свою настоящую фотографию. Вы можете загрузить изображение в формате JPG, GIF, PNG, WEBP или HEIC/HEIF.
                            </p>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
                            <button onClick={handlePickFile} className="button-pill bg-foreground px-5 text-background hover:bg-foreground/90">Выбрать файл</button>
                            <div className="border-t border-border px-6 pt-5 text-xs font-semibold text-muted-foreground">Если у вас возникают проблемы с загрузкой, попробуйте выбрать фотографию меньшего размера.</div>
                        </div>
                    )}

                    {avatarStep === "crop" && (
                        <div className="px-6 pb-5 pt-7 text-center">
                            <p className="mb-5 text-sm font-semibold leading-relaxed text-foreground/90">Выбранная область будет показываться на вашей странице.<br />Если изображение ориентировано неправильно, фотографию можно повернуть.</p>
                            <div className="relative mx-auto aspect-[1.12] max-h-143.75 overflow-hidden rounded-lg bg-[linear-gradient(45deg,hsl(var(--secondary))_25%,transparent_25%),linear-gradient(-45deg,hsl(var(--secondary))_25%,transparent_25%),linear-gradient(45deg,transparent_75%,hsl(var(--secondary))_75%),linear-gradient(-45deg,transparent_75%,hsl(var(--secondary))_75%)] bg-[length:32px_32px] bg-[position:0_0,0_16px,16px_-16px,-16px_0px] p-8">
                                <img src={toAbsoluteUrl("/avatar-me.jpg")} alt="Предпросмотр аватара" className="mx-auto h-full max-h-130 object-contain" />
                                <div className="absolute inset-x-16 bottom-14 top-14 border-4 border-foreground/80 shadow-[0_0_0_999px_hsl(var(--background)/0.45)]" />
                                <div className="absolute bottom-3 right-3 flex gap-1 rounded bg-background/80 p-1">
                                    <RotateCcw className="h-5 w-5" /><RotateCw className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="mt-5 flex justify-center gap-2">
                                <button onClick={() => setAvatarStep("thumb")} className="button-pill bg-foreground text-background hover:bg-foreground/90">Сохранить и продолжить</button>
                                <button onClick={() => setAvatarStep("upload")} className="button-pill">Вернуться назад</button>
                            </div>
                        </div>
                    )}

                    {avatarStep === "thumb" && (
                        <div className="px-6 pb-8 pt-9 text-center">
                            <p className="mb-9 text-sm font-semibold leading-relaxed text-foreground/90">Выберите область для маленьких фотографий.<br />Выбранная миниатюра будет использоваться в новостях, личных сообщениях и комментариях.</p>
                            <div className="flex items-center justify-center gap-8">
                                <div className="relative h-48 w-48 overflow-hidden rounded-lg bg-secondary">
                                    <img src={toAbsoluteUrl("/avatar-me.jpg")} alt="Область миниатюры" className="h-full w-full object-cover" />
                                    <div className="absolute inset-4 rounded-full border-4 border-foreground/85 shadow-[0_0_0_999px_hsl(var(--background)/0.3)]" />
                                </div>
                                <div className="space-y-6">
                                    <img src={toAbsoluteUrl("/avatar-me.jpg")} alt="Большая миниатюра" className="h-20 w-20 rounded-full object-cover" />
                                    <img src={toAbsoluteUrl("/avatar-me.jpg")} alt="Маленькая миниатюра" className="mx-auto h-10 w-10 rounded-full object-cover" />
                                </div>
                            </div>
                            <div className="mt-5 flex justify-center gap-2">
                                <button onClick={() => setAvatarStep("finish")} className="button-pill bg-foreground text-background hover:bg-foreground/90">Сохранить изменения</button>
                                <button onClick={() => setAvatarStep("crop")} className="button-pill">Вернуться назад</button>
                            </div>
                        </div>
                    )}

                    {avatarStep === "finish" && (
                        <div className="px-6 pb-7 pt-14 text-center">
                            <img src={toAbsoluteUrl("/avatar-me.jpg")} alt="Новый аватар" className="mx-auto mb-8 h-28 w-28 rounded-full object-cover" />
                            <div className="mx-auto max-w-105 text-2xl font-bold leading-tight">Опубликуйте пост, чтобы получить больше обратной связи от друзей</div>
                            <label className="mt-6 inline-flex items-center gap-3 text-sm font-semibold"><input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" /> Опубликовать в посте</label>
                            <div className="mt-14 flex justify-center gap-2">
                                <button onClick={finishAvatar} className="button-pill bg-foreground text-background hover:bg-foreground/90">Продолжить</button>
                                <button onClick={() => setAvatarStep("thumb")} className="button-pill">Вернуться назад</button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        );
    };

    return (
        <>
            <div className="flex gap-4">
                <div className="flex-1 min-w-0 flex flex-col gap-3">
                    <div className="panel-card overflow-hidden rounded-xl p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="font-semibold">Мои истории</div>
                            <span className="text-xs text-muted-foreground">{myStories.length}</span>
                        </div>
                        <div className="flex gap-3 overflow-x-auto scrollbar-none">
                            <button
                                onClick={() => setCreateStoryOpen(true)}
                                className="flex h-28 w-20 shrink-0 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-secondary/40 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary"
                            >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Plus className="h-4 w-4" strokeWidth={3} />
                    </span>
                                Добавить
                            </button>
                            {/*{myStories.length === 0 ? (*/}
                            {/*    <div className="flex flex-1 items-center px-2 text-sm text-muted-foreground">*/}
                            {/*        У вас пока нет историй. Создайте первую — она появится здесь.*/}
                            {/*    </div>*/}
                            {/*) : (*/}
                            {/*    myStories*/}
                            {/*        .slice()*/}
                            {/*        .sort((a, b) => b.createdAt - a.createdAt)*/}
                            {/*        .map((s) => (*/}
                            {/*            <button*/}
                            {/*                key={s.id}*/}
                            {/*                onClick={() => setStoryViewerOpen(true)}*/}
                            {/*                className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary"*/}
                            {/*                aria-label="Открыть историю"*/}
                            {/*            >*/}
                            {/*                {s.image ? (*/}
                            {/*                    <img src={s.image} alt="История" className="h-full w-full object-cover" />*/}
                            {/*                ) : (*/}
                            {/*                    <div className="flex h-full w-full items-center justify-center p-1.5 text-center text-[10px] font-semibold leading-tight text-white" style={{ background: s.background }}>*/}
                            {/*                        {s.text}*/}
                            {/*                    </div>*/}
                            {/*                )}*/}
                            {/*                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent px-1.5 py-1 text-[10px] font-semibold text-white">*/}
                            {/*                    {new Date(s.createdAt).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })}*/}
                            {/*                </div>*/}
                            {/*            </button>*/}
                            {/*        ))*/}
                            {/*)}*/}
                        </div>
                    </div>
                    <div className="panel-card overflow-hidden rounded-xl p-3">
                        {/*<div className="mb-3 flex gap-1 overflow-x-auto scrollbar-none">*/}
                        {/*    {tabs.map(({ key, label, icon: Icon }) => {*/}
                        {/*        const active = activeTab === key;*/}
                        {/*        return (*/}
                        {/*            <button*/}
                        {/*                key={key}*/}
                        {/*                onClick={() => setActiveTab(key)}*/}
                        {/*                className={cn(*/}
                        {/*                    "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",*/}
                        {/*                    active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60",*/}
                        {/*                )}*/}
                        {/*            >*/}
                        {/*                <Icon className="h-4 w-4" /> {label}*/}
                        {/*            </button>*/}
                        {/*        );*/}
                        {/*    })}*/}
                        {/*</div>*/}

                        {/*{activeTab === "photos" && (*/}
                        {/*    <>*/}
                        {/*        <div className="grid grid-cols-3 gap-1 overflow-hidden rounded-lg">*/}
                        {/*            {profilePhotos.map((src, index) => (*/}
                        {/*                <img key={src + index} src={src} alt={`Фото ${index + 1}`} className="aspect-square w-full object-cover" loading="lazy" />*/}
                        {/*            ))}*/}
                        {/*        </div>*/}
                        {/*        <div className="mt-3 grid grid-cols-2 gap-2">*/}
                        {/*            <button className="button-pill bg-secondary/70!">Загрузить фото</button>*/}
                        {/*            <button className="button-pill bg-secondary/70!">Показать всё</button>*/}
                        {/*        </div>*/}
                        {/*    </>*/}
                        {/*)}*/}

                        {/*{activeTab === "albums" && (*/}
                        {/*    <div className="grid grid-cols-3 gap-2">*/}
                        {/*        {userAlbums.map((a) => (*/}
                        {/*            <div key={a.title} className="overflow-hidden rounded-lg">*/}
                        {/*                <div className="aspect-square overflow-hidden rounded-lg bg-secondary">*/}
                        {/*                    <img src={a.cover} alt={a.title} className="h-full w-full object-cover" loading="lazy" />*/}
                        {/*                </div>*/}
                        {/*                <div className="mt-2 px-1">*/}
                        {/*                    <div className="truncate text-sm font-semibold">{a.title}</div>*/}
                        {/*                    <div className="text-xs text-muted-foreground">{a.count} фото</div>*/}
                        {/*                </div>*/}
                        {/*            </div>*/}
                        {/*        ))}*/}
                        {/*    </div>*/}
                        {/*)}*/}

                        {/*{activeTab === "videos" && (*/}
                        {/*    <div className="grid grid-cols-3 gap-2">*/}
                        {/*        {userVideos.map((v) => (*/}
                        {/*            <div key={v.title} className="group cursor-pointer">*/}
                        {/*                <div className="relative aspect-video overflow-hidden rounded-lg bg-secondary">*/}
                        {/*                    <img src={v.thumb} alt={v.title} className="h-full w-full object-cover" loading="lazy" />*/}
                        {/*                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">*/}
                        {/*                        <Play className="h-8 w-8 fill-white text-white" />*/}
                        {/*                    </div>*/}
                        {/*                    <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">*/}
                        {/*    {v.duration}*/}
                        {/*  </span>*/}
                        {/*                </div>*/}
                        {/*                <div className="mt-2 truncate px-1 text-sm font-semibold">{v.title}</div>*/}
                        {/*            </div>*/}
                        {/*        ))}*/}
                        {/*    </div>*/}
                        {/*)}*/}

                        {/*{activeTab === "clips" && (*/}
                        {/*    <div className="grid grid-cols-4 gap-2">*/}
                        {/*        {userClips.map((src, i) => (*/}
                        {/*            <div key={i} className="relative aspect-9/16 overflow-hidden rounded-lg bg-secondary">*/}
                        {/*                <img src={src} alt={`Клип ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />*/}
                        {/*                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-2">*/}
                        {/*                    <Play className="h-4 w-4 fill-white text-white" />*/}
                        {/*                </div>*/}
                        {/*            </div>*/}
                        {/*        ))}*/}
                        {/*    </div>*/}
                        {/*)}*/}

                        {/*{activeTab === "music" && (*/}
                        {/*    <div className="flex flex-col">*/}
                        {/*        {userTracks.map((t, i) => (*/}
                        {/*            <div key={i} className="flex items-center gap-3 rounded-lg p-2 hover:bg-secondary/60">*/}
                        {/*                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded">*/}
                        {/*                    <img src={toAbsoluteUrl("/post-music-cover.jpg")} alt={t.title} className="h-full w-full object-cover" />*/}
                        {/*                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">*/}
                        {/*                        <Play className="h-4 w-4 fill-white text-white" />*/}
                        {/*                    </div>*/}
                        {/*                </div>*/}
                        {/*                <div className="min-w-0 flex-1">*/}
                        {/*                    <div className="truncate text-sm font-semibold">{t.title}</div>*/}
                        {/*                    <div className="truncate text-xs text-muted-foreground">{t.artist}</div>*/}
                        {/*                </div>*/}
                        {/*                <div className="text-xs text-muted-foreground">{t.duration}</div>*/}
                        {/*            </div>*/}
                        {/*        ))}*/}
                        {/*    </div>*/}
                        {/*)}*/}

                        {/*{activeTab === "articles" && (*/}
                        {/*    <div className="flex flex-col gap-2">*/}
                        {/*        {userArticles.map((a, i) => (*/}
                        {/*            <div key={i} className="rounded-lg border border-border p-3 hover:bg-secondary/40">*/}
                        {/*                <div className="font-semibold">{a.title}</div>*/}
                        {/*                <div className="mt-1 text-xs text-muted-foreground">{a.date} · {a.time}</div>*/}
                        {/*            </div>*/}
                        {/*        ))}*/}
                        {/*    </div>*/}
                        {/*)}*/}
                    </div>

                    <CreatePost />

                    <div className="panel-card flex items-center justify-between gap-2 px-4 py-2.5">
                        <div className="text-sm font-semibold text-muted-foreground">Сортировка ленты</div>
                        <div className="inline-flex items-center gap-1 rounded-full bg-secondary/60 p-1">
                            <button
                                onClick={() => setFeedSort("date")}
                                className={cn(
                                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                                    feedSort === "date" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                                )}
                            >
                                По дате
                            </button>
                            <button
                                onClick={() => setFeedSort("popular")}
                                className={cn(
                                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                                    feedSort === "popular" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                                )}
                            >
                                По популярности
                            </button>
                        </div>
                    </div>

                    {sortedPosts.map((p) => (
                        <PostCard key={p.id} post={p} />
                    ))}
                </div>

                <aside className="hidden xl:flex flex-col w-70 shrink-0 gap-3 sticky top-18 self-start max-h-[calc(100vh-72px)]">
                    <div className="panel-card flex items-center gap-4 p-5">
                        <Music className="h-7 w-7 shrink-0 text-primary" />
                        <div className="min-w-0 flex-1">
                            <div className="font-semibold">Добавьте музыку</div>
                            <div className="text-sm leading-snug text-muted-foreground">Слушайте треки и альбомы любимых артистов</div>
                        </div>
                        <button className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </aside>
            </div>
            {renderAvatarDialog()}
            <CoverEditorModal
                open={coverEditorOpen}
                image={user?.cover_url ?? cover ?? undefined}
                avatar={avatar ?? undefined}
                userName={activeAccount.name}
                onClose={() => setCoverEditorOpen(false)}
                onSave={async (result: CoverCropResult) => {
                    console.log(result.originalFile);
                    console.log(result.originalFile instanceof File);
                    console.log(result.originalFile.type);

                    // const file = e.target.files?.[0];
                    // if (!file) return;
                    // await authActions.uploadCover(file);
                    // e.target.value = '';

                    // await authActions.uploadCover(result.originalFile);

                    // если backend умеет принимать координаты кропа — передай их тоже:
                    // await authActions.uploadCover(result.originalFile, { mobile: result.mobile, desktop: result.desktop });
                    // setCover(data);

                    console.log(result.mobile, result.desktop)
                    setCover(URL.createObjectURL(result.originalFile));
                }}
            />
            <CreateStoryModal open={createStoryOpen} onOpenChange={setCreateStoryOpen} />
            <StoriesViewer open={storyViewerOpen} onOpenChange={setStoryViewerOpen} startUserId="me" />
        </>
    );
};

export default Profile;