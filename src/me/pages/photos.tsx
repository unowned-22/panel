import { useMemo, useRef, useState } from "react";
import {
    Image as ImageIcon,
    MoreHorizontal,
    Settings,
    ChevronRight,
    Pencil,
    Trash2,
    Download,
    Move,
    Share2,
    Pin,
    Archive,
    CheckCircle2,
    MessageSquare,
    Camera,
    Plus,
    ArrowLeft,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PhotoViewer } from "@/me/components/photo-view";
import { usePhotos, useAlbums, useAlbumPhotos } from '@/hooks/use-photos';
import { photosApi } from '@/api/photos';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';
import { usePhotoUpload } from '@/hooks/use-photo-upload';
import type { Photo, Album as ApiAlbum } from '@/api/photos';

type Tab = "photos" | "albums";

const Photos = () => {
    const [tab, setTab] = useState<Tab>("photos");
    const [openAlbumId, setOpenAlbumId] = useState<number | null>(null);

    // Modals state
    const [createOpen, setCreateOpen] = useState(false);
    const [editAlbumId, setEditAlbumId] = useState<number | null>(null);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [uploadAlbumId, setUploadAlbumId] = useState<number | null>(null);

    const [viewerPhoto, setViewerPhoto] = useState<Photo | null>(null);
    const [movePhotoId, setMovePhotoId] = useState<number | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const photosQuery = usePhotos(1, 100);
    const albumsQuery = useAlbums(1, 100);
    const albumPhotosQuery = useAlbumPhotos(openAlbumId, 1, 100);

    const allPhotos = photosQuery.data?.items ?? [];
    const openAlbumResolved = openAlbumId
        ? (albumsQuery.data?.items ?? []).find((a) => a.id === openAlbumId) ?? null
        : null;
    const editingAlbum = editAlbumId ? (albumsQuery.data?.items ?? []).find((a) => a.id === editAlbumId) ?? null : null;

    const toast = useToast();
    const { t } = useTranslation();

    const handleCreateAlbum = async (title: string, description: string) => {
        try {
            await photosApi.createAlbum({ title, description });
            toast.toast({ title: t('photos.album.create.success'), description: title });
            await albumsQuery.refetch();
        } catch (err) {
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
            await albumsQuery.refetch();
        } catch (err) {
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
            await albumsQuery.refetch();
        } catch (err) {
            toast.toast({ title: t('errors.error'), description: t('photos.album.delete.error') });
        } finally {
            if (openAlbumId === id) setOpenAlbumId(null);
            if (editAlbumId === id) setEditAlbumId(null);
        }
    };

    // ===== Upload =====
    const upload = usePhotoUpload();
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
            photosQuery.refetch(),
            albumsQuery.refetch(),
            uploadAlbumId ? albumPhotosQuery.refetch() : Promise.resolve(),
        ]);
        setUploadOpen(false);
    };

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={onFilesPicked}
                />

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
                                        onClick={() => setTab("photos")}
                                        className={cn(
                                            "button-pill flex items-center gap-2",
                                            tab === "photos" ? "bg-secondary" : "bg-transparent text-muted-foreground",
                                        )}
                                    >
                                        {t('page.photos.photos')}
                                    </button>
                                    <button
                                        onClick={() => setTab("albums")}
                                        className={cn(
                                            "button-pill",
                                            tab === "albums" ? "bg-secondary" : "bg-transparent text-muted-foreground",
                                        )}
                                    >
                                        Альбомы
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    {tab === "photos" ? (
                                        <>
                                            <button
                                                onClick={() => triggerFileSelect(null)}
                                                className="button-pill flex items-center gap-2"
                                            >
                                                <ImageIcon className="w-4 h-4 text-primary" /> Загрузить фото
                                            </button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56">
                                                    <DropdownMenuItem>
                                                        <Archive className="w-4 h-4 mr-2" /> Архив
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <MessageSquare className="w-4 h-4 mr-2" /> Комментарии к фото
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <CheckCircle2 className="w-4 h-4 mr-2" /> Выбрать несколько
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <button className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors">
                                                <Settings className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setCreateOpen(true)}
                                            className="button-pill flex items-center gap-2"
                                        >
                                            <ImageIcon className="w-4 h-4 text-primary" /> Создать альбом
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
                    title="Создать альбом"
                    submitLabel="Создать альбом"
                    onSubmit={handleCreateAlbum}
                />

                {/* Edit album */}
                <AlbumFormDialog
                    open={!!editingAlbum}
                    onOpenChange={(o) => !o && setEditAlbumId(null)}
                    title="Редактирование альбома"
                    submitLabel="Сохранить"
                    initialTitle={editingAlbum?.title ?? ''}
                    initialDescription={editingAlbum?.description ?? ''}
                    onSubmit={handleSaveAlbum}
                    onDelete={editingAlbum ? () => handleDeleteAlbum(editingAlbum.id) : undefined}
                    showCover
                />

                {/* Upload */}
                <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Загрузка фото</DialogTitle>
                        </DialogHeader>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {upload.items.length} ФОТО
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
                                <div className="col-span-4 text-center text-sm text-muted-foreground py-8">Нет выбранных фото</div>
                            )}
                        </div>
                        <DialogFooter className="justify-between! sm:justify-between! items-center">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="text-sm text-primary hover:underline"
                            >
                                Добавить фото
                            </button>
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => setUploadOpen(false)}>
                                    Отмена
                                </Button>
                                <Button onClick={confirmUpload} className="gap-2">
                                    Сохранить
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
                <MoveToAlbumDialog
                    open={movePhotoId !== null}
                    onOpenChange={(o) => { if (!o) setMovePhotoId(null); }}
                    albums={albumsQuery.data?.items ?? []}
                    currentAlbumId={allPhotos.find((p) => p.id === movePhotoId)?.album_id ?? null}
                    onConfirm={(albumId) => {
                        if (movePhotoId === null) return;
                        photosQuery.movePhoto(movePhotoId, albumId)
                            .then(() => toast.toast({ title: t('photos.move.success') }))
                            .catch(() => toast.toast({ title: t('errors.error'), description: 'Не удалось переместить фото' }));
                        setMovePhotoId(null);
                    }}
                />
            </div>
        </div>
    );
};

// ===== Subcomponents =====

const PhotosGrid = ({ photos, onOpen, onDelete, onMove }: { photos: Photo[]; onOpen: (p: Photo) => void; onDelete: (id: number) => void; onMove: (id: number) => void }) => {
    if (photos.length === 0) {
        return <EmptyState icon={<ImageIcon className="w-8 h-8" />} text="У вас ещё нет фото" />;
    }
    return (
        <>
            <div className="text-xs font-semibold text-muted-foreground mb-3">2026</div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                {photos.map((p) => (
                    <PhotoTile key={p.id} photo={p} onOpen={() => onOpen(p)} onDelete={() => onDelete(p.id)} onMove={() => onMove(p.id)} />
                ))}
            </div>
        </>
    );
};

const PhotoTile = ({ photo, onOpen, onDelete, onMove }: { photo: Photo; onOpen?: () => void; onDelete?: () => void; onMove?: () => void }) => (
    <div className="relative group cursor-pointer" onClick={onOpen}>
        <img
            src={photo.preview_url ?? photo.url}
            alt="photo"
            className="w-full aspect-square object-cover rounded-xl"
            loading="lazy"
        />
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button onClick={(e) => e.stopPropagation()} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/70 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                    <Download className="w-4 h-4 mr-2" /> Скачать
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); e.stopPropagation(); onMove?.(); }}>
                    <Move className="w-4 h-4 mr-2" /> Переместить
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Share2 className="w-4 h-4 mr-2" /> Поделиться
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Pin className="w-4 h-4 mr-2" /> Закрепить
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Archive className="w-4 h-4 mr-2" /> Архивировать
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Выбрать несколько
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e) => { e.preventDefault(); e.stopPropagation(); if (confirm('Удалить фото?')) onDelete?.(); }}>
                    <Trash2 className="w-4 h-4 mr-2" /> Удалить
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
);

const AlbumsGrid = ({
                        albums,
                        onOpen,
                        onEdit,
                        onDelete,
                    }: {
    albums: ApiAlbum[];
    onOpen: (id: number) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
}) => {
    if (albums.length === 0) {
        return (
            <EmptyState
                icon={<ImageIcon className="w-8 h-8" />}
                text="Вы ещё не создавали альбомы"
            />
        );
    }
    return (
        <div className="panel-card bg-surface-elevated/40 p-5">
            <div className="text-sm font-semibold mb-4">Мои альбомы</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {albums.map((a) => (
                    <AlbumCard
                        key={a.id}
                        album={a}
                        onOpen={() => onOpen(a.id)}
                        onEdit={() => onEdit(a.id)}
                        onDelete={() => onDelete(a.id)}
                    />
                ))}
            </div>
        </div>
    );
};

const AlbumCard = ({
                       album,
                       onOpen,
                       onEdit,
                       onDelete,
                   }: {
    album: ApiAlbum;
    onOpen: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) => {
    const cover = album.cover_url;
    return (
        <div>
            <div
                onClick={onOpen}
                className="relative aspect-square rounded-xl overflow-hidden bg-secondary cursor-pointer group"
            >
                {cover ? (
                    <img src={cover} alt={album.title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Camera className="w-10 h-10" />
                    </div>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/70 backdrop-blur flex items-center justify-center"
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={onEdit}>
                            <Pencil className="w-4 h-4 mr-2 text-primary" /> Редактировать альбом
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={onDelete}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Удалить альбом
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="mt-2">
                <div className="font-semibold text-sm truncate">{album.title}</div>
                <div className="text-xs text-muted-foreground">
                    {album.photo_count === 0 ? 'Нет фото' : `${album.photo_count} фото`}
                </div>
            </div>
        </div>
    );
};

const AlbumView = ({
                       album,
                       photos,
                       isLoading,
                       onBack,
                       onUpload,
                       onEdit,
                       onDelete,
                       onOpenPhoto,
                   }: {
    album: ApiAlbum;
    photos: Photo[];
    isLoading?: boolean;
    onBack: () => void;
    onUpload: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onOpenPhoto: (p: Photo) => void;
}) => (
    <>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <button onClick={onBack} className="hover:text-foreground flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Мои фотографии
            </button>
            <ChevronRight className="w-4 h-4" />
            <span>Альбом</span>
        </div>
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
            <div className="min-w-0">
                <h1 className="text-2xl font-bold">{album.title}</h1>
                {album.description && (
                    <p className="text-sm text-muted-foreground mt-1">{album.description}</p>
                )}
            </div>
            <div className="flex items-center gap-2">
                <button onClick={onUpload} className="button-pill flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" /> Загрузить фото
                </button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={onEdit}>
                            <Pencil className="w-4 h-4 mr-2 text-primary" /> Редактировать альбом
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <MessageSquare className="w-4 h-4 mr-2 text-primary" /> Комментарии к альбому
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={onDelete}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Удалить
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
        {isLoading ? (
            <div className="text-sm text-muted-foreground text-center py-20">Загрузка фотографий…</div>
        ) : photos.length === 0 ? (
            <EmptyState
                icon={<ImageIcon className="w-8 h-8" />}
                text="В альбоме пока нет фото"
                action={
                    <button onClick={onUpload} className="button-pill flex items-center gap-2 mt-2">
                        <Plus className="w-4 h-4 text-primary" /> Добавить фото
                    </button>
                }
            />
        ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                {photos.map((p) => (
                    <PhotoTile key={p.id} photo={p} onOpen={() => onOpenPhoto(p)} />
                ))}
            </div>
        )}
    </>
);

const EmptyState = ({
                        icon,
                        text,
                        action,
                    }: {
    icon: React.ReactNode;
    text: string;
    action?: React.ReactNode;
}) => (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            {icon}
        </div>
        <div className="text-sm">{text}</div>
        {action}
    </div>
);

const MoveToAlbumDialog = ({
                               open, onOpenChange, albums, currentAlbumId, onConfirm,
                           }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    albums: ApiAlbum[];
    currentAlbumId?: number | null;
    onConfirm: (albumId: number | null) => void;
}) => {
    const [selected, setSelected] = useState<number | null>(currentAlbumId ?? null);

    useMemo(() => { if (open) setSelected(currentAlbumId ?? null); }, [open, currentAlbumId]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Переместить в альбом</DialogTitle></DialogHeader>
                <div className="max-h-80 overflow-y-auto -mx-1 px-1 space-y-1">
                    <button
                        onClick={() => setSelected(null)}
                        className={cn(
                            "w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2",
                            selected === null ? "bg-secondary" : "hover:bg-secondary/60",
                        )}
                    >
                        <span className="text-sm">Без альбома</span>
                    </button>
                    {albums.map((a) => (
                        <button
                            key={a.id}
                            onClick={() => setSelected(a.id)}
                            className={cn(
                                "w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3",
                                selected === a.id ? "bg-secondary" : "hover:bg-secondary/60",
                            )}
                        >
                            <div className="w-9 h-9 rounded-md bg-secondary overflow-hidden shrink-0 flex items-center justify-center">
                                {a.cover_url ? <img src={a.cover_url} className="w-full h-full object-cover" /> : <Camera className="w-4 h-4 text-muted-foreground" />}
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm font-medium truncate">{a.title}</div>
                                <div className="text-xs text-muted-foreground">{a.photo_count} фото</div>
                            </div>
                        </button>
                    ))}
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Отмена</Button>
                    <Button onClick={() => { onConfirm(selected); onOpenChange(false); }}>Переместить</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const AlbumFormDialog = ({
                             open,
                             onOpenChange,
                             title,
                             submitLabel,
                             initialTitle = "",
                             initialDescription = "",
                             onSubmit,
                             onDelete,
                             showCover = false,
                         }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    submitLabel: string;
    initialTitle?: string;
    initialDescription?: string;
    onSubmit: (title: string, description: string) => void;
    onDelete?: () => void;
    showCover?: boolean;
}) => {
    const [name, setName] = useState(initialTitle);
    const [desc, setDesc] = useState(initialDescription);

    // Reset on open
    useMemo(() => {
        if (open) {
            setName(initialTitle);
            setDesc(initialDescription);
        }
    }, [open, initialTitle, initialDescription]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className={cn("grid gap-5", showCover && "grid-cols-[160px_1fr]")}>
                    {showCover && (
                        <div className="aspect-square rounded-xl bg-secondary flex items-center justify-center text-muted-foreground">
                            <Camera className="w-10 h-10" />
                        </div>
                    )}
                    <div className="flex flex-col gap-4 min-w-0">
                        <div>
                            <div className="flex justify-between mb-1.5 text-sm">
                                <label className="text-muted-foreground">
                                    Название <span className="text-destructive">*</span>
                                </label>
                                <span className="text-xs text-muted-foreground">{name.length} / 128</span>
                            </div>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value.slice(0, 128))}
                                placeholder="Название альбома"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between mb-1.5 text-sm">
                                <label className="text-muted-foreground">Описание</label>
                                <span className="text-xs text-muted-foreground">{desc.length} / 512</span>
                            </div>
                            <Textarea
                                value={desc}
                                onChange={(e) => setDesc(e.target.value.slice(0, 512))}
                                placeholder="Описание (необязательно)"
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-2">
                    <div className="text-sm font-semibold mb-2">Настройки приватности</div>
                    <button className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-secondary/60 transition-colors">
                        <div>
                            <div className="text-sm font-medium">Кто может просматривать этот альбом</div>
                            <div className="text-xs text-muted-foreground">Все пользователи</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-secondary/60 transition-colors">
                        <div>
                            <div className="text-sm font-medium">Кто может комментировать фото в альбоме</div>
                            <div className="text-xs text-muted-foreground">Все пользователи</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <p className="text-xs text-muted-foreground mt-2">
                        Изменить настройки приватности можно в любой момент
                    </p>
                </div>

                <DialogFooter className="justify-between! sm:justify-between! items-center">
                    {onDelete ? (
                        <button
                            onClick={onDelete}
                            className="text-sm text-destructive hover:underline"
                        >
                            Удалить альбом
                        </button>
                    ) : (
                        <span />
                    )}
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => onOpenChange(false)}>
                            Отмена
                        </Button>
                        <Button onClick={() => onSubmit(name, desc)} disabled={!name.trim()}>
                            {submitLabel}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default Photos;