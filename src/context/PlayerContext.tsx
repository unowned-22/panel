import { createContext, useContext, useState, ReactNode } from "react";

export type Track = {
  title: string;
  artist: string;
  cover?: string;
  duration: string;
};

type PlayerContextValue = {
  isActive: boolean;
  isPlaying: boolean;
  current: Track;
  play: (track?: Track) => void;
  pause: () => void;
  toggle: () => void;
  stop: () => void;
};

const defaultTrack: Track = {
  title: "Cheri Cheri Lady",
  artist: "DJ JEDY, Niki Four",
  duration: "2:52",
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [isActive, setIsActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [current, setCurrent] = useState<Track>(defaultTrack);

  const play = (track?: Track) => {
    if (track) setCurrent(track);
    setIsActive(true);
    setIsPlaying(true);
  };
  const pause = () => setIsPlaying(false);
  const toggle = () => {
    if (!isActive) {
      setIsActive(true);
      setIsPlaying(true);
    } else {
      setIsPlaying((p) => !p);
    }
  };
  const stop = () => {
    setIsActive(false);
    setIsPlaying(false);
  };

  return (
    <PlayerContext.Provider value={{ isActive, isPlaying, current, play, pause, toggle, stop }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
};
