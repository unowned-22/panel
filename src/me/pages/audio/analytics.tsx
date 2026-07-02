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
    delta: number;
    series: number[];
    format: (n: number) => string;
};

function buildSeries(days: number, base: number, volatility: number) {
    const out: number[] = [];
    let v = base;
    for (let i = 0; i < days; i++) {
        v = Math.max(0, v + (Math.random() - 0.4) * volatility);
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

const topTracks = [
    { title: "Space Movie Soundtrack", cover: "var(--gradient-music-3)", plays: 5021, listenHours: 184.2 },
    { title: "Glich", cover: "var(--gradient-music-2)", plays: 1280, listenHours: 49.7 },
    { title: "Mask [dub]", cover: "var(--gradient-music-1)", plays: 412, listenHours: 18.1 },
];

const suggestedQuestions = [
    "Откуда приходят слушатели?",
    "В каких плейлистах мои треки?",
    "Дать оценку эффективности последнего релиза",
];

function Sparkline({ data }: { data: number[] }) {
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

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20" preserveAspectRatio="none">
            <path d={areaPath} fill="var(--primary)" opacity={0.12} />
            <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth={2} />
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

export function MusicAnalytics() {
    const [range, setRange] = useState<RangeKey>("28d");
    const [activeMetric, setActiveMetric] = useState<"plays" | "hours" | "listeners">("plays");

    const days = RANGE_DAYS[range];

    const metrics: Record<"plays" | "hours" | "listeners", Metric> = useMemo(() => {
        const plays = buildSeries(days, 30, 40);
        const hours = plays.map((v) => Math.round(v * 0.06 * 10) / 10);
        const listeners = buildSeries(days, 8, 12);

        return {
            plays: {
                label: "Прослушивания",
                value: plays.reduce((a, b) => a + b, 0),
                delta: 18,
                series: plays,
                format: fmtInt,
            },
            hours: {
                label: "Время прослушивания (часы)",
                value: Math.round(hours.reduce((a, b) => a + b, 0) * 10) / 10,
                delta: 24,
                series: hours,
                format: fmtHours,
            },
            listeners: {
                label: "Уникальные слушатели",
                value: listeners.reduce((a, b) => a + b, 0),
                delta: -6,
                series: listeners,
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
                        <h1 className="text-xl font-bold">Аналитика по музыке</h1>
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
                        За {RANGE_LABELS[range].toLowerCase()} ваши треки набрали {fmtInt(metrics.plays.value)} прослушиваний
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 rounded-xl border border-border/70 overflow-hidden">
                        {(["plays", "hours", "listeners"] as const).map((key, i) => {
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
                        <Sparkline data={current.series} />
                    </div>

                    <button className="mt-2 h-9 px-4 rounded-full bg-secondary text-xs font-bold hover:bg-accent">
                        Подробнее
                    </button>
                </section>

                <section className="panel-card rounded-xl border border-border/70">
                    <header className="px-5 py-4 border-b border-border/70">
                        <h2 className="text-lg font-bold">Самые популярные треки за период</h2>
                    </header>
                    <div className="divide-y divide-border/70">
                        {topTracks.map((t, i) => (
                            <div key={t.title} className="flex items-center gap-3 px-5 py-3">
                                <span className="w-4 text-sm text-muted-foreground tabular-nums">{i + 1}</span>
                                <div className="size-11 rounded-lg shrink-0" style={{ background: t.cover }} />
                                <span className="flex-1 min-w-0 text-sm font-medium line-clamp-1">{t.title}</span>
                                <span className="w-24 text-right text-sm tabular-nums text-muted-foreground">
                                    {fmtInt(t.plays)} прослуш.
                                </span>
                                <span className="hidden sm:block w-24 text-right text-sm tabular-nums text-muted-foreground">
                                    {fmtHours(t.listenHours)} ч
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default MusicAnalytics;