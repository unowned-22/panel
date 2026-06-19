import { useDropzone } from "react-dropzone";
import { ACCEPTED_TYPES } from "./types";

interface Props {
  onFile: (file: File) => void;
  error?: string | null;
}

export function CoverUploadStep({ onFile, error }: Props) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_TYPES,
    multiple: false,
    onDrop: (files) => {
      if (files[0]) onFile(files[0]);
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="text-5xl">🖼️</div>
        <div>
          <h3 className="text-lg font-semibold">Profile cover</h3>
          <p className="mt-1 text-sm text-neutral-400">
            The cover will be displayed on the desktop version, tablets and mobile devices.
          </p>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          isDragActive
            ? "border-sky-400 bg-sky-500/10"
            : "border-sky-500/50 bg-sky-500/5 hover:bg-sky-500/10"
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-2xl text-sky-400">+</div>
        <div className="font-medium text-sky-400">Upload cover</div>
        <div className="text-xs text-neutral-400">
          We recommend a resolution of 1920 × 768.
          <br />
          Use JPG, GIF, PNG, WEBP or HEIC/HEIF format.
        </div>
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}
    </div>
  );
}
