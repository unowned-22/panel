import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowUpFromLine } from "lucide-react";
import { ElementView } from "./ElementView";
import { backgroundStyle, slideFilterCss } from "../utils";
import type { CanvasElement, DrawingElement, Slide } from "../types/stories";
import { useTranslation } from "@/hooks/use-translation";

export function Canvas({
                  slide, selectedId, paintMode, onSelect, onUpdate, onDelete,
                  onSelectFile, onTextEdit, onAddDrawingStroke, onAddTextAt,
                }: {
  slide: Slide;
  selectedId: string | null;
  paintMode: boolean;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, patch: Partial<CanvasElement>, opts?: { skipHistory?: boolean }) => void;
  onDelete: (id: string) => void;
  onSelectFile: (f: File) => void;
  onTextEdit: (id: string, text: string) => void;
  onAddDrawingStroke: (stroke: DrawingElement["paths"][number]) => void;
  onAddTextAt: (x: number, y: number) => void;
}) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filterCss = useMemo(() => slideFilterCss(slide), [slide.filterId, slide.adjustments]);

  // drawing
  const drawing = useRef<{ points: { x: number; y: number }[]; color: string; size: number } | null>(null);
  const [brushColor] = useState("#ffffff");
  const [brushSize] = useState(6);

  const startDraw = (e: ReactPointerEvent) => {
    if (!paintMode || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    drawing.current = {
      points: [{ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height }],
      color: brushColor, size: brushSize,
    };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const moveDraw = (e: ReactPointerEvent) => {
    if (!paintMode || !drawing.current || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    drawing.current.points.push({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height });
    // force a re-render via state
    setLiveStroke({ ...drawing.current });
  };
  const endDraw = () => {
    if (drawing.current && drawing.current.points.length > 1) {
      onAddDrawingStroke(drawing.current);
    }
    drawing.current = null;
    setLiveStroke(null);
  };
  const [liveStroke, setLiveStroke] = useState<DrawingElement["paths"][number] | null>(null);

  const empty = !slide.background;

  return (
      <div
          className="relative mx-auto w-full max-w-70 aspect-9/16 rounded-xl overflow-hidden ring-1 ring-white/10 bg-zinc-800 select-none touch-none"
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault(); setDragOver(false);
            const f = e.dataTransfer.files?.[0]; if (f) onSelectFile(f);
          }}
      >
        {/* background layer with filter — always full-bleed, never moved/resized */}
        <div ref={ref} className="absolute inset-0" style={{ filter: filterCss, ...backgroundStyle(slide.background) }}>
          {slide.background?.kind === "media" && slide.background.mediaType === "image" && (
              <img src={slide.background.url} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
          )}
          {slide.background?.kind === "media" && slide.background.mediaType === "video" && (
              <video src={slide.background.url} className="absolute inset-0 h-full w-full object-cover" autoPlay loop muted playsInline />
          )}
          {/* vignette */}
          {slide.adjustments.vignette > 0 && (
              <div className="pointer-events-none absolute inset-0" style={{
                background: `radial-gradient(circle at center, transparent ${60 - slide.adjustments.vignette * 0.3}%, rgba(0,0,0,${slide.adjustments.vignette / 100}) 100%)`,
              }} />
          )}
          {/* noise */}
          {slide.adjustments.noise > 0 && (
              <div className="pointer-events-none absolute inset-0 mix-blend-overlay" style={{
                opacity: slide.adjustments.noise / 100,
                backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence types='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
              }} />
          )}
        </div>

        {/* empty-state upload UI */}
        {empty && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
              <div className={`flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-8 py-6 ${dragOver ? "border-white/70 bg-white/5" : "border-white/30"}`}>
                <div className="h-12 w-12 rounded-lg border-2 border-dashed border-white/50 flex items-center justify-center">
                  <ArrowUpFromLine className="h-5 w-5 text-white/80" />
                </div>
                <p className="text-sm text-zinc-200">{t('stories.editor.drag.drop.photo')}</p>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
                >{t('stories.editor.select.file')}</button>
              </div>
              <input
                  ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) onSelectFile(f); e.currentTarget.value = ""; }}
              />
            </div>
        )}

        {/* elements layer (text, stickers, draggable photos, drawings) */}
        {!empty && (
            <div
                className="absolute inset-0"
                onPointerDown={(e) => {
                  if (paintMode) { startDraw(e); return; }
                  if (e.target === e.currentTarget) onSelect(null);
                }}
                onPointerMove={moveDraw}
                onPointerUp={endDraw}
                onDoubleClick={(e) => {
                  if (paintMode) return;
                  if (e.target !== e.currentTarget) return;
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  onAddTextAt(x, y);
                }}
            >
              {[...slide.elements].sort((a, b) => a.zIndex - b.zIndex).map((el) => (
                  <ElementView
                      key={el.id}
                      element={el}
                      selected={selectedId === el.id}
                      editing={editingId === el.id}
                      onSelect={() => onSelect(el.id)}
                      onStartEdit={() => setEditingId(el.id)}
                      onStopEdit={() => setEditingId(null)}
                      onUpdate={onUpdate}
                      onDelete={() => onDelete(el.id)}
                      onTextEdit={onTextEdit}
                      containerRef={ref}
                  />
              ))}

              {/* live stroke preview */}
              {liveStroke && (
                  <svg className="absolute inset-0 pointer-events-none w-full h-full">
                    <polyline
                        points={liveStroke.points.map((p) => `${p.x * 100}%,${p.y * 100}%`).join(" ")}
                        stroke={liveStroke.color}
                        strokeWidth={liveStroke.size}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                  </svg>
              )}
            </div>
        )}

        {/* hint */}
        {!empty && !selectedId && !paintMode && (
            <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-black/60 px-3 py-2 text-center text-xs text-zinc-200">
              {t('stories.editor.hint.double.click')}
            </div>
        )}
      </div>
  );
}
