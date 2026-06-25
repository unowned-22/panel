import { useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type TabKey = "main" | "popular" | "games" | "vk" | "health" | "social" | "fun" | "more";

const tabs: { key: TabKey; label: string }[] = [
    { key: "main", label: "Главная" },
    { key: "popular", label: "Популярное" },
    { key: "games", label: "Игры" },
    { key: "vk", label: "От ВКонтакте" },
    { key: "health", label: "Здоровье и фитнес" },
    { key: "social", label: "Общение" },
    { key: "fun", label: "Развлечения" },
    { key: "more", label: "Ещё" },
];

type Service = {
    id: string;
    title: string;
    category: string;
    /** CSS background для иконки */
    bg: string;
    /** Эмодзи/символ как «иконка» */
    glyph: string;
    badge?: "NEW" | number;
};

const banners = [
    {
        title: "Отправьте себе послание в будущее",
        subtitle: "Капсула времени VK Education",
        cta: "Запустить",
        bg: "linear-gradient(135deg, hsl(211 100% 56%), hsl(220 90% 35%))",
        glyph: "⏳",
    },
    {
        title: "«Единство в культуре»",
        subtitle: "Пройди тест и узнай про традиции народов",
        cta: "Пройти",
        bg: "linear-gradient(135deg, hsl(220 90% 40%), hsl(260 70% 45%))",
        glyph: "🪆",
    },
    {
        title: "Мини-курс: продуктивность",
        subtitle: "5 уроков, чтобы успевать больше",
        cta: "Начать",
        bg: "linear-gradient(135deg, hsl(280 80% 55%), hsl(330 80% 55%))",
        glyph: "🎓",
    },
];

const newServices: Service[] = [
    { id: "ai-designer", title: "AI Designer", category: "Инструменты", bg: "linear-gradient(135deg,#1e3a8a,#7c3aed)", glyph: "🎨" },
    { id: "tile-calc", title: "Калькулятор плитки", category: "Инструменты", bg: "linear-gradient(135deg,#0f3b6e,#1e6fb8)", glyph: "🧮" },
    { id: "trip-planner", title: "Планировщик маршрутов", category: "Путешествия", bg: "linear-gradient(135deg,#ea580c,#f59e0b)", glyph: "🗺️" },
    { id: "mood", title: "Моё настроение", category: "Образ жизни", bg: "linear-gradient(135deg,#22d3ee,#06b6d4)", glyph: "🙂" },
    { id: "diary", title: "Занимательная диета", category: "Образ жизни", bg: "linear-gradient(135deg,#f5d6a8,#a8895a)", glyph: "☯️" },
    { id: "tarolog", title: "Tarolog Online", category: "Предсказания", bg: "linear-gradient(135deg,#1e1b4b,#7c3aed)", glyph: "🔮" },
];

const editorsChoice: Service[] = [
    { id: "vk-dating", title: "VK Знакомства", category: "Выбор редакции", bg: "linear-gradient(135deg,#3b82f6,#ec4899)", glyph: "♥" },
    { id: "statuses", title: "Статусы", category: "Развлечения", bg: "linear-gradient(135deg,#facc15,#f59e0b)", glyph: "😊" },
    { id: "guests", title: "Мои гости", category: "Сервис", bg: "linear-gradient(135deg,#fda4af,#fb7185)", glyph: "👀" },
    { id: "fate", title: "Шар судьбы", category: "Развлечения", bg: "linear-gradient(135deg,#7c3aed,#a855f7)", glyph: "🔮", badge: "NEW" },
    { id: "requiem", title: "Реквием", category: "Игры", bg: "linear-gradient(135deg,#0f172a,#7f1d1d)", glyph: "⚔️" },
    { id: "rabbits", title: "Кролики", category: "Игры", bg: "linear-gradient(135deg,#f59e0b,#fde68a)", glyph: "🐰" },
];

const healthServices: Service[] = [
    { id: "vk-steps", title: "VK Шаги", category: "Здоровье", bg: "linear-gradient(135deg,#38bdf8,#0ea5e9)", glyph: "👟" },
    { id: "workouts", title: "Тренировки", category: "Здоровье", bg: "linear-gradient(135deg,#a78bfa,#7c3aed)", glyph: "🏋️" },
    { id: "calendar-h", title: "Мой Календарь", category: "Здоровье", bg: "linear-gradient(135deg,#fecaca,#fb7185)", glyph: "♀" },
    { id: "food-diary", title: "Дневник питания", category: "Здоровье", bg: "linear-gradient(135deg,#34d399,#10b981)", glyph: "🍎" },
    { id: "vk-run", title: "VK Бег", category: "Здоровье", bg: "linear-gradient(135deg,#22c55e,#15803d)", glyph: "🏃" },
    { id: "measure", title: "Замеры", category: "Здоровье", bg: "linear-gradient(135deg,#fde68a,#f59e0b)", glyph: "📏" },
];

const socialServices: Service[] = [
    { id: "vk-dating-2", title: "VK Знакомства", category: "Общение", bg: "linear-gradient(135deg,#3b82f6,#ec4899)", glyph: "♥" },
    { id: "echo", title: "Эхо — Анонимные", category: "Общение", bg: "linear-gradient(135deg,#0a0a0a,#1f2937)", glyph: "🎙️" },
    { id: "valentines", title: "Коробка валентинок", category: "Общение", bg: "linear-gradient(135deg,#fb923c,#f43f5e)", glyph: "💌" },
    { id: "near", title: "Знакомства рядом", category: "Общение", bg: "linear-gradient(135deg,#7f1d1d,#ef4444)", glyph: "👫" },
    { id: "anon-msg", title: "Анонимный Мессенджер", category: "Общение", bg: "linear-gradient(135deg,#3b82f6,#60a5fa)", glyph: "♡" },
    { id: "love-c", title: "Знакомства для серьёзных", category: "Общение", bg: "linear-gradient(135deg,#fee2e2,#dc2626)", glyph: "❤️" },
];

const popularServices: Service[] = [
    ...newServices,
    ...editorsChoice,
    ...healthServices,
    ...socialServices,
];

const ServiceCard = ({ s }: { s: Service }) => (
    <button className="group flex flex-col text-left">
        <div
            className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-sm transition-transform group-hover:scale-[1.02]"
            style={{ background: s.bg }}
        >
            <div className="absolute inset-0 flex items-center justify-center text-5xl">
                <span className="drop-shadow-md">{s.glyph}</span>
            </div>
            {s.badge && (
                <span className="absolute right-2 top-2 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
          {s.badge}
        </span>
            )}
        </div>
        <div className="mt-2 truncate px-0.5 text-sm font-semibold">{s.title}</div>
        <div className="truncate px-0.5 text-xs text-muted-foreground">{s.category}</div>
    </button>
);

const Section = ({ title, items }: { title: string; items: Service[] }) => (
    <div className="panel-card rounded-xl p-4">
        <div className="mb-4 flex items-center justify-between">
            <div className="text-base font-semibold">{title}</div>
            <button className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                Показать все <ChevronRight className="h-4 w-4" />
            </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {items.map((s) => (
                <ServiceCard key={s.id} s={s} />
            ))}
        </div>
    </div>
);

const Services = () => {
    const [activeTab, setActiveTab] = useState<TabKey>("main");

    const content = useMemo(() => {
        switch (activeTab) {
            case "popular":
                return <Section title="Популярное" items={popularServices} />;
            case "games":
                return <Section title="Игры" items={[...editorsChoice.filter((s) => s.category === "Игры"), ...newServices]} />;
            case "vk":
                return <Section title="От ВКонтакте" items={editorsChoice} />;
            case "health":
                return <Section title="Здоровье и фитнес" items={healthServices} />;
            case "social":
                return <Section title="Общение" items={socialServices} />;
            case "fun":
                return <Section title="Развлечения" items={editorsChoice} />;
            case "more":
                return <Section title="Все сервисы" items={popularServices} />;
            case "main":
            default:
                return (
                    <>
                        {/* Banners */}
                        <div className="panel-card overflow-hidden rounded-xl p-3">
                            <div className="flex gap-3 overflow-x-auto scrollbar-none">
                                {banners.map((b, i) => (
                                    <div
                                        key={i}
                                        className="relative h-65 w-105 shrink-0 overflow-hidden rounded-xl p-6 text-white"
                                        style={{ background: b.bg }}
                                    >
                                        <h2 className="max-w-60 text-2xl font-bold leading-tight drop-shadow">{b.title}</h2>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[120px] leading-none opacity-90">
                                            {b.glyph}
                                        </div>
                                        <div className="absolute inset-x-6 bottom-5 flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="text-xs font-semibold uppercase tracking-wide opacity-80">Мини-приложение</div>
                                                <div className="truncate text-sm font-semibold opacity-95">{b.subtitle}</div>
                                            </div>
                                            <button className="shrink-0 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-foreground hover:bg-white">
                                                {b.cta}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Section title="Новые" items={newServices} />
                        <Section title="Выбор редакции" items={editorsChoice} />
                        <Section title="Здоровье и фитнес" items={healthServices} />
                        <Section title="Общение" items={socialServices} />
                    </>
                );
        }
    }, [activeTab]);

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
                <section className="panel-card rounded-xl p-3">
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                        {tabs.map((t) => {
                            const active = activeTab === t.key;
                            return (
                                <button
                                    key={t.key}
                                    onClick={() => setActiveTab(t.key)}
                                    className={cn(
                                        "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                                        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary",
                                    )}
                                >
                                    {t.label}
                                </button>
                            );
                        })}
                        <div className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-secondary">
                            <Search className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                </section>
                {content}
            </div>
        </div>
    );
};

export default Services;
