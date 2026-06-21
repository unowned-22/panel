import { createContext } from "react";

export type StoryItem = {
    id: string;
    image?: string;
    background?: string;
    text?: string;
    createdAt: number;
    storyId?: number;
    seen?: boolean;
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
    addMyStory: (item: Omit<StoryItem, "id" | "createdAt"> | any) => void;
    markSeen: (userId: string, storyId?: number, slideIndex?: number) => void;
};

export const StoriesContext = createContext<StoriesContextValue | null>(null);