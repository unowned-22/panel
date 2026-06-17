import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthModel, UserModel } from './auth-model';

interface AuthState {
    auth: AuthModel | undefined;
    user: UserModel | undefined;
    isAdmin: boolean;
    setAuth: (auth: AuthModel | undefined) => void;
    setUser: (user: UserModel | undefined) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            auth: undefined,
            user: undefined,
            isAdmin: false,
            setAuth: (auth) => set({ auth }),
            setUser: (user) =>
                set({ user, isAdmin: !!user && user.role !== 'user' }),
            logout: () =>
                set({ auth: undefined, user: undefined, isAdmin: false }),
        }),
        {
            name: 'unowned_auth_v1',
            partialize: (s) => ({ auth: s.auth }),
        }
    )
);