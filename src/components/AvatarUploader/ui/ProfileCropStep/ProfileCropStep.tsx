import { useState } from "react";
import styles from "./ProfileCropStep.module.css";
import { CropArea } from "../CropArea/CropArea";
import { useAvatarUploaderStore } from "../../model/store";
import { useImageCrop } from "../../hooks/useImageCrop";
import { useImageTransform } from "../../hooks/useImageTransform";
import type { CropArea as CropAreaT } from "../../model/types";

export function ProfileCropStep() {
  const { imageUrl, setStep } = useAvatarUploaderStore();
  const { rotation, rotateLeft, rotateRight } = useImageTransform();
  const { commit } = useImageCrop();
  const [crop, setCrop] = useState<CropAreaT | null>(null);
  const [busy, setBusy] = useState(false);

  if (!imageUrl) return null;

  return (
    <div className={styles.root}>
      <p className={styles.desc}>
        Please select an area for your profile picture.
        <br />
        You can rotate the image to position it properly.
      </p>
      <div className={styles.cropWrap}>
        <CropArea imageUrl={imageUrl} rotation={rotation} aspect={1} onChange={(c) => setCrop(c)} />
        <div className={styles.rotateBtns}>
          <button className={styles.rotateBtn} onClick={rotateLeft} aria-label="Rotate left">⟲</button>
          <button className={styles.rotateBtn} onClick={rotateRight} aria-label="Rotate right">⟳</button>
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
          {busy ? "Saving…" : "Save and continue"}
        </button>
        <button className={styles.secondary} onClick={() => setStep("upload")}>
          Back
        </button>
      </div>
    </div>
  );
}
