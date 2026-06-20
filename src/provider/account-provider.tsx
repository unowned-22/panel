import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAuthStore } from '@/auth/auth.store';
import { authActions } from '@/auth/auth-actions';
import { apiClient } from '@/lib/api-client';
import {
    STORAGE_KEY,
    ACTIVE_KEY,
    DEFAULT_ACCOUNTS,
    COLORS,
    AccountContext,
    type Account,
    type AccountContextValue
} from '@/context/account-context';


export const AccountProvider = ({ children }: { children: ReactNode }) => {
    const storeUser = useAuthStore((s) => s.user);
    const [accounts, setAccounts] = useState<Account[]>(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);

        return DEFAULT_ACCOUNTS;
    });
    const [activeId, setActiveId] = useState<string>(() => {
        const raw = localStorage.getItem(ACTIVE_KEY);
        if (raw) return raw;

        return DEFAULT_ACCOUNTS[0].id;
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    }, [accounts]);
    useEffect(() => {
        localStorage.setItem(ACTIVE_KEY, activeId);
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

    const switchAccount = async (id: string) => {
        if (!accounts.some((a) => a.id === id)) return;
        setActiveId(id);
        useAuthStore.getState().setActiveAccountId(id);
        // Reload user for this account
        try {
            const user = await authActions.getUser(); // fetches /users/me with active account's token
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

    const addAccount: AccountContextValue["addAccount"] = (acc) => {
        const newAcc: Account = {
            id: `acc_${Date.now().toString(36)}`,
            avatarColor: acc.avatarColor ?? COLORS[Math.floor(Math.random() * COLORS.length)],
            name: acc.name,
            username: acc.username.startsWith("@") ? acc.username : `@${acc.username}`,
            hasNotifications: acc.hasNotifications,
            user: acc.user,
        };
        setAccounts((prev) => {
            const existing = prev.find((a) => a.username === newAcc.username);
            if (existing) {
                setActiveId(existing.id);
                useAuthStore.getState().setActiveAccountId(existing.id);
                return prev;
            }
            return [...prev, newAcc];
        });
        setActiveId(newAcc.id);
        useAuthStore.getState().setActiveAccountId(newAcc.id);
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
    const activeAccount: Account = storeUser
        ? {
            ...baseAccount,
            name: storeUser.full_name,
            username: `@${storeUser.username}`,
            user: storeUser,
        }
        : baseAccount;

    return (
        <AccountContext.Provider
            value={{ accounts, activeId, activeAccount, switchAccount, addAccount, removeAccount }}
        >
            {children}
        </AccountContext.Provider>
    );
};
