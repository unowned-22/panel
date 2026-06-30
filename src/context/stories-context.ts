import { createContext } from "react";
import type { Background, CanvasElement } from "@/components/stories/types/stories";

export type LinkZone = {
    url: string;
    display_style: "pill" | "card";
    title?: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
};

export type StoryItem = {
    id: string;
    image?: string;
    background?: Background | null;
    elements?: CanvasElement[];
    createdAt: number;
    storyId?: number;
    seen?: boolean;
    linkZones?: LinkZone[];
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
    removeMyStory?: (storyId: number) => Promise<void>;
    isLoading?: boolean;
    error?: string | null;
};

export const StoriesContext = createContext<StoriesContextValue | null>(null);