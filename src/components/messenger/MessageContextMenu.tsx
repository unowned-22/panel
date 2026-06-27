import { Reply, Pin, PinOff, Copy, Forward, Trash2, CheckCircle } from "lucide-react";
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "@/hooks/use-toast";
import { type ReactNode } from "react";
import type { ReactionSummary } from "@/context/messenger-context";

const QUICK = ["👍", "❤️", "😂", "😮", "😢", "🔥", "👎"];

interface Props {
  children: ReactNode;
  messageText?: string;
  senderName?: string;
  isPinned?: boolean;
  reactions?: ReactionSummary[];
  onReply?: (p: { senderName: string; text: string }) => void;
  onPin?: () => void;
  onForward?: () => void;
  onDelete?: () => void;
  onReact?: (emoji: string) => void;
}

const MessageContextMenu = ({
                              children, messageText, senderName, isPinned, reactions,
                              onReply, onPin, onForward, onDelete, onReact,
                            }: Props) => {
  const myReactions = new Set((reactions ?? []).filter(r => r.reactedByMe).map(r => r.emoji));

  return (
      <div className="relative">
        <ContextMenu>
          <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
          <ContextMenuContent className="w-auto min-w-55 rounded-xl p-1">
            <div className="flex items-center gap-1 px-2 py-1.5 mb-1">
              {QUICK.map((e) => (
                  <button key={e} onClick={() => onReact?.(e)}
                          className={`text-xl w-9 h-9 flex items-center justify-center rounded-full transition-all hover:scale-125 hover:bg-secondary ${
                              myReactions.has(e) ? "bg-secondary scale-110 ring-2 ring-primary/30" : ""
                          }`}>
                    {e}
                  </button>
              ))}
            </div>
            <ContextMenuSeparator />
            <ContextMenuItem className="gap-3 px-3 py-2 text-sm cursor-pointer"
                             onClick={() => onReply?.({ senderName: senderName ?? "User", text: messageText ?? "" })}>
              <Reply size={18} className="text-muted-foreground" />Ответить
            </ContextMenuItem>
            <ContextMenuItem className="gap-3 px-3 py-2 text-sm cursor-pointer"
                             onClick={() => { onPin?.(); }}>
              {isPinned ? <PinOff size={18} className="text-muted-foreground" /> : <Pin size={18} className="text-muted-foreground" />}
              {isPinned ? "Открепить" : "Закрепить"}
            </ContextMenuItem>
            {messageText && (
                <ContextMenuItem className="gap-3 px-3 py-2 text-sm cursor-pointer"
                                 onClick={() => { navigator.clipboard.writeText(messageText); toast({ title: "Скопировано" }); }}>
                  <Copy size={18} className="text-muted-foreground" />Копировать
                </ContextMenuItem>
            )}
            <ContextMenuItem className="gap-3 px-3 py-2 text-sm cursor-pointer"
                             onClick={() => onForward?.()}>
              <Forward size={18} className="text-muted-foreground" />Переслать
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem className="gap-3 px-3 py-2 text-sm cursor-pointer text-destructive focus:text-destructive"
                             onClick={() => { onDelete?.(); }}>
              <Trash2 size={18} />Удалить
            </ContextMenuItem>
            <ContextMenuItem className="gap-3 px-3 py-2 text-sm cursor-pointer"
                             onClick={() => toast({ title: "Выбрано" })}>
              <CheckCircle size={18} className="text-muted-foreground" />Выбрать
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
  );
};

export default MessageContextMenu;