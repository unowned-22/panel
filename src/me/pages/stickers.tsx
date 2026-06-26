import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
    Search,
    Settings,
    Gift,
    Play,
    Repeat,
    ChevronRight,
    Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock chats for "Send to dialog" picker
const MOCK_CHATS = [
    { id: "family", name: "❤️ Family chat", emoji: "👨‍👩‍👧" },
    { id: "leah", name: "Leah Collins", emoji: "🧑" },
    { id: "curry", name: "Curry Club", emoji: "🟡" },
    { id: "mamie", name: "Mamie Cruz", emoji: "👩" },
    { id: "evan", name: "Evan West", emoji: "🧔" },
    { id: "nannie", name: "Nannie Watts", emoji: "👵" },
    { id: "vicente", name: "Vicente de la Cruz", emoji: "🧑‍🎨" },
    { id: "kari", name: "Kari Granleese", emoji: "🧑‍💼" },
];

// Per-pack sticker grid emojis (16 stickers per set)
const PACK_STICKERS = [
    "😀", "😂", "😍", "😎", "🤩", "🥳", "😭", "😡",
    "🤔", "😴", "🤗", "🙃", "😇", "🤯", "🥰", "🤪",
];

// ---- Types ----
type StickerPack = {
    id: string;
    title: string;
    author?: string;
    cover: string; // gradient class
    emoji: string;
    price: string; // "1 голос" / "Бесплатно" / "100 голосов"
    oldPrice?: string; // "20"
    discount?: string; // "95%"
    badge?: "New" | "Anim" | "Popup";
    large?: boolean;
};

const TABS = ["Мои", "Для вас", "Анимированные", "Стили", "Влюблённым", "Бесплатные", "Все"] as const;
type Tab = (typeof TABS)[number];

const BANNERS = [
    { title: "Всех дочек\nс праздником!", subtitle: "Выбирайте подарки в каталоге", cta: "Выбрать", gradient: "from-orange-500 via-rose-500 to-red-600", emoji: "🦊🌹" },
    { title: "Новый\nв наборе", subtitle: "«Мечты»", cta: "К набору", gradient: "from-rose-400 via-pink-400 to-fuchsia-500", emoji: "💌" },
    { title: "Анимация\nоживает", subtitle: "Лучшие движущиеся стикеры", cta: "Смотреть", gradient: "from-indigo-500 via-purple-500 to-pink-500", emoji: "✨" },
    { title: "Бесплатные\nнаборы", subtitle: "Забирай прямо сейчас", cta: "Забрать", gradient: "from-emerald-500 via-teal-500 to-cyan-500", emoji: "🎁" },
];

const COVERS = [
    "from-pink-300 to-rose-400",
    "from-violet-400 to-fuchsia-500",
    "from-amber-300 to-orange-500",
    "from-emerald-300 to-teal-500",
    "from-sky-300 to-indigo-500",
    "from-rose-300 to-pink-500",
    "from-lime-300 to-emerald-500",
    "from-yellow-300 to-amber-500",
    "from-cyan-300 to-blue-500",
    "from-fuchsia-300 to-purple-500",
];

const EMOJIS = ["😺", "🐻", "🦊", "🐶", "🐸", "🐰", "🐼", "🐨", "🦄", "🐧", "🐱", "🐯", "🍄", "💖", "👻", "🐹"];

const makePacks = (prefix: string, count: number, opts?: Partial<StickerPack>): StickerPack[] =>
    Array.from({ length: count }, (_, i) => ({
        id: `${prefix}-${i}`,
        title: `${prefix} ${i + 1}`,
        cover: COVERS[(i + prefix.length) % COVERS.length],
        emoji: EMOJIS[(i * 3 + prefix.length) % EMOJIS.length],
        price: i % 5 === 0 ? "100 голосов" : "1 голос",
        oldPrice: i % 5 === 0 ? undefined : i % 2 === 0 ? "20" : "10",
        discount: i % 5 === 0 ? undefined : i % 3 === 0 ? "95%" : "90%",
        badge: i % 7 === 0 ? "New" : undefined,
        ...opts,
    }));

const SECTIONS: { title: string; packs: StickerPack[] }[] = [
    { title: "Новые", packs: makePacks("Новинка", 8) },
    { title: "Всплывающие стикеры", packs: makePacks("Поп", 8, { badge: "Popup" }) },
    { title: "Коллекционные", packs: makePacks("Коллекция", 8, { price: "100 голосов", discount: undefined, oldPrice: undefined }) },
    { title: "По знакам зодиака", packs: makePacks("Зодиак", 8) },
];

const ANIMATED_PACKS: StickerPack[] = [
    { id: "a1", title: "Анимированный Дигги", author: "Михаил Голубь", cover: "from-cyan-200 to-teal-300", emoji: "🐶", price: "1 голос", oldPrice: "20", discount: "95%", badge: "Anim", large: true },
    { id: "a2", title: "Мишка Михаил", author: "Анна Мозговец", cover: "from-amber-100 to-yellow-300", emoji: "🐻", price: "1 голос", oldPrice: "20", discount: "95%", large: true },
    { id: "a3", title: "Анимированный Крис", author: "Варвара Максименкова", cover: "from-sky-200 to-blue-300", emoji: "🐭", price: "1 голос", oldPrice: "20", discount: "95%", large: true },
    { id: "a4", title: "Мудакот", author: "MDK", cover: "from-stone-200 to-stone-400", emoji: "🐕", price: "19 голосов", large: true },
    { id: "a5", title: "Ледоножек Фред", author: "Анна Мозговец", cover: "from-blue-300 to-indigo-400", emoji: "🐟", price: "Подробнее", large: true },
    { id: "a6", title: "Котошарик", author: "Антон Андреев", cover: "from-yellow-200 to-amber-300", emoji: "😺", price: "1 голос", oldPrice: "20", badge: "New", large: true },
    { id: "a7", title: "Дурачайка", author: "Антон Андреев", cover: "from-emerald-200 to-teal-300", emoji: "🦆", price: "1 голос", oldPrice: "20", discount: "95%", large: true },
    { id: "a8", title: "Мухомор Стёпа", author: "Михаил Голубь", cover: "from-pink-200 to-rose-300", emoji: "🍄", price: "1 голос", oldPrice: "20", discount: "95%", large: true },
];

// ---- UI Pieces ----
const PriceButton = ({ pack, onGift }: { pack: StickerPack; onGift?: () => void }) => (
    <div className="flex items-center gap-2">
        <button className="h-9 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white px-3 text-sm font-semibold flex items-center gap-2">
            {pack.oldPrice && <span className="line-through opacity-70">{pack.oldPrice}</span>}
            <span>{pack.price}</span>
        </button>
        {pack.price !== "Подробнее" && (
            <button
                onClick={onGift}
                className="h-9 w-9 grid place-items-center rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white"
                aria-label="Подарить"
            >
                <Gift className="h-4 w-4" />
            </button>
        )}
    </div>
);

const SmallCover = ({ pack }: { pack: StickerPack }) => (
    <div className={cn("relative aspect-square rounded-2xl overflow-hidden bg-linear-to-br", pack.cover)}>
        <div className="absolute inset-0 grid place-items-center text-5xl">{pack.emoji}</div>
        {pack.discount && (
            <span className="absolute top-2 left-2 rounded-md bg-rose-500 text-white text-xs font-bold px-1.5 py-0.5">
        {pack.discount}
      </span>
        )}
        {pack.badge === "New" && (
            <span className="absolute top-2 left-2 rounded-md bg-sky-500 text-white text-xs font-bold px-1.5 py-0.5">
        New
      </span>
        )}
        {pack.badge === "Popup" && (
            <span className="absolute bottom-2 right-2 grid place-items-center h-6 w-6 rounded-md bg-pink-500/90 text-white">
        <Repeat className="h-3.5 w-3.5" />
      </span>
        )}
        {pack.badge === "Anim" && (
            <span className="absolute bottom-2 right-2 grid place-items-center h-6 w-6 rounded-md bg-sky-500/90 text-white">
        <Play className="h-3.5 w-3.5 fill-current" />
      </span>
        )}
    </div>
);

const SmallCard = ({ pack, onOpen }: { pack: StickerPack; onOpen?: (p: StickerPack) => void }) => (
    <button type="button" onClick={() => onOpen?.(pack)} className="min-w-0 text-left group">
        <div className="transition-transform group-hover:scale-[1.02]">
            <SmallCover pack={pack} />
        </div>
        <div className="mt-2 text-sm">
            {pack.price === "Бесплатно" ? (
                <span className="text-emerald-500 font-medium">Бесплатно</span>
            ) : (
                <span className="text-muted-foreground">
          {pack.oldPrice && <span className="line-through mr-1">{pack.oldPrice}</span>}
                    <span className="text-foreground">{pack.price}</span>
        </span>
            )}
        </div>
    </button>
);

const LargeCard = ({ pack, onOpen }: { pack: StickerPack; onOpen?: (p: StickerPack) => void }) => (
    <div className="flex gap-3">
        <button
            type="button"
            onClick={() => onOpen?.(pack)}
            className={cn("relative aspect-5/3 w-[55%] rounded-2xl overflow-hidden bg-linear-to-br shrink-0 transition-transform hover:scale-[1.01]", pack.cover)}
        >
            <div className="absolute inset-0 grid place-items-center text-6xl">{pack.emoji}</div>
            {pack.discount && (
                <span className="absolute top-2 left-2 rounded-md bg-rose-500 text-white text-xs font-bold px-1.5 py-0.5">
          {pack.discount}
        </span>
            )}
            {pack.badge === "New" && (
                <span className="absolute top-2 left-2 rounded-md bg-sky-500 text-white text-xs font-bold px-1.5 py-0.5">
          New
        </span>
            )}
            {pack.badge === "Anim" && (
                <span className="absolute bottom-2 right-2 grid place-items-center h-7 w-7 rounded-full bg-sky-500/90 text-white">
          <Play className="h-4 w-4 fill-current" />
        </span>
            )}
        </button>
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
            <button type="button" onClick={() => onOpen?.(pack)} className="min-w-0 text-left">
                <h3 className="text-base font-semibold truncate hover:text-primary">{pack.title}</h3>
                {pack.author && <div className="text-sm text-muted-foreground truncate">{pack.author}</div>}
            </button>
            {pack.price === "Подробнее" ? (
                <Button variant="secondary" className="self-start h-9 rounded-lg" onClick={() => onOpen?.(pack)}>Подробнее</Button>
            ) : (
                <PriceButton pack={pack} />
            )}
        </div>
    </div>
);

const Section = ({ title, packs, onOpen }: { title: string; packs: StickerPack[]; onOpen?: (p: StickerPack) => void }) => (
    <section className="mt-6">
        <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">{title}</h2>
            <button className="text-sm text-primary hover:underline">Показать все</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            {packs.map((p) => (
                <SmallCard key={p.id} pack={p} onOpen={onOpen} />
            ))}
        </div>
    </section>
);

// ---- Pack Preview Modal ----
const PackPreviewModal = ({
                              pack,
                              open,
                              onClose,
                          }: {
    pack: StickerPack | null;
    open: boolean;
    onClose: () => void;
}) => {
    const { toast } = useToast();
    const [selectedSticker, setSelectedSticker] = useState<number | null>(null);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);

    if (!pack) return null;

    const handleSend = () => {
        if (selectedSticker === null) {
            toast({ title: "Выберите стикер", description: "Нажмите на любой стикер из набора" });
            return;
        }
        if (!selectedChat) {
            toast({ title: "Выберите диалог", description: "Кому отправить стикер?" });
            return;
        }
        const chat = MOCK_CHATS.find((c) => c.id === selectedChat);
        toast({
            title: "Стикер отправлен",
            description: `${PACK_STICKERS[selectedSticker]} → ${chat?.name}`,
        });
        setSelectedSticker(null);
        setSelectedChat(null);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(o) => {
                if (!o) {
                    setSelectedSticker(null);
                    setSelectedChat(null);
                    onClose();
                }
            }}
        >
            <DialogContent className="max-w-2xl p-0 overflow-hidden">
                <div className={cn("relative h-32 bg-linear-to-br", pack.cover)}>
                    <div className="absolute inset-0 grid place-items-center text-7xl">{pack.emoji}</div>
                    {pack.discount && (
                        <span className="absolute top-3 left-3 rounded-md bg-rose-500 text-white text-xs font-bold px-2 py-1">
              {pack.discount}
            </span>
                    )}
                </div>

                <div className="px-6 pt-4">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{pack.title}</DialogTitle>
                        <DialogDescription>
                            {pack.author ? `Автор: ${pack.author}` : "Набор стикеров"}
                            {" · "}
                            {pack.oldPrice && <span className="line-through mr-1 text-muted-foreground">{pack.oldPrice}</span>}
                            <span className="text-foreground font-medium">{pack.price}</span>
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="px-6 mt-4">
                    <div className="text-sm font-semibold mb-2">Выберите стикер</div>
                    <div className="grid grid-cols-8 gap-2 p-3 rounded-xl bg-secondary/50 max-h-55 overflow-y-auto">
                        {PACK_STICKERS.map((s, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setSelectedSticker(i)}
                                className={cn(
                                    "aspect-square rounded-lg grid place-items-center text-3xl transition-all hover:bg-background",
                                    selectedSticker === i ? "bg-primary/15 ring-2 ring-primary scale-105" : "",
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="px-6 mt-4">
                    <div className="text-sm font-semibold mb-2">Отправить в диалог</div>
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                        {MOCK_CHATS.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => setSelectedChat(c.id)}
                                className={cn(
                                    "shrink-0 flex flex-col items-center gap-1 w-16",
                                    selectedChat === c.id ? "" : "opacity-80 hover:opacity-100",
                                )}
                            >
                <span
                    className={cn(
                        "h-12 w-12 rounded-full grid place-items-center text-xl bg-linear-to-br from-secondary to-accent transition-all",
                        selectedChat === c.id ? "ring-2 ring-primary scale-105" : "",
                    )}
                >
                  {c.emoji}
                </span>
                                <span className="text-[11px] truncate w-full text-center">{c.name.split(" ")[0]}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <DialogFooter className="px-6 pb-6 pt-2 sm:justify-between gap-2">
                    <Button variant="ghost" onClick={onClose}>Отмена</Button>
                    <Button onClick={handleSend} className="gap-2">
                        <Send className="h-4 w-4" />
                        Отправить
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// ---- Page ----
const Stickers = () => {
    const [tab, setTab] = useState<Tab>("Для вас");
    const [query, setQuery] = useState("");
    const [previewPack, setPreviewPack] = useState<StickerPack | null>(null);

    const showAnimated = tab === "Анимированные";
    const showLove = tab === "Влюблённым";

    const filtered = useMemo(() => {
        if (!query) return null;
        const q = query.toLowerCase();
        const all = [...SECTIONS.flatMap((s) => s.packs), ...ANIMATED_PACKS];
        return all.filter((p) => p.title.toLowerCase().includes(q));
    }, [query]);

    const openPack = (p: StickerPack) => setPreviewPack(p);

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
                <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
                    {BANNERS.map((b, i) => (
                        <div
                            key={i}
                            className={cn(
                                "relative shrink-0 snap-start rounded-2xl overflow-hidden bg-linear-to-br text-white",
                                b.gradient,
                                i === 0 ? "w-45 h-65" : i === 1 ? "w-160 h-65" : "w-90 h-65",
                            )}
                        >
                            <div className="absolute inset-0 p-5 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-2xl font-extrabold leading-tight whitespace-pre-line drop-shadow">
                                        {b.title}
                                    </h3>
                                    <p className="mt-1 text-sm/5 opacity-95">{b.subtitle}</p>
                                </div>
                                <button className="self-start rounded-full bg-white text-foreground font-semibold text-sm px-4 h-9">
                                    {b.cta}
                                </button>
                            </div>
                            <div className="absolute -right-4 -bottom-4 text-7xl opacity-90 select-none">{b.emoji}</div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 panel-card p-2 flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Поиск"
                            className="pl-9 bg-secondary border-0 h-10"
                        />
                    </div>
                    <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full">
                        <Settings className="h-5 w-5" />
                    </Button>
                </div>
                <div className="flex gap-1 overflow-x-auto -mx-1 px-1">
                    {TABS.map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={cn(
                                "px-4 h-9 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                                tab === t ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                {filtered ? (
                    <section className="mt-4">
                        <h2 className="text-lg font-bold mb-3">Результаты: {filtered.length}</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                            {filtered.map((p) => <SmallCard key={p.id} pack={p} onOpen={openPack} />)}
                        </div>
                    </section>
                ) : showAnimated ? (
                    <section className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-5">
                        {ANIMATED_PACKS.map((p) => <LargeCard key={p.id} pack={p} onOpen={openPack} />)}
                    </section>
                ) : showLove ? (
                    <>
                        <section className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-5">
                            {[
                                { id: "l1", title: "Про любофф", author: "Анастасия Юхновец", cover: "from-zinc-700 to-zinc-900", emoji: "💖", price: "100 голосов", large: true },
                                { id: "l2", title: "Любимое лето", author: "Елена Савченко", cover: "from-amber-200 to-orange-300", emoji: "🦊", price: "1 голос", oldPrice: "10", discount: "90%", large: true },
                            ].map((p) => <LargeCard key={p.id} pack={p as StickerPack} onOpen={openPack} />)}
                        </section>
                        <Section title="Новые" packs={makePacks("Влюблённые", 7)} onOpen={openPack} />
                        <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-5">
                            {[
                                { id: "lo1", title: "Тёплые Обнимышки", author: "Анастасия Волк", cover: "from-amber-100 to-orange-200", emoji: "🐹", price: "1 голос", oldPrice: "10", discount: "90%", large: true },
                                { id: "lo2", title: "Дьявол и Дьяволица", author: "Ник Толабов", cover: "from-rose-500 to-red-600", emoji: "💃", price: "1 голос", oldPrice: "10", discount: "90%", large: true },
                                { id: "lo3", title: "Обнимышки", author: "Анастасия Волк", cover: "from-pink-200 to-rose-300", emoji: "🐭", price: "1 голос", oldPrice: "10", discount: "90%", large: true },
                                { id: "lo4", title: "Когда просто любишь", author: "Елена Савченко", cover: "from-rose-100 to-pink-200", emoji: "🐶", price: "1 голос", oldPrice: "10", discount: "90%", large: true },
                            ].map((p) => <LargeCard key={p.id} pack={p as StickerPack} onOpen={openPack} />)}
                        </section>
                    </>
                ) : tab === "Бесплатные" ? (
                    <Section title="Бесплатные наборы" packs={makePacks("Бесплатный", 14, { price: "Бесплатно", oldPrice: undefined, discount: undefined })} onOpen={openPack} />
                ) : tab === "Мои" ? (
                    <section className="mt-4">
                        <div className="panel-card p-8 text-center">
                            <div className="text-5xl mb-2">🗂️</div>
                            <h2 className="text-lg font-bold mb-1">Ваша коллекция пуста</h2>
                            <p className="text-muted-foreground text-sm mb-4">Загляните в каталог и выберите наборы</p>
                            <Button onClick={() => setTab("Для вас")}>Открыть каталог <ChevronRight className="h-4 w-4" /></Button>
                        </div>
                    </section>
                ) : (
                    SECTIONS.map((s) => <Section key={s.title} title={s.title} packs={s.packs} onOpen={openPack} />)
                )}

                <PackPreviewModal pack={previewPack} open={!!previewPack} onClose={() => setPreviewPack(null)} />
            </div>
        </div>
    );
};

export default Stickers;
