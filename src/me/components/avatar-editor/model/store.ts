import { create } from "zustand";
import type { CropArea, Step } from "./types";

interface AvatarUploaderState {
  step: Step;
  originalFile?: File;
  imageUrl?: string;
  profileCrop?: CropArea;
  thumbnailCrop?: CropArea;
  profileBlob?: Blob;
  profileBlobUrl?: string;
  thumbnailBlob?: Blob;
  rotation: number;
  zoom: number;
  error?: string;

  setStep: (s: Step) => void;
  setFile: (file: File, url: string) => void;
  setRotation: (r: number) => void;
  setZoom: (z: number) => void;
  setProfileCrop: (c: CropArea) => void;
  setThumbnailCrop: (c: CropArea) => void;
  setProfileBlob: (b: Blob, url: string) => void;
  setThumbnailBlob: (b: Blob) => void;
  setError: (e?: string) => void;
  reset: () => void;
}

const initial = {
  step: "upload" as Step,
  rotation: 0,
  zoom: 1,
};

export const useAvatarUploaderStore = create<AvatarUploaderState>((set, get) => ({
  ...initial,
  setStep: (step) => set({ step }),
  setFile: (originalFile, imageUrl) => set({ originalFile, imageUrl, error: undefined }),
  setRotation: (rotation) => set({ rotation }),
  setZoom: (zoom) => set({ zoom }),
  setProfileCrop: (profileCrop) => set({ profileCrop }),
  setThumbnailCrop: (thumbnailCrop) => set({ thumbnailCrop }),
  setProfileBlob: (profileBlob, profileBlobUrl) => {
    const prev = get().profileBlobUrl;
    if (prev) URL.revokeObjectURL(prev);
    set({ profileBlob, profileBlobUrl });
  },
  setThumbnailBlob: (thumbnailBlob) => set({ thumbnailBlob }),
  setError: (error) => set({ error }),
  reset: () => {
    const { imageUrl, profileBlobUrl } = get();
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (profileBlobUrl) URL.revokeObjectURL(profileBlobUrl);
    set({
      ...initial,
      originalFile: undefined,
      imageUrl: undefined,
      profileCrop: undefined,
      thumbnailCrop: undefined,
      profileBlob: undefined,
      profileBlobUrl: undefined,
      thumbnailBlob: undefined,
      error: undefined,
    });
  },
}));
