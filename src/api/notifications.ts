import { apiClient } from '@/lib/api-client';

export interface NotificationActorPayload {
    actor_name?: string;
    actor_username?: string;
    actor_avatar_url?: string;
    entity_title?: string;
}

export interface ApiNotification {
    id: number;
    user_id: number;
    actor_id: number;
    type: string;
    entity_type: string;
    entity_id: number;
    payload: (Record<string, unknown> & NotificationActorPayload) | null;
    is_read: boolean;
    created_at: string;
}

export interface PaginatedNotifications {
    items: ApiNotification[];
    total: number;
    page: number;
    limit: number;
}

export type SectionKey =
    | 'profile' | 'groups' | 'feedback'
    | 'friends' | 'services' | 'communication' | 'account';

export function typeToSection(type: string): SectionKey {
    switch (type) {
        case 'friend_request_received':
        case 'friend_request_accepted':
            return 'friends';
        case 'story_published':
            return 'groups';
        case 'story_like':
        case 'story_comment':
        case 'story_reply':
        case 'photo_liked':
        case 'photo_commented':
        case 'comment_replied':
        case 'comment_liked':
            return 'feedback';
        case 'mention':
        case 'message':
            return 'communication';
        case 'new_login':
        case 'account_security':
            return 'account';
        case 'service':
        case 'sticker':
            return 'services';
        default:
            return 'profile';
    }
}

interface NotificationListPayload {
    data: ApiNotification[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface UnreadCountPayload {
    unread: number;
}

export const notificationsApi = {
    async list(page: number, limit: number): Promise<PaginatedNotifications> {
        const res = await apiClient.get<{ data: NotificationListPayload }>(
            `/notifications?page=${page}&limit=${limit}`,
        );
        const payload = res.data;
        return {
            items: Array.isArray(payload?.data) ? payload.data : [],
            total: payload?.total ?? 0,
            page: payload?.page ?? page,
            limit: payload?.limit ?? limit,
        };
    },

    async unreadCount(): Promise<number> {
        const res = await apiClient.get<{ data: UnreadCountPayload }>(
            '/notifications/unread-count',
        );
        return res.data?.unread ?? 0;
    },

    async markRead(id: number): Promise<void> {
        await apiClient.post(`/notifications/${id}/read`, {});
    },

    async markAllRead(): Promise<void> {
        await apiClient.post('/notifications/read-all', {});
    },
};