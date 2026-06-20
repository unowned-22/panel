import { type ReactNode, useCallback, useState } from "react";
import {
    SettingsContext,
    ALL_NAV_ITEMS,
    STORAGE_KEY,
    DEFAULT_VISIBLE,
    type NavItemKey
} from "@/context/settings-context";

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const [visible, setVisible] = useState<Set<NavItemKey>>(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return new Set(JSON.parse(raw) as NavItemKey[]);

        return new Set(DEFAULT_VISIBLE);
    });

    const [modalOpen, setModalOpen] = useState(false);
    const save = useCallback((draft: Set<NavItemKey>) => {
        ALL_NAV_ITEMS.forEach((item) => {
            if (item.alwaysVisible) draft.add(item.key);
        });
        const next = new Set(draft);
        setVisible(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    }, []);

    const isVisible = useCallback(
        (key: NavItemKey) => visible.has(key),
        [visible],
    );

    return (
        <SettingsContext.Provider value={{
            visible,
            isVisible,
            save,
            modalOpen,
            openModal: () => setModalOpen(true),
            closeModal: () => setModalOpen(false),
        }}>
            {children}
        </SettingsContext.Provider>
    );
};