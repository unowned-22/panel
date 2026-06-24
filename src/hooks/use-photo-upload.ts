import { useCallback, useState } from 'react';
import { photosApi } from '@/api/photos';

export type UploadStatus = 'pending' | 'uploading' | 'done' | 'error';

export interface UploadItem {
    id: string;
    file: File;
    progress: number;
    status: UploadStatus;
    error?: string | null;
    result?: any;
}

export function usePhotoUpload() {
    const [items, setItems] = useState<UploadItem[]>([]);

    const addFiles = useCallback((files: File[] | FileList) => {
        const arr = Array.from(files as File[]).filter((f: File) => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024);
        const next = arr.map((file: File) => ({ id: `${Date.now()}-${file.name}`, file, progress: 0, status: 'pending' as UploadStatus }));
        setItems((s: UploadItem[]) => [...s, ...next]);
    }, []);

    const start = useCallback(async (albumId?: number | null) => {
        for (const it of items) {
            if (it.status !== 'pending') continue;
            setItems((s) => s.map((x) => (x.id === it.id ? { ...x, status: 'uploading', progress: 0 } : x)));
            try {
                const photo = await photosApi.uploadPhoto(it.file, (pct) => {
                    setItems((s: UploadItem[]) => s.map((x) => (x.id === it.id ? { ...x, progress: pct } : x)));
                }, albumId);
                setItems((s: UploadItem[]) => s.map((x) => (x.id === it.id ? { ...x, status: 'done', progress: 100, result: photo } : x)));
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : String(err);
                setItems((s: UploadItem[]) => s.map((x) => (x.id === it.id ? { ...x, status: 'error', error: message } : x)));
            }
        }
    }, [items]);

    const reset = useCallback(() => setItems([]), []);

    return { items, addFiles, start, reset };
}
