import { createContext } from "react";
import type { TranslationDictionary } from "@/i18n/types";

export type NavItemKey =
    | "profile" | "feed" | "messenger" | "calls" | "friends"
    | "groups" | "photos" | "music" | "video" | "clips"
    | "games" | "stickers" | "market" | "services" | "voices"
    | "bookmarks" | "help";

export interface NavItemDef {
    key: NavItemKey;
    labelKey: keyof TranslationDictionary;
    to: string;
    alwaysVisible?: boolean;
}

export const ALL_NAV_ITEMS: NavItemDef[] = [
    { key: "profile",   labelKey: "sidebar.profile",   to: "/",               alwaysVisible: true },
    { key: "feed",      labelKey: "sidebar.feed",      to: "/me/feed" },
    { key: "messenger", labelKey: "sidebar.messenger", to: "/me/messenger",   alwaysVisible: true },
    { key: "calls",     labelKey: "sidebar.calls",     to: "/me/calls" },
    { key: "friends",   labelKey: "sidebar.friends",   to: "/me/friends" },
    { key: "groups",    labelKey: "sidebar.groups",    to: "/me/groups" },
    { key: "photos",    labelKey: "sidebar.photos",    to: "/me/photos" },
    { key: "music",     labelKey: "sidebar.music",     to: "/me/music" },
    { key: "video",     labelKey: "sidebar.video",     to: "/me/video" },
    { key: "clips",     labelKey: "sidebar.clips",     to: "/me/clips" },
    { key: "games",     labelKey: "sidebar.games",     to: "/me/games" },
    { key: "stickers",  labelKey: "sidebar.stickers",  to: "/me/stickers" },
    { key: "market",    labelKey: "sidebar.market",    to: "/market" },
    { key: "services",  labelKey: "sidebar.services",  to: "/me/services" },
    { key: "bookmarks", labelKey: "sidebar.bookmarks", to: "/me/bookmarks" },
    { key: "voices",    labelKey: "sidebar.voices",    to: "/me/voices" },
    { key: "help",      labelKey: "sidebar.help",      to: "/me/help" },
];

export const DEFAULT_VISIBLE = new Set<NavItemKey>([
    "profile", "feed", "messenger", "calls", "friends", "groups",
    "photos", "music", "video", "clips", "games", "stickers", "market",
    "services", "voices", "bookmarks", "help",
]);

export const STORAGE_KEY = "nav_config_v1";

export interface SettingsContextValue {
    visible: Set<NavItemKey>;
    isVisible: (key: NavItemKey) => boolean;
    save: (draft: Set<NavItemKey>) => void;
    modalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);