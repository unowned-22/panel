import { useEffect, useState, type ReactNode } from "react";
import { useAuthStore } from '@/auth/auth.store';
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

    const switchAccount = (id: string) => {
        if (accounts.some((a) => a.id === id)) setActiveId(id);
    };

    const addAccount: AccountContextValue["addAccount"] = (acc) => {
        const newAcc: Account = {
            id: `acc_${Date.now().toString(36)}`,
            avatarColor: acc.avatarColor ?? COLORS[Math.floor(Math.random() * COLORS.length)],
            name: acc.name,
            username: acc.username.startsWith("@") ? acc.username : `@${acc.username}`,
            hasNotifications: acc.hasNotifications,
        };
        setAccounts((prev) => {
            const existing = prev.find((a) => a.username === newAcc.username);
            if (existing) {
                setActiveId(existing.id);
                return prev;
            }
            return [...prev, newAcc];
        });
        setActiveId(newAcc.id);
        return newAcc;
    };

    const removeAccount = (id: string) => {
        setAccounts((prev) => {
            const next = prev.filter((a) => a.id !== id);
            if (next.length === 0) return prev;
            if (id === activeId) setActiveId(next[0].id);
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
