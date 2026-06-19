import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Camera, Image as ImageIcon, PenLine, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { AvatarUploader, type AvatarUploaderResult } from "@/components/AvatarUploader";
import { CoverEditorModal, type CoverCropResult } from "@/components/cover-editor";
import { authActions } from "@/auth/auth-actions";
import { getInitials, useAccount } from "@/hooks/use-account";
import { useTranslation } from "@/hooks/use-translation";

const Home = () => {
    const { t } = useTranslation();
    const { activeAccount } = useAccount();

    const [avatar, setAvatar] = useState<string|null>(() => {
        return activeAccount.user?.avatar_url ?? null;
    });

    const [cover, setCover] = useState<string|null>(() => {
        return activeAccount.user?.cover_url ?? null;
    });
    const [coverEditorOpen, setCoverEditorOpen] = useState(false);
    const [coverMenuOpen, setCoverMenuOpen] = useState(false);
    const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
    const [avatarUploaderOpen, setAvatarUploaderOpen] = useState(false);

    const openAvatarUpload = () => {
        setAvatarMenuOpen(false);
        setAvatarUploaderOpen(true);
    };

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
                                onClick={() => {
                                    setCoverMenuOpen(false);
                                    setCoverEditorOpen(true);
                                }}
                            >
                                <ImageIcon className="h-4 w-4 text-primary" />{t('page.home.upload.image')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="relative flex min-h-22 items-center gap-4 bg-card px-5 py-4">
                    <div className="absolute -top-16 left-5">
                        <DropdownMenu open={avatarMenuOpen} onOpenChange={setAvatarMenuOpen}>
                            <DropdownMenuTrigger asChild>
                                <button className="relative block rounded-full outline-none">
                                    <div
                                        className="h-32 w-32 overflow-hidden rounded-full border-4 border-background ring-4 ring-background"
                                        style={{ background: avatar ? undefined : activeAccount.avatarColor }}
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
                                <DropdownMenuItem className="gap-3 py-3">
                                    <Camera className="h-4 w-4 text-primary" />{t('page.home.new.story')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={openAvatarUpload} className="gap-3 py-3">
                                    <ImageIcon className="h-4 w-4 text-primary" />{t(avatar ? 'page.home.open.photo' : 'page.home.upload.image')}
                                </DropdownMenuItem>
                                {avatar && (
                                    <>
                                        <DropdownMenuItem onClick={openAvatarUpload} className="gap-3 py-3">
                                            <PenLine className="h-4 w-4 text-primary" />{t('page.home.change.photo')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setAvatar(null)} className="gap-3 py-3 text-destructive">
                                            <Trash2 className="h-4 w-4" />{t('page.home.delete.photo')}
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <CoverEditorModal
                open={coverEditorOpen}
                image={activeAccount.user?.cover_url ?? cover ?? undefined}
                avatar={avatar ?? undefined}
                userName={activeAccount.name}
                onClose={() => setCoverEditorOpen(false)}
                onSave={async (result: CoverCropResult) => {
                    await authActions.uploadCover(result.originalFile);
                    // await authActions.uploadCover(result.originalFile, { mobile: result.mobile, desktop: result.desktop });
                    console.log(result.mobile, result.desktop)
                    setCover(URL.createObjectURL(result.originalFile));
                }}
            />
            <AvatarUploader
                open={avatarUploaderOpen}
                onClose={() => setAvatarUploaderOpen(false)}
                onComplete={async (result: AvatarUploaderResult) => {
                    await authActions.uploadAvatar(result.originalFile)
                    setAvatar(URL.createObjectURL(result.profileImage));
                }}
                maxFileSize={20 * 1024 * 1024}
                allowedTypes={["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"]}
            />
        </>
    );
}

export default Home
