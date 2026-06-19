import { useEffect } from "react";
import styles from "./AvatarUploader.module.css";
import { useAvatarUploaderStore } from "./model/store";
import { UploadStep } from "./ui/UploadStep/UploadStep";
import { ProfileCropStep } from "./ui/ProfileCropStep/ProfileCropStep";
import { ThumbnailStep } from "./ui/ThumbnailStep/ThumbnailStep";
import { CompleteStep } from "./ui/CompleteStep/CompleteStep";
import type { AvatarUploaderProps } from "./model/types";

const DEFAULT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
];

const TITLES: Record<string, string> = {
  upload: "Upload new photo",
  profileCrop: "Your profile photo",
  thumbnailCrop: "Create thumbnail",
  complete: "Your profile photo",
};

export function AvatarUploader({
  open,
  onClose,
  onComplete,
  maxFileSize = 20 * 1024 * 1024,
  minimumImageSize = 300,
  allowedTypes = DEFAULT_TYPES,
}: AvatarUploaderProps) {
  const { step, reset } = useAvatarUploaderStore();

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  if (!open) return null;

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleComplete = (result: Parameters<typeof onComplete>[0]) => {
    onComplete(result);
    handleClose();
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{TITLES[step]}</h2>
          <button className={styles.close} onClick={handleClose} aria-label="Close">×</button>
        </div>
        {step === "upload" && (
          <UploadStep
            maxFileSize={maxFileSize}
            allowedTypes={allowedTypes}
            minimumImageSize={minimumImageSize}
          />
        )}
        {step === "profileCrop" && <ProfileCropStep />}
        {step === "thumbnailCrop" && <ThumbnailStep />}
        {step === "complete" && <CompleteStep onComplete={handleComplete} />}
      </div>
    </div>
  );
}
