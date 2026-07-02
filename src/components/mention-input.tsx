import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
    type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";
import { usersSearchApi, type UserSearchItem } from "@/api/user-search.api";

export type MentionUser = {
    id: string;
    name: string; // display name with spaces ok
    handle: string; // unique handle without @
    avatar?: string;
    subtitle?: string;
};

/**
 * Список "по умолчанию" больше не используется как основной источник
 * совпадений — теперь это только fallback, который показывается сразу
 * после ввода "@", пока пользователь ещё ничего не напечатал (бэкенд не
 * умеет искать по пустому q, см. usersSearchApi.search). Можно передать
 * сюда, например, недавних собеседников или друзей через проп `users`.
 * Как только появляется хотя бы один символ запроса, список полностью
 * подменяется результатами живого поиска.
 */
export const DEFAULT_MENTION_USERS: MentionUser[] = [
    { id: "u1", name: "Skylar Reeves", handle: "skylar", avatar: "/avatar-1.jpg", subtitle: "Дизайнер" },
    { id: "u2", name: "Mira Donovan", handle: "mira", avatar: "/avatar-2.jpg", subtitle: "Фотограф" },
    { id: "u3", name: "Mark Roberts", handle: "mark", avatar: "/avatar-me.jpg", subtitle: "Это вы" },
    { id: "u4", name: "Anna Petrova", handle: "anna", subtitle: "Иллюстратор" },
    { id: "u5", name: "Ivan Volkov", handle: "ivan", subtitle: "Музыкант" },
    { id: "u6", name: "Olga Sokolova", handle: "olga", subtitle: "Куратор" },
    { id: "u7", name: "Daniil Orlov", handle: "daniil", subtitle: "Разработчик" },
];

const SEARCH_DEBOUNCE_MS = 250;
const SEARCH_LIMIT = 6;

const toMentionUser = (u: UserSearchItem): MentionUser => ({
    id: String(u.id),
    name: u.full_name || u.username,
    handle: u.username,
    avatar: u.avatar_url ?? undefined,
});

type Props = {
    value: string;
    onChange: (v: string) => void;
    onSubmit?: () => void;
    placeholder?: string;
    className?: string;
    users?: MentionUser[];
};

const findActiveQuery = (
    text: string,
    caret: number,
): { start: number; end: number; query: string } | null => {
    if (caret <= 0) return null;
    // Walk left from caret looking for '@' that starts a token
    let i = caret - 1;
    while (i >= 0) {
        const ch = text[i];
        if (ch === "@") {
            const before = i === 0 ? " " : text[i - 1];
            if (!/[\s(.,!?;:]/.test(before) && before !== "") return null;
            const query = text.slice(i + 1, caret);
            if (/\s/.test(query)) return null;
            if (query.length > 30) return null;
            return { start: i, end: caret, query };
        }
        if (/\s/.test(ch)) return null;
        i--;
    }
    return null;
};

export type MentionInputHandle = { focus: () => void; getInput: () => HTMLInputElement | null };

export const MentionInput = forwardRef<MentionInputHandle, Props>(function MentionInput(
    { value, onChange, onSubmit, placeholder, className, users = DEFAULT_MENTION_USERS },
    ref,
) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [caret, setCaret] = useState(0);
    const [open, setOpen] = useState(false);
    const [activeIdx, setActiveIdx] = useState(0);

    const [remoteMatches, setRemoteMatches] = useState<MentionUser[]>([]);
    const [searching, setSearching] = useState(false);
    const requestIdRef = useRef(0);
    const abortRef = useRef<AbortController | null>(null);

    useImperativeHandle(ref, () => ({
        focus: () => inputRef.current?.focus(),
        getInput: () => inputRef.current,
    }));

    const active = useMemo(() => findActiveQuery(value, caret), [value, caret]);

    // Живой поиск по /api/v1/users/search (Meilisearch, матчит username и full_name).
    // Пустой query бэкенд не принимает, поэтому в этом случае просто чистим
    // remoteMatches и ниже используем локальный fallback-список.
    useEffect(() => {
        const query = active?.query ?? "";

        if (!query) {
            abortRef.current?.abort();
            setRemoteMatches([]);
            setSearching(false);
            return;
        }

        const requestId = ++requestIdRef.current;
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setSearching(true);
        const timer = setTimeout(() => {
            usersSearchApi
                .search(query, SEARCH_LIMIT, controller.signal)
                .then((items) => {
                    if (requestIdRef.current !== requestId) return; // пришёл устаревший ответ
                    setRemoteMatches(items.map(toMentionUser));
                })
                .catch(() => {
                    if (requestIdRef.current !== requestId) return;
                    setRemoteMatches([]);
                })
                .finally(() => {
                    if (requestIdRef.current === requestId) setSearching(false);
                });
        }, SEARCH_DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [active?.query]);

    const localFallback = useMemo(() => {
        if (!active || active.query) return [];
        return users.slice(0, SEARCH_LIMIT);
    }, [active, users]);

    const matches = active?.query ? remoteMatches : localFallback;
    const isQuerying = Boolean(active?.query) && searching;

    useEffect(() => {
        setOpen(Boolean(active && (matches.length > 0 || isQuerying)));
        setActiveIdx(0);
    }, [active, matches.length, isQuerying]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
        setCaret(e.target.selectionStart ?? e.target.value.length);
    };

    const updateCaret = () => {
        const el = inputRef.current;
        if (el) setCaret(el.selectionStart ?? el.value.length);
    };

    const insertMention = (u: MentionUser) => {
        if (!active) return;
        const before = value.slice(0, active.start);
        const after = value.slice(active.end);
        const insert = `@${u.handle} `;
        const next = `${before}${insert}${after}`;
        onChange(next);
        const newCaret = (before + insert).length;
        requestAnimationFrame(() => {
            const el = inputRef.current;
            if (!el) return;
            el.focus();
            el.setSelectionRange(newCaret, newCaret);
            setCaret(newCaret);
        });
        setOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (open && matches.length > 0) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIdx((i) => (i + 1) % matches.length);
                return;
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIdx((i) => (i - 1 + matches.length) % matches.length);
                return;
            }
            if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                insertMention(matches[activeIdx]);
                return;
            }
            if (e.key === "Escape") {
                e.preventDefault();
                setOpen(false);
                return;
            }
        }
        if (e.key === "Enter" && onSubmit) {
            e.preventDefault();
            onSubmit();
        }
    };

    return (
        <div className={cn("relative flex-1 min-w-0", className)}>
            <input
                ref={inputRef}
                value={value}
                onChange={handleChange}
                onKeyUp={updateCaret}
                onClick={updateCaret}
                onSelect={updateCaret}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full h-10 px-3 rounded-full bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground"
            />
            {open && (
                <div className="absolute bottom-full left-0 mb-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-popover shadow-lg overflow-hidden z-50">
                    <div className="px-3 py-1.5 text-[11px] uppercase tracking-wide text-muted-foreground border-b border-border">
                        Упомянуть пользователя
                    </div>
                    {matches.length === 0 && isQuerying && (
                        <div className="px-3 py-3 text-sm text-muted-foreground">Поиск…</div>
                    )}
                    {matches.length === 0 && !isQuerying && active?.query && (
                        <div className="px-3 py-3 text-sm text-muted-foreground">Никого не найдено</div>
                    )}
                    {matches.length > 0 && (
                        <ul className="max-h-64 overflow-y-auto py-1">
                            {matches.map((u, i) => (
                                <li key={u.id}>
                                    <button
                                        type="button"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            insertMention(u);
                                        }}
                                        onMouseEnter={() => setActiveIdx(i)}
                                        className={cn(
                                            "w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors",
                                            i === activeIdx ? "bg-secondary" : "hover:bg-secondary/60",
                                        )}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden shrink-0">
                                            {u.avatar && <img src={u.avatar} alt="" className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-sm font-medium truncate">{u.name}</div>
                                            <div className="text-xs text-muted-foreground truncate">
                                                @{u.handle}
                                                {u.subtitle ? ` · ${u.subtitle}` : ""}
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
});

/** Render text with @mentions highlighted */
export const renderWithMentions = (text: string, users: MentionUser[] = DEFAULT_MENTION_USERS) => {
    const handles = new Set(users.map((u) => u.handle.toLowerCase()));
    const parts: Array<string | { handle: string; known: boolean }> = [];
    const re = /(^|[\s(.,!?;:])@([a-zA-Z0-9_\u0400-\u04FF]+)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
        const [full, lead, handle] = m;
        const idx = m.index + lead.length;
        if (idx > last) parts.push(text.slice(last, idx));
        parts.push({ handle, known: handles.has(handle.toLowerCase()) });
        last = idx + 1 + handle.length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts.map((p, i) =>
        typeof p === "string" ? (
            <span key={i}>{p}</span>
        ) : (
            <span
                key={i}
                className={cn(
                    "font-medium",
                    p.known ? "text-primary hover:underline cursor-pointer" : "text-primary/70",
                )}
            >
        @{p.handle}
      </span>
        ),
    );
};