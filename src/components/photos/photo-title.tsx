import type { Photo } from "@/api/photos.ts";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Archive, CheckCircle2, Download, MoreHorizontal, Move, Pin, Share2, Trash2} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface PhotoTileProps {
    photo: Photo;
    onOpen?: () => void;
    onDelete?: () => void;
    onMove?: () => void
}
export const PhotoTile = ({ photo, onOpen, onDelete, onMove }: PhotoTileProps) => {
    const { t } = useTranslation()

    return (
        <div className="relative group cursor-pointer" onClick={onOpen}>
            <img
                src={photo.preview_url ?? photo.url}
                alt="photo"
                className="w-full aspect-square object-cover rounded-xl"
                loading="lazy"
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/70 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>
                        <Download className="w-4 h-4 mr-2" /> {t('page.photos.download')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={(e) => { e.preventDefault(); e.stopPropagation(); onMove?.(); }}>
                        <Move className="w-4 h-4 mr-2" /> {t('page.photos.move')}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Share2 className="w-4 h-4 mr-2" /> {t('page.photos.share')}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Pin className="w-4 h-4 mr-2" /> {t('page.photos.pin')}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Archive className="w-4 h-4 mr-2" /> {t('page.photo.archive')}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <CheckCircle2 className="w-4 h-4 mr-2" /> {t('page.photos.chose.some')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (confirm(t('photos.delete.confirm'))) onDelete?.();
                        }}>
                        <Trash2 className="w-4 h-4 mr-2" /> {t('page.photos.delete')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}