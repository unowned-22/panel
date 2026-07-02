import { apiClient, ApiError } from '@/lib/api-client';
import { useAuthStore } from '@/modules/auth/auth.store';

export type VideoVisibility = 'public' | 'unlisted' | 'private';

export interface Video {
    id: number;
    community_id: number;
    channel_id: number;
    user_id: number;
    title: string;
    description: string;
    category: string;
    tags: string[];
    visibility: VideoVisibility | string;
    status: string;
    cover_url: string;
    thumbnail_url?: string;
    hls_url?: string;
    mp4_360_url?: string;
    mp4_720_url?: string;
    duration_sec: number;
    width: number;
    height: number;
    views_count: number;
    likes_count: number;
    comments_count: number;
    is_liked: boolean;
    created_at: string;
    processing_stage?: string;
    processing_progress?: number;
    published_at?: string | null;
    publish_targets?: string[];
    boosted_until?: string | null;
}

export interface Channel {
    id: number;
    user_id: number;
    name: string;
    description: string;
    avatar_url: string;
    banner_url: string;
    subscribers_count: number;
    videos_count: number;
    is_subscribed: boolean;
    created_at: string;
}

export interface VideoListResponse {
    videos: Video[];
    total: number;
}

export interface UploadVideoMeta {
    title?: string;
    description?: string;
    category?: string;
    visibility?: VideoVisibility | string;
    tags?: string[];
}

export interface UpdateVideoPayload {
    title?: string;
    description?: string;
    category?: string;
    tags?: string[];
    visibility?: VideoVisibility | string;
    thumbnail_key?: string;
}

function unwrap<T>(res: any): T {
    return (res?.data ?? res) as T;
}

function unwrapVideoList(res: any): VideoListResponse {
    const data = res?.data ?? res;
    return {
        videos: Array.isArray(data?.videos) ? data.videos : [],
        total: typeof data?.total === 'number' ? data.total : (data?.videos?.length ?? 0),
    };
}

export const videosApi = {
    // ── Channel (backed by a type=video community) ─────────────────────────
    async getMyChannel(): Promise<Channel | null> {
        try {
            const res = await apiClient.get<any>('/channels/me');
            return unwrap<Channel>(res);
        } catch (err) {
            if (err instanceof ApiError && err.status === 404) return null;
            throw err;
        }
    },

    async createChannel(payload: { name: string; description?: string }): Promise<Channel> {
        const res = await apiClient.post<any>('/channels', payload);
        return unwrap<Channel>(res);
    },

    // ── Videos ──────────────────────────────────────────────────────────────
    async uploadVideo(file: File, meta: UploadVideoMeta, onProgress?: (percent: number) => void): Promise<Video> {
        const base = import.meta.env.VITE_API_URL ?? '';
        const url = `${base.replace(/\/$/, '')}/videos`;
        const { tokens, activeAccountId } = useAuthStore.getState();
        const token = activeAccountId ? tokens[activeAccountId]?.access_token : undefined;

        return new Promise<Video>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

            xhr.upload.onprogress = (ev) => {
                if (!ev.lengthComputable) return;
                const pct = Math.round((ev.loaded / ev.total) * 100);
                onProgress?.(pct);
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const parsed = JSON.parse(xhr.responseText);
                        resolve(unwrap<Video>(parsed));
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
            if (meta.title) fd.append('title', meta.title);
            if (meta.description) fd.append('description', meta.description);
            if (meta.category) fd.append('category', meta.category);
            if (meta.visibility) fd.append('visibility', meta.visibility);
            if (meta.tags?.length) fd.append('tags', JSON.stringify(meta.tags));
            xhr.send(fd);
        });
    },

    async listByCommunity(communityId: number, limit = 20, offset = 0): Promise<VideoListResponse> {
        const res = await apiClient.get<any>(`/communities/${communityId}/videos?limit=${limit}&offset=${offset}`);
        return unwrapVideoList(res);
    },

    async listDrafts(communityId: number, limit = 20, offset = 0): Promise<VideoListResponse> {
        const res = await apiClient.get<any>(`/communities/${communityId}/videos/drafts?limit=${limit}&offset=${offset}`);
        return unwrapVideoList(res);
    },

    async getVideo(id: number): Promise<Video> {
        const res = await apiClient.get<any>(`/videos/${id}`);
        return unwrap<Video>(res);
    },

    async updateVideo(id: number, payload: UpdateVideoPayload): Promise<Video> {
        const res = await apiClient.patch<any>(`/videos/${id}`, payload);
        return unwrap<Video>(res);
    },

    async deleteVideo(id: number): Promise<void> {
        await apiClient.delete(`/videos/${id}`);
    },

    async publishVideo(id: number, targets?: string[]): Promise<void> {
        await apiClient.post(`/videos/${id}/publish`, targets?.length ? { targets } : {});
    },

    async unpublishVideo(id: number): Promise<void> {
        await apiClient.post(`/videos/${id}/unpublish`, {});
    },

    async likeVideo(id: number): Promise<void> {
        await apiClient.post(`/videos/${id}/like`, {});
    },

    async unlikeVideo(id: number): Promise<void> {
        await apiClient.delete(`/videos/${id}/like`);
    },
};