import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { photosApi } from '@/api/photos';
import type { Comment, PaginatedResponse } from '@/api/photos';

export function usePhotoComments(photoId: number | null, page = 1, limit = 50) {
    const qc = useQueryClient();
    const key = ['photoComments', photoId, page, limit] as const;

    const query = useQuery<PaginatedResponse<Comment>, Error>({
        queryKey: key,
        queryFn: () => (photoId ? photosApi.listComments(photoId, page, limit) : Promise.resolve({ items: [] as Comment[], total: 0, page, limit })),
        enabled: !!photoId,
    });

    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
        try {
            console.debug('usePhotoComments query key:', JSON.stringify(key));
            console.debug('usePhotoComments data snapshot:', JSON.stringify(query.data));
        } catch (e) {
            console.debug('usePhotoComments (raw):', { key, data: query.data });
        }
    }

    const addMutation = useMutation<Comment, Error, { body: string; parent_id?: number | null }, { prev?: PaginatedResponse<Comment> }>({
        mutationFn: async (payload) => {
            if (!photoId) throw new Error('photoId required');
            return photosApi.addComment(photoId, payload);
        },
        onMutate: async (vars) => {
            await qc.cancelQueries({ queryKey: key });
            const prev = qc.getQueryData<PaginatedResponse<Comment>>(key);
            const temp: Comment = { id: Date.now(), photo_id: photoId as number, author_id: -1, body: vars.body, parent_id: vars.parent_id ?? null, likes_count: 0, liked_by_me: false, created_at: new Date().toISOString() };
            qc.setQueryData<PaginatedResponse<Comment> | undefined>(key, (old) => ({ ...(old ?? { items: [], total: 0, page, limit }), items: [temp, ...(old?.items ?? [])] }));
            return { prev };
        },
        onError: (_err, _vars, ctx?: { prev?: PaginatedResponse<Comment> } | undefined) => { if (ctx?.prev) qc.setQueryData(key, ctx.prev); },
        onSettled: () => qc.invalidateQueries({ queryKey: key }),
    });

    const editMutation = useMutation<Comment, Error, { id: number; body: string }>({
        mutationFn: async ({ id, body }) => photosApi.editComment(id, { body }),
        onSettled: () => qc.invalidateQueries({ queryKey: key }),
    });

    const deleteMutation = useMutation<void, Error, number, { prev?: PaginatedResponse<Comment> }>({
        mutationFn: async (id) => photosApi.deleteComment(id),
        onMutate: async (id) => {
            await qc.cancelQueries({ queryKey: key });
            const prev = qc.getQueryData<PaginatedResponse<Comment>>(key);
            qc.setQueryData<PaginatedResponse<Comment> | undefined>(key, (old) => ({ ...(old ?? { items: [], total: 0, page, limit }), items: (old?.items ?? []).map((c) => c.id === id ? { ...c, deleted: true } : c) }));
            return { prev };
        },
        onError: (_err, _id, ctx?: { prev?: PaginatedResponse<Comment> } | undefined) => { if (ctx?.prev) qc.setQueryData(key, ctx.prev); },
        onSettled: () => qc.invalidateQueries({ queryKey: key }),
    });

    const toggleLikeMutation = useMutation<void, Error, { id: number; liked: boolean }, { prev?: PaginatedResponse<Comment> }>({
        mutationFn: async ({ id, liked }) => {
            if (liked) return photosApi.unlikeComment(id);
            return photosApi.likeComment(id);
        },
        onMutate: async ({ id, liked }) => {
            await qc.cancelQueries({ queryKey: key });
            const prev = qc.getQueryData<PaginatedResponse<Comment>>(key);
            qc.setQueryData<PaginatedResponse<Comment> | undefined>(key, (old) => ({ ...(old ?? { items: [], total: 0, page, limit }), items: (old?.items ?? []).map((c) => c.id === id ? { ...c, liked_by_me: !liked, likes_count: c.likes_count + (liked ? -1 : 1) } : c) }));
            return { prev };
        },
        onError: (_err, _vars, ctx?: { prev?: PaginatedResponse<Comment> } | undefined) => { if (ctx?.prev) qc.setQueryData(key, ctx.prev); },
        onSettled: () => qc.invalidateQueries({ queryKey: key }),
    });

    return {
        ...query,
        addComment: (body: string, parent_id?: number | null) => addMutation.mutate({ body, parent_id }),
        editComment: (id: number, body: string) => editMutation.mutate({ id, body }),
        deleteComment: (id: number) => deleteMutation.mutate(id),
        toggleCommentLike: (id: number, liked = false) => toggleLikeMutation.mutate({ id, liked }),
    };
}
