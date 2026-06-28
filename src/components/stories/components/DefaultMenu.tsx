import { Type, Image as ImageIcon, Smile, Brush, Palette, Contrast, SlidersHorizontal, Link2 } from "lucide-react";
import type { Tool } from "../types/editor";
import { useTranslation } from "@/hooks/use-translation";

export function DefaultMenu({ onPick }: { onPick: (t: NonNullable<Tool>) => void }) {
  const { t } = useTranslation();
  const items: { id: NonNullable<Tool>; label: string; icon: typeof Type }[] = [
    { id: "text",       label: t("stories.editor.menu.text"),        icon: Type },
    { id: "photo",      label: t("stories.editor.menu.photo"),       icon: ImageIcon },
    { id: "stickers",   label: t("stories.editor.menu.stickers"),    icon: Smile },
    { id: "link",       label: t("stories.editor.menu.link"),        icon: Link2 },
    { id: "paint",      label: t("stories.editor.menu.paintbrush"),  icon: Brush },
    { id: "background", label: t("stories.editor.menu.background"),  icon: Palette },
    { id: "filters",    label: t("stories.editor.menu.filters"),     icon: Contrast },
    { id: "color",      label: t("stories.editor.menu.color"),       icon: SlidersHorizontal },
  ];

  return (
      <div className="p-2">
        {items.map(({ id, label, icon: Icon }) => (
            <button
                key={id}
                onClick={() => onPick(id)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 text-zinc-200"
            >
              <Icon className="h-5 w-5 text-zinc-400" />
              <span className="text-[15px]">{label}</span>
            </button>
        ))}
      </div>
  );
}