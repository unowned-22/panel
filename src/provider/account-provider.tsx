import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAuthStore } from '@/auth/auth.store';
import { authActions } from '@/auth/auth-actions';
import { apiClient } from '@/lib/api-client';
import {
    STORAGE_KEY,
    ACTIVE_KEY,
    COLORS,
    AccountContext,
    type Account,
    type AccountContextValue
} from '@/context/account-context';


export const AccountProvider = ({ children }: { children: ReactNode }) => {
    const storeUser = useAuthStore((s) => s.user);
    const storeActiveId = useAuthStore((s) => s.activeAccountId);

    const [accounts, setAccounts] = useState<Account[]>(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch { /* ignore */ }
        }
        return [];
    });
    const [activeId, setActiveId] = useState<string>(() => {
        return localStorage.getItem(ACTIVE_KEY) ?? '';
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    }, [accounts]);
    useEffect(() => {
        if (activeId) localStorage.setItem(ACTIVE_KEY, activeId);
    }, [activeId]);

    // One-time migration link: if auth.store has a migrated legacy token under
    // 'acc_migrated' but the account list has a different (existing) account id,
    // rename the token key to match so they stay linked.
    const migrationDone = useRef(false);
    useEffect(() => {
        if (migrationDone.current) return;
        migrationDone.current = true;

        const { tokens, activeAccountId } = useAuthStore.getState();
        if (
            activeAccountId === 'acc_migrated' &&
            accounts.length === 1 &&
            accounts[0].id !== 'acc_migrated'
        ) {
            const migratedAuth = tokens['acc_migrated'];
            if (migratedAuth) {
                useAuthStore.getState().setTokens(accounts[0].id, migratedAuth);
            }
            useAuthStore.getState().removeTokens('acc_migrated');
            useAuthStore.getState().setActiveAccountId(accounts[0].id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-sync: when auth.store gets a new activeAccountId (e.g. after normal
    // login via /auth/login), make sure the account list reflects it.
    // If the account doesn't exist in the list yet, add it once the user is loaded.
    useEffect(() => {
        if (!storeActiveId) return;
        // Already in the list — just keep activeId in sync
        if (accounts.some((a) => a.id === storeActiveId)) {
            if (activeId !== storeActiveId) setActiveId(storeActiveId);
            return;
        }
        // Not in the list yet — wait for storeUser to be populated then add
        if (!storeUser) return;
        const newAcc: Account = {
            id: storeActiveId,
            name: storeUser.full_name,
            username: `@${storeUser.username}`,
            avatarColor: COLORS[Math.floor(Math.random() * COLORS.length)],
            user: storeUser,
        };
        setAccounts((prev) => {
            if (prev.some((a) => a.id === storeActiveId)) return prev;
            return [...prev, newAcc];
        });
        setActiveId(storeActiveId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storeActiveId, storeUser]);

    const switchAccount = async (id: string) => {
        if (!accounts.some((a) => a.id === id)) return;
        setActiveId(id);
        useAuthStore.getState().setActiveAccountId(id);
        // Reload user for this account
        try {
            const user = await authActions.getUser();
            if (user) {
                setAccounts((prev) =>
                    prev.map((a) =>
                        a.id === id
                            ? { ...a, name: user.full_name, username: `@${user.username}`, user }
                            : a
                    )
                );
            }
        } catch {
            // Token may be expired — apiClient will refresh automatically
        }
    };

    // addAccount accepts id from the caller so the same id used to store tokens
    // in auth.store is reused here — preventing the id mismatch bug.
    const addAccount: AccountContextValue["addAccount"] = (acc) => {
        const resolvedId = acc.id ?? `acc_${Date.now().toString(36)}`;
        const newAcc: Account = {
            id: resolvedId,
            avatarColor: acc.avatarColor ?? COLORS[Math.floor(Math.random() * COLORS.length)],
            name: acc.name,
            username: acc.username.startsWith("@") ? acc.username : `@${acc.username}`,
            hasNotifications: acc.hasNotifications,
            user: acc.user,
        };
        setAccounts((prev) => {
            const existing = prev.find((a) => a.username === newAcc.username);
            if (existing) {
                // Duplicate username — switch to the existing account
                setActiveId(existing.id);
                useAuthStore.getState().setActiveAccountId(existing.id);
                return prev;
            }
            return [...prev, newAcc];
        });
        // Do NOT call setActiveId / setActiveAccountId here —
        // the caller drives the switch via switchAccount() after addAccount() returns.
        return newAcc;
    };

    const removeAccount = (id: string) => {
        // Fire-and-forget: revoke the refresh token for this account
        const tokenForAccount = useAuthStore.getState().tokens[id];
        if (tokenForAccount?.refresh_token) {
            apiClient.post('/auth/logout', { refresh_token: tokenForAccount.refresh_token })
                .catch(() => { /* ignore — local cleanup proceeds regardless */ });
        }

        useAuthStore.getState().removeTokens(id);

        setAccounts((prev) => {
            const next = prev.filter((a) => a.id !== id);
            if (next.length === 0) return prev; // never remove last account
            if (id === activeId) {
                const fallback = next[0].id;
                setActiveId(fallback);
                useAuthStore.getState().setActiveAccountId(fallback);
            }
            return next;
        });
    };

    const baseAccount = accounts.find((a) => a.id === activeId) ?? accounts[0];
    const activeAccount: Account = storeUser && baseAccount
        ? {
            ...baseAccount,
            name: storeUser.full_name,
            username: `@${storeUser.username}`,
            user: storeUser,
        }
        : baseAccount ?? { id: '', name: '', username: '', avatarColor: COLORS[0] };

    return (
        <AccountContext.Provider
            value={{ accounts, activeId, activeAccount, switchAccount, addAccount, removeAccount }}
        >
            {children}
        </AccountContext.Provider>
    );
};