import { Image as ImageIcon } from "lucide-react";
import type { Album as ApiAlbum } from '@/api/photos';
import { EmptyState } from "./empty-state";
import { AlbumCard } from "./album-card";
import { useTranslation } from '@/hooks/use-translation';

interface AlbumsGridProps {
    albums: ApiAlbum[];
    onOpen: (id: number) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
}

export const AlbumsGrid = ({ albums, onOpen, onEdit, onDelete }: AlbumsGridProps) => {
    const { t } = useTranslation();

    if (albums.length === 0) {
        return (
            <EmptyState
                icon={<ImageIcon className="w-8 h-8" />}
                text={t('photos.album.photos.empty')}
            />
        );
    }

    return (
        <div className="panel-card bg-surface-elevated/40 p-5">
            <div className="text-sm font-semibold mb-4">{t('page.albums.title')}</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {albums.map((a) => (
                    <AlbumCard
                        key={a.id}
                        album={a}
                        onOpen={() => onOpen(a.id)}
                        onEdit={() => onEdit(a.id)}
                        onDelete={() => onDelete(a.id)}
                    />
                ))}
            </div>
        </div>
    );
};