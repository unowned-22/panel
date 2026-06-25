import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    X,
    ChevronDown,
    Plus,
    Image as ImageIcon,
    PlayCircle,
    Music as MusicIcon,
    BarChart3,
    ShoppingBag,
    FileType,
    Minus,
    Table as TableIcon,
    MessageSquare,
    HelpCircle,
    Search,
    Check,
    ChevronRight,
    Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Draft = { id: string; title: string; body: string; date: string };

type Audience = "Всем пользователям" | "Друзьям" | "Только мне";

const ArticleEditor = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [savedAt, setSavedAt] = useState<string>("");
    const [insertOpen, setInsertOpen] = useState(false);

    const [draftsOpen, setDraftsOpen] = useState(false);
    const [pubOpen, setPubOpen] = useState(false);
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [draftsTab, setDraftsTab] = useState<"drafts" | "links">("drafts");
    const [search, setSearch] = useState("");

    const [cover, setCover] = useState<string | null>(null);
    const [audience, setAudience] = useState<Audience>("Всем пользователям");
    const [showInArticles, setShowInArticles] = useState(false);
    const [published, setPublished] = useState(false);

    // Auto-save indicator
    useEffect(() => {
        if (!title && !body) return;
        const t = setTimeout(() => {
            setSavedAt("сохранён");
        }, 600);
        return () => clearTimeout(t);
    }, [title, body]);

    const slug =
        "vk.ru/@648226314-" +
        (title.trim().toLowerCase().replace(/[^a-zа-я0-9]+/g, "-").replace(/^-|-$/g, "") || "novaya");

    const saveDraft = () => {
        if (!title.trim() && !body.trim()) return;
        const d: Draft = {
            id: String(Date.now()),
            title: title || "Без названия",
            body,
            date: "только что",
        };
        setDrafts((prev) => [d, ...prev]);
        toast({ title: "Черновик сохранён" });
    };

    const close = () => {
        saveDraft();
        navigate(-1);
    };

    const publish = () => {
        if (!title.trim() && !body.trim()) {
            toast({ title: "Пустая статья", description: "Добавьте заголовок или текст" });
            return;
        }
        setPublished(true);
        toast({ title: "Статья опубликована", description: slug });
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-30 h-16 border-b border-border/60 bg-background/95 backdrop-blur flex items-center px-4 md:px-8">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center"
                    aria-label="Назад"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="flex-1 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-vk-blue to-purple-500 flex items-center justify-center text-sm font-semibold">
                            MR
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-vk-blue leading-tight">Mark Roberts</div>
                            <div className="text-xs text-muted-foreground leading-tight">Новая статья</div>
                        </div>
                    </div>

                    <div className="hidden md:block text-sm text-muted-foreground">
                        {savedAt ? "Черновик сохранён" : "Не сохранено"}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => {
                                setDraftsOpen((v) => !v);
                                setPubOpen(false);
                            }}
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                        >
                            Мои статьи <ChevronDown className="w-4 h-4" />
                        </button>
                        {draftsOpen && (
                            <div className="absolute right-0 mt-3 w-105 panel-card bg-popover border-border shadow-xl p-4 z-40">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setDraftsTab("drafts")}
                                            className={`pb-2 text-sm font-semibold border-b-2 ${
                                                draftsTab === "drafts"
                                                    ? "border-vk-blue text-foreground"
                                                    : "border-transparent text-muted-foreground"
                                            }`}
                                        >
                                            Черновики <span className="text-muted-foreground ml-1">{drafts.length}</span>
                                        </button>
                                        <button
                                            onClick={() => setDraftsTab("links")}
                                            className={`pb-2 text-sm font-semibold border-b-2 ${
                                                draftsTab === "links"
                                                    ? "border-vk-blue text-foreground"
                                                    : "border-transparent text-muted-foreground"
                                            }`}
                                        >
                                            Доступные по ссылке
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setTitle("");
                                            setBody("");
                                            setDraftsOpen(false);
                                        }}
                                        className="text-sm text-vk-blue hover:underline"
                                    >
                                        Создать
                                    </button>
                                </div>

                                <div className="relative mb-2">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Быстрый поиск"
                                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-secondary/60 border border-border outline-none text-sm focus:border-vk-blue"
                                    />
                                </div>

                                <div className="max-h-90 overflow-y-auto flex flex-col">
                                    {drafts.length === 0 ? (
                                        <div className="py-10 text-center text-sm text-muted-foreground">
                                            Здесь пусто
                                        </div>
                                    ) : (
                                        drafts
                                            .filter((d) =>
                                                d.title.toLowerCase().includes(search.toLowerCase())
                                            )
                                            .map((d) => (
                                                <button
                                                    key={d.id}
                                                    onClick={() => {
                                                        setTitle(d.title);
                                                        setBody(d.body);
                                                        setDraftsOpen(false);
                                                    }}
                                                    className="text-left p-3 rounded-xl hover:bg-secondary/60"
                                                >
                                                    <div className="text-sm font-medium truncate">{d.title}</div>
                                                    <div className="text-xs text-muted-foreground">{d.date}</div>
                                                </button>
                                            ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => {
                                setPubOpen((v) => !v);
                                setDraftsOpen(false);
                            }}
                            className="flex items-center gap-1 text-sm font-semibold text-vk-blue"
                        >
                            Публикация <ChevronDown className="w-4 h-4" />
                        </button>
                        {pubOpen && (
                            <div className="absolute right-0 mt-3 w-110 panel-card bg-popover border-border shadow-xl p-5 z-40">
                                <div className="text-base font-semibold mb-3">Подготовка к публикации</div>
                                <div className="h-px bg-border/60 mb-4" />

                                <div className="text-sm text-muted-foreground mb-2">Обложка</div>
                                {cover ? (
                                    <div className="relative mb-4">
                                        <img
                                            src={cover}
                                            alt="Обложка"
                                            className="w-full rounded-xl object-cover max-h-60"
                                        />
                                        <button
                                            onClick={() => setCover(null)}
                                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/70 backdrop-blur flex items-center justify-center hover:bg-background"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="block mb-4 cursor-pointer text-sm text-vk-blue hover:underline">
                                        Загрузить изображение
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if (f) setCover(URL.createObjectURL(f));
                                            }}
                                        />
                                    </label>
                                )}

                                <div className="text-sm text-muted-foreground mb-2">
                                    Статья будет сохранена и доступна по ссылке:
                                </div>
                                <div className="h-10 px-3 rounded-xl border border-border bg-secondary/40 flex items-center text-sm mb-4">
                                    {slug}
                                </div>

                                <button className="w-full flex items-center justify-between py-3 hover:bg-secondary/40 rounded-xl px-2 -mx-2">
                                    <div className="text-left">
                                        <div className="text-sm font-medium">Кому доступна статья</div>
                                        <div className="text-xs text-muted-foreground">{audience}</div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </button>

                                <label className="flex items-center gap-3 py-3 cursor-pointer">
                  <span
                      className={`w-5 h-5 rounded border flex items-center justify-center ${
                          showInArticles
                              ? "bg-vk-blue border-vk-blue"
                              : "border-border bg-transparent"
                      }`}
                      onClick={() => setShowInArticles((v) => !v)}
                  >
                    {showInArticles && <Check className="w-3.5 h-3.5 text-white" />}
                  </span>
                                    <span className="text-sm">Показывать в разделе «Статьи»</span>
                                </label>

                                {published && (
                                    <div className="flex items-start gap-3 py-3">
                    <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5 shrink-0">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </span>
                                        <div className="text-sm">
                                            <div>Статья сохранена и доступна по ссылке:</div>
                                            <a className="text-vk-blue hover:underline">{slug}</a>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between mt-3">
                                    {published ? (
                                        <>
                                            <button className="h-10 px-4 rounded-xl bg-secondary hover:bg-secondary/80 text-sm">
                                                Создать пост
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setPublished(false);
                                                    setTitle("");
                                                    setBody("");
                                                    setCover(null);
                                                    setPubOpen(false);
                                                }}
                                                className="text-sm text-destructive hover:underline"
                                            >
                                                Удалить
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={publish}
                                            className="ml-auto h-10 px-5 rounded-xl bg-white text-black hover:bg-white/90 text-sm font-semibold"
                                        >
                                            Опубликовать
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center"
                    aria-label="Помощь"
                >
                    <HelpCircle className="w-5 h-5 text-muted-foreground" />
                </button>
                <button
                    onClick={close}
                    className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center"
                    aria-label="Закрыть"
                >
                    <X className="w-5 h-5" />
                </button>
            </header>

            {/* Editor body */}
            <div className="max-w-190 mx-auto px-4 md:px-8 py-12">
        <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Заголовок"
            rows={1}
            className="w-full bg-transparent outline-none resize-none text-5xl md:text-6xl font-bold leading-tight placeholder:text-muted-foreground/60 mb-10"
            style={{ minHeight: "1.2em" }}
        />

                <div className="relative">
          <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Текст статьи..."
              rows={6}
              className="w-full bg-transparent outline-none resize-none text-lg leading-relaxed placeholder:text-muted-foreground/60 min-h-50"
          />

                    {/* Insert toolbar */}
                    <div className="mt-4 flex items-center gap-3">
                        <button
                            onClick={() => setInsertOpen((v) => !v)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                insertOpen
                                    ? "bg-secondary rotate-45"
                                    : "bg-secondary/60 hover:bg-secondary"
                            }`}
                        >
                            <Plus className="w-5 h-5" />
                        </button>

                        {insertOpen && (
                            <div className="flex items-center gap-1 px-2 h-12 rounded-full bg-secondary/80 backdrop-blur">
                                {[
                                    { icon: ImageIcon, label: "Фото" },
                                    { icon: PlayCircle, label: "Видео" },
                                    { icon: MusicIcon, label: "Музыка" },
                                    { icon: BarChart3, label: "Опрос" },
                                    { icon: ShoppingBag, label: "Товар" },
                                    { icon: FileType, label: "GIF" },
                                    { icon: Minus, label: "Разделитель" },
                                    { icon: TableIcon, label: "Таблица" },
                                ].map((it) => (
                                    <button
                                        key={it.label}
                                        title={it.label}
                                        onClick={() => {
                                            toast({ title: it.label, description: "Скоро будет доступно" });
                                        }}
                                        className="w-9 h-9 rounded-full hover:bg-background/40 flex items-center justify-center text-foreground/80"
                                    >
                                        <it.icon className="w-4.5 h-4.5" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating chat button */}
            <button
                className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center shadow-xl"
                aria-label="Комментарии"
            >
                <MessageSquare className="w-5 h-5" />
            </button>

            {drafts.length > 0 && (
                <button
                    onClick={() => {
                        setDrafts([]);
                        toast({ title: "Черновики удалены" });
                    }}
                    className="fixed bottom-6 left-6 hidden text-xs text-muted-foreground items-center gap-1 hover:text-destructive"
                >
                    <Trash2 className="w-3 h-3" />
                    Очистить черновики
                </button>
            )}
        </div>
    );
};

export default ArticleEditor;
