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
    CircleDot
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Link } from "react-router-dom";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { StoryViewer } from "@/me/components/stories/StoryViewer.tsx";

const ProfilePage = () => {
    const { t } = useTranslation();
    const [storyOpen, setStoryOpen] = useState(false);

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
                                <div className="flex h-full w-full items-center justify-center text-white text-3xl font-semibold">JS</div>
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
                        <h1 className="text-xl font-bold">Jane Str</h1>
                        <button className="mt-0.5 flex items-center gap-1 text-sm text-primary hover:underline">
                            <Info className="h-4 w-4" /> {t('page.profile.learn.more')}
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="button-pill rounded-lg px-5">{t('page.profile.add.friend')}</button>
                        <Link to="/me/messenger" className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary hover:bg-accent" aria-label={t('sidebar.messenger')}>
                            <MessageCircle className="h-5 w-5" />
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="button-pill gap-2 rounded-lg px-4">
                                    More
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
                                    Block Sergey
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
            <StoryViewer open={storyOpen} onOpenChange={setStoryOpen} startUserId="1" />
        </>
    );
}

export default ProfilePage