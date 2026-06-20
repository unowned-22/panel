import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/auth/auth.store';
import { clearPreferencesCache } from '@/lib/user-preferences';
import type { AuthModel, UserModel } from './auth-model';

export const authActions = {
    async login(email: string, password: string): Promise<UserModel> {
        const body = await apiClient.post<{ data: AuthModel }>(
            '/auth/login',
            { email, password },
            { logoutOn401: false }
        );

        const accountId = useAuthStore.getState().activeAccountId ?? `acc_${Date.now().toString(36)}`;
        useAuthStore.getState().setTokens(accountId, body.data);
        useAuthStore.getState().setActiveAccountId(accountId);

        const me = await apiClient.get<{ data: UserModel }>('/users/me');
        useAuthStore.getState().setUser(me.data);

        return me.data;
    },

    async addAccount(
        email: string,
        password: string,
        accountId: string // pre-generated ID from AccountProvider
    ): Promise<UserModel> {
        // 1. Login without touching the current active account
        const body = await apiClient.post<{ data: AuthModel }>(
            '/auth/login',
            { email, password },
            { logoutOn401: false }
        );

        // 2. Store tokens under the new account ID
        useAuthStore.getState().setTokens(accountId, body.data);

        // 3. Temporarily switch active to fetch the new account's user
        const previousActiveId = useAuthStore.getState().activeAccountId;
        useAuthStore.getState().setActiveAccountId(accountId);

        try {
            const me = await apiClient.get<{ data: UserModel }>('/users/me');
            // 4. Switch back to previous account
            useAuthStore.getState().setActiveAccountId(previousActiveId);
            return me.data;
        } catch (err) {
            // On failure: clean up the new tokens and restore previous
            useAuthStore.getState().removeTokens(accountId);
            useAuthStore.getState().setActiveAccountId(previousActiveId);
            throw err;
        }
    },

    async register(
        email: string,
        password: string,
        full_name: string,
        username: string,
        phone?: string
    ): Promise<void> {
        await apiClient.post('/auth/register', {
            email,
            password,
            full_name,
            username,
            ...(phone ? { phone } : {}),
        });
    },

    async getUser(): Promise<UserModel | null> {
        try {
            const data = await apiClient.get<{ data: UserModel }>('/users/me');
            useAuthStore.getState().setUser(data.data);
            return data.data;
        } catch {
            useAuthStore.getState().setUser(undefined);
            return null;
        }
    },

    async updateProfile(userData: Partial<UserModel>): Promise<UserModel> {
        const updated = await apiClient.put<{ data: UserModel }>('/users/me', userData);
        useAuthStore.getState().setUser(updated.data);
        return updated.data;
    },

    async requestPasswordReset(email: string): Promise<void> {
        await apiClient.post('/auth/forgot-password', { email });
    },

    async resetPassword(token: string, new_password: string): Promise<void> {
        await apiClient.post('/auth/reset-password', { token, new_password });
    },

    async resendVerificationEmail(email: string): Promise<void> {
        await apiClient.post('/auth/resend-verification', { email });
    },

    async logout(): Promise<void> {
        const { tokens, activeAccountId } = useAuthStore.getState();
        const refreshToken = activeAccountId ? tokens[activeAccountId]?.refresh_token : undefined;

        try {
            if (refreshToken) {
                await apiClient.post('/auth/logout', { refresh_token: refreshToken });
            }
        } catch {
            // Если запрос не прошёл — всё равно разлогиниваем локально
        } finally {
            clearPreferencesCache();
            useAuthStore.getState().logout();
            window.location.href = '/auth/login';
        }
    },

    async uploadAvatar(file: File): Promise<string> {
        const res = await apiClient.upload<{ data: { avatar_url: string } }>('/users/me/avatar', file);
        const avatarUrl = res.data.avatar_url;
        useAuthStore.getState().setUser({
            ...useAuthStore.getState().user!,
            avatar_url: avatarUrl,
        });
        return avatarUrl;
    },

    async uploadCover(file: File): Promise<string> {
        const res = await apiClient.upload<{ data: { cover_url: string } }>('/users/me/cover', file);
        const coverUrl = res.data.cover_url;
        useAuthStore.getState().setUser({
            ...useAuthStore.getState().user!,
            cover_url: coverUrl,
        });
        return coverUrl;
    },

    deleteAvatar(): void {
        apiClient.delete('/users/me/avatar');
        useAuthStore.getState().setUser({
            ...useAuthStore.getState().user!,
            avatar_url: '',
        });
    },

    deleteCover(): void {
        apiClient.delete('/users/me/cover');
        useAuthStore.getState().setUser({
            ...useAuthStore.getState().user!,
            cover_url: '',
        });
    },
};