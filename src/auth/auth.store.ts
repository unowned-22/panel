import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthModel, UserModel } from './auth-model';

interface AuthState {
    // Map of accountId → AuthModel
    tokens: Record<string, AuthModel>;

    // Which account is currently active
    activeAccountId: string | null;

    // Single user for the active account (derived, not persisted)
    user: UserModel | undefined;
    isAdmin: boolean;

    // Actions
    setTokens: (accountId: string, auth: AuthModel) => void;
    removeTokens: (accountId: string) => void;
    setActiveAccountId: (id: string | null) => void;
    setUser: (user: UserModel | undefined) => void;
    logout: () => void;
}

// One-time migration from the old single-account shape (unowned_auth_v1)
// to the new multi-account shape (unowned_auth_v2), run before the persist
// middleware hydrates the new store.
function migrateLegacyAuth() {
    try {
        if (localStorage.getItem('unowned_auth_v2')) return;

        const oldRaw = localStorage.getItem('unowned_auth_v1');
        if (!oldRaw) return;

        const old = JSON.parse(oldRaw);
        if (old?.state?.auth?.access_token) {
            const migratedId = 'acc_migrated';
            const newShape = {
                state: { tokens: { [migratedId]: old.state.auth }, activeAccountId: migratedId },
                version: 0,
            };
            localStorage.setItem('unowned_auth_v2', JSON.stringify(newShape));
        }
        // Do not remove old key here; AccountProvider migration handles linking IDs
    } catch {
        /* ignore */
    }
}

migrateLegacyAuth();

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
