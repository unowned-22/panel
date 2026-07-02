import { apiClient } from '@/lib/api-client';

/**
 * GET /api/v1/users/search?q=&limit=
 *
 * Бэкенд ищет подтверждённых (email verified) пользователей через
 * Meilisearch-индекс сразу по двум полям — username и full_name
 * (см. AGENTS.md, "User Search Feature Guidance"). Отдельного эндпоинта
 * "поиск по нику" и "поиск по имени" нет и не нужно — это один и тот же
 * запрос `q`, движок сам матчит по обоим полям.
 *
 * Важно: приватности/видимости пока нет — сервис виден всем аутентифицированным
 * юзерам, и сервер сам жёстко клампит limit до 20 независимо от того, что
 * прислал клиент. Здесь дублируем кламп на всякий случай, чтобы не полагаться
 * молча на серверное поведение.
 */

export interface UserSearchItem {
    id: number;
    username: string;
    full_name: string;
    avatar_url?: string | null;
}

interface UserSearchResponse {
    items: UserSearchItem[];
}

const MAX_LIMIT = 20;

export const usersSearchApi = {
    async search(query: string, limit = 6, signal?: AbortSignal): Promise<UserSearchItem[]> {
        const q = query.trim();
        if (!q) return [];

        const params = new URLSearchParams({
            q,
            limit: String(Math.min(Math.max(limit, 1), MAX_LIMIT)),
        });

        const res = await apiClient.get<{ data: UserSearchResponse }>(
            `/users/search?${params.toString()}`,
            { logoutOn401: false },
        );

        return res.data?.items ?? [];
    },
};