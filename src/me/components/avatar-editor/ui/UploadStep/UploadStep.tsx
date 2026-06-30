import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "@/hooks/use-translation";
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
  const { t } = useTranslation();
  const { setFile, setStep, setError, error } = useAvatarUploaderStore();

  const renderValidationError = (errorCode: string | undefined, params?: { max?: string; size?: string }) => {
    if (!errorCode) return undefined;
    switch (errorCode) {
      case 'tooLarge':
        return t('avatar.uploader.validation.tooLarge').replace('{max}', params?.max ?? '0');
      case 'unsupportedFormat':
        return t('avatar.uploader.validation.unsupportedFormat');
      case 'minSize':
        return t('avatar.uploader.validation.minSize').replace('{size}', params?.size ?? '0');
      case 'readFailed':
        return t('avatar.uploader.validation.readFailed');
      default:
        return undefined;
    }
  };

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      const res = await validateImage(file, { maxFileSize, allowedTypes, minimumImageSize });
      if (!res.valid) {
        setError(renderValidationError(res.errorCode, res.errorParams));
        return;
      }
      const normalized = await normalizeImageFile(file);
      const url = URL.createObjectURL(normalized);
      setFile(file, url);
      setStep("profileCrop");
    },
    [maxFileSize, allowedTypes, minimumImageSize, setFile, setStep, setError, t],
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
          {t('avatar.uploader.dropzone.help')}
          <br />
          {t('avatar.uploader.dropzone.formats')}
        </p>
      </div>
      <button type="button" className={styles.select} onClick={open}>
        {t('avatar.uploader.dropzone.select')}
      </button>
      {error && <p className={styles.error}>{error}</p>}
      <p className={styles.footer}>{t('avatar.uploader.dropzone.footer')}</p>
    </div>
  );
}
