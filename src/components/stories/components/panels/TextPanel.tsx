import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { PanelHeader } from "../PanelHeader";
import { COLOR_SWATCHES, TEXT_STYLES } from "../../constants";
import type { CanvasElement, TextAlign, TextElement, TextFill, TextStyleId } from "../../types/stories";

export function TextPanel({
                     selected, onClose, onUpdate,
                   }: {
  selected: CanvasElement | null;
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<CanvasElement>, opts?: { skipHistory?: boolean }) => void;
}) {
  const text = selected?.type === "text" ? selected : null;
  return (
      <div>
        <PanelHeader title="Text" onClose={onClose} />
        {!text ? (
            <p className="p-4 text-sm text-zinc-400">Double-click a text element to edit, or use the Text tool to add one.</p>
        ) : (
            <div className="p-4 space-y-5">
              <div>
                <label className="text-xs uppercase tracking-wider text-zinc-500">Content</label>
                <textarea
                    value={text.text}
                    onChange={(e) => onUpdate(text.id, { text: e.target.value } as Partial<TextElement>, { skipHistory: true })}
                    onBlur={(e) => onUpdate(text.id, { text: e.target.value } as Partial<TextElement>)}
                    rows={2}
                    className="mt-1 w-full rounded-md bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-white/30 resize-none"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-zinc-500">Style</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {TEXT_STYLES.map((s) => (
                      <button
                          key={s.id}
                          onClick={() => onUpdate(text.id, { style: s.id as TextStyleId } as Partial<TextElement>)}
                          className={`rounded-md px-3 py-2 text-left bg-zinc-800/60 hover:bg-zinc-800 ${text.style === s.id ? "ring-2 ring-white/60" : ""}`}
                          style={{ fontFamily: s.fontFamily, fontWeight: s.weight, fontStyle: s.italic ? "italic" : "normal" }}
                      >
                        <span className="text-zinc-100">{s.label}</span>
                      </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-zinc-500">Size</label>
                <input
                    type="range" min={20} max={140} value={text.size}
                    onChange={(e) => onUpdate(text.id, { size: Number(e.target.value) } as Partial<TextElement>, { skipHistory: true })}
                    onMouseUp={() => onUpdate(text.id, {})}
                    className="w-full"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-zinc-500">Color</label>
                <div className="mt-2 grid grid-cols-7 gap-2">
                  {COLOR_SWATCHES.map((c) => (
                      <button key={c} onClick={() => onUpdate(text.id, { color: c } as Partial<TextElement>)}
                              className={`h-7 w-7 rounded-full border ${text.color === c ? "ring-2 ring-white" : "border-white/20"}`}
                              style={{ background: c }} aria-label={c}
                      />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {([
                  ["left", AlignLeft],
                  ["center", AlignCenter],
                  ["right", AlignRight],
                ] as [TextAlign, typeof AlignLeft][]).map(([a, Icon]) => (
                    <button key={a} onClick={() => onUpdate(text.id, { align: a } as Partial<TextElement>)}
                            className={`h-9 w-9 rounded-md flex items-center justify-center ${text.align === a ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5"}`}>
                      <Icon className="h-4 w-4" />
                    </button>
                ))}
                <div className="mx-2 h-6 w-px bg-white/10" />
                {(["none", "filled", "outline"] as TextFill[]).map((f) => (
                    <button key={f} onClick={() => onUpdate(text.id, { fill: f } as Partial<TextElement>)}
                            className={`h-9 px-3 rounded-md text-xs capitalize ${text.fill === f ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5"}`}>
                      {f}
                    </button>
                ))}
              </div>
            </div>
        )}
      </div>
  );
}
