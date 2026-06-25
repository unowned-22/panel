import { useRef, useState } from "react";
import { Camera, Megaphone, Users } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useMessenger } from "../MessengerContext";

type Kind = "group" | "private";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (id: string) => void;
}

const MAX_NAME = 64;
const MAX_DESC = 240;

const CreateChatDialog = ({ open, onOpenChange, onCreated }: Props) => {
  const { availableMembers, createChat } = useMessenger();
  const [step, setStep] = useState<"type" | "details">("type");
  const [kind, setKind] = useState<Kind>("group");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState<string | undefined>();
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep("type");
    setKind("group");
    setName("");
    setDescription("");
    setAvatar(undefined);
    setMemberIds([]);
  };

  const close = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleAvatar = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Загрузите изображение");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Размер до 2 МБ");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const toggleMember = (id: string) =>
    setMemberIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Введите название");
      return;
    }
    if (kind === "group" && memberIds.length === 0) {
      toast.error("Добавьте хотя бы одного участника");
      return;
    }
    const id = createChat({
      name: trimmed,
      isGroup: kind === "group",
      memberIds: kind === "group" ? memberIds : undefined,
      avatar,
      description: description.trim() || undefined,
    });
    toast.success(kind === "group" ? "Группа создана" : "Чат создан");
    onCreated?.(id);
    close(false);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "type"
              ? "Создать новый чат"
              : kind === "group"
              ? "Новая группа"
              : "Новый чат"}
          </DialogTitle>
          <DialogDescription>
            {step === "type"
              ? "Выберите, что хотите создать."
              : kind === "group"
              ? "Группы позволяют общаться нескольким участникам."
              : "Личный чат с одним собеседником."}
          </DialogDescription>
        </DialogHeader>

        {step === "type" && (
          <div className="space-y-2">
            <button
              onClick={() => {
                setKind("group");
                setStep("details");
              }}
              className="w-full flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-secondary transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Users size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm">Новая группа</p>
                <p className="text-xs text-muted-foreground">До 200 000 участников</p>
              </div>
            </button>
            <button
              onClick={() => {
                setKind("private");
                setStep("details");
              }}
              className="w-full flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-secondary transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Megaphone size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm">Новый чат</p>
                <p className="text-xs text-muted-foreground">Личный диалог</p>
              </div>
            </button>
          </div>
        )}

        {step === "details" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileRef.current?.click()}
                className="relative w-16 h-16 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0 hover:bg-secondary/80 transition-colors"
                aria-label="Загрузить аватар"
              >
                {avatar ? (
                  <img src={avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={22} className="text-muted-foreground" />
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleAvatar(e.target.files?.[0])}
              />
              <div className="flex-1 space-y-1">
                <Label htmlFor="chat-name">Название</Label>
                <Input
                  id="chat-name"
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, MAX_NAME))}
                  placeholder={kind === "group" ? "Название группы" : "Имя собеседника"}
                  maxLength={MAX_NAME}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="chat-desc">Описание (необязательно)</Label>
              <Textarea
                id="chat-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESC))}
                placeholder="О чём этот чат?"
                rows={3}
                maxLength={MAX_DESC}
              />
              <p className="text-[11px] text-muted-foreground text-right">
                {description.length}/{MAX_DESC}
              </p>
            </div>

            {kind === "group" && (
              <div className="space-y-2">
                <Label>Участники ({memberIds.length})</Label>
                <div className="max-h-48 overflow-y-auto border border-border rounded-lg divide-y divide-border">
                  {availableMembers.map((m) => {
                    const checked = memberIds.includes(m.id);
                    return (
                      <label
                        key={m.id}
                        className="flex items-center gap-3 p-2.5 hover:bg-secondary cursor-pointer transition-colors"
                      >
                        <Checkbox checked={checked} onCheckedChange={() => toggleMember(m.id)} />
                        <img src={m.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{m.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{m.status}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          {step === "details" ? (
            <>
              <Button variant="ghost" onClick={() => setStep("type")}>
                Назад
              </Button>
              <Button onClick={handleCreate}>Создать</Button>
            </>
          ) : (
            <Button variant="ghost" onClick={() => close(false)}>
              Отмена
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChatDialog;
