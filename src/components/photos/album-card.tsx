import { MoreHorizontal, Pencil, Trash2, Camera } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Album as ApiAlbum } from '@/api/photos';
import { useTranslation } from '@/hooks/use-translation';

interface AlbumCardProps {
    album: ApiAlbum;
    onOpen: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export const AlbumCard = ({ album, onOpen, onEdit, onDelete }: AlbumCardProps) => {
    const { t } = useTranslation();
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
                            <Pencil className="w-4 h-4 mr-2 text-primary" /> {t('photos.album.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={onDelete}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> {t('photos.album.delete')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="mt-2">
                <div className="font-semibold text-sm truncate">{album.title}</div>
                <div className="text-xs text-muted-foreground">
                    {album.photo_count === 0
                        ? t('photos.album.empty')
                        : t('photos.photos.photo.count').replace('{count}', String(album.photo_count))}
                </div>
            </div>
        </div>
    );
};