import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/auth/auth.store';
import { ApiError } from '@/lib/api-client';

export type PhotoVisibility = 'everyone' | 'friends' | 'nobody';

export interface Photo {
    id: number;
    user_id: number;
    album_id?: number | null;
    url: string;
    preview_url?: string | null;
    caption?: string | null;
    visibility?: PhotoVisibility;
    likes_count: number;
    liked_by_me?: boolean;
    created_at: string;
}

export interface Album {
    id: number;
    title: string;
    description?: string | null;
    cover_url?: string | null;
    photo_count: number;
    visibility?: PhotoVisibility;
    created_at: string;
}

export interface CommentAuthor {
    id: number;
    full_name: string;
    username: string;
    avatar_url?: string;
}

export interface Comment {
    id: number;
    photo_id: number;
    author_id: number;
    author?: CommentAuthor;
    body: string;
    parent_id?: number | null;
    likes_count: number;
    liked_by_me?: boolean;
    created_at: string;
    deleted?: boolean;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
}

export const photosApi = {
    async uploadPhoto(file: File, onProgress?: (percent: number) => void, albumId?: number | null): Promise<Photo> {
        const base = import.meta.env.VITE_API_URL ?? '';
        const url = `${base.replace(/\/$/, '')}/photos`;
        const { tokens, activeAccountId } = useAuthStore.getState();
        const token = activeAccountId ? tokens[activeAccountId]?.access_token : undefined;

        return new Promise<Photo>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

            xhr.upload.onprogress = (ev) => {
                if (!ev.lengthComputable) return;
                const pct = Math.round((ev.loaded / ev.total) * 100);
                if (onProgress) onProgress(pct);
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const parsed = JSON.parse(xhr.responseText);
                        resolve(parsed.data);
                    } catch (err) {
                        reject(err instanceof Error ? err : new Error('Invalid response'));
                    }
                } else {
                    reject(new ApiError(xhr.status, xhr.responseText));
                }
            };

            xhr.onerror = () => reject(new Error('Network error'));

            const fd = new FormData();
            fd.append('file', file);
            if (albumId) fd.append('album_id', String(albumId));
            xhr.send(fd);
        });
    },

    async listMyPhotos(page = 1, limit = 24): Promise<PaginatedResponse<Photo>> {
        const res = await apiClient.get<any>(`/photos?page=${page}&limit=${limit}`);
        if (Array.isArray(res)) {
            return { items: res as Photo[], total: (res as Photo[]).length, page, limit };
        }
        const maybeData = res?.data ?? res;
        if (Array.isArray(maybeData)) {
            return { items: maybeData as Photo[], total: maybeData.length, page, limit };
        }
        // nested shape
        const nested = res?.data?.data ?? res?.data;
        if (Array.isArray(nested)) {
            const total = res?.data?.total ?? nested.length;
            const p = res?.data?.page ?? page;
            const l = res?.data?.limit ?? limit;
            return { items: nested, total, page: p, limit: l };
        }
        if (nested && Array.isArray(nested.items)) {
            const total = res?.data?.total ?? nested.items.length;
            const l = res?.data?.limit ?? nested.limit ?? limit;
            const offset = res?.data?.offset ?? nested.offset;
            const p = typeof offset === 'number' && l ? Math.floor(offset / l) + 1 : (res?.data?.page ?? page);
            const items = nested.items.map((it: any) => ({
                id: it.id,
                photo_id: it.photo_id,
                author_id: it.author?.id ?? it.author_id ?? 0,
                body: it.body,
                parent_id: it.parent_id ?? null,
                likes_count: it.likes_count ?? 0,
                liked_by_me: (it.is_liked ?? it.liked_by_me) ?? false,
                created_at: it.created_at,
                deleted: it.is_deleted ?? it.deleted ?? false,
            }));
            return { items, total, page: p, limit: l };
        }
        if (nested && Array.isArray(nested.items)) {
            const total = res?.data?.total ?? nested.items.length;
            const l = res?.data?.limit ?? nested.limit ?? limit;
            const offset = res?.data?.offset ?? nested.offset;
            const p = typeof offset === 'number' && l ? Math.floor(offset / l) + 1 : (res?.data?.page ?? page);
            const items = nested.items.map((it: any) => ({
                id: it.id,
                photo_id: it.photo_id,
                author_id: it.author?.id ?? it.author_id ?? 0,
                body: it.body,
                parent_id: it.parent_id ?? null,
                likes_count: it.likes_count ?? 0,
                liked_by_me: (it.is_liked ?? it.liked_by_me) ?? false,
                created_at: it.created_at,
                deleted: it.is_deleted ?? it.deleted ?? false,
            }));
            return { items, total, page: p, limit: l };
        }
        if (nested && Array.isArray(nested.items)) {
            const total = res?.data?.total ?? nested.items.length;
            const l = res?.data?.limit ?? nested.limit ?? limit;
            const offset = res?.data?.offset ?? nested.offset;
            const p = typeof offset === 'number' && l ? Math.floor(offset / l) + 1 : (res?.data?.page ?? page);
            const items = nested.items.map((it: any) => ({
                id: it.id,
                photo_id: it.photo_id,
                author_id: it.author?.id ?? it.author_id ?? 0,
                body: it.body,
                parent_id: it.parent_id ?? null,
                likes_count: it.likes_count ?? 0,
                liked_by_me: (it.is_liked ?? it.liked_by_me) ?? false,
                created_at: it.created_at,
                deleted: it.is_deleted ?? it.deleted ?? false,
            }));
            return { items, total, page: p, limit: l };
        }
        if (nested && Array.isArray(nested.items)) {
            const total = res?.data?.total ?? nested.items.length;
            const l = res?.data?.limit ?? nested.limit ?? limit;
            const offset = res?.data?.offset ?? nested.offset;
            const p = typeof offset === 'number' && l ? Math.floor(offset / l) + 1 : (res?.data?.page ?? page);
            return { items: nested.items, total, page: p, limit: l };
        }
        // some APIs return { data: { items: [...] } }
        if (nested && Array.isArray(nested.items)) {
            const total = res?.data?.total ?? nested.items.length;
            const l = res?.data?.limit ?? nested.limit ?? limit;
            const offset = res?.data?.offset ?? nested.offset;
            const p = typeof offset === 'number' && l ? Math.floor(offset / l) + 1 : (res?.data?.page ?? page);
            return { items: nested.items, total, page: p, limit: l };
        }

        return { items: [], total: 0, page, limit };
    },

    async getPhoto(id: number): Promise<Photo> {
        const res = await apiClient.get<{ data: Photo }>(`/photos/${id}`);
        return res.data;
    },

    async updatePhoto(id: number, body: Partial<Photo>): Promise<Photo> {
        const res = await apiClient.patch<{ data: Photo }>(`/photos/${id}`, body);
        return res.data;
    },

    async movePhoto(id: number, albumId: number | null): Promise<Photo> {
        const res = await apiClient.patch<{ data: Photo }>(`/photos/${id}/move`, { album_id: albumId });
        return res.data;
    },

    async deletePhoto(id: number): Promise<void> {
        await apiClient.delete(`/photos/${id}`);
    },

    async likePhoto(id: number): Promise<void> {
        await apiClient.post(`/photos/${id}/like`, {});
    },

    async unlikePhoto(id: number): Promise<void> {
        await apiClient.delete(`/photos/${id}/like`);
    },

    // Albums
    async createAlbum(payload: { title: string; description?: string; visibility?: PhotoVisibility }): Promise<Album> {
        const res = await apiClient.post<{ data: Album }>(`/albums`, payload);
        return res.data;
    },

    async listMyAlbums(page = 1, limit = 24): Promise<PaginatedResponse<Album>> {
        const res = await apiClient.get<any>(`/albums?page=${page}&limit=${limit}`);
        if (Array.isArray(res)) {
            return { items: res as Album[], total: (res as Album[]).length, page, limit };
        }
        const maybeData = res?.data ?? res;
        if (Array.isArray(maybeData)) {
            return { items: maybeData as Album[], total: maybeData.length, page, limit };
        }
        const nested = res?.data?.data ?? res?.data;
        if (Array.isArray(nested)) {
            const total = res?.data?.total ?? nested.length;
            const p = res?.data?.page ?? page;
            const l = res?.data?.limit ?? limit;
            return { items: nested, total, page: p, limit: l };
        }
        if (nested && Array.isArray(nested.items)) {
            const total = res?.data?.total ?? nested.items.length;
            const l = res?.data?.limit ?? nested.limit ?? limit;
            const offset = res?.data?.offset ?? nested.offset;
            const p = typeof offset === 'number' && l ? Math.floor(offset / l) + 1 : (res?.data?.page ?? page);
            return { items: nested.items, total, page: p, limit: l };
        }
        return { items: [], total: 0, page, limit };
    },

    async getAlbum(id: number): Promise<Album> {
        const res = await apiClient.get<{ data: Album }>(`/albums/${id}`);
        return res.data;
    },

    async updateAlbum(id: number, body: Partial<Album>): Promise<Album> {
        const res = await apiClient.patch<{ data: Album }>(`/albums/${id}`, body);
        return res.data;
    },

    async deleteAlbum(id: number): Promise<void> {
        await apiClient.delete(`/albums/${id}`);
    },

    async setAlbumCover(albumId: number, photoId: number): Promise<void> {
        await apiClient.patch(`/albums/${albumId}/cover`, { photo_id: photoId });
    },

    async listAlbumPhotos(albumId: number, page = 1, limit = 24): Promise<PaginatedResponse<Photo>> {
        const res = await apiClient.get<any>(`/albums/${albumId}/photos?page=${page}&limit=${limit}`);

        if (Array.isArray(res)) return { items: res as Photo[], total: res.length, page, limit };
        const maybeData = res?.data ?? res;
        if (Array.isArray(maybeData)) return { items: maybeData as Photo[], total: maybeData.length, page, limit };
        const nested = res?.data?.data ?? res?.data;
        if (Array.isArray(nested)) {
            const total = res?.data?.total ?? nested.length;
            const p = res?.data?.page ?? page;
            const l = res?.data?.limit ?? limit;
            return { items: nested, total, page: p, limit: l };
        }
        if (nested && Array.isArray(nested.items)) {
            const total = res?.data?.total ?? nested.items.length;
            const l = res?.data?.limit ?? nested.limit ?? limit;
            const offset = res?.data?.offset ?? nested.offset;
            const p = typeof offset === 'number' && l ? Math.floor(offset / l) + 1 : (res?.data?.page ?? page);
            return { items: nested.items, total, page: p, limit: l };
        }
        return { items: [], total: 0, page, limit };
    },

    // Comments
    async listComments(photoId: number, page = 1, limit = 50): Promise<PaginatedResponse<Comment>> {
        const res = await apiClient.get<any>(`/photos/${photoId}/comments?page=${page}&limit=${limit}`);

        const mapComment = (it: any): Comment => ({
            id: it.id,
            photo_id: it.photo_id,
            author_id: it.author?.id ?? it.author_id ?? 0,
            author: it.author ?? undefined,
            body: it.body,
            parent_id: it.parent_id ?? null,
            likes_count: it.likes_count ?? 0,
            liked_by_me: it.is_liked ?? it.liked_by_me ?? false,
            created_at: it.created_at,
            deleted: it.is_deleted ?? it.deleted ?? false,
        });

        if (Array.isArray(res)) return { items: res.map(mapComment), total: res.length, page, limit };

        const candidates = [res, res?.data];
        for (const candidate of candidates) {
            if (!candidate) continue;
            if (Array.isArray(candidate)) {
                return { items: candidate.map(mapComment), total: candidate.length, page, limit };
            }
            if (Array.isArray(candidate.items)) {
                const total = candidate.total ?? candidate.items.length;
                const l = candidate.limit ?? limit;
                const offset = candidate.offset ?? 0;
                const p = l > 0 ? Math.floor(offset / l) + 1 : page;
                return { items: candidate.items.map(mapComment), total, page: p, limit: l };
            }
            if (Array.isArray(candidate.data)) {
                const total = candidate.total ?? candidate.data.length;
                const p = candidate.page ?? page;
                const l = candidate.limit ?? limit;
                return { items: candidate.data.map(mapComment), total, page: p, limit: l };
            }
        }

        return { items: [], total: 0, page, limit };
    },

    async addComment(photoId: number, body: { body: string; parent_id?: number | null }): Promise<Comment> {
        const res = await apiClient.post<{ data: Comment }>(`/photos/${photoId}/comments`, body);
        return res.data;
    },

    async listReplies(commentId: number): Promise<Comment[]> {
        const res = await apiClient.get<{ data: Comment[] }>(`/photos/comments/${commentId}/replies`);
        return res.data ?? [];
    },

    async editComment(commentId: number, body: { body: string }): Promise<Comment> {
        const res = await apiClient.patch<{ data: Comment }>(`/photos/comments/${commentId}`, body);
        return res.data;
    },

    async deleteComment(commentId: number): Promise<void> {
        await apiClient.delete(`/photos/comments/${commentId}`);
    },

    async likeComment(commentId: number): Promise<void> {
        await apiClient.post(`/photos/comments/${commentId}/like`, {});
    },

    async unlikeComment(commentId: number): Promise<void> {
        await apiClient.delete(`/photos/comments/${commentId}/like`);
    },

    // Other user's content
    async listUserPhotos(userId: number, page = 1, limit = 24): Promise<PaginatedResponse<Photo>> {
        const res = await apiClient.get<any>(`/users/${userId}/photos?page=${page}&limit=${limit}`);
        if (Array.isArray(res)) return { items: res as Photo[], total: res.length, page, limit };
        const maybeData = res?.data ?? res;
        if (Array.isArray(maybeData)) return { items: maybeData as Photo[], total: maybeData.length, page, limit };
        const nested = res?.data?.data ?? res?.data;
        if (Array.isArray(nested)) {
            const total = res?.data?.total ?? nested.length;
            const p = res?.data?.page ?? page;
            const l = res?.data?.limit ?? limit;
            return { items: nested, total, page: p, limit: l };
        }
        return { items: [], total: 0, page, limit };
    },

    async listUserAlbums(userId: number, page = 1, limit = 24): Promise<PaginatedResponse<Album>> {
        const res = await apiClient.get<any>(`/users/${userId}/albums?page=${page}&limit=${limit}`);
        if (Array.isArray(res)) return { items: res as Album[], total: res.length, page, limit };
        const maybeData = res?.data ?? res;
        if (Array.isArray(maybeData)) return { items: maybeData as Album[], total: maybeData.length, page, limit };
        const nested = res?.data?.data ?? res?.data;
        if (Array.isArray(nested)) {
            const total = res?.data?.total ?? nested.length;
            const p = res?.data?.page ?? page;
            const l = res?.data?.limit ?? limit;
            return { items: nested, total, page: p, limit: l };
        }
        return { items: [], total: 0, page, limit };
    },
};