import {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import {
    CallContext,
    type Ctx as CallCtx,
    type IncomingCall,
    type ActiveCallSession,
    type CallRingingEvent,
    type CallDeclinedEvent,
    type CallEndedEvent,
    type CallParticipantLeftEvent,
} from "@/context/call-context";
import { SocketContext } from "@/context/socket-context";
import { callsApi, type ApiCallType, type ApiCallSession } from "@/api/calls";
import { useAuthStore } from "@/modules/auth/auth.store";

/**
 * ВНИМАНИЕ, это предположение: имена WS-событий ниже (`call.ringing` и т.д.)
 * подобраны по аналогии с messenger.presence/messenger.typing из
 * transport/ws/messenger_payloads.go, но на бэкенде сейчас НИГДЕ не
 * рассылаются — ни в call_handler.go, ни в реализации call.Service (её
 * не было в присланных файлах). Это нужно доделать на бэкенде отдельно:
 * при InitiateCall разослать всем приглашённым участникам (кроме
 * инициатора) RINGING; при JoinCall — PARTICIPANT_JOINED; при DeclineCall —
 * DECLINED; при LeaveCall — PARTICIPANT_LEFT; при EndCall — ENDED.
 * Если реальные имена событий будут другими — поменяйте константы ниже,
 * остальной код трогать не придётся.
 */
const WS_EVENTS = {
    RINGING: "call.ringing",
    PARTICIPANT_JOINED: "call.participant_joined",
    PARTICIPANT_LEFT: "call.participant_left",
    DECLINED: "call.declined",
    ENDED: "call.ended",
} as const;

const isConflict = (err: unknown): boolean => {
    const e = err as { status?: number; response?: { status?: number } } | undefined;
    return e?.status === 409 || e?.response?.status === 409;
};

export const CallProvider = ({ children }: { children: ReactNode }) => {
    const socket = useContext(SocketContext);

    // ПРЕДПОЛОЖЕНИЕ: activeAccountId — тот же числовой user_id, что бэкенд
    // кладёт в initiator_id / participant.user_id. Файла auth.store.ts не
    // было среди присланных, поэтому если это не так — замените источник
    // currentUserId здесь.
    const currentUserId = useAuthStore((s) => s.user?.id);

    const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
    const [activeCall, setActiveCall] = useState<ActiveCallSession | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Чтобы не пересоздавать подписки на сокет при каждом изменении состояния.
    const stateRef = useRef({ incomingCall, activeCall });
    stateRef.current = { incomingCall, activeCall };

    const startCall = useCallback(async (conversationId: number, callType: ApiCallType) => {
        setError(null);
        setIsConnecting(true);
        try {
            let join: { call_id: number; room_name: string; token: string; livekit_url: string };
            try {
                const res = await callsApi.initiate(conversationId, callType);
                join = res.data.join;
            } catch (err) {
                // Конверсация уже содержит активный/звонящий звонок — подключаемся к нему.
                if (!isConflict(err)) throw err;
                const activeRes = await callsApi.getActiveForConversation(conversationId);
                const session = activeRes.data;
                if (!session) throw err;
                const joinRes = await callsApi.join(session.id);
                join = joinRes.data;
            }
            setActiveCall({
                callId: join.call_id,
                conversationId,
                roomName: join.room_name,
                token: join.token,
                livekitUrl: join.livekit_url,
                callType,
            });
        } catch (err) {
            console.error("[call] startCall failed", err);
            setError("Не удалось начать звонок");
        } finally {
            setIsConnecting(false);
        }
    }, []);

    const acceptCall = useCallback(async () => {
        const call = stateRef.current.incomingCall;
        if (!call) return;
        setError(null);
        setIsConnecting(true);
        try {
            const res = await callsApi.join(call.callId);
            const join = res.data;
            setActiveCall({
                callId: join.call_id,
                conversationId: call.conversationId,
                roomName: join.room_name,
                token: join.token,
                livekitUrl: join.livekit_url,
                callType: call.callType,
            });
            setIncomingCall(null);
        } catch (err) {
            console.error("[call] acceptCall failed", err);
            setError("Не удалось подключиться к звонку");
        } finally {
            setIsConnecting(false);
        }
    }, []);

    const declineCall = useCallback(async () => {
        const call = stateRef.current.incomingCall;
        if (!call) return;
        setIncomingCall(null);
        try {
            await callsApi.decline(call.callId);
        } catch (err) {
            console.error("[call] declineCall failed", err);
        }
    }, []);

    const leaveCall = useCallback(async () => {
        const call = stateRef.current.activeCall;
        if (!call) return;
        setActiveCall(null);
        try {
            await callsApi.leave(call.callId);
        } catch (err) {
            console.error("[call] leaveCall failed", err);
        }
    }, []);

    const endCall = useCallback(async () => {
        const call = stateRef.current.activeCall;
        if (!call) return;
        setActiveCall(null);
        try {
            await callsApi.end(call.callId);
        } catch (err) {
            console.error("[call] endCall failed", err);
        }
    }, []);

    const getActiveCallForConversation = useCallback(
        async (conversationId: number): Promise<ApiCallSession | null> => {
            try {
                const res = await callsApi.getActiveForConversation(conversationId);
                return res.data;
            } catch (err) {
                console.error("[call] getActiveCallForConversation failed", err);
                return null;
            }
        },
        []
    );

    // Сигналинг по сокету: входящий звонок, отклонение, завершение, уход собеседника.
    useEffect(() => {
        if (!socket) return;

        const unsubRinging = socket.subscribe(WS_EVENTS.RINGING, async (data: CallRingingEvent) => {
            if (data.initiator_id === currentUserId) return;
            const { incomingCall: curIncoming, activeCall: curActive } = stateRef.current;
            if (curIncoming?.callId === data.call_id || curActive?.callId === data.call_id) return;
            try {
                // CallRingingEvent не содержит call_type — уточняем через GET /calls/{id}.
                const res = await callsApi.get(data.call_id);
                setIncomingCall({
                    callId: data.call_id,
                    conversationId: data.conversation_id,
                    initiatorId: data.initiator_id,
                    roomName: data.room_name,
                    callType: res.data.call_type,
                });
            } catch (err) {
                console.error("[call] failed to load ringing call details", err);
            }
        });

        const unsubDeclined = socket.subscribe(WS_EVENTS.DECLINED, (data: CallDeclinedEvent) => {
            const { incomingCall: curIncoming, activeCall: curActive } = stateRef.current;
            if (curActive?.callId === data.call_id) setActiveCall(null);
            if (curIncoming?.callId === data.call_id) setIncomingCall(null);
        });

        const unsubEnded = socket.subscribe(WS_EVENTS.ENDED, (data: CallEndedEvent) => {
            const { incomingCall: curIncoming, activeCall: curActive } = stateRef.current;
            if (curActive?.callId === data.call_id) setActiveCall(null);
            if (curIncoming?.callId === data.call_id) setIncomingCall(null);
        });

        // Для 1:1: если единственный собеседник вышел из комнаты, считаем звонок завершённым и у нас.
        const unsubLeft = socket.subscribe(WS_EVENTS.PARTICIPANT_LEFT, (data: CallParticipantLeftEvent) => {
            const { activeCall: curActive } = stateRef.current;
            if (curActive?.callId === data.call_id && data.user_id !== currentUserId) {
                setActiveCall(null);
            }
        });

        return () => {
            unsubRinging();
            unsubDeclined();
            unsubEnded();
            unsubLeft();
        };
    }, [socket, currentUserId]);

    const value: CallCtx = {
        incomingCall,
        activeCall,
        isConnecting,
        error,
        startCall,
        acceptCall,
        declineCall,
        leaveCall,
        endCall,
        getActiveCallForConversation,
    };

    return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};