import type { ValidationOptions, ValidationResult } from "../model/types";
import { loadImage } from "./canvasUtils";

export async function validateImage(file: File, options: ValidationOptions): Promise<ValidationResult> {
  if (file.size > options.maxFileSize) {
    return { valid: false, error: `File is too large. Max ${(options.maxFileSize / 1024 / 1024).toFixed(0)}MB.` };
  }
  const typeOk =
    options.allowedTypes.includes(file.type) ||
    /\.(heic|heif)$/i.test(file.name);
  if (!typeOk) {
    return { valid: false, error: "Unsupported file format." };
  }
  if (options.minimumImageSize && /^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      if (img.naturalWidth < options.minimumImageSize || img.naturalHeight < options.minimumImageSize) {
        return {
          valid: false,
          error: `Image must be at least ${options.minimumImageSize}x${options.minimumImageSize}px.`,
        };
      }
    } catch {
      return { valid: false, error: "Could not read image." };
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  return { valid: true };
}
