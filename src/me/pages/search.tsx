import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search as SearchIcon, User, UsersRound, Newspaper, Music, Video } from "lucide-react";
import { SEARCH_INDEX, toPeopleEntry, type SearchEntry } from "@/layouts/main/top-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { usersSearchApi } from "@/api/user-search.api";

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

const PEOPLE_LIMIT = 20;

const Search = () => {
    const [params] = useSearchParams();
    const q = (params.get("q") || "").trim();

    // "Люди" — реальный поиск (Meilisearch, /api/v1/users/search).
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [people, setPeople] = useState<SearchEntry[]>([]);
    const requestIdRef = useRef(0);
    const abortRef = useRef<AbortController | null>(null);

    const runSearch = useCallback((value: string) => {
        const requestId = ++requestIdRef.current;
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        setError(null);

        usersSearchApi
            .search(value, PEOPLE_LIMIT, controller.signal)
            .then((items) => {
                if (requestIdRef.current !== requestId) return;
                setPeople(items.map(toPeopleEntry));
            })
            .catch((err) => {
                if (requestIdRef.current !== requestId) return;
                if (err?.name === "AbortError") return;
                setError("Не удалось выполнить поиск. Проверьте соединение и попробуйте ещё раз.");
            })
            .finally(() => {
                if (requestIdRef.current === requestId) setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!q || q.length < 2) {
            abortRef.current?.abort();
            setPeople([]);
            setLoading(false);
            setError(null);
            return;
        }
        runSearch(q);
    }, [q, runSearch]);

    // TODO(global-search): group/post/music/video пока фильтруются локально
    // по SEARCH_INDEX (моковые данные) — бэкенд ещё не отдаёт единый
    // полнотекстовый поиск по всем сущностям, только по пользователям.
    // Как только такой эндпоинт появится, этот блок нужно заменить на
    // реальный запрос и убрать SEARCH_INDEX отсюда целиком.
    const otherGroups = useMemo(() => {
        const lower = q.toLowerCase();
        if (lower.length < 2) return {} as Record<string, SearchEntry[]>;
        return SEARCH_INDEX
            .filter((e) => e.type !== "people")
            .filter((e) => e.title.toLowerCase().includes(lower) || e.subtitle?.toLowerCase().includes(lower))
            .reduce<Record<string, SearchEntry[]>>((acc, e) => {
                (acc[e.type] ||= []).push(e);
                return acc;
            }, {});
    }, [q]);

    const groups = useMemo(() => {
        const merged: Record<string, SearchEntry[]> = {};
        if (people.length > 0) merged.people = people;
        Object.assign(merged, otherGroups);
        return merged;
    }, [otherGroups, people]);

    const total = Object.values(groups).reduce((s, a) => s + a.length, 0);

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
                        <div className="py-10 text-center">
                            <p className="text-sm text-destructive mb-2">{error}</p>
                            <button
                                onClick={() => runSearch(q)}
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                Повторить
                            </button>
                        </div>
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