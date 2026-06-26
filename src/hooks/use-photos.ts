import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult, MutationFunction } from '@tanstack/react-query';
import { photosApi } from '@/api/photos';
import type { Photo, Album, PaginatedResponse } from '@/api/photos';

export function usePhotos(page = 1, limit = 24): UseQueryResult<PaginatedResponse<Photo>, Error> & {
    toggleLike: (id: number, liked?: boolean) => void;
    deletePhoto: (id: number) => Promise<void>;
    movePhoto: (id: number, albumId: number | null) => Promise<void>;
} {
    const qc = useQueryClient();
    const key = ['photos', page, limit] as const;

    const query = useQuery<PaginatedResponse<Photo>, Error>({
        queryKey: key,
        queryFn: () => photosApi.listMyPhotos(page, limit),
    });

    const likeMutation = useMutation<void, Error, { id: number; liked: boolean }, { prev?: PaginatedResponse<Photo> }>({
        mutationFn: async ({ id, liked }) => {
            if (liked) return photosApi.unlikePhoto(id);
            return photosApi.likePhoto(id);
        },
        onMutate: async ({ id, liked }) => {
            await qc.cancelQueries({ queryKey: key });
            const prev = qc.getQueryData<PaginatedResponse<Photo>>(key);
            qc.setQueryData<PaginatedResponse<Photo> | undefined>(key, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    items: old.items.map((p) => (p.id === id ? { ...p, liked_by_me: !liked, likes_count: p.likes_count + (liked ? -1 : 1) } : p)),
                } as PaginatedResponse<Photo>;
            });
            return { prev };
        },
            onError: (_err, _vars, ctx?: { prev?: PaginatedResponse<Photo> } | undefined) => {
            if (ctx?.prev) qc.setQueryData(key, ctx.prev as any);
        },
        onSettled: () => qc.invalidateQueries({ queryKey: key }),
    });

    const deleteMutation = useMutation<void, Error, number>({
        mutationFn: async (id: number) => photosApi.deletePhoto(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['photos'] }),
    });

    const moveFn: MutationFunction<Photo, { id: number; albumId: number | null }> = async (vars) => photosApi.movePhoto(vars.id, vars.albumId);

    const moveMutation = useMutation<Photo, Error, { id: number; albumId: number | null }, { prev?: PaginatedResponse<Photo> }>({
        mutationFn: moveFn,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['photos'] });
            qc.invalidateQueries({ queryKey: ['albumPhotos'] });
        },
    });

    return {
        ...query,
        toggleLike: (id: number, liked = false) => likeMutation.mutate({ id, liked }),
        deletePhoto: (id: number) => deleteMutation.mutateAsync(id),
        movePhoto: (id: number, albumId: number | null) => moveMutation.mutateAsync({ id, albumId }),
    } as unknown as UseQueryResult<PaginatedResponse<Photo>, Error> & {
        toggleLike: (id: number, liked?: boolean) => void;
        deletePhoto: (id: number) => Promise<void>;
        movePhoto: (id: number, albumId: number | null) => Promise<void>;
    };
}

export function useAlbums(page = 1, limit = 24): UseQueryResult<PaginatedResponse<Album>, Error> {
    const key = ['albums', page, limit] as const;
    return useQuery<PaginatedResponse<Album>, Error>({ queryKey: key, queryFn: () => photosApi.listMyAlbums(page, limit) });
}

export function useAlbumPhotos(albumId: number | null, page = 1, limit = 24) {
    const qc = useQueryClient();
    const key = ['albumPhotos', albumId, page, limit] as const;
    const query = useQuery<PaginatedResponse<Photo>, Error>({ queryKey: key, queryFn: () => (albumId ? photosApi.listAlbumPhotos(albumId, page, limit) : Promise.resolve({ items: [], total: 0, page, limit })), enabled: !!albumId });

    const likeMutation = useMutation<void, Error, { id: number; liked: boolean }>({
        mutationFn: async ({ id, liked }) => {
            if (liked) return photosApi.unlikePhoto(id);
            return photosApi.likePhoto(id);
        },
        onMutate: async ({ id, liked }) => {
            await qc.cancelQueries({ queryKey: key });
            const prev = qc.getQueryData<PaginatedResponse<Photo>>(key);
            qc.setQueryData<PaginatedResponse<Photo> | undefined>(key, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    items: old.items.map((p) => (p.id === id ? { ...p, liked_by_me: !liked, likes_count: p.likes_count + (liked ? -1 : 1) } : p)),
                } as PaginatedResponse<Photo>;
            });
            return { prev };
        },
            onError: (_err, _vars, ctx) => {
                const c = ctx as any;
                if (c?.prev) qc.setQueryData(key, c.prev);
        },
        onSettled: () => qc.invalidateQueries({ queryKey: key }),
    });

    return { ...query, toggleLike: (id: number, liked = false) => likeMutation.mutate({ id, liked }) } as const;
}
