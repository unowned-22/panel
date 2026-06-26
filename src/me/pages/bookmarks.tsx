import { useMemo, useState } from "react";
import {
    Bookmark,
    BookmarkMinus,
    ChevronUp,
    FileText,
    Film,
    Gamepad2,
    Headphones,
    Link as LinkIcon,
    Lock,
    MoreHorizontal,
    Music2,
    Search,
    ShoppingBag,
    Sparkles,
    Tag,
    Users,
    Video as VideoIcon,
    Wrench,
} from "lucide-react";

type Category =
    | "Все закладки"
    | "Люди"
    | "Сообщества"
    | "Посты"
    | "Статьи"
    | "Ссылки"
    | "Подкасты"
    | "Видео"
    | "Моменты"
    | "Игры"
    | "Сервисы"
    | "Товары и услуги";

const CATS: Category[] = [
    "Все закладки",
    "Люди",
    "Сообщества",
    "Посты",
    "Статьи",
    "Ссылки",
    "Подкасты",
    "Видео",
    "Моменты",
    "Игры",
    "Сервисы",
    "Товары и услуги",
];

const TAG_LIST = ["Прочитать позже", "Важное"] as const;
type TagName = (typeof TAG_LIST)[number];

type BookmarkItem = {
    id: string;
    category: Exclude<Category, "Все закладки">;
    title: string;
    subtitle: string;
    meta: string;
    tag?: TagName;
    cover?: string;
    accent: string; // tailwind gradient class
};

const ITEMS: BookmarkItem[] = [
    {
        id: "1",
        category: "Статьи",
        title: "Как дизайн-системы экономят месяцы разработки",
        subtitle: "vk.ru/@design — 8 минут чтения",
        meta: "Сохранено 2 дня назад",
        tag: "Прочитать позже",
        accent: "from-indigo-500/30 to-fuchsia-500/30",
    },
    {
        id: "2",
        category: "Посты",
        title: "Анна Соколова",
        subtitle: "«Сегодня закат был просто космос — делюсь подборкой кадров с побережья…»",
        meta: "Пост · 124 лайка",
        tag: "Важное",
        accent: "from-orange-500/30 to-rose-500/30",
    },
    {
        id: "3",
        category: "Видео",
        title: "Полный гайд по горам Грузии за 12 минут",
        subtitle: "Канал «Travel Inside» · 12:43",
        meta: "Сохранено на прошлой неделе",
        accent: "from-emerald-500/30 to-teal-500/30",
    },
    {
        id: "4",
        category: "Подкасты",
        title: "Подлодка #321: о чём молчат тимлиды",
        subtitle: "Подлодка · 1 ч 18 мин",
        meta: "Сохранено вчера",
        tag: "Прочитать позже",
        accent: "from-sky-500/30 to-blue-500/30",
    },
    {
        id: "5",
        category: "Сообщества",
        title: "Дизайн-кабак",
        subtitle: "412K подписчиков · сообщество",
        meta: "Сохранено в марте",
        accent: "from-pink-500/30 to-rose-500/30",
    },
    {
        id: "6",
        category: "Люди",
        title: "Игорь Лебедев",
        subtitle: "Senior Product Designer · Москва",
        meta: "Сохранено месяц назад",
        accent: "from-amber-500/30 to-orange-500/30",
    },
    {
        id: "7",
        category: "Ссылки",
        title: "css-tricks.com — A Complete Guide to CSS Grid",
        subtitle: "css-tricks.com",
        meta: "Сохранено 3 дня назад",
        tag: "Прочитать позже",
        accent: "from-violet-500/30 to-purple-500/30",
    },
    {
        id: "8",
        category: "Моменты",
        title: "Момент — Открытие выставки Casa Batlló",
        subtitle: "Барселона · 14 фото",
        meta: "Сохранено в прошлом месяце",
        accent: "from-yellow-500/30 to-amber-500/30",
    },
    {
        id: "9",
        category: "Игры",
        title: "Мини-игра «Слова с друзьями»",
        subtitle: "Платформа VK Play · 4.7★",
        meta: "Сохранено 5 дней назад",
        accent: "from-lime-500/30 to-green-500/30",
    },
    {
        id: "10",
        category: "Товары и услуги",
        title: "Лонгслив оверсайз, чёрный",
        subtitle: "Магазин «Минимал» · 2 490 ₽",
        meta: "Сохранено сегодня",
        tag: "Важное",
        accent: "from-zinc-500/30 to-slate-500/30",
    },
    {
        id: "11",
        category: "Сервисы",
        title: "VK Знакомства",
        subtitle: "Сервис · мини-приложение",
        meta: "Сохранено в этом месяце",
        accent: "from-rose-500/30 to-red-500/30",
    },
    {
        id: "12",
        category: "Статьи",
        title: "Минимализм в интерфейсах: когда меньше — действительно лучше",
        subtitle: "vk.ru/@product — 5 минут чтения",
        meta: "Сохранено час назад",
        accent: "from-cyan-500/30 to-sky-500/30",
    },
];

const ICON_MAP: Record<Exclude<Category, "Все закладки">, typeof FileText> = {
    Люди: Users,
    Сообщества: Users,
    Посты: FileText,
    Статьи: FileText,
    Ссылки: LinkIcon,
    Подкасты: Headphones,
    Видео: VideoIcon,
    Моменты: Film,
    Игры: Gamepad2,
    Сервисы: Wrench,
    "Товары и услуги": ShoppingBag,
};

const Bookmarks = () => {
    const [active, setActive] = useState<Category>("Все закладки");
    const [activeTag, setActiveTag] = useState<TagName | null>(null);
    const [tagsOpen, setTagsOpen] = useState(true);
    const [query, setQuery] = useState("");
    const [removed, setRemoved] = useState<Set<string>>(new Set());

    const visible = useMemo(() => {
        return ITEMS.filter((it) => !removed.has(it.id))
            .filter((it) => (active === "Все закладки" ? true : it.category === active))
            .filter((it) => (activeTag ? it.tag === activeTag : true))
            .filter((it) =>
                query.trim()
                    ? (it.title + " " + it.subtitle).toLowerCase().includes(query.trim().toLowerCase())
                    : true,
            );
    }, [active, activeTag, query, removed]);

    const handleSelectCat = (c: Category) => {
        setActive(c);
        setActiveTag(null);
    };

    const handleSelectTag = (t: TagName) => {
        setActiveTag((prev) => (prev === t ? null : t));
    };

    const removeBookmark = (id: string) => {
        setRemoved((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });
    };

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
                <div className="panel-card p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <h1 className="text-xl font-semibold">{active}</h1>
                            <p className="text-xs text-muted-foreground">
                                {visible.length}{" "}
                                {pluralize(visible.length, ["элемент", "элемента", "элементов"])}
                                {activeTag && (
                                    <>
                                        {" · метка "}
                                        <span className="text-foreground">{activeTag}</span>
                                    </>
                                )}
                            </p>
                        </div>
                        <Sparkles className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Поиск по закладкам"
                            className="w-full h-10 pl-9 pr-3 rounded-xl bg-secondary/60 hover:bg-secondary focus:bg-background border border-transparent focus:border-border outline-none text-sm transition-colors"
                        />
                    </div>
                </div>
                <div className="panel-card p-2 max-h-[calc(100vh-220px)] overflow-y-auto flex flex-col gap-1">
                    {visible.length === 0 ? (
                        <EmptyState />
                    ) : (
                        visible.map((item) => (
                            <BookmarkRow key={item.id} item={item} onRemove={() => removeBookmark(item.id)} />
                        ))
                    )}
                </div>
            </div>
            <aside className="hidden xl:flex flex-col w-70 shrink-0 py-0 gap-3 sticky top-18 self-start max-h-[calc(100vh-72px)]">
                <div className="panel-card p-2 flex flex-col gap-0.5 overflow-y-auto">
                    {CATS.slice(0, 3).map((c) => (
                        <CatItem key={c} label={c} active={active === c} onClick={() => handleSelectCat(c)} />
                    ))}
                    <Divider />
                    {CATS.slice(3, 9).map((c) => (
                        <CatItem key={c} label={c} active={active === c} onClick={() => handleSelectCat(c)} />
                    ))}
                    <Divider />
                    {CATS.slice(9).map((c) => (
                        <CatItem key={c} label={c} active={active === c} onClick={() => handleSelectCat(c)} />
                    ))}

                    <Divider />
                    <button
                        onClick={() => setTagsOpen((v) => !v)}
                        className="flex items-center justify-between px-3 h-10 rounded-xl hover:bg-secondary/60 text-sm"
                    >
                        <span>Метки</span>
                        <ChevronUp className={`w-4 h-4 transition-transform ${tagsOpen ? "" : "rotate-180"}`} />
                    </button>
                    {tagsOpen && (
                        <div className="flex flex-col gap-0.5">
                            {TAG_LIST.map((t) => (
                                <button
                                    key={t}
                                    onClick={() => handleSelectTag(t)}
                                    className={`text-left px-3 h-10 rounded-xl text-sm flex items-center gap-2 transition-colors ${
                                        activeTag === t
                                            ? "bg-secondary text-foreground"
                                            : "hover:bg-secondary/60 text-muted-foreground"
                                    }`}
                                >
                                    <Tag className="w-3.5 h-3.5" />
                                    {t}
                                </button>
                            ))}
                            <button className="mt-1 mx-2 h-10 rounded-xl bg-secondary hover:bg-secondary/80 text-sm font-medium">
                                Создать новую метку
                            </button>
                        </div>
                    )}

                    <Divider />
                    <div className="px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Lock className="w-3.5 h-3.5" />
                        Закладки видны только вам
                    </div>
                </div>
            </aside>
        </div>
    );
};

const BookmarkRow = ({
                         item,
                         onRemove,
                     }: {
    item: BookmarkItem;
    onRemove: () => void;
}) => {
    const Icon = ICON_MAP[item.category] ?? FileText;
    return (
        <div className="group flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/60 transition-colors">
            <div
                className={`w-14 h-14 rounded-xl bg-linear-to-br ${item.accent} flex items-center justify-center shrink-0`}
            >
                <Icon className="w-6 h-6 text-foreground/80" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    {item.tag && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase tracking-wide px-2 h-5 rounded-full bg-secondary text-muted-foreground">
              <Tag className="w-3 h-3" />
                            {item.tag}
            </span>
                    )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                    {item.category} · {item.meta}
                </p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={onRemove}
                    title="Удалить из закладок"
                    className="w-9 h-9 rounded-full hover:bg-background flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                >
                    <BookmarkMinus className="w-4 h-4" />
                </button>
                <button
                    title="Ещё"
                    className="w-9 h-9 rounded-full hover:bg-background flex items-center justify-center text-muted-foreground"
                >
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const EmptyState = () => (
    <div className="min-h-80 flex items-center justify-center p-10">
        <div className="text-center max-w-sm flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary/60 flex items-center justify-center">
                <Bookmark className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
                В этой категории пока ничего нет. Нажмите на знак звёздочки на любом материале —
                и он появится здесь.
            </p>
        </div>
    </div>
);

const CatItem = ({
                     label,
                     active,
                     onClick,
                 }: {
    label: string;
    active: boolean;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={`text-left px-3 h-10 rounded-xl text-sm transition-colors ${
            active ? "bg-secondary text-foreground" : "hover:bg-secondary/60 text-foreground/90"
        }`}
    >
        {label}
    </button>
);

const Divider = () => <div className="my-1.5 h-px bg-border/60" />;

const pluralize = (n: number, forms: [string, string, string]) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return forms[0];
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
    return forms[2];
};

// Музыкальная иконка экспортируется из lucide, но мы её не используем сейчас.
// Оставляем импорт ради будущего расширения категорий.
void Music2;

export default Bookmarks;
