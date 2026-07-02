import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { videosApi } from '@/api/videos';
import type { Channel, UpdateVideoPayload, Video } from '@/api/videos';

export function useMyChannel(): UseQueryResult<Channel | null, Error> & {
    createChannel: (payload: { name: string; description?: string }) => Promise<Channel>;
    creating: boolean;
} {
    const qc = useQueryClient();
    const query = useQuery<Channel | null, Error>({
        queryKey: ['videoChannel', 'me'],
        queryFn: () => videosApi.getMyChannel(),
    });

    const createMutation = useMutation<Channel, Error, { name: string; description?: string }>({
        mutationFn: (payload) => videosApi.createChannel(payload),
        onSuccess: (channel) => {
            qc.setQueryData(['videoChannel', 'me'], channel);
        },
    });

    return {
        ...query,
        createChannel: (payload) => createMutation.mutateAsync(payload),
        creating: createMutation.isPending,
    } as UseQueryResult<Channel | null, Error> & {
        createChannel: (payload: { name: string; description?: string }) => Promise<Channel>;
        creating: boolean;
    };
}

// Combines published/processing videos + drafts for a channel (community) into one list.
export function useChannelVideos(communityId: number | null | undefined, limit = 50) {
    const qc = useQueryClient();
    const key = ['channelVideos', communityId, limit] as const;

    const query = useQuery<Video[], Error>({
        queryKey: key,
        enabled: !!communityId,
        queryFn: async () => {
            if (!communityId) return [];
            const [published, drafts] = await Promise.all([
                videosApi.listByCommunity(communityId, limit, 0),
                videosApi.listDrafts(communityId, limit, 0),
            ]);
            const byId = new Map<number, Video>();
            for (const v of [...drafts.videos, ...published.videos]) byId.set(v.id, v);
            return Array.from(byId.values()).sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
        },
    });

    const invalidate = useCallback(() => qc.invalidateQueries({ queryKey: ['channelVideos', communityId] }), [qc, communityId]);

    const updateMutation = useMutation<Video, Error, { id: number; payload: UpdateVideoPayload }>({
        mutationFn: ({ id, payload }) => videosApi.updateVideo(id, payload),
        onSuccess: invalidate,
    });

    const deleteMutation = useMutation<void, Error, number>({
        mutationFn: (id) => videosApi.deleteVideo(id),
        onSuccess: invalidate,
    });

    const publishMutation = useMutation<void, Error, { id: number; targets?: string[] }>({
        mutationFn: ({ id, targets }) => videosApi.publishVideo(id, targets),
        onSuccess: invalidate,
    });

    const unpublishMutation = useMutation<void, Error, number>({
        mutationFn: (id) => videosApi.unpublishVideo(id),
        onSuccess: invalidate,
    });

    return {
        ...query,
        refresh: invalidate,
        updateVideo: (id: number, payload: UpdateVideoPayload) => updateMutation.mutateAsync({ id, payload }),
        deleteVideo: (id: number) => deleteMutation.mutateAsync(id),
        publishVideo: (id: number, targets?: string[]) => publishMutation.mutateAsync({ id, targets }),
        unpublishVideo: (id: number) => unpublishMutation.mutateAsync(id),
    };
}

export type UploadItemStatus = 'uploading' | 'processing' | 'done' | 'error';

export interface UploadItem {
    localId: string;
    file: File;
    progress: number;
    status: UploadItemStatus;
    video?: Video;
    error?: string;
}

// Handles the multipart upload with progress tracking, independent of react-query
// caching (video processing happens async server-side so we just fire the upload
// and let the caller invalidate/refresh the channel video list once it settles).
export function useVideoUpload(communityId: number | null | undefined, onUploaded?: () => void) {
    const [uploads, setUploads] = useState<UploadItem[]>([]);

    const upload = useCallback(
        (files: FileList | File[]) => {
            const list = Array.from(files).filter((f) => f.type.startsWith('video/'));
            if (!list.length || !communityId) return;

            const items: UploadItem[] = list.map((file) => ({
                localId: crypto.randomUUID(),
                file,
                progress: 0,
                status: 'uploading',
            }));
            setUploads((prev) => [...items, ...prev]);

            items.forEach((item) => {
                videosApi
                    .uploadVideo(
                        item.file,
                        { title: item.file.name.replace(/\.[^/.]+$/, ''), visibility: 'public' },
                        (pct) => {
                            setUploads((prev) => prev.map((u) => (u.localId === item.localId ? { ...u, progress: pct } : u)));
                        }
                    )
                    .then((video) => {
                        setUploads((prev) =>
                            prev.map((u) => (u.localId === item.localId ? { ...u, status: 'done', progress: 100, video } : u))
                        );
                        onUploaded?.();
                    })
                    .catch((err: unknown) => {
                        const message = err instanceof Error ? err.message : 'Ошибка загрузки';
                        setUploads((prev) =>
                            prev.map((u) => (u.localId === item.localId ? { ...u, status: 'error', error: message } : u))
                        );
                    });
            });
        },
        [communityId, onUploaded]
    );

    const dismiss = useCallback((localId: string) => {
        setUploads((prev) => prev.filter((u) => u.localId !== localId));
    }, []);

    return { uploads, upload, dismiss };
}