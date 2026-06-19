import { useState } from "react";
import type { CropRect } from "./types";
import { Modal } from "./Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  onSetCover: () => void;
  imageUrl: string;
  natural: { w: number; h: number };
  mobile: CropRect;
  desktop: CropRect;
  avatar?: string;
  userName?: string;
}

function CropPreview({
  imageUrl,
  natural,
  crop,
  displayWidth,
  displayHeight,
  className,
}: {
  imageUrl: string;
  natural: { w: number; h: number };
  crop: CropRect;
  displayWidth: number;
  displayHeight: number;
  className?: string;
}) {
  const scaleX = displayWidth / crop.width;
  const scaleY = displayHeight / crop.height;
  return (
    <div
      className={className}
      style={{
        width: displayWidth,
        height: displayHeight,
        backgroundImage: `url(${imageUrl})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${natural.w * scaleX}px ${natural.h * scaleY}px`,
        backgroundPosition: `${-crop.x * scaleX}px ${-crop.y * scaleY}px`,
      }}
    />
  );
}

export function CoverPreviewModal({
  open,
  onClose,
  onSetCover,
  imageUrl,
  natural,
  mobile,
  desktop,
  avatar,
  userName = "Mark Roberts",
}: Props) {
  const [tab, setTab] = useState<"desktop" | "mobile">("desktop");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Preview"
      widthClass="max-w-2xl"
      footer={
        <div className="ml-auto flex gap-2">
          <button
            onClick={onClose}
            className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
          >
            Return to editing
          </button>
          <button
            onClick={onSetCover}
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-200"
          >
            Set cover
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <p className="text-center text-sm text-neutral-400">
          Check how your cover looks on different platforms
        </p>

        <div className="mx-auto flex w-fit rounded-lg bg-neutral-800 p-1">
          {(["desktop", "mobile"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-6 py-1.5 text-sm font-medium capitalize transition-colors ${
                tab === t ? "bg-neutral-600 text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              {t === "desktop" ? "Desktop" : "Mobile device"}
            </button>
          ))}
        </div>

        {tab === "desktop" ? (
          <div className="overflow-hidden rounded-lg bg-neutral-800">
            <CropPreview
              imageUrl={imageUrl}
              natural={natural}
              crop={desktop}
              displayWidth={520}
              displayHeight={520 / (desktop.width / desktop.height)}
              className="mx-auto"
            />
            <div className="relative -mt-10 px-6 pb-5 pt-0">
              <div className="flex items-end gap-4">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-neutral-800 bg-neutral-400">
                  {avatar ? (
                    <img src={avatar} alt={userName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl text-white/70">
                      👤
                    </div>
                  )}
                </div>
                <div className="pb-2 text-base font-semibold">{userName}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-[260px] overflow-hidden rounded-2xl bg-white text-neutral-900 shadow-lg">
            <CropPreview
              imageUrl={imageUrl}
              natural={natural}
              crop={mobile}
              displayWidth={260}
              displayHeight={260 / (mobile.width / mobile.height)}
            />
            <div className="relative bg-neutral-900 px-4 pb-4 pt-8 text-white">
              <div className="absolute -top-10 left-1/2 h-20 w-20 -translate-x-1/2 overflow-hidden rounded-full border-4 border-neutral-900 bg-neutral-400">
                {avatar ? (
                  <img src={avatar} alt={userName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl text-white/70">
                    👤
                  </div>
                )}
              </div>
              <div className="mt-8 text-center text-sm font-semibold">{userName}</div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
