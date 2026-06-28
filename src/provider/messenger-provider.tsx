import {
    type ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { MessengerContext } from '@/context/messenger-context';
import type {
    AvailableMember,
    ChatContact,
    CreateChatInput,
    Ctx,
    Message,
    MessageFile,
    ReactionSummary
} from '@/context/messenger-context';
import { messengerApi, type ApiConversation, type ApiMessage, type ApiReactionSummary } from '@/api/messenger';
import { useAuthStore } from '@/auth/auth.store';
import { useSocket } from '@/hooks/use-socket';

const DRAFT_PREFIX = 'draft:';
const isDraftId = (id: string) => id.startsWith(DRAFT_PREFIX);

const fmtTime = (iso?: string | null): string => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

const fmtDate = (iso?: string | null): string => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const oneDayMs = 86_400_000;
    if (diff < oneDayMs && d.getDate() === now.getDate()) return '';
    if (diff < 2 * oneDayMs) return 'вчера';
    return d.toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' });
};

const convName = (c: ApiConversation, myID: number): string => {
    if (c.type !== 'direct') return c.title || 'Группа без названия';
    const other = c.members?.find(m => m.user_id !== myID);
    return other?.user_name || c.title || `Диалог #${c.id}`;
};

const convAvatar = (c: ApiConversation, myID: number): string | undefined => {
    if (c.type !== 'direct') return c.avatar_url || undefined;
    const other = c.members?.find(m => m.user_id !== myID);
    return other?.user_avatar || c.avatar_url || undefined;
};

const mapConversation = (c: ApiConversation, myID: number): ChatContact => {
    const lastMsg = c.last_message;
    let preview = '';
    if (lastMsg) {
        const isMine = lastMsg.sender_id === myID;
        const body = lastMsg.body || (lastMsg.attachments?.length ? '📎 Вложение' : '');
        preview = isMine ? `Вы: ${body}` : body;
    }
    return {
        id: String(c.id),
        name: convName(c, myID),
        preview,
        time: fmtTime(c.last_message_at),
        avatar: convAvatar(c, myID),
        unread: c.unread_count > 0 ? c.unread_count : undefined,
        isGroup: c.type === 'group' || c.type === 'channel',
        description: c.description || undefined,
        memberIds: c.members?.map(m => String(m.user_id)),
        read: c.unread_count === 0 && !!c.last_message_id,
    };
};

const mapMessage = (m: ApiMessage, myID: number): Message => {
    const images: string[] = [];
    const files: MessageFile[] = [];
    let audio: Message['audio'] | undefined;
    let video: Message['video'] | undefined;

    for (const a of m.attachments ?? []) {
        if (a.type === 'image') {
            images.push(a.url);
        } else if (a.type === 'audio') {
            const mins = Math.floor((a.duration_s ?? 0) / 60);
            const secs = (a.duration_s ?? 0) % 60;
            audio = { url: a.url, duration: `${mins}:${secs.toString().padStart(2, '0')}` };
        } else if (a.type === 'video') {
            const mins = Math.floor((a.duration_s ?? 0) / 60);
            const secs = (a.duration_s ?? 0) % 60;
            video = { url: a.url, thumbnail: '', duration: `${mins}:${secs.toString().padStart(2, '0')}` };
        } else {
            files.push({ name: a.filename || 'Файл', size: a.size_bytes, url: a.url, mime: a.mime_type });
        }
    }

    return {
        id: String(m.id),
        senderId: String(m.sender_id),
        senderName: m.sender_name || 'Пользователь',
        text: m.body || '',
        time: fmtTime(m.created_at),
        date: fmtDate(m.created_at) || undefined,
        isOwn: m.sender_id === myID,
        images: images.length ? images : undefined,
        files: files.length ? files : undefined,
        audio,
        video,
        pinned: m.pinned,
        reactions: (m.reactions ?? []).map(r => ({
            emoji: r.emoji,
            count: r.count,
            reactedByMe: r.reacted_by_me,
        })),
        deliveryStatus: m.delivery_status,
        replyTo: m.reply_to
            ? {
                senderName: m.reply_to.sender_name ?? `Пользователь ${m.reply_to.sender_id}`,
                text: m.reply_to.body,
            }
            : undefined,
        forwardedFrom: m.forwarded_from_id ? String(m.forwarded_from_id) : undefined,
    };
};

interface WsMsgPayload {
    conversation_id: number;
    message: ApiMessage;
}

interface WsPinPayload {
    conversation_id: number;
    message_id: number;
    pinned: boolean;
    actor_id: number;
}

interface WsReactionPayload {
    conversation_id: number;
    message_id: number;
    user_id: number;
    emoji: string;
    reactions: ApiReactionSummary[];
}

interface WsDeliveryPayload {
    conversation_id: number;
    message_id: number;
    user_id: number;
    status: string;
}

interface WsPresencePayload {
    user_id: number;
    is_online: boolean;
    last_seen_at?: string | null;
}

interface WsTypingPayload {
    conversation_id: number;
    user_id: number;
    is_typing: boolean;
}

const TYPING_IDLE_MS = 3000;

export const MessengerProvider = ({ children }: { children: ReactNode }) => {
    const user = useAuthStore(s => s.user);
    const activeAccountId = useAuthStore(s => s.activeAccountId);
    const myID = user?.id ? Number(user.id) : 0;
    const { subscribe } = useSocket();

    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [contacts, setContacts] = useState<ChatContact[]>([]);
    const [messages, setMessages] = useState<Record<string, Message[]>>({});
    const [typing, setTyping] = useState<Set<string>>(new Set());
    const [availableMembers] = useState<AvailableMember[]>([]);

    const loadedConvs = useRef<Set<string>>(new Set());
    const mountedRef = useRef(true);
    const typingTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    const setActiveChat = useCallback((chatId: string | null) => {
        setActiveChatId(chatId);
    }, []);

    useEffect(() => {
        if (!activeChatId || isDraftId(activeChatId)) return;

        const messagesInChat = messages[activeChatId] ?? [];
        const lastMessage = messagesInChat[messagesInChat.length - 1];

        if (lastMessage) {
            messengerApi.markRead(Number(activeChatId), Number(lastMessage.id))
                .then(() => {
                    setContacts(prev => prev.map(c =>
                        c.id === activeChatId ? { ...c, unread: undefined, read: true } : c
                    ));
                })
                .catch(err => console.error('[messenger] failed to mark read', err));
        }
    }, [activeChatId, messages]);

    const loadConversations = useCallback(async () => {
        try {
            const res = await messengerApi.listConversations();
            if (!mountedRef.current) return;
            setContacts((res.data.items ?? []).map(c => mapConversation(c, myID)));
        } catch (err) {
            console.error('[messenger] failed to load conversations', err);
        }
    }, [myID]);

    const loadMessages = useCallback(async (chatId: string) => {
        if (isDraftId(chatId)) return;
        if (loadedConvs.current.has(chatId)) return;
        loadedConvs.current.add(chatId);
        try {
            const res = await messengerApi.listMessages(Number(chatId));
            if (!mountedRef.current) return;
            const mapped = (res.data.items ?? []).map(m => mapMessage(m, myID));
            setMessages(prev => ({ ...prev, [chatId]: mapped.reverse() }));
        } catch (err) {
            console.error('[messenger] failed to load messages for', chatId, err);
            loadedConvs.current.delete(chatId);
        }
    }, [myID]);

    useEffect(() => {
        mountedRef.current = true;

        if (!myID || !activeAccountId) return;

        loadConversations();

        return () => {
            mountedRef.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [myID, activeAccountId]);

    const applyReactionSnapshot = (p: WsReactionPayload) => {
        const chatId = String(p.conversation_id);
        const msgId = String(p.message_id);
        setMessages(prev => ({
            ...prev,
            [chatId]: (prev[chatId] ?? []).map(m =>
                m.id === msgId
                    ? {
                        ...m,
                        reactions: p.reactions.map(r => ({
                            emoji: r.emoji,
                            count: r.count,
                            reactedByMe: r.reacted_by_me,
                        })),
                    }
                    : m
            ),
        }));
    };

    useEffect(() => {
        return () => {
            Object.values(typingTimersRef.current).forEach(clearTimeout);
        };
    }, []);

    useEffect(() => {
        const unsubs = [
            subscribe<WsMsgPayload>('messenger.message_sent', (p) => {
                const chatId = String(p.conversation_id);
                const newMsg = mapMessage(p.message, myID);

                setMessages(prev => {
                    const list = prev[chatId] ?? [];
                    const exists = list.some(m => m.id === newMsg.id);

                    if (exists) {
                        return {
                            ...prev,
                            [chatId]: list.map(m => m.id === newMsg.id ? newMsg : m)
                        }
                    }

                    return {
                        ...prev,
                        [chatId]: [...list, newMsg],
                    }
                });

                setContacts(prev => prev.map(c => {
                    if (c.id !== chatId) return c;
                    const isMine = p.message.sender_id === myID;
                    const body = p.message.body || (p.message.attachments?.length ? '📎 Вложение' : '');
                    return {
                        ...c,
                        preview: isMine ? `Вы: ${body}` : body,
                        time: fmtTime(p.message.created_at),
                        unread: isMine ? undefined : (c.unread ?? 0) + 1,
                        read: isMine,
                    };
                }));

                if (p.message.sender_id !== myID) {
                    setTyping(prev => {
                        if (!prev.has(chatId)) return prev;
                        const next = new Set(prev);
                        next.delete(chatId);
                        return next;
                    });
                }
            }),

            subscribe<WsTypingPayload>('messenger.typing', (p) => {
                if (p.user_id === myID) return; // не показываем себе свой же индикатор
                const chatId = String(p.conversation_id);
                setTyping(prev => {
                    const has = prev.has(chatId);
                    if (p.is_typing === has) return prev;
                    const next = new Set(prev);
                    if (p.is_typing) next.add(chatId);
                    else next.delete(chatId);
                    return next;
                });
            }),

            subscribe<WsPinPayload>('messenger.message_pinned', (p) => {
                const chatId = String(p.conversation_id);
                const msgId = String(p.message_id);
                setMessages(prev => ({
                    ...prev,
                    [chatId]: (prev[chatId] ?? []).map(m =>
                        m.id === msgId ? { ...m, pinned: true } : m
                    ),
                }));
            }),

            subscribe<WsPinPayload>('messenger.message_unpinned', (p) => {
                const chatId = String(p.conversation_id);
                const msgId = String(p.message_id);
                setMessages(prev => ({
                    ...prev,
                    [chatId]: (prev[chatId] ?? []).map(m =>
                        m.id === msgId ? { ...m, pinned: false } : m
                    ),
                }));
            }),

            subscribe<WsReactionPayload>('messenger.reaction_added', applyReactionSnapshot),

            subscribe<WsReactionPayload>('messenger.reaction_removed', applyReactionSnapshot),

            subscribe<WsDeliveryPayload>('messenger.delivery_updated', (p) => {
                const chatId = String(p.conversation_id);
                const msgId = String(p.message_id);
                setMessages(prev => ({
                    ...prev,
                    [chatId]: (prev[chatId] ?? []).map(m =>
                        m.id === msgId ? { ...m, deliveryStatus: p.status } : m
                    ),
                }));
            }),

            subscribe<WsPresencePayload>('messenger.presence', (p) => {
                const uid = String(p.user_id);
                setContacts(prev => prev.map(c => {
                    if (c.isGroup) return c;
                    if (!c.memberIds?.includes(uid)) return c;
                    return { ...c, online: p.is_online };
                }));
            }),

            subscribe('messenger.scheduled_ready', () => undefined),
        ];

        return () => unsubs.forEach(unsub => unsub());
    }, [subscribe, myID]);

    const openDraftChat = useCallback<Ctx['openDraftChat']>((target) => {
        const userIdStr = String(target.userId);
        const existingReal = contacts.find(
            c => !c.isGroup && !isDraftId(c.id) && c.memberIds?.length === 1 && c.memberIds[0] === userIdStr
        );
        if (existingReal) return existingReal.id;
        const draftId = `${DRAFT_PREFIX}${userIdStr}`;
        if (contacts.some(c => c.id === draftId)) return draftId;

        setContacts(prev => [
            {
                id: draftId,
                name: target.name,
                preview: '',
                time: '',
                avatar: target.avatar,
                isGroup: false,
                memberIds: [userIdStr],
                read: true,
            },
            ...prev,
        ]);

        return draftId;
    }, [contacts]);

    const sendPayload = useCallback<Ctx['sendPayload']>(async (chatId, payload) => {
        let realChatId = chatId;

        // Черновик — диалога на бэке ещё нет, создаём его прямо сейчас
        if (isDraftId(chatId)) {
            const targetUserId = Number(chatId.slice(DRAFT_PREFIX.length));
            try {
                const res = await messengerApi.getOrCreateDirect(targetUserId);
                const contact = mapConversation(res.data, myID);
                realChatId = contact.id;

                setContacts(prev => [
                    contact,
                    ...prev.filter(c => c.id !== chatId && c.id !== contact.id),
                ]);
                setMessages(prev => {
                    const draftMsgs = prev[chatId] ?? [];
                    const { [chatId]: _omit, ...rest } = prev;
                    return { ...rest, [contact.id]: draftMsgs };
                });
                loadedConvs.current.delete(chatId);
                loadedConvs.current.add(contact.id);
            } catch (err) {
                console.error('[messenger] failed to materialize draft chat', err);
                return chatId; // не удалось создать диалог — остаёмся в черновике
            }
        }

        const text = (payload.text ?? '').trim();

        const tempId = `optimistic-${Date.now()}`;
        const optimistic: Message = {
            id: tempId,
            senderId: String(myID),
            senderName: user?.full_name || 'Вы',
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            isOwn: true,
            images: payload.images,
            files: payload.files,
            replyTo: payload.replyTo,
            forwardedFrom: payload.forwardedFrom,
        };

        setMessages(prev => ({ ...prev, [realChatId]: [...(prev[realChatId] ?? []), optimistic] }));
        setContacts(prev => prev.map(c =>
            c.id === realChatId
                ? {
                    ...c,
                    preview: `Вы: ${text || (payload.images?.length ? '🖼 Фото' : payload.files?.length ? '📎 Файл' : '')}`,
                    time: optimistic.time,
                    read: true,
                    unread: undefined,
                }
                : c
        ));

        clearTimeout(typingTimersRef.current[realChatId]);
        messengerApi.setTyping(Number(realChatId), false).catch(() => {});

        try {
            const rawFiles = [...(payload.imageFiles ?? []), ...(payload.attachmentFiles ?? [])];
            let attachmentKeys: string[] | undefined;

            if (rawFiles.length) {
                const uploaded = await Promise.all(
                    rawFiles.map(file => messengerApi.uploadAttachment(file))
                );
                attachmentKeys = uploaded.map(res => res.data.storage_key);
            }

            const res = await messengerApi.sendMessage(
                Number(realChatId),
                text,
                payload.replyToId ? Number(payload.replyToId) : undefined,
                attachmentKeys,
            );
            const confirmed = mapMessage(res.data, myID);
            setMessages(prev => ({
                ...prev,
                [realChatId]: (prev[realChatId] ?? []).map(m => m.id === tempId ? confirmed : m),
            }));
        } catch (err) {
            console.error('[messenger] send failed', err);
            setMessages(prev => ({
                ...prev,
                [realChatId]: (prev[realChatId] ?? []).filter(m => m.id !== tempId),
            }));
        }

        return realChatId;
    }, [myID, user]);

    const sendMessage = useCallback<Ctx['sendMessage']>((chatId, text, replyTo) => {
        sendPayload(chatId, { text, replyTo });
    }, [sendPayload]);

    const notifyTyping = useCallback((chatId: string) => {
        if (!chatId || isDraftId(chatId)) return;

        if (!typingTimersRef.current[chatId]) {
            messengerApi.setTyping(Number(chatId), true).catch(() => {});
        }

        clearTimeout(typingTimersRef.current[chatId]);
        typingTimersRef.current[chatId] = setTimeout(() => {
            delete typingTimersRef.current[chatId];
            messengerApi.setTyping(Number(chatId), false).catch(() => {});
        }, TYPING_IDLE_MS);
    }, []);

    const toggleReaction = useCallback(async (chatId: string, messageId: string, emoji: string) => {
        const msg = (messages[chatId] ?? []).find(m => m.id === messageId);
        if (!msg) return;

        const existing = msg.reactions?.find(r => r.emoji === emoji);
        const wasReacted = existing?.reactedByMe ?? false;

        const applyOptimistic = (reactions: ReactionSummary[] = []): ReactionSummary[] => {
            const idx = reactions.findIndex(r => r.emoji === emoji);
            if (wasReacted) {
                if (idx === -1) return reactions;
                const count = reactions[idx].count - 1;
                const next = [...reactions];
                if (count <= 0) next.splice(idx, 1);
                else next[idx] = { ...next[idx], count, reactedByMe: false };
                return next;
            }
            if (idx === -1) return [...reactions, { emoji, count: 1, reactedByMe: true }];
            const next = [...reactions];
            next[idx] = { ...next[idx], count: next[idx].count + 1, reactedByMe: true };
            return next;
        };

        setMessages(prev => ({
            ...prev,
            [chatId]: (prev[chatId] ?? []).map(m =>
                m.id === messageId ? { ...m, reactions: applyOptimistic(m.reactions) } : m
            ),
        }));

        try {
            if (wasReacted) {
                await messengerApi.removeReaction(Number(messageId), emoji);
            } else {
                await messengerApi.addReaction(Number(messageId), emoji);
            }
        } catch (err) {
            console.error('[messenger] reaction failed', err);
            loadedConvs.current.delete(chatId);
            loadMessages(chatId);
        }
    }, [messages, loadMessages]);

    const pinMessage = useCallback<Ctx['pinMessage']>(async (chatId, messageId) => {
        const msg = (messages[chatId] ?? []).find(m => m.id === messageId);
        const isPinned = msg?.pinned ?? false;

        // Optimistic toggle
        setMessages(prev => ({
            ...prev,
            [chatId]: (prev[chatId] ?? []).map(m =>
                m.id === messageId ? { ...m, pinned: !isPinned } : m
            ),
        }));

        try {
            if (isPinned) {
                await messengerApi.unpinMessage(Number(messageId));
            } else {
                await messengerApi.pinMessage(Number(messageId));
            }
            // WS event (messenger.message_pinned/unpinned) подтвердит финальное состояние
        } catch (err) {
            console.error('[messenger] pin failed', err);
            // Revert
            setMessages(prev => ({
                ...prev,
                [chatId]: (prev[chatId] ?? []).map(m =>
                    m.id === messageId ? { ...m, pinned: isPinned } : m
                ),
            }));
        }
    }, [messages]);

    const deleteMessage = useCallback<Ctx['deleteMessage']>(async (chatId, messageId) => {
        // Optimistic — бэкенд не пушит WS событие удаления, только HTTP
        setMessages(prev => ({
            ...prev,
            [chatId]: (prev[chatId] ?? []).filter(m => m.id !== messageId),
        }));
        try {
            await messengerApi.deleteMessage(Number(messageId));
        } catch (err) {
            console.error('[messenger] delete failed', err);
            // Reload to restore
            loadedConvs.current.delete(chatId);
            loadMessages(chatId);
        }
    }, [loadMessages]);

    const forwardMessage = useCallback<Ctx['forwardMessage']>(async (_, messageId, targetChatIds) => {
        try {
            await messengerApi.forwardMessage(Number(messageId), targetChatIds.map(Number));
            for (const cid of targetChatIds) {
                loadedConvs.current.delete(cid);
                await loadMessages(cid);
            }
        } catch (err) {
            console.error('[messenger] forward failed', err);
        }
    }, [loadMessages]);

    const createChat = useCallback<Ctx['createChat']>(async (input: CreateChatInput): Promise<string> => {
        try {
            let conv: ApiConversation;
            if (input.isGroup) {
                const res = await messengerApi.createGroup(
                    input.name,
                    input.description ?? '',
                    (input.memberIds ?? []).map(Number).filter(Boolean),
                );
                conv = res.data;
            } else {
                const targetID = Number(input.memberIds?.[0]);
                if (!targetID) return '';
                const res = await messengerApi.getOrCreateDirect(targetID);
                conv = res.data;
            }
            const contact = mapConversation(conv, myID);
            setContacts(prev => [contact, ...prev.filter(c => c.id !== contact.id)]);
            setMessages(prev => ({ ...prev, [contact.id]: [] }));
            return contact.id;
        } catch (err) {
            console.error('[messenger] createChat failed', err);
            return '';
        }
    }, [myID]);

    const ensureLoaded = useCallback((chatId: string) => {
        if (chatId) loadMessages(chatId);
    }, [loadMessages]);

    const getMembers = useCallback<Ctx['getMembers']>((chatId) => {
        const c = contacts.find(x => x.id === chatId);
        if (!c) return [];
        return (c.memberIds ?? []).map(id => ({ id, name: 'Участник', avatar: '', status: 'неизвестно' }));
    }, [contacts]);

    const getMediaFromChat = useCallback<Ctx['getMediaFromChat']>((chatId) => {
        const out: string[] = [];
        (messages[chatId] ?? []).forEach(m => m.images?.forEach(i => out.push(i)));
        return out;
    }, [messages]);

    const getFilesFromChat = useCallback<Ctx['getFilesFromChat']>((chatId) => {
        const out: MessageFile[] = [];
        (messages[chatId] ?? []).forEach(m => m.files?.forEach(f => out.push(f)));
        return out;
    }, [messages]);

    const getPinnedFromChat = useCallback<Ctx['getPinnedFromChat']>((chatId) =>
            (messages[chatId] ?? []).filter(m => m.pinned),
        [messages]
    );

    // ── Context value ─────────────────────────────────────────────────────────

    const value = useMemo<Ctx>(() => ({
        contacts,
        messages,
        typing,
        availableMembers,
        activeChatId,
        toggleReaction,
        setActiveChat,
        sendMessage,
        sendPayload,
        notifyTyping,
        pinMessage,
        forwardMessage,
        deleteMessage,
        createChat,
        openDraftChat,
        getMembers,
        getMediaFromChat,
        getFilesFromChat,
        getPinnedFromChat,
        ensureLoaded,
    }), [
        contacts, messages, typing, availableMembers, activeChatId,
        sendMessage, sendPayload, notifyTyping, pinMessage, forwardMessage, deleteMessage, setActiveChat,
        createChat, openDraftChat, getMembers, getMediaFromChat, getFilesFromChat, getPinnedFromChat, toggleReaction,
        ensureLoaded,
    ]);

    return (
        <MessengerContext.Provider value={value}>
            {children}
        </MessengerContext.Provider>
    );
};