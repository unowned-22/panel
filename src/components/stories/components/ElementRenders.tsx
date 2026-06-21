import type { CSSProperties } from "react";
import { Link as LinkIcon } from "lucide-react";
import { TEXT_STYLES } from "../constants";
import type { ImageElement, StickerElement, TextElement } from "../types/stories";

export function TextRender({ element, editing, onCommit }: { element: TextElement; editing: boolean; onCommit: (t: string) => void }) {
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

export function StickerRender({ element }: { element: StickerElement }) {
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
