import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import type { CropRect } from "./types";
import { DESKTOP_RATIO, MIN_MOBILE_WIDTH, MOBILE_RATIO } from "./types";
import { useTranslation } from "@/hooks/use-translation";

interface Props {
  imageUrl: string;
  mobile: CropRect | null;
  desktop: CropRect | null;
  onChange: (next: {
    mobile: CropRect;
    desktop: CropRect;
    natural: { w: number; h: number };
  }) => void;
  onLoadError?: () => void;
}

const MAX_VIEWPORT_W = 911;
const MAX_VIEWPORT_H = 607;

export function CoverCropStep({ imageUrl, mobile, desktop, onChange, onLoadError }: Props) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [view, setView] = useState<{ w: number; h: number } | null>(null);
  const [containerW, setContainerW] = useState(MAX_VIEWPORT_W);
  const [loading, setLoading] = useState(true);

  // Keep latest props accessible in callbacks without stale closures
  const mobileRef = useRef(mobile);
  const desktopRef = useRef(desktop);
  const naturalRef = useRef(natural);
  useEffect(() => {
    mobileRef.current = mobile;
  }, [mobile]);
  useEffect(() => {
    desktopRef.current = desktop;
  }, [desktop]);
  useEffect(() => {
    naturalRef.current = natural;
  }, [natural]);

  // observe container width
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      setContainerW(Math.min(el.clientWidth, MAX_VIEWPORT_W));
    });
    ro.observe(el);
    setContainerW(Math.min(el.clientWidth, MAX_VIEWPORT_W));
    return () => ro.disconnect();
  }, []);

  // load image
  useEffect(() => {
    setLoading(true);
    const img = new Image();
    img.onload = () => {
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });
      setLoading(false);
    };
    img.onerror = () => {
      setLoading(false);
      onLoadError?.();
    };
    img.src = imageUrl;
  }, [imageUrl, onLoadError]);

  // compute view size based on natural & container
  useEffect(() => {
    if (!natural) return;
    const maxW = containerW;
    const maxH = MAX_VIEWPORT_H;
    const r = natural.w / natural.h;
    let w = maxW;
    let h = w / r;
    if (h > maxH) {
      h = maxH;
      w = h * r;
    }
    setView({ w, h });
  }, [natural, containerW]);

  const scaleX = natural && view ? natural.w / view.w : 1;
  const scaleY = natural && view ? natural.h / view.h : 1;

  // Initialize crops on first view available
  useEffect(() => {
    if (!view || !natural) return;
    if (mobile && desktop) return;

    // Mobile crop: full width of the view
    let mw = view.w;
    let mh = mw / MOBILE_RATIO;
    if (mh > view.h) {
      mh = view.h;
      mw = mh * MOBILE_RATIO;
    }
    const mx = (view.w - mw) / 2;
    const my = (view.h - mh) / 2;

    // Desktop crop: same width as mobile, centered vertically within mobile
    // Desktop ratio is larger (wider/shorter) so it always fits inside mobile height
    const dw = mw;
    const dh = dw / DESKTOP_RATIO;
    const dx = mx;
    const dy = my + (mh - dh) / 2; // vertically centered inside mobile

    onChange({
      mobile: { x: mx * scaleX, y: my * scaleY, width: mw * scaleX, height: mh * scaleY },
      desktop: { x: dx * scaleX, y: dy * scaleY, width: dw * scaleX, height: dh * scaleY },
      natural,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, natural]);

  if (loading || !view || !natural) {
    return (
        <div
            ref={containerRef}
            className="flex h-100 w-full items-center justify-center rounded-lg bg-black/40"
        >
          <div className="text-sm text-neutral-400">{t('cover.crop.loading')}</div>
        </div>
    );
  }

  // Mobile in screen coords
  const mScreen = mobile
      ? {
        x: mobile.x / scaleX,
        y: mobile.y / scaleY,
        w: mobile.width / scaleX,
        h: mobile.height / scaleY,
      }
      : null;

  // Desktop screen dims — width always equals mobile width
  // DESKTOP_RATIO > MOBILE_RATIO so desktop is always shorter → always fits inside mobile
  const dScreenW = mScreen ? mScreen.w : 0;
  const dScreenH = dScreenW / DESKTOP_RATIO;

  // Desktop Y offset relative to mobile top edge (for positioning inside mobile Rnd)
  const dOffsetY =
      mScreen && desktop
          ? Math.max(0, Math.min(desktop.y / scaleY - mScreen.y, mScreen.h - dScreenH))
          : mScreen
              ? (mScreen.h - dScreenH) / 2
              : 0;

  // Called when mobile is dragged or resized
  // Syncs desktop width to new mobile width, preserves relative Y offset
  const updateMobile = (sx: number, sy: number, sw: number, sh: number) => {
    const prevMobile = mobileRef.current;
    const prevDesktop = desktopRef.current;
    const nat = naturalRef.current;
    if (!prevMobile || !prevDesktop || !nat) return;

    const dw_nat = sw * scaleX;
    const dh_nat = dw_nat / DESKTOP_RATIO;

    // Keep desktop's relative Y offset inside new mobile bounds
    const prevOffsetY = prevDesktop.y / scaleY - prevMobile.y / scaleY;
    const maxOffsetY = sh - dh_nat / scaleY;
    const newOffsetY = Math.max(0, Math.min(prevOffsetY, maxOffsetY));
    const newDesktopY = sy + newOffsetY;

    onChange({
      mobile: { x: sx * scaleX, y: sy * scaleY, width: sw * scaleX, height: sh * scaleY },
      desktop: {
        x: sx * scaleX, // always same x as mobile
        y: newDesktopY * scaleY,
        width: dw_nat,
        height: dh_nat,
      },
      natural: nat,
    });
  };

  // Called when desktop is dragged vertically inside mobile
  // offsetY is position.y relative to mobile top (0 = mobile top)
  const updateDesktopOffsetY = (offsetY: number) => {
    const mob = mobileRef.current;
    const nat = naturalRef.current;
    if (!mob || !nat || !mScreen) return;

    const dw_nat = mob.width; // always same as mobile
    const dh_nat = dw_nat / DESKTOP_RATIO;
    const clampedOffset = Math.max(0, Math.min(offsetY, mScreen.h - dScreenH));

    onChange({
      mobile: mob,
      desktop: {
        x: mob.x,
        y: (mScreen.y + clampedOffset) * scaleY,
        width: dw_nat,
        height: dh_nat,
      },
      natural: nat,
    });
  };

  return (
      <div ref={containerRef} className="flex w-full justify-center">
        <div
            className="relative select-none overflow-hidden rounded-lg bg-black"
            style={{ width: view.w, height: view.h }}
        >
          <img
              src={imageUrl}
              alt="cover"
              draggable={false}
              className="pointer-events-none absolute inset-0 h-full w-full object-fill"
          />

          {/* Dim overlay outside mobile crop */}
          {mScreen && (
              <>
                <div
                    className="pointer-events-none absolute inset-x-0 top-0 bg-black/55"
                    style={{ height: mScreen.y }}
                />
                <div
                    className="pointer-events-none absolute inset-x-0 bg-black/55"
                    style={{ top: mScreen.y + mScreen.h, bottom: 0 }}
                />
                <div
                    className="pointer-events-none absolute bg-black/55"
                    style={{ top: mScreen.y, left: 0, width: mScreen.x, height: mScreen.h }}
                />
                <div
                    className="pointer-events-none absolute bg-black/55"
                    style={{ top: mScreen.y, left: mScreen.x + mScreen.w, right: 0, height: mScreen.h }}
                />
              </>
          )}

          {/* Mobile crop — draggable & resizable freely */}
          {mScreen && (
              <Rnd
                  size={{ width: mScreen.w, height: mScreen.h }}
                  position={{ x: mScreen.x, y: mScreen.y }}
                  bounds="parent"
                  lockAspectRatio={MOBILE_RATIO}
                  minWidth={Math.min(MIN_MOBILE_WIDTH, view.w)}
                  cancel=".desktop-crop"
                  onDragStop={(_, d) => updateMobile(d.x, d.y, mScreen.w, mScreen.h)}
                  onResizeStop={(_, __, ref, ___, pos) =>
                      updateMobile(pos.x, pos.y, ref.offsetWidth, ref.offsetHeight)
                  }
                  className="border-2! border-dashed! border-white/90!"
                  style={{ zIndex: 10 }}
              >
                {/* Mobile label */}
                <div className="absolute left-2 top-2 z-10 rounded bg-black/70 px-2 py-0.5 text-[11px] text-white/80 select-none pointer-events-none">
                  {t('cover.crop.label.mobile')}
                </div>

                {/* Desktop crop — lives inside mobile, same width, only vertical drag */}
                <Rnd
                    size={{ width: dScreenW, height: dScreenH }}
                    position={{ x: 0, y: dOffsetY }}
                    bounds="parent"
                    dragAxis="y"
                    enableResizing={false}
                    onDragStop={(_, d) => updateDesktopOffsetY(d.y)}
                    className="desktop-crop border-2! border-dashed! border-sky-400!"
                    style={{ zIndex: 20 }}
                >
                  <div className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[11px] text-sky-300 select-none pointer-events-none">
                    {t('cover.crop.label.desktop')}
                  </div>
                </Rnd>
              </Rnd>
          )}
        </div>

        {/* Legend */}
        <div className="absolute bottom-2 right-2 flex flex-col gap-1 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-5 rounded-sm border border-dashed border-white/70" />
            <span className="text-white/60">{t('cover.crop.legend.mobile')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-5 rounded-sm border border-dashed border-sky-400" />
            <span className="text-white/60">{t('cover.crop.legend.desktop')}</span>
          </div>
        </div>
      </div>
  );
}