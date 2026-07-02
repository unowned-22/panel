import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    BarChart3,
    Camera,
    ChevronDown,
    ChevronRight, Crop,
    FileQuestion,
    Image as ImageIcon, ListFilter, Loader2, Music,
    PenLine, Play,
    Plus, RotateCcw,
    Trash2, Video, WandSparkles
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AvatarUploader, type AvatarUploaderResult } from "@/me/components/avatar-editor";
import { CoverEditorModal, type CoverCropResult } from "@/me/components/cover-editor";
import { authApi } from "@/api/auth";
import { useStories } from "@/hooks/use-stories";
import { getInitials, useAccount } from "@/hooks/use-account";
import { useTranslation } from "@/hooks/use-translation";
import { Link } from "react-router-dom";
import { type StoryState, StoriesEditor, StoriesViewer } from "@/components/stories";
import { toast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api-client";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { toAbsoluteUrl } from "@/lib/helpers";
import { Skeleton } from "@/components/ui/skeleton";
import { usePhotos, useAlbums } from "@/hooks/use-photos";
import { photosApi } from "@/api/photos";
import type { Album as ApiAlbum, Photo } from "@/api/photos";
import { AlbumFormDialog, PhotoViewer } from "@/components/photos";
import { friendshipApi, type FriendConnection } from "@/api/friendship";
import type { TranslationDictionary } from "@/i18n/types.ts";

type TabKey = "photos" | "albums" | "videos" | "clips" | "music" | "articles";

const tabs: { key: TabKey; label: keyof TranslationDictionary; icon: typeof ImageIcon }[] = [
    { key: "photos", label: "sidebar.photos", icon: ImageIcon },
    { key: "albums", label: "sidebar.albums", icon: ImageIcon },
    { key: "videos", label: "sidebar.video", icon: Video },
    { key: "clips", label: "sidebar.clips", icon: Crop },
    { key: "music", label: "sidebar.music", icon: Music },
    { key: "articles", label: "sidebar.articles", icon: ListFilter },
];

const userVideos = [
    { thumb: "/post-video-thumb.jpg", duration: "0:48", title: "В мастерской" },
    { thumb: "/post-photo-4.jpg", duration: "1:24", title: "Закат у моря" },
    { thumb: "/post-1.jpg", duration: "2:10", title: "Концерт" },
];
const userClips = ["/post-photo-2.jpg", "/post-photo-3.jpg", "/post-photo-1.jpg", "/post-photo-4.jpg"];
const userTracks = [
    { title: "Midnight Drive", artist: "Lo-Fi Bear", duration: "3:24" },
    { title: "Soft Rain", artist: "Aurora", duration: "2:58" },
    { title: "Coffee & Code", artist: "Nordic Loops", duration: "4:12" },
];
const userArticles = [
    { title: "Как я научился фотографировать на смартфон", time: "5 мин чтения", date: "20 апр" },
    { title: "Минимализм в повседневной жизни", time: "8 мин чтения", date: "12 мар" },
];
const Home = () => {
    const { t } = useTranslation();
    const { activeAccount } = useAccount();
    const { addMyStory } = useStories();
    const isMobile = useIsMobile();

    const [avatar, setAvatar] = useState<string|null>(() => {
        return activeAccount.user?.avatar_url ?? null;
    });

    const [cover, setCover] = useState<string|null>(() => {
        return activeAccount.user?.cover_url ?? null;
    });

    const [coverEditorOpen, setCoverEditorOpen] = useState(false);
    const [coverEditorFresh, setCoverEditorFresh] = useState(false);
    const [coverMenuOpen, setCoverMenuOpen] = useState(false);
    const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
    const [avatarUploaderOpen, setAvatarUploaderOpen] = useState(false);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [storyEditorOpen, setStoryEditorOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TabKey>("photos");

    const photosQuery = usePhotos(1, 6);
    const albumsQuery = useAlbums(1, 6);
    const photos = photosQuery.data?.items ?? [];
    const albums = (albumsQuery.data?.items ?? []) as ApiAlbum[];

    const photoInputRef = useRef<HTMLInputElement>(null);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [createAlbumOpen, setCreateAlbumOpen] = useState(false);
    const [viewerPhoto, setViewerPhoto] = useState<Photo | null>(null);

    const handleQuickPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        setPhotoUploading(true);
        try {
            await photosApi.uploadPhoto(file);
            await photosQuery.invalidate();
        } catch (err) {
            toast({
                title: err instanceof ApiError ? err.message : t('page.home.photos.upload.error'),
                variant: "destructive",
            });
        } finally {
            setPhotoUploading(false);
        }
    };

    const handleCreateAlbum = async (title: string, description: string) => {
        try {
            await photosApi.createAlbum({ title, description });
            await albumsQuery.invalidate();
        } catch {
            toast({ title: t('photos.album.create.error'), variant: "destructive" });
        } finally {
            setCreateAlbumOpen(false);
        }
    };

    const [friends, setFriends] = useState<FriendConnection[]>([]);
    const [friendsTotal, setFriendsTotal] = useState(0);
    const [friendsLoading, setFriendsLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setFriendsLoading(true);
        friendshipApi.listFriends(1, 5)
            .then((res) => {
                if (!active) return;
                setFriends(res.data ?? []);
                setFriendsTotal(res.total ?? 0);
            })
            .catch(() => {
                if (!active) return;
                setFriends([]);
                setFriendsTotal(0);
            })
            .finally(() => {
                if (active) setFriendsLoading(false);
            });
        return () => { active = false; };
    }, []);

    const openAvatarUpload = () => {
        setAvatarMenuOpen(false);
        setAvatarUploaderOpen(true);
    };

    const openCoverEditor = (fresh = false) => {
        setCoverEditorFresh(fresh);
        setCoverMenuOpen(false);
        setCoverEditorOpen(true);
    };

    const removeCover = (): void => {
        setCoverMenuOpen(false);
        setCover(null);
        authApi.deleteCover()
    }
    const removeAvatar = (): void => {
        setAvatar(null)
        authApi.deleteAvatar()
    }

    return (
        <>
            <div className="overflow-hidden rounded-xl panel-card">
                <div className="relative h-50 overflow-hidden">
                    {cover ? (
                        <img
                            src={cover}
                            alt="Cover"
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,hsl(var(--foreground)/0.05),transparent_24%),linear-gradient(135deg,hsl(var(--secondary)),hsl(var(--background)))]" />
                    )}

                    <DropdownMenu open={coverMenuOpen} onOpenChange={setCoverMenuOpen}>
                        <DropdownMenuTrigger asChild>
                            <button className="button-pill absolute right-5 top-5 gap-2 bg-background/80 px-4 py-2 text-sm backdrop-blur hover:bg-background/90">
                                <PenLine className="h-4 w-4" />{t('page.home.change.cover')}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-xl border-border bg-popover p-2 shadow-elevated">
                            <DropdownMenuItem
                                className="gap-3 py-3"
                                onClick={() => openCoverEditor(false)}
                            >
                                <ImageIcon className="h-4 w-4 text-primary" />
                                {t(cover ? 'page.home.change.cover' : 'page.home.upload.image')}
                            </DropdownMenuItem>

                            {cover && (
                                <>
                                    <DropdownMenuItem
                                        className="gap-3 py-3"
                                        onClick={() => openCoverEditor(true)}
                                    >
                                        <Plus className="h-4 w-4 text-primary" />
                                        {t('page.home.upload.image')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-3 py-3 text-destructive" onClick={removeCover}>
                                        <Trash2 className="h-4 w-4" />
                                        {t('page.home.delete.photo')}
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="relative flex min-h-22 items-center gap-4 bg-card px-5 py-4">
                    <div className="absolute -top-14 left-5">
                        <DropdownMenu open={avatarMenuOpen} onOpenChange={setAvatarMenuOpen}>
                            <DropdownMenuTrigger asChild>
                                <button className="relative block rounded-full outline-none">
                                    <div
                                        className="h-32 w-32 overflow-hidden rounded-full border-4 border-background ring-4 ring-background"
                                        style={{ background: avatar ? "hsl(var(--background))" : activeAccount.avatarColor }}
                                    >
                                        {avatar
                                            ? <img src={avatar} alt={activeAccount.name} className="h-full w-full object-cover" />
                                            : <div className="flex h-full w-full items-center justify-center text-white text-3xl font-semibold">{getInitials(activeAccount.name)}</div>
                                        }
                                    </div>
                                    <span className="absolute bottom-2 right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground">
                                      <Plus className="h-4 w-4" strokeWidth={3} />
                                    </span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" sideOffset={10} className="w-52 rounded-xl border-border bg-popover p-2 shadow-elevated">
                                <DropdownMenuItem
                                    className="gap-3 py-3"
                                    onClick={() => {
                                        setAvatarMenuOpen(false);
                                        setStoryEditorOpen(true);
                                    }}
                                >
                                    <Camera className="h-4 w-4 text-primary" />{t('page.home.new.story')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setViewerOpen(true)} className="gap-3 py-3">
                                    <ImageIcon className="h-4 w-4 text-primary" />{t('page.home.view.story')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={openAvatarUpload} className="gap-3 py-3">
                                    <ImageIcon className="h-4 w-4 text-primary" />{t(avatar ? 'page.home.open.photo' : 'page.home.upload.image')}
                                </DropdownMenuItem>
                                {avatar && (
                                    <>
                                        <DropdownMenuItem onClick={openAvatarUpload} className="gap-3 py-3">
                                            <PenLine className="h-4 w-4 text-primary" />{t('page.home.change.photo')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={removeAvatar} className="gap-3 py-3 text-destructive">
                                            <Trash2 className="h-4 w-4" />{t('page.home.delete.photo')}
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="ml-37 min-w-0 flex-1">
                        <h1 className="text-xl font-bold">{activeAccount.name}</h1>
                        <button className="mt-0.5 flex items-center gap-1 text-sm text-primary hover:underline">
                            {t('page.home.about.text')} <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="button-pill rounded-lg px-5">{t('page.home.edit.profile')}</button>
                        <Link to="/me/analytics" className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary hover:bg-accent" aria-label={t('page.home.analytics')}>
                            <BarChart3 className="h-5 w-5" />
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="button-pill gap-2 rounded-lg px-4">
                                    {t('page.home.more')} <ChevronDown className="h-4 w-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 rounded-xl border-border bg-popover p-2 shadow-elevated">
                                <DropdownMenuItem className="gap-3 py-3">
                                    <FileQuestion className="h-4 w-4 text-primary" /> {t('page.home.my.questions')}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-3 py-3">
                                    <RotateCcw className="h-4 w-4 text-primary" /> {t('page.home.memories')}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-3 py-3">
                                    <WandSparkles className="h-4 w-4 text-primary" /> {t('page.home.my.wishlist')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="flex-1 min-w-0 flex flex-col gap-3">
                    <div className="panel-card overflow-hidden rounded-xl p-3">
                        <div className="mb-3 flex gap-1 overflow-x-auto scrollbar-none">
                            {tabs.map(({ key, label, icon: Icon }) => {
                                const active = activeTab === key;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setActiveTab(key)}
                                        className={cn(
                                            "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                                            active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60",
                                        )}
                                    >
                                        <Icon className="h-4 w-4" /> {t(label)}
                                    </button>
                                );
                            })}
                        </div>

                        {activeTab === "photos" && (
                            <>
                                {photosQuery.isLoading ? (
                                    <div className="grid grid-cols-3 gap-1 overflow-hidden rounded-lg">
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <Skeleton key={i} className="aspect-square w-full rounded-none" />
                                        ))}
                                    </div>
                                ) : photos.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center gap-6 py-10">
                                        <div className="text-sm text-muted-foreground">{t('page.home.photos.empty')}</div>
                                        <button
                                            onClick={() => photoInputRef.current?.click()}
                                            disabled={photoUploading}
                                            className="button-pill gap-2"
                                        >
                                            {photoUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                                            {t('page.photos.upload.photo')}
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-3 gap-1 overflow-hidden rounded-lg">
                                            {photos.map((p) => (
                                                <button key={p.id} onClick={() => setViewerPhoto(p)} className="block aspect-square w-full overflow-hidden border-0 bg-transparent p-0">
                                                    <img src={p.preview_url ?? p.url} alt="Фото" className="h-full w-full object-cover" loading="lazy" />
                                                </button>
                                            ))}
                                        </div>
                                        <div className="mt-3 grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => photoInputRef.current?.click()}
                                                disabled={photoUploading}
                                                className="button-pill bg-secondary/70! gap-2"
                                            >
                                                {photoUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                                                {t('page.photos.upload.photo')}
                                            </button>
                                            <Link to="/me/photos" className="button-pill bg-secondary/70!">{t('page.home.photos.showAll')}</Link>
                                        </div>
                                    </>
                                )}
                                <input
                                    ref={photoInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleQuickPhotoUpload}
                                />
                            </>
                        )}

                        {activeTab === "albums" && (
                            albumsQuery.isLoading ? (
                                <div className="grid grid-cols-3 gap-2">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i}>
                                            <Skeleton className="aspect-square w-full rounded-lg" />
                                            <Skeleton className="mt-2 h-3 w-3/4" />
                                        </div>
                                    ))}
                                </div>
                            ) : albums.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-6 py-10">
                                    <div className="text-sm text-muted-foreground">{t('page.home.albums.empty')}</div>
                                    <button onClick={() => setCreateAlbumOpen(true)} className="button-pill">
                                        {t('photos.album.create')}
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    {albums.map((a) => (
                                        <Link key={a.id} to={`/me/photos/album/${a.id}`} className="overflow-hidden rounded-lg">
                                            <div className="aspect-square overflow-hidden rounded-lg bg-secondary">
                                                {a.cover_url ? (
                                                    <img src={a.cover_url} alt={a.title} className="h-full w-full object-cover" loading="lazy" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                                        <ImageIcon className="h-8 w-8" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-2 px-1">
                                                <div className="truncate text-sm font-semibold">{a.title}</div>
                                                <div className="text-xs text-muted-foreground">{t('photos.photos.photo.count').replace('{count}', String(a.photo_count))}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )
                        )}

                        {activeTab === "videos" && (
                            <div className="grid grid-cols-3 gap-2">
                                {userVideos.map((v) => (
                                    <div key={v.title} className="group cursor-pointer">
                                        <div className="relative aspect-video overflow-hidden rounded-lg bg-secondary">
                                            <img src={v.thumb} alt={v.title} className="h-full w-full object-cover" loading="lazy" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                                                <Play className="h-8 w-8 fill-white text-white" />
                                            </div>
                                            <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            {v.duration}
                          </span>
                                        </div>
                                        <div className="mt-2 truncate px-1 text-sm font-semibold">{v.title}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === "clips" && (
                            <div className="grid grid-cols-4 gap-2">
                                {userClips.map((src, i) => (
                                    <div key={i} className="relative aspect-9/16 overflow-hidden rounded-lg bg-secondary">
                                        <img src={src} alt={`Клип ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
                                        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-2">
                                            <Play className="h-4 w-4 fill-white text-white" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === "music" && (
                            <div className="flex flex-col">
                                {userTracks.map((t, i) => (
                                    <div key={i} className="flex items-center gap-3 rounded-lg p-2 hover:bg-secondary/60">
                                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded">
                                            <img src={toAbsoluteUrl("/post-music-cover.jpg")} alt={t.title} className="h-full w-full object-cover" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
                                                <Play className="h-4 w-4 fill-white text-white" />
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-sm font-semibold">{t.title}</div>
                                            <div className="truncate text-xs text-muted-foreground">{t.artist}</div>
                                        </div>
                                        <div className="text-xs text-muted-foreground">{t.duration}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === "articles" && (
                            <div className="flex flex-col gap-2">
                                {userArticles.map((a, i) => (
                                    <div key={i} className="rounded-lg border border-border p-3 hover:bg-secondary/40">
                                        <div className="font-semibold">{a.title}</div>
                                        <div className="mt-1 text-xs text-muted-foreground">{a.date} · {a.time}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <aside className="hidden xl:flex flex-col w-70 shrink-0 gap-3 sticky top-18 self-start max-h-[calc(100vh-72px)]">
                    <div className="panel-card p-5">
                        <div className={cn("font-semibold flex items-center justify-between", !friendsLoading && friends.length === 0 ? "mb-9" : "mb-4")}>
                            {friendsTotal > 0
                                ? <Link to="/me/friends">{t('sidebar.friends')}</Link>
                                : t('sidebar.friends')
                            }
                            {friendsTotal > 0 && <span className="text-sm font-normal text-muted-foreground">{friendsTotal}</span>}
                        </div>

                        {friendsLoading ? (
                            <div className="flex flex-col gap-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                                        <Skeleton className="h-3 flex-1" />
                                    </div>
                                ))}
                            </div>
                        ) : friends.length === 0 ? (
                            <>
                                <div className="text-center text-sm text-muted-foreground">
                                    {t('page.home.friends.empty')}
                                </div>
                                <Link to="/me/friends" className="button-pill mt-8 w-full gap-2">
                                    <Plus className="h-4 w-4" />{t('page.home.friends.add')}
                                </Link>
                            </>
                        ) : (
                            <div className="flex flex-col gap-1">
                                {friends.map((f) => (
                                    <Link
                                        key={f.friendship_id}
                                        to={`/profile/${f.user.username}`}
                                        className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-secondary/60"
                                    >
                                        {f.user.avatar_url ? (
                                            <img
                                                src={toAbsoluteUrl(f.user.avatar_url)}
                                                alt={f.user.full_name}
                                                className="h-10 w-10 shrink-0 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
                                                {f.user.full_name?.charAt(0)?.toUpperCase() ?? "?"}
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1 truncate text-sm font-medium">{f.user.full_name}</div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            <StoriesViewer
                open={viewerOpen}
                onOpenChange={setViewerOpen}
                startUserId={activeAccount.user === undefined ? null : `${activeAccount.user.id}`}
            />
            {storyEditorOpen && (
                <StoriesEditor
                    onClose={() => setStoryEditorOpen(false)}
                    onPublish={async (state: StoryState) => {
                        try {
                            await addMyStory(state as any);
                            setStoryEditorOpen(false);
                            toast({ title: t('page.home.story.published') });
                        } catch (err) {
                            toast({
                                title: err instanceof ApiError ? err.message : t('page.home.story.publish.error'),
                                variant: "destructive"
                            });
                        }
                    }}
                />
            )}

            <CoverEditorModal
                open={coverEditorOpen}
                image={coverEditorFresh ? undefined : (activeAccount.user?.cover_url ?? cover ?? undefined)}
                avatar={avatar ?? undefined}
                userName={activeAccount.name}
                onClose={() => setCoverEditorOpen(false)}
                onSave={async (result: CoverCropResult) => {
                    const res = await authApi.uploadCover(result.originalFile, {
                        mobile: result.mobile,
                        desktop: result.desktop,
                    });

                    setCover(isMobile ? res.cover_mobile_url : res.cover_desktop_url);
                }}
            />
            <AvatarUploader
                open={avatarUploaderOpen}
                onClose={() => setAvatarUploaderOpen(false)}
                onComplete={async (result: AvatarUploaderResult) => {
                    await authApi.uploadAvatar(result.originalFile)
                    setAvatar(URL.createObjectURL(result.profileImage));
                }}
                maxFileSize={20 * 1024 * 1024}
                allowedTypes={["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"]}
            />

            <AlbumFormDialog
                open={createAlbumOpen}
                onOpenChange={setCreateAlbumOpen}
                title={t('photos.album.create')}
                submitLabel={t('photos.album.create')}
                onSubmit={handleCreateAlbum}
            />

            <PhotoViewer
                open={!!viewerPhoto}
                onOpenChange={(o) => !o && setViewerPhoto(null)}
                photo={viewerPhoto}
                onPhotoUpdate={(p) => setViewerPhoto(p)}
                onToggleLike={(id, liked) => photosQuery.toggleLike(id, liked)}
                albums={albums}
            />
        </>
    );
}

export default Home