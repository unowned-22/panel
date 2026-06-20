export type Visibility = "everyone" | "friends" | "close";
export type Duration = 1 | 12 | 24 | 48;

export type Background =
  | { kind: "color"; value: string }
  | { kind: "gradient"; value: string }
  | { kind: "pattern"; value: string; preview: string }
  | { kind: "media"; url: string; mediaType: "image" | "video" };

export interface Adjustments {
  contrast: number;   // 0..200, default 100
  warmth: number;     // -100..100, default 0
  saturation: number; // 0..200, default 100
  sharpness: number;  // 0..100, default 0
  noise: number;      // 0..100, default 0
  vignette: number;   // 0..100, default 0
}

export const defaultAdjustments: Adjustments = {
  contrast: 100,
  warmth: 0,
  saturation: 100,
  sharpness: 0,
  noise: 0,
  vignette: 0,
};

export interface FilterPreset {
  id: string;
  name: string;
  css: string; // css filter string
}

export type TextStyleId =
  | "modern" | "typewriter" | "playful" | "rounded" | "classic"
  | "aesthetic" | "standard" | "dynamic" | "elegant" | "cursive";

export type TextAlign = "left" | "center" | "right";
export type TextFill = "filled" | "outline" | "none";

export interface TextElement {
  id: string;
  type: "text";
  x: number; y: number; // percentage 0..100 of canvas
  width: number; // percentage
  rotation: number;
  zIndex: number;
  text: string;
  style: TextStyleId;
  size: number; // px at base 1080h
  color: string;
  align: TextAlign;
  fill: TextFill;
}

export interface StickerElement {
  id: string;
  type: "sticker";
  x: number; y: number;
  width: number; // percentage
  rotation: number;
  zIndex: number;
  emoji: string;
  link?: string;
}

export interface DrawingElement {
  id: string;
  type: "drawing";
  zIndex: number;
  // paths are normalized 0..1 within canvas
  paths: { color: string; size: number; points: { x: number; y: number }[] }[];
}

export type CanvasElement = TextElement | StickerElement | DrawingElement;

export interface Slide {
  id: string;
  background: Background | null;
  filterId: string;
  adjustments: Adjustments;
  elements: CanvasElement[];
}

export interface StoryState {
  slides: Slide[];
  activeSlideId: string;
  selectedElementId: string | null;
  visibility: Visibility;
  duration: Duration;
  hiddenFrom: string[];
}
