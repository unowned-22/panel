import { useAvatarUploaderStore } from "../model/store";

export function useImageTransform() {
  const { rotation, zoom, setRotation, setZoom } = useAvatarUploaderStore();
  return {
    rotation,
    zoom,
    rotateLeft: () => setRotation((rotation - 90 + 360) % 360),
    rotateRight: () => setRotation((rotation + 90) % 360),
    setZoom,
    reset: () => {
      setRotation(0);
      setZoom(1);
    },
  };
}
