import type { Background, FilterPreset, TextStyleId } from "../types/stories";

export const COLOR_SWATCHES = [
    "#ffffff", "#111111", "#a9a39a", "#3b82f6", "#22c55e",
    "#ef4444", "#a78bfa", "#8b5cf6", "#ec4899", "#f97316",
    "#7dd3fc", "#64748b", "#cbd5e1", "#f5f5f4",
];

export const BACKGROUND_PRESETS: Background[] = [
    { kind: "gradient", value: "linear-gradient(160deg,#1e1b4b,#0f172a)" },
    { kind: "gradient", value: "linear-gradient(160deg,#1e3a8a,#3b82f6)" },
    { kind: "pattern", value: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><path d='M0 50 Q50 0 100 50 T200 50' stroke='%23d6d3d1' fill='none' stroke-width='6'/><path d='M0 120 Q50 70 100 120 T200 120' stroke='%23a8a29e' fill='none' stroke-width='6'/></svg>\") repeat, #e7e5e4", preview: "topo" },
    { kind: "gradient", value: "linear-gradient(160deg,#065f46,#10b981)" },
    { kind: "pattern", value: "linear-gradient(135deg,#f5f5f4 25%,transparent 25%) -10px 0/20px 20px, linear-gradient(225deg,#f5f5f4 25%,transparent 25%) -10px 0/20px 20px, #d6d3d1", preview: "checker" },
    { kind: "gradient", value: "linear-gradient(160deg,#fb7185,#e11d48)" },
    { kind: "gradient", value: "radial-gradient(circle at 30% 30%,#c4b5fd,#7c3aed)" },
    { kind: "gradient", value: "linear-gradient(160deg,#fde047,#ca8a04)" },
    { kind: "pattern", value: "radial-gradient(circle at 20% 30%, #fb923c 0 30%, transparent 31%), radial-gradient(circle at 70% 70%, #ea580c 0 25%, transparent 26%), #f97316", preview: "orange" },
    { kind: "gradient", value: "linear-gradient(160deg,#fda4af,#be123c)" },
    { kind: "gradient", value: "linear-gradient(160deg,#a78bfa,#6d28d9)" },
    { kind: "gradient", value: "linear-gradient(160deg,#fde68a,#f59e0b 60%,#ef4444)" },
    { kind: "pattern", value: "radial-gradient(circle at 30% 40%, #b91c1c 0 18%, transparent 19%), radial-gradient(circle at 70% 65%, #7f1d1d 0 22%, transparent 23%), #1c1917", preview: "hearts" },
];

export const FILTERS: FilterPreset[] = [
    { id: "original", name: "Original", css: "none" },
    { id: "nox",     name: "Nox",      css: "brightness(0.85) contrast(1.1) saturate(0.9)" },
    { id: "vesper",  name: "Vesper",   css: "contrast(1.15) hue-rotate(-10deg) saturate(1.1)" },
    { id: "latona",  name: "Latona",   css: "sepia(0.2) saturate(1.2) contrast(1.05)" },
    { id: "liber",   name: "Liber",    css: "saturate(1.4) hue-rotate(8deg) brightness(1.05)" },
    { id: "luna",    name: "Luna",     css: "grayscale(0.4) brightness(1.05) contrast(1.1)" },
    { id: "minerva", name: "Minerva",  css: "contrast(1.2) saturate(1.1)" },
    { id: "mitra",   name: "Mitra",    css: "sepia(0.3) hue-rotate(-15deg) saturate(1.2)" },
    { id: "juno",    name: "Juno",     css: "brightness(1.05) saturate(1.25) contrast(1.05)" },
    { id: "terra",   name: "Terra",    css: "saturate(1.3) hue-rotate(-8deg) contrast(1.1)" },
    { id: "aurora",  name: "Aurora",   css: "hue-rotate(15deg) saturate(1.2) brightness(1.05)" },
    { id: "sepia",   name: "Sepia",    css: "sepia(0.8) contrast(1.05)" },
    { id: "apollo",  name: "Apollo",   css: "brightness(1.1) contrast(1.1) saturate(1.15)" },
    { id: "horus",   name: "Horus",    css: "sepia(0.4) saturate(1.3) contrast(1.1)" },
    { id: "fortuna", name: "Fortuna",  css: "hue-rotate(-20deg) saturate(1.15) brightness(0.95)" },
];

export interface TextStyleSpec {
    id: TextStyleId;
    label: string;
    fontFamily: string;
    weight: number;
    italic?: boolean;
    letterSpacing?: string;
    textTransform?: "uppercase" | "none";
}

export const TEXT_STYLES: TextStyleSpec[] = [
    { id: "modern",     label: "Modern",     fontFamily: "'Inter', system-ui, sans-serif", weight: 800, letterSpacing: "-0.02em" },
    { id: "typewriter", label: "Typewriter", fontFamily: "'Courier New', monospace", weight: 700 },
    { id: "playful",    label: "Playful",    fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive", weight: 700 },
    { id: "rounded",    label: "Rounded",    fontFamily: "'Nunito', 'Avenir Next', sans-serif", weight: 800 },
    { id: "classic",    label: "Classic",    fontFamily: "Georgia, 'Times New Roman', serif", weight: 700 },
    { id: "aesthetic",  label: "Aesthetic",  fontFamily: "'Didot', 'Bodoni Moda', serif", weight: 400, italic: true },
    { id: "standard",   label: "Standard",   fontFamily: "system-ui, sans-serif", weight: 600 },
    { id: "dynamic",    label: "Dynamic",    fontFamily: "'Impact', 'Oswald', sans-serif", weight: 900, textTransform: "uppercase", letterSpacing: "0.04em" },
    { id: "elegant",    label: "Elegant",    fontFamily: "'Playfair Display', Georgia, serif", weight: 500, italic: true },
    { id: "cursive",    label: "Cursive",    fontFamily: "'Brush Script MT', 'Snell Roundhand', cursive", weight: 500, italic: true },
];

export const STICKERS: { category: string; items: string[] }[] = [
    { category: "Smileys", items: ["😀","😂","😍","🥰","😎","🤩","🥳","😭","😤","🤔","😴","🤯","🥺","😇","🙃"] },
    { category: "Hearts",  items: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","💖","💘","💝","💕","💞","💗","💓"] },
    { category: "Hands",   items: ["👍","👏","🙌","🙏","👌","✌️","🤞","🤟","🤘","👊","✊","🫶","💪","👋","🫰"] },
    { category: "Nature",  items: ["🌸","🌺","🌻","🌹","🌷","🍀","🌿","🌴","🌊","🔥","⭐","✨","🌙","☀️","⚡"] },
    { category: "Fun",     items: ["🎉","🎊","🎈","🎁","🎂","🍕","🍔","🍟","🍩","☕","🍻","🍷","🎵","🎮","📸"] },
];
