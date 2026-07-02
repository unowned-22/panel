import { useRef, useState } from "react";
import { Image as ImageIcon, MoreHorizontal, Settings, Archive, CheckCircle2, MessageSquare, X, Trash2, FolderInput } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PhotosGrid, AlbumsGrid, AlbumView, AlbumFormDialog, MoveToAlbumDialog, PhotoViewer } from "@/components/photos";
import { usePhotos, useAlbums, useAlbumPhotos } from '@/hooks/use-photos';
import { photosApi } from '@/api/photos';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';
import { usePhotoUpload } from '@/hooks/use-photo-upload';
import type { Photo, Album as ApiAlbum } from '@/api/photos';

type Tab = "photos" | "albums";

const bulkDeletePhotos = (ids: number[]) =>
    Promise.all(ids.map((id) => photosApi.deletePhoto(id)));

const bulkMovePhotos = (ids: number[], albumId: number | null) =>
    Promise.all(ids.map((id) => photosApi.movePhoto(id, albumId)));

const Photos = () => {
    const [tab, setTab] = useState<Tab>("photos");
    const [openAlbumId, setOpenAlbumId] = useState<number | null>(null);

    const [createOpen, setCreateOpen] = useState(false);
    const [editAlbumId, setEditAlbumId] = useState<number | null>(null);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [uploadAlbumId, setUploadAlbumId] = useState<number | null>(null);

    const [viewerPhoto, setViewerPhoto] = useState<Photo | null>(null);
    const [movePhotoId, setMovePhotoId] = useState<number | null>(null);

    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkMoveOpen, setBulkMoveOpen] = useState(false);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

    const enterSelectionMode = () => { setSelectionMode(true); setSelectedIds(new Set()); };
    const exitSelectionMode = () => { setSelectionMode(false); setSelectedIds(new Set()); };
    const toggleSelect = (id: number) => setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
    });
    // ─────────────────────────────────────────────────────────────────────────

    const fileInputRef = useRef<HTMLInputElement>(null);

    const photosQuery = usePhotos(1, 100);
    const albumsQuery = useAlbums(1, 100);
    const albumPhotosQuery = useAlbumPhotos(openAlbumId ?? editAlbumId, 1, 100);

    const allPhotos = photosQuery.data?.items ?? [];
    const openAlbumResolved = openAlbumId
        ? (albumsQuery.data?.items ?? []).find((a) => a.id === openAlbumId) ?? null
        : null;
    const editingAlbum = editAlbumId
        ? (albumsQuery.data?.items ?? []).find((a) => a.id === editAlbumId) ?? null
        : null;

    const editAlbumPhotos = albumPhotosQuery.data?.items ?? [];

    const upload = usePhotoUpload();
    const toast = useToast();
    const { t } = useTranslation();

    const handleCreateAlbum = async (title: string, description: string) => {
        try {
            await photosApi.createAlbum({ title, description });
            toast.toast({ title: t('photos.album.create.success'), description: title });
            await albumsQuery.invalidate();
        } catch {
            toast.toast({ title: t('errors.error'), description: t('photos.album.create.error') });
        } finally {
            setCreateOpen(false);
        }
    };

    const handleSaveAlbum = async (title: string, description: string) => {
        if (!editingAlbum) return setEditAlbumId(null);
        try {
            await photosApi.updateAlbum(editingAlbum.id, { title, description });
            toast.toast({ title: t('photos.album.updated') });
            await albumsQuery.invalidate();
        } catch {
            toast.toast({ title: t('errors.error'), description: t('photos.album.create.error') });
        } finally {
            setEditAlbumId(null);
        }
    };

    const handleDeleteAlbum = async (id: number) => {
        try {
            if (!confirm(t('photos.album.delete.confirm'))) return;
            await photosApi.deleteAlbum(id);
            toast.toast({ title: t('photos.album.delete.success') });
            await albumsQuery.invalidate();
        } catch {
            toast.toast({ title: t('errors.error'), description: t('photos.album.delete.error') });
        } finally {
            if (openAlbumId === id) setOpenAlbumId(null);
            if (editAlbumId === id) setEditAlbumId(null);
        }
    };

    const handleSetAlbumCover = async (photoId: number) => {
        if (!editAlbumId) return;
        try {
            await photosApi.setAlbumCover(editAlbumId, photoId);
            await albumsQuery.invalidate();
        } catch {
            toast.toast({ title: t('errors.error'), description: t('photos.setcover.error') });
        }
    };

    const handleUploadAlbumCover = async (file: File) => {
        if (!editAlbumId) return;
        try {
            const photo = await photosApi.uploadPhoto(file, () => {}, editAlbumId);
            await photosApi.setAlbumCover(editAlbumId, photo.id);
            await Promise.all([albumsQuery.invalidate(), albumPhotosQuery.invalidate()]);
        } catch {
            toast.toast({ title: t('errors.error'), description: t('photos.setcover.error') });
        }
    };
    // ─────────────────────────────────────────────────────────────────────────

    const triggerFileSelect = (target: number | null) => {
        setUploadAlbumId(target);
        fileInputRef.current?.click();
    };

    const onFilesPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length === 0) return;
        upload.addFiles(files);
        setUploadOpen(true);
        e.target.value = "";
    };

    const confirmUpload = async () => {
        await upload.start(uploadAlbumId);
        await Promise.all([
            photosQuery.invalidate(),
            albumsQuery.invalidate(),
            uploadAlbumId ? albumPhotosQuery.invalidate() : Promise.resolve(),
        ]);
        setUploadOpen(false);
    };

    // ── Bulk handlers ─────────────────────────────────────────────────────────
    const handleBulkDelete = async () => {
        try {
            await bulkDeletePhotos(Array.from(selectedIds));
            toast.toast({ title: t('photos.bulk.delete.success') });
            await Promise.all([photosQuery.invalidate(), albumsQuery.invalidate()]);
            exitSelectionMode();
        } catch {
            toast.toast({ title: t('errors.error'), description: t('photos.delete.error') });
        } finally {
            setBulkDeleteOpen(false);
        }
    };

    const handleBulkMove = async (albumId: number | null) => {
        try {
            await bulkMovePhotos(Array.from(selectedIds), albumId);
            toast.toast({ title: t('photos.move.success') });
            await Promise.all([photosQuery.invalidate(), albumsQuery.invalidate()]);
            exitSelectionMode();
        } catch {
            toast.toast({ title: t('errors.error'), description: t('photos.move.error') });
        }
    };
    // ─────────────────────────────────────────────────────────────────────────

    const selectedCount = selectedIds.size;

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFilesPicked} />

                <div className="panel-card p-5">
                    {openAlbumId && !openAlbumResolved ? (
                        <div className="text-sm text-muted-foreground text-center py-20">{t('photos.album.loading')}</div>
                    ) : openAlbumResolved ? (
                        <AlbumView
                            album={openAlbumResolved}
                            photos={albumPhotosQuery.data?.items ?? []}
                            isLoading={albumPhotosQuery.isLoading}
                            onBack={() => setOpenAlbumId(null)}
                            onUpload={() => triggerFileSelect(openAlbumResolved.id)}
                            onEdit={() => setEditAlbumId(openAlbumResolved.id)}
                            onDelete={() => handleDeleteAlbum(openAlbumResolved.id)}
                            onOpenPhoto={(p: Photo) => setViewerPhoto(p)}
                        />
                    ) : (
                        <>
                            <h1 className="text-xl font-bold mb-4">{t('page.photos.title')}</h1>
                            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => { exitSelectionMode(); setTab("photos"); }}
                                        className={cn("button-pill flex items-center gap-2", tab === "photos" ? "bg-secondary" : "bg-transparent text-muted-foreground")}
                                    >
                                        {t('page.photos.photos')}
                                    </button>
                                    <button
                                        onClick={() => { exitSelectionMode(); setTab("albums"); }}
                                        className={cn("button-pill", tab === "albums" ? "bg-secondary" : "bg-transparent text-muted-foreground")}
                                    >
                                        {t('page.photos.albums')}
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    {tab === "photos" ? (
                                        selectionMode ? (
                                            <>
                                                <span className="text-sm text-muted-foreground">
                                                    {selectedCount > 0
                                                        ? t('photos.selected.count').replace('{count}', String(selectedCount))
                                                        : t('photos.selected.none')}
                                                </span>
                                                <Button variant="secondary" size="sm" onClick={exitSelectionMode} className="flex items-center gap-1.5">
                                                    <X className="w-4 h-4" /> {t('page.photos.cancel')}
                                                </Button>
                                                <Button variant="secondary" size="sm" disabled={selectedCount === 0} onClick={() => setBulkMoveOpen(true)} className="flex items-center gap-1.5">
                                                    <FolderInput className="w-4 h-4" /> {t('page.photos.move')}
                                                </Button>
                                                <Button variant="destructive" size="sm" disabled={selectedCount === 0} onClick={() => setBulkDeleteOpen(true)} className="flex items-center gap-1.5">
                                                    <Trash2 className="w-4 h-4" /> {t('page.photos.delete')}
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => triggerFileSelect(null)} className="button-pill flex items-center gap-2">
                                                    <ImageIcon className="w-4 h-4 text-primary" /> {t('page.photos.upload.photo')}
                                                </button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56">
                                                        <DropdownMenuItem><Archive className="w-4 h-4 mr-2" /> {t('page.photos.archive')}</DropdownMenuItem>
                                                        <DropdownMenuItem><MessageSquare className="w-4 h-4 mr-2" /> {t('photos.comments.photo')}</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => enterSelectionMode()}>
                                                            <CheckCircle2 className="w-4 h-4 mr-2" /> {t('page.photos.chose.some')}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <button className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors">
                                                    <Settings className="w-4 h-4" />
                                                </button>
                                            </>
                                        )
                                    ) : (
                                        <button onClick={() => setCreateOpen(true)} className="button-pill flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4 text-primary" /> {t('photos.album.create')}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {tab === "photos" ? (
                                <PhotosGrid
                                    photos={allPhotos}
                                    onOpen={(p: Photo) => setViewerPhoto(p)}
                                    onDelete={(id) => photosQuery.deletePhoto(id)}
                                    onMove={(id) => setMovePhotoId(id)}
                                    onEnterSelectMode={enterSelectionMode}
                                    selectionMode={selectionMode}
                                    selectedIds={selectedIds}
                                    onToggleSelect={toggleSelect}
                                />
                            ) : (
                                <AlbumsGrid
                                    albums={(albumsQuery.data?.items ?? []) as ApiAlbum[]}
                                    onOpen={(id) => setOpenAlbumId(id)}
                                    onEdit={(id) => setEditAlbumId(id)}
                                    onDelete={(id) => handleDeleteAlbum(id)}
                                />
                            )}
                        </>
                    )}
                </div>

                {/* Create album */}
                <AlbumFormDialog
                    open={createOpen}
                    onOpenChange={setCreateOpen}
                    title={t('photos.album.create')}
                    submitLabel={t('photos.album.create')}
                    onSubmit={handleCreateAlbum}
                />

                {/* Edit album */}
                <AlbumFormDialog
                    open={!!editingAlbum}
                    onOpenChange={(o) => !o && setEditAlbumId(null)}
                    title={t('photos.album.edit.title')}
                    submitLabel={t('page.settings.save')}
                    initialTitle={editingAlbum?.title ?? ''}
                    initialDescription={editingAlbum?.description ?? ''}
                    initialCoverUrl={editingAlbum?.cover_url ?? undefined}
                    albumPhotos={editAlbumPhotos}
                    onSubmit={handleSaveAlbum}
                    onDelete={editingAlbum ? () => handleDeleteAlbum(editingAlbum.id) : undefined}
                    onSetCover={handleSetAlbumCover}
                    onUploadCover={handleUploadAlbumCover}
                    showCover
                />

                {/* Upload */}
                <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader><DialogTitle>{t('photos.upload.title')}</DialogTitle></DialogHeader>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {t('photos.photos.photo.count').replace('{count}', String(upload.items.length))}
                        </div>
                        <div className="grid grid-cols-4 gap-3 max-h-90 overflow-y-auto">
                            {upload.items.map((it) => (
                                <div key={it.id} className="relative aspect-square rounded-lg overflow-hidden bg-secondary">
                                    <img src={URL.createObjectURL(it.file)} alt={it.file.name} className="w-full h-full object-cover" />
                                    <div className="absolute left-0 right-0 bottom-0 h-1 bg-background/40">
                                        <div className="h-1 bg-primary" style={{ width: `${it.progress}%` }} />
                                    </div>
                                </div>
                            ))}
                            {upload.items.length === 0 && (
                                <div className="col-span-4 text-center text-sm text-muted-foreground py-8">{t('photos.upload.none')}</div>
                            )}
                        </div>
                        <DialogFooter className="justify-between! sm:justify-between! items-center">
                            <button onClick={() => fileInputRef.current?.click()} className="text-sm text-primary hover:underline">
                                {t('photos.upload.add')}
                            </button>
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => setUploadOpen(false)}>{t('page.photos.cancel')}</Button>
                                <Button onClick={confirmUpload} className="gap-2">
                                    {t('page.settings.save')}
                                    {upload.items.length > 0 && (
                                        <span className="w-5 h-5 rounded-full bg-background/20 text-xs flex items-center justify-center">
                                            {upload.items.length}
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <PhotoViewer
                    open={!!viewerPhoto}
                    onOpenChange={(o) => !o && setViewerPhoto(null)}
                    photo={viewerPhoto}
                    onPhotoUpdate={(p) => setViewerPhoto(p)}
                    onToggleLike={(id, liked) =>
                        openAlbumResolved ? albumPhotosQuery.toggleLike(id, liked) : photosQuery.toggleLike(id, liked)
                    }
                    albums={albumsQuery.data?.items ?? []}
                />

                {/* Move single photo */}
                <MoveToAlbumDialog
                    open={movePhotoId !== null}
                    onOpenChange={(o) => { if (!o) setMovePhotoId(null); }}
                    albums={albumsQuery.data?.items ?? []}
                    currentAlbumId={allPhotos.find((p) => p.id === movePhotoId)?.album_id ?? null}
                    onConfirm={(albumId) => {
                        if (movePhotoId === null) return;
                        photosQuery.movePhoto(movePhotoId, albumId)
                            .then(() => toast.toast({ title: t('photos.move.success') }))
                            .catch(() => toast.toast({ title: t('errors.error'), description: t('photos.move.error') }));
                        setMovePhotoId(null);
                    }}
                />

                {/* Bulk move */}
                <MoveToAlbumDialog
                    open={bulkMoveOpen}
                    onOpenChange={setBulkMoveOpen}
                    albums={albumsQuery.data?.items ?? []}
                    currentAlbumId={null}
                    onConfirm={handleBulkMove}
                />

                {/* Bulk delete confirm */}
                <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
                    <DialogContent className="max-w-sm" hideClose>
                        <DialogHeader>
                            <DialogTitle>{t('photos.delete.confirm.title')}</DialogTitle>
                            <DialogDescription>
                                {t('photos.bulk.delete.confirm').replace('{count}', String(selectedCount))}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setBulkDeleteOpen(false)}>{t('page.photos.cancel')}</Button>
                            <Button variant="destructive" onClick={handleBulkDelete}>{t('page.photos.delete')}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default Photos;