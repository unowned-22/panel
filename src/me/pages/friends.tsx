import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
    Calendar,
    Search,
    UserPlus,
    Users,
    UserCheck,
    UserX,
    Clock,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from "lucide-react";
import { toAbsoluteUrl } from "@/lib/helpers.ts";
import { friendshipApi, type FriendConnection, type UserSuggestion } from "@/api/friendship";
import { useTranslation } from '@/hooks/use-translation';
import type { TranslationDictionary } from '@/i18n/types';

type Tab = "all" | "incoming" | "outgoing" | "find";

const PAGE_LIMIT = 20;

interface AvatarFallbackProps {
    name: string;
    className?: string;
}

interface UserAvatarProps {
    avatarUrl?: string;
    name: string;
    className?: string;
}

interface PaginationProps {
    page: number;
    totalPages: number;
    onPage: (p: number) => void;
}

const AvatarFallback = ({ name, className }: AvatarFallbackProps) => (
    <div className={`flex items-center justify-center rounded-full bg-secondary text-sm font-semibold ${className}`}>
        {name?.charAt(0)?.toUpperCase() ?? "?"}
    </div>
);

const UserAvatar = ({ avatarUrl, name, className }: UserAvatarProps) => {
    if (avatarUrl) {
        return <img src={toAbsoluteUrl(avatarUrl)} alt={name} className={`rounded-full object-cover ${className}`} />;
    }
    return <AvatarFallback name={name} className={className} />;
};

const Pagination = ({ page, totalPages, onPage }: PaginationProps) => {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 pt-2">
            <button
                disabled={page === 1}
                onClick={() => onPage(page - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary disabled:opacity-40 hover:bg-accent"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-muted-foreground">
                {page} / {totalPages}
            </span>
            <button
                disabled={page === totalPages}
                onClick={() => onPage(page + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary disabled:opacity-40 hover:bg-accent"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
};

const Friends = () => {
    const [tab, setTab] = useState<Tab>("all");
    const [query, setQuery] = useState("");

    // Friends list
    const [friends, setFriends] = useState<FriendConnection[]>([]);
    const [friendsTotal, setFriendsTotal] = useState(0);
    const [friendsPage, setFriendsPage] = useState(1);
    const [friendsLoading, setFriendsLoading] = useState(false);

    // Incoming requests
    const [incoming, setIncoming] = useState<FriendConnection[]>([]);
    const [incomingTotal, setIncomingTotal] = useState(0);
    const [incomingPage, setIncomingPage] = useState(1);
    const [incomingLoading, setIncomingLoading] = useState(false);

    // Outgoing requests
    const [outgoing, setOutgoing] = useState<FriendConnection[]>([]);
    const [outgoingTotal, setOutgoingTotal] = useState(0);
    const [outgoingPage, setOutgoingPage] = useState(1);
    const [outgoingLoading, setOutgoingLoading] = useState(false);

    // Suggestions
    const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
    const [suggestionsTotal, setSuggestionsTotal] = useState(0);
    const [suggestionsPage, setSuggestionsPage] = useState(1);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);

    // Action loading states
    const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});

    const setActionBusy = (id: number, busy: boolean) =>
        setActionLoading((prev) => ({ ...prev, [id]: busy }));

    const loadFriends = useCallback(async (page: number) => {
        setFriendsLoading(true);
        try {
            const res = await friendshipApi.listFriends(page, PAGE_LIMIT);
            setFriends(res.data ?? []);
            setFriendsTotal(res.total ?? 0);
            setFriendsPage(page);
        } catch {
            // ignore
        } finally {
            setFriendsLoading(false);
        }
    }, []);

    const loadIncoming = useCallback(async (page: number) => {
        setIncomingLoading(true);
        try {
            const res = await friendshipApi.listIncoming(page, PAGE_LIMIT);
            setIncoming(res.data ?? []);
            setIncomingTotal(res.total ?? 0);
            setIncomingPage(page);
        } catch {
            // ignore
        } finally {
            setIncomingLoading(false);
        }
    }, []);

    const loadOutgoing = useCallback(async (page: number) => {
        setOutgoingLoading(true);
        try {
            const res = await friendshipApi.listOutgoing(page, PAGE_LIMIT);
            setOutgoing(res.data ?? []);
            setOutgoingTotal(res.total ?? 0);
            setOutgoingPage(page);
        } catch {
            // ignore
        } finally {
            setOutgoingLoading(false);
        }
    }, []);

    const loadSuggestions = useCallback(async (page: number) => {
        setSuggestionsLoading(true);
        try {
            const res = await friendshipApi.listSuggestions(page, PAGE_LIMIT);
            setSuggestions(res.data ?? []);
            setSuggestionsTotal(res.total ?? 0);
            setSuggestionsPage(page);
        } catch {
            setSuggestions([]);
        } finally {
            setSuggestionsLoading(false);
        }
    }, []);

    useEffect(() => { loadFriends(1); }, [loadFriends]);
    useEffect(() => { loadIncoming(1); }, [loadIncoming]);
    useEffect(() => { loadOutgoing(1); }, [loadOutgoing]);
    useEffect(() => { loadSuggestions(1); }, [loadSuggestions]);

    const handleRemoveFriend = async (friendship: FriendConnection) => {
        setActionBusy(friendship.friendship_id, true);
        try {
            await friendshipApi.remove(friendship.friendship_id);
            await loadFriends(friendsPage);
        } finally {
            setActionBusy(friendship.friendship_id, false);
        }
    };

    const handleAccept = async (id: number) => {
        setActionBusy(id, true);
        try {
            await friendshipApi.accept(id);
            await Promise.all([loadIncoming(incomingPage), loadFriends(1)]);
        } finally {
            setActionBusy(id, false);
        }
    };

    const handleReject = async (id: number) => {
        setActionBusy(id, true);
        try {
            await friendshipApi.reject(id);
            await loadIncoming(incomingPage);
        } finally {
            setActionBusy(id, false);
        }
    };

    const handleCancel = async (id: number) => {
        setActionBusy(id, true);
        try {
            await friendshipApi.cancel(id);
            await loadOutgoing(outgoingPage);
        } finally {
            setActionBusy(id, false);
        }
    };

    const handleSendRequest = async (addresseeId: number) => {
        setActionBusy(addresseeId, true);
        try {
            await friendshipApi.sendRequest(addresseeId);
            await Promise.all([loadSuggestions(suggestionsPage), loadOutgoing(1)]);
        } finally {
            setActionBusy(addresseeId, false);
        }
    };

    const friendsTotalPages = Math.ceil(friendsTotal / PAGE_LIMIT) || 1;
    const incomingTotalPages = Math.ceil(incomingTotal / PAGE_LIMIT) || 1;
    const outgoingTotalPages = Math.ceil(outgoingTotal / PAGE_LIMIT) || 1;
    const suggestionsTotalPages = Math.ceil(suggestionsTotal / PAGE_LIMIT) || 1;

    const filteredFriends = query.trim()
        ? friends.filter((f) => {
            const q = query.trim().toLowerCase();
            return (
                f.user.full_name.toLowerCase().includes(q) ||
                f.user.username.toLowerCase().includes(q)
            );
        })
        : friends;

    const { t, language } = useTranslation();

    const tabs: { key: Tab; label: keyof TranslationDictionary; count: number }[] = [
        { key: "all", label: 'page.friends.tabs.all', count: friendsTotal },
        { key: "incoming", label: 'page.friends.tabs.incoming', count: incomingTotal },
        { key: "outgoing", label: 'page.friends.tabs.outgoing', count: outgoingTotal },
    ];

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 max-w-150 mx-auto w-full flex flex-col gap-3">
                <div className="panel-card p-4">
                    {/* Tabs */}
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                        {tabs.map((tb) => (
                            <button
                                key={tb.key}
                                onClick={() => setTab(tb.key)}
                                className={`button-pill ${tab === tb.key ? "bg-secondary" : "bg-transparent text-muted-foreground"}`}
                            >
                                {t(tb.label)}
                                {tb.count > 0 && <span className="ml-1">{tb.count}</span>}
                            </button>
                        ))}
                        <button
                            onClick={() => setTab("find")}
                            className={`button-pill ml-auto flex items-center gap-2 ${tab === "find" ? "bg-secondary" : ""}`}
                        >
                            <UserPlus className="w-4 h-4" /> {t('page.friends.find')}
                        </button>
                    </div>

                    {/* Search (only for friends list) */}
                    {tab === "all" && (
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full h-10 pl-9 pr-4 rounded-xl bg-secondary text-sm placeholder:text-muted-foreground focus:outline-none"
                                placeholder={t('page.friends.search.placeholder')}
                            />
                        </div>
                    )}
                    {/* All friends */}
                    {tab === "all" && (
                        friendsLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredFriends.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <Users className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
                                <div className="font-semibold">{t('page.friends.empty.noFriends')}</div>
                                <p className="text-sm text-muted-foreground text-center max-w-xs">
                                    {t('page.friends.empty.findPrompt')}
                                </p>
                                <button onClick={() => setTab("find")} className="button-pill mt-2">
                                    {t('page.friends.find')}
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 px-1 mb-1 text-xs text-muted-foreground">
                                    <UserCheck className="w-3.5 h-3.5" /> {t('page.friends.section.friends')}
                                </div>
                                {filteredFriends.map((f) => (
                                    <div key={f.friendship_id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/60 transition-colors">
                                        <Link to={`/profile/${f.user.username}`} className="shrink-0">
                                            <UserAvatar avatarUrl={f.user.avatar_url} name={f.user.full_name} className="w-12 h-12" />
                                        </Link>
                                        <div className="flex-1 min-w-0">
                                            <Link to={`/profile/${f.user.username}`} className="text-sm font-medium hover:underline truncate block">
                                                {f.user.full_name}
                                            </Link>
                                            <div className="text-xs text-muted-foreground truncate">@{f.user.username}</div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveFriend(f)}
                                            disabled={actionLoading[f.friendship_id]}
                                            className="button-pill bg-secondary! text-sm flex items-center gap-1"
                                        >
                                            {actionLoading[f.friendship_id] ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <UserX className="w-3.5 h-3.5" />
                                            )}
                                            {t('page.friends.action.remove')}
                                        </button>
                                    </div>
                                ))}
                                <Pagination page={friendsPage} totalPages={friendsTotalPages} onPage={loadFriends} />
                            </div>
                        )
                    )}

                    {/* Incoming requests */}
                    {tab === "incoming" && (
                        incomingLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : incoming.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <Clock className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
                                <div className="font-semibold">{t('page.friends.empty.incoming')}</div>
                                <p className="text-sm text-muted-foreground text-center max-w-xs">
                                    {t('page.friends.empty.incoming.desc')}
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 px-1 mb-1 text-xs text-muted-foreground">
                                    <Clock className="w-3.5 h-3.5" /> {t('page.friends.section.incoming')}
                                </div>
                                {incoming.map((f) => (
                                    <div key={f.friendship_id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/60 transition-colors">
                                        <Link to={`/profile/${f.user.username}`} className="shrink-0">
                                            <UserAvatar avatarUrl={f.user.avatar_url} name={f.user.full_name} className="w-12 h-12" />
                                        </Link>
                                        <div className="flex-1 min-w-0">
                                            <Link to={`/profile/${f.user.username}`} className="text-sm font-medium hover:underline truncate block">
                                                {f.user.full_name}
                                            </Link>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(f.created_at).toLocaleDateString(language)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleAccept(f.friendship_id)}
                                                disabled={actionLoading[f.friendship_id]}
                                                className="button-pill flex items-center gap-1"
                                            >
                                                {actionLoading[f.friendship_id] ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <UserCheck className="w-3.5 h-3.5" />
                                                )}
                                                {t('page.friends.action.accept')}
                                            </button>
                                            <button
                                                onClick={() => handleReject(f.friendship_id)}
                                                disabled={actionLoading[f.friendship_id]}
                                                className="button-pill bg-secondary! flex items-center gap-1"
                                            >
                                                <UserX className="w-3.5 h-3.5" />
                                                {t('page.friends.action.reject')}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <Pagination page={incomingPage} totalPages={incomingTotalPages} onPage={loadIncoming} />
                            </div>
                        )
                    )}

                    {/* Outgoing requests */}
                    {tab === "outgoing" && (
                        outgoingLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : outgoing.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <UserPlus className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
                                <div className="font-semibold">{t('page.friends.empty.outgoing')}</div>
                                <p className="text-sm text-muted-foreground text-center max-w-xs">
                                    {t('page.friends.empty.outgoing.desc')}
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 px-1 mb-1 text-xs text-muted-foreground">
                                    <UserPlus className="w-3.5 h-3.5" /> {t('page.friends.section.outgoing')}
                                </div>
                                {outgoing.map((f) => (
                                    <div key={f.friendship_id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/60 transition-colors">
                                        <Link to={`/profile/${f.user.username}`} className="shrink-0">
                                            <UserAvatar avatarUrl={f.user.avatar_url} name={f.user.full_name} className="w-12 h-12" />
                                        </Link>
                                        <div className="flex-1 min-w-0">
                                            <Link to={`/profile/${f.user.username}`} className="text-sm font-medium hover:underline truncate block">
                                                {f.user.full_name}
                                            </Link>
                                            <div className="text-xs text-muted-foreground">
                                                {t('page.friends.label.sent').replace('{date}', new Date(f.created_at).toLocaleDateString(language))}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleCancel(f.friendship_id)}
                                            disabled={actionLoading[f.friendship_id]}
                                            className="button-pill bg-secondary! flex items-center gap-1"
                                        >
                                            {actionLoading[f.friendship_id] ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : null}
                                            {t('page.friends.action.cancel')}
                                        </button>
                                    </div>
                                ))}
                                <Pagination page={outgoingPage} totalPages={outgoingTotalPages} onPage={loadOutgoing} />
                            </div>
                        )
                    )}

                    {/* Find friends / Suggestions */}
                    {tab === "find" && (
                        suggestionsLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 px-1 mb-1 text-xs text-muted-foreground">
                                    <Users className="w-3.5 h-3.5" /> {t('page.friends.section.suggestions')}
                                </div>
                                {suggestions.length === 0 ? (
                                    <div className="text-sm text-muted-foreground py-10 text-center">
                                        {t('page.friends.empty.suggestions')}
                                    </div>
                                ) : (
                                    suggestions.map((s) => (
                                        <div key={s.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/60 transition-colors">
                                            <Link to={`/profile/${s.username}`} className="shrink-0">
                                                <UserAvatar avatarUrl={s.avatar_url} name={s.full_name} className="w-12 h-12" />
                                            </Link>
                                            <div className="flex-1 min-w-0">
                                                <Link to={`/profile/${s.username}`} className="text-sm font-medium hover:underline truncate block">
                                                    {s.full_name}
                                                </Link>
                                                <div className="text-xs text-muted-foreground truncate">
                                                    @{s.username}
                                                    {s.mutual_friends_count > 0 && (
                                                        <> · {t('page.friends.suggestion.mutual').replace('{count}', String(s.mutual_friends_count))}</>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleSendRequest(s.id)}
                                                disabled={actionLoading[s.id]}
                                                className="button-pill flex items-center gap-1"
                                            >
                                                {actionLoading[s.id] ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <UserPlus className="w-3.5 h-3.5" />
                                                )}
                                                {t('page.friends.action.add')}
                                            </button>
                                        </div>
                                    ))
                                )}
                                <Pagination page={suggestionsPage} totalPages={suggestionsTotalPages} onPage={loadSuggestions} />
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Sidebar */}
            <aside className="hidden xl:flex flex-col w-70 shrink-0 py-0 gap-3 sticky top-18 self-start max-h-[calc(100vh-72px)]">
                <div className="panel-card p-2">
                    <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold hover:bg-secondary/60">
                        {t('page.friends.sidebar.title')} <Calendar className="w-4 h-4 text-muted-foreground" />
                    </button>
                    {tabs.map((tb) => (
                        <button
                            key={tb.key}
                            onClick={() => setTab(tb.key)}
                            className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-sm mt-1 ${tab === tb.key ? "bg-secondary" : "hover:bg-secondary/60"}`}
                        >
                            {t(tb.label)}
                            {tb.count > 0 && (
                                <span className="ml-auto text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
                                    {tb.count}
                                </span>
                            )}
                        </button>
                    ))}
                    <button
                        onClick={() => setTab("find")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm mt-1 ${tab === "find" ? "bg-secondary" : "hover:bg-secondary/60"}`}
                    >
                        {t('page.friends.sidebar.find')}
                    </button>
                </div>
            </aside>
        </div>
    );
};

export default Friends;