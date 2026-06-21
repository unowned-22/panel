import { Type, Image as ImageIcon, Smile, Brush, Palette, Contrast, SlidersHorizontal } from "lucide-react";
import type { Tool } from "../types/editor";

export function Toolbar({ tool, onPick }: { tool: Tool; onPick: (t: NonNullable<Tool>) => void }) {
  const items: { id: NonNullable<Tool>; icon: typeof Type }[] = [
    { id: "text", icon: Type },
    { id: "photo", icon: ImageIcon },
    { id: "stickers", icon: Smile },
    { id: "paint", icon: Brush },
    { id: "background", icon: Palette },
    { id: "filters", icon: Contrast },
    { id: "color", icon: SlidersHorizontal },
  ];
  return (
      <div className="w-14 shrink-0 flex flex-col items-center gap-1 py-4 border-r border-white/5">
        {items.map(({ id, icon: Icon }) => (
            <button
                key={id}
                onClick={() => onPick(id)}
                className={`h-10 w-10 rounded-lg flex items-center justify-center ${tool === id ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"}`}
                aria-label={id}
            >
              <Icon className="h-5 w-5" />
            </button>
        ))}
      </div>
  );
}
