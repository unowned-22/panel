import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowUp,
  Smile,
  Info,
  ChevronLeft,
  MapPin,
  Music2,
  BarChart3,
  FileText,
  UserPlus,
  ChevronDown,
  Clock,
  Check,
  MoreHorizontal,
  FileEdit,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type View = "compose" | "drafts" | "settings" | "schedule";
type Audience = "Все" | "Друзья" | "Близкие друзья";

const EMOJIS = [
  "😀","😃","😄","😁","😅","😂","🤣","😊","😉","😌","😎","🥳","🤩","🤗","😘","😍","🥰","😋","😜","🤪","😝","🤑","🤭","🤫","🤔","🙄","😏","😒","😞","😔","😕","🙁","☹️","😣","😖","😫","😩","🥺","😢","😭","😤","😠","😡","🤬","🤯","😳","🥵","🥶","😱","😨","😰","😥","😓","🤗","🤔","🤭","🤫","🤥","😶","😐","😑","😬","🙄","😯","😦","😧","😮","😲","🥱","😴","🤤","😪","😵","🤐","🥴","🤢","🤮","🤧","😷","🤒","🤕","🤑","🤠","💀","☠️","👻","👽","🤖","😺","😸","😹","😻","😼","😽","🙀","😿","😾","🐶","🐱","🦄","🐯","🦁","🐸","🐵","🙈","🙉","🙊","🦠","🌹","🌸","🌺","🌻","🌼","🌷","💐","🍀","🌍","🌙","⭐","✨","🔥","💧","🌈","☀️","⛅","☁️","❄️","☃️","⚡","💥","💫"
];

const AUDIENCES: Audience[] = ["Все", "Друзья", "Близкие друзья"];

type Draft = { id: string; text: string; date: string };

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export const CreatePostModal = ({ open, onOpenChange }: Props) => {
  const [view, setView] = useState<View>("compose");
  const [text, setText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([
    { id: "d1", text: "test", date: "26 апр в 12:10" },
  ]);
  const [audience, setAudience] = useState<Audience>("Все");
  const [audienceOpen, setAudienceOpen] = useState(false);
  const [extraOpen, setExtraOpen] = useState(false);
  const [comments, setComments] = useState(true);
  const [notify, setNotify] = useState(true);
  const [scheduleDate, setScheduleDate] = useState<{ d: number; h: number; m: number } | null>(null);
  const { toast } = useToast();

  const reset = () => {
    setView("compose");
    setText("");
    setEmojiOpen(false);
    setAudience("Все");
    setExtraOpen(false);
    setScheduleDate(null);
  };

  const close = () => {
    onOpenChange(false);
    setTimeout(reset, 200);
  };

  const publish = () => {
    if (!text.trim()) {
      toast({ title: "Пустой пост", description: "Добавьте текст или вложение" });
      return;
    }
    toast({
      title: scheduleDate ? "Пост запланирован" : "Пост опубликован",
      description: text.slice(0, 80),
    });
    close();
  };

  const saveDraft = () => {
    if (!text.trim()) {
      close();
      return;
    }
    setDrafts((d) => [
      { id: String(Date.now()), text, date: "только что" },
      ...d,
    ]);
    toast({ title: "Черновик сохранён" });
    close();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(true) : close())}>
      <DialogContent
        className="max-w-[640px] p-0 overflow-hidden bg-card border-border [&>button]:hidden"
      >
        <DialogTitle className="sr-only">Создать пост</DialogTitle>
        <DialogDescription className="sr-only">
          Окно создания публикации
        </DialogDescription>

        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-border/60">
          {view === "compose" ? (
            <>
              <div className="font-semibold">Новый пост</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView("drafts")}
                  className="flex items-center gap-2 h-9 px-3 rounded-xl bg-secondary/60 hover:bg-secondary text-sm"
                >
                  <FileEdit className="w-4 h-4" />
                  Черновики
                </button>
                <button
                  onClick={close}
                  className="w-8 h-8 rounded-full bg-secondary/60 hover:bg-secondary flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : view === "drafts" ? (
            <>
              <button
                onClick={() => setView("compose")}
                className="flex items-center gap-1 text-sm hover:opacity-80"
              >
                <ChevronLeft className="w-4 h-4" /> Назад
              </button>
              <div className="font-semibold">Черновики</div>
              <button
                onClick={close}
                className="w-8 h-8 rounded-full bg-secondary/60 hover:bg-secondary flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setView("compose")}
                className="flex items-center gap-1 text-sm hover:opacity-80"
              >
                <ChevronLeft className="w-4 h-4" /> Редактировать
              </button>
              <div className="font-semibold">Настройки</div>
              <button
                onClick={close}
                className="w-8 h-8 rounded-full bg-secondary/60 hover:bg-secondary flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Body */}
        {view === "compose" && (
          <div className="p-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
            <div className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center gap-3 min-h-[280px]">
              <div className="w-14 h-14 rounded-xl border-2 border-dashed border-border flex items-center justify-center">
                <ArrowUp className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <div className="text-base font-medium mb-3">Добавьте фото или видео</div>
                <button className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-sm font-medium">
                  Загрузить с устройства
                </button>
                <button className="block mx-auto mt-2 text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                  Выбрать из ВКонтакте <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="Напишите что-нибудь..."
                className="w-full bg-transparent resize-none outline-none text-sm placeholder:text-muted-foreground pr-10"
              />
              <button
                onClick={() => setEmojiOpen((v) => !v)}
                className="absolute right-0 top-0 w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground"
              >
                <Smile className="w-5 h-5" />
              </button>
              {emojiOpen && (
                <div className="absolute right-0 top-10 z-10 w-[360px] max-h-[280px] overflow-y-auto panel-card p-3 bg-popover border-border shadow-xl">
                  <div className="text-xs text-muted-foreground mb-2">Эмоции</div>
                  <div className="grid grid-cols-12 gap-1">
                    {EMOJIS.map((e, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setText((t) => t + e);
                          setEmojiOpen(false);
                        }}
                        className="w-7 h-7 hover:bg-secondary rounded text-lg flex items-center justify-center"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {view === "drafts" && (
          <div className="min-h-[420px] max-h-[70vh] overflow-y-auto p-4">
            {drafts.length === 0 ? (
              <div className="h-full min-h-[380px] flex flex-col items-center justify-center text-center gap-3">
                <div className="text-base font-semibold">У вас пока нет черновиков</div>
                <div className="text-sm text-muted-foreground max-w-xs">
                  Вместо публикации можно сохранить черновик и вернуться к нему позже — он будет ждать здесь
                </div>
                <button
                  onClick={() => setView("compose")}
                  className="mt-2 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-sm font-medium"
                >
                  Создать пост
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {drafts.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/60 cursor-pointer"
                    onClick={() => {
                      setText(d.text);
                      setView("compose");
                    }}
                  >
                    <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{d.text}</div>
                      <div className="text-xs text-muted-foreground">{d.date}</div>
                    </div>
                    <button className="w-8 h-8 rounded-full hover:bg-secondary text-vk-blue flex items-center justify-center">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === "settings" && (
          <div className="p-4 max-h-[70vh] overflow-y-auto flex flex-col gap-1">
            {text && (
              <>
                <div className="text-sm px-2 py-2 text-muted-foreground">{text}</div>
                <div className="h-px bg-border/60 my-1" />
              </>
            )}

            {[
              { icon: MapPin, label: "Место" },
              { icon: Music2, label: "Музыка" },
              { icon: BarChart3, label: "Опрос" },
              { icon: FileText, label: "Файл" },
            ].map((row) => (
              <button
                key={row.label}
                className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-secondary/60 text-left"
              >
                <row.icon className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">{row.label}</span>
              </button>
            ))}

            <div className="h-px bg-border/60 my-1" />

            <button className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-secondary/60 text-left">
              <UserPlus className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">Пригласить соавторов</span>
            </button>

            <div className="h-px bg-border/60 my-1" />

            <div className="relative">
              <button
                onClick={() => setAudienceOpen((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-secondary/60 text-left"
              >
                <div>
                  <div className="text-sm font-medium">Кто увидит этот пост</div>
                  <div className="text-xs text-muted-foreground">{audience}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
              {audienceOpen && (
                <div className="absolute left-0 right-0 mt-1 z-10 panel-card p-2 bg-popover border-border shadow-xl">
                  <div className="text-xs text-muted-foreground px-3 py-1">Кто увидит этот пост</div>
                  {AUDIENCES.map((a) => (
                    <button
                      key={a}
                      onClick={() => {
                        setAudience(a);
                        setAudienceOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-secondary text-sm"
                    >
                      {a}
                      {audience === a && <Check className="w-4 h-4 text-vk-blue" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-px bg-border/60 my-1" />

            <button
              onClick={() => setExtraOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-secondary/60"
            >
              <div className="text-sm font-semibold">Дополнительно</div>
              <ChevronDown className={`w-4 h-4 transition-transform ${extraOpen ? "rotate-180" : ""}`} />
            </button>

            {extraOpen && (
              <div className="px-3 flex flex-col gap-3 pb-2">
                <Toggle label="Комментарии к посту" value={comments} onChange={setComments} />
                <Toggle
                  label="Уведомление для друзей"
                  hint="Придёт друзьям, которым этот пост может быть интересен"
                  value={notify}
                  onChange={setNotify}
                />
                <div>
                  <div className="text-sm">Отметка «Реклама от автора»</div>
                  <div className="text-xs text-muted-foreground">
                    Отсутствует. Изменить отметку после публикации нельзя.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {view === "compose" && (
          <div className="border-t border-border/60 px-5 h-16 flex items-center justify-between">
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <Info className="w-4 h-4" />
              Советы по публикации
            </button>
            <button
              onClick={() => setView("settings")}
              className="px-5 h-10 rounded-xl bg-white text-black hover:bg-white/90 text-sm font-semibold"
            >
              Далее
            </button>
          </div>
        )}

        {view === "settings" && (
          <div className="border-t border-border/60 px-5 h-16 flex items-center justify-between gap-2">
            <button onClick={saveDraft} className="text-sm hover:opacity-80">
              Сохранить черновик
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView("schedule")}
                className="h-10 px-4 rounded-xl bg-secondary hover:bg-secondary/80 text-sm flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                {scheduleDate ? `Сегодня в ${String(scheduleDate.h).padStart(2,"0")}:${String(scheduleDate.m).padStart(2,"0")}` : "Запланировать"}
              </button>
              <button
                onClick={publish}
                className="h-10 px-5 rounded-xl bg-white text-black hover:bg-white/90 text-sm font-semibold"
              >
                {scheduleDate ? "Добавить в очередь" : "Опубликовать"}
              </button>
            </div>
          </div>
        )}

        {view === "schedule" && (
          <SchedulePicker
            value={scheduleDate}
            onCancel={() => setView("settings")}
            onApply={(v) => {
              setScheduleDate(v);
              setView("settings");
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

const Toggle = ({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-start justify-between gap-3 py-1">
    <div className="flex-1">
      <div className="text-sm">{label}</div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`relative w-10 h-6 rounded-full transition-colors ${value ? "bg-vk-blue" : "bg-secondary"}`}
    >
      <span
        className={`absolute top-0.5 ${value ? "left-[18px]" : "left-0.5"} w-5 h-5 rounded-full bg-white transition-all`}
      />
    </button>
  </div>
);

const SchedulePicker = ({
  value,
  onApply,
  onCancel,
}: {
  value: { d: number; h: number; m: number } | null;
  onApply: (v: { d: number; h: number; m: number }) => void;
  onCancel: () => void;
}) => {
  const today = new Date();
  const [day, setDay] = useState(value?.d ?? today.getDate());
  const [hour, setHour] = useState(value?.h ?? today.getHours());
  const [minute, setMinute] = useState(value?.m ?? today.getMinutes());

  const month = today.toLocaleString("ru-RU", { month: "long" });
  const year = today.getFullYear();
  const daysInMonth = new Date(year, today.getMonth() + 1, 0).getDate();
  const firstDow = (new Date(year, today.getMonth(), 1).getDay() + 6) % 7; // monday-first

  return (
    <div className="p-5 max-h-[70vh] overflow-y-auto">
      <div className="flex items-center gap-3 mb-4">
        <button className="px-3 h-9 rounded-lg border border-border text-sm capitalize">{month}</button>
        <button className="px-3 h-9 rounded-lg border border-border text-sm">{year}</button>
        <button className="ml-auto w-9 h-9 rounded-lg hover:bg-secondary flex items-center justify-center text-vk-blue">
          <ChevronLeft className="w-4 h-4 rotate-180" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">
        {["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
          const past = d < today.getDate();
          const active = d === day;
          return (
            <button
              key={d}
              disabled={past}
              onClick={() => setDay(d)}
              className={`h-9 rounded-full text-sm ${
                active ? "bg-vk-blue text-white" : past ? "text-muted-foreground/40" : "hover:bg-secondary"
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 mt-5">
        <select
          value={hour}
          onChange={(e) => setHour(Number(e.target.value))}
          className="h-10 px-3 rounded-lg bg-secondary text-sm outline-none"
        >
          {Array.from({ length: 24 }, (_, i) => (
            <option key={i} value={i}>{String(i).padStart(2, "0")}</option>
          ))}
        </select>
        <span>:</span>
        <select
          value={minute}
          onChange={(e) => setMinute(Number(e.target.value))}
          className="h-10 px-3 rounded-lg bg-secondary text-sm outline-none"
        >
          {Array.from({ length: 60 }, (_, i) => (
            <option key={i} value={i}>{String(i).padStart(2, "0")}</option>
          ))}
        </select>
        <button onClick={onCancel} className="ml-auto h-10 px-4 rounded-lg bg-secondary hover:bg-secondary/80 text-sm">
          Сброс
        </button>
        <button
          onClick={() => onApply({ d: day, h: hour, m: minute })}
          className="h-10 px-4 rounded-lg bg-white text-black hover:bg-white/90 text-sm font-semibold"
        >
          Применить
        </button>
      </div>
    </div>
  );
};
