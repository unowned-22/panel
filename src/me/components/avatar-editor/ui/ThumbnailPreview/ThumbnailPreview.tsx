import { memo } from "react";
import styles from "./ThumbnailPreview.module.css";

interface Props {
  src: string;
  crop: { x: number; y: number; width: number; height: number } | null;
  imageSize: { w: number; h: number } | null;
}

export const ThumbnailPreview = memo(function ThumbnailPreview({ src, crop, imageSize }: Props) {
  const sizes = [
    { cls: styles.large, px: 96 },
    { cls: styles.medium, px: 56 },
    { cls: styles.small, px: 32 },
  ];

  return (
    <div className={styles.previews}>
      {sizes.map(({ cls, px }, i) => {
        if (!crop || !imageSize) {
          return <div key={i} className={cls} />;
        }
        const scale = px / crop.width;
        return (
          <div key={i} className={cls}>
            <div
              style={{
                width: imageSize.w * scale,
                height: imageSize.h * scale,
                backgroundImage: `url(${src})`,
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                transform: `translate(${-crop.x * scale}px, ${-crop.y * scale}px)`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
});
