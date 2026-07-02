import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { type StoryItem, type StoryUser, StoriesContext } from "@/context/stories-context";
import { storiesActions } from "@/components/stories/api/stories";
import { useAccount } from "@/hooks/use-account";
import { useAuthStore } from "@/modules/auth/auth.store";

export const StoriesProvider = ({ children }: { children: ReactNode }) => {
    const { activeAccount } = useAccount();
    const isAuthenticated = useAuthStore((s) => !!s.activeAccountId && !!s.tokens[s.activeAccountId]);
    const [users, setUsers] = useState<StoryUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const mapSlidesToItems = (slides: any[], storyId?: number) => {
        return (slides || []).map((s: any, idx: number) => {
            const id = s.id ?? `${storyId ?? 'me'}-${idx}`;
            const createdAt = s.created_at ? Date.parse(s.created_at) : Date.now();
            let image: string | undefined;

            if (s.rendered_url) {
                image = s.rendered_url;
            } else if (s.background && s.background.kind === 'media' && s.background.url) {
                image = s.background.url;
            }
            if (!image && Array.isArray(s.elements)) {
                const imgEl = s.elements.find((e: any) => e.type === 'image');
                if (imgEl && imgEl.url) image = imgEl.url;
            }

            return {
                id: String(id),
                image,
                background: s.background ?? null,
                elements: Array.isArray(s.elements) ? s.elements : undefined,
                createdAt,
                storyId,
            } as StoryItem;
        });
    };

    const mapFeedSlidesToItems = (slides: any[], storyId?: number, rowCreatedAt?: string) => {
        return (slides || []).map((s: any, idx: number) => {
            const id = s.id ?? `${storyId ?? 'feed'}-${idx}`;
            const createdAt = rowCreatedAt ? Date.parse(rowCreatedAt) : Date.now();
            return {
                id: String(id),
                image: s.rendered_url,
                background: s.background ?? null,
                elements: Array.isArray(s.elements) ? s.elements : undefined,
                createdAt,
                storyId,
                seen: !!s.seen,
                linkZones: Array.isArray(s.link_zones) ? s.link_zones : undefined,
            } as StoryItem;
        });
    };

    useEffect(() => {
        if (!isAuthenticated) {
            setUsers((prev) => prev.filter((u) => u.isMe));
            setIsLoading(false);
            setError(null);
            return;
        }

        let mounted = true;
        (async () => {
            try {
                setIsLoading(true)
                const feed: any[] = await storiesActions.listFeed();
                if (!mounted) return;

                const byUser = new Map<number, { rows: any[] }>();
                for (const row of feed) {
                    const uid = Number((row as any).user_id);
                    if (!byUser.has(uid)) byUser.set(uid, { rows: [] });
                    byUser.get(uid)!.rows.push(row);
                }
                const feedUsers: StoryUser[] = [];
                for (const [uid, bucket] of byUser.entries()) {
                    const items: StoryItem[] = [];
                    for (const r of bucket.rows) {
                        if (Array.isArray(r.slides)) {
                            const rowItems = mapFeedSlidesToItems(r.slides, r.id, r.created_at);
                            items.push(...rowItems);
                        }
                    }
                    items.sort((a, b) => b.createdAt - a.createdAt);
                    feedUsers.push({
                        id: String(uid),
                        name: bucket.rows[0]?.author_name || "",
                        avatar: bucket.rows[0]?.author_avatar || '',
                        isMe: activeAccount.user?.id === uid,
                        seen: items.some((it) => it.seen),
                        items
                    });
                }

                setUsers((prev) => {
                    const me = prev.find((u) => u.isMe);
                    return [ ...(me ? [me] : []), ...feedUsers ];
                });
            } catch (err) {
                setError('failed to load feed');
                setUsers((prev) => prev.filter((u) => u.isMe));
            } finally {
                setIsLoading(false)
            }
        })();
        return () => { mounted = false };
    }, [activeAccount, isAuthenticated]);

    useEffect(() => {
        setUsers((prev) => prev.map((u) => (u.isMe ? {
            ...u,
            avatar: activeAccount.user?.avatar_url ?? u.avatar,
            name: activeAccount.name ?? u.name,
        } : u)));
    }, [activeAccount]);

    const addMyStory = useCallback(async (state: any) => {
        await storiesActions.publish(state);
        try {
            const resp: any[] = await storiesActions.listMine();
            const allSlides: any[] = [];
            for (const row of resp) if (row && Array.isArray(row.slides)) for (const sl of row.slides) allSlides.push({ ...(sl as any), created_at: (sl as any).created_at });
            const items = mapSlidesToItems(allSlides).sort((a,b)=>b.createdAt - a.createdAt);
            setUsers((prev) => prev.map((u) => (u.isMe ? { ...u, items } : u)));
        } catch (err) {
            // ignore
        }

        try {
            await storiesActions.listFeed();
        } catch (e) {
            // ignore
        }
    }, []);

    const markSeen = useCallback((userId: string, storyId?: number, slideIndex?: number) => {
        setUsers((prev) => prev.map((u) => {
            if (u.id !== userId) return u;
            const items = u.items.map((it, idx) => {
                if (typeof slideIndex === 'number' && it.storyId === storyId && idx === slideIndex) return { ...it, seen: true };
                if (slideIndex === undefined && it.storyId === storyId) return { ...it, seen: true };
                return it;
            });
            const seen = items.length > 0 && items.every(i => i.seen);
            return { ...u, items, seen };
        }));
        if (storyId !== undefined) {
            void storiesActions.view(storyId, slideIndex);
        }
    }, []);

    const removeMyStory = useCallback(async (storyId: number) => {
        await storiesActions.remove(storyId);
        const resp = await storiesActions.listMine();
        const allSlides: any[] = [];
        for (const row of resp) if (row && Array.isArray(row.slides)) for (const sl of row.slides) allSlides.push({ ...(sl as any), created_at: (sl as any).created_at });
        const items = mapSlidesToItems(allSlides).sort((a,b)=>b.createdAt - a.createdAt);
        setUsers((prev) => prev.map((u) => (u.isMe ? { ...u, items } : u)));
    }, []);

    const value = useMemo(() => ({ users, addMyStory, markSeen, removeMyStory, isLoading, error }), [users, addMyStory, markSeen, removeMyStory, isLoading, error]);

    return <StoriesContext.Provider value={value}>{children}</StoriesContext.Provider>;
};