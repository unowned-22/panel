import type { UserModel } from '@/auth/auth-model';
import { createContext } from "react";

export type Account = {
    id: string;
    name: string;
    username: string;
    avatarColor: string;
    hasNotifications?: boolean;
    user?: UserModel;
};

export type AccountContextValue = {
    accounts: Account[];
    activeId: string;
    activeAccount: Account;
    switchAccount: (id: string) => void | Promise<void>;
    // id is optional: pass it when tokens are already stored under a specific key
    addAccount: (acc: Omit<Account, "avatarColor"> & { avatarColor?: string }) => Account;
    removeAccount: (id: string) => void;
};

export const COLORS = [
    "hsl(210 90% 55%)",
    "hsl(280 70% 55%)",
    "hsl(150 60% 45%)",
    "hsl(28 95% 55%)",
    "hsl(340 80% 55%)",
    "hsl(190 75% 45%)",
];

export const STORAGE_KEY = "un_accounts_v1";
export const ACTIVE_KEY = "un_active_account_v1";

export const AccountContext = createContext<AccountContextValue | null>(null);