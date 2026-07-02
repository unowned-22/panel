import { apiClient } from '@/lib/api-client';

export interface FriendUser {
    id: number;
    username: string;
    full_name: string;
    avatar_url: string;
}

// Ответ для /friends, /friends/requests/incoming, /friends/requests/outgoing —
// теперь всегда содержит данные второго участника, а не только его ID.
export interface FriendConnection {
    friendship_id: number;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    updated_at: string;
    user: FriendUser;
}

interface PaginatedConnections {
    data: FriendConnection[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface UserSuggestion extends FriendUser {
    mutual_friends_count: number;
}

interface PaginatedSuggestions {
    data: UserSuggestion[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// Сырой friendship-объект без данных юзера — по-прежнему используется
// в ответах send/accept/reject, эти эндпоинты не менялись.
export interface FriendshipRecord {
    id: number;
    requester_id: number;
    addressee_id: number;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
    created_at: string;
    updated_at: string;
}

export const friendshipApi = {
    async listFriends(page = 1, limit = 20): Promise<PaginatedConnections> {
        const res = await apiClient.get<{ data: PaginatedConnections }>(
            `/friends?page=${page}&limit=${limit}`,
        );
        return res.data;
    },

    async listIncoming(page = 1, limit = 20): Promise<PaginatedConnections> {
        const res = await apiClient.get<{ data: PaginatedConnections }>(
            `/friends/requests/incoming?page=${page}&limit=${limit}`,
        );
        return res.data;
    },

    async listOutgoing(page = 1, limit = 20): Promise<PaginatedConnections> {
        const res = await apiClient.get<{ data: PaginatedConnections }>(
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

    async listSuggestions(page = 1, limit = 20): Promise<PaginatedSuggestions> {
        const res = await apiClient.get<{ data: PaginatedSuggestions }>(
            `/friends/suggestions?page=${page}&limit=${limit}`,
        );
        return res.data;
    },
};