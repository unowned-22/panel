import type { NavConfig } from './types';
import {
    User, Newspaper, MessageCircle, Phone, Users, UsersRound,
    Image as ImageIcon, Music, Video, Film, Gamepad2, Smile, ShoppingBag,
    LayoutGrid, Mic, Bookmark, HelpCircle,
} from "lucide-react";
import { SidebarNavItem } from "./sidebar-nav-item";

const main: NavConfig = [
    { to: "/", label: "sidebar.profile", icon: User },
    { to: "/me/feed", label: "sidebar.feed", icon: Newspaper },
    { to: "/me/messenger", label: "sidebar.messenger", icon: MessageCircle },
    { to: "/me/calls", label: "sidebar.calls", icon: Phone },
    { to: "/me/friends", label: "sidebar.friends", icon: Users },
    { to: "/me/groups", label: "sidebar.groups", icon: UsersRound },
    { to: "/me/photos", label: "sidebar.photos", icon: ImageIcon },
    { to: "/me/music", label: "sidebar.music", icon: Music },
    { to: "/me/video", label: "sidebar.video", icon: Video },
    { to: "/me/clips", label: "sidebar.clips", icon: Film },
    { to: "/me/games", label: "sidebar.games", icon: Gamepad2, dot: true },
    { to: "/me/stickers", label: "sidebar.stickers", icon: Smile },
    { to: "/market", label: "sidebar.market", icon: ShoppingBag },
];

const services: NavConfig = [
    { to: "/me/services", label: "sidebar.services", icon: LayoutGrid },
    { to: "/me/voices", label: "sidebar.voices", icon: Mic },
];

const bottom: NavConfig = [
    { to: "/me/bookmarks", label: "sidebar.bookmarks", icon: Bookmark },
    { to: "/me/help", label: "sidebar.help", icon: HelpCircle },
];

export const Sidebar = () => {
    return (
        <aside className="hidden lg:flex flex-col w-58 shrink-0 py-3 pr-2 sticky top-15 self-start max-h-[calc(100vh-60px)] overflow-y-auto">
            <nav className="flex flex-col gap-0.5">
                {main.map((i) => <SidebarNavItem key={i.to} {...i} />)}
            </nav>
            <div className="my-3 border-t border-sidebar-border" />
            <nav className="flex flex-col gap-0.5">
                {services.map((i) => <SidebarNavItem key={i.to} {...i} />)}
            </nav>
            <div className="my-3 border-t border-sidebar-border" />
            <nav className="flex flex-col gap-0.5">
                {bottom.map((i) => <SidebarNavItem key={i.to} {...i} />)}
            </nav>
        </aside>
    );
};