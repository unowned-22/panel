export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AvatarUploaderResult {
  originalFile: File;
  profileImage: Blob;
  thumbnailImage: Blob;
  profileCrop: CropArea;
  thumbnailCrop: CropArea;
  rotation: number;
}

export type Step = "upload" | "profileCrop" | "thumbnailCrop" | "complete";

export interface AvatarUploaderProps {
  open: boolean;
  onClose: () => void;
  onComplete: (result: AvatarUploaderResult) => void;
  maxFileSize?: number;
  minimumImageSize?: number;
  allowedTypes?: string[];
}

export interface ValidationOptions {
  maxFileSize: number;
  allowedTypes: string[];
  minimumImageSize?: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}
