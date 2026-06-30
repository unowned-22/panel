import { useMemo, useState } from "react";
import { ChevronDown, ArrowDown, ArrowUp, Minus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type RangeKey = "7d" | "28d" | "90d" | "365d";

const RANGE_LABELS: Record<RangeKey, string> = {
    "7d": "Последние 7 дней",
    "28d": "Последние 28 дней",
    "90d": "Последние 90 дней",
    "365d": "Последние 365 дней",
};

const RANGE_DAYS: Record<RangeKey, number> = {
    "7d": 7,
    "28d": 28,
    "90d": 90,
    "365d": 365,
};

type Metric = {
    label: string;
    value: number;
    suffix?: string;
    delta: number; // percent vs previous period, can be negative
    series: number[];
    format: (n: number) => string;
};

function buildSeries(days: number, base: number, volatility: number) {
    const out: number[] = [];
    let v = base;
    for (let i = 0; i < days; i++) {
        v = Math.max(0, v + (Math.random() - 0.45) * volatility);
        out.push(Math.round(v));
    }
    return out;
}

function fmtInt(n: number) {
    return n.toLocaleString("ru-RU");
}

function fmtHours(n: number) {
    return n.toLocaleString("ru-RU", { maximumFractionDigits: 1 });
}

const topContent = [
    { title: "Mask - resoul.ua [dub]", thumbnail: "/post-photo-1.jpg", views: 5, watchHours: 0.2 },
    { title: "Glich - resoul.ua", thumbnail: "/post-music-cover.jpg", views: 17, watchHours: 0.09 },
    { title: "Space Movie Soundtrack - Starlight UA & Vence", thumbnail: "/story-1.jpg", views: 50, watchHours: 1.1 },
];

const suggestedQuestions = [
    "Как зрители находят мой контент?",
    "Сколько на моём канале новых зрителей?",
    "Дать краткую оценку эффективности последнего видео",
];

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
    const w = 280;
    const h = 70;
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const step = w / Math.max(data.length - 1, 1);

    const points = data.map((v, i) => {
        const x = i * step;
        const y = h - ((v - min) / range) * h;
        return `${x},${y}`;
    });

    const linePath = `M${points.join(" L")}`;
    const areaPath = `${linePath} L${w},${h} L0,${h} Z`;
    const stroke = positive ? "var(--analytics-up, #3b82f6)" : "var(--analytics-down, #3b82f6)";

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20" preserveAspectRatio="none">
            <path d={areaPath} fill={stroke} opacity={0.12} />
            <path d={linePath} fill="none" stroke={stroke} strokeWidth={2} />
        </svg>
    );
}

function DeltaBadge({ delta }: { delta: number }) {
    if (delta === 0) {
        return (
            <span className="inline-flex items-center text-muted-foreground">
                <Minus className="size-3.5" />
            </span>
        );
    }
    const positive = delta > 0;
    return (
        <span className={cn("inline-flex items-center", positive ? "text-green-500" : "text-red-500")}>
            {positive ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />}
        </span>
    );
}

export function ChannelAnalytics() {
    const [range, setRange] = useState<RangeKey>("28d");
    const [activeMetric, setActiveMetric] = useState<"views" | "watch" | "subs">("views");

    const days = RANGE_DAYS[range];

    const metrics: Record<"views" | "watch" | "subs", Metric> = useMemo(() => {
        const views = buildSeries(days, 0.4, 1.2);
        const watch = views.map((v) => Math.round(v * 0.04 * 10) / 10);
        const subsDelta = buildSeries(days, 0, 0.6).map((v) => Math.round(v / 3));

        return {
            views: {
                label: "Просмотры",
                value: views.reduce((a, b) => a + b, 0),
                delta: -45,
                series: views,
                format: fmtInt,
            },
            watch: {
                label: "Время просмотра (часы)",
                value: Math.round(watch.reduce((a, b) => a + b, 0) * 10) / 10,
                delta: 152,
                series: watch,
                format: fmtHours,
            },
            subs: {
                label: "Подписчики",
                value: subsDelta.reduce((a, b) => a + b, 0),
                delta: 0,
                series: subsDelta,
                format: fmtInt,
            },
        };
    }, [days]);

    const current = metrics[activeMetric];

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 w-full flex flex-col gap-4">
                <section className="panel-card rounded-xl border border-border/70 p-5">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                        <h1 className="text-xl font-bold">Аналитика по каналу</h1>
                        <div className="relative">
                            <select
                                value={range}
                                onChange={(e) => setRange(e.target.value as RangeKey)}
                                className="h-9 rounded-full bg-secondary pl-3 pr-8 text-xs font-medium appearance-none focus:outline-none"
                            >
                                {(Object.keys(RANGE_LABELS) as RangeKey[]).map((k) => (
                                    <option key={k} value={k}>
                                        {RANGE_LABELS[k]}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                        {suggestedQuestions.map((q) => (
                            <button
                                key={q}
                                className="flex items-center gap-1.5 h-9 rounded-full bg-secondary px-3 text-xs font-medium hover:bg-accent"
                            >
                                <Sparkles className="size-3.5 text-primary" />
                                {q}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="panel-card rounded-xl border border-border/70 p-5">
                    <h2 className="text-lg font-bold mb-4">
                        За {RANGE_LABELS[range].toLowerCase()} ваши видео набрали {fmtInt(metrics.views.value)} просмотров
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 rounded-xl border border-border/70 overflow-hidden">
                        {(["views", "watch", "subs"] as const).map((key, i) => {
                            const m = metrics[key];
                            return (
                                <button
                                    key={key}
                                    onClick={() => setActiveMetric(key)}
                                    className={cn(
                                        "text-left p-4 transition-colors",
                                        i > 0 && "sm:border-l border-border/70 border-t sm:border-t-0",
                                        activeMetric === key ? "bg-secondary" : "hover:bg-secondary/50"
                                    )}
                                >
                                    <p className="text-xs text-muted-foreground">{m.label}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-2xl font-bold tabular-nums">{m.format(m.value)}</span>
                                        <DeltaBadge delta={m.delta} />
                                    </div>
                                    {m.delta !== 0 && (
                                        <p className={cn("text-xs mt-1", m.delta > 0 ? "text-green-500" : "text-red-500")}>
                                            {m.delta > 0 ? "Выше обычного" : "Ниже обычного"} ({Math.abs(m.delta)}%)
                                        </p>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-4">
                        <Sparkline data={current.series} positive={current.delta >= 0} />
                    </div>

                    <button className="mt-2 h-9 px-4 rounded-full bg-secondary text-xs font-bold hover:bg-accent">
                        Подробнее
                    </button>
                </section>

                <section className="panel-card rounded-xl border border-border/70">
                    <header className="px-5 py-4 border-b border-border/70">
                        <h2 className="text-lg font-bold">Самый популярный контент за период</h2>
                    </header>
                    <div className="divide-y divide-border/70">
                        {topContent.map((c, i) => (
                            <div key={c.title} className="flex items-center gap-3 px-5 py-3">
                                <span className="w-4 text-sm text-muted-foreground tabular-nums">{i + 1}</span>
                                <div className="w-20 aspect-video rounded-lg overflow-hidden bg-secondary shrink-0">
                                    <img src={c.thumbnail} alt={c.title} className="h-full w-full object-cover" />
                                </div>
                                <span className="flex-1 min-w-0 text-sm font-medium line-clamp-1">{c.title}</span>
                                <span className="w-20 text-right text-sm tabular-nums text-muted-foreground">
                                    {fmtInt(c.views)} пр.
                                </span>
                                <span className="hidden sm:block w-24 text-right text-sm tabular-nums text-muted-foreground">
                                    {fmtHours(c.watchHours)} ч
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default ChannelAnalytics;