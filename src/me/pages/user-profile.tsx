import { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
    AtSign,
    Ban,
    Bookmark,
    Cake,
    ChevronDown,
    Flag,
    Gift,
    Home,
    Image as ImageIcon,
    Info,
    Lock,
    MapPin,
    Phone,
    Send,
    Video as VideoIcon,
    X,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PostCard } from "@/components/feed/PostCard";
import type { Post } from "@/components/feed/types";
import { Users as UsersIcon } from "lucide-react";
import { toAbsoluteUrl } from "@/lib/helpers";

type ProfileData = {
    id: string;
    name: string;
    status: string;
    city: string;
    nickname: string;
    birthday: string;
    avatar: string;
    closed: boolean;
    friendsCount: number;
};

const PROFILES: Record<string, ProfileData> = {
    "mark-roberts": {
        id: "mark-roberts",
        name: "Mark Roberts",
        status: "То что нас не убивает, делает нас страннее…",
        city: "Харьков",
        nickname: "markroberts22",
        birthday: "22 ноября 1985 г.",
        avatar: "/avatar-1.jpg",
        closed: true,
        friendsCount: 4,
    },
    "anna-sokolova": {
        id: "anna-sokolova",
        name: "Анна Соколова",
        status: "Дизайн — это разговор без слов",
        city: "Санкт-Петербург",
        nickname: "anna.s",
        birthday: "3 марта 1994 г.",
        avatar: "/avatar-2.jpg",
        closed: false,
        friendsCount: 312,
    },
    "igor-lebedev": {
        id: "igor-lebedev",
        name: "Игорь Лебедев",
        status: "Senior Product Designer",
        city: "Москва",
        nickname: "igor.lbd",
        birthday: "15 июля 1990 г.",
        avatar: "/avatar-3.jpg",
        closed: false,
        friendsCount: 587,
    },
    "elena-volkova": {
        id: "elena-volkova",
        name: "Елена Волкова",
        status: "путешествия · кофе · книги",
        city: "Казань",
        nickname: "lenavolk",
        birthday: "9 мая 1992 г.",
        avatar: "/avatar-4.jpg",
        closed: true,
        friendsCount: 128,
    },
    "dmitry-orlov": {
        id: "dmitry-orlov",
        name: "Дмитрий Орлов",
        status: "Frontend / React, TypeScript",
        city: "Новосибирск",
        nickname: "orlov.dev",
        birthday: "1 февраля 1988 г.",
        avatar: "/avatar-5.jpg",
        closed: false,
        friendsCount: 244,
    },
};

const FALLBACK_AVATARS = ["/avatar-1.jpg", "/avatar-2.jpg", "/avatar-3.jpg", "/avatar-4.jpg", "/avatar-5.jpg", "/avatar-6.jpg", "/avatar-7.jpg"];

const buildFallback = (id: string): ProfileData => {
    const idx = Math.abs(hash(id)) % FALLBACK_AVATARS.length;
    const pretty = id
        .split("-")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");
    return {
        id,
        name: pretty || "Пользователь",
        status: "Пользователь ВКонтакте",
        city: "Москва",
        nickname: id,
        birthday: "1 января 1990 г.",
        avatar: FALLBACK_AVATARS[idx],
        closed: idx % 2 === 0,
        friendsCount: 10 + (Math.abs(hash(id)) % 200),
    };
};

const hash = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
    return h;
};

const PROFILE_PHOTOS = ["/post-photo-1.jpg", "/post-photo-2.jpg", "/post-photo-3.jpg"];

const buildUserPosts = (p: ProfileData): Post[] => {
    const author = { id: p.id, kind: "user" as const, name: p.name, avatar: p.avatar };
    const idx = Math.abs(hash(p.id));
    const photo = PROFILE_PHOTOS[idx % PROFILE_PHOTOS.length];
    return [
        {
            id: `${p.id}-post-1`,
            author: { ...author, subtitle: "только что" },
            time: "только что",
            text: `Привет! Я ${p.name.split(" ")[0]}. Делюсь тем, что вдохновляет в этом сезоне.`,
            media: [{ type: "photo", images: [photo] }],
            stats: { likes: 124 + (idx % 80), comments: 8 + (idx % 12), shares: 3 + (idx % 5) },
        },
        {
            id: `${p.id}-post-2`,
            author: { ...author, subtitle: "вчера" },
            time: "вчера",
            text: p.status,
            stats: { likes: 56 + (idx % 40), comments: 4, shares: 1 },
        },
    ];
};

const UserProfile = () => {
    const { id = "mark-roberts" } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const profile = useMemo<ProfileData>(
        () => PROFILES[id] ?? buildFallback(id),
        [id],
    );

    const userPosts = useMemo<Post[]>(() => buildUserPosts(profile), [profile]);

    const [requestSent, setRequestSent] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [blocked, setBlocked] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);

    const onAddFriend = () => {
        setRequestSent((v) => !v);
        toast({
            title: requestSent ? "Заявка отменена" : "Заявка отправлена",
            description: requestSent
                ? `Вы отменили заявку в друзья к ${profile.name}.`
                : `Заявка в друзья отправлена ${profile.name}.`,
        });
    };

    const onBookmark = () => {
        setBookmarked((v) => !v);
        toast({
            title: bookmarked ? "Удалено из закладок" : "Сохранено в закладках",
            description: profile.name,
        });
    };

    const onBlock = () => {
        setBlocked((v) => !v);
        toast({
            title: blocked ? "Пользователь разблокирован" : "Пользователь заблокирован",
            description: profile.name,
        });
    };

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
                <section className="panel-card overflow-hidden rounded-xl">
                    <div className="h-57 bg-[radial-gradient(circle_at_70%_20%,hsl(var(--foreground)/0.05),transparent_24%),linear-gradient(135deg,hsl(var(--secondary)),hsl(var(--background)))]" />

                    <div className="relative flex min-h-30 items-start gap-4 bg-card px-5 pb-5 pt-4">
                        <div className="absolute -top-20 left-5">
                            <div className="h-40 w-40 overflow-hidden rounded-full border-4 border-background bg-muted ring-4 ring-background">
                                <img
                                    src={toAbsoluteUrl(profile.avatar)}
                                    alt={profile.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>

                        <div className="ml-43 min-w-0 flex-1">
                            <h1 className="text-2xl font-bold">{profile.name}</h1>
                            <p className="text-sm text-muted-foreground mt-1 leading-snug">
                                {profile.status}
                            </p>
                            <div className="mt-3 flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="w-4 h-4" /> {profile.city}
              </span>
                                <button
                                    onClick={() => setInfoOpen(true)}
                                    className="flex items-center gap-1.5 text-primary hover:underline"
                                >
                                    <Info className="w-4 h-4" /> Подробнее
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={onAddFriend}
                                className={`button-pill rounded-lg px-5 ${
                                    requestSent ? "bg-secondary!" : ""
                                }`}
                            >
                                {requestSent ? "Заявка отправлена" : "Отправить заявку"}
                            </button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary hover:bg-accent"
                                        aria-label="Позвонить"
                                    >
                                        <Phone className="h-5 w-5" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56 rounded-xl border-border bg-popover p-2 shadow-elevated"
                                >
                                    <DropdownMenuItem className="gap-3 py-3">
                                        <Phone className="h-4 w-4 text-primary" /> Аудиозвонок
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-3 py-3">
                                        <VideoIcon className="h-4 w-4 text-primary" /> Видеозвонок
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-3 py-3">
                                        <Send className="h-4 w-4 text-primary" /> Через приложение
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="button-pill gap-2 rounded-lg px-4">
                                        Ещё <ChevronDown className="h-4 w-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-60 rounded-xl border-border bg-popover p-2 shadow-elevated"
                                >
                                    <DropdownMenuItem className="gap-3 py-3">
                                        <Gift className="h-4 w-4 text-primary" /> Отправить подарок
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={onBookmark} className="gap-3 py-3">
                                        <Bookmark
                                            className={`h-4 w-4 ${
                                                bookmarked ? "text-primary fill-primary" : "text-primary"
                                            }`}
                                        />
                                        {bookmarked ? "В закладках" : "Сохранить в закладках"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={onBlock} className="gap-3 py-3">
                                        <Ban className="h-4 w-4 text-destructive" />
                                        {blocked
                                            ? `Разблокировать ${profile.name.split(" ")[0]}`
                                            : `Заблокировать ${profile.name.split(" ")[0]}`}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-3 py-3 text-destructive">
                                        <Flag className="h-4 w-4" /> Пожаловаться
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </section>
                <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3">
                    {profile.closed ? (
                        <div className="panel-card p-6 flex flex-col items-center text-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                                <Lock className="w-7 h-7 text-muted-foreground" />
                            </div>
                            <div className="font-semibold text-base">Это закрытый профиль</div>
                            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                                Записи, фотографии и другие материалы {profile.name.split(" ")[0]} скрыты.
                                Чтобы получить доступ, отправьте заявку в друзья или запросите доступ.
                            </p>
                            <button
                                onClick={onAddFriend}
                                className={`button-pill rounded-lg px-5 mt-1 ${
                                    requestSent ? "bg-secondary!" : ""
                                }`}
                            >
                                {requestSent ? "Запрос отправлен" : "Запросить доступ"}
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <div className="px-1 text-sm font-semibold text-muted-foreground">Записи</div>
                            {userPosts.map((p) => (
                                <PostCard key={p.id} post={p} />
                            ))}
                        </div>
                    )}

                    <aside className="flex flex-col gap-3 self-start">
                        <FriendsCard
                            count={profile.friendsCount}
                            avatars={FALLBACK_AVATARS}
                        />

                        <PhotosCard photos={PROFILE_PHOTOS} />
                    </aside>
                </section>
                <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
                    <DialogContent className="max-w-130 rounded-xl border-border bg-popover p-0 shadow-elevated [&>button]:hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                            <DialogTitle className="text-base font-semibold">
                                Подробная информация
                            </DialogTitle>
                            <button
                                onClick={() => setInfoOpen(false)}
                                className="w-8 h-8 rounded-full bg-secondary hover:bg-accent flex items-center justify-center"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="px-5 py-4 flex flex-col gap-4 text-sm">
                            <Row icon={<ImageIcon className="w-4 h-4" />} text={profile.status} />
                            <Row icon={<AtSign className="w-4 h-4" />}>
                                <a className="text-primary hover:underline" href="#!">
                                    {profile.nickname}
                                </a>
                            </Row>
                            <Row icon={<Gift className="w-4 h-4" />}>
                                День рождения:{" "}
                                <a className="text-primary hover:underline ml-1" href="#!">
                                    {profile.birthday}
                                </a>
                            </Row>
                            <Row icon={<Home className="w-4 h-4" />}>
                                Город:{" "}
                                <a className="text-primary hover:underline ml-1" href="#!">
                                    {profile.city}
                                </a>
                            </Row>
                        </div>
                    </DialogContent>
                </Dialog>
                <button
                    onClick={() => navigate(-1)}
                    className="hidden"
                    aria-hidden
                />
            </div>
            <aside className="hidden xl:flex flex-col w-70 shrink-0 py-0 gap-3 sticky top-18 self-start max-h-[calc(100vh-72px)]">
                <div className="panel-card p-5">
                    <div className="font-semibold mb-3">О пользователе</div>
                    <ul className="text-sm flex flex-col gap-2.5 text-muted-foreground">
                        <li className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> {profile.city}
                        </li>
                        <li className="flex items-center gap-2">
                            <Cake className="w-4 h-4" /> {profile.birthday}
                        </li>
                        <li className="flex items-center gap-2">
                            <AtSign className="w-4 h-4" /> {profile.nickname}
                        </li>
                    </ul>
                </div>
            </aside>
        </div>
    );
};

const Row = ({
                 icon,
                 text,
                 children,
             }: {
    icon: React.ReactNode;
    text?: string;
    children?: React.ReactNode;
}) => (
    <div className="flex items-start gap-3">
        <span className="text-muted-foreground mt-0.5">{icon}</span>
        <div className="text-foreground/90">{children ?? text}</div>
    </div>
);

const FriendsCard = ({
                         count,
                         avatars,
                         error,
                         onRetry,
                     }: {
    count: number;
    avatars: string[];
    error?: boolean;
    onRetry?: () => void;
}) => {
    return (
        <div className="panel-card p-4">
            <Link to="/friends" className="flex items-center justify-between mb-3 group">
                <div className="font-semibold text-sm group-hover:text-primary transition-colors">
                    Друзья
                </div>
                {!error && count > 0 && (
                    <div className="text-xs text-muted-foreground">{count}</div>
                )}
            </Link>
            {error ? (
                    <div>Не удалось загрузить друзей</div>
            ) : count === 0 || avatars.length === 0 ? (
                    <div>Пока нет друзей</div>
            ) : (
                <div className="grid grid-cols-3 gap-2">
                    {avatars.slice(0, 6).map((a, i) => (
                        <Link
                            key={i}
                            to="/friends"
                            className="flex flex-col items-center gap-1.5 group"
                        >
                            <img
                                src={a}
                                alt=""
                                className="w-full aspect-square rounded-lg object-cover"
                            />
                            <span className="text-[11px] text-muted-foreground group-hover:text-primary transition-colors truncate max-w-full">
                Друг {i + 1}
              </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

const PhotosCard = ({
                        photos,
                        error,
                        onRetry,
                    }: {
    photos: string[];
    error?: boolean;
    onRetry?: () => void;
}) => {
    if (error) {
        return (
            <div className="panel-card p-4">
                <div className="font-semibold text-sm mb-2">Фотографии</div>
                <div>Не удалось загрузить фото</div>
            </div>
        );
    }

    if (photos.length === 0) {
        return (
            <div className="panel-card p-4">
                <div className="font-semibold text-sm mb-2">Фотографии</div>
                <div>Пока нет фото</div>
            </div>
        );
    }

    return (
        <Link
            to="/photos"
            className="panel-card p-4 flex items-center justify-between hover:bg-secondary/40 transition-colors"
        >
            <div className="font-semibold text-sm">Фотографии</div>
            <div className="text-xs text-muted-foreground">{photos.length}</div>
        </Link>
    );
};

export default UserProfile;
