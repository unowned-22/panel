import { PanelHeader } from "../PanelHeader";
import { backgroundStyle } from "../../utils";
import { FILTERS } from "../../constants";
import type { Background } from "../../types/stories";

export function FiltersPanel({
                        selectedId, background, onClose, onPick,
                      }: {
  selectedId: string; background: Background | null;
  onClose: () => void; onPick: (id: string) => void;
}) {
  return (
      <div>
        <PanelHeader title="Filters" onClose={onClose} />
        <div className="p-4 grid grid-cols-3 gap-3">
          {FILTERS.map((f) => (
              <button key={f.id} onClick={() => onPick(f.id)} className="space-y-1">
                <div
                    className={`aspect-square rounded-lg overflow-hidden ${selectedId === f.id ? "ring-2 ring-white" : "ring-1 ring-white/10"}`}
                    style={{ ...backgroundStyle(background), filter: f.css === "none" ? undefined : f.css }}
                >
                  {background?.kind === "media" && background.mediaType === "image" && (
                      <img src={background.url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <p className="text-xs text-center text-zinc-300">{f.name}</p>
              </button>
          ))}
        </div>
      </div>
  );
}
