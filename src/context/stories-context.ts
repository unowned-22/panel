import { createContext } from "react";

export type StoryItem = {
    id: string;
    image?: string;
    background?: string;
    text?: string;
    createdAt: number;
};

export type StoryUser = {
    id: string;
    name: string;
    avatar: string;
    isMe?: boolean;
    seen?: boolean;
    items: StoryItem[];
};

export type StoriesContextValue = {
    users: StoryUser[];
    addMyStory: (item: Omit<StoryItem, "id" | "createdAt">) => void;
    markSeen: (userId: string) => void;
};

export const StoriesContext = createContext<StoriesContextValue | null>(null);