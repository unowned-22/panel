import { useState } from "react";
import { CheckCircle2, Clock, AlertCircle, ExternalLink, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

type PlatformStatus = "live" | "pending" | "error" | "not_submitted";

type Platform = {
    id: string;
    name: string;
    color: string;
};

type DistributionRow = {
    trackId: string;
    trackTitle: string;
    cover: string;
    statuses: Record<string, { status: PlatformStatus; url?: string; note?: string }>;
};

const platforms: Platform[] = [
    { id: "spotify", name: "Spotify", color: "bg-green-600" },
    { id: "apple", name: "Apple Music", color: "bg-pink-600" },
    { id: "ytmusic", name: "YouTube Music", color: "bg-red-600" },
    { id: "vk", name: "VK Музыка", color: "bg-blue-600" },
];

const rows: DistributionRow[] = [
    {
        trackId: "t1",
        trackTitle: "Mask [dub]",
        cover: "var(--gradient-music-1)",
        statuses: {
            spotify: { status: "live", url: "#" },
            apple: { status: "live", url: "#" },
            ytmusic: { status: "live", url: "#" },
            vk: { status: "live", url: "#" },
        },
    },
    {
        trackId: "t2",
        trackTitle: "Glich",
        cover: "var(--gradient-music-2)",
        statuses: {
            spotify: { status: "live", url: "#" },
            apple: { status: "pending", note: "На модерации, обычно занимает 1–3 дня" },
            ytmusic: { status: "live", url: "#" },
            vk: { status: "live", url: "#" },
        },
    },
    {
        trackId: "t3",
        trackTitle: "Space Movie Soundtrack",
        cover: "var(--gradient-music-3)",
        statuses: {
            spotify: { status: "live", url: "#" },
            apple: { status: "live", url: "#" },
            ytmusic: { status: "error", note: "Не пройдена проверка авторских прав на сэмпл" },
            vk: { status: "live", url: "#" },
        },
    },
    {
        trackId: "t4",
        trackTitle: "Meridian",
        cover: "var(--gradient-music-4)",
        statuses: {
            spotify: { status: "not_submitted" },
            apple: { status: "not_submitted" },
            ytmusic: { status: "live", url: "#" },
            vk: { status: "live", url: "#" },
        },
    },
];

function StatusIcon({ status }: { status: PlatformStatus }) {
    switch (status) {
        case "live":
            return <CheckCircle2 className="size-4 text-green-500" />;
        case "pending":
            return <Clock className="size-4 text-yellow-500" />;
        case "error":
            return <AlertCircle className="size-4 text-red-500" />;
        default:
            return <span className="size-4 rounded-full border border-dashed border-muted-foreground/50 block" />;
    }
}

function statusLabel(status: PlatformStatus) {
    switch (status) {
        case "live":
            return "Опубликовано";
        case "pending":
            return "На модерации";
        case "error":
            return "Ошибка";
        default:
            return "Не отправлено";
    }
}

export function MusicDistribution() {
    const [hovered, setHovered] = useState<string | null>(null);

    const summary = platforms.map((p) => {
        const live = rows.filter((r) => r.statuses[p.id]?.status === "live").length;
        return { ...p, live, total: rows.length };
    });

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 w-full flex flex-col gap-4">
                <section className="panel-card rounded-xl border border-border/70 p-5">
                    <h1 className="text-lg font-bold mb-4">Дистрибуция</h1>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {summary.map((p) => (
                            <div key={p.id} className="rounded-xl border border-border/70 p-3">
                                <div className="flex items-center gap-2">
                                    <div className={cn("size-2.5 rounded-full", p.color)} />
                                    <span className="text-sm font-bold">{p.name}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1.5">
                                    {p.live} из {p.total} треков опубликовано
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="panel-card rounded-xl border border-border/70 overflow-x-auto">
                    <header className="px-5 py-4 border-b border-border/70">
                        <h2 className="text-lg font-bold">Статус по трекам</h2>
                    </header>

                    <table className="w-full min-w-[640px] text-sm">
                        <thead>
                        <tr className="text-left text-xs font-bold text-muted-foreground">
                            <th className="px-5 py-2 font-bold">Трек</th>
                            {platforms.map((p) => (
                                <th key={p.id} className="px-3 py-2 font-bold text-center">
                                    {p.name}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-border/70">
                        {rows.map((r) => (
                            <tr key={r.trackId}>
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="size-9 rounded-lg shrink-0" style={{ background: r.cover }} />
                                        <span className="font-medium truncate">{r.trackTitle}</span>
                                    </div>
                                </td>
                                {platforms.map((p) => {
                                    const s = r.statuses[p.id];
                                    const key = `${r.trackId}-${p.id}`;
                                    return (
                                        <td
                                            key={p.id}
                                            className="px-3 py-3 text-center relative"
                                            onMouseEnter={() => s?.note && setHovered(key)}
                                            onMouseLeave={() => setHovered(null)}
                                        >
                                            <div className="flex items-center justify-center gap-1.5">
                                                <StatusIcon status={s?.status ?? "not_submitted"} />
                                                {s?.status === "live" && s.url && (
                                                    <a href={s.url} className="text-muted-foreground hover:text-foreground" aria-label="Открыть">
                                                        <ExternalLink className="size-3.5" />
                                                    </a>
                                                )}
                                                {s?.status === "error" && (
                                                    <button className="text-muted-foreground hover:text-foreground" aria-label="Повторить">
                                                        <RotateCw className="size-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                            {hovered === key && s?.note && (
                                                <div className="absolute z-10 left-1/2 -translate-x-1/2 top-full mt-1 w-48 p-2 rounded-lg bg-popover border border-border text-xs text-left shadow-lg">
                                                    {s.note}
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </section>

                <p className="text-xs text-muted-foreground px-1">
                    {statusLabel("live")}, {statusLabel("pending")}, {statusLabel("error")}, {statusLabel("not_submitted")} —
                    статусы синхронизируются автоматически после загрузки трека.
                </p>
            </div>
        </div>
    );
}

export default MusicDistribution;