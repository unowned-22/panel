import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search as SearchIcon, User, UsersRound, Newspaper, Music, Video } from "lucide-react";
import { SEARCH_INDEX, type SearchEntry } from "@/layouts/main/top-bar";
import { Skeleton } from "@/components/ui/skeleton";

const ICONS: Record<SearchEntry["type"], any> = {
    people: User,
    group: UsersRound,
    post: Newspaper,
    music: Music,
    video: Video,
};

const LABELS: Record<SearchEntry["type"], string> = {
    people: "Люди",
    group: "Сообщества",
    post: "Записи",
    music: "Музыка",
    video: "Видео",
};

const Search = () => {
    const [params] = useSearchParams();
    const q = (params.get("q") || "").trim();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const groups = useMemo(() => {
        const lower = q.toLowerCase();
        if (lower.length < 2) return {} as Record<string, SearchEntry[]>;
        return SEARCH_INDEX
            .filter((e) => e.title.toLowerCase().includes(lower) || e.subtitle?.toLowerCase().includes(lower))
            .reduce<Record<string, SearchEntry[]>>((acc, e) => {
                (acc[e.type] ||= []).push(e);
                return acc;
            }, {});
    }, [q]);

    const total = Object.values(groups).reduce((s, a) => s + a.length, 0);

    useEffect(() => {
        if (!q || q.length < 2) {
            setLoading(false);
            setError(null);
            return;
        }
        setLoading(true);
        setError(null);
        const timer = setTimeout(() => {
            // Имитация случайной ошибки сети
            if (Math.random() < 0.05) {
                setError("Не удалось выполнить поиск. Проверьте соединение и попробуйте ещё раз.");
            }
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, [q]);

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 max-w-150 mx-auto w-full flex flex-col gap-3">
                <div className="panel-card p-5">
                    <h1 className="text-xl font-semibold mb-1">Поиск</h1>
                    <p className="text-sm text-muted-foreground mb-4">
                        {q ? <>Результаты по запросу «{q}» — найдено {total}</> : "Введите запрос в строку поиска"}
                    </p>

                    {loading && (
                        <div className="space-y-6">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i}>
                                    <Skeleton className="h-4 w-24 mb-2" />
                                    <div className="divide-y divide-border rounded-lg border border-border">
                                        {Array.from({ length: 3 }).map((_, j) => (
                                            <div key={j} className="flex items-center gap-3 px-3 py-2.5">
                                                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                                                <div className="min-w-0 flex-1 space-y-1.5">
                                                    <Skeleton className="h-3.5 w-1/2" />
                                                    <Skeleton className="h-3 w-1/3" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && error && (
                        <div></div>
                    )}

                    {!loading && !error && q && total === 0 && (
                        <div className="py-10 text-center text-sm text-muted-foreground">
                            <SearchIcon className="mx-auto mb-2 h-6 w-6" />
                            Ничего не найдено
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="space-y-6">
                            {Object.entries(groups).map(([type, items]) => {
                                const Icon = ICONS[type as SearchEntry["type"]];
                                return (
                                    <section key={type}>
                                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {LABELS[type as SearchEntry["type"]]}
                                        </div>
                                        <div className="divide-y divide-border rounded-lg border border-border">
                                            {items.map((it) => (
                                                <Link
                                                    to={it.href}
                                                    key={it.id}
                                                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/50"
                                                >
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                                                        <Icon className="h-4 w-4 text-foreground/70" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="truncate text-sm font-medium">{it.title}</div>
                                                        {it.subtitle && <div className="truncate text-xs text-muted-foreground">{it.subtitle}</div>}
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Search;
