import type { ValidationOptions, ValidationResult } from "../model/types";
import { loadImage } from "./canvasUtils";

export async function validateImage(file: File, options: ValidationOptions): Promise<ValidationResult> {
  if (file.size > options.maxFileSize) {
    return {
      valid: false,
      errorCode: 'tooLarge',
      errorParams: { max: (options.maxFileSize / 1024 / 1024).toFixed(0) },
    };
  }
  const typeOk =
    options.allowedTypes.includes(file.type) ||
    /\.(heic|heif)$/i.test(file.name);
  if (!typeOk) {
    return { valid: false, errorCode: 'unsupportedFormat' };
  }
  if (options.minimumImageSize && /^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      if (img.naturalWidth < options.minimumImageSize || img.naturalHeight < options.minimumImageSize) {
        return {
          valid: false,
          errorCode: 'minSize',
          errorParams: { size: String(options.minimumImageSize) },
        };
      }
    } catch {
      return { valid: false, errorCode: 'readFailed' };
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  return { valid: true };
}
