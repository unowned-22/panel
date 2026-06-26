import { useMemo, useState } from "react";
import { Camera } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import type { Album as ApiAlbum } from '@/api/photos';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";

interface MoveToAlbumProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    albums: ApiAlbum[];
    currentAlbumId?: number | null;
    onConfirm: (albumId: number | null) => void;
}

export const MoveToAlbumDialog = ({ open, onOpenChange, albums, currentAlbumId, onConfirm }: MoveToAlbumProps) => {
    const { t } = useTranslation();
    const [selected, setSelected] = useState<number | null>(currentAlbumId ?? null);

    useMemo(() => { if (open) setSelected(currentAlbumId ?? null); }, [open, currentAlbumId]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Переместить в альбом</DialogTitle>
                </DialogHeader>
                <div className="max-h-80 overflow-y-auto -mx-1 px-1 space-y-1">
                    <button
                        onClick={() => setSelected(null)}
                        className={cn(
                            "w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2",
                            selected === null ? "bg-secondary" : "hover:bg-secondary/60",
                        )}
                    >
                        <span className="text-sm">{t('photos.album.no')}</span>
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
                                <div className="text-xs text-muted-foreground">
                                    {t('photos.photos.photo.count').replace('{count}', String(a.photo_count))}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>
                        {t('page.photos.cancel')}
                    </Button>
                    <Button onClick={() => { onConfirm(selected); onOpenChange(false); }}>
                        {t('page.photos.move')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};