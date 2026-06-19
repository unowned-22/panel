import type { CropArea } from "../model/types";
import { canvasToBlob, createCanvas } from "./canvasUtils";
import { rotateImage } from "./rotateImage";

export async function cropImage(image: HTMLImageElement, crop: CropArea, rotation: number): Promise<Blob> {
  const source = rotation ? await rotateImage(image, rotation) : image;
  const sw = "naturalWidth" in source ? source.naturalWidth : source.width;
  const sh = "naturalHeight" in source ? source.naturalHeight : source.height;
  const x = Math.max(0, Math.min(crop.x, sw));
  const y = Math.max(0, Math.min(crop.y, sh));
  const w = Math.max(1, Math.min(crop.width, sw - x));
  const h = Math.max(1, Math.min(crop.height, sh - y));
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(source as CanvasImageSource, x, y, w, h, 0, 0, w, h);
  return canvasToBlob(canvas, "image/png");
}
