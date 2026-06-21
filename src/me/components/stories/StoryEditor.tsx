import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  Type, Smile, Brush, Palette, SlidersHorizontal, Contrast,
  X, ChevronLeft, ArrowUpFromLine, Undo2, Redo2, Trash2, Plus,
  Lock, MoreHorizontal, Clock, Megaphone, Check, Link as LinkIcon,
  Eraser, AlignLeft, AlignCenter, AlignRight, Maximize2,
} from "lucide-react";
import {
  BACKGROUND_PRESETS, COLOR_SWATCHES, FILTERS, STICKERS, TEXT_STYLES,
} from "./storyConstants";
import {
  defaultAdjustments,
  type Adjustments, type Background, type CanvasElement, type Duration,
  type Slide, type StoryState, type TextAlign, type TextElement,
  type TextFill, type TextStyleId, type Visibility, type StickerElement,
  type DrawingElement,
} from "./storyTypes";

const uid = () => Math.random().toString(36).slice(2, 10);

function makeSlide(background: Background | null = null): Slide {
  return {
    id: uid(),
    background,
    filterId: "original",
    adjustments: { ...defaultAdjustments },
    elements: [],
  };
}

function initialState(): StoryState {
  const s = makeSlide();
  return {
    slides: [s],
    activeSlideId: s.id,
    selectedElementId: null,
    visibility: "everyone",
    duration: 24,
    hiddenFrom: [],
  };
}

type Tool = null | "text" | "stickers" | "paint" | "background" | "filters" | "color";

// ─────────────────────────────────────────────────────────────────────────────
// History (undo/redo)
function useHistory(initial: StoryState) {
  const [past, setPast] = useState<StoryState[]>([]);
  const [present, setPresent] = useState<StoryState>(initial);
  const [future, setFuture] = useState<StoryState[]>([]);

  const set = useCallback((updater: (s: StoryState) => StoryState, opts?: { skipHistory?: boolean }) => {
    setPresent((prev) => {
      const next = updater(prev);
      if (next === prev) return prev;
      if (!opts?.skipHistory) {
        setPast((p) => [...p.slice(-49), prev]);
        setFuture([]);
      }
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setPast((p) => {
      if (!p.length) return p;
      const prev = p[p.length - 1];
      setFuture((f) => [present, ...f]);
      setPresent(prev);
      return p.slice(0, -1);
    });
  }, [present]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (!f.length) return f;
      const [next, ...rest] = f;
      setPast((p) => [...p, present]);
      setPresent(next);
      return rest;
    });
  }, [present]);

  return { state: present, set, undo, redo, canUndo: past.length > 0, canRedo: future.length > 0 };
}

// ─────────────────────────────────────────────────────────────────────────────
function adjustmentsToFilter(a: Adjustments): string {
  const warmthHue = (a.warmth / 100) * 15; // -15..15
  const parts = [
    `contrast(${a.contrast}%)`,
    `saturate(${a.saturation}%)`,
    `hue-rotate(${warmthHue}deg)`,
  ];
  if (a.sharpness > 0) parts.push(`contrast(${100 + a.sharpness * 0.3}%)`);
  return parts.join(" ");
}

function backgroundStyle(bg: Background | null): CSSProperties {
  if (!bg) return { background: "#1f2937" };
  if (bg.kind === "color") return { background: bg.value };
  if (bg.kind === "gradient") return { background: bg.value };
  if (bg.kind === "pattern") return { background: bg.value, backgroundSize: "cover" };
  if (bg.kind === "media") return {};
  return {};
}

function backgroundPreviewStyle(bg: Background): CSSProperties {
  if (bg.kind === "color") return { background: bg.value };
  if (bg.kind === "gradient") return { background: bg.value };
  if (bg.kind === "pattern") return { background: bg.value, backgroundSize: "cover" };
  return {};
}

// ─────────────────────────────────────────────────────────────────────────────
export default function StoryEditor({ onClose, onPublish }: { onClose: () => void; onPublish: (s: StoryState) => void | Promise<void> }) {
  const { state, set, undo, redo, canUndo, canRedo } = useHistory(initialState());
  const [tool, setTool] = useState<Tool>(null);
  const [audienceOpen, setAudienceOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const activeSlide = state.slides.find((s) => s.id === state.activeSlideId)!;
  const selected = activeSlide.elements.find((e) => e.id === state.selectedElementId) ?? null;

  const updateSlide = useCallback((fn: (s: Slide) => Slide, opts?: { skipHistory?: boolean }) => {
    set((prev) => ({
      ...prev,
      slides: prev.slides.map((s) => (s.id === prev.activeSlideId ? fn(s) : s)),
    }), opts);
  }, [set]);

  const addSlide = useCallback(() => {
    const s = makeSlide();
    set((prev) => ({ ...prev, slides: [...prev.slides, s], activeSlideId: s.id, selectedElementId: null }));
  }, [set]);

  const selectSlide = useCallback((id: string) => {
    set((prev) => ({ ...prev, activeSlideId: id, selectedElementId: null }), { skipHistory: true });
  }, [set]);

  const removeSlide = useCallback((id: string) => {
    set((prev) => {
      if (prev.slides.length <= 1) return prev;
      const slides = prev.slides.filter((s) => s.id !== id);
      const activeSlideId = prev.activeSlideId === id ? slides[0].id : prev.activeSlideId;
      return { ...prev, slides, activeSlideId, selectedElementId: null };
    });
  }, [set]);

  const setSelected = useCallback((id: string | null) => {
    set((prev) => ({ ...prev, selectedElementId: id }), { skipHistory: true });
  }, [set]);

  // upload
  const handleFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const mediaType: "image" | "video" = file.type.startsWith("video") ? "video" : "image";
    updateSlide((s) => ({ ...s, background: { kind: "media", url, mediaType } }));
  }, [updateSlide]);

  // element ops
  const addText = useCallback(() => {
    const el: TextElement = {
      id: uid(), type: "text", x: 50, y: 50, width: 70, rotation: 0,
      zIndex: nextZ(activeSlide), text: "Tap to edit",
      style: "modern", size: 56, color: "#111111", align: "center", fill: "none",
    };
    updateSlide((s) => ({ ...s, elements: [...s.elements, el] }));
    setSelected(el.id);
    setTool("text");
  }, [updateSlide, activeSlide, setSelected]);

  const addSticker = useCallback((emoji: string) => {
    const el: StickerElement = {
      id: uid(), type: "sticker", x: 50, y: 50, width: 25, rotation: 0,
      zIndex: nextZ(activeSlide), emoji,
    };
    updateSlide((s) => ({ ...s, elements: [...s.elements, el] }));
    setSelected(el.id);
  }, [updateSlide, activeSlide, setSelected]);

  const updateElement = useCallback((id: string, patch: Partial<CanvasElement>, opts?: { skipHistory?: boolean }) => {
    updateSlide((s) => ({
      ...s,
      elements: s.elements.map((e) => (e.id === id ? ({ ...e, ...patch } as CanvasElement) : e)),
    }), opts);
  }, [updateSlide]);

  const deleteElement = useCallback((id: string) => {
    updateSlide((s) => ({ ...s, elements: s.elements.filter((e) => e.id !== id) }));
    setSelected(null);
  }, [updateSlide, setSelected]);

  const bringForward = useCallback((id: string) => {
    updateSlide((s) => {
      const max = Math.max(0, ...s.elements.map((e) => e.zIndex));
      return { ...s, elements: s.elements.map((e) => e.id === id ? { ...e, zIndex: max + 1 } as CanvasElement : e) };
    });
  }, [updateSlide]);

  const sendBackward = useCallback((id: string) => {
    updateSlide((s) => {
      const min = Math.min(0, ...s.elements.map((e) => e.zIndex));
      return { ...s, elements: s.elements.map((e) => e.id === id ? { ...e, zIndex: min - 1 } as CanvasElement : e) };
    });
  }, [updateSlide]);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (tool) setTool(null);
        else if (state.selectedElementId) setSelected(null);
        else onClose();
      }
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((meta && e.key.toLowerCase() === "z" && e.shiftKey) || (meta && e.key.toLowerCase() === "y")) { e.preventDefault(); redo(); }
      if ((e.key === "Backspace" || e.key === "Delete") && state.selectedElementId) {
        const t = e.target as HTMLElement;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
        deleteElement(state.selectedElementId);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tool, state.selectedElementId, undo, redo, deleteElement, onClose, setSelected]);

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6">
        <button
            onClick={onClose}
            className="absolute right-4 top-4 sm:right-6 sm:top-6 h-10 w-10 rounded-full bg-zinc-800/90 text-zinc-200 hover:bg-zinc-700 flex items-center justify-center shadow-lg"
            aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative w-full max-w-3xl rounded-2xl bg-zinc-900 text-zinc-100 shadow-2xl ring-1 ring-white/5 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_300px]">
            {/* LEFT: canvas area */}
            <div className="p-4 sm:p-5 flex flex-col gap-3">
              <div className="flex items-center justify-center gap-3 text-zinc-400">
                <button onClick={undo} disabled={!canUndo} className="p-2 rounded-md hover:bg-white/5 disabled:opacity-30">
                  <Undo2 className="h-5 w-5" />
                </button>
                <button onClick={redo} disabled={!canRedo} className="p-2 rounded-md hover:bg-white/5 disabled:opacity-30">
                  <Redo2 className="h-5 w-5" />
                </button>
              </div>

              <Canvas
                  slide={activeSlide}
                  selectedId={state.selectedElementId}
                  paintMode={tool === "paint"}
                  onSelect={setSelected}
                  onUpdate={updateElement}
                  onDelete={deleteElement}
                  onSelectFile={handleFile}
                  onPickBackground={() => setTool("background")}
                  onTextEdit={(id, text) => updateElement(id, { text } as Partial<TextElement>, { skipHistory: true })}
                  onAddDrawingStroke={(stroke) => {
                    updateSlide((s) => {
                      const existing = s.elements.find((e) => e.type === "drawing") as DrawingElement | undefined;
                      if (existing) {
                        return {
                          ...s,
                          elements: s.elements.map((e) =>
                              e.id === existing.id ? { ...existing, paths: [...existing.paths, stroke] } : e
                          ),
                        };
                      }
                      const el: DrawingElement = { id: uid(), type: "drawing", zIndex: nextZ(s), paths: [stroke] };
                      return { ...s, elements: [...s.elements, el] };
                    });
                  }}
                  onAddTextAt={(x, y) => {
                    const el: TextElement = {
                      id: uid(), type: "text", x, y, width: 60, rotation: 0,
                      zIndex: nextZ(activeSlide), text: "Enter text",
                      style: "modern", size: 48, color: "#ffffff", align: "center", fill: "none",
                    };
                    updateSlide((s) => ({ ...s, elements: [...s.elements, el] }));
                    setSelected(el.id);
                  }}
              />

              <SlideStrip
                  slides={state.slides}
                  activeId={state.activeSlideId}
                  onSelect={selectSlide}
                  onAdd={addSlide}
                  onRemove={removeSlide}
              />
            </div>

            {/* RIGHT: tools + footer */}
            <aside className="bg-zinc-950/60 border-l border-white/5 flex flex-col">
              <div className="flex-1 flex min-h-0">
                <Toolbar tool={tool} onPick={(t) => {
                  if (t === "text") { addText(); return; }
                  setTool(tool === t ? null : t);
                }} />

                <div className="flex-1 min-w-0 overflow-y-auto">
                  {tool === null && <DefaultMenu onPick={(t) => {
                    if (t === "text") { addText(); return; }
                    setTool(t);
                  }} />}
                  {tool === "text" && <TextPanel selected={selected} onClose={() => setTool(null)} onUpdate={updateElement} />}
                  {tool === "stickers" && <StickersPanel onAdd={addSticker} onClose={() => setTool(null)} />}
                  {tool === "paint" && <PaintbrushPanel onClose={() => setTool(null)} onClear={() => updateSlide((s) => ({ ...s, elements: s.elements.filter((e) => e.type !== "drawing") }))} />}
                  {tool === "background" && (
                      <BackgroundPanel
                          selected={activeSlide.background}
                          onClose={() => setTool(null)}
                          onPick={(bg) => updateSlide((s) => ({ ...s, background: bg }))}
                      />
                  )}
                  {tool === "filters" && (
                      <FiltersPanel
                          selectedId={activeSlide.filterId}
                          background={activeSlide.background}
                          onClose={() => setTool(null)}
                          onPick={(id) => updateSlide((s) => ({ ...s, filterId: id }))}
                      />
                  )}
                  {tool === "color" && (
                      <ColorCorrectionPanel
                          adjustments={activeSlide.adjustments}
                          onClose={() => setTool(null)}
                          onChange={(a) => updateSlide((s) => ({ ...s, adjustments: a }), { skipHistory: true })}
                          onCommit={(a) => updateSlide((s) => ({ ...s, adjustments: a }))}
                      />
                  )}
                </div>
              </div>

              <FooterControls
                  state={state}
                  audienceOpen={audienceOpen} setAudienceOpen={setAudienceOpen}
                  moreOpen={moreOpen} setMoreOpen={setMoreOpen}
                  onSetVisibility={(v) => set((p) => ({ ...p, visibility: v }))}
                  onSetDuration={(d) => set((p) => ({ ...p, duration: d }))}
                  onPublish={() => onPublish(state)}
                  selected={selected}
                  onBringForward={bringForward}
                  onSendBackward={sendBackward}
              />
            </aside>
          </div>
        </div>
      </div>
  );
}

function nextZ(s: Slide) {
  return (s.elements.length ? Math.max(...s.elements.map((e) => e.zIndex)) : 0) + 1;
}

// ─────────────────────────────────────────────────────────────────────────────
function Canvas({
                  slide, selectedId, paintMode, onSelect, onUpdate, onDelete,
                  onSelectFile, onPickBackground, onTextEdit, onAddDrawingStroke, onAddTextAt,
                }: {
  slide: Slide;
  selectedId: string | null;
  paintMode: boolean;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, patch: Partial<CanvasElement>, opts?: { skipHistory?: boolean }) => void;
  onDelete: (id: string) => void;
  onSelectFile: (f: File) => void;
  onPickBackground: () => void;
  onTextEdit: (id: string, text: string) => void;
  onAddDrawingStroke: (stroke: DrawingElement["paths"][number]) => void;
  onAddTextAt: (x: number, y: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filterCss = useMemo(() => {
    const preset = FILTERS.find((f) => f.id === slide.filterId)?.css ?? "none";
    const adj = adjustmentsToFilter(slide.adjustments);
    return [preset === "none" ? "" : preset, adj].filter(Boolean).join(" ");
  }, [slide.filterId, slide.adjustments]);

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
          className="relative mx-auto w-full max-w-[280px] aspect-[9/16] rounded-xl overflow-hidden ring-1 ring-white/10 bg-zinc-800 select-none touch-none"
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault(); setDragOver(false);
            const f = e.dataTransfer.files?.[0]; if (f) onSelectFile(f);
          }}
      >
        {/* background layer with filter */}
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
                backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
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
                <p className="text-sm text-zinc-200">Drag and drop photo or video here</p>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
                >Select file</button>
                <button onClick={onPickBackground} className="text-sm font-medium text-zinc-200 hover:text-white">Select background</button>
              </div>
              <input
                  ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) onSelectFile(f); e.currentTarget.value = ""; }}
              />
            </div>
        )}

        {/* elements layer */}
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
              To add text, double click any free space — or use the Text tool
            </div>
        )}
      </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function ElementView({
                       element, selected, editing, onSelect, onStartEdit, onStopEdit,
                       onUpdate, onDelete, onTextEdit, containerRef,
                     }: {
  element: CanvasElement;
  selected: boolean;
  editing: boolean;
  onSelect: () => void;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onUpdate: (id: string, patch: Partial<CanvasElement>, opts?: { skipHistory?: boolean }) => void;
  onDelete: () => void;
  onTextEdit: (id: string, text: string) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; w: number } | null>(null);

  // drawing element renders as svg, not draggable (hooks above to keep Rules of Hooks happy)
  if (element.type === "drawing") {
    return (
        <svg className="absolute inset-0 pointer-events-none w-full h-full" style={{ zIndex: element.zIndex }}>
          {element.paths.map((p, i) => (
              <polyline
                  key={i}
                  points={p.points.map((pt) => `${pt.x * 100}%,${pt.y * 100}%`).join(" ")}
                  stroke={p.color} strokeWidth={p.size} fill="none"
                  strokeLinecap="round" strokeLinejoin="round"
              />
          ))}
        </svg>
    );
  }

  const onDragStart = (e: ReactPointerEvent) => {
    if (editing) return;
    e.stopPropagation();
    onSelect();
    dragRef.current = { startX: e.clientX, startY: e.clientY, ox: element.x, oy: element.y };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onDragMove = (e: ReactPointerEvent) => {
    if (!dragRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragRef.current.startX) / rect.width) * 100;
    const dy = ((e.clientY - dragRef.current.startY) / rect.height) * 100;
    onUpdate(element.id, { x: Math.max(0, Math.min(100, dragRef.current.ox + dx)),
      y: Math.max(0, Math.min(100, dragRef.current.oy + dy)) } as Partial<CanvasElement>, { skipHistory: true });
  };
  const onDragEnd = () => { if (dragRef.current) { dragRef.current = null; onUpdate(element.id, {}, {}); } };

  const startResize = (e: ReactPointerEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    resizeRef.current = { startX: e.clientX, startY: e.clientY, w: element.width };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const moveResize = (e: ReactPointerEvent) => {
    if (!resizeRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - resizeRef.current.startX) / rect.width) * 100;
    const w = Math.max(8, Math.min(100, resizeRef.current.w + dx * 2));
    onUpdate(element.id, { width: w } as Partial<CanvasElement>, { skipHistory: true });
  };
  const endResize = () => { if (resizeRef.current) { resizeRef.current = null; onUpdate(element.id, {}, {}); } };

  const baseStyle: CSSProperties = {
    position: "absolute",
    left: `${element.x}%`,
    top: `${element.y}%`,
    transform: `translate(-50%, -50%) rotate(${element.rotation}deg)`,
    width: `${element.width}%`,
    zIndex: element.zIndex,
  };

  return (
      <div
          style={baseStyle}
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          onDoubleClick={(e) => { e.stopPropagation(); if (element.type === "text") onStartEdit(); }}
          className="group cursor-move"
      >
        {element.type === "text" && <TextRender element={element} editing={editing} onCommit={(t) => { onTextEdit(element.id, t); onStopEdit(); }} />}
        {element.type === "sticker" && <StickerRender element={element} />}

        {selected && (
            <>
              <div className="pointer-events-none absolute inset-0 ring-2 ring-white/70 rounded-md" />
              {[
                ["-top-1.5 -left-1.5", "cursor-nwse-resize"],
                ["-top-1.5 -right-1.5", "cursor-nesw-resize"],
                ["-bottom-1.5 -left-1.5", "cursor-nesw-resize"],
                ["-bottom-1.5 -right-1.5", "cursor-nwse-resize"],
              ].map(([pos, cur], i) => (
                  <div
                      key={i}
                      className={`absolute h-3 w-3 rounded-sm bg-white border border-zinc-400 ${pos} ${cur}`}
                      onPointerDown={startResize}
                      onPointerMove={moveResize}
                      onPointerUp={endResize}
                  />
              ))}
              <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="absolute left-1/2 -translate-x-1/2 -bottom-12 h-9 w-9 rounded-full bg-zinc-100 text-zinc-900 hover:bg-white shadow flex items-center justify-center"
                  aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
        )}
      </div>
  );
}

function TextRender({ element, editing, onCommit }: { element: TextElement; editing: boolean; onCommit: (t: string) => void }) {
  const spec = TEXT_STYLES.find((s) => s.id === element.style)!;
  const baseStyle: CSSProperties = {
    fontFamily: spec.fontFamily,
    fontWeight: spec.weight,
    fontStyle: spec.italic ? "italic" : "normal",
    letterSpacing: spec.letterSpacing,
    textTransform: spec.textTransform,
    fontSize: `${element.size / 1.2}px`,
    textAlign: element.align,
    color: element.fill === "outline" ? "transparent" : element.color,
    WebkitTextStroke: element.fill === "outline" ? `1.5px ${element.color}` : undefined,
    background: element.fill === "filled" ? element.color : "transparent",
    padding: element.fill === "filled" ? "0.15em 0.4em" : 0,
    borderRadius: element.fill === "filled" ? "0.3em" : 0,
    lineHeight: 1.15,
    wordBreak: "break-word",
    width: "100%",
  };

  if (editing) {
    return (
        <textarea
            autoFocus
            defaultValue={element.text}
            onBlur={(e) => onCommit(e.target.value || " ")}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); (e.target as HTMLTextAreaElement).blur(); } }}
            className="w-full bg-transparent outline-none resize-none"
            style={{ ...baseStyle, padding: baseStyle.padding ?? "0.15em 0.4em" }}
        />
    );
  }
  return <div style={baseStyle}>{element.text}</div>;
}

function StickerRender({ element }: { element: StickerElement }) {
  return (
      <div className="flex items-center justify-center" style={{ fontSize: "min(20vw, 120px)" }}>
        <span style={{ fontSize: "1em", lineHeight: 1 }}>{element.emoji}</span>
        {element.link && (
            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center">
          <LinkIcon className="h-3 w-3" />
        </span>
        )}
      </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function SlideStrip({
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

// ─────────────────────────────────────────────────────────────────────────────
function Toolbar({ tool, onPick }: { tool: Tool; onPick: (t: NonNullable<Tool>) => void }) {
  const items: { id: NonNullable<Tool>; icon: typeof Type }[] = [
    { id: "text", icon: Type },
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

function DefaultMenu({ onPick }: { onPick: (t: NonNullable<Tool>) => void }) {
  const items: { id: NonNullable<Tool>; label: string; icon: typeof Type }[] = [
    { id: "text", label: "Text", icon: Type },
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

function PanelHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <button onClick={onClose} className="p-1 rounded hover:bg-white/5 text-zinc-300"><ChevronLeft className="h-5 w-5" /></button>
        <h3 className="text-base font-semibold text-zinc-100">{title}</h3>
      </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function TextPanel({
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

// ─────────────────────────────────────────────────────────────────────────────
function StickersPanel({ onAdd, onClose }: { onAdd: (emoji: string) => void; onClose: () => void }) {
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

// ─────────────────────────────────────────────────────────────────────────────
function PaintbrushPanel({ onClose, onClear }: { onClose: () => void; onClear: () => void }) {
  return (
      <div>
        <PanelHeader title="Paintbrush" onClose={onClose} />
        <div className="p-4 space-y-4 text-sm text-zinc-300">
          <p>Draw freehand on the canvas. Strokes apply to this slide.</p>
          <button onClick={onClear} className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 hover:bg-zinc-700">
            <Eraser className="h-4 w-4" /> Clear drawings
          </button>
          <p className="text-xs text-zinc-500">Brush color and size are fixed in this prototype.</p>
        </div>
      </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function BackgroundPanel({
                           selected, onClose, onPick,
                         }: { selected: Background | null; onClose: () => void; onPick: (bg: Background) => void }) {
  const isEqual = (a: Background | null, b: Background) =>
      a && a.kind === b.kind && (a as { value?: string }).value === (b as { value?: string }).value;
  return (
      <div>
        <PanelHeader title="Background" onClose={onClose} />
        <div className="p-4 space-y-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Background</p>
            <div className="grid grid-cols-6 gap-2">
              {BACKGROUND_PRESETS.map((bg, i) => (
                  <button key={i} onClick={() => onPick(bg)}
                          className={`aspect-square rounded-lg overflow-hidden ${isEqual(selected, bg) ? "ring-2 ring-white" : "ring-1 ring-white/10"}`}
                          style={backgroundPreviewStyle(bg)} aria-label="background"
                  />
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Color</p>
            <div className="grid grid-cols-6 gap-2">
              {COLOR_SWATCHES.map((c) => {
                const bg: Background = { kind: "color", value: c };
                return (
                    <button key={c} onClick={() => onPick(bg)}
                            className={`aspect-square rounded-lg ${isEqual(selected, bg) ? "ring-2 ring-white" : "ring-1 ring-white/10"}`}
                            style={{ background: c }} aria-label={c}
                    />
                );
              })}
            </div>
          </div>
        </div>
      </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function FiltersPanel({
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

// ─────────────────────────────────────────────────────────────────────────────
function ColorCorrectionPanel({
                                adjustments, onClose, onChange, onCommit,
                              }: {
  adjustments: Adjustments; onClose: () => void;
  onChange: (a: Adjustments) => void; onCommit: (a: Adjustments) => void;
}) {
  const sliders: { key: keyof Adjustments; label: string; min: number; max: number; def: number }[] = [
    { key: "contrast",   label: "Contrast",   min: 50,   max: 150, def: 100 },
    { key: "warmth",     label: "Warmth",     min: -100, max: 100, def: 0 },
    { key: "saturation", label: "Saturation", min: 0,    max: 200, def: 100 },
    { key: "sharpness",  label: "Sharpness",  min: 0,    max: 100, def: 0 },
    { key: "noise",      label: "Noise",      min: 0,    max: 100, def: 0 },
    { key: "vignette",   label: "Vignette",   min: 0,    max: 100, def: 0 },
  ];
  return (
      <div>
        <PanelHeader title="Color correction" onClose={onClose} />
        <div className="p-4 space-y-4">
          {sliders.map((s) => (
              <div key={s.key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-zinc-200">{s.label}</span>
                  <span className="text-xs text-zinc-500 tabular-nums">{adjustments[s.key]}</span>
                </div>
                <input
                    type="range" min={s.min} max={s.max} value={adjustments[s.key]}
                    onChange={(e) => onChange({ ...adjustments, [s.key]: Number(e.target.value) })}
                    onMouseUp={() => onCommit(adjustments)}
                    onTouchEnd={() => onCommit(adjustments)}
                    className="w-full"
                />
              </div>
          ))}
        </div>
      </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function FooterControls({
                          state, audienceOpen, setAudienceOpen, moreOpen, setMoreOpen,
                          onSetVisibility, onSetDuration, onPublish,
                          selected, onBringForward, onSendBackward,
                        }: {
  state: StoryState;
  audienceOpen: boolean; setAudienceOpen: (b: boolean) => void;
  moreOpen: boolean; setMoreOpen: (b: boolean) => void;
  onSetVisibility: (v: Visibility) => void;
  onSetDuration: (d: Duration) => void;
  onPublish: () => void;
  selected: CanvasElement | null;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
}) {
  const visLabel = state.visibility === "everyone" ? "Everyone" : state.visibility === "friends" ? "Friends" : "Close friends";
  const activeSlide = state.slides.find((s) => s.id === state.activeSlideId)!;
  const canPublish = state.slides.some((s) => s.background || s.elements.length > 0);

  return (
      <div className="border-t border-white/5 p-3 space-y-2 relative">
        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => { setAudienceOpen(!audienceOpen); setMoreOpen(false); }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/5 text-zinc-200">
              <Lock className="h-4 w-4 text-zinc-400" /> <span className="text-sm">{visLabel}</span>
            </button>
            {audienceOpen && (
                <div className="absolute bottom-full mb-2 left-0 w-56 rounded-lg bg-zinc-900 ring-1 ring-white/10 shadow-xl p-1 z-10">
                  {([
                    ["everyone", "Everyone"],
                    ["friends", "Friends"],
                    ["close", "Close friends"],
                  ] as [Visibility, string][]).map(([v, label]) => (
                      <button key={v} onClick={() => { onSetVisibility(v); setAudienceOpen(false); }}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-white/5 text-sm">
                        <span>{label}</span>
                        {state.visibility === v && <Check className="h-4 w-4 text-sky-400" />}
                      </button>
                  ))}
                </div>
            )}
          </div>

          <div className="relative ml-auto">
            <button onClick={() => { setMoreOpen(!moreOpen); setAudienceOpen(false); }}
                    className="h-9 w-9 rounded-lg hover:bg-white/5 text-zinc-300 flex items-center justify-center">
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {moreOpen && (
                <div className="absolute bottom-full mb-2 right-0 w-64 rounded-lg bg-zinc-900 ring-1 ring-white/10 shadow-xl p-2 z-10 space-y-1">
                  <div className="px-2 py-1.5 text-xs uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                    <Clock className="h-3 w-3" /> Time shown
                  </div>
                  {([1, 12, 24, 48] as Duration[]).map((d) => (
                      <button key={d} onClick={() => onSetDuration(d)}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-white/5 text-sm">
                        <span>{d} {d === 1 ? "hour" : "hours"}</span>
                        {state.duration === d && <Check className="h-4 w-4 text-sky-400" />}
                      </button>
                  ))}
                  <div className="h-px bg-white/5 my-1" />
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5 text-sm text-zinc-200">
                    <Megaphone className="h-4 w-4 text-zinc-400" /> Tag as ad
                  </button>
                  {selected && selected.type !== "drawing" && (
                      <>
                        <div className="h-px bg-white/5 my-1" />
                        <button onClick={() => onBringForward(selected.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5 text-sm">
                          <Maximize2 className="h-4 w-4 text-zinc-400" /> Bring forward
                        </button>
                        <button onClick={() => onSendBackward(selected.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5 text-sm">
                          <Maximize2 className="h-4 w-4 text-zinc-400 rotate-180" /> Send backward
                        </button>
                      </>
                  )}
                </div>
            )}
          </div>
        </div>

        <button
            onClick={onPublish} disabled={!canPublish}
            className="w-full rounded-lg bg-zinc-200 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Publish
        </button>

        {/* tiny status row */}
        <p className="text-[11px] text-zinc-500 text-center">
          Slide {state.slides.findIndex((s) => s.id === activeSlide.id) + 1} of {state.slides.length} · Expires in {state.duration}h
        </p>
      </div>
  );
}