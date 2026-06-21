import { useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { RotateCw, Trash2 } from "lucide-react";
import { TextRender, StickerRender, ImageRender } from "./ElementRenders";
import type { CanvasElement, TextElement } from "../types/stories";

export function ElementView({
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
  const resizeRef = useRef<{ startX: number; startY: number; w: number; h: number } | null>(null);
  const rotateRef = useRef<{ startAngle: number; startRotation: number } | null>(null);

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

  const isImage = element.type === "image";

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

  // Resize: text/stickers only carry a width (height follows content), images
  // carry both width and height and must keep their aspect ratio.
  const startResize = (e: ReactPointerEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    resizeRef.current = {
      startX: e.clientX, startY: e.clientY,
      w: element.width,
      h: isImage ? (element as { height: number }).height : 0,
    };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const moveResize = (e: ReactPointerEvent) => {
    if (!resizeRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - resizeRef.current.startX) / rect.width) * 100;
    const w = Math.max(8, Math.min(150, resizeRef.current.w + dx * 2));
    if (isImage) {
      const ratio = w / resizeRef.current.w;
      const h = Math.max(4, resizeRef.current.h * ratio);
      onUpdate(element.id, { width: w, height: h } as Partial<CanvasElement>, { skipHistory: true });
    } else {
      onUpdate(element.id, { width: w } as Partial<CanvasElement>, { skipHistory: true });
    }
  };
  const endResize = () => { if (resizeRef.current) { resizeRef.current = null; onUpdate(element.id, {}, {}); } };

  // Rotate: drag a handle around the element's center to spin it freely,
  // same gesture as the corner-drag rotate in most story editors.
  const startRotate = (e: ReactPointerEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + (element.x / 100) * rect.width;
    const cy = rect.top + (element.y / 100) * rect.height;
    const angle = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;
    rotateRef.current = { startAngle: angle, startRotation: element.rotation };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const moveRotate = (e: ReactPointerEvent) => {
    if (!rotateRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + (element.x / 100) * rect.width;
    const cy = rect.top + (element.y / 100) * rect.height;
    const angle = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;
    const delta = angle - rotateRef.current.startAngle;
    onUpdate(element.id, { rotation: rotateRef.current.startRotation + delta } as Partial<CanvasElement>, { skipHistory: true });
  };
  const endRotate = () => { if (rotateRef.current) { rotateRef.current = null; onUpdate(element.id, {}, {}); } };

  const baseStyle: CSSProperties = {
    position: "absolute",
    left: `${element.x}%`,
    top: `${element.y}%`,
    transform: `translate(-50%, -50%) rotate(${element.rotation}deg)`,
    width: `${element.width}%`,
    height: isImage ? `${(element as { height: number }).height}%` : undefined,
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
        {element.type === "text" && <TextRender element={element as TextElement} editing={editing} onCommit={(t) => { onTextEdit(element.id, t); onStopEdit(); }} />}
        {element.type === "sticker" && <StickerRender element={element} />}
        {element.type === "image" && <ImageRender element={element} />}

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
              {/* rotate handle */}
              <div
                  className="absolute -top-9 left-1/2 -translate-x-1/2 h-7 w-7 rounded-full bg-white border border-zinc-400 flex items-center justify-center cursor-grab active:cursor-grabbing shadow"
                  onPointerDown={startRotate}
                  onPointerMove={moveRotate}
                  onPointerUp={endRotate}
                  aria-label="Rotate"
              >
                <RotateCw className="h-3.5 w-3.5 text-zinc-700" />
              </div>
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
