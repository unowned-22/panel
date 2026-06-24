import { useContext } from "react";
import { FriendRequestsContext } from "@/context/friend-requests-context";

export const useFriendRequests = () => {
    const ctx = useContext(FriendRequestsContext);
    if (!ctx) throw new Error("useFriendRequests must be used within FriendRequestsProvider");
    return ctx;
};
