import { Plus, X } from "lucide-react";
import { backgroundPreviewStyle } from "../utils";
import type { Slide } from "../types/stories";

export function SlideStrip({
                      slides, activeId, onSelect, onAdd, onRemove,
                    }: {
  slides: Slide[]; activeId: string;
  onSelect: (id: string) => void; onAdd: () => void; onRemove: (id: string) => void;
}) {
  return (
      <div className="flex items-center gap-2 overflow-x-auto">
        {slides.map((s) => {
          const active = s.id === activeId;
          return (
              <div key={s.id} className="relative group shrink-0">
                <button
                    onClick={() => onSelect(s.id)}
                    className={`h-14 w-10 rounded-md overflow-hidden ring-2 ${active ? "ring-white" : "ring-white/10"} bg-zinc-800`}
                    style={backgroundPreviewStyle(s.background ?? { kind: "color", value: "#27272a" })}
                >
                  {s.background?.kind === "media" && s.background.mediaType === "image" && (
                      <img src={s.background.url} alt="" className="h-full w-full object-cover" />
                  )}
                </button>
                {slides.length > 1 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemove(s.id); }}
                        className="hidden group-hover:flex absolute -top-1 -right-1 h-4 w-4 rounded-full bg-zinc-100 text-zinc-900 items-center justify-center"
                        aria-label="Remove slide"
                    >
                      <X className="h-3 w-3" />
                    </button>
                )}
              </div>
          );
        })}
        <button
            onClick={onAdd}
            className="shrink-0 h-14 w-10 rounded-md bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300"
            aria-label="Add slide"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
  );
}
