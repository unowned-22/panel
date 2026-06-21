import { PanelHeader } from "../PanelHeader";
import type { Adjustments } from "../../types/stories";

export function ColorCorrectionPanel({
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
