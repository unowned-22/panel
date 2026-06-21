import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Heart, Send, X } from "lucide-react";
import { type StoryUser } from "@/context/stories-context";
import { toast } from "sonner";
import { useStories } from "@/hooks/use-stories";

type Props = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    startUserId: string | null;
};

const DURATION = 5000;

export const StoryViewer = ({ open, onOpenChange, startUserId }: Props) => {
    const { users, markSeen } = useStories();
    const visibleUsers = users.filter((u) => u.items.length > 0);

    const [userIdx, setUserIdx] = useState(0);
    const [itemIdx, setItemIdx] = useState(0);
    const [progress, setProgress] = useState(0);
    const [reply, setReply] = useState("");
    const [inputFocused, setInputFocused] = useState(false);
    const [holdPause, setHoldPause] = useState(false);
    const rafRef = useRef<number>();
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
            markSeen(currentUser.id);
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

                    {/* Header */}
                    <div className="absolute top-5 left-2 right-2 z-20 flex items-center gap-2 mt-2">
                        <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover" />
                        <span className="text-sm font-medium text-white">{currentUser.name}</span>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="ml-auto w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    {currentItem.image ? (
                        <img src={currentItem.image} alt="story" className="w-full h-full object-cover" />
                    ) : (
                        <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ background: currentItem.background || "hsl(var(--muted))" }}
                        >
                            <p className="px-6 text-center text-2xl font-semibold text-white wrap-break-word">
                                {currentItem.text}
                            </p>
                        </div>
                    )}
                    {currentItem.image && currentItem.text && (
                        <p className="absolute bottom-10 left-0 right-0 px-4 text-center text-lg font-semibold text-white drop-shadow z-10">
                            {currentItem.text}
                        </p>
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
                            onSubmit={(e) => {
                                e.preventDefault();
                                const text = reply.trim();
                                if (!text) return;
                                toast.success(`Ответ отправлен ${currentUser.name}`, { description: text });
                                setReply("");
                                (document.activeElement as HTMLElement | null)?.blur?.();
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
                                placeholder={`Ответить ${currentUser.name}…`}
                                className="flex-1 h-10 px-4 rounded-full bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/60 outline-none focus:border-white/60"
                            />
                            <button
                                type="button"
                                onClick={() => toast.success(`Вы отправили ❤️ ${currentUser.name}`)}
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10"
                                aria-label="Лайк"
                            >
                                <Heart className="w-5 h-5" />
                            </button>
                            {reply.trim() && (
                                <button
                                    type="submit"
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-primary hover:opacity-90"
                                    aria-label="Отправить"
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
