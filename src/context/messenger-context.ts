import { createContext } from "react";

export interface MessageFile {
    name: string;
    size: number;
    url: string;
    mime?: string;
}

export interface ReactionSummary {
    emoji: string;
    count: number;
    reactedByMe: boolean;
}

export interface Message {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    time: string;
    date?: string;
    isOwn?: boolean;
    images?: string[];
    files?: MessageFile[];
    audio?: { url: string; duration: string };
    video?: { url: string; thumbnail: string; duration: string };
    replyTo?: { senderName: string; text: string };
    pinned?: boolean;
    forwardedFrom?: string;
    reactions?: ReactionSummary[];
    deliveryStatus?: string;
    call?: {
        callType: "voice" | "video";
        status: "ended" | "missed" | "declined";
        durationSeconds: number;
    };
}

export interface ChatContact {
    id: string;
    name: string;
    preview: string;
    time: string;
    avatar?: string;
    unread?: number;
    pinned?: boolean;
    online?: boolean;
    verified?: boolean;
    isVK?: boolean;
    read?: boolean;
    isGroup?: boolean;
    description?: string;
    memberIds?: string[];
}

export interface AvailableMember {
    id: string;
    name: string;
    avatar: string;
    status: string;
    online?: boolean;
}

export interface CreateChatInput {
    name: string;
    isGroup: boolean;
    memberIds?: string[];
    avatar?: string;
    description?: string;
}

export interface SendPayload {
    text?: string;
    images?: string[];
    files?: MessageFile[];
    imageFiles?: File[];
    attachmentFiles?: File[];
    replyToId?: string;
    replyTo?: { senderName: string; text: string };
    forwardedFrom?: string;
}

/** Минимальные данные о собеседнике, нужные для открытия черновика direct-чата. */
export interface DraftChatTarget {
    userId: number;
    name: string;
    avatar?: string;
}

export interface Ctx {
    contacts: ChatContact[];
    messages: Record<string, Message[]>;
    typing: Set<string>;
    availableMembers: AvailableMember[];
    activeChatId: string | null;
    setActiveChat: (chatId: string | null) => void;
    toggleReaction: (chatId: string, messageId: string, emoji: string) => void;
    sendMessage: (chatId: string, text: string, replyTo?: { senderName: string; text: string }) => void;
    /**
     * Отправляет сообщение. Если chatId — id черновика (draft:<userId>),
     * перед отправкой создаёт реальный conversation на бэкенде и возвращает
     * его настоящий id; иначе возвращает тот же chatId, что был передан.
     */
    sendPayload: (chatId: string, payload: SendPayload) => Promise<string>;
    pinMessage: (chatId: string, messageId: string) => void;
    notifyTyping: (chatId: string) => void;
    forwardMessage: (sourceChatId: string, messageId: string, targetChatIds: string[]) => void;
    deleteMessage: (chatId: string, messageId: string) => void;
    createChat: (input: CreateChatInput) => Promise<string>;
    /**
     * Открывает локальный черновик direct-чата с пользователем без обращения
     * к бэкенду. Если direct-диалог (или черновик) с этим пользователем уже
     * есть среди contacts — возвращает его id вместо создания нового.
     * Реальный conversation создаётся позже, при первой отправке сообщения
     * (см. sendPayload).
     */
    openDraftChat: (target: DraftChatTarget) => string;
    getMembers: (chatId: string) => AvailableMember[];
    getMediaFromChat: (chatId: string) => string[];
    getFilesFromChat: (chatId: string) => MessageFile[];
    getPinnedFromChat: (chatId: string) => Message[];
    ensureLoaded: (chatId: string) => void;
}

export const MessengerContext = createContext<Ctx | null>(null);