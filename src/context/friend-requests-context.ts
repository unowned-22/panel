import { createContext } from "react";

export type FriendRequestsCtx = {
    pendingCount: number;
    refresh: () => void;
};

export const FriendRequestsContext = createContext<FriendRequestsCtx | null>(null);
