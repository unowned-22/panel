import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  images: string[];
}

export const PhotoMedia = ({ images }: Props) => {
  const [idx, setIdx] = useState(0);

  if (images.length === 0) return null;

  // Одно фото — простой layout
  if (images.length === 1) {
    return (
      <div className="relative bg-secondary/40">
        <img
          src={images[0]}
          alt="post"
          className="w-full max-h-160 object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  // 2-4 фото — сетка-коллаж
  if (images.length <= 4) {
    const layout =
      images.length === 2
        ? "grid-cols-2 grid-rows-1"
        : images.length === 3
          ? "grid-cols-2 grid-rows-2"
          : "grid-cols-2 grid-rows-2";
    return (
      <div className={cn("grid gap-0.5 bg-background", layout)}>
        {images.map((src, i) => (
          <div
            key={i}
            className={cn(
              "relative overflow-hidden bg-secondary/40",
              images.length === 3 && i === 0 && "row-span-2",
            )}
          >
            <img
              src={src}
              alt={`photo ${i + 1}`}
              className="w-full h-full object-cover aspect-square"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    );
  }

  // 5+ фото — карусель со счётчиком
  return (
    <div className="relative group bg-secondary/40">
      <img
        src={images[idx]}
        alt={`photo ${idx + 1}`}
        className="w-full max-h-160 object-cover"
        loading="lazy"
      />
      <span className="absolute top-3 right-3 text-xs font-semibold bg-background/70 backdrop-blur px-2 py-1 rounded-md">
        {idx + 1}/{images.length}
      </span>
      <button
        onClick={() => setIdx((i) => Math.max(0, i - 1))}
        disabled={idx === 0}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/70 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
        aria-label="Previous"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => setIdx((i) => Math.min(images.length - 1, i + 1))}
        disabled={idx === images.length - 1}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/70 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
        aria-label="Next"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
