import type { LanguageCode } from '@/i18n/types';
import { createContext } from "react";

export interface AuthModel {
    access_token: string;
    refresh_token?: string;
}

export interface UserModel {
    id: number;
    username: string;
    email: string;
    full_name: string;
    avatar_url: string;
    cover_url: string;
    cover_mobile_url: string;
    cover_desktop_url: string;
    role: string;
    phone?: string;
    language?: LanguageCode;
}

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