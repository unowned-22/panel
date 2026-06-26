import { useContext } from "react";
import { MessengerContext } from "@/context/messenger-context";

export const useMessenger = () => {
    const ctx = useContext(MessengerContext);
    if (!ctx) throw new Error("useMessenger must be used within MessengerProvider");
    return ctx;
};