import { useEffect, useRef, useState } from "react";
import {
    X, Phone, MoreHorizontal, Plus, Mic, Send, Reply as ReplyIcon,
    Paperclip, Video, BadgeCheck, Pin, Forward as ForwardIcon,
    Image as ImageIcon, FileText, Search, LayoutPanelLeft, CheckCheck,
} from "lucide-react";
import { type ChatContact, type Message, type MessageFile } from "@/context/messenger-context";
import { useMessenger } from "@/hooks/use-messenger";
import AudioMessage from "@/components/messenger/AudioMessage";
import VideoMessage from "@/components/messenger/VideoMessage";
import LinkPreview, { extractUrls } from "@/components/messenger/LinkPreview";
import TypingIndicator from "@/components/messenger/TypingIndicator";
import MessageContextMenu from "@/components/messenger/MessageContextMenu";
import EmojiPicker from "@/components/messenger/EmojiPicker";
import FileAttachment from "@/components/messenger/FileAttachment";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "./ConversationList";

const readAsDataURL = (file: File) =>
    new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = reject;
        r.readAsDataURL(file);
    });

const isLastInGroup = (msgs: Message[], i: number) => {
    const m = msgs[i], n = msgs[i + 1];
    if (!n) return true;
    return n.senderId !== m.senderId || n.date !== m.date;
};

const bubbleRadius = (m: Message, last: boolean) => {
    if (!last) return "18px";
    return m.isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px";
};

interface Props {
    active: ChatContact;
    onClose: () => void;
    onToggleInfo: () => void;
    infoOpen: boolean;
    onStartCall: (type: "voice" | "video") => void;
    onForward: (msgId: string) => void;
}

export const ChatWindow = ({ active, onClose, onToggleInfo, infoOpen, onStartCall, onForward }: Props) => {
    const { messages, typing, sendPayload, notifyTyping, pinMessage, deleteMessage, likeMessage } = useMessenger();

    const chatMessages = messages[active.id] ?? [];
    const isTyping = typing.has(active.id);
    const pinnedMessages = chatMessages.filter(m => m.pinned);

    const [text, setText] = useState("");
    const [replyTo, setReplyTo] = useState<{ id: string; senderName: string; text: string } | null>(null);
    const [pendingImages, setPendingImages] = useState<string[]>([]);
    const [pendingImageFiles, setPendingImageFiles] = useState<File[]>([]);
    const [pendingFiles, setPendingFiles] = useState<MessageFile[]>([]);
    const [pendingAttachmentFiles, setPendingAttachmentFiles] = useState<File[]>([]);

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const endRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages.length, isTyping, active.id]);

    useEffect(() => {
        const ta = inputRef.current;
        if (!ta) return;
        ta.style.height = "auto";
        ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
    }, [text]);

    const handleSend = () => {
        const t = text.trim();
        if (!t && pendingImages.length === 0 && pendingFiles.length === 0) return;
        sendPayload(active.id, {
            text: t,
            images: pendingImages.length ? pendingImages : undefined,
            files: pendingFiles.length ? pendingFiles : undefined,
            imageFiles: pendingImageFiles.length ? pendingImageFiles : undefined,
            attachmentFiles: pendingAttachmentFiles.length ? pendingAttachmentFiles : undefined,
            replyTo: replyTo ?? undefined,
            replyToId: replyTo?.id,
        });
        setText("");
        setReplyTo(null);
        setPendingImages([]);
        setPendingImageFiles([]);
        setPendingFiles([]);
        setPendingAttachmentFiles([]);
    };

    const handlePickImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;
        const urls = await Promise.all(files.map(readAsDataURL));
        setPendingImages(p => [...p, ...urls]);
        setPendingImageFiles(p => [...p, ...files]);
        e.target.value = "";
    };

    const handlePickFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;
        const items: MessageFile[] = await Promise.all(
            files.map(async f => ({
                name: f.name,
                size: f.size,
                mime: f.type,
                url: await readAsDataURL(f),
            }))
        );
        setPendingFiles(p => [...p, ...items]);
        setPendingAttachmentFiles(p => [...p, ...files]);
        e.target.value = "";
    };

    const removePendingImage = (index: number) => {
        setPendingImages(p => p.filter((_, j) => j !== index));
        setPendingImageFiles(p => p.filter((_, j) => j !== index));
    };

    const removePendingFile = (index: number) => {
        setPendingFiles(p => p.filter((_, j) => j !== index));
        setPendingAttachmentFiles(p => p.filter((_, j) => j !== index));
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        if (e.target.value.trim()) {
            notifyTyping(active.id);
        }
    };

    let lastDate = "";

    return (
        <>
            {/* Header */}
            <div className="h-14 px-4 flex items-center gap-3 border-b border-border/60">
                <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-foreground/70"
                    aria-label="Закрыть чат"
                >
                    <X className="w-5 h-5" />
                </button>
                <button onClick={onToggleInfo} className="flex items-center gap-3 min-w-0 text-left flex-1">
                    <Avatar c={active} size={36} />
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-[14px] truncate">{active.name}</span>
                            {active.verified && <BadgeCheck className="w-4 h-4 text-primary fill-primary/20" />}
                        </div>
                        <p className="text-[12px] text-muted-foreground truncate">
                            {isTyping
                                ? "печатает…"
                                : active.isVK ? "Сервисные уведомления" : active.online ? "в сети" : "был(а) недавно"}
                        </p>
                    </div>
                </button>
                <div className="ml-auto flex items-center gap-1 text-foreground/70">
                    <button onClick={() => onStartCall("voice")} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary" aria-label="Аудиозвонок">
                        <Phone className="w-4.5 h-4.5" />
                    </button>
                    <button onClick={() => onStartCall("video")} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary" aria-label="Видеозвонок">
                        <Video className="w-4.5 h-4.5" />
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary" aria-label="Поиск">
                        <Search className="w-4.5 h-4.5" />
                    </button>
                    <button
                        onClick={onToggleInfo}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary ${infoOpen ? "bg-secondary" : ""}`}
                        aria-label="Информация о чате"
                    >
                        <LayoutPanelLeft className="w-4.5 h-4.5" />
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary" aria-label="Ещё">
                        <MoreHorizontal className="w-4.5 h-4.5" />
                    </button>
                </div>
            </div>

            {/* Pinned message banner */}
            {pinnedMessages.length > 0 && (
                <div className="px-4 py-2 border-b border-border/60 bg-secondary/30 flex items-center gap-3">
                    <Pin className="w-4 h-4 text-primary shrink-0" />
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-primary">
                            Закреплённое сообщение{pinnedMessages.length > 1 ? ` · ${pinnedMessages.length}` : ""}
                        </p>
                        <p className="text-[12.5px] truncate text-foreground/80">
                            <span className="font-medium">{pinnedMessages[pinnedMessages.length - 1].senderName}: </span>
                            {pinnedMessages[pinnedMessages.length - 1].text || "Вложение"}
                        </p>
                    </div>
                    <button
                        onClick={() => pinMessage(active.id, pinnedMessages[pinnedMessages.length - 1].id)}
                        className="p-1 hover:bg-secondary rounded-md text-muted-foreground shrink-0"
                        aria-label="Открепить"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
                {chatMessages.length === 0 && !isTyping && (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-muted-foreground">Нет сообщений. Напишите первым 👋</p>
                    </div>
                )}
                {chatMessages.map((msg, idx) => {
                    const showDate = msg.date && msg.date !== lastDate;
                    if (msg.date) lastDate = msg.date;
                    const last = isLastInGroup(chatMessages, idx);
                    const urls = extractUrls(msg.text);
                    const prev = chatMessages[idx - 1];
                    const showName = !msg.isOwn && (last || prev?.senderId !== msg.senderId);

                    return (
                        <div key={msg.id}>
                            {showDate && (
                                <div className="flex justify-center my-3">
                                    <span className="text-[11px] text-muted-foreground bg-secondary px-3 py-1 rounded-full">{msg.date}</span>
                                </div>
                            )}
                            <div className={`flex ${msg.isOwn ? "justify-end" : "justify-start"} items-end gap-2`}>
                                {!msg.isOwn && (
                                    <div className="w-7 shrink-0">
                                        {last && (
                                            <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                                                <span className="text-[11px] font-semibold text-foreground/70">
                                                    {msg.senderName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className={`max-w-[72%] flex flex-col ${msg.isOwn ? "items-end" : "items-start"}`}>
                                    {showName && (
                                        <span className="text-[11px] text-primary font-semibold mb-0.5 ml-1">{msg.senderName}</span>
                                    )}
                                    <MessageContextMenu
                                        messageText={msg.text}
                                        senderName={msg.senderName}
                                        isOwn={msg.isOwn}
                                        isPinned={msg.pinned}
                                        isLiked={msg.likedByMe}
                                        likesCount={msg.likesCount}
                                        onReply={() => setReplyTo({ id: msg.id, senderName: msg.senderName, text: msg.text })}
                                        onPin={() => pinMessage(active.id, msg.id)}
                                        onDelete={() => deleteMessage(active.id, msg.id)}
                                        onForward={() => onForward(msg.id)}
                                        onLike={() => likeMessage(active.id, msg.id)}
                                    >
                                        <div
                                            className={`px-3 py-2 text-[13.5px] ${
                                                msg.isOwn
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-secondary text-foreground"
                                            }`}
                                            style={{ borderRadius: bubbleRadius(msg, last) }}
                                        >
                                            {msg.pinned && (
                                                <div className={`flex items-center gap-1 mb-1 text-[10px] ${msg.isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                                    <Pin size={10} />
                                                    <span>Закреплено</span>
                                                </div>
                                            )}
                                            {msg.forwardedFrom && (
                                                <div className={`flex items-center gap-1.5 mb-1 text-[11px] ${msg.isOwn ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                                    <ForwardIcon size={12} />
                                                    <span>Переслано от <span className="font-semibold">{msg.forwardedFrom}</span></span>
                                                </div>
                                            )}
                                            {msg.replyTo && (
                                                <div className={`mb-1.5 px-2 py-1 rounded border-l-[3px] ${
                                                    msg.isOwn ? "border-primary-foreground/60 bg-primary-foreground/10" : "border-primary bg-background/60"
                                                }`}>
                                                    <p className={`text-xs font-semibold truncate ${msg.isOwn ? "text-primary-foreground" : "text-primary"}`}>
                                                        {msg.replyTo.senderName}
                                                    </p>
                                                    <p className={`text-xs truncate ${msg.isOwn ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                                        {msg.replyTo.text || "Медиа"}
                                                    </p>
                                                </div>
                                            )}
                                            {msg.audio && <AudioMessage url={msg.audio.url} duration={msg.audio.duration} isOwn={msg.isOwn} />}
                                            {msg.video && <VideoMessage url={msg.video.url} thumbnail={msg.video.thumbnail} duration={msg.video.duration} />}
                                            {msg.text && (
                                                <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap wrap-break-word">{msg.text}</p>
                                            )}
                                            {urls.map((u, i) => <LinkPreview key={i} url={u} isOwn={msg.isOwn} />)}
                                            {msg.images && (
                                                <div className="grid grid-cols-2 gap-1 mt-2 rounded-lg overflow-hidden">
                                                    {msg.images.slice(0, 4).map((img, i) => (
                                                        <img key={i} src={img} alt="" className="w-full h-35 object-cover" />
                                                    ))}
                                                </div>
                                            )}
                                            {msg.files?.map((f, i) => (
                                                <FileAttachment key={i} file={f} isOwn={msg.isOwn} />
                                            ))}
                                            <div className={`flex items-center gap-1 justify-end mt-1 ${msg.isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                                {(msg.likesCount ?? 0) > 0 && (
                                                    <button
                                                        onClick={() => likeMessage(active.id, msg.id)}
                                                        className={`flex items-center gap-0.5 text-[10.5px] transition-colors ${
                                                            msg.likedByMe
                                                                ? "text-red-500"
                                                                : msg.isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                                                        }`}
                                                    >
                                                        ❤️ {msg.likesCount}
                                                    </button>
                                                )}
                                                <span className="text-[10.5px]">{msg.time}</span>
                                                {msg.isOwn && <CheckCheck size={14} />}
                                            </div>
                                        </div>
                                    </MessageContextMenu>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {isTyping && <TypingIndicator name={active.name} />}
                <div ref={endRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-border/60">
                {/* Pending attachments preview */}
                {(pendingImages.length > 0 || pendingFiles.length > 0) && (
                    <div className="px-4 pt-2 flex flex-wrap gap-2">
                        {pendingImages.map((src, i) => (
                            <div key={`img-${i}`} className="relative w-16 h-16 rounded-lg overflow-hidden bg-secondary">
                                <img src={src} alt="" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => removePendingImage(i)}
                                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-background/80 flex items-center justify-center text-foreground hover:bg-background"
                                    aria-label="Удалить"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        ))}
                        {pendingFiles.map((f, i) => (
                            <div key={`f-${i}`} className="relative flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-secondary max-w-55">
                                <FileText size={16} className="text-primary shrink-0" />
                                <span className="text-xs truncate">{f.name}</span>
                                <button
                                    onClick={() => removePendingFile(i)}
                                    className="shrink-0 text-muted-foreground hover:text-foreground"
                                    aria-label="Удалить"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Reply bar */}
                {replyTo && (
                    <div className="flex items-center gap-2 px-4 pt-2">
                        <div className="flex-1 flex items-stretch gap-2 bg-secondary/60 rounded-lg overflow-hidden border-l-[3px] border-primary px-3 py-1.5">
                            <ReplyIcon size={16} className="text-primary mt-0.5 shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-primary truncate">Ответ {replyTo.senderName}</p>
                                <p className="text-xs text-muted-foreground truncate">{replyTo.text || "Медиа"}</p>
                            </div>
                            <button
                                onClick={() => setReplyTo(null)}
                                className="p-1 hover:bg-secondary rounded-md text-muted-foreground self-center"
                                aria-label="Отменить ответ"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Composer */}
                <div className="flex items-end gap-2 px-4 py-3">
                    <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePickImages} />
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handlePickFiles} />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0"
                                aria-label="Прикрепить"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" side="top" className="w-44">
                            <DropdownMenuItem onClick={() => imageInputRef.current?.click()} className="gap-2 cursor-pointer">
                                <ImageIcon size={16} className="text-primary" /> Фото или видео
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="gap-2 cursor-pointer">
                                <FileText size={16} className="text-primary" /> Документ
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-8 h-8 flex items-center justify-center text-foreground/70 hover:text-foreground rounded-lg hover:bg-secondary"
                        aria-label="Прикрепить файл"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>

                    <textarea
                        ref={inputRef}
                        rows={1}
                        value={text}
                        onChange={handleTextChange}
                        onKeyDown={e => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder={replyTo ? `Ответить ${replyTo.senderName}…` : "Сообщение"}
                        className="flex-1 resize-none bg-secondary rounded-2xl px-4 py-2 text-[14px] leading-5 placeholder:text-muted-foreground focus:outline-none max-h-40"
                    />

                    <EmojiPicker onSelect={e => setText(p => p + e)} />

                    {(text.trim() || pendingImages.length || pendingFiles.length) ? (
                        <button
                            onClick={handleSend}
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                            aria-label="Отправить"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    ) : (
                        <button className="w-8 h-8 flex items-center justify-center text-foreground/70 hover:text-foreground rounded-lg hover:bg-secondary" aria-label="Голосовое сообщение">
                            <Mic className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};