import {
    type ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { SocketContext, type Ctx, type SocketHandler, type WsFrame } from "@/context/socket-context";
import { useAuthStore } from "@/auth/auth.store";

const WS_RECONNECT_DELAY_MS = 5_000;

function buildWsUrl(token: string): string {
    const base = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
    const wsBase = base.replace(/^http/, "ws");
    return `${wsBase}/ws/notifications?token=${encodeURIComponent(token)}`;
}

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const activeAccountId = useAuthStore((s) => s.activeAccountId);
    const tokens = useAuthStore((s) => s.tokens);
    const token = activeAccountId ? tokens[activeAccountId]?.access_token : undefined;

    const [isConnected, setIsConnected] = useState(false);

    const mountedRef = useRef(true);
    const wsRef = useRef<WebSocket | null>(null);
    const wsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // type -> set of handlers. Ref, чтобы не пересоздавать connectWs на
    // каждую подписку/отписку и не плодить лишние реконнекты.
    const listenersRef = useRef<Map<string, Set<SocketHandler>>>(new Map());

    const closeWs = useCallback(() => {
        if (wsTimerRef.current) clearTimeout(wsTimerRef.current);
        wsRef.current?.close();
        wsRef.current = null;
        setIsConnected(false);
    }, []);

    const connectWs = useCallback((tok: string) => {
        if (!mountedRef.current) return;
        closeWs();

        let ws: WebSocket;
        try {
            ws = new WebSocket(buildWsUrl(tok));
        } catch {
            return; // некорректный URL/протокол — пропускаем тихо
        }

        wsRef.current = ws;

        ws.onopen = () => {
            if (!mountedRef.current) return;
            setIsConnected(true);
        };

        ws.onmessage = (evt) => {
            try {
                const frame: WsFrame = JSON.parse(evt.data);
                const handlers = listenersRef.current.get(frame.type);
                handlers?.forEach((h) => h(frame.data));
            } catch {
                // игнорируем некорректные фреймы
            }
        };

        ws.onerror = () => {
            // тихо — onclose разберётся с реконнектом
        };

        ws.onclose = (evt) => {
            if (!mountedRef.current) return;
            setIsConnected(false);
            // 1000 = normal close, 1001 = going away — не переподключаемся
            if (evt.code !== 1000 && evt.code !== 1001) {
                wsTimerRef.current = setTimeout(() => connectWs(tok), WS_RECONNECT_DELAY_MS);
            }
        };
    }, [closeWs]);

    useEffect(() => {
        mountedRef.current = true;

        if (!token) {
            closeWs();
            return;
        }

        connectWs(token);

        return () => {
            mountedRef.current = false;
            closeWs();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const subscribe = useCallback<Ctx["subscribe"]>((type, handler) => {
        const map = listenersRef.current;
        if (!map.has(type)) map.set(type, new Set());
        map.get(type)!.add(handler as SocketHandler);

        return () => {
            const set = map.get(type);
            set?.delete(handler as SocketHandler);
            if (set && set.size === 0) map.delete(type);
        };
    }, []);

    const value = useMemo<Ctx>(
        () => ({ isConnected, subscribe }),
        [isConnected, subscribe],
    );

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};