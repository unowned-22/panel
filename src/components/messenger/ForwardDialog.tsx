import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMessenger } from "@/hooks/use-messenger";
import { Check, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sourceChatId: string;
  messageId: string | null;
}

const ForwardDialog = ({ open, onOpenChange, sourceChatId, messageId }: Props) => {
  const { contacts, forwardMessage } = useMessenger();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const handleForward = () => {
    if (!messageId || selected.size === 0) return;
    forwardMessage(sourceChatId, messageId, Array.from(selected));
    toast({ title: `Переслано в ${selected.size} ${selected.size === 1 ? "чат" : "чата(ов)"}` });
    setSelected(new Set());
    setQuery("");
    onOpenChange(false);
  };

  const filtered = contacts.filter(
    (c) => c.id !== sourceChatId && c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle>Переслать сообщение</DialogTitle>
        </DialogHeader>
        <div className="px-5 pt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск чата"
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
        <div className="max-h-85 overflow-y-auto px-2 py-2">
          {filtered.map((c) => {
            const checked = selected.has(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggle(c.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  checked ? "bg-accent" : "hover:bg-secondary/60"
                }`}
              >
                {c.avatar ? (
                  <img src={c.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold">
                    {c.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.preview}</p>
                </div>
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    checked ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  }`}
                >
                  {checked && <Check size={12} />}
                </span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-6">Ничего не найдено</p>
          )}
        </div>
        <DialogFooter className="px-5 pb-5">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button onClick={handleForward} disabled={selected.size === 0}>
            Переслать{selected.size > 0 ? ` (${selected.size})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ForwardDialog;
