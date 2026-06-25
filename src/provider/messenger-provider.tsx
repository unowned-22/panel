import { type ReactNode, useCallback, useMemo, useState } from "react";
import { MessengerContext } from "@/context/messenger-context";
import type { AvailableMember, ChatContact, Message, MessageFile, SendPayload, Ctx } from "@/context/messenger-context";

const CURRENT_USER = { id: "self", name: "Вы" };

const nowTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

const initialContacts: ChatContact[] = [
    { id: "vk", name: "ВКонтакте", preview: "Совершён вход в ваш аккаунт · 1д", time: "", verified: true, isVK: true },
    { id: "family", name: "❤️ Family chat", preview: "Thanks to all of you 🙌", time: "12:56", unread: 4, read: true, isGroup: true, avatar: "https://i.pravatar.cc/100?img=58" },
    { id: "leah", name: "Leah Collins", preview: "Do you have any vacation pla…", time: "10:45", online: true, pinned: true, avatar: "https://i.pravatar.cc/100?img=47" },
    { id: "curry", name: "Curry Club — Ninjas fr…", preview: "Вы: Primavera Sound 2021…", time: "10:48", read: true, pinned: true, isGroup: true, avatar: "https://i.pravatar.cc/100?img=65", memberIds: ["m2", "m3", "m4"] },
    { id: "mamie", name: "Mamie Cruz", preview: "Do you have any pets? 🐶", time: "16:20", online: true, pinned: true, avatar: "https://i.pravatar.cc/100?img=26" },
    { id: "telegraf", name: "Telegraf.Design", preview: "You might miss this last week…", time: "18:20", unread: 1, avatar: "https://i.pravatar.cc/100?img=12" },
    { id: "evan", name: "Evan West", preview: "What do you think the best invent…", time: "17:22", online: true, avatar: "https://i.pravatar.cc/100?img=53" },
    { id: "nannie", name: "Nannie Watts", preview: "Let's meet around 14:00 near the…", time: "17:11", avatar: "https://i.pravatar.cc/100?img=45" },
    { id: "vicente", name: "Vicente de la Cruz", preview: "A new font type is awesome, let's…", time: "15:36", read: true, avatar: "https://i.pravatar.cc/100?img=33" },
    { id: "kari", name: "Kari Granleese", preview: "I need your advice", time: "14:21", avatar: "https://i.pravatar.cc/100?img=32" },
];

const availableMembersList: AvailableMember[] = [
    { id: "m2", name: "Alex Djos", avatar: "https://i.pravatar.cc/100?img=11", status: "в сети", online: true },
    { id: "m3", name: "Michael Borisov", avatar: "https://i.pravatar.cc/100?img=15", status: "был(а) недавно" },
    { id: "m4", name: "Sofia Lee", avatar: "https://i.pravatar.cc/100?img=23", status: "в сети", online: true },
    { id: "leah", name: "Leah Collins", avatar: "https://i.pravatar.cc/100?img=47", status: "в сети", online: true },
    { id: "mamie", name: "Mamie Cruz", avatar: "https://i.pravatar.cc/100?img=26", status: "в сети", online: true },
    { id: "evan", name: "Evan West", avatar: "https://i.pravatar.cc/100?img=53", status: "был(а) 2ч назад" },
    { id: "nannie", name: "Nannie Watts", avatar: "https://i.pravatar.cc/100?img=45", status: "был(а) вчера" },
    { id: "vicente", name: "Vicente de la Cruz", avatar: "https://i.pravatar.cc/100?img=33", status: "был(а) недавно" },
    { id: "kari", name: "Kari Granleese", avatar: "https://i.pravatar.cc/100?img=32", status: "в сети", online: true },
];

const seedMessages: Record<string, Message[]> = {
    vk: [
        {
            id: "v1", senderId: "vk", senderName: "ВКонтакте",
            text: "Для вашей страницы запрошено восстановление доступа. Никому не сообщайте номер телефона, с которого поступит проверочный звонок!",
            time: "18:40", date: "29 апреля 2026",
        },
        {
            id: "v2", senderId: "vk", senderName: "ВКонтакте",
            text: "Совершён вход в ваш аккаунт. Дата входа: 21 апреля 2026 в 14:11. Устройство: Safari. Если это не вы — срочно смените пароль.",
            time: "14:11", date: "вчера",
        },
    ],
    curry: [
        {
            id: "c1", senderId: "m2", senderName: "Alex Djos",
            text: "Curry Club, ready for the Barcelona trip this summer? Photos from Pukkelpop fest 🙌⛺",
            time: "10:32", date: "28 ноября 2025",
            images: [
                "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=300&fit=crop",
            ],
        },
        {
            id: "c2", senderId: "m2", senderName: "Alex Djos",
            text: "Check this out: https://www.youtube.com/watch?v=V6fFHS_ytWw",
            time: "10:45", date: "28 ноября 2025",
        },
        {
            id: "c3", senderId: "m3", senderName: "Michael Borisov",
            text: "", time: "10:46", date: "28 ноября 2025",
            audio: { url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", duration: "0:42" },
        },
        {
            id: "c5", senderId: "m4", senderName: "Sofia Lee",
            text: "Бронь отеля во вложении 📎", time: "10:47", date: "28 ноября 2025",
            files: [{ name: "Barcelona_hotel.pdf", size: 248_320, url: "#", mime: "application/pdf" }],
        },
        {
            id: "c4", senderId: "self", senderName: "Вы",
            text: "Primavera Sound 2021 tickets bought!", time: "10:48", isOwn: true, date: "2 декабря 2025",
        },
    ],
};

const BOT_REPLIES = ["Понял! 👍", "Класс 🔥", "Окей, договорились", "Жду", "Хаха 😄", "Звучит супер 🙌"];
const BOTS: Record<string, { id: string; name: string }[]> = {
    curry: [
        { id: "m2", name: "Alex Djos" },
        { id: "m3", name: "Michael Borisov" },
    ],
};

const previewFromPayload = (p: SendPayload): string => {
    if (p.text) return `Вы: ${p.text}`;
    if (p.images?.length) return `Вы: 🖼️ Фото${p.images.length > 1 ? ` (${p.images.length})` : ""}`;
    if (p.files?.length) return `Вы: 📎 ${p.files[0].name}`;
    return "Вы:";
};

export const MessengerProvider = ({ children }: { children: ReactNode }) => {
    const [contacts, setContacts] = useState<ChatContact[]>(initialContacts);
    const [messages, setMessages] = useState<Record<string, Message[]>>(seedMessages);
    const [typing, setTyping] = useState<Set<string>>(new Set());

    const triggerBot = useCallback((chatId: string) => {
        const bots = BOTS[chatId];
        if (!bots) return;
        setTyping((s) => new Set(s).add(chatId));
        const bot = bots[Math.floor(Math.random() * bots.length)];
        setTimeout(() => {
            const reply = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];
            const t = nowTime();
            const botMsg: Message = {
                id: `m-${Date.now()}-b`,
                senderId: bot.id,
                senderName: bot.name,
                text: reply,
                time: t,
            };
            setMessages((p) => ({ ...p, [chatId]: [...(p[chatId] ?? []), botMsg] }));
            setContacts((p) => p.map((c) => (c.id === chatId ? { ...c, preview: reply, time: t, read: false } : c)));
            setTyping((s) => {
                const n = new Set(s);
                n.delete(chatId);
                return n;
            });
        }, 1100 + Math.random() * 1200);
    }, []);

    const sendPayload = useCallback<Ctx["sendPayload"]>((chatId, payload) => {
        const text = (payload.text ?? "").trim();
        if (!text && !payload.images?.length && !payload.files?.length) return;
        const time = nowTime();
        const msg: Message = {
            id: `m-${Date.now()}`,
            senderId: CURRENT_USER.id,
            senderName: CURRENT_USER.name,
            text,
            time,
            isOwn: true,
            images: payload.images,
            files: payload.files,
            replyTo: payload.replyTo,
            forwardedFrom: payload.forwardedFrom,
        };
        setMessages((p) => ({ ...p, [chatId]: [...(p[chatId] ?? []), msg] }));
        setContacts((p) =>
            p.map((c) =>
                c.id === chatId
                    ? { ...c, preview: previewFromPayload({ ...payload, text }), time, read: true, unread: undefined }
                    : c
            )
        );
        triggerBot(chatId);
    }, [triggerBot]);

    const sendMessage = useCallback<Ctx["sendMessage"]>((chatId, text, replyTo) => {
        sendPayload(chatId, { text, replyTo });
    }, [sendPayload]);

    const pinMessage = useCallback<Ctx["pinMessage"]>((chatId, messageId) => {
        setMessages((p) => ({
            ...p,
            [chatId]: (p[chatId] ?? []).map((m) =>
                m.id === messageId ? { ...m, pinned: !m.pinned } : m
            ),
        }));
    }, []);

    const deleteMessage = useCallback<Ctx["deleteMessage"]>((chatId, messageId) => {
        setMessages((p) => ({
            ...p,
            [chatId]: (p[chatId] ?? []).filter((m) => m.id !== messageId),
        }));
    }, []);

    const forwardMessage = useCallback<Ctx["forwardMessage"]>((sourceChatId, messageId, targetChatIds) => {
        const src = (messages[sourceChatId] ?? []).find((m) => m.id === messageId);
        if (!src) return;
        targetChatIds.forEach((cid) => {
            sendPayload(cid, {
                text: src.text,
                images: src.images,
                files: src.files,
                forwardedFrom: src.senderName,
            });
        });
    }, [messages, sendPayload]);

    const createChat = useCallback<Ctx["createChat"]>((input) => {
        const id = `chat-${Date.now()}`;
        const time = nowTime();
        const newContact: ChatContact = {
            id,
            name: input.name,
            preview: input.isGroup ? "Группа создана" : "Чат создан",
            time,
            avatar: input.avatar,
            isGroup: input.isGroup,
            memberIds: input.memberIds,
            description: input.description,
            pinned: false,
        };
        setContacts((p) => [newContact, ...p]);
        setMessages((p) => ({ ...p, [id]: [] }));
        return id;
    }, []);

    const getMembers = useCallback<Ctx["getMembers"]>(
        (chatId) => {
            const c = contacts.find((x) => x.id === chatId);
            if (!c) return [];
            if (c.isGroup) {
                const ids = c.memberIds ?? [];
                return availableMembersList.filter((m) => ids.includes(m.id));
            }
            return [
                {
                    id: c.id,
                    name: c.name,
                    avatar: c.avatar ?? "",
                    status: c.online ? "в сети" : "был(а) недавно",
                    online: c.online,
                },
            ];
        },
        [contacts]
    );

    const getMediaFromChat = useCallback<Ctx["getMediaFromChat"]>(
        (chatId) => {
            const list = messages[chatId] ?? [];
            const out: string[] = [];
            list.forEach((m) => m.images?.forEach((i) => out.push(i)));
            return out;
        },
        [messages]
    );

    const getFilesFromChat = useCallback<Ctx["getFilesFromChat"]>(
        (chatId) => {
            const list = messages[chatId] ?? [];
            const out: MessageFile[] = [];
            list.forEach((m) => m.files?.forEach((f) => out.push(f)));
            return out;
        },
        [messages]
    );

    const getPinnedFromChat = useCallback<Ctx["getPinnedFromChat"]>(
        (chatId) => (messages[chatId] ?? []).filter((m) => m.pinned),
        [messages]
    );

    const value = useMemo(
        () => ({
            contacts,
            messages,
            typing,
            availableMembers: availableMembersList,
            sendMessage,
            sendPayload,
            pinMessage,
            forwardMessage,
            deleteMessage,
            createChat,
            getMembers,
            getMediaFromChat,
            getFilesFromChat,
            getPinnedFromChat,
        }),
        [contacts, messages, typing, sendMessage, sendPayload, pinMessage, forwardMessage, deleteMessage, createChat, getMembers, getMediaFromChat, getFilesFromChat, getPinnedFromChat]
    );

    return <MessengerContext.Provider value={value}>{children}</MessengerContext.Provider>;
};