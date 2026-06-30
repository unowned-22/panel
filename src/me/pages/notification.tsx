import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MoreHorizontal, Check, CheckCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/use-notification";
import { useAccount, getInitials } from "@/hooks/use-account";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationDictionary } from "@/i18n/types";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { type SectionKey, typeToSection } from "@/api/notifications";
import { notificationMeta, formatRelativeTime, renderNotificationTitle } from "@/lib/notification-meta";

const SECTION_KEYS: SectionKey[] = [
    "profile", "groups", "feedback", "friends", "services", "communication", "account",
];

const SECTION_LABEL_KEYS: Record<SectionKey, string> = {
    profile: "notif.section.profile",
    groups: "notif.section.groups",
    feedback: "notif.section.feedback",
    friends: "notif.section.friends",
    services: "notif.section.services",
    communication: "notif.section.communication",
    account: "notif.section.account",
};

const EMPTY_GROUPED: Record<SectionKey, never[]> = {
    profile: [], groups: [], feedback: [],
    friends: [], services: [], communication: [], account: [],
};

const NotificationSkeleton = () => (
    <li className="flex items-start gap-3 rounded-lg px-3 py-3">
        <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-3.5 w-3/4 rounded" />
            <Skeleton className="h-3 w-1/3 rounded" />
        </div>
    </li>
);

const Notifications = () => {
    const { t } = useTranslation();
    const [section, setSection] = useState<SectionKey>("profile");

    const { activeAccount } = useAccount();
    const {
        notifications,
        isLoading,
        hasMore,
        loadMore,
        markAllRead,
        isRead,
        markRead,
        markUnread,
    } = useNotifications();

    // Group notifications by section
    const grouped = useMemo(() => {
        return notifications.reduce(
            (acc, n) => {
                const key = typeToSection(n.type);
                acc[key] = [...(acc[key] ?? []), n];
                return acc;
            },
            { ...EMPTY_GROUPED } as Record<SectionKey, typeof notifications>,
        );
    }, [notifications]);

    const items = grouped[section] ?? [];

    // Count unread for current section (server flag OR local optimistic)
    const isItemRead = (id: number) =>
        notifications.find((n) => n.id === id)?.is_read || isRead(String(id));

    const currentUnreadCount = items.filter((n) => !isItemRead(n.id)).length;

    const showSkeleton = isLoading && notifications.length === 0;

    return (
        <div className="flex gap-4">
            {/* ── Main panel ──────────────────────────────────────────── */}
            <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
                <section className="panel-card overflow-hidden rounded-xl">
                    <header className="flex items-center justify-between px-5 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <div
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-xs font-semibold"
                                style={{ background: activeAccount.avatarColor }}
                            >
                                {getInitials(activeAccount.name)}
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-lg font-semibold leading-tight truncate">{t('notif.page.title')}</h1>
                                <div className="text-xs text-muted-foreground truncate">
                                    {activeAccount.name} · {activeAccount.username}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={markAllRead}
                                disabled={currentUnreadCount === 0}
                                className="text-sm font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline"
                            >
                                {t('notif.mark.all.read')}
                            </button>
                            <Link
                                to="/settings"
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                {t('notif.settings')}
                            </Link>
                        </div>
                    </header>

                    <div className="px-5 pb-2 text-[11px] font-bold tracking-wider text-muted-foreground">
                        {t(SECTION_LABEL_KEYS[section] as keyof TranslationDictionary).toUpperCase()}
                    </div>

                    <ul className="px-2 pb-3">
                        {/* Loading skeleton */}
                        {showSkeleton && (
                            <>
                                <NotificationSkeleton />
                                <NotificationSkeleton />
                                <NotificationSkeleton />
                            </>
                        )}

                        {/* Empty state */}
                        {!showSkeleton && items.length === 0 && (
                            <li className="px-3 py-8 text-center text-sm text-muted-foreground">
                                {t('notif.empty.category')}
                            </li>
                        )}

                        {/* Notification items */}
                        {items.map((n) => {
                            const meta = notificationMeta(n, t);
                            const read = isItemRead(n.id);
                            const strId = String(n.id);
                            const actor = meta.actor;
                            const profileHref = actor?.username ? `/profile/${actor.username}` : null;

                            return (
                                <li
                                    key={n.id}
                                    className={cn(
                                        "group relative flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-secondary/40",
                                        !read && "bg-primary/5",
                                    )}
                                >
                                    {!read && (
                                        <span className="absolute left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary" />
                                    )}

                                    {/* Avatar with type badge, or a plain icon for system notifications */}
                                    {actor ? (
                                        <Link
                                            to={profileHref ?? "#"}
                                            className="relative h-11 w-11 shrink-0"
                                            aria-label={actor.name}
                                        >
                                            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-secondary">
                                                {actor.avatarUrl ? (
                                                    <img
                                                        src={actor.avatarUrl}
                                                        alt={actor.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </span>
                                            <span
                                                className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-background"
                                                style={{ background: meta.iconBg }}
                                            >
                                                {meta.icon}
                                            </span>
                                        </Link>
                                    ) : (
                                        <div
                                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full overflow-hidden"
                                            style={{ background: meta.iconBg }}
                                        >
                                            {meta.icon}
                                        </div>
                                    )}

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="text-sm leading-snug text-foreground/95">
                                                {renderNotificationTitle(meta, profileHref, Link)}
                                            </p>
                                            <div className="flex shrink-0 items-center gap-1">
                                                <span className="text-xs text-muted-foreground">
                                                    {formatRelativeTime(n.created_at, t)}
                                                </span>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button
                                                            className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-secondary group-hover:opacity-100 data-[state=open]:opacity-100"
                                                            aria-label={t('notif.action.menu')}
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56">
                                                        {read ? (
                                                            <DropdownMenuItem onClick={() => markUnread(strId)} className="gap-2">
                                                                <Check className="h-4 w-4" />
                                                                {t('notif.action.mark.unread')}
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem onClick={() => markRead(strId)} className="gap-2">
                                                                <CheckCheck className="h-4 w-4" />
                                                                {t('notif.action.mark.read')}
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Pagination */}
                    {hasMore && (
                        <div className="border-t border-border/60 px-5 py-4 text-center">
                            <button
                                onClick={loadMore}
                                disabled={isLoading}
                                className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
                            >
                                {isLoading ? t('notif.loading') : t('notif.load.more')}
                            </button>
                        </div>
                    )}

                    {!hasMore && notifications.length > 0 && (
                        <div className="border-t border-border/60 px-5 py-5 text-center text-sm text-muted-foreground">
                            {t('notif.no.more')}
                        </div>
                    )}
                </section>
            </div>

            {/* ── Sidebar ──────────────────────────────────────────────── */}
            <aside className="hidden xl:flex flex-col w-70 shrink-0 py-0 gap-3 sticky top-18 self-start max-h-[calc(100vh-72px)]">
                <div className="panel-card p-2">
                    {SECTION_KEYS.map((key) => {
                        const sectionItems = grouped[key] ?? [];
                        const unread = sectionItems.filter((n) => !isItemRead(n.id)).length;
                        return (
                            <button
                                key={key}
                                onClick={() => setSection(key)}
                                className={cn(
                                    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors",
                                    section === key
                                        ? "bg-secondary font-semibold text-foreground"
                                        : "text-foreground/85 hover:bg-secondary/60",
                                )}
                            >
                                <span>{t(SECTION_LABEL_KEYS[key] as keyof TranslationDictionary)}</span>
                                {unread > 0 && (
                                    <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                                        {unread}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </aside>
        </div>
    );
};

export default Notifications;