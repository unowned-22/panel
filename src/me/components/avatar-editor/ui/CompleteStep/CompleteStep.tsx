import { useEffect, useMemo, useState } from "react";
import styles from "./CompleteStep.module.css";
import { useAvatarUploaderStore } from "../../model/store";
import type { AvatarUploaderResult } from "../../model/types";

interface Props {
  onComplete: (r: AvatarUploaderResult) => void;
}

export function CompleteStep({ onComplete }: Props) {
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
        <div className={styles.avatar}>{profileUrl && <img src={profileUrl} alt="Avatar" />}</div>
        <div className={styles.thumb}>{thumbUrl && <img src={thumbUrl} alt="Thumbnail" />}</div>
      </div>
      <label className={styles.publish}>
        <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
        Publish post
      </label>
      <div className={styles.actions}>
        <button className={styles.primary} onClick={handleContinue}>Continue</button>
        <button className={styles.secondary} onClick={() => state.setStep("thumbnailCrop")}>
          Back
        </button>
      </div>
    </div>
  );
}
