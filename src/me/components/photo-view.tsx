import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';
import { Move, Trash2, Pin } from 'lucide-react';
import { Heart, Send, X, Camera } from 'lucide-react';
import { MentionInput, renderWithMentions, type MentionInputHandle } from './mention-input';
import { toAbsoluteUrl } from '@/lib/helpers';
import type { Photo, Album as ApiAlbum } from '@/api/photos';
import { useAuthStore } from '@/auth/auth.store';
import { usePhotoComments } from '@/hooks/use-photo-comments';
import { photosApi } from '@/api/photos';
import {
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    photo: Photo | null;
    onPhotoUpdate?: (p: Photo) => void;
    onToggleLike?: (id: number, liked: boolean) => void;
    albums?: ApiAlbum[];
};

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
    // reset on open
    useState(() => { if (open) setSelected(currentAlbumId ?? null); });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Переместить в альбом</DialogTitle></DialogHeader>
                <div className="max-h-80 overflow-y-auto -mx-1 px-1 space-y-1">
                    <button
                        onClick={() => setSelected(null)}
                        className={cn(
                            'w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2',
                            selected === null ? 'bg-secondary' : 'hover:bg-secondary/60',
                        )}
                    >
                        <span className="text-sm">Без альбома</span>
                    </button>
                    {albums.map((a) => (
                        <button
                            key={a.id}
                            onClick={() => setSelected(a.id)}
                            className={cn(
                                'w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3',
                                selected === a.id ? 'bg-secondary' : 'hover:bg-secondary/60',
                            )}
                        >
                            <div className="w-9 h-9 rounded-md bg-secondary overflow-hidden shrink-0 flex items-center justify-center">
                                {a.cover_url
                                    ? <img src={a.cover_url} className="w-full h-full object-cover" />
                                    : <Camera className="w-4 h-4 text-muted-foreground" />}
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

export const PhotoViewer = ({ open, onOpenChange, photo, onPhotoUpdate, onToggleLike, albums = [] }: Props) => {
    const [draft, setDraft] = useState('');
    const [moveOpen, setMoveOpen] = useState(false);
    const inputRef = useRef<MentionInputHandle>(null);
    const auth = useAuthStore((s) => s.user);

    const photoId = photo?.id ?? null;
    const commentsQuery = usePhotoComments(photoId);
    const { data, isLoading } = commentsQuery;
    const qc = useQueryClient();
    const toast = useToast();
    const { t } = useTranslation();

    useEffect(() => {
        if (open) setDraft('');
    }, [open]);

    if (!photo) return null;

    const comments = data?.items ?? [];

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const text = draft.trim();
        if (!text || !photoId) return;
        commentsQuery.addComment(text);
        setDraft('');
    };

    const handlePhotoLike = async () => {
        if (!photo) return;
        onToggleLike?.(photo.id, !!photo.liked_by_me);
        onPhotoUpdate?.({
            ...photo,
            liked_by_me: !photo.liked_by_me,
            likes_count: photo.likes_count + (photo.liked_by_me ? -1 : 1),
        });
    };

    const handleDelete = async () => {
        if (!photo) return;
        if (!confirm(t('photos.delete.confirm'))) return;
        try {
            await photosApi.deletePhoto(photo.id);
            toast.toast({ title: t('photos.delete.success') });
            qc.invalidateQueries({ queryKey: ['photos'] as const });
            qc.invalidateQueries({ queryKey: ['albums'] as const });
            onOpenChange(false);
        } catch (err) {
            toast.toast({ title: 'Ошибка', description: t('photos.delete.error') });
        }
    };

    const handleMove = () => {
        setMoveOpen(true);
    };

    const handleMoveConfirm = async (albumId: number | null) => {
        if (!photo) return;
        try {
            await photosApi.movePhoto(photo.id, albumId);
            toast.toast({ title: t('photos.move.success') });
            qc.invalidateQueries({ queryKey: ['photos'] as const });
            qc.invalidateQueries({ queryKey: ['albumPhotos'] as const });
            onOpenChange(false);
        } catch (err) {
            toast.toast({ title: 'Ошибка', description: t('photos.move.error') });
        }
    };

    const handleSetCover = async () => {
        if (!photo || !photo.album_id) return;
        try {
            await photosApi.setAlbumCover(photo.album_id, photo.id);
            toast.toast({ title: t('photos.setcover.success') });
            qc.invalidateQueries({ queryKey: ['albums'] as const });
            onOpenChange(false);
        } catch (err) {
            toast.toast({ title: 'Ошибка', description: t('photos.setcover.error') });
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-5xl p-0 overflow-hidden border-none bg-card">
                    <div className="grid md:grid-cols-[1fr_360px] max-h-[85vh] md:h-[85vh]">
                        {/* Image */}
                        <div className="relative bg-black flex items-center justify-center min-h-80">
                            <img src={toAbsoluteUrl(photo.preview_url ?? photo.url)} alt="Фото" className="max-h-[85vh] w-full object-contain" />
                            <button
                                onClick={() => onOpenChange(false)}
                                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 md:hidden"
                                aria-label="Закрыть"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Comments side */}
                        <div className="flex flex-col border-l border-border bg-card min-h-0">
                            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                                <div className="font-semibold text-sm">Комментарии · {comments.length}</div>
                                <div className="flex items-center gap-3">
                                    <button onClick={handlePhotoLike} className={`flex items-center gap-1 hover:text-foreground ${photo.liked_by_me ? 'text-destructive' : ''}`}>
                                        <Heart className={`w-4 h-4 ${photo.liked_by_me ? 'fill-current' : ''}`} />
                                        <span className="text-sm">{photo.likes_count}</span>
                                    </button>
                                    <button onClick={handleMove} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                        <Move className="w-4 h-4" />
                                    </button>
                                    <button onClick={handleSetCover} disabled={!photo.album_id} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                        <Pin className="w-4 h-4" />
                                    </button>
                                    <button onClick={handleDelete} className="w-8 h-8 rounded-full bg-destructive text-white flex items-center justify-center">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
                                {isLoading ? (
                                    <div className="text-sm text-muted-foreground text-center py-10">{t('photos.comments.loading')}</div>
                                ) : comments.length === 0 ? (
                                    <div className="text-sm text-muted-foreground text-center py-10">{t('photos.comments.empty')}</div>
                                ) : (
                                    comments.map((c) => (
                                        <div key={c.id} className="flex gap-2.5">
                                            <img
                                                src={toAbsoluteUrl(c.author?.avatar_url || '/avatar-1.jpg')}
                                                alt=""
                                                className="w-8 h-8 rounded-full object-cover shrink-0"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="rounded-2xl bg-secondary/70 px-3 py-2">
                                                    <div className="text-xs font-semibold">
                                                        {c.author?.full_name || c.author?.username || 'Пользователь'}
                                                    </div>
                                                    <div className="text-sm wrap-break-word">{renderWithMentions(c.body)}</div>
                                                </div>
                                                <div className="mt-1 flex items-center gap-3 px-1 text-xs text-muted-foreground">
                                                    <span>{new Date(c.created_at).toLocaleString()}</span>
                                                    <button
                                                        onClick={() => commentsQuery.toggleCommentLike(c.id, !!c.liked_by_me)}
                                                        className={`flex items-center gap-1 hover:text-foreground ${c.liked_by_me ? 'text-destructive' : ''}`}
                                                    >
                                                        <Heart className={`w-3.5 h-3.5 ${c.liked_by_me ? 'fill-current' : ''}`} />
                                                        {c.likes_count > 0 && c.likes_count}
                                                    </button>
                                                    <button className="hover:text-foreground">Ответить</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <form onSubmit={submit} className="p-3 border-t border-border flex items-center gap-2">
                                <img src={toAbsoluteUrl(auth?.avatar_url ?? '/avatar-me.jpg')} alt="" className="w-8 h-8 rounded-full object-cover" />
                                <MentionInput
                                    ref={inputRef}
                                    value={draft}
                                    onChange={setDraft}
                                    placeholder={t('photos.comment.placeholder')}
                                />
                                <button
                                    type="submit"
                                    disabled={!draft.trim()}
                                    className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40"
                                    aria-label="Отправить"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <MoveToAlbumDialog
                open={moveOpen}
                onOpenChange={setMoveOpen}
                albums={albums}
                currentAlbumId={photo?.album_id ?? null}
                onConfirm={handleMoveConfirm}
            />
        </>
    );
};