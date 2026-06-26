import {
    ChevronDown, LogOut, Settings, Trash2, CheckCircle2, Users, Bell, MoreHorizontal, CheckCheck,
    Check, Search, Music, Video, UsersRound, Newspaper, UserIcon
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCallback, useState, useRef } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { useAccount, getInitials } from "@/hooks/use-account";
import { cn } from "@/lib/utils";
import { toAbsoluteUrl } from '@/lib/helpers';
import type { Language } from "@/i18n/types.ts";
import { useTranslation } from '@/hooks/use-translation';
import { authActions } from '@/auth/auth-actions';
import { useNotifications } from "@/hooks/use-notification";
import { notificationMeta, formatRelativeTime } from "@/lib/notification-meta";
import { PlayerPopover } from "@/components/player/PlayerPopover";

export type SearchEntry = {
    id: string;
    type: "people" | "group" | "post" | "music" | "video";
    title: string;
    subtitle?: string;
    href: string;
};

export const SEARCH_INDEX: SearchEntry[] = [
    { id: "p1", type: "people", title: "Анна Соколова", subtitle: "Москва", href: "/friends" },
    { id: "p2", type: "people", title: "Иван Петров", subtitle: "Санкт-Петербург", href: "/friends" },
    { id: "p3", type: "people", title: "Мария Кузнецова", subtitle: "Казань", href: "/friends" },
    { id: "p4", type: "people", title: "Дмитрий Орлов", subtitle: "Новосибирск", href: "/friends" },
    { id: "g1", type: "group", title: "Лепра", subtitle: "1.2M подписчиков", href: "/groups" },
    { id: "g2", type: "group", title: "MDK", subtitle: "8.5M подписчиков", href: "/groups" },
    { id: "g3", type: "group", title: "Лентач", subtitle: "2.1M подписчиков", href: "/groups" },
    { id: "po1", type: "post", title: "Лучшие места Москвы летом", href: "/feed" },
    { id: "po2", type: "post", title: "Подборка фильмов на выходные", href: "/feed" },
    { id: "m1", type: "music", title: "Земфира — Хочешь", href: "/music" },
    { id: "m2", type: "music", title: "Король и Шут — Лесник", href: "/music" },
    { id: "v1", type: "video", title: "Обзор нового VK", href: "/video" },
    { id: "v2", type: "video", title: "Топ-10 клипов 2026", href: "/clips" },
];

const TYPE_ICONS: Record<SearchEntry["type"], any> = {
    people: UserIcon, group: UsersRound, post: Newspaper, music: Music, video: Video,
};

const LANGUAGE_OPTIONS: { code: Language; flag: string; label: string }[] = [
    { code: 'en', flag: toAbsoluteUrl('/flags/united-states.svg'), label: 'English' },
    { code: 'ua', flag: toAbsoluteUrl('/flags/ukraine.svg'),       label: 'Українська' },
    { code: 'ru', flag: toAbsoluteUrl('/flags/russia.svg'),        label: 'Русский' },
    { code: 'it', flag: toAbsoluteUrl('/flags/italy.svg'),         label: 'Italiano' },
    { code: 'es', flag: toAbsoluteUrl('/flags/spain.svg'),         label: 'Español' },
    { code: 'fr', flag: toAbsoluteUrl('/flags/france.svg'),        label: 'Français' },
    { code: 'de', flag: toAbsoluteUrl('/flags/germany.svg'),       label: 'Deutsch' },
];

export const TopBar = () => {
    const { accounts, activeId, activeAccount, switchAccount, removeAccount } = useAccount();
    const { t, language, setLanguage } = useTranslation();
    const { notifications, totalUnread, isRead, markRead, markUnread, markAllRead } = useNotifications();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const currentLang = LANGUAGE_OPTIONS.find(l => l.code === language);
    const avatar = activeAccount.user?.avatar_url ?? null;

    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    const [openSearch, setOpenSearch] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<SearchEntry[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);

    const submitSearch = (q: string) => {
        const value = q.trim();
        if (!value) return;
        setOpenSearch(false);
        navigate(`/me/search?q=${encodeURIComponent(value)}`);
    };

    const handleLanguageChange = useCallback((langCode: string) => {
        setLanguage(langCode as Language);
    }, [setLanguage]);

    const handleLogout = useCallback(async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        await authActions.logout();
    }, [isLoggingOut]);

    const popupItems = notifications.slice(0, 5);

    const isItemRead = (id: number) =>
        notifications.find((n) => n.id === id)?.is_read || isRead(String(id));

    return (
        <header className="sticky top-0 z-40 h-15 bg-background/85 backdrop-blur-xl border-b border-border">
            <div className="max-w-7xl mx-auto h-full px-4 flex items-center gap-4">
                <Link to="/" className="flex items-center gap-2 shrink-0 w-50">
                    <img src={toAbsoluteUrl('/unowned-d.png')} className="max-h-40" alt="unowned" />
                </Link>

                <div ref={searchRef} className="flex-1 max-w-105 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Поиск"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setOpenSearch(true); }}
                        onFocus={() => setOpenSearch(true)}
                        onKeyDown={(e) => { if (e.key === "Enter") submitSearch(query); }}
                        className="w-full h-10 pl-9 pr-3 rounded-full bg-secondary text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    {openSearch && query.trim().length >= 2 && (
                        <div className="absolute left-0 right-0 top-12 z-50 rounded-xl border border-border bg-popover shadow-elevated overflow-hidden">
                            {searchLoading && (
                                <div className="py-3 px-3 space-y-2">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
                                            <div className="min-w-0 flex-1 space-y-1.5">
                                                <div className="h-3.5 w-1/2 rounded bg-muted animate-pulse" />
                                                <div className="h-3 w-1/3 rounded bg-muted animate-pulse" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!searchLoading && searchError && (
                                <div className="px-4 py-6 text-center">
                                    <p className="text-sm text-destructive mb-2">{searchError}</p>
                                    <button
                                        onClick={() => {
                                            setSearchError(null);
                                            setSearchLoading(true);
                                            setTimeout(() => {
                                                const q = query.trim().toLowerCase();
                                                setSuggestions(
                                                    SEARCH_INDEX
                                                        .filter((e) => e.title.toLowerCase().includes(q) || e.subtitle?.toLowerCase().includes(q))
                                                        .slice(0, 8)
                                                );
                                                setSearchLoading(false);
                                            }, 500);
                                        }}
                                        className="text-sm font-medium text-primary hover:underline"
                                    >
                                        Повторить
                                    </button>
                                </div>
                            )}

                            {!searchLoading && !searchError && suggestions.length === 0 && (
                                <div className="px-4 py-6 text-center text-sm text-muted-foreground">Ничего не найдено</div>
                            )}

                            {!searchLoading && !searchError && suggestions.length > 0 && (
                                <div className="py-1 max-h-90 overflow-y-auto">
                                    {suggestions.map((s) => {
                                        const Icon = TYPE_ICONS[s.type];
                                        return (
                                            <button
                                                key={s.id}
                                                onClick={() => submitSearch(s.title)}
                                                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-secondary/60"
                                            >
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary shrink-0">
                                                    <Icon className="h-4 w-4 text-foreground/70" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="truncate text-sm">{s.title}</div>
                                                    {s.subtitle && <div className="truncate text-xs text-muted-foreground">{s.subtitle}</div>}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            <button
                                onClick={() => submitSearch(query)}
                                className="block w-full border-t border-border py-2.5 text-center text-sm font-medium text-primary hover:bg-secondary/50"
                            >
                                Показать все результаты
                            </button>
                        </div>
                    )}
                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        <button className="relative w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center transition-colors">
                            <Bell className="w-5 h-5 text-foreground/80" />
                            {totalUnread > 0 && (
                                <span className="absolute top-1 right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                                    {totalUnread > 99 ? '99+' : totalUnread}
                                </span>
                            )}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent
                        align="end"
                        sideOffset={10}
                        className="w-105 rounded-xl border-border bg-popover p-0 shadow-elevated"
                    >
                        <div className="flex items-center justify-between px-4 py-3">
                            <div className="text-sm font-semibold">Уведомления</div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={markAllRead}
                                    disabled={totalUnread === 0}
                                    className="rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-secondary disabled:opacity-50"
                                >
                                    Прочитать все
                                </button>
                                <Link
                                    to="/me/settings"
                                    className="rounded-md bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-accent"
                                >
                                    Настройки
                                </Link>
                            </div>
                        </div>

                        <div className="px-2 pb-2">
                            {popupItems.length === 0 && (
                                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                                    Нет новых уведомлений
                                </p>
                            )}
                            {popupItems.map((n) => {
                                const meta = notificationMeta(n);
                                const read = isItemRead(n.id);
                                const strId = String(n.id);
                                return (
                                    <div
                                        key={n.id}
                                        className={cn(
                                            "group relative flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-secondary/40",
                                            !read && "bg-primary/5",
                                        )}
                                    >
                                        {!read && (
                                            <span className="absolute left-0.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary" />
                                        )}
                                        <div
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full overflow-hidden"
                                            style={{ background: meta.iconBg }}
                                        >
                                            {meta.icon}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm leading-snug">{meta.title}</p>
                                                <div className="flex shrink-0 items-center gap-1">
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatRelativeTime(n.created_at)}
                                                    </span>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button
                                                                className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-secondary group-hover:opacity-100 data-[state=open]:opacity-100"
                                                                aria-label="Действия"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-56">
                                                            {read ? (
                                                                <DropdownMenuItem onClick={() => markUnread(strId)} className="gap-2">
                                                                    <Check className="h-4 w-4" />
                                                                    Отметить как непрочитанное
                                                                </DropdownMenuItem>
                                                            ) : (
                                                                <DropdownMenuItem onClick={() => markRead(strId)} className="gap-2">
                                                                    <CheckCheck className="h-4 w-4" />
                                                                    Отметить как прочитанное
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <Link
                            to="/me/notifications"
                            className="block border-t border-border py-3.5 text-center text-sm font-medium hover:bg-secondary/50"
                        >
                            Показать все
                        </Link>
                    </PopoverContent>
                </Popover>

                <PlayerPopover />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="ml-auto flex items-center gap-1.5 hover:bg-secondary/60 rounded-full pl-1 pr-2 py-1 transition-colors">
                            <div className="relative">
                                <div
                                    className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-semibold"
                                    style={{ background: avatar ? "hsl(var(--background))" : activeAccount.avatarColor }}
                                >
                                    {avatar
                                        ? <img src={avatar} alt={activeAccount.name} className="h-full w-full object-cover" />
                                        : getInitials(activeAccount.name)
                                    }
                                </div>
                                {activeAccount.hasNotifications && (
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-destructive border-2 border-background" />
                                )}
                            </div>
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={10} className="w-75 rounded-xl border-border bg-popover p-0 shadow-elevated">
                        <div className="flex flex-col items-center px-4 py-5 text-center">
                            <div className="relative mb-3">
                                <div
                                    className="w-16 h-16 overflow-hidden rounded-full flex items-center justify-center text-white text-xl font-semibold ring-2 ring-primary"
                                    style={{ background: avatar ? "hsl(var(--background))" : activeAccount.avatarColor }}
                                >
                                    {avatar
                                        ? <img src={avatar} alt={activeAccount.name} className="h-full w-full object-cover" />
                                        : <div className="flex h-full w-full items-center justify-center text-white text-3xl font-semibold">{getInitials(activeAccount.name)}</div>
                                    }
                                </div>
                                {activeAccount.hasNotifications && (
                                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-destructive border-2 border-popover" />
                                )}
                            </div>
                            <div className="font-semibold">{activeAccount.name}</div>
                            <div className="text-xs text-muted-foreground">{activeAccount.username}</div>
                        </div>

                        {accounts.length > 1 && (
                            <div className="mx-2 mb-2 rounded-lg bg-secondary/40 p-1">
                                <div className="px-2 pt-1.5 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                    {t('topbar.menu.your.accounts')}
                                </div>
                                {accounts.map((acc) => {
                                    const isActive = acc.id === activeId;
                                    return (
                                        <div
                                            key={acc.id}
                                            className={cn(
                                                "group flex items-center gap-2.5 rounded-md px-2 py-2 cursor-pointer hover:bg-background",
                                                isActive && "bg-background",
                                            )}
                                            onClick={() => !isActive && switchAccount(acc.id)}
                                        >
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                                                style={{ background: acc.avatarColor }}
                                            >
                                                {getInitials(acc.name)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-medium truncate">{acc.name}</div>
                                                <div className="text-xs text-muted-foreground truncate">{acc.username}</div>
                                            </div>
                                            {isActive ? (
                                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeAccount(acc.id);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-muted-foreground hover:text-destructive hover:bg-secondary"
                                                    aria-label={t('topbar.menu.account.delete')}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="px-2 pb-2">
                            <DropdownMenuItem asChild className="gap-3 py-2.5">
                                <Link to="/me/account">
                                    <Users className="w-4 h-4 text-primary" />{t('topbar.menu.mine.accounts')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="gap-3 py-2.5">
                                <Link to="/me/settings">
                                    <Settings className="w-4 h-4 text-primary" />{t('topbar.menu.settings')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="gap-3 py-2.5 flex items-center data-[slot=dropdown-menu-sub-trigger-indicator]:hidden">
                                    <img
                                        src={currentLang?.flag}
                                        className="w-4 h-4 rounded-full object-cover shrink-0"
                                        alt={currentLang?.label}
                                    />
                                    <span className="text-sm font-medium">{currentLang?.label}</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="w-48">
                                    <DropdownMenuRadioGroup
                                        value={currentLang?.code}
                                        onValueChange={(value) => {
                                            const selectedLang = LANGUAGE_OPTIONS.find(l => l.code === value);
                                            if (selectedLang) handleLanguageChange(selectedLang.code);
                                        }}
                                    >
                                        {LANGUAGE_OPTIONS.map((item) => (
                                            <DropdownMenuRadioItem
                                                key={item.code}
                                                value={item.code}
                                                className="flex items-center gap-2"
                                            >
                                                <img
                                                    src={item.flag}
                                                    className="w-4 h-4 rounded-full object-cover"
                                                    alt={item.label}
                                                />
                                                <span>{item.label}</span>
                                            </DropdownMenuRadioItem>
                                        ))}
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuItem
                                className="gap-3 py-2.5"
                                disabled={isLoggingOut}
                                onClick={handleLogout}
                            >
                                <LogOut className="w-4 h-4 text-primary" />
                                {isLoggingOut ? '...' : t('topbar.menu.logout')}
                            </DropdownMenuItem>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};