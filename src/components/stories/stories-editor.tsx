import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { Undo2, Redo2, X } from "lucide-react";
import { Toolbar } from "./components/Toolbar";
import { DefaultMenu } from "./components/DefaultMenu";
import { Canvas } from "./components/Canvas";
import { SlideStrip } from "./components/SlideStrip";
import { FooterControls } from "./components/FooterControls";
import { TextPanel } from "./components/panels/TextPanel";
import { StickersPanel } from "./components/panels/StickersPanel";
import { PaintbrushPanel } from "./components/panels/PaintbrushPanel";
import { BackgroundPanel } from "./components/panels/BackgroundPanel";
import { FiltersPanel } from "./components/panels/FiltersPanel";
import { ColorCorrectionPanel } from "./components/panels/ColorCorrectionPanel";
import { uid, nextZ, widthPercentToHeightPercent, loadImageNaturalRatio } from "./utils";
import type { Tool } from "./types/editor";
import {
    defaultAdjustments,
    type Background, type CanvasElement,
    type DrawingElement, type ImageElement, type Slide, type StickerElement,
    type StoryState, type TextElement,
} from "./types/stories";

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
export function StoriesEditor({ onClose, onPublish }: { onClose: () => void; onPublish: (s: StoryState) => void | Promise<void> }) {
    const { state, set, undo, redo, canUndo, canRedo } = useHistory(initialState());
    const [tool, setTool] = useState<Tool>(null);
    const [audienceOpen, setAudienceOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);

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

    // Background upload: always fills the whole slide and can't be moved/resized.
    const handleBackgroundFile = useCallback((file: File) => {
        const url = URL.createObjectURL(file);
        const mediaType: "image" | "video" = file.type.startsWith("video") ? "video" : "image";
        updateSlide((s) => ({ ...s, background: { kind: "media", url, mediaType } }));
    }, [updateSlide]);

    // Photo upload: added as a free-floating element on top of the slide —
    // draggable, resizable (aspect-locked) and rotatable, with its own delete button.
    const addImageElement = useCallback(async (file: File) => {
        const url = URL.createObjectURL(file);
        const naturalRatio = await loadImageNaturalRatio(url);
        const width = 55;
        const height = Math.min(95, widthPercentToHeightPercent(width, naturalRatio));
        const el: ImageElement = {
            id: uid(), type: "image", x: 50, y: 50, width, height, rotation: 0,
            zIndex: nextZ(activeSlide), url, naturalRatio,
        };
        updateSlide((s) => ({ ...s, elements: [...s.elements, el] }));
        setSelected(el.id);
    }, [updateSlide, activeSlide, setSelected]);

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

    // toolbar/menu dispatch: some tools are instant actions, others open a panel
    const handlePickTool = useCallback((t: NonNullable<Tool>) => {
        if (t === "text") { addText(); return; }
        if (t === "photo") { photoInputRef.current?.click(); return; }
        setTool((prev) => (prev === t ? null : t));
    }, [addText]);

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

            {/* hidden input for the "Photo" tool — adds a movable overlay, never the background */}
            <input
                ref={photoInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) addImageElement(f); e.currentTarget.value = ""; }}
            />

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
                            onSelectFile={handleBackgroundFile}
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
                            <Toolbar tool={tool} onPick={handlePickTool} />

                            <div className="flex-1 min-w-0 overflow-y-auto">
                                {tool === null && <DefaultMenu onPick={handlePickTool} />}
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
