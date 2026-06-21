import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { type StoryItem, type StoryUser, StoriesContext } from "@/context/stories-context";
import { storiesActions } from "@/components/stories/api/stories";
import { useAccount } from "@/hooks/use-account";

const initialUsers: StoryUser[] = [
    {
        id: "me",
        name: "Моя история",
        avatar: "/avatar-me.jpg",
        isMe: true,
        items: [],
    },
    { id: "u1", name: "Skylar R.", avatar: "/avatar-1.jpg", items: [{ id: "s1", image: "/post-photo-1.jpg", createdAt: Date.now() - 3600_000 }] },
    { id: "u2", name: "Mira D.", avatar: "/avatar-2.jpg", items: [{ id: "s2", image: "/post-photo-2.jpg", createdAt: Date.now() - 7200_000 }, { id: "s2b", image: "/post-photo-3.jpg", createdAt: Date.now() - 6000_000 }] },
    { id: "u3", name: "Nolan M.", avatar: "/avatar-3.jpg", items: [{ id: "s3", image: "/post-photo-3.jpg", createdAt: Date.now() - 5000_000 }] },
    { id: "u4", name: "Leah C.", avatar: "/avatar-4.jpg", items: [{ id: "s4", image: "/post-photo-4.jpg", createdAt: Date.now() - 4000_000 }] },
    { id: "u5", name: "Ethan W.", avatar: "/avatar-5.jpg", items: [{ id: "s5", text: "Доброе утро ☀️", background: "linear-gradient(135deg, hsl(211 100% 56%), hsl(280 80% 60%))", createdAt: Date.now() - 3000_000 }] },
    { id: "u6", name: "Mamie C.", avatar: "/avatar-6.jpg", items: [{ id: "s6", image: "/post-photo-1.jpg", createdAt: Date.now() - 2000_000 }] },
    { id: "u7", name: "Evan W.", avatar: "/avatar-7.jpg", seen: true, items: [{ id: "s7", image: "/post-photo-2.jpg", createdAt: Date.now() - 86400_000 }] },
    { id: "u8", name: "Nannie W.", avatar: "/avatar-1.jpg", seen: true, items: [{ id: "s8", image: "/post-photo-4.jpg", createdAt: Date.now() - 90000_000 }] },
];

export const StoriesProvider = ({ children }: { children: ReactNode }) => {
    const { activeAccount } = useAccount();
    const [users, setUsers] = useState<StoryUser[]>(initialUsers);

    // Load "my" stories from API and update the local "me" entry.
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const resp = await storiesActions.listMine();
                if (!mounted) return;
                // API returns array of story rows for the current user (usually one).
                const meStories = resp[0];
                if (!meStories) return;
                const items: StoryItem[] = (meStories.slides || []).map((s: any, idx: number) => {
                    const id = s.id ?? `me-${idx}`;
                    const createdAt = s.created_at ? Date.parse(s.created_at) : Date.now();
                    let image: string | undefined;
                    let background: string | undefined;
                    let text: string | undefined;
                    // background media
                    if (s.background && s.background.kind === 'media' && s.background.url) {
                        image = s.background.url;
                    }
                    // elements: prefer first image element
                    if (!image && Array.isArray(s.elements)) {
                        const imgEl = s.elements.find((e: any) => e.type === 'image');
                        if (imgEl && imgEl.url) image = imgEl.url;
                    }
                    if (!image && s.text) text = s.text;
                    if (!image && s.background && (s.background.kind === 'color' || s.background.kind === 'gradient' || s.background.kind === 'pattern')) {
                        background = s.background.value || s.background.preview || undefined;
                    }
                    return { id: String(id), image, background, text, createdAt } as StoryItem;
                });

                setUsers((prev) => prev.map((u) => (u.isMe ? { ...u, items } : u)));
            } catch (err) {
                // ignore for now — keep mocks
            }
        })();
        return () => { mounted = false };
    }, [activeAccount]);

    // Load feed (other users' stories) and merge with local users list.
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const feed = await storiesActions.listFeed();
                if (!mounted) return;
                // Map feed story rows to StoryUser entries
                const feedUsers: StoryUser[] = feed.map((s: any) => {
                    const items: StoryItem[] = (s.slides || []).map((sl: any, idx: number) => {
                        const id = sl.id ?? `${s.user_id}-${idx}`;
                        const createdAt = sl.created_at ? Date.parse(sl.created_at) : Date.now();
                        let image: string | undefined;
                        let background: string | undefined;
                        let text: string | undefined;
                        // background media
                        if (sl.background && sl.background.kind === 'media' && sl.background.url) {
                            image = sl.background.url;
                        }
                        // elements: prefer first image element
                        if (!image && Array.isArray(sl.elements)) {
                            const imgEl = sl.elements.find((e: any) => e.type === 'image');
                            if (imgEl && imgEl.url) image = imgEl.url;
                        }
                        if (!image && sl.text) text = sl.text;
                        if (!image && sl.background && (sl.background.kind === 'color' || sl.background.kind === 'gradient' || sl.background.kind === 'pattern')) {
                            background = sl.background.value || sl.background.preview || undefined;
                        }
                        return { id: String(id), image, background, text, createdAt, storyId: s.id, seen: !!sl.seen } as StoryItem;
                    });
                    return {
                        id: String(s.user_id),
                        name: s.author_name || `User ${s.user_id}`,
                        avatar: s.author_avatar || '/avatar-default.jpg',
                        isMe: false,
                        seen: items.some((it) => it.seen),
                        items,
                    } as StoryUser;
                });

                // Preserve local 'me' entry if present
                setUsers((prev) => {
                    const me = prev.find((u) => u.isMe);
                    return [
                        ...(me ? [me] : []),
                        ...feedUsers,
                    ];
                });
            } catch (err) {
                // ignore; keep mocks
            }
        })();
        return () => { mounted = false };
    }, [activeAccount]);

    // Keep my avatar/name in sync with active account visual data.
    useEffect(() => {
        setUsers((prev) => prev.map((u) => (u.isMe ? {
            ...u,
            avatar: activeAccount.user?.avatar_url ?? u.avatar,
            name: activeAccount.name ?? u.name,
        } : u)));
    }, [activeAccount]);

    const addMyStory = useCallback(async (state: any) => {
        // publish via API then refresh my stories
        await storiesActions.publish(state);
        try {
            const resp = await storiesActions.listMine();
            const meStories = resp[0];
            if (!meStories) return;
            const items: StoryItem[] = (meStories.slides || []).map((s: any, idx: number) => {
                const id = s.id ?? `me-${idx}`;
                const createdAt = s.created_at ? Date.parse(s.created_at) : Date.now();
                let image: string | undefined;
                let background: string | undefined;
                let text: string | undefined;
                if (s.background && s.background.kind === 'media' && s.background.url) {
                    image = s.background.url;
                }
                if (!image && Array.isArray(s.elements)) {
                    const imgEl = s.elements.find((e: any) => e.type === 'image');
                    if (imgEl && imgEl.url) image = imgEl.url;
                }
                if (!image && s.text) text = s.text;
                if (!image && s.background && (s.background.kind === 'color' || s.background.kind === 'gradient' || s.background.kind === 'pattern')) {
                    background = s.background.value || s.background.preview || undefined;
                }
                return { id: String(id), image, background, text, createdAt } as StoryItem;
            });
            setUsers((prev) => prev.map((u) => (u.isMe ? { ...u, items } : u)));
        } catch (err) {
            // ignore
        }
        // refresh feed cache (best-effort)
        try {
            await storiesActions.listFeed();
        } catch (e) {
            // ignore
        }
    }, []);

    const markSeen = useCallback((userId: string, storyId?: number, slideIndex?: number) => {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, seen: true } : u)));
        if (storyId) {
            void storiesActions.view(storyId, slideIndex);
        }
    }, []);

    const value = useMemo(() => ({ users, addMyStory, markSeen }), [users, addMyStory, markSeen]);

    return <StoriesContext.Provider value={value}>{children}</StoriesContext.Provider>;
};