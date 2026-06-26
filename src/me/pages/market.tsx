import { useMemo, useState } from "react";
import {
    Search, Menu, ShoppingCart, MapPin, Shirt, Home, Sparkles, Baby, Monitor,
    Dumbbell, Wrench, Palette, Car, Bookmark, ChevronRight, Share2, Eye, Star,
    MessageSquare, Plus, Minus, Trash2, Smile, Image as ImageIcon, Music as MusicIcon,
    Gift, Video as VideoIcon, ChevronDown,
} from "lucide-react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

type Product = {
    id: string;
    title: string;
    price: number;
    old?: number;
    seller: string;
    sellerSubs?: string;
    category: string;
    breadcrumb: string[];
    views?: number;
    stock?: number;
    description: string;
    ozon?: boolean;
    rating?: string;
    reviews?: string;
    grad: string;
};

const cats = [
    { label: "Гардероб", icon: Shirt, color: "text-emerald-400" },
    { label: "Дом и дача", icon: Home, color: "text-blue-400" },
    { label: "Красота", icon: Sparkles, color: "text-pink-400" },
    { label: "Для детей", icon: Baby, color: "text-orange-400" },
    { label: "Электроника", icon: Monitor, color: "text-purple-400" },
    { label: "Спорт и отдых", icon: Dumbbell, color: "text-red-400" },
    { label: "Для ремонта", icon: Wrench, color: "text-green-400" },
    { label: "Хобби", icon: Palette, color: "text-yellow-400" },
    { label: "Транспорт", icon: Car, color: "text-sky-400" },
];

const products: Product[] = [
    {
        id: "p1", title: "Обложка на ежедневник", price: 3800, seller: "Денежные кошельки, обложки и т. д.",
        sellerSubs: "79 подписчиков", category: "Гардероб",
        breadcrumb: ["Главная", "Гардероб", "Женщинам", "Аксессуары", "Обложки для документов"],
        views: 110, description: "Обложка на ежедневник. Натуральная кожа.\nРоспись Мандалы Женского Благополучия.\n100% ручная работа",
        grad: "from-rose-700 to-rose-900",
    },
    {
        id: "p2", title: "Обложка на ежедневник", price: 3800, seller: "Денежные кошельки, обложки и т. д.",
        category: "Гардероб", breadcrumb: ["Главная", "Гардероб", "Женщинам", "Аксессуары"],
        views: 87, description: "Натуральная кожа, ручная роспись.", grad: "from-stone-300 to-stone-500",
    },
    {
        id: "p3", title: "Сильфида", price: 1500, seller: "_КРАСНАЯ ХИМЕРА_", category: "Гардероб",
        breadcrumb: ["Главная", "Гардероб", "Украшения"], description: "Колье ручной работы.",
        grad: "from-slate-500 to-slate-800",
    },
    {
        id: "p4", title: "Камилла", price: 3500, seller: "_КРАСНАЯ ХИМЕРА_", category: "Гардероб",
        breadcrumb: ["Главная", "Гардероб", "Украшения"], description: "Эксклюзивное колье.",
        grad: "from-red-700 to-rose-900",
    },
    {
        id: "p5", title: "Сирена", price: 3500, seller: "_КРАСНАЯ ХИМЕРА_", category: "Гардероб",
        breadcrumb: ["Главная", "Гардероб", "Украшения"], description: "Бирюзовое колье.",
        grad: "from-cyan-500 to-blue-700",
    },
    {
        id: "p6", title: "Шоу мыльных пузырей", price: 3000, seller: "Организация детских праздников",
        category: "Для детей", breadcrumb: ["Главная", "Для детей", "Праздники"],
        description: "Незабываемое шоу для детей 30-40 минут.", grad: "from-amber-400 to-pink-500",
    },
    {
        id: "p7", title: "Чёрные шлёпанцы Crocs", price: 2700, old: 4499, seller: "SABOO Волгоград",
        category: "Гардероб", breadcrumb: ["Главная", "Гардероб", "Обувь"], ozon: true,
        description: "Оригинальные Crocs, лёгкие и удобные.", grad: "from-zinc-700 to-zinc-900",
    },
    {
        id: "p8", title: "Детские синие сабо", price: 1950, old: 3899, seller: "SABOO Волгоград",
        category: "Для детей", breadcrumb: ["Главная", "Для детей", "Обувь"], ozon: true,
        description: "Удобные детские сабо.", grad: "from-blue-600 to-indigo-800",
    },
    {
        id: "p9", title: 'Умные часы Polar Vantage M2', price: 18000, seller: "MP33", sellerSubs: "Спортивные товары",
        category: "Электроника", breadcrumb: ["Главная", "Электроника", "Смартфоны и гаджеты", "Смарт-часы и фитнес-браслеты", "Смарт-часы"],
        views: 998,
        description: "Мультиспортивные GPS-часы Polar Vantage M2 — это отличное сочетание производительности, функциональности и спортивного настроя. Они предоставляют вам рекомендации и данные, которые помогут вам получить мощные и необходимые функции smartwatch, позволяющие оставаться на связи. Это ваш универсальный помощник на пути к новым достижениям в области PR.",
        grad: "from-zinc-800 to-black",
    },
    {
        id: "p10", title: "Компьютерная сборка", price: 5000, seller: 'Сервисный центр "Чип"', sellerSubs: "Компьютерные услуги",
        category: "Электроника", breadcrumb: ["Главная", "Электроника", "Компьютеры и ноутбуки", "Компьютеры"],
        views: 800, stock: 1, description: "Компактный системный мини-блок для офисных задач/интернета/нетребовательных игр",
        grad: "from-amber-500 to-yellow-700",
    },
];

const fmt = (n: number) => n.toLocaleString("ru-RU") + " ₽";

/* ---------- main ---------- */

type View =
    | { kind: "catalog" }
    | { kind: "category"; category: string }
    | { kind: "product"; id: string }
    | { kind: "seller"; seller: string }
    | { kind: "cart" }
    | { kind: "checkout" };

const Market = () => {
    const [view, setView] = useState<View>({ kind: "catalog" });
    const [cart, setCart] = useState<Record<string, number>>({});
    const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
    const [messageProduct, setMessageProduct] = useState<Product | null>(null);

    const cartCount = Object.values(cart).reduce((s, n) => s + n, 0);
    const cartItems = useMemo(
        () => Object.entries(cart).map(([id, qty]) => ({ product: products.find(p => p.id === id)!, qty })).filter(x => x.product),
        [cart],
    );
    const cartTotal = cartItems.reduce((s, { product, qty }) => s + product.price * qty, 0);

    const addToCart = (id: string, n = 1) => setCart(c => ({ ...c, [id]: (c[id] || 0) + n }));
    const setQty = (id: string, n: number) => setCart(c => {
        const next = { ...c };
        if (n <= 0) delete next[id]; else next[id] = n;
        return next;
    });
    const clearSeller = (seller: string) => setCart(c => {
        const next = { ...c };
        Object.keys(next).forEach(id => { if (products.find(p => p.id === id)?.seller === seller) delete next[id]; });
        return next;
    });
    const toggleBookmark = (id: string) => setBookmarks(b => {
        const next = new Set(b); next.has(id) ? next.delete(id) : next.add(id); return next;
    });

    /* ---------- top bar (always visible) ---------- */
    const TopActions = (
        <div className="panel-card flex items-center gap-3 p-3">
            <button onClick={() => setView({ kind: "catalog" })} className="button-pill flex items-center gap-2">
                <Menu className="w-4 h-4" /> Каталог
            </button>
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input className="w-full h-9 pl-9 pr-3 rounded-lg bg-secondary text-sm placeholder:text-muted-foreground focus:outline-none" placeholder="Поиск в Маркете" />
            </div>
            <button onClick={() => setView({ kind: "cart" })} className="button-pill flex items-center gap-2 relative">
                <ShoppingCart className="w-4 h-4" /> Корзина
                {cartCount > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold">{cartCount}</span>
                )}
            </button>
        </div>
    );

    /* ---------- right rail per view ---------- */

    const CatalogRail = (
        <>
            <div className="panel-card p-2">
                {["Женщинам", "Мужчинам", "Детям"].map(s => (
                    <button key={s} className="sidebar-nav-item w-full justify-start">{s}</button>
                ))}
            </div>
            <div className="panel-card p-4">
                <div className="font-semibold mb-3">Фильтры</div>
                <div className="text-xs text-muted-foreground mb-1.5">Сортировка</div>
                <button className="w-full h-9 px-3 rounded-lg bg-secondary text-sm flex items-center justify-between mb-3">
                    По популярности <ChevronDown className="w-4 h-4" />
                </button>
                <div className="text-xs text-muted-foreground mb-1.5">Цена, ₽</div>
                <div className="flex gap-2 mb-3">
                    <input className="flex-1 h-9 px-3 rounded-lg bg-secondary text-sm" placeholder="От" />
                    <input className="flex-1 h-9 px-3 rounded-lg bg-secondary text-sm" placeholder="До" />
                </div>
                <label className="flex items-center gap-2 text-sm py-1.5">
                    <input type="checkbox" className="accent-primary" /> Оплата VK Pay или Ozon
                </label>
                <label className="flex items-center gap-2 text-sm py-1.5">
                    <input type="checkbox" className="accent-primary" /> Товары со скидкой
                </label>
                <div className="text-sm font-semibold mt-3 mb-2">Доставка</div>
                {["Курьером", "Самовывоз", "Любая"].map((d, i) => (
                    <label key={d} className="flex items-center gap-2 text-sm py-1.5">
                        <input type="radio" name="delivery" defaultChecked={i === 2} className="accent-primary" /> {d}
                    </label>
                ))}
            </div>
        </>
    );

    /* ---------- views ---------- */

    const renderCatalog = () => (
        <>
            {TopActions}

            <div className="panel-card p-4">
                <div className="grid grid-cols-9 gap-2">
                    {cats.map(({ label, icon: Icon, color }) => (
                        <button key={label} onClick={() => setView({ kind: "category", category: label })}
                                className="flex flex-col items-center gap-2 group">
                            <div className="w-12 h-12 rounded-2xl bg-secondary group-hover:bg-accent transition-colors flex items-center justify-center">
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <span className="text-[11px] text-center leading-tight">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="panel-card p-3 flex items-center gap-2 flex-wrap">
                <button className="button-pill bg-secondary">Все товары</button>
                <button className="button-pill bg-transparent text-muted-foreground">Заказы</button>
                <button className="button-pill bg-transparent text-muted-foreground">Закладки</button>
                <button className="button-pill bg-transparent text-muted-foreground">Отзывы</button>
                <button className="ml-auto button-pill bg-transparent flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" /> Bucureşti
                </button>
            </div>

            <div className="panel-card p-4">
                <div className="font-semibold mb-4">Может заинтересовать</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3">
                    {products.map(p => <ProductCard key={p.id} p={p} />)}
                </div>
            </div>
        </>
    );

    const renderCategory = (category: string) => {
        const list = products.filter(p => p.category === category);
        return (
            <>
                {TopActions}
                <div className="panel-card p-4 flex items-center gap-2 text-sm">
                    <button onClick={() => setView({ kind: "catalog" })} className="text-muted-foreground hover:text-foreground">Главная</button>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-semibold">{category}</span>
                    <button className="ml-auto button-pill bg-transparent flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" /> Bucureşti
                    </button>
                </div>
                <div className="panel-card p-4">
                    <div className="font-semibold text-lg mb-4">{category}</div>
                    {list.length === 0 ? (
                        <div className="text-sm text-muted-foreground py-8 text-center">В этой категории пока нет товаров.</div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3">
                            {list.map(p => <ProductCard key={p.id} p={p} />)}
                        </div>
                    )}
                </div>
            </>
        );
    };

    function ProductCard({ p }: { p: Product }) {
        const isBm = bookmarks.has(p.id);
        return (
            <div className="group cursor-pointer" onClick={() => setView({ kind: "product", id: p.id })}>
                <div className={`relative aspect-square rounded-xl bg-linear-to-br ${p.grad} overflow-hidden`}>
                    {p.ozon && <span className="absolute top-2 left-2 text-[10px] font-bold bg-primary px-2 py-0.5 rounded text-primary-foreground">ЗАКАЗ НА OZON</span>}
                    <button onClick={(e) => { e.stopPropagation(); toggleBookmark(p.id); }}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/60 backdrop-blur flex items-center justify-center hover:bg-background/80">
                        <Bookmark className={`w-3.5 h-3.5 ${isBm ? "fill-primary text-primary" : ""}`} />
                    </button>
                </div>
                <div className="mt-2 px-1">
                    <div className="text-sm font-semibold flex items-baseline gap-2">
                        {fmt(p.price)} {p.old && <span className="text-xs text-muted-foreground line-through">{fmt(p.old)}</span>}
                    </div>
                    <div className="text-xs truncate mt-0.5">{p.title}</div>
                    {p.rating && <div className="text-[11px] text-muted-foreground mt-0.5">★ {p.rating} · {p.reviews}</div>}
                    <button onClick={(e) => { e.stopPropagation(); setView({ kind: "seller", seller: p.seller }); }}
                            className="text-[11px] text-muted-foreground mt-0.5 truncate hover:text-foreground block max-w-full text-left">
                        {p.seller}
                    </button>
                </div>
            </div>
        );
    }

    const renderProduct = (id: string) => {
        const p = products.find(x => x.id === id);
        if (!p) return <div className="panel-card p-6">Товар не найден</div>;
        const inCart = cart[p.id] || 0;
        const sellerOther = products.filter(x => x.seller === p.seller && x.id !== p.id);

        return (
            <>
                {TopActions}
                <div className="panel-card p-4">
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                        {p.breadcrumb.map((b, i) => (
                            <span key={i} className="flex items-center gap-2">
                <button
                    onClick={() => i === 0 ? setView({ kind: "catalog" }) : setView({ kind: "category", category: p.category })}
                    className="text-muted-foreground hover:text-foreground"
                >{b}</button>
                                {i < p.breadcrumb.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
              </span>
                        ))}
                        <button className="ml-auto button-pill bg-transparent flex items-center gap-1.5 text-muted-foreground">
                            <Share2 className="w-3.5 h-3.5" /> Поделиться
                        </button>
                    </div>
                </div>

                <div className="panel-card p-4">
                    <div className="grid grid-cols-[80px_minmax(0,1fr)_360px] gap-4">
                        {/* thumbs */}
                        <div className="flex flex-col gap-2">
                            {[0, 1, 2].map(i => (
                                <div key={i} className={`aspect-square rounded-lg bg-linear-to-br ${p.grad} ${i === 0 ? "ring-2 ring-primary" : "opacity-70"}`} />
                            ))}
                        </div>
                        {/* main image */}
                        <div className={`relative rounded-xl bg-linear-to-br ${p.grad} aspect-square w-full`} />
                        {/* details */}
                        <div className="flex flex-col">
                            <div className="text-2xl font-bold">{fmt(p.price)}</div>
                            {p.views !== undefined && (
                                <button className="button-pill self-start mt-2 bg-secondary text-xs flex items-center gap-1.5">
                                    <Eye className="w-3.5 h-3.5 text-primary" /> Посмотрели {p.views} человек
                                </button>
                            )}
                            <h1 className="text-xl font-bold mt-3">{p.title}</h1>
                            <div className="flex items-center gap-1.5 mt-1.5 text-sm">
                                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-muted-foreground" />)}
                                <span className="text-muted-foreground">· Нет отзывов</span>
                            </div>
                            {p.stock !== undefined && (
                                <div className="mt-3 text-sm text-destructive font-semibold">В наличии · {p.stock} шт.</div>
                            )}
                            <p className="text-sm text-muted-foreground mt-3">Перед покупкой уточняйте характеристики и комплектацию у продавца</p>

                            <div className="mt-4 flex flex-col gap-2">
                                {inCart > 0 ? (
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 bg-secondary rounded-lg h-11 px-2">
                                            <button onClick={() => setQty(p.id, inCart - 1)} className="w-8 h-8 rounded-md hover:bg-accent flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                                            <span className="w-8 text-center font-semibold">{inCart}</span>
                                            <button onClick={() => setQty(p.id, inCart + 1)} className="w-8 h-8 rounded-md hover:bg-accent flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                                        </div>
                                        <button onClick={() => setView({ kind: "cart" })} className="flex-1 h-11 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors">
                                            Перейти в корзину
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => addToCart(p.id)} className="h-11 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors">
                                        Заказать
                                    </button>
                                )}

                                <div className="flex items-center gap-2">
                                    <button onClick={() => setMessageProduct(p)} className="flex-1 h-11 rounded-lg bg-secondary hover:bg-accent font-medium transition-colors">
                                        Написать
                                    </button>
                                    <button onClick={() => toggleBookmark(p.id)} className="w-11 h-11 rounded-lg bg-secondary hover:bg-accent flex items-center justify-center">
                                        <Bookmark className={`w-4 h-4 ${bookmarks.has(p.id) ? "fill-primary text-primary" : ""}`} />
                                    </button>
                                </div>
                                <div className="text-xs text-emerald-500 font-medium">Быстро отвечает · В среднем — за 1 час</div>
                            </div>

                            <button onClick={() => setView({ kind: "seller", seller: p.seller })}
                                    className="mt-4 flex items-center gap-3 text-left hover:bg-secondary/50 p-2 -mx-2 rounded-lg transition-colors">
                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-purple-600 shrink-0" />
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold truncate">{p.seller}</div>
                                    {p.sellerSubs && <div className="text-xs text-muted-foreground truncate">{p.sellerSubs}</div>}
                                </div>
                            </button>
                            <button className="mt-2 h-10 rounded-lg bg-secondary hover:bg-accent font-medium text-sm transition-colors">Подписаться</button>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="font-semibold mb-2">Описание</div>
                        <p className="text-sm whitespace-pre-line">{p.description}</p>
                        <button className="mt-3 text-sm text-muted-foreground hover:text-foreground">Пожаловаться на товар</button>
                    </div>
                </div>

                <div className="panel-card p-4">
                    <div className="flex items-center gap-6 border-b border-border pb-3 mb-4">
                        <button className="flex items-center gap-2 text-sm font-semibold text-primary border-b-2 border-primary pb-2 -mb-3.5">
                            <Star className="w-4 h-4" /> Отзывы <span className="text-muted-foreground">0</span>
                        </button>
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                            <MessageSquare className="w-4 h-4" /> Комментарии <span>0</span>
                        </button>
                    </div>
                    <div className="text-center py-10">
                        <div className="font-semibold">Оставьте первый отзыв о товаре</div>
                        <button className="button-pill mt-3 bg-secondary">Оставить отзыв</button>
                    </div>
                </div>

                <div className="panel-card p-4">
                    <div className="font-semibold mb-3">О продавце</div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-purple-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate">{p.seller}</div>
                            <div className="text-xs text-muted-foreground">★ Нет отзывов</div>
                            {p.sellerSubs && <div className="text-xs text-muted-foreground">{p.sellerSubs}</div>}
                        </div>
                        <button className="button-pill bg-secondary">Подписаться</button>
                        <button onClick={() => setView({ kind: "seller", seller: p.seller })} className="button-pill bg-secondary">Перейти в магазин</button>
                    </div>
                </div>

                {sellerOther.length > 0 && (
                    <div className="panel-card p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="font-semibold">Другие товары сообщества</div>
                            <button onClick={() => setView({ kind: "seller", seller: p.seller })} className="text-sm text-primary flex items-center gap-1">
                                Показать все <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {sellerOther.slice(0, 5).map(o => <ProductCard key={o.id} p={o} />)}
                        </div>
                    </div>
                )}
            </>
        );
    };

    const renderSeller = (seller: string) => {
        const list = products.filter(p => p.seller === seller);
        const sample = list[0];
        return (
            <>
                {TopActions}
                <div className="panel-card p-4 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-linear-to-br from-primary to-purple-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <div className="font-bold truncate">{seller}</div>
                        {sample?.sellerSubs && <div className="text-xs text-muted-foreground">{sample.sellerSubs}</div>}
                        <div className="text-xs text-muted-foreground">79 подписчиков</div>
                    </div>
                    <button className="button-pill bg-secondary">Подписаться</button>
                    <button onClick={() => sample && setMessageProduct(sample)} className="button-pill bg-secondary flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" /> Сообщение
                    </button>
                </div>

                <div className="panel-card p-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input className="w-full h-9 pl-9 pr-3 rounded-lg bg-secondary text-sm" placeholder="Поиск товаров сообщества" />
                    </div>
                </div>

                <div className="panel-card p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="font-semibold">Все товары</div>
                        <button className="button-pill bg-secondary text-xs flex items-center gap-1.5">По умолчанию <ChevronDown className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3">
                        {list.map(p => (
                            <div key={p.id}>
                                <ProductCard p={p} />
                                <button onClick={() => setMessageProduct(p)} className="mt-2 w-full h-8 rounded-lg bg-secondary hover:bg-accent text-sm font-medium transition-colors">
                                    Написать
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        );
    };

    const renderCart = () => {
        // group by seller
        const groups = cartItems.reduce<Record<string, typeof cartItems>>((acc, it) => {
            (acc[it.product.seller] ||= []).push(it); return acc;
        }, {});

        return (
            <>
                {TopActions}
                <div className="panel-card p-4">
                    <div className="grid grid-cols-9 gap-2">
                        {cats.map(({ label, icon: Icon, color }) => (
                            <button key={label} onClick={() => setView({ kind: "category", category: label })}
                                    className="flex flex-col items-center gap-2 group">
                                <div className="w-12 h-12 rounded-2xl bg-secondary group-hover:bg-accent flex items-center justify-center">
                                    <Icon className={`w-5 h-5 ${color}`} />
                                </div>
                                <span className="text-[11px] text-center leading-tight">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {cartItems.length === 0 ? (
                    <div className="panel-card p-10 text-center">
                        <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                        <div className="font-semibold">Корзина пуста</div>
                        <div className="text-sm text-muted-foreground mt-1">Добавьте товары, чтобы оформить заказ</div>
                        <button onClick={() => setView({ kind: "catalog" })} className="button-pill mt-4 bg-primary text-primary-foreground">К покупкам</button>
                    </div>
                ) : Object.entries(groups).map(([seller, list]) => {
                    const subTotal = list.reduce((s, { product, qty }) => s + product.price * qty, 0);
                    return (
                        <div key={seller} className="panel-card p-4">
                            <div className="flex items-center gap-3 pb-3 border-b border-border">
                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-purple-600 shrink-0" />
                                <button onClick={() => setView({ kind: "seller", seller })} className="font-semibold hover:text-primary truncate">{seller}</button>
                                <div className="ml-auto flex items-center gap-2">
                                    <button onClick={() => setMessageProduct(list[0].product)} className="button-pill bg-secondary text-xs">Написать продавцу</button>
                                    <button onClick={() => clearSeller(seller)} className="button-pill bg-secondary text-xs">Удалить все товары</button>
                                </div>
                            </div>

                            {list.map(({ product, qty }) => (
                                <div key={product.id} className="flex items-center gap-4 py-4 border-b border-border last:border-0">
                                    <div className={`w-24 h-24 rounded-lg bg-linear-to-br ${product.grad} shrink-0 cursor-pointer`}
                                         onClick={() => setView({ kind: "product", id: product.id })} />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold">{fmt(product.price)}</div>
                                        <button onClick={() => setView({ kind: "product", id: product.id })} className="text-sm hover:text-primary truncate block max-w-full text-left">
                                            {product.title}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-1 bg-secondary rounded-lg h-9 px-2">
                                        <button onClick={() => setQty(product.id, qty - 1)} className="w-7 h-7 rounded-md hover:bg-accent flex items-center justify-center"><Minus className="w-3.5 h-3.5" /></button>
                                        <span className="w-7 text-center text-sm font-semibold">{qty}</span>
                                        <button onClick={() => setQty(product.id, qty + 1)} className="w-7 h-7 rounded-md hover:bg-accent flex items-center justify-center"><Plus className="w-3.5 h-3.5" /></button>
                                    </div>
                                    <button onClick={() => toggleBookmark(product.id)} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5">
                                        <Bookmark className={`w-4 h-4 ${bookmarks.has(product.id) ? "fill-primary text-primary" : ""}`} /> В закладки
                                    </button>
                                    <button onClick={() => setQty(product.id, 0)} className="text-sm text-muted-foreground hover:text-destructive flex items-center gap-1.5">
                                        <Trash2 className="w-4 h-4" /> Удалить
                                    </button>
                                </div>
                            ))}

                            <div className="pt-4 flex items-start gap-6">
                                <div className="flex-1">
                                    <div className="font-semibold">Итого {list.length} товар:</div>
                                    <div className="text-sm text-muted-foreground mt-1">Без учёта доставки, оплата VK Pay или по договорённости с продавцом</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold mb-3">{fmt(subTotal)}</div>
                                    <button onClick={() => setView({ kind: "checkout" })} className="button-pill bg-secondary hover:bg-accent">Перейти к оформлению</button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </>
        );
    };

    const renderCheckout = () => {
        const sellerName = cartItems[0]?.product.seller || "Продавец";
        return (
            <>
                {TopActions}
                <div className="panel-card p-4 flex items-center gap-2 text-sm">
                    <button onClick={() => setView({ kind: "seller", seller: sellerName })} className="text-muted-foreground hover:text-foreground">{sellerName}</button>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    <button className="text-muted-foreground hover:text-foreground">Товары</button>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    <button onClick={() => setView({ kind: "cart" })} className="text-muted-foreground hover:text-foreground">Корзина</button>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-semibold">Оформление заказа</span>
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-4">
                    <div className="panel-card p-5 flex flex-col gap-5">
                        <div>
                            <div className="text-sm font-semibold mb-2">Город <span className="text-destructive">*</span></div>
                            <button className="w-full h-11 px-3 rounded-lg bg-secondary text-sm flex items-center justify-between">
                                Bucureşti <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="border-t border-border pt-4">
                            <div className="font-semibold">Способы доставки</div>
                            <p className="text-sm text-muted-foreground mt-1">Информацию о доступных способах доставки, их стоимости и сроках уточняйте после оформления заказа в чате с продавцом</p>
                        </div>
                        <div className="border-t border-border pt-4">
                            <div className="font-semibold">Получатель</div>
                            <p className="text-sm text-muted-foreground mt-1">Указывайте реальные данные, при получении у вас могут попросить паспорт</p>
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <div>
                                    <label className="text-xs text-muted-foreground">Имя <span className="text-destructive">*</span></label>
                                    <input className="mt-1 w-full h-11 px-3 rounded-lg bg-secondary text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground">Фамилия <span className="text-destructive">*</span></label>
                                    <input className="mt-1 w-full h-11 px-3 rounded-lg bg-secondary text-sm" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <label className="text-xs text-muted-foreground">Номер телефона <span className="text-destructive">*</span></label>
                                <input className="mt-1 w-full h-11 px-3 rounded-lg bg-secondary text-sm" />
                            </div>
                            <label className="flex items-center gap-2 text-sm mt-3">
                                <input type="checkbox" className="accent-primary" /> Заполнить данные из профиля
                            </label>
                        </div>
                        <div className="border-t border-border pt-4">
                            <div className="font-semibold">Комментарий к заказу</div>
                            <textarea className="mt-2 w-full h-24 p-3 rounded-lg bg-secondary text-sm resize-none" placeholder="Пожелания к товару или доставке" />
                        </div>
                        <div className="border-t border-border pt-4">
                            <div className="font-semibold mb-3">Заказ</div>
                            {cartItems.map(({ product, qty }) => (
                                <div key={product.id} className="flex items-center gap-3 py-2">
                                    <div className={`w-16 h-16 rounded-lg bg-linear-to-br ${product.grad} shrink-0`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold">{product.title}</div>
                                        <div className="text-xs text-muted-foreground">{qty} × {fmt(product.price)}</div>
                                    </div>
                                    <div className="font-semibold text-sm">{fmt(product.price * qty)}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="panel-card p-5 h-fit sticky top-18 flex flex-col gap-4">
                        <div className="font-semibold">Оплата</div>
                        <label className="flex items-start gap-2 text-sm">
                            <input type="radio" defaultChecked className="accent-primary mt-1" />
                            <span>
                Оплатить сейчас
                <div className="text-xs text-muted-foreground mt-0.5">Завершите оформление, оплатив заказ картой</div>
              </span>
                        </label>
                        <button className="text-sm text-primary text-left">Ввести промокод</button>
                        <div className="flex items-center justify-between text-sm border-t border-border pt-3">
                            <span>{cartItems.length} товар на сумму</span>
                            <span className="font-semibold">{fmt(cartTotal)}</span>
                        </div>
                        <div className="flex items-center justify-between font-bold border-t border-border pt-3">
                            <span>Итого к оплате</span>
                            <span>{fmt(cartTotal)}</span>
                        </div>
                        <button className="h-11 rounded-lg bg-secondary hover:bg-accent font-semibold transition-colors">Оформить заказ</button>
                        <p className="text-xs text-muted-foreground">
                            Оформляя заказ, вы соглашаетесь с условиями <span className="text-primary">Пользовательского соглашения</span> и <span className="text-primary">Договора оферты</span>.
                        </p>
                    </div>
                </div>
            </>
        );
    };

    /* ---------- render ---------- */

    const right = view.kind === "catalog" || view.kind === "category" ? (
        <>
            {CatalogRail}
        </>
    ) : undefined;

    let content;
    switch (view.kind) {
        case "catalog": content = renderCatalog(); break;
        case "category": content = renderCategory(view.category); break;
        case "product": content = renderProduct(view.id); break;
        case "seller": content = renderSeller(view.seller); break;
        case "cart": content = renderCart(); break;
        case "checkout": content = renderCheckout(); break;
    }

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 w-full flex flex-col gap-3">{content}</div>
            <aside className="hidden xl:flex flex-col w-70 shrink-0 py-0 gap-3 sticky top-18 self-start max-h-[calc(100vh-72px)]">
                {right}
            </aside>
            <Dialog open={!!messageProduct} onOpenChange={(o) => !o && setMessageProduct(null)}>
                <DialogContent className="max-w-130 p-0 rounded-2xl overflow-hidden bg-popover border-border">
                    <DialogHeader className="px-4 py-3 border-b border-border flex-row items-center space-y-0">
                        <DialogTitle className="text-sm font-semibold">Новое сообщение</DialogTitle>
                        <button className="ml-3 text-sm text-primary">Перейти к диалогу с продавцом</button>
                    </DialogHeader>
                    {messageProduct && (
                        <div className="p-4 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-purple-600 shrink-0" />
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-primary truncate">{messageProduct.seller}</div>
                                    <div className="text-xs text-muted-foreground">был в сети 22 апр в 9:51</div>
                                </div>
                            </div>
                            <textarea
                                defaultValue={"Здравствуйте!\nМеня заинтересовал этот товар."}
                                className="w-full h-28 p-3 rounded-lg bg-secondary text-sm resize-none focus:outline-none"
                            />
                            <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                                <div className={`w-12 h-12 rounded-lg bg-linear-to-br ${messageProduct.grad} shrink-0`} />
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-primary truncate">{messageProduct.title}</div>
                                    <div className="text-sm font-semibold">{fmt(messageProduct.price)}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="text-muted-foreground hover:text-foreground"><ImageIcon className="w-5 h-5" /></button>
                                <button className="text-muted-foreground hover:text-foreground"><VideoIcon className="w-5 h-5" /></button>
                                <button className="text-muted-foreground hover:text-foreground"><MusicIcon className="w-5 h-5" /></button>
                                <button className="text-muted-foreground hover:text-foreground"><Gift className="w-5 h-5" /></button>
                                <button className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">Ещё <ChevronDown className="w-3.5 h-3.5" /></button>
                                <button className="ml-auto text-muted-foreground hover:text-foreground"><Smile className="w-5 h-5" /></button>
                                <button onClick={() => setMessageProduct(null)} className="button-pill bg-secondary hover:bg-accent">Отправить</button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Market;
