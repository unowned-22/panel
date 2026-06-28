import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import styles from "./UploadStep.module.css";
import { useAvatarUploaderStore } from "../../model/store";
import { validateImage } from "../../services/imageValidation";
import { normalizeImageFile } from "@/lib/normalizeImageFile";

interface Props {
  maxFileSize: number;
  allowedTypes: string[];
  minimumImageSize: number;
}

export function UploadStep({ maxFileSize, allowedTypes, minimumImageSize }: Props) {
  const { setFile, setStep, setError, error } = useAvatarUploaderStore();

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      const res = await validateImage(file, { maxFileSize, allowedTypes, minimumImageSize });
      if (!res.valid) {
        setError(res.error);
        return;
      }
        const normalized = await normalizeImageFile(file);
        const url = URL.createObjectURL(normalized);
      setFile(file, url);
      setStep("profileCrop");
    },
    [maxFileSize, allowedTypes, minimumImageSize, setFile, setStep, setError],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: false,
    noClick: true,
    noKeyboard: true,
    accept: allowedTypes.reduce<Record<string, string[]>>((acc, t) => {
      acc[t] = [];
      return acc;
    }, {}),
  });

  return (
    <div className={styles.root}>
      <div {...getRootProps()} className={styles.dropzone} data-active={isDragActive}>
        <input {...getInputProps()} />
        <p className={styles.help}>
          Upload a real photo of yourself so that friends can easily recognize you.
          <br />
          You can upload an image in JPG, GIF, PNG, WEBP or HEIC/HEIF format.
        </p>
      </div>
      <button type="button" className={styles.select} onClick={open}>
        Select a file
      </button>
      {error && <p className={styles.error}>{error}</p>}
      <p className={styles.footer}>
        If you have any problems with your upload, try using a smaller photo.
      </p>
    </div>
  );
}
