import { Play } from "lucide-react";

const YOUTUBE_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export const extractUrls = (text: string): string[] => text.match(URL_REGEX) || [];

interface Props {
  url: string;
  isOwn?: boolean;
}

const LinkPreview = ({ url, isOwn }: Props) => {
  const yt = url.match(YOUTUBE_REGEX);
  if (yt) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="block mt-2 rounded-lg overflow-hidden border-l-[3px] border-primary">
        <div className="relative">
          <img src={`https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`} alt="YouTube"
            className="w-full max-h-45 object-cover" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
              <Play size={22} className="text-white ml-0.5" fill="white" />
            </div>
          </div>
        </div>
        <div className={`px-3 py-2 ${isOwn ? "bg-white/10" : "bg-secondary"}`}>
          <p className="text-[12px] text-primary font-medium">YouTube</p>
          <p className={`text-[14px] font-medium line-clamp-2 ${isOwn ? "text-primary-foreground" : "text-foreground"}`}>
            Видео
          </p>
        </div>
      </a>
    );
  }
  const domain = (() => { try { return new URL(url).hostname; } catch { return url; } })();
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className={`block mt-2 rounded-lg overflow-hidden border-l-[3px] border-primary px-3 py-2 transition-colors ${
        isOwn ? "bg-white/10 hover:bg-white/15" : "bg-secondary hover:bg-secondary/80"
      }`}>
      <p className="text-[12px] text-primary font-medium">{domain}</p>
      <p className={`text-[13px] line-clamp-1 ${isOwn ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
        {url}
      </p>
    </a>
  );
};

export default LinkPreview;
