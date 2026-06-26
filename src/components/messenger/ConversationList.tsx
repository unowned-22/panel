import { useState } from "react";
import {
    Menu, Search, UserPlus, Archive, PenSquare, Settings,
    CheckCheck, BadgeCheck, MessageCircleMore,
} from "lucide-react";
import { type ChatContact } from "@/context/messenger-context";

interface Props {
    contacts: ChatContact[];
    activeId: string;
    onSelect: (id: string) => void;
    onOpenCreate: () => void;
    onStartGroupCreate: () => void;
}

const Avatar = ({ c, size = 44 }: { c: ChatContact; size?: number }) => {
    const initial = c.name.replace(/[^\p{L}]/gu, "").charAt(0).toUpperCase() || "?";
    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            {c.isVK ? (
                <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-base">VK</div>
            ) : c.avatar ? (
                <img src={c.avatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
                <div className="w-full h-full rounded-full bg-linear-to-br from-secondary to-accent flex items-center justify-center text-foreground/80 font-semibold">
                    {initial}
                </div>
            )}
            {c.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
            )}
        </div>
    );
};

const FILTERS = ["Все", "Каналы", "Группы"] as const;

export const ConversationList = ({ contacts, activeId, onSelect, onOpenCreate, onStartGroupCreate }: Props) => {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<typeof FILTERS[number]>("Все");

    const filtered = contacts.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
        if (filter === "Каналы") return matchesSearch; // extend when backend returns type
        if (filter === "Группы") return matchesSearch && c.isGroup;
        return matchesSearch;
    });

    return (
        <>
            <div className="h-14 px-4 flex items-center justify-between border-b border-border/60">
                <div className="flex items-center gap-3">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-foreground/70">
                        <Menu className="w-5 h-5" />
                    </button>
                    <h2 className="font-semibold text-[15px]">Чаты</h2>
                </div>
                <div className="flex items-center gap-1 text-foreground/70">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary" aria-label="Добавить пользователя">
                        <UserPlus className="w-4.5 h-4.5" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary" aria-label="Архив">
                        <Archive className="w-4.5 h-4.5" />
                    </button>
                    <button
                        onClick={onStartGroupCreate}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary"
                        aria-label="Создать чат"
                    >
                        <PenSquare className="w-4.5 h-4.5" />
                    </button>
                </div>
            </div>

            <div className="px-3 pt-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Поиск"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 rounded-lg bg-secondary text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                </div>
                <div className="flex items-center gap-2 mt-3 mb-2">
                    {FILTERS.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 rounded-md text-[13px] font-medium transition-colors ${
                                filter === f
                                    ? "bg-accent text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                    <button onClick={onOpenCreate} className="ml-auto w-7 h-7 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground" aria-label="Настройки фильтров">
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2">
                {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
                        <Search className="w-8 h-8 mb-2 opacity-40" />
                        Ничего не найдено
                    </div>
                )}
                {filtered.map(c => (
                    <button
                        key={c.id}
                        onClick={() => onSelect(c.id)}
                        className={`w-full text-left flex items-start gap-3 px-2 py-2 rounded-lg mb-0.5 transition-colors ${
                            activeId === c.id ? "bg-accent" : "hover:bg-secondary/60"
                        }`}
                    >
                        <Avatar c={c} />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[13.5px] font-semibold truncate">{c.name}</span>
                                {c.verified && <BadgeCheck className="w-3.5 h-3.5 text-primary fill-primary/20 shrink-0" />}
                                {c.read && !c.unread && <CheckCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-auto" />}
                                {c.time && <span className="text-[11px] text-muted-foreground ml-auto shrink-0">{c.time}</span>}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                                <p className="text-[12.5px] text-muted-foreground truncate flex-1">{c.preview}</p>
                                {c.unread ? (
                                    <span className="shrink-0 min-w-4.5 h-4.5 px-1 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold flex items-center justify-center">
                                        {c.unread}
                                    </span>
                                ) : c.pinned ? (
                                    <span className="shrink-0 text-muted-foreground text-xs">📌</span>
                                ) : null}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="h-12 px-4 flex items-center justify-between border-t border-border/60">
                <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                    <MessageCircleMore className="w-4 h-4" />
                    Только непрочитанные
                </div>
                <button className="w-8 h-4 rounded-full bg-secondary relative">
                    <span className="absolute left-0.5 top-0.5 w-3 h-3 rounded-full bg-muted-foreground" />
                </button>
            </div>
        </>
    );
};

export { Avatar };