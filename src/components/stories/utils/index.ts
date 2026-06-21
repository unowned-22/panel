import type { CSSProperties } from "react";
import { FILTERS } from "../constants";
import type { Adjustments, Background, Slide } from "../types/stories";

export const uid = () => Math.random().toString(36).slice(2, 10);

export function nextZ(s: Slide) {
    return (s.elements.length ? Math.max(...s.elements.map((e) => e.zIndex)) : 0) + 1;
}

export function adjustmentsToFilter(a: Adjustments): string {
    const warmthHue = (a.warmth / 100) * 15; // -15..15
    const parts = [
        `contrast(${a.contrast}%)`,
        `saturate(${a.saturation}%)`,
        `hue-rotate(${warmthHue}deg)`,
    ];
    if (a.sharpness > 0) parts.push(`contrast(${100 + a.sharpness * 0.3}%)`);
    return parts.join(" ");
}

export function slideFilterCss(slide: Slide): string {
    const preset = FILTERS.find((f) => f.id === slide.filterId)?.css ?? "none";
    const adj = adjustmentsToFilter(slide.adjustments);
    return [preset === "none" ? "" : preset, adj].filter(Boolean).join(" ");
}

export function backgroundStyle(bg: Background | null): CSSProperties {
    if (!bg) return { background: "#1f2937" };
    if (bg.kind === "color") return { background: bg.value };
    if (bg.kind === "gradient") return { background: bg.value };
    if (bg.kind === "pattern") return { background: bg.value, backgroundSize: "cover" };
    if (bg.kind === "media") return {};
    return {};
}

export function backgroundPreviewStyle(bg: Background): CSSProperties {
    if (bg.kind === "color") return { background: bg.value };
    if (bg.kind === "gradient") return { background: bg.value };
    if (bg.kind === "pattern") return { background: bg.value, backgroundSize: "cover" };
    return {};
}

// The editor canvas is a fixed 9:16 box, so a width-percentage and a
// height-percentage refer to different absolute lengths. This converts a
// natural image aspect ratio (h/w) into a height-percentage that visually
// matches the given width-percentage, so freshly-dropped photos look right
// instead of looking squished/stretched.
export const CANVAS_RATIO = 9 / 16; // canvas width / canvas height

export function widthPercentToHeightPercent(widthPercent: number, naturalRatio: number): number {
    return widthPercent * naturalRatio * CANVAS_RATIO;
}

export function loadImageNaturalRatio(url: string): Promise<number> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const ratio = img.naturalWidth ? img.naturalHeight / img.naturalWidth : 1;
            resolve(ratio || 1);
        };
        img.onerror = () => resolve(1);
        img.src = url;
    });
}

const FIT_MAX_WIDTH_PERCENT = 82;
const FIT_MAX_HEIGHT_PERCENT = 82;
const FIT_DEFAULT_WIDTH_PERCENT = 60;

export function fitImageToCanvas(naturalRatio: number): { width: number; height: number } {
    let width = FIT_DEFAULT_WIDTH_PERCENT;
    let height = widthPercentToHeightPercent(width, naturalRatio);

    if (height > FIT_MAX_HEIGHT_PERCENT) {
        const scale = FIT_MAX_HEIGHT_PERCENT / height;
        width *= scale;
        height = FIT_MAX_HEIGHT_PERCENT;
    }
    if (width > FIT_MAX_WIDTH_PERCENT) {
        const scale = FIT_MAX_WIDTH_PERCENT / width;
        width = FIT_MAX_WIDTH_PERCENT;
        height *= scale;
    }
    return { width, height };
}