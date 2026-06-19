import { useEffect, useRef, useState } from "react";
import { Modal } from "./Modal";
import { CoverUploadStep } from "./CoverUploadStep";
import { CoverCropStep } from "./CoverCropStep";
import { CoverPreviewModal } from "./CoverPreviewModal";
import type { CoverEditorProps, CropRect } from "./types";

export function CoverEditorModal({
  open,
  image,
  avatar,
  userName,
  onClose,
  onSave,
}: CoverEditorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(image ?? null);
  const [mobile, setMobile] = useState<CropRect | null>(null);
  const [desktop, setDesktop] = useState<CropRect | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  // reset when reopening
  useEffect(() => {
    if (!open) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setFile(null);
      setUrl(image ?? null);
      setMobile(null);
      setDesktop(null);
      setNatural(null);
      setPreviewOpen(false);
      setError(null);
    }
  }, [open, image]);

  const handleFile = (f: File) => {
    setError(null);
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const u = URL.createObjectURL(f);
    objectUrlRef.current = u;
    setFile(f);
    setUrl(u);
    setMobile(null);
    setDesktop(null);
  };

  const handleSave = () => {
    if (!mobile || !desktop) return;
    onSave({
      originalFile: file ?? new File([], "cover"),
      mobile,
      desktop,
    });
    onClose();
  };

  const inCropStep = !!url;

  return (
    <>
      <Modal
        open={open && !previewOpen}
        onClose={onClose}
        title={inCropStep ? "Edit cover" : "Add cover"}
        widthClass={inCropStep ? "max-w-4xl" : "max-w-md"}
        footer={
          inCropStep ? (
            <>
              <button
                onClick={() => setPreviewOpen(true)}
                disabled={!mobile || !desktop}
                className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 disabled:opacity-50"
              >
                Preview
              </button>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!mobile || !desktop}
                  className="rounded-md bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-200 disabled:opacity-50"
                >
                  Set cover
                </button>
              </div>
            </>
          ) : undefined
        }
      >
        {inCropStep && url ? (
          <div className="space-y-4">
            <p className="text-center text-sm text-neutral-400">
              The selected area will be seen on your profile
            </p>
            <CoverCropStep
              imageUrl={url}
              mobile={mobile}
              desktop={desktop}
              onChange={({ mobile: m, desktop: d, natural: n }) => {
                setMobile(m);
                setDesktop(d);
                setNatural(n);
              }}
              onLoadError={() => setError("Failed to load image")}
            />
            {error && <div className="text-center text-sm text-red-400">{error}</div>}
          </div>
        ) : (
          <CoverUploadStep onFile={handleFile} error={error} />
        )}
      </Modal>

      {url && mobile && desktop && natural && (
        <CoverPreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          onSetCover={handleSave}
          imageUrl={url}
          natural={natural}
          mobile={mobile}
          desktop={desktop}
          avatar={avatar}
          userName={userName}
        />
      )}
    </>
  );
}
