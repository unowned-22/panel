import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import styles from "./ThumbnailStep.module.css";
import { CropArea } from "../CropArea/CropArea";
import { ThumbnailPreview } from "../ThumbnailPreview/ThumbnailPreview";
import { useAvatarUploaderStore } from "../../model/store";
import { useThumbnailCrop } from "../../hooks/useThumbnailCrop";
import { loadImage } from "../../services/canvasUtils";
import type { CropArea as CropAreaT } from "../../model/types";

export function ThumbnailStep() {
  const { t } = useTranslation();
  const { profileBlobUrl, setStep } = useAvatarUploaderStore();
  const { commit } = useThumbnailCrop();
  const [crop, setCrop] = useState<CropAreaT | null>(null);
  const [imageSize, setImageSize] = useState<{ w: number; h: number } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profileBlobUrl) return;
    loadImage(profileBlobUrl).then((img) =>
      setImageSize({ w: img.naturalWidth, h: img.naturalHeight }),
    );
  }, [profileBlobUrl]);

  if (!profileBlobUrl) return null;

  return (
    <div className={styles.root}>
      <p className={styles.desc}>{t('avatar.uploader.thumbnailCrop.description')}</p>
      <div className={styles.body}>
        <CropArea imageUrl={profileBlobUrl} aspect={1} onChange={(c) => setCrop(c)} />
        <ThumbnailPreview src={profileBlobUrl} crop={crop} imageSize={imageSize} />
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
          {busy ? t('avatar.uploader.saving') : t('avatar.uploader.save')}
        </button>
        <button className={styles.secondary} onClick={() => setStep("profileCrop")}>
          {t('avatar.uploader.back')}
        </button>
      </div>
    </div>
  );
}
