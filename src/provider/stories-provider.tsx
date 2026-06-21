import { type ReactNode, useCallback, useMemo, useState } from "react";
import { type StoryItem, type StoryUser, StoriesContext } from "@/context/stories-context";

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
    const [users, setUsers] = useState<StoryUser[]>(initialUsers);

    const addMyStory = useCallback((item: Omit<StoryItem, "id" | "createdAt">) => {
        setUsers((prev) =>
            prev.map((u) =>
                u.isMe
                    ? {
                        ...u,
                        items: [
                            ...u.items,
                            { ...item, id: `me-${Date.now()}`, createdAt: Date.now() },
                        ],
                    }
                    : u
            )
        );
    }, []);

    const markSeen = useCallback((userId: string) => {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, seen: true } : u)));
    }, []);

    const value = useMemo(() => ({ users, addMyStory, markSeen }), [users, addMyStory, markSeen]);

    return <StoriesContext.Provider value={value}>{children}</StoriesContext.Provider>;
};