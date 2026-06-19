import { useContext } from "react";
import { AccountContext } from "@/context/account-context";

export const useAccount = () => {
    const ctx = useContext(AccountContext);
    if (!ctx) throw new Error("useAccount must be used within AccountProvider");
    return ctx;
};

export const getInitials = (name: string) =>
    name
        .split(" ")
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();