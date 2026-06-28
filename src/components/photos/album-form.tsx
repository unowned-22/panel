import { useMemo, useRef, useState } from "react";
import { ChevronRight, Camera, Upload, Check } from "lucide-react";
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
import type { Photo } from "@/api/photos";

interface AlbumFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    submitLabel: string;
    initialTitle?: string;
    initialDescription?: string;
    initialCoverUrl?: string;
    albumPhotos?: Photo[];
    onSubmit: (title: string, description: string) => void;
    onDelete?: () => void;
    onSetCover?: (photoId: number) => Promise<void>;
    onUploadCover?: (file: File) => Promise<void>;
    showCover?: boolean;
}

export const AlbumFormDialog = ({
                                    open,
                                    onOpenChange,
                                    title,
                                    submitLabel,
                                    initialTitle = "",
                                    initialDescription = "",
                                    initialCoverUrl,
                                    albumPhotos = [],
                                    onSubmit,
                                    onDelete,
                                    onSetCover,
                                    onUploadCover,
                                    showCover = false,
                                }: AlbumFormProps) => {
    const { t } = useTranslation();

    const [name, setName] = useState(initialTitle);
    const [desc, setDesc] = useState(initialDescription);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);
    const [coverUrl, setCoverUrl] = useState<string | undefined>(initialCoverUrl);
    const [coverLoading, setCoverLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useMemo(() => {
        if (open) {
            setName(initialTitle);
            setDesc(initialDescription);
            setCoverUrl(initialCoverUrl);
            setSelectedPhotoId(null);
        }
    }, [open, initialTitle, initialDescription, initialCoverUrl]);

    const handlePickPhoto = async (photo: Photo) => {
        setSelectedPhotoId(photo.id);
        setCoverUrl(photo.preview_url ?? photo.url);
        setPickerOpen(false);
        if (!onSetCover) return;
        setCoverLoading(true);
        try {
            await onSetCover(photo.id);
        } finally {
            setCoverLoading(false);
        }
    };

    const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file || !onUploadCover) return;
        setCoverLoading(true);
        try {
            setCoverUrl(URL.createObjectURL(file));
            await onUploadCover(file);
        } finally {
            setCoverLoading(false);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                    <div className={cn("grid gap-5", showCover && "grid-cols-[160px_1fr]")}>
                        {showCover && (
                            <div className="flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPickerOpen(true)}
                                    disabled={coverLoading}
                                    className="relative aspect-square rounded-xl bg-secondary flex items-center justify-center text-muted-foreground overflow-hidden group hover:opacity-90 transition-opacity"
                                >
                                    {coverUrl ? (
                                        <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera className="w-10 h-10" />
                                    )}

                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-6 h-6 text-white" />
                                    </div>
                                    {coverLoading && (
                                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs text-primary hover:underline flex items-center justify-center gap-1"
                                >
                                    <Upload className="w-3 h-3" /> {t('photos.upload.title')}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleUploadCover}
                                />
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
                            <button onClick={onDelete} className="text-sm text-destructive hover:underline">
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

            <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{t('photos.cover.pick')}</DialogTitle>
                    </DialogHeader>

                    {albumPhotos.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
                            <Camera className="w-10 h-10" />
                            <p className="text-sm">{t('photos.album.empty')}</p>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => { setPickerOpen(false); fileInputRef.current?.click(); }}
                            >
                                <Upload className="w-4 h-4 mr-2" /> {t('photos.upload.title')}
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-4 gap-2 max-h-80 overflow-y-auto">
                                {albumPhotos.map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => handlePickPhoto(p)}
                                        className="relative aspect-square rounded-lg overflow-hidden group"
                                    >
                                        <img
                                            src={p.preview_url ?? p.url}
                                            alt=""
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                        {selectedPhotoId === p.id && (
                                            <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                                                <Check className="w-6 h-6 text-white drop-shadow" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                            <DialogFooter className="justify-between! sm:justify-between! items-center">
                                <button
                                    type="button"
                                    onClick={() => { setPickerOpen(false); fileInputRef.current?.click(); }}
                                    className="text-sm text-primary hover:underline flex items-center gap-1"
                                >
                                    <Upload className="w-3.5 h-3.5" /> {t('page.photos.upload.photo')}
                                </button>
                                <Button variant="secondary" onClick={() => setPickerOpen(false)}>
                                    {t('page.photos.cancel')}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};