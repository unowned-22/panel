import { useState } from "react";
import { ShieldAlert, ShieldCheck, ExternalLink, Check, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type MatchAction = "monetize" | "mute" | "block" | "track" | null;

type Match = {
    id: string;
    originalTrack: string;
    originalCover: string;
    platform: string;
    matchedTitle: string;
    matchedAuthor: string;
    matchPercent: number;
    foundDate: string;
    action: MatchAction;
};

const seedMatches: Match[] = [
    {
        id: "m1",
        originalTrack: "Space Movie Soundtrack",
        originalCover: "var(--gradient-music-3)",
        platform: "YouTube",
        matchedTitle: "Эпичный фоновый трек для видео #4",
        matchedAuthor: "background.music.channel",
        matchPercent: 96,
        foundDate: "2 дня назад",
        action: null,
    },
    {
        id: "m2",
        originalTrack: "Glich",
        originalCover: "var(--gradient-music-2)",
        platform: "TikTok",
        matchedTitle: "house mix pt.2",
        matchedAuthor: "@dj_unknown_228",
        matchPercent: 88,
        foundDate: "5 дней назад",
        action: "track",
    },
    {
        id: "m3",
        originalTrack: "Mask [dub]",
        originalCover: "var(--gradient-music-1)",
        platform: "Instagram Reels",
        matchedTitle: "Reel audio",
        matchedAuthor: "user_8821",
        matchPercent: 71,
        foundDate: "9 дней назад",
        action: null,
    },
];

const actionLabels: Record<NonNullable<MatchAction>, string> = {
    monetize: "Монетизировать",
    mute: "Заглушить аудио",
    block: "Заблокировать",
    track: "Отслеживать",
};

function matchColor(p: number) {
    if (p >= 90) return "text-red-500";
    if (p >= 75) return "text-yellow-500";
    return "text-muted-foreground";
}

export function MusicContentId() {
    const [matches, setMatches] = useState(seedMatches);
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    const applyAction = (id: string, action: MatchAction) => {
        setMatches((ms) => ms.map((m) => (m.id === id ? { ...m, action } : m)));
        setOpenMenu(null);
    };

    const unresolved = matches.filter((m) => !m.action).length;

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 w-full flex flex-col gap-4">
                <section className="panel-card rounded-xl border border-border/70 p-5">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-full bg-secondary flex items-center justify-center">
                            <ShieldAlert className="size-5 text-muted-foreground" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">Обнаружение контента</h1>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Автоматический поиск совпадений ваших треков на сторонних платформах
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
                        <div className="rounded-xl border border-border/70 p-3">
                            <p className="text-xs text-muted-foreground">Найдено совпадений</p>
                            <p className="text-2xl font-bold mt-1 tabular-nums">{matches.length}</p>
                        </div>
                        <div className="rounded-xl border border-border/70 p-3">
                            <p className="text-xs text-muted-foreground">Требуют решения</p>
                            <p className="text-2xl font-bold mt-1 tabular-nums text-yellow-500">{unresolved}</p>
                        </div>
                        <div className="rounded-xl border border-border/70 p-3 col-span-2 sm:col-span-1">
                            <p className="text-xs text-muted-foreground">Защищённых треков</p>
                            <p className="text-2xl font-bold mt-1 tabular-nums">3</p>
                        </div>
                    </div>
                </section>

                <section className="panel-card rounded-xl border border-border/70">
                    <header className="px-5 py-4 border-b border-border/70">
                        <h2 className="text-lg font-bold">Совпадения</h2>
                    </header>

                    {matches.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
                            <ShieldCheck className="size-7" />
                            <p className="text-sm">Совпадений не найдено</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/70">
                            {matches.map((m) => (
                                <div key={m.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                                    <div className="size-10 rounded-lg shrink-0" style={{ background: m.originalCover }} />
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground">Ваш трек</p>
                                        <p className="text-sm font-bold truncate">{m.originalTrack}</p>
                                    </div>

                                    <div className="hidden sm:block text-muted-foreground px-2">→</div>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-muted-foreground">
                                            {m.platform} · {m.foundDate}
                                        </p>
                                        <p className="text-sm font-medium truncate flex items-center gap-1.5">
                                            {m.matchedTitle}
                                            <a href="#" className="text-muted-foreground hover:text-foreground" aria-label="Открыть">
                                                <ExternalLink className="size-3.5" />
                                            </a>
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">{m.matchedAuthor}</p>
                                    </div>

                                    <span className={cn("text-sm font-bold tabular-nums w-16 text-right", matchColor(m.matchPercent))}>
                                        {m.matchPercent}%
                                    </span>

                                    <div className="relative">
                                        <button
                                            onClick={() => setOpenMenu(openMenu === m.id ? null : m.id)}
                                            className={cn(
                                                "flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-bold",
                                                m.action ? "bg-secondary" : "bg-foreground text-background hover:opacity-90"
                                            )}
                                        >
                                            {m.action ? actionLabels[m.action] : "Выбрать действие"}
                                            <ChevronDown className="size-3.5" />
                                        </button>
                                        {openMenu === m.id && (
                                            <div className="absolute right-0 z-10 mt-1 w-44 rounded-xl border border-border bg-popover py-1 shadow-lg">
                                                {(Object.keys(actionLabels) as (keyof typeof actionLabels)[]).map((a) => (
                                                    <button
                                                        key={a}
                                                        onClick={() => applyAction(m.id, a)}
                                                        className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-secondary text-left"
                                                    >
                                                        {actionLabels[a]}
                                                        {m.action === a && <Check className="size-3.5" />}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() => applyAction(m.id, null)}
                                                    className="w-full flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground hover:bg-secondary text-left"
                                                >
                                                    <X className="size-3.5" /> Сбросить
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default MusicContentId;