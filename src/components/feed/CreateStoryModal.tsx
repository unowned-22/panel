import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, Type, X } from "lucide-react";
import { useStories } from "@/hooks/use-stories.ts";
import { toast } from "sonner";

const gradients = [
  "linear-gradient(135deg, hsl(211 100% 56%), hsl(280 80% 60%))",
  "linear-gradient(135deg, hsl(340 90% 55%), hsl(25 100% 55%))",
  "linear-gradient(135deg, hsl(170 80% 45%), hsl(220 90% 55%))",
  "linear-gradient(135deg, hsl(290 80% 60%), hsl(320 80% 50%))",
];

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

export const CreateStoryModal = ({ open, onOpenChange }: Props) => {
  const { addMyStory } = useStories();
  const [mode, setMode] = useState<"photo" | "text">("photo");
  const [image, setImage] = useState<string | undefined>();
  const [text, setText] = useState("");
  const [bg, setBg] = useState(gradients[0]);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setImage(undefined);
    setText("");
    setMode("photo");
    setBg(gradients[0]);
  };

  const onFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(f);
  };

  const publish = () => {
    if (mode === "photo" && !image) {
      toast.error("Выберите фото");
      return;
    }
    if (mode === "text" && !text.trim()) {
      toast.error("Напишите текст истории");
      return;
    }
    if (mode === "photo") addMyStory({ image, text: text.trim() || undefined });
    else addMyStory({ text: text.trim(), background: bg });
    toast.success("История опубликована");
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Новая история</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          <Button variant={mode === "photo" ? "default" : "secondary"} size="sm" onClick={() => setMode("photo")}>
            <ImageIcon className="w-4 h-4 mr-1" /> Фото
          </Button>
          <Button variant={mode === "text" ? "default" : "secondary"} size="sm" onClick={() => setMode("text")}>
            <Type className="w-4 h-4 mr-1" /> Текст
          </Button>
        </div>

        <div
          className="relative w-full aspect-9/16 rounded-xl overflow-hidden flex items-center justify-center"
          style={{ background: mode === "text" ? bg : "hsl(var(--muted))" }}
        >
          {mode === "photo" && image && (
            <>
              <img src={image} alt="preview" className="w-full h-full object-cover" />
              <button
                onClick={() => setImage(undefined)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/70 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
          {mode === "photo" && !image && (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center gap-2 text-muted-foreground"
            >
              <ImageIcon className="w-10 h-10" />
              <span className="text-sm">Загрузить фото</span>
            </button>
          )}
          {mode === "text" && (
            <p className="px-6 text-center text-2xl font-semibold text-white wrap-break-word max-w-full">
              {text || "Ваш текст…"}
            </p>
          )}
          {mode === "photo" && image && text && (
            <p className="absolute bottom-6 left-0 right-0 px-4 text-center text-lg font-semibold text-white drop-shadow">
              {text}
            </p>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        />

        <Textarea
          placeholder={mode === "text" ? "Текст истории" : "Подпись (необязательно)"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
        />

        {mode === "text" && (
          <div className="flex gap-2">
            {gradients.map((g) => (
              <button
                key={g}
                onClick={() => setBg(g)}
                className={`w-8 h-8 rounded-full border-2 ${bg === g ? "border-foreground" : "border-transparent"}`}
                style={{ background: g }}
              />
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button onClick={publish}>Опубликовать</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
