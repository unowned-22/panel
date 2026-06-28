import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Heart, Send, X, ExternalLink } from "lucide-react";
import { type StoryUser, type LinkZone } from "@/context/stories-context";
import { toast } from "sonner";
import { useStories } from "@/hooks/use-stories";
import { useTranslation } from "@/hooks/use-translation";

type Props = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    startUserId: string | null;
};

const DURATION = 5000;

export const StoriesViewer = ({ open, onOpenChange, startUserId }: Props) => {
    const { t } = useTranslation();
    const { users, markSeen, removeMyStory } = useStories();
    const visibleUsers = users.filter((u) => u.items.length > 0);

    const [userIdx, setUserIdx] = useState(0);
    const [itemIdx, setItemIdx] = useState(0);
    const [progress, setProgress] = useState(0);
    const [reply, setReply] = useState("");
    const [likedMap, setLikedMap] = useState<Record<number, boolean>>({});
    const [inputFocused, setInputFocused] = useState(false);
    const [holdPause, setHoldPause] = useState(false);
    const [confirmUrl, setConfirmUrl] = useState<string | null>(null);
    const rafRef = useRef<number>(0);
    const startRef = useRef<number>(0);
    const pausedRef = useRef(false);

    // Keep pausedRef in sync with the two independent pause sources
    useEffect(() => {
        pausedRef.current = inputFocused || holdPause;
    }, [inputFocused, holdPause]);

    useEffect(() => {
        if (!open || !startUserId) return;
        const idx = visibleUsers.findIndex((u) => u.id === startUserId);
        setUserIdx(idx >= 0 ? idx : 0);
        setItemIdx(0);
        setProgress(0);
        setReply("");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, startUserId]);

    const currentUser: StoryUser | undefined = visibleUsers[userIdx];
    const currentItem = currentUser?.items[itemIdx];

    const next = () => {
        if (!currentUser) return;
        if (itemIdx + 1 < currentUser.items.length) {
            setItemIdx((i) => i + 1);
            setProgress(0);
        } else {
            // mark full story as seen
            markSeen(currentUser.id, currentItem?.storyId);
            if (userIdx + 1 < visibleUsers.length) {
                setUserIdx((i) => i + 1);
                setItemIdx(0);
                setProgress(0);
            } else {
                onOpenChange(false);
            }
        }
    };

    const prev = () => {
        if (itemIdx > 0) {
            setItemIdx((i) => i - 1);
            setProgress(0);
        } else if (userIdx > 0) {
            const prevUser = visibleUsers[userIdx - 1];
            setUserIdx((i) => i - 1);
            setItemIdx(prevUser.items.length - 1);
            setProgress(0);
        }
    };

    // progress loop
    useEffect(() => {
        if (!open || !currentItem) return;
        startRef.current = performance.now();
        let lastP = 0;
        const tick = (t: number) => {
            if (!pausedRef.current) {
                const elapsed = t - startRef.current;
                const p = Math.min(1, elapsed / DURATION);
                if (p !== lastP) {
                    lastP = p;
                    setProgress(p);
                }
                if (p >= 1) {
                    next();
                    return;
                }
            } else {
                startRef.current = t - lastP * DURATION;
            }
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, userIdx, itemIdx]);

    // when a slide becomes active, post view for that slide
    useEffect(() => {
        if (!open || !currentUser || !currentItem) return;
        if (!currentUser.isMe) {
            // notify backend that viewer saw this slide
            markSeen(currentUser.id, currentItem.storyId, itemIdx);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, userIdx, itemIdx, currentItem?.storyId]);

    if (!currentUser || !currentItem) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 bg-black border-none overflow-hidden">
                <div className="relative w-full aspect-9/16 bg-black">
                    {/* Hold-to-pause overlay (only over the media area, behind controls) */}
                    <div
                        className="absolute inset-0 z-0"
                        onPointerDown={(e) => {
                            // only main button / touch
                            if (e.pointerType === "mouse" && e.button !== 0) return;
                            setHoldPause(true);
                        }}
                        onPointerUp={() => setHoldPause(false)}
                        onPointerCancel={() => setHoldPause(false)}
                        onPointerLeave={() => setHoldPause(false)}
                    />
                    {/* Progress bars */}
                    <div className="absolute top-2 left-2 right-2 z-20 flex gap-1">
                        {currentUser.items.map((_, i) => (
                            <div key={i} className="flex-1 h-0.5 bg-white/30 rounded overflow-hidden">
                                <div
                                    className="h-full bg-white"
                                    style={{
                                        width: `${i < itemIdx ? 100 : i === itemIdx ? progress * 100 : 0}%`,
                                        transition: i === itemIdx ? "none" : undefined,
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="absolute top-5 left-2 right-2 z-20 flex items-center gap-2 mt-2">
                        <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover" />
                        <span className="text-sm font-medium text-white">{currentUser.name}</span>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="ml-auto w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        {currentUser.isMe && currentItem?.storyId && (
                            <button
                                onClick={async () => {
                                    try {
                                        const sid = currentItem.storyId;
                                        if (sid == null) return;
                                        if (removeMyStory) {
                                            await removeMyStory(sid);
                                        } else {
                                            await import('@/components/stories/api/stories').then(m => m.storiesActions.remove(sid));
                                        }
                                        onOpenChange(false);
                                    } catch (err) {
                                        toast.error(t('stories.viewer.delete.error' as any))
                                    }
                                }}
                                className="ml-2 w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10"
                            >
                                <X className="w-5 h-5 rotate-45" />
                            </button>
                        )}
                    </div>

                    <img src={currentItem.image} alt="story" className="w-full h-full object-cover" />

                    {currentItem.linkZones?.map((zone: LinkZone, i: number) => (
                        <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); setConfirmUrl(zone.url); setHoldPause(true); }}
                            className="absolute z-15"
                            style={{
                                left: `${zone.x - zone.width / 2}%`,
                                top: `${zone.y - zone.height / 2}%`,
                                width: `${zone.width}%`,
                                height: `${zone.height}%`,
                            }}
                            aria-label={zone.title || zone.url}
                        />
                    ))}

                    {/* Link confirm dialog */}
                    {confirmUrl && (
                        <div
                            className="absolute inset-0 z-40 flex items-end"
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            {/* backdrop */}
                            <div
                                className="absolute inset-0 bg-black/50"
                                onClick={() => { setConfirmUrl(null); setHoldPause(false); }}
                            />
                            {/* sheet */}
                            <div className="relative w-full rounded-t-2xl bg-zinc-900 p-5 space-y-4 shadow-2xl">
                                <p className="text-xs text-zinc-400 text-center uppercase tracking-wider">
                                    Переход по ссылке
                                </p>
                                <div className="flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-3">
                                    <ExternalLink className="h-4 w-4 text-zinc-400 shrink-0" />
                                    <span className="text-sm text-zinc-100 truncate">{confirmUrl}</span>
                                </div>
                                <p className="text-xs text-zinc-500 text-center">
                                    Вы покинете приложение и перейдёте на внешний сайт.
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => { setConfirmUrl(null); setHoldPause(false); }}
                                        className="rounded-xl bg-zinc-800 py-3 text-sm font-medium text-zinc-200 hover:bg-zinc-700"
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        onClick={() => {
                                            window.open(confirmUrl, "_blank", "noopener,noreferrer");
                                            setConfirmUrl(null);
                                            setHoldPause(false);
                                        }}
                                        className="rounded-xl bg-white py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
                                    >
                                        Перейти
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Nav zones */}
                    <button
                        onClick={prev}
                        className="absolute left-0 top-0 bottom-0 w-1/4 z-10 flex items-center justify-start pl-2 text-white/0 hover:text-white/70"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-0 top-0 bottom-0 w-1/4 z-10 flex items-center justify-end pr-2 text-white/0 hover:text-white/70"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Reply bar */}
                    {!currentUser.isMe && (
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const text = reply.trim();
                                if (!text) return;
                                if (!currentItem?.storyId) return;
                                try {
                                    if (currentItem.storyId == null) return;
                                    await import('@/components/stories/api/stories').then(m => m.storiesActions.reply(currentItem.storyId!, text));
                                    toast.success(t('stories.viewer.reply.sent').replace('{name}', currentUser.name), { description: text });
                                    setReply("");
                                    (document.activeElement as HTMLElement | null)?.blur?.();
                                } catch (err) {
                                    toast.error(t('stories.viewer.reply.error' as any))
                                }
                            }}
                            className="absolute bottom-0 left-0 right-0 z-30 p-3 flex items-center gap-2 bg-linear-to-t from-black/70 to-transparent"
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            <input
                                type="text"
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                onFocus={() => setInputFocused(true)}
                                onBlur={() => setInputFocused(false)}
                                placeholder={t('stories.viewer.reply.placeholder').replace('{name}', currentUser.name)}
                                className="flex-1 h-10 px-4 rounded-full bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/60 outline-none focus:border-white/60"
                            />
                            <button
                                type="button"
                                onClick={async () => {
                                    if (!currentItem?.storyId) return;
                                    const sid = currentItem.storyId;
                                    const cur = !!likedMap[sid];
                                    // optimistic
                                    setLikedMap((m) => ({ ...m, [sid]: !cur }));
                                    try {
                                        if (!cur) {
                                            await import('@/components/stories/api/stories').then(m => m.storiesActions.like(sid));
                                        } else {
                                            await import('@/components/stories/api/stories').then(m => m.storiesActions.unlike(sid));
                                        }
                                    } catch (e) {
                                        // revert
                                        setLikedMap((m) => ({ ...m, [sid]: cur }));
                                        toast.error(t('stories.viewer.like.error' as any))
                                    }
                                }}
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10"
                                aria-label="Like"
                            >
                                <Heart className="w-5 h-5" />
                            </button>
                            {reply.trim() && (
                                <button
                                    type="submit"
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-primary hover:opacity-90"
                                    aria-label="Send"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            )}
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};