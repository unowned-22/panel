/**
 * Re-encodes an image file to JPEG via canvas, so that mislabeled formats
 * (e.g. AVIF/HEIC served with a .jpg extension or image/jpeg MIME type —
 * common from stock photo sites and modern phone cameras) are normalized
 * before upload. The browser's native image decoder handles the format
 * detection for us; we just need to force the *output* MIME type.
 *
 * Falls back to the original file if normalization fails for any reason
 * (e.g. unsupported format, decode error) — the upload will then proceed
 * with the original file rather than blocking the user.
 */
export async function normalizeImageFile(file: File): Promise<File> {
    // Only images need this; video passes through untouched.
    if (!file.type.startsWith("image") && !looksLikeImageExtension(file.name)) {
        return file;
    }

    try {
        const bitmap = await createImageBitmap(file);
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            bitmap.close();
            return file;
        }
        ctx.drawImage(bitmap, 0, 0);
        bitmap.close();

        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/jpeg", 0.92)
        );
        if (!blob) return file;

        const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
        return new File([blob], name, { type: "image/jpeg" });
    } catch (e) {
        console.warn("[normalizeImageFile] failed, using original file:", e);
        return file;
    }
}

function looksLikeImageExtension(name: string): boolean {
    return /\.(jpe?g|png|webp|avif|heic|heif|gif|bmp)$/i.test(name);
}