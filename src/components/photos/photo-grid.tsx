import type { Photo } from "@/api/photos";
import { Image as ImageIcon } from "lucide-react";
import { EmptyState } from "./empty-state";
import { PhotoTile } from "./photo-title.tsx";
import { useTranslation } from "@/hooks/use-translation";

interface PhotosGridProps {
    photos: Photo[];
    onOpen: (p: Photo) => void;
    onDelete: (id: number) => void;
    onMove: (id: number) => void;
    onEnterSelectMode: () => void;
    // multi-select
    selectionMode?: boolean;
    selectedIds?: Set<number>;
    onToggleSelect?: (id: number) => void;
}

export const PhotosGrid = ({
                               photos,
                               onOpen,
                               onDelete,
                               onMove,
                               onEnterSelectMode,
                               selectionMode,
                               selectedIds,
                               onToggleSelect,
                           }: PhotosGridProps) => {
    const { t } = useTranslation();

    if (photos.length === 0) {
        return <EmptyState icon={<ImageIcon className="w-8 h-8" />} text={t('page.photos.empty.photo')} />;
    }

    return (
        <>
            <div className="text-xs font-semibold text-muted-foreground mb-3">2026</div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                {photos.map((p) => (
                    <PhotoTile
                        key={p.id}
                        photo={p}
                        onOpen={() => onOpen(p)}
                        onDelete={() => onDelete(p.id)}
                        onMove={() => onMove(p.id)}
                        onSelectMode={onEnterSelectMode}
                        selectionMode={selectionMode}
                        selected={selectedIds?.has(p.id)}
                        onToggleSelect={() => onToggleSelect?.(p.id)}
                    />
                ))}
            </div>
        </>
    );
};