import { PanelHeader } from "../PanelHeader";
import { backgroundPreviewStyle } from "../../utils";
import { BACKGROUND_PRESETS, COLOR_SWATCHES } from "../../constants";
import type { Background } from "../../types/stories";
import { useTranslation } from "@/hooks/use-translation";

export function BackgroundPanel({
                             selected, onClose, onPick,
                           }: { selected: Background | null; onClose: () => void; onPick: (bg: Background) => void }) {
  const { t } = useTranslation();
  const isEqual = (a: Background | null, b: Background) =>
      a && a.kind === b.kind && (a as { value?: string }).value === (b as { value?: string }).value;
  return (
      <div>
        <PanelHeader title={t("stories.editor.bg.title")} onClose={onClose} />
        <div className="p-4 space-y-5">
          <p className="text-xs text-zinc-500">
            {t("stories.editor.bg.desc")}
          </p>
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">{t("stories.editor.bg.title")}</p>
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
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">{t("stories.editor.bg.color")}</p>
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
