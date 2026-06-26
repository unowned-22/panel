import { Image as ImageIcon, MoreHorizontal, ChevronRight, Pencil, Trash2, MessageSquare, Plus, ArrowLeft } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Photo, Album as ApiAlbum } from '@/api/photos';
import { EmptyState } from "./empty-state";
import { PhotoTile } from "./photo-title";
import { useTranslation } from "@/hooks/use-translation";

interface AlbumViewProps {
    album: ApiAlbum;
    photos: Photo[];
    isLoading?: boolean;
    onBack: () => void;
    onUpload: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onOpenPhoto: (p: Photo) => void;
}

export const AlbumView = ({ album, photos, isLoading, onBack, onUpload, onEdit, onDelete, onOpenPhoto }: AlbumViewProps) => {
    const { t } = useTranslation();

    return (
        <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <button onClick={onBack} className="hover:text-foreground flex items-center gap-1">
                    <ArrowLeft className="w-4 h-4" /> {t('page.photos.title')}
                </button>
                <ChevronRight className="w-4 h-4" />
                <span>{t('page.photos.album')}</span>
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
                        <ImageIcon className="w-4 h-4 text-primary" /> {t('page.photos.upload.photo')}
                    </button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem onClick={onEdit}>
                                <Pencil className="w-4 h-4 mr-2 text-primary" /> {t('photos.album.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <MessageSquare className="w-4 h-4 mr-2 text-primary" /> {t('photos.comments.album')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={onDelete}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> {t('page.photos.delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            {isLoading ? (
                <div className="text-sm text-muted-foreground text-center py-20">{t('photos.photos.loading')}</div>
            ) : photos.length === 0 ? (
                <EmptyState
                    icon={<ImageIcon className="w-8 h-8" />}
                    text={t('photos.album.empty')}
                    action={
                        <button onClick={onUpload} className="button-pill flex items-center gap-2 mt-2">
                            <Plus className="w-4 h-4 text-primary" /> {t('photos.photos.add')}
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
}