import {
    type ReactNode,
    useState,
    useEffect,
    useRef,
    useCallback,
} from "react";
import { FriendRequestsContext, type FriendRequestsCtx } from "@/context/friend-requests-context";
import { friendshipApi } from "@/api/friendship";
import { useAuthStore } from "@/auth/auth.store";
import { useNotifications } from "@/hooks/use-notification";

const FRIEND_REQUEST_RECEIVED = "friend_request_received";

export const FriendRequestsProvider = ({ children }: { children: ReactNode }) => {
    const activeAccountId = useAuthStore((s) => s.activeAccountId);
    const { notifications } = useNotifications();

    const [pendingCount, setPendingCount] = useState(0);
    const mountedRef = useRef(true);

    // IDs of notifications we've already accounted for — prevents double-counting
    // on re-renders or when the notifications list is refreshed from REST.
    const seenIdsRef = useRef<Set<number>>(new Set());
    // True once the initial REST fetch has returned; we only process WS deltas
    // after the baseline is established.
    const initializedRef = useRef(false);

    // ── Initial REST fetch ────────────────────────────────────────────────────

    const fetchCount = useCallback(async () => {
        if (!activeAccountId) return;
        try {
            const res = await friendshipApi.listIncoming(1, 1);
            if (!mountedRef.current) return;
            setPendingCount(res.total ?? 0);
            initializedRef.current = true;
        } catch {
            // sidebar badge is non-critical — fail silently
        }
    }, [activeAccountId]);

    useEffect(() => {
        mountedRef.current = true;
        initializedRef.current = false;
        seenIdsRef.current = new Set();
        if (activeAccountId) {
            fetchCount();
        } else {
            setPendingCount(0);
        }
        return () => {
            mountedRef.current = false;
        };
    }, [activeAccountId, fetchCount]);

    // ── WS delta: listen for new friend_request_received notifications ────────
    //
    // NotificationsProvider prepends every incoming WS event to the front of
    // `notifications`.  We seed seenIds with the IDs that exist at init time
    // (those are already counted by the REST fetch above), then increment for
    // any unseen friend_request_received that shows up afterward.

    useEffect(() => {
        if (!initializedRef.current) {
            // Baseline not ready yet — seed seenIds so we don't double-count
            // once initializedRef flips.
            notifications.forEach((n) => seenIdsRef.current.add(n.id));
            return;
        }

        for (const n of notifications) {
            if (seenIdsRef.current.has(n.id)) continue;
            seenIdsRef.current.add(n.id);

            if (n.type === FRIEND_REQUEST_RECEIVED) {
                setPendingCount((c) => c + 1);
            }
        }
    }, [notifications]);

    // ── refresh — call after accept / reject on the friends page ─────────────

    const refresh = useCallback(() => {
        // Re-fetch the authoritative count; also re-seeds seenIds so we don't
        // re-increment for requests that are now gone.
        seenIdsRef.current = new Set(notifications.map((n) => n.id));
        fetchCount();
    }, [fetchCount, notifications]);

    const value: FriendRequestsCtx = { pendingCount, refresh };

    return (
        <FriendRequestsContext.Provider value={value}>
            {children}
        </FriendRequestsContext.Provider>
    );
};
