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
import { useAuthStore } from "@/modules/auth/auth.store";
import { useSocket } from "@/hooks/use-socket";

const PAGE_LIMIT = 30;

function safeArray<T>(value: unknown): T[] {
    return Array.isArray(value) ? (value as T[]) : [];
}

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
    const activeAccountId = useAuthStore((s) => s.activeAccountId);
    const { subscribe } = useSocket();

    const [notifications, setNotifications] = useState<ApiNotification[]>([]);
    const [readIds, setReadIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [totalUnread, setTotalUnread] = useState(0);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const mountedRef = useRef(true);

    const hasMore = notifications.length < total;

    const reset = useCallback(() => {
        setNotifications([]);
        setReadIds(new Set());
        setIsLoading(false);
        setTotalUnread(0);
        setPage(1);
        setTotal(0);
    }, []);

    // ─── Realtime: подписка на новые уведомления через общий сокет ──────────

    useEffect(() => {
        return subscribe<ApiNotification>("notification", (data) => {
            if (!mountedRef.current || !data) return;
            setNotifications((prev) => [data, ...prev]);
            setTotal((t) => t + 1);
            setTotalUnread((c) => c + 1);
        });
    }, [subscribe]);

    // ─── Load first page + unread count ──────────────────────────────────────

    useEffect(() => {
        mountedRef.current = true;

        if (!activeAccountId) {
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

        return () => {
            mountedRef.current = false;
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