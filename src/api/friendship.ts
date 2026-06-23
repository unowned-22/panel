import { apiClient } from '@/lib/api-client';

export interface FriendshipRecord {
    id: number;
    requester_id: number;
    addressee_id: number;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
    created_at: string;
    updated_at: string;
}

interface PaginatedFriendships {
    data: FriendshipRecord[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface UserSuggestion {
    id: number;
    username: string;
    full_name: string;
    avatar_url: string;
}

interface PaginatedSuggestions {
    data: UserSuggestion[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export const friendshipApi = {
    async listFriends(page = 1, limit = 20): Promise<PaginatedFriendships> {
        const res = await apiClient.get<{ data: PaginatedFriendships }>(
            `/friends?page=${page}&limit=${limit}`,
        );
        return res.data;
    },

    async listIncoming(page = 1, limit = 20): Promise<PaginatedFriendships> {
        const res = await apiClient.get<{ data: PaginatedFriendships }>(
            `/friends/requests/incoming?page=${page}&limit=${limit}`,
        );
        return res.data;
    },

    async listOutgoing(page = 1, limit = 20): Promise<PaginatedFriendships> {
        const res = await apiClient.get<{ data: PaginatedFriendships }>(
            `/friends/requests/outgoing?page=${page}&limit=${limit}`,
        );
        return res.data;
    },

    async sendRequest(addresseeId: number): Promise<FriendshipRecord> {
        const res = await apiClient.post<{ data: FriendshipRecord }>(
            '/friends/requests',
            { addressee_id: addresseeId },
        );
        return res.data;
    },

    async accept(id: number): Promise<FriendshipRecord> {
        const res = await apiClient.post<{ data: FriendshipRecord }>(
            `/friends/requests/${id}/accept`,
            {},
        );
        return res.data;
    },

    async reject(id: number): Promise<FriendshipRecord> {
        const res = await apiClient.post<{ data: FriendshipRecord }>(
            `/friends/requests/${id}/reject`,
            {},
        );
        return res.data;
    },

    async cancel(id: number): Promise<void> {
        await apiClient.post(`/friends/requests/${id}/cancel`, {});
    },

    async remove(id: number): Promise<void> {
        await apiClient.delete(`/friends/${id}`);
    },

    // Placeholder
    async listSuggestions(page = 1, limit = 20): Promise<PaginatedSuggestions> {
        const res = await apiClient.get<{ data: PaginatedSuggestions }>(
            `/friends/suggestions?page=${page}&limit=${limit}`,
        );
        return res.data;
    },
};