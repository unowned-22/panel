import { useCallback } from "react";
import { useAvatarUploaderStore } from "../model/store";
import { generateThumbnail } from "../services/generateThumbnail";
import type { CropArea } from "../model/types";

export function useThumbnailCrop() {
  const { profileBlob, setThumbnailBlob, setThumbnailCrop, setStep } = useAvatarUploaderStore();

  const commit = useCallback(
    async (crop: CropArea) => {
      if (!profileBlob) return;
      const blob = await generateThumbnail(profileBlob, crop);
      setThumbnailBlob(blob);
      setThumbnailCrop(crop);
      setStep("complete");
    },
    [profileBlob, setThumbnailBlob, setThumbnailCrop, setStep],
  );

  return { commit };
}
