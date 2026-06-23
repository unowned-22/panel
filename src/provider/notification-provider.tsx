import {
    type ReactNode,
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
} from "react";
import { NotificationsContext, type Ctx } from "@/context/notification-context";
import { notificationsApi, type ApiNotification } from "@/api/notifications";
import { useAuthStore } from "@/auth/auth.store";

const PAGE_LIMIT = 30;
const WS_RECONNECT_DELAY_MS = 5_000;

function buildWsUrl(token: string): string {
    const base = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
    const wsBase = base.replace(/^http/, "ws");
    return `${wsBase}/ws/notifications?token=${encodeURIComponent(token)}`;
}

function safeArray<T>(value: unknown): T[] {
    return Array.isArray(value) ? (value as T[]) : [];
}

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
    const activeAccountId = useAuthStore((s) => s.activeAccountId);
    const tokens = useAuthStore((s) => s.tokens);

    const [notifications, setNotifications] = useState<ApiNotification[]>([]);
    const [readIds, setReadIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [totalUnread, setTotalUnread] = useState(0);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const mountedRef = useRef(true);
    const wsRef = useRef<WebSocket | null>(null);
    const wsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const hasMore = notifications.length < total;

    const closeWs = useCallback(() => {
        if (wsTimerRef.current) clearTimeout(wsTimerRef.current);
        wsRef.current?.close();
        wsRef.current = null;
    }, []);

    const reset = useCallback(() => {
        closeWs();
        setNotifications([]);
        setReadIds(new Set());
        setIsLoading(false);
        setTotalUnread(0);
        setPage(1);
        setTotal(0);
    }, [closeWs]);

    // ─── WebSocket ────────────────────────────────────────────────────────────

    const connectWs = useCallback((token: string) => {
        if (!mountedRef.current) return;
        closeWs();

        let ws: WebSocket;
        try {
            ws = new WebSocket(buildWsUrl(token));
        } catch {
            return; // protocol or URL error — skip silently
        }

        wsRef.current = ws;

        ws.onmessage = (evt) => {
            try {
                const msg = JSON.parse(evt.data) as { type: string; data: ApiNotification };
                if (msg.type === "notification" && msg.data) {
                    if (!mountedRef.current) return;
                    setNotifications((prev) => [msg.data, ...prev]);
                    setTotal((t) => t + 1);
                    setTotalUnread((c) => c + 1);
                }
            } catch {
                // ignore malformed frames
            }
        };

        ws.onerror = () => {
            // Backend may not yet support WS token auth — reconnect silently
        };

        ws.onclose = (evt) => {
            if (!mountedRef.current) return;
            // 1000 = normal close, 1001 = going away — don't reconnect
            if (evt.code !== 1000 && evt.code !== 1001) {
                wsTimerRef.current = setTimeout(() => connectWs(token), WS_RECONNECT_DELAY_MS);
            }
        };
    }, [closeWs]);

    // ─── Load first page + unread count ──────────────────────────────────────

    useEffect(() => {
        mountedRef.current = true;

        if (!activeAccountId) {
            reset();
            return;
        }

        const token = tokens[activeAccountId]?.access_token;
        if (!token) {
            reset();
            return;
        }

        setIsLoading(true);
        setNotifications([]);
        setPage(1);
        setTotal(0);

        Promise.all([
            notificationsApi.list(1, PAGE_LIMIT),
            notificationsApi.unreadCount(),
        ])
            .then(([paged, unread]) => {
                if (!mountedRef.current) return;
                setNotifications(safeArray<ApiNotification>(paged.items));
                setTotal(paged.total);
                setTotalUnread(unread);
            })
            .catch((err) => console.error("[Notifications] load error", err))
            .finally(() => {
                if (mountedRef.current) setIsLoading(false);
            });

        connectWs(token);

        return () => {
            mountedRef.current = false;
            closeWs();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeAccountId]);

    // ─── loadMore ────────────────────────────────────────────────────────────

    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore) return;
        const nextPage = page + 1;
        setIsLoading(true);
        try {
            const paged = await notificationsApi.list(nextPage, PAGE_LIMIT);
            if (!mountedRef.current) return;
            setNotifications((prev) => [...prev, ...safeArray<ApiNotification>(paged.items)]);
            setPage(nextPage);
            setTotal(paged.total);
        } catch (e) {
            console.error(e);
        } finally {
            if (mountedRef.current) setIsLoading(false);
        }
    }, [isLoading, hasMore, page]);

    // ─── refresh ─────────────────────────────────────────────────────────────

    const refresh = useCallback(async () => {
        if (!activeAccountId) return;
        setIsLoading(true);
        try {
            const [paged, unread] = await Promise.all([
                notificationsApi.list(1, PAGE_LIMIT),
                notificationsApi.unreadCount(),
            ]);
            if (!mountedRef.current) return;
            setNotifications(safeArray<ApiNotification>(paged.items));
            setPage(1);
            setTotal(paged.total);
            setTotalUnread(unread);
            setReadIds(new Set());
        } catch (e) {
            console.error(e);
        } finally {
            if (mountedRef.current) setIsLoading(false);
        }
    }, [activeAccountId]);

    // ─── markRead ────────────────────────────────────────────────────────────

    const markRead = useCallback((id: string) => {
        setReadIds((prev) => {
            if (prev.has(id)) return prev;
            const next = new Set(prev);
            next.add(id);
            return next;
        });
        setTotalUnread((c) => Math.max(0, c - 1));

        notificationsApi.markRead(Number(id)).catch(() => {
            setReadIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
            setTotalUnread((c) => c + 1);
        });
    }, []);

    // ─── markUnread ──────────────────────────────────────────────────────────

    const markUnread = useCallback((id: string) => {
        setReadIds((prev) => {
            if (!prev.has(id)) return prev;
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
        setTotalUnread((c) => c + 1);
    }, []);

    // ─── toggleRead ──────────────────────────────────────────────────────────

    const toggleRead = useCallback(
        (id: string) => {
            if (readIds.has(id)) markUnread(id);
            else markRead(id);
        },
        [readIds, markRead, markUnread],
    );

    // ─── markAllRead ─────────────────────────────────────────────────────────

    const markAllRead = useCallback(async () => {
        const prevReadIds = readIds;
        const prevTotal = totalUnread;
        const allIds = notifications.map((n) => String(n.id));

        setReadIds((prev) => {
            const next = new Set(prev);
            allIds.forEach((id) => next.add(id));
            return next;
        });
        setTotalUnread(0);

        try {
            await notificationsApi.markAllRead();
        } catch {
            setReadIds(prevReadIds);
            setTotalUnread(prevTotal);
        }
    }, [notifications, readIds, totalUnread]);

    // ─── Helpers ──────────────────────────────────────────────────────────────

    const unreadCount = useCallback(
        (ids: string[]) => ids.filter((i) => !readIds.has(i)).length,
        [readIds],
    );

    const isRead = useCallback((id: string) => readIds.has(id), [readIds]);

    // ─── Context value ────────────────────────────────────────────────────────

    const value = useMemo<Ctx>(
        () => ({
            readIds, isRead, markRead, markUnread, toggleRead,
            markAllRead, unreadCount,
            notifications, isLoading, hasMore, loadMore, refresh, totalUnread,
        }),
        [
            readIds, isRead, markRead, markUnread, toggleRead,
            markAllRead, unreadCount,
            notifications, isLoading, hasMore, loadMore, refresh, totalUnread,
        ],
    );

    return (
        <NotificationsContext.Provider value={value}>
            {children}
        </NotificationsContext.Provider>
    );
};