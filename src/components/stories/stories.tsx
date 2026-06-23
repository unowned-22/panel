import { useState, useEffect, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { useStories } from "@/hooks/use-stories";
import { toAbsoluteUrl } from "@/lib/helpers";
import type { StoryState } from "./types/stories";
import { toast } from "@/hooks/use-toast.ts";
import { ApiError } from "@/lib/api-client.ts";
import { useTranslation } from "@/hooks/use-translation";
import { StoriesEditor } from "./stories-editor";
import { StoriesViewer } from "./stories-viewer";
import { getInitials } from "@/hooks/use-account";

const StoryRing = ({ children, seen, isMe }: { children: ReactNode; seen?: boolean; isMe?: boolean }) => (
    <div
        className="p-[2.5px] rounded-full"
        style={{
            background: isMe ? "hsl(var(--border))" : seen ? "hsl(var(--border))" : "var(--gradient-ig-ring)",
        }}
    >
        <div className="p-0.5 rounded-full bg-card">{children}</div>
    </div>
);

export const Stories = () => {
    const { t } = useTranslation();
    const { users, addMyStory } = useStories();

    const [viewerOpen, setViewerOpen] = useState(false);
    const [activeUserId, setActiveUserId] = useState<string | null>(null);
    const [storyEditorOpen, setStoryEditorOpen] = useState(false);

    console.log(users)
    const me = users.find((u) => u.isMe) ?? { id: 'me', name: t('page.home.my.stories') ?? 'My story', avatar: '', isMe: true, items: [] };
    const others = users.filter((u) => !u.isMe && (u.items || []).length > 0);

    const openViewer = (userId: string) => {
        setActiveUserId(userId);
        setViewerOpen(true);
    };

    // listen to global events (e.g. from other parts of the app) to open editor/viewer
    useEffect(() => {
        const handler = (ev: any) => {
            const d = ev.detail || {};
            if (d.type === 'editor') setStoryEditorOpen(true);
            if (d.type === 'viewer') {
                setActiveUserId(d.userId ?? null);
                setViewerOpen(true);
            }
        };
        window.addEventListener('stories.open', handler as EventListener);
        return () => window.removeEventListener('stories.open', handler as EventListener);
    }, []);

    return (
        <div className="panel-card px-4 py-4">
            <div className="flex gap-4 overflow-x-auto scrollbar-none">
                {/* My story */}
                <button
                    onClick={() => (me.items.length > 0 ? openViewer("me") : setStoryEditorOpen(true))}
                    className="flex flex-col items-center gap-1.5 shrink-0 group"
                >
                    <div className="relative">
                        <StoryRing isMe={me.items.length === 0} seen={false}>
                            {me.avatar === ""
                                ? <div className="flex w-16 h-16 items-center justify-center text-white text-3xl font-semibold">{getInitials(me.name)}</div>
                                : <img
                                    src={toAbsoluteUrl(me.avatar)}
                                    alt="My story"
                                    width={64}
                                    height={64}
                                    loading="lazy"
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            }
                        </StoryRing>
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                setStoryEditorOpen(true)
                            }}
                            role="button"
                            className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-primary border-2 border-card flex items-center justify-center cursor-pointer"
                        >
                            <Plus className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                        </div>
                    </div>
                    <span className="text-xs text-foreground max-w-18 truncate">{t('page.home.my.stories')}</span>
                </button>

                {others.map((u) => (
                    <button
                        key={u.id}
                        onClick={() => openViewer(u.id)}
                        className="flex flex-col items-center gap-1.5 shrink-0 group"
                    >
                        <StoryRing seen={u.seen}>
                            <img
                                src={toAbsoluteUrl(u.avatar)}
                                alt={u.name}
                                width={64}
                                height={64}
                                loading="lazy"
                                className="w-16 h-16 rounded-full object-cover transition-transform group-hover:scale-105"
                            />
                        </StoryRing>
                        <span className={`text-xs max-w-18 truncate ${u.seen ? "text-muted-foreground" : "text-foreground"}`}>
                      {u.name}
                    </span>
                    </button>
                ))}
            </div>


            <StoriesViewer open={viewerOpen} onOpenChange={setViewerOpen} startUserId={activeUserId} />
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
        </div>
    );
};
