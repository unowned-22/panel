import { createContext } from "react";
import type { ApiNotification } from "@/api/notifications";

export type Ctx = {
    readIds: Set<string>;
    isRead: (id: string) => boolean;
    markRead: (id: string) => void;
    markUnread: (id: string) => void;
    toggleRead: (id: string) => void;
    markAllRead: () => void;
    unreadCount: (ids: string[]) => number;
    notifications: ApiNotification[];
    isLoading: boolean;
    hasMore: boolean;
    loadMore: () => void;
    refresh: () => void;
    totalUnread: number;
};

export const NotificationsContext = createContext<Ctx | null>(null);