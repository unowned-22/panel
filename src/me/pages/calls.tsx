import { useEffect, useState } from "react";
import {
    Calendar,
    ChevronDown,
    Hand,
    Link as LinkIcon,
    MessageSquare,
    Mic,
    MicOff,
    MoreHorizontal,
    Phone,
    PhoneCall,
    Plus,
    Send,
    Settings,
    Smile,
    Trash2,
    Upload,
    Users,
    Video,
    VideoOff,
    X,
    Maximize2,
    LayoutGrid,
    PlayCircle,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { toAbsoluteUrl } from "@/lib/helpers.ts";

type CallStatus = "active" | "scheduled" | "history" | "missed";
type CallItem = {
    id: string;
    title: string;
    subtitle: string;
    duration: string;
    date: string;
    time: string;
    status: CallStatus;
    kind?: "audio" | "video" | "group";
};

/**
 * На бэкенде (см. call_handler.go/interfaces.go) сейчас нет эндпоинта
 * списка/истории звонков — есть только Initiate/Join/Decline/Leave/End/Get/
 * GetActiveForConversation для конкретного conversation_id. Поэтому здесь
 * список всегда пуст: как только на бэкенде появится что-то вроде
 * GET /api/v1/calls (история звонков пользователя), нужно будет:
 *   1) добавить метод в calls.ts, например callsApi.listHistory(page),
 *   2) смаппить ApiCallSession[] -> CallItem[] здесь (title/avatar собеседника
 *      по conversation_id, duration = ended_at - started_at, kind по call_type
 *      + количеству участников, status по ApiCallStatus).
 * До тех пор вкладки active/scheduled/history/missed остаются пустыми —
 * это ожидаемое поведение, а не баг.
 */
const fetchCalls = (): Promise<CallItem[]> => Promise.resolve([]);

const STICKERS = ["🐻", "🦊", "🐱", "🐶", "🦁", "🐼"];

const TAB_TITLES: Record<CallStatus | "main", string> = {
    main: "История звонков",
    active: "Активные звонки",
    scheduled: "Запланированные звонки",
    history: "История звонков",
    missed: "Пропущенные звонки",
};

type Tab = "main" | "call-friends" | "active" | "scheduled" | "history" | "missed" | "records" | "transcripts";

const Calls = () => {
    const { toast } = useToast();
    const [tab, setTab] = useState<Tab>("main");

    const [items, setItems] = useState<CallItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [joinOpen, setJoinOpen] = useState(false);
    const [callOpen, setCallOpen] = useState(false);

    // Settings state
    const [waitingRoom, setWaitingRoom] = useState(false);
    const [anon, setAnon] = useState(true);
    const [history, setHistory] = useState(false);
    const [screenShare, setScreenShare] = useState(true);
    const [reactions, setReactions] = useState(true);
    const [coWatch, setCoWatch] = useState(true);

    useEffect(() => {
        let alive = true;
        setLoading(true);
        fetchCalls().then((data) => {
            if (!alive) return;
            setItems(data);
            setLoading(false);
        });
        return () => {
            alive = false;
        };
    }, []);

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
        toast({ title: "Звонок удалён" });
    };

    const startCall = () => {
        setSettingsOpen(false);
        setCallOpen(true);
        toast({
            title: "Звонок создан",
            description: "Ссылка скопирована в буфер обмена",
        });
    };

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 max-w-150 mx-auto w-full flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <ActionTab
                        icon={<Phone className="w-4 h-4" />}
                        label="Создать звонок"
                        active
                        onClick={() => setSettingsOpen(true)}
                    />
                    <ActionTab
                        icon={<Calendar className="w-4 h-4" />}
                        label="Запланировать"
                        onClick={() =>
                            toast({ title: "Скоро", description: "Планирование звонков появится позже" })
                        }
                    />
                    <ActionTab
                        icon={<LinkIcon className="w-4 h-4" />}
                        label="Присоединиться"
                        onClick={() => setJoinOpen(true)}
                    />
                </div>

                {/* List for status tabs / empty for service tabs */}
                {tab === "main" || tab === "active" || tab === "scheduled" || tab === "history" || tab === "missed" ? (
                    (() => {
                        const filtered =
                            tab === "main" || tab === "history"
                                ? items.filter((i) => i.status === "history")
                                : items.filter((i) => i.status === tab);
                        const title = TAB_TITLES[tab as CallStatus | "main"];
                        const emptyText: Record<string, string> = {
                            main: "Здесь будет отображаться полная история ваших звонков",
                            history: "Здесь будет отображаться полная история ваших звонков",
                            active: "Сейчас нет активных звонков",
                            scheduled: "У вас нет запланированных звонков",
                            missed: "Пропущенных звонков нет",
                        };
                        return (
                            <div className="panel-card p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="font-semibold">{title}</div>
                                    {(tab === "main" || tab === "history") && filtered.length > 0 && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground">
                                                    Ещё <ChevronDown className="w-3 h-3" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                className="rounded-xl border-border bg-popover p-2 shadow-elevated"
                                            >
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        setItems((prev) => prev.filter((i) => i.status !== "history"))
                                                    }
                                                    className="gap-3 py-2 text-destructive"
                                                >
                                                    <Trash2 className="w-4 h-4" /> Очистить историю
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>

                                {loading ? (
                                    <div className="flex flex-col gap-2">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className="flex items-center gap-3 py-2">
                                                <Skeleton className="w-11 h-11 rounded-full" />
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton className="h-3 w-1/2" />
                                                    <Skeleton className="h-3 w-1/3" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : filtered.length === 0 ? (
                                    <div className="py-12 text-center text-sm text-muted-foreground">
                                        {emptyText[tab]}
                                    </div>
                                ) : (
                                    <div className="flex flex-col">
                                        {filtered.map((it) => (
                                            <CallRow
                                                key={it.id}
                                                item={it}
                                                onCall={() => setCallOpen(true)}
                                                onVideo={() => setCallOpen(true)}
                                                onDelete={() => removeItem(it.id)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })()
                ) : (
                    <EmptyTab tab={tab} />
                )}

                {/* Settings modal */}
                <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                    <DialogContent className="max-w-140 rounded-xl border-border bg-popover p-0 shadow-elevated [&>button]:hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                            <DialogTitle className="text-base font-semibold">Звонок по ссылке</DialogTitle>
                            <button
                                onClick={() => setSettingsOpen(false)}
                                className="w-8 h-8 rounded-full bg-secondary hover:bg-accent flex items-center justify-center"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="px-5 pt-3 pb-5">
                            <p className="text-xs text-muted-foreground mb-4">
                                Когда вы начнёте звонок, ссылка автоматически скопируется
                            </p>

                            <Row label="Звонок от имени" right={<span className="text-primary text-sm">Mark Roberts</span>} />

                            <SwitchRow
                                title="Включить зал ожидания"
                                desc="Пользователи не смогут войти в звонок без вашего одобрения"
                                checked={waitingRoom}
                                onChange={setWaitingRoom}
                            />
                            <SwitchRow
                                title="Анонимный вход"
                                desc="Можно присоединиться без профиля"
                                checked={anon}
                                onChange={setAnon}
                            />
                            <SwitchRow
                                title="Отображать историю сообщений"
                                desc="Новые участники увидят последние 250 сообщений в чате звонка"
                                checked={history}
                                onChange={setHistory}
                            />

                            <Row label="Микрофоны" right={<span className="text-primary text-sm">Доступны при входе и во время звонка</span>} />
                            <Row label="Камеры" right={<span className="text-primary text-sm">Доступны при входе и во время звонка</span>} />

                            <SwitchRow title="Показ экрана" checked={screenShare} onChange={setScreenShare} />
                            <SwitchRow
                                title="Реакции"
                                desc="При отключении доступно только администраторам"
                                checked={reactions}
                                onChange={setReactions}
                            />
                            <SwitchRow
                                title="Совместный просмотр видео"
                                desc="Участники могут запускать совместный просмотр"
                                checked={coWatch}
                                onChange={setCoWatch}
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border">
                            <button
                                onClick={() => setSettingsOpen(false)}
                                className="button-pill bg-transparent"
                            >
                                Отмена
                            </button>
                            <button onClick={startCall} className="button-pill bg-secondary">
                                Начать звонок
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Join modal */}
                <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
                    <DialogContent className="max-w-105 rounded-xl border-border bg-popover p-0 shadow-elevated [&>button]:hidden">
                        <div className="px-6 pt-7 pb-6 text-center relative">
                            <button
                                onClick={() => setJoinOpen(false)}
                                className="absolute right-4 top-4 w-7 h-7 rounded-full bg-secondary hover:bg-accent flex items-center justify-center"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="w-12 h-12 mx-auto rounded-full bg-primary/15 flex items-center justify-center mb-3">
                                <Phone className="w-6 h-6 text-primary" />
                            </div>
                            <DialogTitle className="text-lg font-semibold mb-4">
                                Присоединиться к звонку
                            </DialogTitle>
                            <input
                                placeholder="Вставьте ссылку или номер встречи"
                                className="w-full h-11 rounded-xl bg-secondary px-4 text-sm focus:outline-none placeholder:text-muted-foreground"
                            />
                            <button
                                onClick={() => {
                                    setJoinOpen(false);
                                    setCallOpen(true);
                                }}
                                className="w-full h-11 mt-3 rounded-xl bg-secondary hover:bg-accent text-sm font-medium"
                            >
                                Продолжить
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Fullscreen call */}
                {callOpen && <CallScreen onClose={() => setCallOpen(false)} />}
            </div>
            <aside className="hidden xl:flex flex-col w-70 shrink-0 py-0 gap-3 sticky top-18 self-start max-h-[calc(100vh-72px)]">
                <div className="panel-card p-2">
                    <SideItem active={tab === "main"} onClick={() => setTab("main")}>
                        Главная
                    </SideItem>
                    <SideItem
                        active={tab === "call-friends"}
                        onClick={() => setTab("call-friends")}
                    >
                        Позвонить друзьям
                    </SideItem>

                    <Divider />

                    <SideItem active={tab === "active"} onClick={() => setTab("active")}>
                        Активные
                    </SideItem>
                    <SideItem
                        active={tab === "scheduled"}
                        onClick={() => setTab("scheduled")}
                    >
                        Запланированные
                    </SideItem>

                    <Divider />

                    <SideItem
                        active={tab === "history"}
                        onClick={() => setTab("history")}
                    >
                        История
                    </SideItem>
                    <SideItem
                        active={tab === "missed"}
                        onClick={() => setTab("missed")}
                    >
                        Пропущенные
                    </SideItem>

                    <Divider />

                    <SideItem
                        active={tab === "records"}
                        onClick={() => setTab("records")}
                    >
                        Записи звонков
                    </SideItem>
                    <SideItem
                        active={tab === "transcripts"}
                        onClick={() => setTab("transcripts")}
                    >
                        Расшифровки звонков
                    </SideItem>
                </div>

                <div className="panel-card p-4 flex gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">Замените себя на vmoji</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            Когда нет желания включать камеру
                        </div>
                        <button className="button-pill mt-3 rounded-lg px-3 h-8 text-xs">
                            Подробнее
                        </button>
                    </div>
                    <img
                        src={toAbsoluteUrl("/avatar-2.jpg")}
                        alt="vmoji"
                        className="w-22 h-22 rounded-lg object-cover"
                    />
                </div>
            </aside>
        </div>
    );
};

/* ---------- Sub-components ---------- */

const SideItem = ({
                      children,
                      active,
                      onClick,
                  }: {
    children: React.ReactNode;
    active?: boolean;
    onClick?: () => void;
}) => (
    <button
        onClick={onClick}
        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
            active ? "bg-secondary font-medium" : "hover:bg-secondary/60"
        }`}
    >
        {children}
    </button>
);

const Divider = () => <div className="my-1 h-px bg-border/60" />;

const ActionTab = ({
                       icon,
                       label,
                       active,
                       onClick,
                   }: {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick?: () => void;
}) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-medium transition-colors ${
            active
                ? "bg-secondary"
                : "bg-card hover:bg-secondary/60 border border-border"
        }`}
    >
        {icon} {label}
    </button>
);

const CallRow = ({
                     item,
                     onCall,
                     onVideo,
                     onDelete,
                 }: {
    item: CallItem;
    onCall: () => void;
    onVideo: () => void;
    onDelete: () => void;
}) => (
    <div className="flex items-center gap-3 py-2 px-1 rounded-lg hover:bg-secondary/40 transition-colors">
        <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <PhoneCall className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{item.title}</div>
            <div className="text-xs text-muted-foreground truncate">
                {item.subtitle}
            </div>
        </div>
        <button
            onClick={onCall}
            className="w-9 h-9 rounded-lg hover:bg-secondary flex items-center justify-center"
            title="Аудиозвонок"
        >
            <Phone className="w-4 h-4" />
        </button>
        <button
            onClick={onVideo}
            className="w-9 h-9 rounded-lg hover:bg-secondary flex items-center justify-center"
            title="Видеозвонок"
        >
            <Video className="w-4 h-4" />
        </button>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="w-9 h-9 rounded-lg hover:bg-secondary flex items-center justify-center">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-56 rounded-xl border-border bg-popover p-2 shadow-elevated"
            >
                <div className="px-2 py-1.5 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.date}</span>
                    <span>{item.time}</span>
                </div>
                <div className="px-2 pb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Групповой</span>
                    <span>{item.duration}</span>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-3 py-2">
                    <MessageSquare className="w-4 h-4 text-primary" /> Сообщение
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="gap-3 py-2 text-destructive">
                    <Trash2 className="w-4 h-4" /> Удалить
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
);

const Row = ({ label, right }: { label: string; right: React.ReactNode }) => (
    <div className="flex items-center justify-between py-3 border-b border-border">
        <div className="text-sm font-medium">{label}</div>
        {right}
    </div>
);

const SwitchRow = ({
                       title,
                       desc,
                       checked,
                       onChange,
                   }: {
    title: string;
    desc?: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) => (
    <div className="flex items-start justify-between py-3 border-b border-border last:border-0 gap-4">
        <div className="min-w-0">
            <div className="text-sm font-medium">{title}</div>
            {desc && <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>}
        </div>
        <Switch checked={checked} onCheckedChange={onChange} />
    </div>
);

const EmptyTab = ({ tab }: { tab: Tab }) => {
    const labels: Record<string, string> = {
        "call-friends": "Позвоните друзьям из списка контактов",
        active: "Сейчас нет активных звонков",
        scheduled: "У вас нет запланированных звонков",
        missed: "Пропущенных звонков нет",
        records: "Здесь появятся записи ваших звонков",
        transcripts: "Здесь появятся расшифровки ваших звонков",
    };
    return (
        <div className="panel-card p-10 text-center text-sm text-muted-foreground">
            {labels[tab] ?? "Ничего не найдено"}
        </div>
    );
};

/* ---------- Fullscreen Call ---------- */

const CallScreen = ({ onClose }: { onClose: () => void }) => {
    const { toast } = useToast();
    const [seconds, setSeconds] = useState(0);
    const [chatOpen, setChatOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const [muted, setMuted] = useState(true);
    const [cameraOff, setCameraOff] = useState(true);
    const [hand, setHand] = useState(false);
    const [message, setMessage] = useState("");

    // Tick
    useEffect(() => {
        const t = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(t);
    }, []);

    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="relative w-full max-w-310 h-180 rounded-2xl bg-[#0d0d0d] overflow-hidden flex">
                {/* Main stage */}
                <div className="flex-1 relative">
                    {/* Top bar */}
                    <div className="absolute top-3 left-4 right-4 flex items-center justify-between z-10">
                        <div className="text-xs font-mono text-foreground/90">
                            {mm}:{ss}
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard?.writeText(window.location.href).catch(() => {});
                                toast({ title: "Ссылка скопирована" });
                            }}
                            className="button-pill h-8 px-3 rounded-lg text-xs flex items-center gap-1.5 bg-card/70 hover:bg-card"
                        >
                            <LinkIcon className="w-3.5 h-3.5" /> Ссылка
                        </button>
                    </div>

                    {/* Center placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-44 h-44 rounded-full bg-muted/40 flex items-center justify-center shadow-elevated ring-1 ring-border/30">
                            <Phone className="w-16 h-16 text-foreground/70" />
                        </div>
                    </div>

                    {/* Bottom controls */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
                        {/* Left tools */}
                        <div className="flex items-center gap-2">
                            <CtrlBtn onClick={() => setChatOpen((v) => !v)} title="Чат">
                                <MessageSquare className="w-4 h-4" />
                            </CtrlBtn>
                            <CtrlBtn title="Поделиться">
                                <Upload className="w-4 h-4" />
                            </CtrlBtn>
                            <CtrlBtn title="Совместный просмотр">
                                <PlayCircle className="w-4 h-4" />
                            </CtrlBtn>
                        </div>

                        {/* Center controls */}
                        <div className="flex items-center gap-2">
                            <CtrlBtn
                                active={hand}
                                onClick={() => setHand((v) => !v)}
                                title="Поднять руку"
                            >
                                <Hand className="w-4 h-4" />
                            </CtrlBtn>
                            <CtrlBtn
                                onClick={() => setCameraOff((v) => !v)}
                                title="Камера"
                                variant="round"
                            >
                                {cameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                            </CtrlBtn>
                            <CtrlBtn
                                onClick={() => setMuted((v) => !v)}
                                title="Микрофон"
                                variant="round"
                            >
                                {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            </CtrlBtn>
                            <button
                                onClick={onClose}
                                className="w-11 h-11 rounded-full bg-destructive hover:bg-destructive/90 flex items-center justify-center"
                                title="Завершить"
                            >
                                <X className="w-5 h-5 text-destructive-foreground" />
                            </button>
                        </div>

                        {/* Right tools */}
                        <div className="flex items-center gap-2">
                            <CtrlBtn title="Участники">
                <span className="relative inline-flex">
                  <Users className="w-4 h-4" />
                  <span className="absolute -top-1.5 -right-2 text-[10px] bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
                    1
                  </span>
                </span>
                            </CtrlBtn>

                            <DropdownMenu open={moreOpen} onOpenChange={setMoreOpen}>
                                <DropdownMenuTrigger asChild>
                                    <button className="w-9 h-9 rounded-lg bg-card/70 hover:bg-card flex items-center justify-center">
                                        <Settings className="w-4 h-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    side="top"
                                    className="w-56 rounded-xl border-border bg-popover p-2 shadow-elevated"
                                >
                                    <DropdownMenuItem className="py-2.5">Записать звонок</DropdownMenuItem>
                                    <DropdownMenuItem className="py-2.5">Запустить эфир</DropdownMenuItem>
                                    <DropdownMenuItem className="py-2.5">Сессионные залы</DropdownMenuItem>
                                    <DropdownMenuItem className="py-2.5">Расшифровка звонка</DropdownMenuItem>
                                    <DropdownMenuItem className="py-2.5 flex items-center justify-between">
                                        Субтитры <span className="text-primary text-xs">Отключены</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="py-2.5">vmoji</DropdownMenuItem>
                                    <DropdownMenuItem className="py-2.5">Настройки</DropdownMenuItem>
                                    <DropdownMenuItem className="py-2.5">Что могут участники</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <CtrlBtn title="Сетка">
                                <LayoutGrid className="w-4 h-4" />
                            </CtrlBtn>
                            <CtrlBtn title="На весь экран">
                                <Maximize2 className="w-4 h-4" />
                            </CtrlBtn>
                        </div>
                    </div>
                </div>

                {/* Chat panel */}
                {chatOpen && (
                    <div className="w-85 border-l border-border bg-card flex flex-col">
                        <div className="flex items-center justify-between px-3 py-3 border-b border-border">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                    <Phone className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-sm font-medium truncate">
                                    Групповой звонок 27.04.2026
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button className="w-7 h-7 rounded-md hover:bg-secondary flex items-center justify-center">
                                    <Phone className="w-3.5 h-3.5" />
                                </button>
                                <button className="w-7 h-7 rounded-md hover:bg-secondary flex items-center justify-center">
                                    <Maximize2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => setChatOpen(false)}
                                    className="w-7 h-7 rounded-md hover:bg-secondary flex items-center justify-center"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 px-3 py-4 overflow-y-auto flex items-center justify-center">
                            <div className="w-full rounded-xl bg-secondary/40 py-10 px-4 flex flex-col items-center text-muted-foreground">
                                <MessageSquare className="w-8 h-8 mb-2" strokeWidth={1.5} />
                                <div className="text-xs text-center">
                                    Здесь будет выводиться<br />история переписки
                                </div>
                            </div>
                        </div>

                        {/* Stickers strip */}
                        <div className="px-3 py-2 flex items-center gap-2 overflow-x-auto border-t border-border">
                            {STICKERS.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => toast({ title: "Стикер отправлен", description: s })}
                                    className="w-12 h-12 rounded-lg bg-secondary hover:bg-accent flex items-center justify-center text-2xl shrink-0"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        {/* Composer */}
                        <div className="px-3 py-3 border-t border-border flex items-center gap-2">
                            <button className="w-8 h-8 rounded-full bg-secondary hover:bg-accent flex items-center justify-center">
                                <Plus className="w-4 h-4" />
                            </button>
                            <input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Сообщение"
                                className="flex-1 h-9 bg-transparent text-sm focus:outline-none"
                            />
                            <button className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center">
                                <Smile className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button
                                onClick={() => {
                                    if (!message.trim()) return;
                                    toast({ title: "Сообщение отправлено" });
                                    setMessage("");
                                }}
                                className="w-8 h-8 rounded-full bg-primary text-primary-foreground hover:opacity-90 flex items-center justify-center"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const CtrlBtn = ({
                     children,
                     onClick,
                     title,
                     active,
                     variant = "square",
                 }: {
    children: React.ReactNode;
    onClick?: () => void;
    title?: string;
    active?: boolean;
    variant?: "square" | "round";
}) => (
    <button
        onClick={onClick}
        title={title}
        className={`flex items-center justify-center transition-colors ${
            variant === "round" ? "w-11 h-11 rounded-full" : "w-9 h-9 rounded-lg"
        } ${active ? "bg-primary text-primary-foreground" : "bg-card/80 hover:bg-card text-foreground"}`}
    >
        {children}
    </button>
);

export default Calls;