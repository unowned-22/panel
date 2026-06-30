import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import styles from "./ProfileCropStep.module.css";
import { CropArea } from "../CropArea/CropArea";
import { useAvatarUploaderStore } from "../../model/store";
import { useImageCrop } from "../../hooks/useImageCrop";
import { useImageTransform } from "../../hooks/useImageTransform";
import type { CropArea as CropAreaT } from "../../model/types";

export function ProfileCropStep() {
  const { t } = useTranslation();
  const { imageUrl, setStep } = useAvatarUploaderStore();
  const { rotation, rotateLeft, rotateRight } = useImageTransform();
  const { commit } = useImageCrop();
  const [crop, setCrop] = useState<CropAreaT | null>(null);
  const [busy, setBusy] = useState(false);

  if (!imageUrl) return null;

  return (
    <div className={styles.root}>
      <p className={styles.desc}>{t('avatar.uploader.profileCrop.description')}</p>
      <div className={styles.cropWrap}>
        <CropArea imageUrl={imageUrl} rotation={rotation} aspect={1} onChange={(c) => setCrop(c)} />
        <div className={styles.rotateBtns}>
          <button className={styles.rotateBtn} onClick={rotateLeft} aria-label={t('avatar.uploader.profileCrop.rotateLeft')}>⟲</button>
          <button className={styles.rotateBtn} onClick={rotateRight} aria-label={t('avatar.uploader.profileCrop.rotateRight')}>⟳</button>
        </div>
      </div>
      <div className={styles.actions}>
        <button
          className={styles.primary}
          disabled={!crop || busy}
          onClick={async () => {
            if (!crop) return;
            setBusy(true);
            try {
              await commit(crop);
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? t('avatar.uploader.saving') : t('avatar.uploader.profileCrop.saveAndContinue')}
        </button>
        <button className={styles.secondary} onClick={() => setStep("upload")}>
          {t('avatar.uploader.back')}
        </button>
      </div>
    </div>
  );
}
