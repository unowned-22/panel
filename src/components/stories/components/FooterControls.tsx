import { Lock, MoreHorizontal, Clock, Megaphone, Check, Maximize2 } from "lucide-react";
import type { CanvasElement, Duration, StoryState, Visibility } from "../types/stories";
import { useTranslation } from "@/hooks/use-translation";

export function FooterControls({
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
  const { t } = useTranslation();
  const visLabel = state.visibility === "everyone" ? t("stories.editor.audience.everyone") : state.visibility === "friends" ? t("stories.editor.audience.friends") : t("stories.editor.audience.close");
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
                    ["everyone", t("stories.editor.audience.everyone")],
                    ["friends", t("stories.editor.audience.friends")],
                    ["close", t("stories.editor.audience.close")],
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
                    <Clock className="h-3 w-3" /> {t("stories.editor.time.shown")}
                  </div>
                  {([1, 12, 24, 48] as Duration[]).map((d) => (
                      <button key={d} onClick={() => onSetDuration(d)}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-white/5 text-sm">
                        <span>{d} {d === 1 ? t("stories.editor.hour") : t("stories.editor.hours")}</span>
                        {state.duration === d && <Check className="h-4 w-4 text-sky-400" />}
                      </button>
                  ))}
                  <div className="h-px bg-white/5 my-1" />
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5 text-sm text-zinc-200">
                    <Megaphone className="h-4 w-4 text-zinc-400" /> {t("stories.editor.tag.ad")}
                  </button>
                  {selected && selected.type !== "drawing" && (
                      <>
                        <div className="h-px bg-white/5 my-1" />
                        <button onClick={() => onBringForward(selected.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5 text-sm">
                          <Maximize2 className="h-4 w-4 text-zinc-400" /> {t("stories.editor.bring.forward")}
                        </button>
                        <button onClick={() => onSendBackward(selected.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5 text-sm">
                          <Maximize2 className="h-4 w-4 text-zinc-400 rotate-180" /> {t("stories.editor.send.backward")}
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
          {t("stories.editor.publish")}
        </button>

        {/* tiny status row */}
        <p className="text-[11px] text-zinc-500 text-center">
          {t("stories.editor.slide.info")
            .replace("{index}", String(state.slides.findIndex((s) => s.id === activeSlide.id) + 1))
            .replace("{total}", String(state.slides.length))
            .replace("{duration}", String(state.duration))}
        </p>
      </div>
  );
}
