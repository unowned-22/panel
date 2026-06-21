import { Eraser } from "lucide-react";
import { PanelHeader } from "../PanelHeader";
import { useTranslation } from "@/hooks/use-translation";

export function PaintbrushPanel({ onClose, onClear }: { onClose: () => void; onClear: () => void }) {
  const { t } = useTranslation();
  return (
      <div>
        <PanelHeader title={t("stories.editor.pb.title")} onClose={onClose} />
        <div className="p-4 space-y-4 text-sm text-zinc-300">
          <p>{t("stories.editor.pb.desc")}</p>
          <button onClick={onClear} className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 hover:bg-zinc-700">
            <Eraser className="h-4 w-4" /> {t("stories.editor.pb.clear")}
          </button>
          <p className="text-xs text-zinc-500">{t("stories.editor.pb.fixed")}</p>
        </div>
      </div>
  );
}
