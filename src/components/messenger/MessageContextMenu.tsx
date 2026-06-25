import { Reply, Pin, PinOff, Copy, Forward, Trash2, Heart, CheckCircle } from "lucide-react";
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "@/hooks/use-toast";
import { useState, type ReactNode } from "react";

const QUICK = ["👍", "❤️", "😂", "😮", "😢", "🔥", "👎"];

interface Props {
  children: ReactNode;
  messageText?: string;
  senderName?: string;
  isOwn?: boolean;
  isPinned?: boolean;
  onReply?: (p: { senderName: string; text: string }) => void;
  onPin?: () => void;
  onForward?: () => void;
  onDelete?: () => void;
}

const MessageContextMenu = ({
  children, messageText, senderName, isOwn, isPinned,
  onReply, onPin, onForward, onDelete,
}: Props) => {
  const [reaction, setReaction] = useState<string | null>(null);

  const react = (emoji: string) => {
    setReaction((prev) => (prev === emoji ? null : emoji));
    toast({ title: `${emoji} Реакция` });
  };

  return (
    <div className="relative">
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-auto min-w-55 rounded-xl p-1">
          <div className="flex items-center gap-1 px-2 py-1.5 mb-1">
            {QUICK.map((e) => (
              <button key={e} onClick={() => react(e)}
                className={`text-xl w-9 h-9 flex items-center justify-center rounded-full transition-all hover:scale-125 hover:bg-secondary ${
                  reaction === e ? "bg-secondary scale-110 ring-2 ring-primary/30" : ""
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
            onClick={() => toast({ title: "❤️ Нравится" })}>
            <Heart size={18} className="text-muted-foreground" />Нравится
          </ContextMenuItem>
          <ContextMenuItem className="gap-3 px-3 py-2 text-sm cursor-pointer"
            onClick={() => { onPin?.(); toast({ title: isPinned ? "Откреплено" : "Закреплено" }); }}>
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
            onClick={() => { onDelete?.(); toast({ title: "Удалено", variant: "destructive" }); }}>
            <Trash2 size={18} />Удалить
          </ContextMenuItem>
          <ContextMenuItem className="gap-3 px-3 py-2 text-sm cursor-pointer"
            onClick={() => toast({ title: "Выбрано" })}>
            <CheckCircle size={18} className="text-muted-foreground" />Выбрать
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      {reaction && (
        <button onClick={() => setReaction(null)}
          className={`absolute -bottom-3 ${isOwn ? "right-2" : "left-2"} z-10 text-base bg-popover border border-border rounded-full px-1.5 py-0.5 shadow-sm hover:scale-110 transition-transform`}>
          {reaction}
        </button>
      )}
    </div>
  );
};

export default MessageContextMenu;
