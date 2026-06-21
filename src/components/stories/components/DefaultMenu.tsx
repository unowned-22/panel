import { Type, Image as ImageIcon, Smile, Brush, Palette, Contrast, SlidersHorizontal } from "lucide-react";
import type { Tool } from "../types/editor";

export function DefaultMenu({ onPick }: { onPick: (t: NonNullable<Tool>) => void }) {
  const items: { id: NonNullable<Tool>; label: string; icon: typeof Type }[] = [
    { id: "text", label: "Text", icon: Type },
    { id: "photo", label: "Photo", icon: ImageIcon },
    { id: "stickers", label: "Stickers", icon: Smile },
    { id: "paint", label: "Paintbrush", icon: Brush },
    { id: "background", label: "Background", icon: Palette },
    { id: "filters", label: "Filters", icon: Contrast },
    { id: "color", label: "Color correction", icon: SlidersHorizontal },
  ];
  return (
      <div className="p-2">
        {items.map(({ id, label, icon: Icon }) => (
            <button
                key={id} onClick={() => onPick(id)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 text-zinc-200"
            >
              <Icon className="h-5 w-5 text-zinc-400" />
              <span className="text-[15px]">{label}</span>
            </button>
        ))}
      </div>
  );
}
