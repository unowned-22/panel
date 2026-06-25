import { useEffect, useRef, useState } from "react";
import {
    Menu, Search, UserPlus, Archive, PenSquare, Settings, X,
    CheckCheck, Phone, MoreHorizontal, Plus, Mic, Send, Reply as ReplyIcon,
    Paperclip, Video, BadgeCheck, MessageCircleMore, LayoutPanelLeft,
    Image as ImageIcon, FileText, Pin, Forward as ForwardIcon,
} from "lucide-react";
import { useMessenger, type ChatContact, type Message, type MessageFile } from "@/components/MessengerContext";
import AudioMessage from "@/components/messenger/AudioMessage";
import VideoMessage from "@/components/messenger/VideoMessage";
import LinkPreview, { extractUrls } from "@/components/messenger/LinkPreview";
import TypingIndicator from "@/components/messenger/TypingIndicator";
import MessageContextMenu from "@/components/messenger/MessageContextMenu";
import EmojiPicker from "@/components/messenger/EmojiPicker";
import ChatInfoPanel from "@/components/messenger/ChatInfoPanel";
import CreateChatDialog from "@/components/messenger/CreateChatDialog";
import CallScreen from "@/components/messenger/CallScreen";
import FileAttachment from "@/components/messenger/FileAttachment";
import ForwardDialog from "@/components/messenger/ForwardDialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Avatar = ({ c, size = 44 }: { c: ChatContact; size?: number }) => {
    const initial = c.name.replace(/[^\p{L}]/gu, "").charAt(0).toUpperCase() || "?";
    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            {c.isVK ? (
                <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-base">VK</div>
            ) : c.avatar ? (
                <img src={c.avatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
                <div className="w-full h-full rounded-full bg-linear-to-br from-secondary to-accent flex items-center justify-center text-foreground/80 font-semibold">
                    {initial}
                </div>
            )}
            {c.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
            )}
        </div>
    );
};

const isLastInGroup = (msgs: Message[], i: number) => {
    const m = msgs[i], n = msgs[i + 1];
    if (!n) return true;
    return n.senderId !== m.senderId || n.date !== m.date;
};

const bubbleRadius = (m: Message, last: boolean) => {
    if (!last) return "18px";
    return m.isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px";
};

const readAsDataURL = (file: File) =>
    new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = reject;
        r.readAsDataURL(file);
    });

const Messenger = () => {
    const { contacts, messages, typing, sendMessage, sendPayload, pinMessage, deleteMessage } = useMessenger();
    const [activeId, setActiveId] = useState<string>(contacts[0]?.id ?? "");
    const [text, setText] = useState("");
    const [replyTo, setReplyTo] = useState<{ senderName: string; text: string } | null>(null);
    const [pendingImages, setPendingImages] = useState<string[]>([]);
    const [pendingFiles, setPendingFiles] = useState<MessageFile[]>([]);
    const [infoOpen, setInfoOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [call, setCall] = useState<{ type: "voice" | "video" } | null>(null);
    const [forwardMsgId, setForwardMsgId] = useState<string | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const endRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const active = contacts.find((c) => c.id === activeId)!;
    const chatMessages = messages[activeId] ?? [];
    const isTyping = typing.has(activeId);
    const pinnedMessages = chatMessages.filter((m) => m.pinned);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages.length, isTyping, activeId]);

    useEffect(() => {
        const ta = inputRef.current;
        if (!ta) return;
        ta.style.height = "auto";
        ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
    }, [text]);

    const handleSend = () => {
        const t = text.trim();
        if (!t && pendingImages.length === 0 && pendingFiles.length === 0) return;
        sendPayload(activeId, {
            text: t,
            images: pendingImages.length ? pendingImages : undefined,
            files: pendingFiles.length ? pendingFiles : undefined,
            replyTo: replyTo ?? undefined,
        });
        setText("");
        setReplyTo(null);
        setPendingImages([]);
        setPendingFiles([]);
    };

    const handlePickImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;
        const urls = await Promise.all(files.map(readAsDataURL));
        setPendingImages((p) => [...p, ...urls]);
        e.target.value = "";
    };

    const handlePickFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;
        const items: MessageFile[] = await Promise.all(
            files.map(async (f) => ({
                name: f.name,
                size: f.size,
                mime: f.type,
                url: await readAsDataURL(f),
            }))
        );
        setPendingFiles((p) => [...p, ...items]);
        e.target.value = "";
    };

    // unused but kept for type compat with original
    void sendMessage;

    let lastDate = "";

    return (
        <>
            <div className="panel-card overflow-hidden flex h-[calc(100vh-84px)]">
                {/* Chat list */}
                <section className="w-75 shrink-0 border-r border-border flex flex-col">
                    <div className="h-14 px-4 flex items-center justify-between border-b border-border/60">
                        <div className="flex items-center gap-3">
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-foreground/70"><Menu className="w-5 h-5" /></button>
                            <h2 className="font-semibold text-[15px]">Чаты</h2>
                        </div>
                        <div className="flex items-center gap-1 text-foreground/70">
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary"><UserPlus className="w-4.5 h-4.5" /></button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary"><Archive className="w-4.5 h-4.5" /></button>
                            <button onClick={() => setCreateOpen(true)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary" aria-label="Создать чат"><PenSquare className="w-4.5 h-4.5" /></button>
                        </div>
                    </div>

                    <div className="px-3 pt-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input type="text" placeholder="Поиск"
                                   className="w-full h-9 pl-9 pr-3 rounded-lg bg-secondary text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
                        </div>
                        <div className="flex items-center gap-2 mt-3 mb-2">
                            <button className="px-3 py-1 rounded-md bg-accent text-foreground text-[13px] font-medium">Все</button>
                            <button className="px-3 py-1 rounded-md text-muted-foreground text-[13px] font-medium hover:text-foreground">Каналы</button>
                            <button className="ml-auto w-7 h-7 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground"><Settings className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-2">
                        {contacts.map((c) => (
                            <button key={c.id} onClick={() => setActiveId(c.id)}
                                    className={`w-full text-left flex items-start gap-3 px-2 py-2 rounded-lg mb-0.5 transition-colors ${
                                        activeId === c.id ? "bg-accent" : "hover:bg-secondary/60"
                                    }`}>
                                <Avatar c={c} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[13.5px] font-semibold truncate">{c.name}</span>
                                        {c.verified && <BadgeCheck className="w-3.5 h-3.5 text-primary fill-primary/20 shrink-0" />}
                                        {c.read && !c.unread && <CheckCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-auto" />}
                                        {c.time && <span className="text-[11px] text-muted-foreground ml-auto shrink-0">{c.time}</span>}
                                    </div>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <p className="text-[12.5px] text-muted-foreground truncate flex-1">{c.preview}</p>
                                        {c.unread ? (
                                            <span className="shrink-0 min-w-4.5 h-4.5 px-1 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold flex items-center justify-center">
                            {c.unread}
                          </span>
                                        ) : c.pinned ? (
                                            <span className="shrink-0 text-muted-foreground text-xs">📌</span>
                                        ) : null}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="h-12 px-4 flex items-center justify-between border-t border-border/60">
                        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                            <MessageCircleMore className="w-4 h-4" />
                            Только непрочитанные
                        </div>
                        <button className="w-8 h-4 rounded-full bg-secondary relative">
                            <span className="absolute left-0.5 top-0.5 w-3 h-3 rounded-full bg-muted-foreground" />
                        </button>
                    </div>
                </section>

                {/* Chat window */}
                <section className="flex-1 min-w-0 flex flex-col">
                    <div className="h-14 px-4 flex items-center gap-3 border-b border-border/60">
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-foreground/70"><X className="w-5 h-5" /></button>
                        <button onClick={() => setInfoOpen((v) => !v)} className="flex items-center gap-3 min-w-0 text-left flex-1">
                            <Avatar c={active} size={36} />
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-[14px] truncate">{active.name}</span>
                                    {active.verified && <BadgeCheck className="w-4 h-4 text-primary fill-primary/20" />}
                                </div>
                                <p className="text-[12px] text-muted-foreground truncate">
                                    {active.isVK ? "Сервисные уведомления" : active.online ? "в сети" : "был(а) недавно"}
                                </p>
                            </div>
                        </button>
                        <div className="ml-auto flex items-center gap-1 text-foreground/70">
                            <button onClick={() => setCall({ type: "voice" })} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary" aria-label="Аудиозвонок"><Phone className="w-4.5 h-4.5" /></button>
                            <button onClick={() => setCall({ type: "video" })} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary" aria-label="Видеозвонок"><Video className="w-4.5 h-4.5" /></button>
                            <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary"><Search className="w-4.5 h-4.5" /></button>
                            <button onClick={() => setInfoOpen((v) => !v)} className={`w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary ${infoOpen ? "bg-secondary" : ""}`} aria-label="Информация о чате"><LayoutPanelLeft className="w-4.5 h-4.5" /></button>
                            <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary"><MoreHorizontal className="w-4.5 h-4.5" /></button>
                        </div>
                    </div>

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
                                onClick={() => pinMessage(activeId, pinnedMessages[pinnedMessages.length - 1].id)}
                                className="p-1 hover:bg-secondary rounded-md text-muted-foreground shrink-0"
                                aria-label="Открепить"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

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
                                            <span className="text-[11px] text-muted-foreground bg-secondary/60 px-3 py-1 rounded-full">{msg.date}</span>
                                        </div>
                                    )}
                                    <div className={`flex ${msg.isOwn ? "justify-end" : "justify-start"} ${last ? "mb-2" : "mb-0.5"}`}>
                                        <MessageContextMenu
                                            messageText={msg.text}
                                            senderName={msg.senderName}
                                            isOwn={msg.isOwn}
                                            isPinned={msg.pinned}
                                            onReply={(p) => { setReplyTo(p); setTimeout(() => inputRef.current?.focus(), 0); }}
                                            onPin={() => pinMessage(activeId, msg.id)}
                                            onForward={() => setForwardMsgId(msg.id)}
                                            onDelete={() => deleteMessage(activeId, msg.id)}
                                        >
                                            <div
                                                className={`relative max-w-[85%] md:max-w-120 px-4 py-2 ${
                                                    msg.isOwn ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                                                }`}
                                                style={{ borderRadius: bubbleRadius(msg, last) }}
                                            >
                                                {msg.pinned && (
                                                    <Pin
                                                        size={12}
                                                        className={`absolute -top-1.5 ${msg.isOwn ? "-left-1.5" : "-right-1.5"} bg-card rounded-full p-0.5 box-content border border-border text-primary`}
                                                    />
                                                )}
                                                {showName && (
                                                    <p className="text-[13px] font-semibold mb-0.5 text-primary">{msg.senderName}</p>
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
                                                {msg.text && <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap wrap-break-word">{msg.text}</p>}
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
                                                    <span className="text-[10.5px]">{msg.time}</span>
                                                    {msg.isOwn && <CheckCheck size={14} />}
                                                </div>
                                            </div>
                                        </MessageContextMenu>
                                    </div>
                                </div>
                            );
                        })}
                        {isTyping && <TypingIndicator name="Печатает…" />}
                        <div ref={endRef} />
                    </div>


                    <div className="border-t border-border/60">
                        {(pendingImages.length > 0 || pendingFiles.length > 0) && (
                            <div className="px-4 pt-2 flex flex-wrap gap-2">
                                {pendingImages.map((src, i) => (
                                    <div key={`img-${i}`} className="relative w-16 h-16 rounded-lg overflow-hidden bg-secondary">
                                        <img src={src} alt="" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => setPendingImages((p) => p.filter((_, j) => j !== i))}
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
                                            onClick={() => setPendingFiles((p) => p.filter((_, j) => j !== i))}
                                            className="shrink-0 text-muted-foreground hover:text-foreground"
                                            aria-label="Удалить"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {replyTo && (
                            <div className="flex items-center gap-2 px-4 pt-2">
                                <div className="flex-1 flex items-stretch gap-2 bg-secondary/60 rounded-lg overflow-hidden border-l-[3px] border-primary px-3 py-1.5">
                                    <ReplyIcon size={16} className="text-primary mt-0.5 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-semibold text-primary truncate">Ответ {replyTo.senderName}</p>
                                        <p className="text-xs text-muted-foreground truncate">{replyTo.text || "Медиа"}</p>
                                    </div>
                                    <button onClick={() => setReplyTo(null)} className="p-1 hover:bg-secondary rounded-md text-muted-foreground self-center" aria-label="Отменить ответ">
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="flex items-end gap-2 px-4 py-3">
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handlePickImages}
                            />
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={handlePickFiles}
                            />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0" aria-label="Прикрепить">
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
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                placeholder={replyTo ? `Ответить ${replyTo.senderName}…` : "Сообщение"}
                                className="flex-1 resize-none bg-secondary rounded-2xl px-4 py-2 text-[14px] leading-5 placeholder:text-muted-foreground focus:outline-none max-h-40"
                            />
                            <EmojiPicker onSelect={(e) => setText((p) => p + e)} />
                            {(text.trim() || pendingImages.length || pendingFiles.length) ? (
                                <button onClick={handleSend} className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90" aria-label="Отправить">
                                    <Send className="w-5 h-5" />
                                </button>
                            ) : (
                                <button className="w-8 h-8 flex items-center justify-center text-foreground/70 hover:text-foreground rounded-lg hover:bg-secondary">
                                    <Mic className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                </section>

                {infoOpen && (
                    <ChatInfoPanel chatId={activeId} onClose={() => setInfoOpen(false)} />
                )}
            </div>

            <CreateChatDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onCreated={(id) => setActiveId(id)}
            />
            {call && (
                <CallScreen
                    type={call.type}
                    contactName={active.name}
                    contactAvatar={active.avatar}
                    onEnd={() => setCall(null)}
                />
            )}
            <ForwardDialog
                open={forwardMsgId !== null}
                onOpenChange={(v) => !v && setForwardMsgId(null)}
                sourceChatId={activeId}
                messageId={forwardMsgId}
            />
        </>
    );
};


export default Messenger;
