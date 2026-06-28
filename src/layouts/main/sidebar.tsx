import {
    User, Newspaper, MessageCircle, Phone, Users, UsersRound,
    Image as ImageIcon, Music, Video, Film, Gamepad2, Smile,
    ShoppingBag, LayoutGrid, Mic, Bookmark, HelpCircle,
    type LucideIcon, Plus
} from "lucide-react";
import { SidebarNavItem } from "./sidebar-nav-item";
import type { NavItemKey } from "@/context/settings-context";
import type { TranslationDictionary } from "@/i18n/types";
import { useFriendRequests } from "@/hooks/use-friend-requests";

const ICON_MAP: Record<NavItemKey, LucideIcon> = {
    profile:   User,
    feed:      Newspaper,
    messenger: MessageCircle,
    calls:     Phone,
    friends:   Users,
    groups:    UsersRound,
    photos:    ImageIcon,
    music:     Music,
    video:     Video,
    clips:     Film,
    games:     Gamepad2,
    stickers:  Smile,
    market:    ShoppingBag,
    services:  LayoutGrid,
    bookmarks: Bookmark,
    voices:    Mic,
    help:      HelpCircle,
};

const LABEL_KEY: Record<NavItemKey, keyof TranslationDictionary> = {
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

const TO: Record<NavItemKey, string> = {
    profile:   "/",
    feed:      "/me/feed",
    messenger: "/me/messenger",
    calls:     "/me/calls",
    friends:   "/me/friends",
    groups:    "/me/groups",
    photos:    "/me/photos",
    music:     "/me/music",
    video:     "/me/video",
    clips:     "/me/clips",
    games:     "/me/games",
    stickers:  "/me/stickers",
    market:    "/market",
    services:  "/me/services",
    bookmarks: "/me/bookmarks",
    voices:    "/me/voices",
    help:      "/me/help",
};

const ORDERED_KEYS: NavItemKey[] = [
    "profile", "feed", "messenger", "calls", "friends", "groups",
    "photos", "music", "video", "clips", "games", "stickers", "market",
    "services", "voices", "bookmarks", "help",
];

const GROUP_BREAKS: NavItemKey[] = ["services", "bookmarks"];

interface SidebarProps {
    visible: Set<NavItemKey>;
}

export const Sidebar = ({ visible }: SidebarProps) => {
    const { pendingCount } = useFriendRequests();
    const items = ORDERED_KEYS.filter((k) => visible.has(k));

    const groups: NavItemKey[][] = [];
    let current: NavItemKey[] = [];
    for (const key of items) {
        if (GROUP_BREAKS.includes(key) && current.length > 0) {
            groups.push(current);
            current = [];
        }
        current.push(key);
    }
    if (current.length > 0) groups.push(current);

    return (
        <aside className="hidden lg:flex flex-col w-58 shrink-0 py-3 pr-2 sticky top-15 self-start max-h-[calc(100vh-60px)]">
            {groups.map((group, i) => (
                <div key={i}>
                    {i > 0 && <div className="my-3 border-t border-sidebar-border" />}
                    <nav className="flex flex-col gap-0.5 pl-7 pr-2">
                        {group.map((key) => (
                            <SidebarNavItem
                                key={key}
                                to={TO[key]}
                                label={LABEL_KEY[key]}
                                icon={ICON_MAP[key]}
                                dot={key === "games"}
                                badge={key === "friends" ? pendingCount : undefined}
                                extraTo={key === "video" ? "/me/video/create" : undefined}
                                extraIcon={key === "video" ? Plus : undefined}
                            />
                        ))}
                    </nav>
                </div>
            ))}
        </aside>
    );
};