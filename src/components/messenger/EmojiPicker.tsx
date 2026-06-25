import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile } from "lucide-react";

const CATS: Record<string, string[]> = {
  Смайлы: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😋","😛","😜","🤪","🤔","😐","😑","🙄","😬","😌","😔","😪","😴","🥵","🥶","😵","🤯","🥳","😎","🤓","🧐"],
  Жесты: ["👍","👎","👌","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","👇","☝️","👋","🖐️","✋","🖖","👏","🙌","🤝","🙏","💪","👊","✊"],
  Сердца: ["❤️","🧡","💛","💚","💙","💜","🤎","🖤","🤍","💔","❣️","💕","💞","💓","💗","💖","💘","💝"],
  Животные: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🦄","🐝","🦋","🐢","🐙","🐳","🦈"],
  Еда: ["🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🍒","🍑","🥭","🍍","🥑","🍅","🌽","🥕","🍞","🧀","🍕","🍔","🍟","🌭","🌮","🍣","🍜"],
  Символы: ["✅","❌","⭕","🚫","💯","🔥","⭐","🌟","✨","⚡","💥","💫","💦","💨","🎉","🎊","🎁","🎈"],
};

const EmojiPicker = ({ onSelect }: { onSelect: (e: string) => void }) => {
  const [cat, setCat] = useState<string>("Смайлы");
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="w-8 h-8 flex items-center justify-center text-foreground/70 hover:text-foreground rounded-lg hover:bg-secondary">
          <Smile className="w-5 h-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="w-80 p-0 overflow-hidden">
        <div className="flex items-center gap-1 px-2 py-2 border-b border-border overflow-x-auto">
          {Object.keys(CATS).map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-2 py-1 rounded-md text-xs whitespace-nowrap transition-colors ${
                cat === c ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              }`}>
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-8 gap-1 p-2 max-h-64 overflow-y-auto">
          {CATS[cat].map((e, i) => (
            <button key={`${e}-${i}`} onClick={() => { onSelect(e); setOpen(false); }}
              className="text-2xl hover:bg-secondary rounded-md p-1 transition-transform hover:scale-125">
              {e}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
