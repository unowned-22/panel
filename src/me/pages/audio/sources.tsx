import { useState } from "react";
import { Search, ListMusic, Compass, Link2, Radio as RadioIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Source = {
    id: string;
    label: string;
    icon: typeof Search;
    value: number; // percent of total
    plays: number;
    trend: number; // delta percent
};

const sources: Source[] = [
    { id: "algo", label: "Плейлисты алгоритма", icon: Compass, value: 38, plays: 2840, trend: 12 },
    { id: "search", label: "Поиск", icon: Search, value: 24, plays: 1790, trend: -4 },
    { id: "playlists", label: "Плейлисты пользователей", icon: ListMusic, value: 18, plays: 1340, trend: 22 },
    { id: "radio", label: "Радио и автовоспроизведение", icon: RadioIcon, value: 12, plays: 895, trend: 6 },
    { id: "external", label: "Внешние сайты и ссылки", icon: Link2, value: 8, plays: 596, trend: -9 },
];

const byCountry = [
    { country: "Украина", value: 41 },
    { country: "Польша", value: 19 },
    { country: "Германия", value: 14 },
    { country: "США", value: 9 },
    { country: "Остальные", value: 17 },
];

function fmtN(n: number) {
    return n.toLocaleString("ru-RU");
}

const palette = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7"];

export function MusicTrafficSources() {
    const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

    // Build a simple donut chart from `sources` percentages
    let cumulative = 0;
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const segments = sources.map((s, i) => {
        const dash = (s.value / 100) * circumference;
        const seg = { offset: cumulative, dash, color: palette[i % palette.length] };
        cumulative += dash;
        return seg;
    });

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 w-full flex flex-col gap-4">
                <section className="panel-card rounded-xl border border-border/70 p-5">
                    <h1 className="text-lg font-bold">Источники прослушиваний</h1>
                    <p className="text-xs text-muted-foreground mt-1">Откуда слушатели находят ваши треки за последние 28 дней</p>

                    <div className="flex flex-col sm:flex-row items-center gap-8 mt-6">
                        <svg viewBox="0 0 160 160" className="size-44 shrink-0 -rotate-90">
                            <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--secondary)" strokeWidth="20" />
                            {segments.map((seg, i) => (
                                <circle
                                    key={sources[i].id}
                                    cx="80"
                                    cy="80"
                                    r={radius}
                                    fill="none"
                                    stroke={seg.color}
                                    strokeWidth={hoveredSlice === i ? 24 : 20}
                                    strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
                                    strokeDashoffset={-seg.offset}
                                    className="transition-all cursor-pointer"
                                    onMouseEnter={() => setHoveredSlice(i)}
                                    onMouseLeave={() => setHoveredSlice(null)}
                                />
                            ))}
                        </svg>

                        <div className="flex-1 w-full space-y-2">
                            {sources.map((s, i) => {
                                const Icon = s.icon;
                                return (
                                    <div
                                        key={s.id}
                                        onMouseEnter={() => setHoveredSlice(i)}
                                        onMouseLeave={() => setHoveredSlice(null)}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                                            hoveredSlice === i && "bg-secondary"
                                        )}
                                    >
                                        <span className="size-2.5 rounded-full shrink-0" style={{ background: palette[i % palette.length] }} />
                                        <Icon className="size-4 text-muted-foreground shrink-0" />
                                        <span className="text-sm font-medium flex-1 min-w-0 truncate">{s.label}</span>
                                        <span className="text-sm font-bold tabular-nums">{s.value}%</span>
                                        <span className="text-xs text-muted-foreground tabular-nums w-16 text-right">
                                            {fmtN(s.plays)}
                                        </span>
                                        <span className={cn("text-xs font-medium w-10 text-right", s.trend >= 0 ? "text-green-500" : "text-red-500")}>
                                            {s.trend >= 0 ? "+" : ""}
                                            {s.trend}%
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="panel-card rounded-xl border border-border/70 p-5">
                    <h2 className="text-sm font-bold mb-4">По странам</h2>
                    <div className="space-y-3">
                        {byCountry.map((c) => (
                            <div key={c.country} className="flex items-center gap-3">
                                <span className="text-sm w-28 shrink-0 truncate">{c.country}</span>
                                <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                                    <div className="h-full bg-foreground rounded-full" style={{ width: `${c.value}%` }} />
                                </div>
                                <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">{c.value}%</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default MusicTrafficSources;