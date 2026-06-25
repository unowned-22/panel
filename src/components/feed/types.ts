export type AuthorKind = "user" | "group";

export type Author = {
  name: string;
  avatar?: string;
  subtitle?: string;
  /** Идентификатор для перехода на страницу: профиля или сообщества. */
  id?: string;
  kind?: AuthorKind;
};

export type AudioTrack = {
  kind: "track";
  title: string;
  artist: string;
  duration: string;
  cover?: string;
};

export type AudioVoice = {
  kind: "voice";
  duration: string;
  /** Заранее сгенерированные пики волны 0..1 */
  waveform: number[];
};

export type AudioMedia = AudioTrack | AudioVoice;

export type VideoMedia =
  | { kind: "upload"; src?: string; thumbnail: string; duration: string }
  | { kind: "youtube"; videoId: string; title: string; thumbnail?: string };

export type PostMedia =
  | { type: "photo"; images: string[] } // одно или коллекция
  | { type: "video"; video: VideoMedia }
  | { type: "audio"; audio: AudioMedia }
  | { type: "audio-collection"; tracks: AudioTrack[] };

export type PostStats = {
  likes: number;
  comments: number;
  shares: number;
  views?: number;
};

export type Comment = {
  id: string;
  author: Author;
  text: string;
  time: string;
  likes: number;
};

export type Post = {
  id: string;
  author: Author;
  time: string;
  text?: string;
  /** Может быть несколько медиа-блоков (например, текст + фото + аудио) */
  media?: PostMedia[];
  stats: PostStats;
  liked?: boolean;
  reposted?: boolean;
  comments?: Comment[];
  /** Если пост является репостом — здесь оригинальная запись (без своих stats/comments). */
  repost?: {
    original: Omit<Post, "repost" | "stats" | "comments">;
  };
};

/** Форматирование чисел: 23900 -> "23,9K" */
export const formatCount = (n: number): string => {
  if (n < 1000) return String(n);
  if (n < 1_000_000) {
    const v = n / 1000;
    return `${v.toFixed(v < 10 ? 1 : 0).replace(".", ",").replace(",0", "")}K`;
  }
  const v = n / 1_000_000;
  return `${v.toFixed(1).replace(".", ",").replace(",0", "")}M`;
};
