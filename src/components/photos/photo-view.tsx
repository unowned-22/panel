import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';
import { Move, Trash2, Pin } from 'lucide-react';
import { Heart, Send } from 'lucide-react';
import { MentionInput, renderWithMentions, type MentionInputHandle } from '@/components/mention-input';
import { toAbsoluteUrl } from '@/lib/helpers';
import type { Photo, Album as ApiAlbum } from '@/api/photos';
import { usePhotoComments } from '@/hooks/use-photo-comments';
import { photosApi } from '@/api/photos';
import { MoveToAlbumDialog } from "./move-to-album";
import { getInitials, useAccount } from "@/hooks/use-account.ts";

type Props = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    photo: Photo | null;
    onPhotoUpdate?: (p: Photo) => void;
    onToggleLike?: (id: number, liked: boolean) => void;
    albums?: ApiAlbum[];
};

export const PhotoViewer = ({ open, onOpenChange, photo, onPhotoUpdate, onToggleLike, albums = [] }: Props) => {
    const [draft, setDraft] = useState('');
    const [moveOpen, setMoveOpen] = useState(false);
    const inputRef = useRef<MentionInputHandle>(null);

    const photoId = photo?.id ?? null;
    const commentsQuery = usePhotoComments(photoId);
    const { data, isLoading } = commentsQuery;
    const qc = useQueryClient();
    const toast = useToast();
    const { t } = useTranslation();
    const { activeAccount } = useAccount();

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
                <DialogContent className="max-w-5xl p-0 overflow-hidden border-none bg-card" hideClose>
                    <div className="grid md:grid-cols-[1fr_360px] max-h-[85vh] md:h-[85vh]">
                        {/* Image */}
                        <div className="relative bg-black flex items-center justify-center min-h-80">
                            <img src={photo.preview_url ?? photo.url} alt="Фото" className="max-h-[85vh] w-full object-contain" />
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
                                <div
                                    className="w-8 h-8 overflow-hidden rounded-full"
                                    style={{ background: activeAccount.user?.avatar_url ? "hsl(var(--background))" : activeAccount.avatarColor }}
                                >
                                    {activeAccount.user?.avatar_url
                                        ? <img src={activeAccount.user?.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                                        : <div className="flex h-full w-full items-center justify-center text-white font-semibold">{getInitials(activeAccount.name)}</div>
                                    }
                                </div>
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