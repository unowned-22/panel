import { apiClient } from '@/lib/api-client';

export interface ProfileRecord {
    id: number;
    friends_count: number;
    username: string;
    full_name: string;
    avatar_url: string;
    cover_url: string;
}

export const profileApi = {
    async get(username: string): Promise<ProfileRecord> {
        const res = await apiClient.get<{ data: ProfileRecord }>(`/users/${username}`);
        return res.data;
    },
};