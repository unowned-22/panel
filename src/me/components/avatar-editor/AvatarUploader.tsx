import { useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import styles from "./AvatarUploader.module.css";
import { useAvatarUploaderStore } from "./model/store";
import { UploadStep } from "./ui/UploadStep/UploadStep";
import { ProfileCropStep } from "./ui/ProfileCropStep/ProfileCropStep";
import { ThumbnailStep } from "./ui/ThumbnailStep/ThumbnailStep";
import { CompleteStep } from "./ui/CompleteStep/CompleteStep";
import type { AvatarUploaderProps, Step } from "./model/types";

const DEFAULT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
];

const TITLES: Record<Step, keyof import('@/i18n/types').TranslationDictionary> = {
  upload: 'avatar.uploader.title.upload',
  profileCrop: 'avatar.uploader.title.profileCrop',
  thumbnailCrop: 'avatar.uploader.title.thumbnailCrop',
  complete: 'avatar.uploader.title.complete',
};

export function AvatarUploader({
  open,
  onClose,
  onComplete,
  maxFileSize = 20 * 1024 * 1024,
  minimumImageSize = 300,
  allowedTypes = DEFAULT_TYPES,
}: AvatarUploaderProps) {
  const { t } = useTranslation();
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
          <h2 className={styles.title}>{t(TITLES[step])}</h2>
          <button className={styles.close} onClick={handleClose} aria-label={t('avatar.uploader.close')}>×</button>
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
