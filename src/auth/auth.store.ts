import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthModel, UserModel } from './auth-model';

interface AuthState {
    tokens: Record<string, AuthModel>;
    activeAccountId: string | null;
    user: UserModel | undefined;
    isAdmin: boolean;
    setTokens: (accountId: string, auth: AuthModel) => void;
    removeTokens: (accountId: string) => void;
    setActiveAccountId: (id: string | null) => void;
    setUser: (user: UserModel | undefined) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            tokens: {},
            activeAccountId: null,
            user: undefined,
            isAdmin: false,
            setTokens: (accountId, auth) =>
                set((s) => ({ tokens: { ...s.tokens, [accountId]: auth } })),
            removeTokens: (accountId) =>
                set((s) => {
                    const next = { ...s.tokens };
                    delete next[accountId];
                    return { tokens: next };
                }),
            setActiveAccountId: (id) => set({ activeAccountId: id }),
            setUser: (user) =>
                set({ user, isAdmin: !!user && user.role !== 'user' }),
            logout: () =>
                set({ tokens: {}, activeAccountId: null, user: undefined, isAdmin: false }),
        }),
        {
            name: 'unowned_auth_v2',
            partialize: (s) => ({ tokens: s.tokens, activeAccountId: s.activeAccountId }),
        }
    )
);
