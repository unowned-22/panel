import { useState } from "react";
import { Link as LinkIcon } from "lucide-react";
import { PanelHeader } from "../PanelHeader";
import { STICKERS } from "../../constants";

export function StickersPanel({ onAdd, onClose }: { onAdd: (emoji: string) => void; onClose: () => void }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [activeCat, setActiveCat] = useState(STICKERS[0].category);
  const cat = STICKERS.find((c) => c.category === activeCat)!;
  return (
      <div>
        <PanelHeader title="Stickers" onClose={onClose} />
        <div className="p-4 space-y-4">
          <button onClick={() => setLinkOpen((v) => !v)} className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm">
            <LinkIcon className="h-4 w-4" /> Add link
          </button>
          {linkOpen && (
              <div className="flex gap-2">
                <input
                    value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://"
                    className="flex-1 rounded-md bg-zinc-800 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/30"
                />
                <button onClick={() => { if (linkUrl) { onAdd("🔗"); setLinkUrl(""); setLinkOpen(false); } }}
                        className="rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900">Add</button>
              </div>
          )}

          <div className="flex gap-1 overflow-x-auto pb-1">
            {STICKERS.map((c) => (
                <button key={c.category} onClick={() => setActiveCat(c.category)}
                        className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${activeCat === c.category ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5"}`}>
                  {c.category}
                </button>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-2">
            {cat.items.map((e) => (
                <button key={e} onClick={() => onAdd(e)}
                        className="aspect-square rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-3xl flex items-center justify-center">
                  {e}
                </button>
            ))}
          </div>
        </div>
      </div>
  );
}
