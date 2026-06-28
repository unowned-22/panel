import type { CSSProperties } from "react";
import { TEXT_STYLES } from "../constants";
import type { ImageElement, StickerElement, TextElement } from "../types/stories";
import type { LinkElement } from "../types/stories";

// ── Text ───────────────────────────────────────────────────────────────────────
export function TextRender({
                             element,
                             editing,
                             onCommit,
                           }: {
  element: TextElement;
  editing: boolean;
  onCommit: (t: string) => void;
}) {
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
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                (e.target as HTMLTextAreaElement).blur();
              }
            }}
            className="w-full bg-transparent outline-none resize-none"
            style={{ ...baseStyle, padding: baseStyle.padding ?? "0.15em 0.4em" }}
        />
    );
  }
  return <div style={baseStyle}>{element.text}</div>;
}

// ── Sticker ────────────────────────────────────────────────────────────────────
export function StickerRender({ element }: { element: StickerElement }) {
  return (
      <div className="flex items-center justify-center" style={{ fontSize: "min(20vw, 120px)" }}>
        <span style={{ fontSize: "1em", lineHeight: 1 }}>{element.emoji}</span>
      </div>
  );
}

// ── Image ──────────────────────────────────────────────────────────────────────
export function ImageRender({ element }: { element: ImageElement }) {
  return (
      <img
          src={element.url}
          alt=""
          draggable={false}
          className="h-full w-full object-cover rounded-md pointer-events-none select-none"
      />
  );
}

// ── Link ───────────────────────────────────────────────────────────────────────
export function LinkRender({ element }: { element: LinkElement }) {
  const hostname = (() => {
    try {
      return new URL(element.url).hostname;
    } catch {
      return element.url;
    }
  })();
  const label = element.title || hostname;

  if (element.displayStyle === "pill") {
    return (
        <div className="inline-flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-sm px-3 py-1.5 border border-white/25 select-none whitespace-nowrap w-full justify-center">
          <span className="text-base leading-none">🔗</span>
          <span className="text-sm text-white font-medium truncate">{label}</span>
        </div>
    );
  }

  // card style
  return (
      <div className="flex items-center gap-2.5 rounded-xl bg-black/60 backdrop-blur-sm px-3 py-2.5 border border-white/25 select-none w-full">
        <img
            src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 rounded-md shrink-0 bg-zinc-700"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
        />
        <div className="min-w-0">
          <p className="text-[13px] text-white font-semibold truncate">{label}</p>
          <p className="text-[11px] text-white/55 truncate">{hostname}</p>
        </div>
      </div>
  );
}