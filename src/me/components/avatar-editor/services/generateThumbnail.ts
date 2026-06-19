import type { CropArea } from "../model/types";
import { canvasToBlob, createCanvas, loadImage } from "./canvasUtils";

export async function generateThumbnail(image: Blob, crop: CropArea): Promise<Blob> {
  const url = URL.createObjectURL(image);
  try {
    const img = await loadImage(url);
    const canvas = createCanvas(crop.width, crop.height);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
    return await canvasToBlob(canvas, "image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}
