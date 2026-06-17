import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/auth/auth.store';
import type { AuthModel, UserModel } from './auth-model';

export const authActions = {
    async login(email: string, password: string): Promise<UserModel> {
        const body = await apiClient.post<{ data: AuthModel }>(
            '/auth/login',
            { email, password },
            { logoutOn401: false }
        );

        useAuthStore.getState().setAuth(body.data);

        const me = await apiClient.get<{ data: UserModel }>('/users/me');
        useAuthStore.getState().setUser(me.data);

        return me.data;
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
        await apiClient.post('/auth/password/request', { email });
    },

    async resetPassword(token: string, new_password: string): Promise<void> {
        await apiClient.post('/auth/password/reset', { token, new_password });
    },

    async resendVerificationEmail(email: string): Promise<void> {
        await apiClient.post('/auth/resend-verification', { email });
    },

    logout(): void {
        useAuthStore.getState().logout();
        window.location.href = '/auth/login';
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
};