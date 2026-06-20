import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuthStore } from '@/auth/auth.store';
import { apiClient } from '@/lib/api-client';
import {
    STORAGE_KEY,
    ACTIVE_KEY,
    COLORS,
    AccountContext,
    type Account,
    type AccountContextValue
} from '@/context/account-context';

const colorFromId = (id: string) =>
    COLORS[id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];

export const AccountProvider = ({ children }: { children: ReactNode }) => {
    const storeUser = useAuthStore((s) => s.user);
    const storeActiveId = useAuthStore((s) => s.activeAccountId);
    const activeId = storeActiveId ?? '';

    const [savedAccounts, setSavedAccounts] = useState<Account[]>(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch { /* ignore */ }
        }
        return [];
    });

    const accounts = useMemo(() => {
        if (!storeActiveId || !storeUser) return savedAccounts;
        if (savedAccounts.some((a) => a.id === storeActiveId)) return savedAccounts;
        const alreadyTracked = savedAccounts.some(
            (a) => a.user?.id === storeUser.id || a.username === `@${storeUser.username}`
        );
        if (alreadyTracked) return savedAccounts;

        return [
            ...savedAccounts,
            {
                id: storeActiveId,
                name: storeUser.full_name,
                username: `@${storeUser.username}`,
                avatarColor: colorFromId(storeActiveId),
                user: storeUser,
            } satisfies Account,
        ];
    }, [savedAccounts, storeActiveId, storeUser]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    }, [accounts]);

    useEffect(() => {
        if (storeActiveId) localStorage.setItem(ACTIVE_KEY, storeActiveId);
    }, [storeActiveId]);

    const switchAccount = (id: string) => {
        if (!accounts.some((a) => a.id === id)) return;
        useAuthStore.getState().setActiveAccountId(id);
        window.location.href = '/me/account';
    };

    const addAccount: AccountContextValue["addAccount"] = (acc) => {
        const resolvedId = acc.id ?? `acc_${Date.now().toString(36)}`;
        const newAcc: Account = {
            id: resolvedId,
            avatarColor: acc.avatarColor ?? colorFromId(resolvedId),
            name: acc.name,
            username: acc.username.startsWith("@") ? acc.username : `@${acc.username}`,
            hasNotifications: acc.hasNotifications,
            user: acc.user,
        };

        let existingAccount: Account | undefined;

        setSavedAccounts((prev) => {
            const existing = prev.find(
                (a) => a.id === newAcc.id || a.username === newAcc.username
            );
            if (existing) {
                existingAccount = existing;
                return prev;
            }
            return [...prev, newAcc];
        });

        if (existingAccount) {
            useAuthStore.getState().setActiveAccountId(existingAccount.id);
            return existingAccount;
        }

        return newAcc;
    };

    const removeAccount = (id: string) => {
        const tokenForAccount = useAuthStore.getState().tokens[id];
        if (tokenForAccount?.refresh_token) {
            apiClient
                .post('/auth/logout', { refresh_token: tokenForAccount.refresh_token })
                .catch(() => { /* ignore — local cleanup proceeds regardless */ });
        }

        useAuthStore.getState().removeTokens(id);

        setSavedAccounts((prev) => {
            const next = prev.filter((a) => a.id !== id);
            if (next.length === 0) return prev; // never remove last account

            if (id === activeId) {
                useAuthStore.getState().setActiveAccountId(next[0].id);
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