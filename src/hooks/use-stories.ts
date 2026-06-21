import { useContext } from "react";
import { StoriesContext } from "@/context/stories-context";

export const useStories = () => {
    const ctx = useContext(StoriesContext);
    if (!ctx) throw new Error("useStories must be used within StoriesProvider");
    return ctx;
};