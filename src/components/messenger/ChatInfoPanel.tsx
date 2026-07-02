import { useState } from "react";
import {
    BellOff, Bell, FileText, Image as ImageIcon, LogOut, Star, UserPlus, X, Download,
    Phone, Video, MoreHorizontal, Settings, Link as LinkIcon, Copy, Share2, QrCode,
    ChevronRight, ChevronLeft, MessageSquareDot, Archive, MailOpen, Pin, Trash2, Eraser,
    Camera, Search, MoreVertical,
} from "lucide-react";
import { useMessenger } from "@/hooks/use-messenger";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "@/hooks/use-toast";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatInfoPanelProps {
    chatId: string;
    onClose: () => void;
}

const TABS = ["Медиа", "Файлы", "Ссылки", "Голос"] as const;

const formatSize = (b: number) => {
    if (b < 1024) return `${b} Б`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} КБ`;
    return `${(b / 1024 / 1024).toFixed(2)} МБ`;
};

const MOCK_JOIN_LINK = "https://vk.me/join/a5PWbsMogPWY01tvg30pmWrCvI";

type View = "main" | "link" | "settings";

const ChatInfoPanel = ({ chatId, onClose }: ChatInfoPanelProps) => {
    const { contacts, getMembers, getMediaFromChat, getFilesFromChat } = useMessenger();
    const { t } = useTranslation();
    const contact = contacts.find((c) => c.id === chatId);
    const members = getMembers(chatId);
    const media = getMediaFromChat(chatId);
    const files = getFilesFromChat(chatId);
    const [tab, setTab] = useState<(typeof TABS)[number]>("Медиа");
    const [view, setView] = useState<View>("main");
    const [muted, setMuted] = useState(false);
    const [showRecentInLink, setShowRecentInLink] = useState(true);
    const [linkTab, setLinkTab] = useState<"link" | "qr">("link");
    const [memberSearch, setMemberSearch] = useState("");

    // Настройки группы — редактируются локально; сохранение пока просто toast,
    // нужен PATCH-эндпоинт на группу в messenger-context.ts.
    const [settingsName, setSettingsName] = useState(contact?.name ?? "");
    const [settingsDesc, setSettingsDesc] = useState(contact?.description ?? "");

    const notify = (label: string) => toast({ title: label });

    if (!contact) return null;

    const subtitle = contact.isGroup
        ? `${members.length} ${members.length === 1 ? "участник" : "участника"}`
        : contact.online
            ? "в сети"
            : "был(а) недавно";

    const filteredMembers = members.filter((m) =>
        m.name.toLowerCase().includes(memberSearch.toLowerCase())
    );

    /* ── Экран: настройки группы ── */
    if (view === "settings") {
        return (
            <aside className="w-75 shrink-0 border-l border-border bg-card flex flex-col overflow-y-auto">
                <div className="h-14 px-3 flex items-center gap-2 border-b border-border shrink-0">
                    <button onClick={() => setView("main")} className="p-2 hover:bg-secondary rounded-lg text-foreground/70" aria-label="Назад">
                        <ChevronLeft size={20} />
                    </button>
                    <h3 className="font-semibold text-sm">{t('messenger.info.settings.title')}</h3>
                </div>

                <div className="p-4 space-y-5">
                    <div className="flex justify-center">
                        <button className="relative w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground overflow-hidden">
                            {contact.avatar ? (
                                <img src={contact.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl font-bold">{contact.name.charAt(0).toUpperCase()}</span>
                            )}
                            <span className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Camera size={20} />
              </span>
                        </button>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">{t('messenger.info.settings.name')}</label>
                        <div className="relative">
                            <input
                                value={settingsName}
                                onChange={(e) => setSettingsName(e.target.value)}
                                className="w-full h-9 px-3 pr-8 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                            />
                            {settingsName && (
                                <button onClick={() => setSettingsName("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Очистить">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">{t('messenger.info.settings.description')}</label>
                        <textarea
                            value={settingsDesc}
                            onChange={(e) => setSettingsDesc(e.target.value)}
                            placeholder="Добавьте описание"
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg bg-secondary text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    </div>

                    <div className="divide-y divide-border/60 border-t border-border/60">
                        {[
                            [t('messenger.info.settings.perm.invite'), t('messenger.info.settings.perm.everyone')],
                            [t('messenger.info.settings.perm.editInfo'), t('messenger.info.settings.perm.everyone')],
                            [t('messenger.info.settings.perm.pinned'), t('messenger.info.settings.perm.everyone')],
                            [t('messenger.info.settings.perm.mentionAll'), t('messenger.info.settings.perm.everyone')],
                            [t('messenger.info.settings.perm.viewLink'), t('messenger.info.settings.perm.everyone')],
                            [t('messenger.info.settings.perm.startCalls'), t('messenger.info.settings.perm.everyone')],
                            [t('messenger.info.settings.perm.admins'), t('messenger.info.settings.perm.ownerOnly')],
                            [t('messenger.info.settings.perm.theme'), t('messenger.info.settings.perm.everyone')],
                        ].map(([label, value]) => (
                            <button
                                key={label}
                                onClick={() => notify(t('messenger.info.toast.permComingSoon'))}
                                className="w-full flex items-center justify-between gap-2 py-3 text-left hover:bg-secondary/40 transition-colors -mx-1 px-1 rounded-lg"
                            >
                                <div>
                                    <p className="text-[13px] font-medium">{label}</p>
                                    <p className="text-[12px] text-muted-foreground">{value}</p>
                                </div>
                                <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-auto p-4 border-t border-border sticky bottom-0 bg-card">
                    <button
                        onClick={() => notify(t('messenger.info.toast.settingsSaved'))}
                        className="w-full h-9 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
                    >
                        {t('messenger.info.settings.save')}
                    </button>
                </div>
            </aside>
        );
    }

    /* ── Экран: ссылка-приглашение / QR ── */
    if (view === "link") {
        return (
            <aside className="w-75 shrink-0 border-l border-border bg-card flex flex-col overflow-y-auto">
                <div className="h-14 px-3 flex items-center gap-2 border-b border-border shrink-0">
                    <button onClick={() => setView("main")} className="p-2 hover:bg-secondary rounded-lg text-foreground/70" aria-label="Назад">
                        <ChevronLeft size={20} />
                    </button>
                    <h3 className="font-semibold text-sm">{t('messenger.info.link.title')}</h3>
                </div>

                <div className="p-4 space-y-4">
                    <div className="flex bg-secondary rounded-lg p-1">
                        {(["link", "qr"] as const).map((tabKey) => (
                            <button
                                key={tabKey}
                                onClick={() => setLinkTab(tabKey)}
                                className={`flex-1 h-8 rounded-md text-[13px] font-medium transition-colors ${
                                    linkTab === tabKey ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {tabKey === "link" ? t('messenger.info.link.tab.link') : t('messenger.info.link.tab.qr')}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-[13px]">{t('messenger.info.link.showRecent')}</span>
                        <button
                            onClick={() => setShowRecentInLink((v) => !v)}
                            className={`w-9 h-5 rounded-full relative transition-colors shrink-0 ${showRecentInLink ? "bg-primary" : "bg-secondary"}`}
                            aria-label="Переключить"
                        >
              <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      showRecentInLink ? "translate-x-4" : "translate-x-0.5"
                  }`}
              />
                        </button>
                    </div>

                    {linkTab === "link" ? (
                        <>
                            <div className="px-3 py-2 rounded-lg bg-secondary text-[13px] text-primary truncate">
                                {MOCK_JOIN_LINK}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Чтобы приглашение стало недействительным, вы можете{" "}
                                <button onClick={() => notify(t('messenger.info.toast.linkRevoked'))} className="text-primary hover:underline">
                                    {t('messenger.info.link.revoke')}
                                </button>
                                .
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { navigator.clipboard.writeText(MOCK_JOIN_LINK); notify(t('messenger.info.toast.linkCopied')); }}
                                    className="flex-1 h-9 rounded-lg bg-secondary hover:bg-secondary/70 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Copy size={15} /> {t('messenger.info.link.copy')}
                                </button>
                                <button
                                    onClick={() => notify(t('messenger.info.link.share'))}
                                    className="flex-1 h-9 rounded-lg bg-secondary hover:bg-secondary/70 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Share2 size={15} /> {t('messenger.info.link.share')}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Каркас под настоящий QR — подключите qrcode.react (<QRCodeSVG value={MOCK_JOIN_LINK} />) вместо плейсхолдера */}
                            <div className="flex items-center justify-center py-4">
                                <div className="w-40 h-40 rounded-lg bg-white flex items-center justify-center">
                                    <QrCode size={96} className="text-black" />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                                Чтобы приглашение стало недействительным, вы можете{" "}
                                <button onClick={() => notify(t('messenger.info.toast.qrRevoked'))} className="text-primary hover:underline">
                                    {t('messenger.info.link.revokeQr')}
                                </button>
                                .
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => notify(t('messenger.info.toast.qrDownloaded'))}
                                    className="flex-1 h-9 rounded-lg bg-secondary hover:bg-secondary/70 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Download size={15} /> {t('messenger.info.link.download')}
                                </button>
                                <button
                                    onClick={() => notify(t('messenger.info.link.share'))}
                                    className="flex-1 h-9 rounded-lg bg-secondary hover:bg-secondary/70 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Share2 size={15} /> {t('messenger.info.link.share')}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </aside>
        );
    }

    /* ── Основной экран ── */
    return (
        <aside className="w-75 shrink-0 border-l border-border bg-card flex flex-col overflow-y-auto">
            <div className="flex justify-between p-3">
                <div />
                <div className="flex items-center gap-1">
                    {contact.isGroup && (
                        <button
                            onClick={() => setView("settings")}
                            className="p-2 hover:bg-secondary rounded-lg text-foreground/70"
                            aria-label="Настройки чата"
                        >
                            <Settings size={18} />
                        </button>
                    )}
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg text-foreground/70" aria-label="Закрыть">
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col items-center px-4 pb-4 -mt-8">
                {contact.avatar ? (
                    <img src={contact.avatar} alt={contact.name} className="w-20 h-20 rounded-full object-cover mb-3" />
                ) : (
                    <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-2xl font-bold mb-3">
                        {contact.name.charAt(0).toUpperCase()}
                    </div>
                )}
                <h3 className="font-semibold text-sm text-center">{contact.name}</h3>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
                {contact.description && (
                    <p className="text-xs text-muted-foreground text-center mt-2 px-2">{contact.description}</p>
                )}
            </div>

            {/* Быстрые действия */}
            <div className="flex justify-center gap-2 px-4 pb-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex-1 flex flex-col items-center gap-1.5 py-2 rounded-lg bg-secondary hover:bg-secondary/70 text-primary transition-colors">
                            <Phone size={18} />
                            <span className="text-xs font-medium">{t('messenger.info.call')}</span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center">
                        <DropdownMenuItem onClick={() => notify(t('messenger.info.call.audio'))} className="gap-2 cursor-pointer">
                            <Phone size={15} /> {t('messenger.info.call.audio')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => notify(t('messenger.info.call.video'))} className="gap-2 cursor-pointer">
                            <Video size={15} /> {t('messenger.info.call.video')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <button
                    onClick={() => { setMuted((m) => !m); notify(muted ? t('messenger.info.mute.off') : t('messenger.info.mute.on')); }}
                    className="flex-1 flex flex-col items-center gap-1.5 py-2 rounded-lg bg-secondary hover:bg-secondary/70 text-primary transition-colors"
                >
                    {muted ? <BellOff size={18} /> : <Bell size={18} />}
                    <span className="text-xs font-medium">{muted ? t('messenger.info.mute.on') : t('messenger.info.mute.off')}</span>
                </button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex-1 flex flex-col items-center gap-1.5 py-2 rounded-lg bg-secondary hover:bg-secondary/70 text-primary transition-colors">
                            <MoreHorizontal size={18} />
                            <span className="text-xs font-medium">{t('messenger.info.more')}</span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-52">
                        <DropdownMenuItem onClick={() => notify(t('messenger.info.toast.archived'))} className="gap-2 cursor-pointer">
                            <Archive size={15} /> {t('messenger.chatMenu.archive')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => notify(t('messenger.info.toast.markedUnread'))} className="gap-2 cursor-pointer">
                            <MailOpen size={15} /> {t('messenger.chatMenu.markUnread')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => notify(t('messenger.info.toast.pinnedChat'))} className="gap-2 cursor-pointer">
                            <Pin size={15} /> {t('messenger.chatMenu.pin')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => notify(t('messenger.info.more.mentionSettings'))} className="gap-2 cursor-pointer">
                            <MessageSquareDot size={15} /> {t('messenger.info.more.mentionSettings')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => notify(t('messenger.info.toast.deleted'))} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                            <Trash2 size={15} /> {t('messenger.chatMenu.deleteChat')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => notify(t('messenger.info.toast.cleared'))} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                            <Eraser size={15} /> {t('messenger.chatMenu.clearHistory')}
                        </DropdownMenuItem>
                        {contact.isGroup && (
                            <DropdownMenuItem onClick={() => notify(t('messenger.info.toast.left'))} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                                <LogOut size={15} /> {t('messenger.chatMenu.leaveChat')}
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {contact.isGroup && (
                <>
                    <button
                        onClick={() => setView("link")}
                        className="flex items-center gap-2 px-4 py-3 border-y border-border hover:bg-secondary/40 transition-colors text-left"
                    >
                        <LinkIcon size={15} className="text-primary shrink-0" />
                        <span className="text-[13px] text-primary flex-1 truncate">{MOCK_JOIN_LINK}</span>
                        <Copy
                            size={15}
                            className="text-muted-foreground shrink-0"
                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(MOCK_JOIN_LINK); notify(t('messenger.info.toast.linkCopied')); }}
                        />
                    </button>

                    <button
                        onClick={() => notify(t('messenger.info.toast.stickersComingSoon'))}
                        className="flex items-center gap-2 px-4 py-3 border-b border-border hover:bg-secondary/40 transition-colors text-left"
                    >
                        <MessageSquareDot size={15} className="text-primary shrink-0" />
                        <span className="text-[13px] text-primary flex-1">{t('messenger.info.stickers')}</span>
                        <ChevronRight size={15} className="text-muted-foreground shrink-0" />
                    </button>
                </>
            )}

            {members.length > 0 && contact.isGroup && (
                <div className="py-2 border-b border-border">
                    <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {t('messenger.info.members')} · {members.length}
                    </p>
                    <div className="px-4 pb-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <input
                                value={memberSearch}
                                onChange={(e) => setMemberSearch(e.target.value)}
                                placeholder={t('messenger.info.members.search')}
                                className="w-full h-8 pl-8 pr-3 rounded-lg bg-secondary text-[13px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => notify(t('messenger.info.toast.addMembersComingSoon'))}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-secondary/60 transition-colors text-primary"
                    >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <UserPlus size={16} />
                        </div>
                        <span className="text-sm font-medium">{t('messenger.info.members.add')}</span>
                    </button>
                    {filteredMembers.map((m, idx) => (
                        <div key={m.id} className="flex items-center gap-3 px-4 py-2 hover:bg-secondary/60 transition-colors group">
                            <div className="relative">
                                <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-full object-cover" />
                                {m.online && (
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-card" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{m.name}</p>
                                <p className={`text-xs truncate ${m.online ? "text-emerald-500" : "text-muted-foreground"}`}>{m.status}</p>
                            </div>
                            {idx === 0 && <Star size={14} className="text-primary shrink-0" />}
                            <button
                                onClick={() => notify(`Действия для ${m.name}`)}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-secondary text-muted-foreground shrink-0 transition-opacity"
                                aria-label="Действия с участником"
                            >
                                <MoreVertical size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-auto border-t border-border">
                <div className="flex">
                    {TABS.map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 py-3 text-xs font-medium transition-colors ${
                                tab === t ? "text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                {tab === "Медиа" && (
                    media.length === 0 ? (
                        <div className="py-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                            <ImageIcon size={28} className="opacity-50" />
                            Здесь будет медиа из чата
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-0.5 p-1">
                            {media.map((src, i) => (
                                <img key={i} src={src} alt="" className="w-full aspect-square object-cover rounded-sm" />
                            ))}
                        </div>
                    )
                )}
                {tab === "Файлы" && (
                    files.length === 0 ? (
                        <div className="py-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                            <FileText size={28} className="opacity-50" />
                            Файлов пока нет
                        </div>
                    ) : (
                        <div className="p-2 space-y-1">
                            {files.map((f, i) => (
                                <a
                                    key={i}
                                    href={f.url}
                                    download={f.name}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-secondary/60 transition-colors"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center text-primary shrink-0">
                                        <FileText size={18} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[13px] font-medium truncate">{f.name}</p>
                                        <p className="text-[11px] text-muted-foreground">{formatSize(f.size)}</p>
                                    </div>
                                    <Download size={14} className="text-muted-foreground shrink-0" />
                                </a>
                            ))}
                        </div>
                    )
                )}
                {(tab === "Ссылки" || tab === "Голос") && (
                    <div className="py-8 text-center text-xs text-muted-foreground">Пока ничего нет</div>
                )}
            </div>
        </aside>
    );
};

export default ChatInfoPanel;