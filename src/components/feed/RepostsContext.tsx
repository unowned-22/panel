import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Post } from "./types";

export const ME = {
  id: "mark-roberts",
  kind: "user" as const,
  name: "Mark Roberts",
  avatar: "/avatar-me.jpg",
};

type RepostsContextValue = {
  /** Мои репосты — выводятся в начале ленты. */
  reposts: Post[];
  /** Создать репост поста с опциональным комментарием. */
  share: (original: Post, comment?: string) => void;
  /** Признак того, что данный пост уже репостнут мной (по id оригинала). */
  hasReposted: (postId: string) => boolean;
};

const RepostsContext = createContext<RepostsContextValue | null>(null);

export const RepostsProvider = ({ children }: { children: ReactNode }) => {
  const [reposts, setReposts] = useState<Post[]>([]);

  const hasReposted = useCallback(
    (postId: string) => reposts.some((p) => p.repost?.original.id === postId),
    [reposts],
  );

  const share = useCallback((original: Post, comment?: string) => {
    // Если шарим уже-репост — цитируем оригинальную запись, а не обёртку.
    const source: Post = original.repost
      ? ({ ...original.repost.original, stats: { likes: 0, comments: 0, shares: 0 } } as Post)
      : original;
    setReposts((prev) => {
      // Свернуть к одному репосту на оригинал
      if (prev.some((p) => p.repost?.original.id === source.id)) return prev;
      const { stats: _s, comments: _c, repost: _r, ...rest } = source;
      const repostPost: Post = {
        id: `repost-${original.id}-${Date.now()}`,
        author: {
          id: ME.id,
          kind: ME.kind,
          name: ME.name,
          avatar: ME.avatar,
          subtitle: "поделился записью · только что",
        },
        time: "только что",
        text: comment?.trim() ? comment.trim() : undefined,
        stats: { likes: 0, comments: 0, shares: 0 },
        repost: { original: rest },
      };
      return [repostPost, ...prev];
    });
  }, []);

  const value = useMemo(() => ({ reposts, share, hasReposted }), [reposts, share, hasReposted]);

  return <RepostsContext.Provider value={value}>{children}</RepostsContext.Provider>;
};

export const useReposts = () => {
  const ctx = useContext(RepostsContext);
  if (!ctx) throw new Error("useReposts must be used within RepostsProvider");
  return ctx;
};
