import { useState } from "react";
import { Link } from "react-router-dom";
import { MoreHorizontal, Heart, MessageCircle, Repeat2, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PhotoMedia } from "./media/PhotoMedia";
import { VideoMedia } from "./media/VideoMedia";
import { AudioMedia, AudioCollection } from "./media/AudioMedia";
import { CommentsModal } from "./CommentsModal";
import { ShareToFeedDialog } from "./ShareToFeedDialog";
import { useReposts } from "./RepostsContext";
import { formatCount, type Author, type Post } from "./types";
import {toAbsoluteUrl} from "@/lib/helpers.ts";

interface Props {
  post: Post;
}

/** Ссылка на страницу автора (профиль или сообщество). Если id не задан — обычный текст. */
const AuthorLink = ({
  author,
  className,
  children,
}: {
  author: Author;
  className?: string;
  children: React.ReactNode;
}) => {
  if (!author.id) return <span className={className}>{children}</span>;
  const to = author.kind === "group" ? `/groups?id=${author.id}` : `/profile/${author.id}`;
  return (
    <Link to={to} className={cn("hover:underline", className)}>
      {children}
    </Link>
  );
};

const AuthorAvatar = ({ author, size = 40 }: { author: Author; size?: number }) => {
  const inner = (
    <div
      className="rounded-full bg-secondary overflow-hidden shrink-0"
      style={{ width: size, height: size }}
    >
      {author.avatar && (
        <img src={toAbsoluteUrl(author.avatar)} alt={author.name} className="w-full h-full object-cover" loading="lazy" />
      )}
    </div>
  );
  if (!author.id) return inner;
  const to = author.kind === "group" ? `/groups?id=${author.id}` : `/profile/${author.id}`;
  return <Link to={to} aria-label={author.name}>{inner}</Link>;
};

/** Вложенная карточка-цитата оригинала внутри репоста. */
const QuotedPost = ({ original }: { original: NonNullable<Post["repost"]>["original"] }) => (
  <div className="mx-4 mb-3 rounded-xl border border-border bg-secondary/30">
    <header className="flex items-center gap-2.5 px-3 pt-3 pb-2">
      <AuthorAvatar author={original.author} size={32} />
      <div className="min-w-0">
        <AuthorLink author={original.author} className="text-sm font-semibold truncate block">
          {original.author.name}
        </AuthorLink>
        {original.author.subtitle && (
          <div className="text-[11px] text-muted-foreground truncate">{original.author.subtitle}</div>
        )}
      </div>
    </header>
    {original.text && (
      <div className="px-3 pb-2 text-[14px] leading-relaxed whitespace-pre-line">
        {original.text}
      </div>
    )}
    {original.media?.map((m, i) => {
      switch (m.type) {
        case "photo":
          return <PhotoMedia key={i} images={m.images} />;
        case "video":
          return <VideoMedia key={i} video={m.video} />;
        case "audio":
          return <AudioMedia key={i} audio={m.audio} />;
        case "audio-collection":
          return <AudioCollection key={i} tracks={m.tracks} />;
      }
    })}
    <div className="px-3 pb-3 pt-1 text-[11px] text-muted-foreground">{original.time}</div>
  </div>
);

export const PostCard = ({ post }: Props) => {
  const { hasReposted } = useReposts();
  const [liked, setLiked] = useState(post.liked ?? false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const reposted = post.reposted ?? hasReposted(post.id);

  const likeDelta = liked && !post.liked ? 1 : !liked && post.liked ? -1 : 0;
  const likes = post.stats.likes + likeDelta;
  const shares = post.stats.shares + (reposted && !post.reposted ? 1 : 0);

  const isLong = (post.text?.length ?? 0) > 220;

  return (
    <article className="panel-card overflow-hidden">
      <header className="flex items-center gap-3 p-4 pb-3">
        <AuthorAvatar author={post.author} />
        <div className="flex-1 min-w-0">
          <AuthorLink author={post.author} className="font-semibold text-sm truncate block">
            {post.author.name}
          </AuthorLink>
          {post.author.subtitle && (
            <div className="text-xs text-muted-foreground truncate">{post.author.subtitle}</div>
          )}
        </div>
        <button className="button-pill py-1.5! px-4!">Подписаться</button>
        <button className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground" aria-label="Меню">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </header>

      {post.text && (
        <div className="px-4 pb-3 text-[15px] leading-relaxed whitespace-pre-line">
          {isLong && !expanded ? (
            <>
              {post.text.slice(0, 220)}…{" "}
              <button onClick={() => setExpanded(true)} className="text-primary hover:underline">
                Показать ещё
              </button>
            </>
          ) : (
            post.text
          )}
        </div>
      )}

      {post.repost && <QuotedPost original={post.repost.original} />}

      {post.media?.map((m, i) => {
        switch (m.type) {
          case "photo":
            return <PhotoMedia key={i} images={m.images} />;
          case "video":
            return <VideoMedia key={i} video={m.video} />;
          case "audio":
            return <AudioMedia key={i} audio={m.audio} />;
          case "audio-collection":
            return <AudioCollection key={i} tracks={m.tracks} />;
        }
      })}

      <footer className="flex items-center gap-1 p-3 text-muted-foreground">
        <button
          onClick={() => setLiked((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-secondary/60 transition-all",
            liked && "text-destructive",
          )}
          aria-pressed={liked}
        >
          <Heart className={cn("w-4 h-4 transition-transform", liked && "fill-current scale-110")} />
          <span className="text-sm tabular-nums">{formatCount(likes)}</span>
        </button>
        <button
          onClick={() => setCommentsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-secondary/60 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm tabular-nums">{formatCount(post.stats.comments)}</span>
        </button>
        <button
          onClick={() => setShareOpen(true)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-secondary/60 transition-colors",
            reposted && "text-primary",
          )}
          aria-pressed={reposted}
          aria-label="Поделиться у себя"
        >
          <Repeat2 className={cn("w-4 h-4", reposted && "scale-110")} />
          <span className="text-sm tabular-nums">{formatCount(shares)}</span>
        </button>
        <button
          onClick={() => setShareOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-secondary/60 transition-colors ml-auto"
          aria-label="Поделиться"
        >
          <Share2 className="w-4 h-4" />
        </button>
        <span className="text-xs pr-2 pl-1">{post.time}</span>
      </footer>

      <CommentsModal open={commentsOpen} onOpenChange={setCommentsOpen} post={post} />
      <ShareToFeedDialog open={shareOpen} onOpenChange={setShareOpen} post={post} />
    </article>
  );
};
