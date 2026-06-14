import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Account = {
    id: string;
    name: string;
    username: string;
    avatarColor: string;
    hasNotifications?: boolean;
};

type AccountsContextValue = {
    accounts: Account[];
    activeId: string;
    activeAccount: Account;
    switchAccount: (id: string) => void;
    addAccount: (acc: Omit<Account, "id" | "avatarColor"> & { avatarColor?: string }) => Account;
    removeAccount: (id: string) => void;
};

const STORAGE_KEY = "vk_accounts_v1";
const ACTIVE_KEY = "vk_active_account_v1";

const COLORS = [
    "hsl(210 90% 55%)",
    "hsl(280 70% 55%)",
    "hsl(150 60% 45%)",
    "hsl(28 95% 55%)",
    "hsl(340 80% 55%)",
    "hsl(190 75% 45%)",
];

const DEFAULT_ACCOUNTS: Account[] = [
    {
        id: "acc_mark",
        name: "Mark Roberts",
        username: "@id648226314",
        avatarColor: COLORS[0],
        hasNotifications: true,
    },
];

const AccountsContext = createContext<AccountsContextValue | null>(null);

export const AccountsProvider = ({ children }: { children: ReactNode }) => {
    const [accounts, setAccounts] = useState<Account[]>(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch {}
        return DEFAULT_ACCOUNTS;
    });
    const [activeId, setActiveId] = useState<string>(() => {
        try {
            const raw = localStorage.getItem(ACTIVE_KEY);
            if (raw) return raw;
        } catch {}
        return DEFAULT_ACCOUNTS[0].id;
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    }, [accounts]);
    useEffect(() => {
        localStorage.setItem(ACTIVE_KEY, activeId);
    }, [activeId]);

    const activeAccount = accounts.find((a) => a.id === activeId) ?? accounts[0];

    const switchAccount = (id: string) => {
        if (accounts.some((a) => a.id === id)) setActiveId(id);
    };

    const addAccount: AccountsContextValue["addAccount"] = (acc) => {
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

    return (
        <AccountsContext.Provider
            value={{ accounts, activeId, activeAccount, switchAccount, addAccount, removeAccount }}
        >
            {children}
        </AccountsContext.Provider>
    );
};

export const useAccounts = () => {
    const ctx = useContext(AccountsContext);
    if (!ctx) throw new Error("useAccounts must be used within AccountsProvider");
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
