import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import styles from "./CompleteStep.module.css";
import { useAvatarUploaderStore } from "../../model/store";
import type { AvatarUploaderResult } from "../../model/types";

interface Props {
  onComplete: (r: AvatarUploaderResult) => void;
}

export function CompleteStep({ onComplete }: Props) {
  const { t } = useTranslation();
  const state = useAvatarUploaderStore();
  const [publish, setPublish] = useState(false);

  const profileUrl = state.profileBlobUrl;
  const thumbUrl = useMemo(
    () => (state.thumbnailBlob ? URL.createObjectURL(state.thumbnailBlob) : undefined),
    [state.thumbnailBlob],
  );

  useEffect(() => {
    return () => {
      if (thumbUrl) URL.revokeObjectURL(thumbUrl);
    };
  }, [thumbUrl]);

  const handleContinue = () => {
    const { originalFile, profileBlob, thumbnailBlob, profileCrop, thumbnailCrop, rotation } = state;
    if (!originalFile || !profileBlob || !thumbnailBlob || !profileCrop || !thumbnailCrop) return;
    onComplete({
      originalFile,
      profileImage: profileBlob,
      thumbnailImage: thumbnailBlob,
      profileCrop,
      thumbnailCrop,
      rotation,
    });
  };

  return (
    <div className={styles.root}>
      <div className={styles.previews}>
        <div className={styles.avatar}>{profileUrl && <img src={profileUrl} alt={t('avatar.uploader.complete.avatarAlt')} />}</div>
        <div className={styles.thumb}>{thumbUrl && <img src={thumbUrl} alt={t('avatar.uploader.complete.thumbnailAlt')} />}</div>
      </div>
      <label className={styles.publish}>
        <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
        {t('avatar.uploader.complete.publishPost')}
      </label>
      <div className={styles.actions}>
        <button className={styles.primary} onClick={handleContinue}>{t('avatar.uploader.complete.continue')}</button>
        <button className={styles.secondary} onClick={() => state.setStep("thumbnailCrop")}>{t('avatar.uploader.back')}</button>
      </div>
    </div>
  );
}
