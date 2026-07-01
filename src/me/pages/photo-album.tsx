import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlbumView, AlbumFormDialog, PhotoViewer } from "@/components/photos";
import { useAlbumPhotos } from "@/hooks/use-photos";
import { photosApi } from "@/api/photos";
import type { Album as ApiAlbum, Photo } from "@/api/photos";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";

const PhotoAlbum = () => {
    const { id } = useParams<{ id: string }>();
    const albumId = id ? Number(id) : null;
    const navigate = useNavigate();
    const toast = useToast();
    const { t } = useTranslation();

    const [album, setAlbum] = useState<ApiAlbum | null>(null);
    const [albumLoading, setAlbumLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [viewerPhoto, setViewerPhoto] = useState<Photo | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const albumPhotosQuery = useAlbumPhotos(albumId, 1, 100);

    useEffect(() => {
        if (!albumId) return;
        let active = true;
        setAlbumLoading(true);
        photosApi.getAlbum(albumId)
            .then((a) => {
                if (active) setAlbum(a);
            })
            .catch(() => {
                if (active) setAlbum(null);
            })
            .finally(() => {
                if (active) setAlbumLoading(false);
            });
        return () => { active = false; };
    }, [albumId]);

    const onFilesPicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file || !albumId) return;
        try {
            await photosApi.uploadPhoto(file, undefined, albumId);
            await albumPhotosQuery.refetch();
        } catch {
            toast.toast({ title: t('errors.error') });
        }
    };

    const handleDeleteAlbum = async () => {
        if (!albumId) return;
        if (!confirm(t('photos.album.delete.confirm'))) return;
        try {
            await photosApi.deleteAlbum(albumId);
            toast.toast({ title: t('photos.album.delete.success') });
            navigate('/me/photos');
        } catch {
            toast.toast({ title: t('errors.error'), description: t('photos.album.delete.error') });
        }
    };

    const handleSaveAlbum = async (title: string, description: string) => {
        if (!albumId) return;
        try {
            const updated = await photosApi.updateAlbum(albumId, { title, description });
            setAlbum(updated);
            toast.toast({ title: t('photos.album.updated') });
        } catch {
            toast.toast({ title: t('errors.error'), description: t('photos.album.create.error') });
        } finally {
            setEditOpen(false);
        }
    };

    if (!albumId) return null;

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 w-full">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFilesPicked} />
                <div className="panel-card p-5">
                    {albumLoading ? (
                        <div className="text-sm text-muted-foreground text-center py-20">{t('photos.album.loading')}</div>
                    ) : !album ? (
                        <div className="text-sm text-muted-foreground text-center py-20">{t('errors.error')}</div>
                    ) : (
                        <AlbumView
                            album={album}
                            photos={albumPhotosQuery.data?.items ?? []}
                            isLoading={albumPhotosQuery.isLoading}
                            onBack={() => navigate('/me/photos')}
                            onUpload={() => fileInputRef.current?.click()}
                            onEdit={() => setEditOpen(true)}
                            onDelete={handleDeleteAlbum}
                            onOpenPhoto={(p: Photo) => setViewerPhoto(p)}
                        />
                    )}
                </div>
            </div>

            <AlbumFormDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                title={t('photos.album.edit.title')}
                submitLabel={t('page.settings.save')}
                initialTitle={album?.title ?? ''}
                initialDescription={album?.description ?? ''}
                onSubmit={handleSaveAlbum}
            />

            <PhotoViewer
                open={!!viewerPhoto}
                onOpenChange={(o) => !o && setViewerPhoto(null)}
                photo={viewerPhoto}
                onPhotoUpdate={(p) => setViewerPhoto(p)}
                onToggleLike={(pid, liked) => albumPhotosQuery.toggleLike(pid, liked)}
            />
        </div>
    );
};

export default PhotoAlbum;