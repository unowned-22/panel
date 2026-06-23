import type { Slide, Background, ImageElement, CanvasElement, TextElement, StickerElement, DrawingElement } from "../types/stories";
import { slideFilterCss } from "./index";

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((res, rej) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => res(img);
        img.onerror = (e) => rej(new Error("failed to load image: " + src));
        img.src = src;
    });
}

function drawCover(ctx: CanvasRenderingContext2D, img: CanvasImageSource, W: number, H: number) {
    let iw = (img as any).naturalWidth ?? (img as any).width;
    let ih = (img as any).naturalHeight ?? (img as any).height;
    const scale = Math.max(W / iw, H / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    ctx.drawImage(img, (W - sw) / 2, (H - sh) / 2, sw, sh);
}

function captureVideoFrame(src: string): Promise<HTMLVideoElement | null> {
    return new Promise((resolve) => {
        const video = document.createElement("video");
        video.crossOrigin = "anonymous";
        video.muted = true;
        video.playsInline = true;
        video.src = src;
        const onLoaded = () => {
            resolve(video);
        };
        const onError = () => resolve(null);
        video.addEventListener("loadeddata", onLoaded, { once: true });
        video.addEventListener("error", onError, { once: true });
        video.load();
    });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(/\s+/);
    let line = "";
    let ty = y;
    for (let n = 0; n < words.length; n++) {
        const testLine = line ? line + " " + words[n] : words[n];
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, ty);
            line = words[n];
            ty += lineHeight;
        } else {
            line = testLine;
        }
    }
    if (line) ctx.fillText(line, x, ty);
}

export async function renderSlideToBlob(slide: Slide, opts?: { width?: number }): Promise<Blob> {
    const W = opts?.width ?? 540;
    const H = Math.round(W * (16 / 9)); // portrait 9:16 -> width / height = 9/16; here we follow user's formula

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas context unavailable");

    // Apply filter for background draw
    ctx.fillStyle = "#1f2937";
    ctx.fillRect(0, 0, W, H);

    try {
        ctx.filter = slideFilterCss(slide) || "none";
    } catch (e) {
        ctx.filter = "none";
    }

    // draw background
    const bg = slide.background as Background | null;
    if (!bg) {
        ctx.fillStyle = "#1f2937";
        ctx.fillRect(0, 0, W, H);
    } else if (bg.kind === "color") {
        ctx.fillStyle = bg.value;
        ctx.fillRect(0, 0, W, H);
    } else if (bg.kind === "gradient" || bg.kind === "pattern") {
        const svg = `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"${W}\" height=\"${H}\">` +
            `<foreignObject width=\"${W}\" height=\"${H}\">` +
            `<div xmlns=\"http://www.w3.org/1999/xhtml\" style=\"width:${W}px;height:${H}px;background:${bg.value};background-size:cover\"/>` +
            `</foreignObject></svg>`;
        const blob = new Blob([svg], { type: "image/svg+xml" });
        try {
            const bmp = await createImageBitmap(blob as any);
            ctx.drawImage(bmp, 0, 0, W, H);
            bmp.close();
        } catch (e) {
            // fallback to solid color
            ctx.fillStyle = "#1f2937";
            ctx.fillRect(0, 0, W, H);
        }
    } else if (bg.kind === "media") {
        const src = (bg as any).preview ?? (bg as any).url;
        if (src) {
            if (bg.mediaType === "image") {
                try {
                    const img = await loadImage(src);
                    drawCover(ctx, img, W, H);
                } catch (e) {
                    // ignore
                }
            } else if (bg.mediaType === "video") {
                const v = await captureVideoFrame(src);
                if (v) drawCover(ctx, v, W, H);
            }
        }
    }

    // reset filter for elements
    ctx.filter = "none";

    // render elements sorted by zIndex
    const els = (slide.elements || []).slice().sort((a: CanvasElement, b: CanvasElement) => (a as any).zIndex - (b as any).zIndex);
    for (const el of els) {
        try {
            if ((el as ImageElement).type === "image") {
                const ie = el as ImageElement;
                const src = ie.preview ?? ie.url;
                if (!src) continue;
                try {
                    const img = await loadImage(src);
                    const w = (ie.width / 100) * W;
                    const h = (ie.height / 100) * H;
                    const cx = (ie.x / 100) * W;
                    const cy = (ie.y / 100) * H;
                    ctx.save();
                    ctx.translate(cx, cy);
                    ctx.rotate((ie.rotation * Math.PI) / 180);
                    ctx.drawImage(img, -w / 2, -h / 2, w, h);
                    ctx.restore();
                } catch (e) {
                    // ignore
                }
            } else if ((el as TextElement).type === "text") {
                const te = el as TextElement;
                const fontFamilyMap: Record<string, string> = {
                    modern: 'sans-serif', typewriter: 'monospace', playful: 'cursive', rounded: 'sans-serif', classic: 'serif',
                    aesthetic: 'serif', standard: 'sans-serif', dynamic: 'sans-serif', elegant: 'serif', cursive: 'cursive'
                };
                const fontSize = (te.size / 1080) * H;
                const cx = (te.x / 100) * W;
                const cy = (te.y / 100) * H;
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate((te.rotation * Math.PI) / 180);
                ctx.font = `bold ${fontSize}px ${fontFamilyMap[te.style] ?? 'sans-serif'}`;
                ctx.fillStyle = te.color || '#fff';
                ctx.textAlign = te.align as CanvasTextAlign || 'center';
                ctx.textBaseline = 'middle';
                const maxW = (te.width / 100) * W;
                wrapText(ctx, te.text || '', 0, 0, maxW, fontSize * 1.3);
                ctx.restore();
            } else if ((el as StickerElement).type === "sticker") {
                const se = el as StickerElement;
                const size = (se.width / 100) * W;
                const cx = (se.x / 100) * W;
                const cy = (se.y / 100) * H;
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate((se.rotation * Math.PI) / 180);
                ctx.font = `${size}px serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(se.emoji || '�', 0, 0);
                ctx.restore();
            } else if ((el as DrawingElement).type === "drawing") {
                const de = el as DrawingElement;
                for (const path of de.paths || []) {
                    if (!path.points || path.points.length < 2) continue;
                    ctx.save();
                    ctx.strokeStyle = path.color || '#000';
                    ctx.lineWidth = path.size || 2;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.beginPath();
                    const p0 = path.points[0];
                    ctx.moveTo(p0.x * W, p0.y * H);
                    for (let i = 1; i < path.points.length; i++) {
                        const p = path.points[i];
                        ctx.lineTo(p.x * W, p.y * H);
                    }
                    ctx.stroke();
                    ctx.restore();
                }
            }
        } catch (e) {
            // continue on element errors
        }
    }

    // vignette
    try {
        const v = (slide.adjustments && (slide.adjustments as any).vignette) || 0;
        if (v > 0) {
            const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) / 2);
            const stop = Math.min(1, (60 - v * 0.3) / 100);
            grad.addColorStop(stop, 'transparent');
            grad.addColorStop(1, `rgba(0,0,0,${v / 100})`);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);
        }
    } catch (e) {
        // ignore
    }

    return await new Promise<Blob>((res, rej) => {
        canvas.toBlob((b) => {
            if (b) res(b);
            else rej(new Error('toBlob failed'));
        }, 'image/png');
    });
}
