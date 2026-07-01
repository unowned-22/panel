import { Reply, Pin, PinOff, Copy, Forward, Trash2, CheckCircle, Star, StarOff, Pencil, Bookmark } from "lucide-react";
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger,
  ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import { toast } from "@/hooks/use-toast";
import { type ReactNode } from "react";
import type { ReactionSummary } from "@/context/messenger-context";
import EmojiPicker from "./EmojiPicker";

const QUICK = ["👍", "❤️", "😂", "😮", "😢", "🔥", "👎"];

interface Props {
  children: ReactNode;
  messageText?: string;
  senderName?: string;
  isOwn?: boolean;
  isPinned?: boolean;
  isImportant?: boolean;
  reactions?: ReactionSummary[];
  onReply?: (p: { senderName: string; text: string }) => void;
  onPin?: () => void;
  onMarkImportant?: () => void;
  onEdit?: () => void;
  onForward?: () => void;
  onForwardToSaved?: () => void;
  onDelete?: () => void;
  onReact?: (emoji: string) => void;
}

const MessageContextMenu = ({
                              children, messageText, senderName, isOwn, isPinned, isImportant, reactions,
                              onReply, onPin, onMarkImportant, onEdit, onForward, onForwardToSaved, onDelete, onReact,
                            }: Props) => {
  const myReactions = new Set((reactions ?? []).filter(r => r.reactedByMe).map(r => r.emoji));
  const notify = (label: string) => toast({ title: label });

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
              {/* Полный пикер — аналог "..." у референса, открывает все эмодзи для реакции */}
              <EmojiPicker onSelect={(e) => onReact?.(e)} />
            </div>
            <ContextMenuSeparator />

            <ContextMenuItem className="gap-3 px-3 py-2 text-sm cursor-pointer"
                             onClick={() => onReply?.({ senderName: senderName ?? "User", text: messageText ?? "" })}>
              <Reply size={18} className="text-muted-foreground" />Ответить
            </ContextMenuItem>

            <ContextMenuSub>
              <ContextMenuSubTrigger className="gap-3 px-3 py-2 text-sm cursor-pointer">
                <Forward size={18} className="text-muted-foreground" />Переслать
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-52 rounded-xl p-1">
                <ContextMenuItem className="gap-3 px-3 py-2 text-sm cursor-pointer"
                                 onClick={() => (onForwardToSaved ? onForwardToSaved() : notify("Переслано в Избранное"))}>
                  <Bookmark size={16} className="text-muted-foreground" />В Избранное
                </ContextMenuItem>
                <ContextMenuItem className="gap-3 px-3 py-2 text-sm cursor-pointer"
                                 onClick={() => onForward?.()}>
                  <Forward size={16} className="text-muted-foreground" />Выбрать чат…
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>

            <ContextMenuItem className="gap-3 px-3 py-2 text-sm cursor-pointer"
                             onClick={() => { onPin?.(); }}>
              {isPinned ? <PinOff size={18} className="text-muted-foreground" /> : <Pin size={18} className="text-muted-foreground" />}
              {isPinned ? "Открепить" : "Закрепить"}
            </ContextMenuItem>

            <ContextMenuItem className="gap-3 px-3 py-2 text-sm cursor-pointer"
                             onClick={() => (onMarkImportant ? onMarkImportant() : notify(isImportant ? "Убрано из важного" : "Отмечено как важное"))}>
              {isImportant ? <StarOff size={18} className="text-muted-foreground" /> : <Star size={18} className="text-muted-foreground" />}
              {isImportant ? "Убрать из важного" : "Отметить как важное"}
            </ContextMenuItem>

            {messageText && (
                <ContextMenuItem className="gap-3 px-3 py-2 text-sm cursor-pointer"
                                 onClick={() => { navigator.clipboard.writeText(messageText); toast({ title: "Скопировано" }); }}>
                  <Copy size={18} className="text-muted-foreground" />Копировать текст
                </ContextMenuItem>
            )}

            {isOwn && (
                <ContextMenuItem className="gap-3 px-3 py-2 text-sm cursor-pointer"
                                 onClick={() => (onEdit ? onEdit() : notify("Редактирование скоро появится"))}>
                  <Pencil size={18} className="text-muted-foreground" />Редактировать
                </ContextMenuItem>
            )}

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