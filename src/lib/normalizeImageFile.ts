export async function normalizeImageFile(file: File): Promise<File> {
    if (!file.type.startsWith("image") && !/\.(jpe?g|png|webp|avif|heic|heif|gif|bmp)$/i.test(file.name)) {
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