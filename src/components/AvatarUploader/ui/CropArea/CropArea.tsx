import { useEffect, useLayoutEffect, useRef, useState, useCallback, useMemo } from "react";
import { Rnd } from "react-rnd";
import styles from "./CropArea.module.css";
import type { CropArea as CropAreaType } from "../../model/types";

interface Props {
  imageUrl: string;
  rotation?: number;
  aspect?: number;
  onChange?: (sourceCrop: CropAreaType, displayed: { w: number; h: number }) => void;
}

export function CropArea({ imageUrl, rotation = 0, aspect = 1, onChange }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [wrap, setWrap] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [box, setBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const swap = rotation % 180 !== 0;
      setNatural({
        w: swap ? img.naturalHeight : img.naturalWidth,
        h: swap ? img.naturalWidth : img.naturalHeight,
      });
    };
    img.src = imageUrl;
  }, [imageUrl, rotation]);

  useLayoutEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(() => {
      const r = wrapRef.current!.getBoundingClientRect();
      setWrap({ w: r.width, h: r.height });
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // Stable ref for onChange — prevents emit from being recreated on every parent re-render
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  // Compute displayed image rect (contain) — must be memoized so its reference
  // stays stable between renders, otherwise emit (which depends on it) gets
  // recreated every render and the useEffect([box, emit]) loop never stops.
  const displayed = useMemo(() => {
    if (!natural || !wrap.w) return null;
    const scale = Math.min(wrap.w / natural.w, wrap.h / natural.h);
    const w = natural.w * scale;
    const h = natural.h * scale;
    return { w, h, x: (wrap.w - w) / 2, y: (wrap.h - h) / 2, scale };
  }, [natural, wrap.w, wrap.h]);

  // Initial box ~ 70% centered, respecting aspect
  useEffect(() => {
    if (!displayed) return;
    const size = Math.min(displayed.w, displayed.h) * 0.7;
    const w = size;
    const h = size / aspect;
    setBox({
      x: displayed.x + (displayed.w - w) / 2,
      y: displayed.y + (displayed.h - h) / 2,
      w,
      h,
    });
  }, [displayed?.w, displayed?.h, aspect]);

  const emit = useCallback(
      (b: { x: number; y: number; w: number; h: number }) => {
        if (!displayed || !natural) return;
        const sx = (b.x - displayed.x) / displayed.scale;
        const sy = (b.y - displayed.y) / displayed.scale;
        const sw = b.w / displayed.scale;
        const sh = b.h / displayed.scale;
        onChangeRef.current?.({ x: sx, y: sy, width: sw, height: sh }, { w: b.w, h: b.h });
      },
      [displayed, natural],
  );

  useEffect(() => {
    if (box) emit(box);
  }, [box, emit]);

  return (
      <div ref={wrapRef} className={styles.workspace}>
        <div className={styles.imageLayer}>
          <img
              src={imageUrl}
              alt=""
              style={{ transform: `rotate(${rotation}deg)` }}
              draggable={false}
          />
        </div>
        {box && displayed && (
            <Rnd
                className={styles.rnd}
                size={{ width: box.w, height: box.h }}
                position={{ x: box.x, y: box.y }}
                lockAspectRatio={aspect}
                bounds="parent"
                onDragStop={(_, d) => setBox({ ...box, x: d.x, y: d.y })}
                onResizeStop={(_, __, ref, ___, pos) =>
                    setBox({ x: pos.x, y: pos.y, w: ref.offsetWidth, h: ref.offsetHeight })
                }
                minWidth={50}
                minHeight={50}
                resizeHandleClasses={{
                  topLeft: styles.handleTL,
                  topRight: styles.handleTR,
                  bottomLeft: styles.handleBL,
                  bottomRight: styles.handleBR,
                  top: styles.handleT,
                  bottom: styles.handleB,
                  left: styles.handleL,
                  right: styles.handleR,
                }}
            />
        )}
      </div>
  );
}