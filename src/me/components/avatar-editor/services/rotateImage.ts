import { createCanvas } from "./canvasUtils";

export async function rotateImage(image: HTMLImageElement, rotation: number): Promise<HTMLCanvasElement> {
  const rad = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const w = image.naturalWidth;
  const h = image.naturalHeight;
  const newW = Math.floor(w * cos + h * sin);
  const newH = Math.floor(w * sin + h * cos);
  const canvas = createCanvas(newW, newH);
  const ctx = canvas.getContext("2d")!;
  ctx.translate(newW / 2, newH / 2);
  ctx.rotate(rad);
  ctx.drawImage(image, -w / 2, -h / 2);
  return canvas;
}
