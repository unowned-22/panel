export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CoverCropResult {
  originalFile: File;
  mobile: CropRect;
  desktop: CropRect;
}

export interface CoverEditorProps {
  open: boolean;
  image?: string;
  avatar?: string;
  userName?: string;
  onClose(): void;
  onSave(result: CoverCropResult): void;
}

export const MOBILE_RATIO = 911 / 365;
export const DESKTOP_RATIO = 911 / 227;
export const MIN_MOBILE_WIDTH = 250;
export const MIN_DESKTOP_WIDTH = 250;
export const ACCEPTED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "image/webp": [".webp"],
  "image/heic": [".heic"],
  "image/heif": [".heif"],
};
