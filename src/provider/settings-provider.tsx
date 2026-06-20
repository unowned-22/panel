import { type ReactNode, useCallback, useEffect, useState } from "react";
import {
    SettingsContext,
    ALL_NAV_ITEMS,
    STORAGE_KEY,
    DEFAULT_VISIBLE,
    type NavItemKey,
} from "@/context/settings-context";
import { fetchUserPreferences, saveUserPreferences } from "@/lib/user-preferences";
import { useAuthStore } from "@/auth/auth.store";

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    // Settings are user-scoped; there's nothing to load (and no point hitting
    // the API) until someone is actually authenticated — e.g. on the login page.
    const isAuthenticated = useAuthStore((s) => !!s.activeAccountId && !!s.tokens[s.activeAccountId]);

    const [isLoading, setIsLoading] = useState(isAuthenticated);

    const [visible, setVisible] = useState<Set<NavItemKey>>(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try { return new Set(JSON.parse(raw) as NavItemKey[]); } catch { /* ignore */ }
        }
        return new Set(DEFAULT_VISIBLE);
    });

    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        fetchUserPreferences()
            .then((prefs) => {
                if (prefs && prefs.nav_config.length > 0) {
                    const next = new Set(prefs.nav_config);
                    setVisible(next);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
                }
            })
            .finally(() => setIsLoading(false));
    }, [isAuthenticated]);

    const save = useCallback(async (draft: Set<NavItemKey>) => {
        ALL_NAV_ITEMS.forEach((item) => {
            if (item.alwaysVisible) draft.add(item.key);
        });
        const next = new Set(draft);
        setVisible(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
        await saveUserPreferences({ nav_config: [...next] });
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
            isLoading,
        }}>
            {children}
        </SettingsContext.Provider>
    );
};