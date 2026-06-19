import { useCallback } from "react";
import { useAvatarUploaderStore } from "../model/store";
import { cropImage } from "../services/cropImage";
import { loadImage } from "../services/canvasUtils";
import type { CropArea } from "../model/types";

export function useImageCrop() {
  const { imageUrl, rotation, setProfileBlob, setProfileCrop, setStep } = useAvatarUploaderStore();

  const commit = useCallback(
    async (crop: CropArea) => {
      if (!imageUrl) return;
      const img = await loadImage(imageUrl);
      const blob = await cropImage(img, crop, rotation);
      const url = URL.createObjectURL(blob);
      setProfileBlob(blob, url);
      setProfileCrop(crop);
      setStep("thumbnailCrop");
    },
    [imageUrl, rotation, setProfileBlob, setProfileCrop, setStep],
  );

  return { commit };
}
