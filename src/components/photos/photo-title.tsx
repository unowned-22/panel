import { useRef, useState } from "react";
import type { Photo } from "@/api/photos.ts";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Archive, CheckCircle2, Download, MoreHorizontal, Move, Pin, Share2, Trash2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

interface PhotoTileProps {
    photo: Photo;
    onOpen?: () => void;
    onDelete?: () => void;
    onMove?: () => void;
    onSelectMode?: () => void;
    // multi-select
    selectionMode?: boolean;
    selected?: boolean;
    onToggleSelect?: () => void;
}

export const PhotoTile = ({ photo, onOpen, onDelete, onMove, onSelectMode, selectionMode, selected, onToggleSelect }: PhotoTileProps) => {
    const { t } = useTranslation();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const blockOpenRef = useRef(false);

    const handleWrapperClick = () => {
        if (selectionMode) {
            onToggleSelect?.();
            return;
        }
        if (blockOpenRef.current) {
            blockOpenRef.current = false;
            return;
        }
        onOpen?.();
    };

    return (
        <>
            <div
                className={cn("relative group cursor-pointer", selectionMode && "select-none")}
                onClick={handleWrapperClick}
            >
                <img
                    src={photo.preview_url ?? photo.url}
                    alt="photo"
                    className={cn(
                        "w-full aspect-square object-cover rounded-xl transition-all",
                        selectionMode && selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    )}
                    loading="lazy"
                />

                {/* Чекбокс в режиме выбора */}
                {selectionMode && (
                    <div className={cn(
                        "absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                        selected
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-background/70 border-background/70 backdrop-blur"
                    )}>
                        {selected && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                )}

                {!selectionMode && (
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
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); e.stopPropagation(); blockOpenRef.current = true; onMove?.(); }}>
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
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); e.stopPropagation(); blockOpenRef.current = true; onSelectMode?.(); }}>
                                <CheckCircle2 className="w-4 h-4 mr-2" /> {t('page.photos.chose.some')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    blockOpenRef.current = true;
                                    setConfirmOpen(true);
                                }}
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> {t('page.photos.delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="max-w-sm" hideClose>
                    <DialogHeader>
                        <DialogTitle>{t('photos.delete.confirm')}</DialogTitle>
                        <DialogDescription>{t('photos.delete.confirm')}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
                            {t('page.photos.cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setConfirmOpen(false);
                                onDelete?.();
                            }}
                        >
                            {t('page.photos.delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};