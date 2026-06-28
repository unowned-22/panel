import { useState } from "react";
import { PanelHeader } from "../PanelHeader";
import { STICKERS } from "../../constants";
import { useTranslation } from "@/hooks/use-translation";

export function StickersPanel({ onAdd, onClose }: { onAdd: (emoji: string) => void; onClose: () => void }) {
    const { t } = useTranslation();
    const [activeCat, setActiveCat] = useState(STICKERS[0].category);
    const cat = STICKERS.find((c) => c.category === activeCat)!;

    return (
        <div>
            <PanelHeader title={t("stories.editor.stickers.title")} onClose={onClose} />
            <div className="p-4 space-y-4">
                {/* category tabs */}
                <div className="flex gap-1 overflow-x-auto pb-1">
                    {STICKERS.map((c) => (
                        <button
                            key={c.category}
                            onClick={() => setActiveCat(c.category)}
                            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${
                                activeCat === c.category ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5"
                            }`}
                        >
                            {c.category}
                        </button>
                    ))}
                </div>

                {/* sticker grid */}
                <div className="grid grid-cols-5 gap-2">
                    {cat.items.map((e) => (
                        <button
                            key={e}
                            onClick={() => onAdd(e)}
                            className="aspect-square rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-3xl flex items-center justify-center"
                        >
                            {e}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}