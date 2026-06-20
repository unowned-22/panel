import { useContext } from "react";
import { SettingsContext } from "@/context/settings-context";

export const useSettings = () => {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error("SettingsContext must be used inside <SettingsContext>");
    return ctx;
};