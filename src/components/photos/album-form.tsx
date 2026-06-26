import { useMemo, useState } from "react";
import { ChevronRight, Camera } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

interface AlbumFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    submitLabel: string;
    initialTitle?: string;
    initialDescription?: string;
    onSubmit: (title: string, description: string) => void;
    onDelete?: () => void;
    showCover?: boolean;
}

export const AlbumFormDialog = ({ open, onOpenChange, title, submitLabel, initialTitle = "", initialDescription = "", onSubmit, onDelete, showCover = false }: AlbumFormProps) => {
    const { t } = useTranslation();

    const [name, setName] = useState(initialTitle);
    const [desc, setDesc] = useState(initialDescription);

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
                                    {t('photos.album.title')} <span className="text-destructive">*</span>
                                </label>
                                <span className="text-xs text-muted-foreground">{name.length} / 128</span>
                            </div>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value.slice(0, 128))}
                                placeholder={t('photos.album.title.placeholder')}
                            />
                        </div>
                        <div>
                            <div className="flex justify-between mb-1.5 text-sm">
                                <label className="text-muted-foreground">{t('photos.album.description')}</label>
                                <span className="text-xs text-muted-foreground">{desc.length} / 512</span>
                            </div>
                            <Textarea
                                value={desc}
                                onChange={(e) => setDesc(e.target.value.slice(0, 512))}
                                placeholder={t('photos.album.description.placeholder')}
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-2">
                    <div className="text-sm font-semibold mb-2">{t('photos.album.privacy.title')}</div>
                    <button className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-secondary/60 transition-colors">
                        <div>
                            <div className="text-sm font-medium">{t('photos.album.privacy.viewers')}</div>
                            <div className="text-xs text-muted-foreground">{t('photos.page.all.users')}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-secondary/60 transition-colors">
                        <div>
                            <div className="text-sm font-medium">{t('photos.album.privacy.commenters')}</div>
                            <div className="text-xs text-muted-foreground">{t('photos.page.all.users')}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <p className="text-xs text-muted-foreground mt-2">
                        {t('photos.album.privacy.change')}
                    </p>
                </div>

                <DialogFooter className="justify-between! sm:justify-between! items-center">
                    {onDelete ? (
                        <button
                            onClick={onDelete}
                            className="text-sm text-destructive hover:underline"
                        >
                            {t('photos.album.delete')}
                        </button>
                    ) : (
                        <span />
                    )}
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => onOpenChange(false)}>
                            {t('page.photos.cancel')}
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
