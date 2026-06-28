import { Heart, Send, Smile, X, Reply } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatCount, type Comment, type Post } from "./types";
import { MentionInput, renderWithMentions, type MentionInputHandle } from "../mention-input";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post;
}

type SortMode = "popular" | "new";

type LocalComment = Comment & { createdAt: number };

export const CommentsModal = ({ open, onOpenChange, post }: Props) => {
  const [comments, setComments] = useState<LocalComment[]>(() =>
    (post.comments ?? []).map((c, i) => ({ ...c, createdAt: -i })),
  );
  const [draft, setDraft] = useState("");
  const [sort, setSort] = useState<SortMode>("popular");
  const [replyTo, setReplyTo] = useState<LocalComment | null>(null);
  const inputRef = useRef<MentionInputHandle>(null);

  const sorted = useMemo(() => {
    const list = [...comments];
    if (sort === "popular") return list.sort((a, b) => b.likes - a.likes);
    return list.sort((a, b) => b.createdAt - a.createdAt);
  }, [comments, sort]);

  const startReply = (c: LocalComment) => {
    setReplyTo(c);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    const finalText = replyTo ? `${replyTo.author.name}, ${text}` : text;
    setComments((prev) => [
      {
        id: crypto.randomUUID(),
        author: { name: "Вы", avatar: post.author.avatar },
        text: finalText,
        time: "только что",
        likes: 0,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
    setDraft("");
    setReplyTo(null);
    setSort("new");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden bg-card border-border">
        <DialogTitle className="sr-only">Комментарии к посту {post.author.name}</DialogTitle>

        <header className="flex items-center gap-3 p-4 border-b border-border">
          <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden shrink-0">
            {post.author.avatar && (
              <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{post.author.name}</div>
            <div className="text-xs text-muted-foreground">
              {formatCount(comments.length)} комментариев
            </div>
          </div>
        </header>

        {comments.length > 0 && (
          <div className="flex items-center gap-1 px-4 py-2 border-b border-border">
            <span className="text-xs text-muted-foreground mr-1">Сортировка:</span>
            {(["popular", "new"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSort(mode)}
                className={cn(
                  "text-xs font-medium px-3 py-1 rounded-full transition-colors",
                  sort === mode
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/40",
                )}
              >
                {mode === "popular" ? "Популярные" : "Новые"}
              </button>
            ))}
          </div>
        )}

        <ScrollArea className="h-100">
          <div className="p-4 flex flex-col gap-4">
            {sorted.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-12">
                Пока нет комментариев. Будьте первым!
              </div>
            ) : (
              sorted.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary overflow-hidden shrink-0">
                    {c.author.avatar && (
                      <img src={c.author.avatar} alt={c.author.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-secondary/50 rounded-2xl px-3 py-2">
                      <div className="text-xs font-semibold mb-0.5">{c.author.name}</div>
                      <div className="text-sm leading-relaxed wrap-break-word">{renderWithMentions(c.text)}</div>
                    </div>
                    <div className="flex items-center gap-3 mt-1 px-3 text-xs text-muted-foreground">
                      <span>{c.time}</span>
                      <button
                        onClick={() => startReply(c)}
                        className="hover:text-foreground transition-colors"
                      >
                        Ответить
                      </button>
                      <button className="ml-auto flex items-center gap-1 hover:text-foreground transition-colors">
                        <Heart className="w-3.5 h-3.5" />
                        {c.likes > 0 && <span>{c.likes}</span>}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <footer className="border-t border-border bg-card">
          {replyTo && (
            <div className="flex items-start gap-2 px-3 pt-2">
              <div className="flex-1 flex items-start gap-2 bg-secondary/50 rounded-xl px-3 py-2 border-l-2 border-primary min-w-0">
                <Reply className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-primary truncate">
                    Ответ {replyTo.author.name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{replyTo.text}</div>
                </div>
              </div>
              <button
                onClick={() => setReplyTo(null)}
                className="w-7 h-7 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground shrink-0 mt-1"
                aria-label="Отменить ответ"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 p-3">
            <button className="w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground transition-colors">
              <Smile className="w-5 h-5" />
            </button>
            <MentionInput
              ref={inputRef}
              value={draft}
              onChange={setDraft}
              onSubmit={handleSend}
              placeholder={replyTo ? `Ответ ${replyTo.author.name}...` : "Написать комментарий... @ для упоминания"}
              className="flex-1"
            />
            <button
              onClick={handleSend}
              disabled={!draft.trim()}
              className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 transition-opacity"
              aria-label="Отправить"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
};
