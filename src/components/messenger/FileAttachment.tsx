import { FileText, Download } from "lucide-react";
import type { MessageFile } from "../MessengerContext";

const formatSize = (b: number) => {
  if (b < 1024) return `${b} Б`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} КБ`;
  return `${(b / 1024 / 1024).toFixed(2)} МБ`;
};

interface Props {
  file: MessageFile;
  isOwn?: boolean;
  compact?: boolean;
}

const FileAttachment = ({ file, isOwn, compact }: Props) => {
  const tone = isOwn
    ? "bg-primary-foreground/15 hover:bg-primary-foreground/20"
    : "bg-background/70 hover:bg-background";
  const icon = isOwn ? "text-primary-foreground" : "text-primary";
  const sub = isOwn ? "text-primary-foreground/75" : "text-muted-foreground";

  return (
    <a
      href={file.url}
      download={file.name}
      target="_blank"
      rel="noreferrer"
      className={`flex items-center gap-3 ${compact ? "px-2.5 py-2" : "px-3 py-2.5"} rounded-xl transition-colors ${tone} my-1 max-w-[320px]`}
    >
      <div className={`w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 ${icon}`}>
        <FileText size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium truncate">{file.name}</p>
        <p className={`text-[11px] ${sub}`}>{formatSize(file.size)}</p>
      </div>
      <Download size={16} className={`shrink-0 ${sub}`} />
    </a>
  );
};

export default FileAttachment;
