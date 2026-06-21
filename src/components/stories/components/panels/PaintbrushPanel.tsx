import { Eraser } from "lucide-react";
import { PanelHeader } from "../PanelHeader";

export function PaintbrushPanel({ onClose, onClear }: { onClose: () => void; onClear: () => void }) {
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
