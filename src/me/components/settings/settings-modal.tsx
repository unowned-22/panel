import { useState, useEffect, type ReactNode } from "react";
import {
    User, Newspaper, MessageCircle, Phone, Users, UsersRound,
    Image as ImageIcon, Music, Video, Film, Gamepad2, Smile,
    ShoppingBag, LayoutGrid, Mic, Bookmark, HelpCircle, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_NAV_ITEMS, type NavItemKey } from "@/context/settings-context";
import type { TranslationDictionary } from "@/i18n/types";
import { useTranslation } from "@/hooks/use-translation";

const ICON: Record<NavItemKey, ReactNode> = {
    profile:   <User className="h-4 w-4" />,
    feed:      <Newspaper className="h-4 w-4" />,
    messenger: <MessageCircle className="h-4 w-4" />,
    calls:     <Phone className="h-4 w-4" />,
    friends:   <Users className="h-4 w-4" />,
    groups:    <UsersRound className="h-4 w-4" />,
    photos:    <ImageIcon className="h-4 w-4" />,
    music:     <Music className="h-4 w-4" />,
    video:     <Video className="h-4 w-4" />,
    clips:     <Film className="h-4 w-4" />,
    games:     <Gamepad2 className="h-4 w-4" />,
    stickers:  <Smile className="h-4 w-4" />,
    market:    <ShoppingBag className="h-4 w-4" />,
    services:  <LayoutGrid className="h-4 w-4" />,
    bookmarks: <Bookmark className="h-4 w-4" />,
    voices:    <Mic className="h-4 w-4" />,
    help:      <HelpCircle className="h-4 w-4" />,
};
const LABEL: Record<NavItemKey, keyof TranslationDictionary> = {
    profile:   "sidebar.profile",
    feed:      "sidebar.feed",
    messenger: "sidebar.messenger",
    calls:     "sidebar.calls",
    friends:   "sidebar.friends",
    groups:    "sidebar.groups",
    photos:    "sidebar.photos",
    music:     "sidebar.music",
    video:     "sidebar.video",
    clips:     "sidebar.clips",
    games:     "sidebar.games",
    stickers:  "sidebar.stickers",
    market:    "sidebar.market",
    services:  "sidebar.services",
    bookmarks: "sidebar.bookmarks",
    voices:    "sidebar.voices",
    help:      "sidebar.help",
};

type Tab = "general" | "favorites";

interface NavRowKey {
    navKey: NavItemKey;
    checked: boolean;
    onToggle: () => void;
    locked?: boolean;
}

interface TabButtonKey {
    active: boolean;
    onClick: () => void;
    children: ReactNode;
}

const GENERAL_KEYS: NavItemKey[] = [
    "profile", "feed", "messenger", "calls", "friends", "groups",
    "photos", "music", "video", "clips", "games", "stickers", "market",
    "bookmarks", "help",
];

const FAVORITE_KEYS: NavItemKey[] = ["games", "services", "voices"];

const CheckCircle = ({ checked }: { checked: boolean }) => (
    <div
        className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            checked
                ? "border-primary bg-primary text-white"
                : "border-border bg-transparent",
        )}
    >
        {checked && (
            <svg viewBox="0 0 12 10" fill="none" className="h-3 w-3">
                <path
                    d="M1 5l3.5 3.5L11 1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        )}
    </div>
);

const NavRow = ({ navKey, checked, onToggle, locked }: NavRowKey) => {
    const { t } = useTranslation()

    return (
        <button
            onClick={locked ? undefined : onToggle}
            disabled={locked}
            className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                "hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                locked && "cursor-default opacity-60",
            )}
        >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                {ICON[navKey]}
            </div>
            <span className="flex-1 text-sm font-medium">{t(LABEL[navKey])}</span>
            <CheckCircle checked={checked} />
        </button>
    )
};

const TabButton = ({ active, onClick, children }: TabButtonKey) => (
    <button
        onClick={onClick}
        className={cn(
            "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
            active
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground",
        )}
    >
        {children}
    </button>
);

interface MenuConfigModalProps {
    open: boolean;
    onClose: () => void;
    /** Current saved visible set */
    visible: Set<NavItemKey>;
    /** Called with the new set when user hits Save */
    onSave: (next: Set<NavItemKey>) => void;
}

export const SettingsModal = ({
                                    open,
                                    onClose,
                                    visible,
                                    onSave,
                                }: MenuConfigModalProps) => {
    const [tab, setTab] = useState<Tab>("general");
    const [draft, setDraft] = useState<Set<NavItemKey>>(new Set(visible));
    const { t } = useTranslation()

    useEffect(() => {
        if (open) {
            setDraft(new Set(visible));
            setTab("general");
        }
    }, [open, visible]);

    const toggle = (key: NavItemKey) => {
        setDraft((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const handleSave = () => {
        onSave(draft);
        onClose();
    };

    if (!open) return null;

    const displayedKeys = tab === "general" ? GENERAL_KEYS : FAVORITE_KEYS;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="relative flex w-full max-w-lg flex-col rounded-2xl bg-background shadow-2xl mx-4 max-h-[90vh]">
                <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
                    <h2 className="text-base font-semibold">{t('page.settings.modal.setup.items')}</h2>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex gap-1 px-5 pb-3 shrink-0">
                    <TabButton active={tab === "general"} onClick={() => setTab("general")}>
                        {t('page.settings.general')}
                    </TabButton>
                    <TabButton active={tab === "favorites"} onClick={() => setTab("favorites")}>
                        {t('page.settings.games.apps')}
                    </TabButton>
                </div>

                <div className="border-t border-border/60 shrink-0" />
                <div className="overflow-y-auto flex-1 px-3 py-2">
                    {displayedKeys.map((key) => {
                        const def = ALL_NAV_ITEMS.find((i) => i.key === key)!;

                        return (
                            <NavRow
                                key={key}
                                navKey={key}
                                checked={draft.has(key)}
                                onToggle={() => toggle(key)}
                                locked={def.alwaysVisible}
                            />
                        );
                    })}
                </div>
                <div className="flex items-center justify-end gap-3 border-t border-border/60 px-5 py-4 shrink-0">
                    <button
                        onClick={onClose}
                        className="h-9 rounded-lg px-5 text-sm font-medium bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
                    >
                        {t('page.settings.cancel')}
                    </button>
                    <button
                        onClick={handleSave}
                        className="h-9 rounded-lg px-5 text-sm font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
                    >
                        {t('page.settings.save')}
                    </button>
                </div>
            </div>
        </div>
    );
};