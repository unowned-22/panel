import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Info,
    Bell,
    MessageCircle,
    Gift,
    ChevronDown,
    MessageCircleQuestion,
    Ban,
    Bookmark,
    MessageCirclePlus,
    AlertCircle,
    CircleDot,
    UserPlus,
    UserCheck,
    Clock,
    UserX,
    Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Link, useParams } from "react-router-dom";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { StoriesViewer } from "@/components/stories";
import { profileApi, type ProfileRecord } from "@/api/profile";
import { friendshipApi, type FriendshipRecord } from "@/api/friendship";
import { useAuthStore } from "@/modules/auth/auth.store";
import {getInitials} from "@/hooks/use-account.ts";

type FriendStatus = "none" | "friends" | "incoming" | "outgoing";

interface AddFriendButtonProps {
    profileUserId: number;
    currentUserId: number;
}

const AddFriendButton = ({ profileUserId, currentUserId }: AddFriendButtonProps) => {
    const [status, setStatus] = useState<FriendStatus>("none");
    const [friendship, setFriendship] = useState<FriendshipRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        if (!profileUserId || profileUserId === currentUserId) return;

        const check = async () => {
            setLoading(true);
            try {
                // Check accepted friends
                const friends = await friendshipApi.listFriends(1, 100);
                const found = friends.data?.find(
                    (f) =>
                        (f.requester_id === currentUserId && f.addressee_id === profileUserId) ||
                        (f.addressee_id === currentUserId && f.requester_id === profileUserId)
                );
                if (found) {
                    setStatus("friends");
                    setFriendship(found);
                    return;
                }

                // Check incoming
                const inc = await friendshipApi.listIncoming(1, 100);
                const incFound = inc.data?.find((f) => f.requester_id === profileUserId);
                if (incFound) {
                    setStatus("incoming");
                    setFriendship(incFound);
                    return;
                }

                // Check outgoing
                const out = await friendshipApi.listOutgoing(1, 100);
                const outFound = out.data?.find((f) => f.addressee_id === profileUserId);
                if (outFound) {
                    setStatus("outgoing");
                    setFriendship(outFound);
                    return;
                }

                setStatus("none");
                setFriendship(null);
            } catch {
                setStatus("none");
            } finally {
                setLoading(false);
            }
        };

        check();
    }, [profileUserId, currentUserId]);

    const handleSend = async () => {
        setActionLoading(true);
        try {
            const f = await friendshipApi.sendRequest(profileUserId);
            setFriendship(f);
            setStatus("outgoing");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!friendship) return;
        setActionLoading(true);
        try {
            await friendshipApi.cancel(friendship.id);
            setFriendship(null);
            setStatus("none");
        } finally {
            setActionLoading(false);
        }
    };

    const handleAccept = async () => {
        if (!friendship) return;
        setActionLoading(true);
        try {
            const f = await friendshipApi.accept(friendship.id);
            setFriendship(f);
            setStatus("friends");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemove = async () => {
        if (!friendship) return;
        setActionLoading(true);
        try {
            await friendshipApi.remove(friendship.id);
            setFriendship(null);
            setStatus("none");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <button className="button-pill rounded-lg px-5 opacity-60" disabled>
                <Loader2 className="w-4 h-4 animate-spin" />
            </button>
        );
    }

    if (status === "friends") {
        return (
            <button
                onClick={handleRemove}
                disabled={actionLoading}
                className="button-pill rounded-lg px-5 bg-secondary! flex items-center gap-2"
            >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                Вы друзья
            </button>
        );
    }

    if (status === "outgoing") {
        return (
            <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="button-pill rounded-lg px-5 bg-secondary! flex items-center gap-2"
            >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                Заявка отправлена
            </button>
        );
    }

    if (status === "incoming") {
        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={handleAccept}
                    disabled={actionLoading}
                    className="button-pill rounded-lg px-5 flex items-center gap-2"
                >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                    Принять
                </button>
                <button
                    onClick={handleCancel}
                    disabled={actionLoading}
                    className="button-pill rounded-lg px-3 bg-secondary! flex items-center gap-1"
                >
                    <UserX className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={handleSend}
            disabled={actionLoading}
            className="button-pill rounded-lg px-5 flex items-center gap-2"
        >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {t('page.profile.add.friend')}
        </button>
    );
};

const ProfilePage = () => {
    const { t } = useTranslation();
    const { username } = useParams<{ username: string }>();
    const [storyOpen, setStoryOpen] = useState(false);
    const currentUser = useAuthStore((s) => s.user);
    const [profile, setProfile] = useState<ProfileRecord | null>(null);

    useEffect(() => {
        if (username === undefined) return;

        const fetchProfile = async () => {
            try {
                const data = await profileApi.get(username);
                setProfile(data);
            } catch (err) {
                console.error("err:", err);
            } finally {
                //
            }
        };

        fetchProfile();
    }, [username])

    return (
        <>
            <div className="overflow-hidden rounded-xl panel-card">
                <div className="relative h-50 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,hsl(var(--foreground)/0.05),transparent_24%),linear-gradient(135deg,hsl(var(--secondary)),hsl(var(--background)))]" />
                </div>
                <div className="relative flex min-h-22 items-center gap-4 bg-card px-5 py-4">
                    <div className="absolute -top-14 left-5">
                        <div className="relative block rounded-full outline-none">
                            <div
                                className="h-32 w-32 overflow-hidden rounded-full border-4 border-background ring-4 ring-background"
                                style={{ background: "hsl(var(--background))" }}
                            >
                                {profile?.avatar_url
                                    ? <img src={profile?.avatar_url} alt={profile?.full_name} className="h-full w-full object-cover" />
                                    : <div className="flex h-full w-full items-center justify-center text-white text-3xl font-semibold">{getInitials(profile?.full_name ?? "")}</div>
                                }
                            </div>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="absolute bottom-2 -right-3 flex h-7 w-14 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground">
                                      23 hr.
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Last seen yesterday at 1:30 pm</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                    <div className="ml-37 min-w-0 flex-1">
                        <h1 className="text-xl font-bold">{profile?.full_name ?? profile?.username}</h1>
                        <button className="mt-0.5 flex items-center gap-1 text-sm text-primary hover:underline">
                            <Info className="h-4 w-4" /> {t('page.profile.learn.more')}
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        {!(currentUser?.username === profile?.username) && currentUser && (profile?.id ?? 0) > 0
                            ? <AddFriendButton profileUserId={profile?.id ?? 0} currentUserId={currentUser.id} />
                            : <button className="button-pill rounded-lg px-5 flex items-center gap-2">
                                <UserPlus className="w-4 h-4" />
                                {t('page.profile.add.friend')}
                            </button>
                        }
                        {profile?.username && !(currentUser?.username === profile?.username) && (
                            <Link
                                to={`/me/messenger/${profile.username}`}
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary hover:bg-accent"
                                aria-label={t('sidebar.messenger')}
                            >
                                <MessageCircle className="h-5 w-5" />
                            </Link>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="button-pill gap-2 rounded-lg px-4">
                                    {t('page.account.more')}
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                align="end"
                                sideOffset={8}
                                className="w-85 rounded-2xl border-white/10 bg-zinc-900/95 p-4 text-white shadow-2xl backdrop-blur-xl"
                            >
                                <div className="grid grid-cols-3 gap-2">
                                    <button className="flex flex-col items-center justify-center rounded-xl py-4 text-blue-400 transition hover:bg-white/5">
                                        <Gift className="mb-2 h-6 w-6" />
                                        <span className="text-sm">Gift</span>
                                    </button>

                                    <button className="flex flex-col items-center justify-center rounded-xl py-4 text-blue-400 transition hover:bg-white/5">
                                        <MessageCircleQuestion className="mb-2 h-6 w-6" />
                                        <span className="text-sm">Ask</span>
                                    </button>

                                    <button className="flex flex-col items-center justify-center rounded-xl py-4 text-blue-400 transition hover:bg-white/5">
                                        <MessageCirclePlus className="mb-2 h-6 w-6" />
                                        <span className="text-sm">Add to chat</span>
                                    </button>
                                </div>

                                <DropdownMenuSeparator className="my-4 bg-white/10" />

                                <DropdownMenuItem className="h-11 rounded-lg px-3">
                                    <Bookmark className="mr-3 h-5 w-5 text-blue-400" />
                                    Add to Bookmarks
                                </DropdownMenuItem>

                                <DropdownMenuItem className="h-11 rounded-lg px-3">
                                    <Bell className="mr-3 h-5 w-5 text-blue-400" />
                                    Enable post notifications
                                </DropdownMenuItem>

                                <DropdownMenuItem className="h-11 rounded-lg px-3">
                                    <CircleDot className="mr-3 h-5 w-5 text-blue-400" />
                                    Enable story notifications
                                </DropdownMenuItem>

                                <DropdownMenuItem className="h-11 rounded-lg px-3 text-red-400">
                                    <Ban className="mr-3 h-5 w-5" />
                                    Block
                                </DropdownMenuItem>

                                <DropdownMenuItem className="h-11 rounded-lg px-3 text-red-400">
                                    <AlertCircle className="mr-3 h-5 w-5" />
                                    Report
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            <StoriesViewer open={storyOpen} onOpenChange={setStoryOpen} startUserId="1" />
        </>
    );
}

export default ProfilePage;