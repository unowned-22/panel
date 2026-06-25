import { useState } from "react";
import { BellOff, FileText, Image as ImageIcon, LogOut, Star, UserPlus, X, Download } from "lucide-react";
import { useMessenger } from "@/hooks/use-messenger";

interface ChatInfoPanelProps {
  chatId: string;
  onClose: () => void;
}

const TABS = ["Медиа", "Файлы", "Ссылки", "Голос"] as const;

const formatSize = (b: number) => {
  if (b < 1024) return `${b} Б`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} КБ`;
  return `${(b / 1024 / 1024).toFixed(2)} МБ`;
};

const ChatInfoPanel = ({ chatId, onClose }: ChatInfoPanelProps) => {
  const { contacts, getMembers, getMediaFromChat, getFilesFromChat } = useMessenger();
  const contact = contacts.find((c) => c.id === chatId);
  const members = getMembers(chatId);
  const media = getMediaFromChat(chatId);
  const files = getFilesFromChat(chatId);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Медиа");


  if (!contact) return null;

  const subtitle = contact.isGroup
    ? `${members.length} ${members.length === 1 ? "участник" : "участника"}`
    : contact.online
    ? "в сети"
    : "был(а) недавно";

  return (
    <aside className="w-75 shrink-0 border-l border-border bg-card flex flex-col overflow-y-auto">
      <div className="flex justify-end p-3">
        <button
          onClick={onClose}
          className="p-2 hover:bg-secondary rounded-lg text-foreground/70"
          aria-label="Закрыть"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-col items-center px-4 pb-4">
        {contact.avatar ? (
          <img
            src={contact.avatar}
            alt={contact.name}
            className="w-20 h-20 rounded-full object-cover mb-3"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-2xl font-bold mb-3">
            {contact.name.charAt(0).toUpperCase()}
          </div>
        )}
        <h3 className="font-semibold text-sm text-center">{contact.name}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
        {contact.description && (
          <p className="text-xs text-muted-foreground text-center mt-2 px-2">
            {contact.description}
          </p>
        )}
      </div>

      <div className="flex justify-center gap-6 py-4 border-y border-border">
        {[
          { icon: UserPlus, label: "Добавить" },
          { icon: BellOff, label: "Без звука" },
          { icon: LogOut, label: "Выйти" },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="flex flex-col items-center gap-1.5 text-foreground/70 hover:text-foreground transition-colors"
          >
            <Icon size={20} />
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>

      {members.length > 0 && contact.isGroup && (
        <div className="py-2">
          <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Участники
          </p>
          {members.map((m, idx) => (
            <div
              key={m.id}
              className="flex items-center gap-3 px-4 py-2 hover:bg-secondary/60 transition-colors"
            >
              <div className="relative">
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {m.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-card" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{m.name}</p>
                <p className={`text-xs truncate ${m.online ? "text-emerald-500" : "text-muted-foreground"}`}>
                  {m.status}
                </p>
              </div>
              {idx === 0 && (
                <Star size={14} className="text-primary shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto border-t border-border">
        <div className="flex">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-xs font-medium transition-colors ${
                tab === t
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {tab === "Медиа" && (
          media.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
              <ImageIcon size={28} className="opacity-50" />
              Здесь будет медиа из чата
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5 p-1">
              {media.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="w-full aspect-square object-cover rounded-sm"
                />
              ))}
            </div>
          )
        )}
        {tab === "Файлы" && (
          files.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
              <FileText size={28} className="opacity-50" />
              Файлов пока нет
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {files.map((f, i) => (
                <a
                  key={i}
                  href={f.url}
                  download={f.name}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-secondary/60 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center text-primary shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium truncate">{f.name}</p>
                    <p className="text-[11px] text-muted-foreground">{formatSize(f.size)}</p>
                  </div>
                  <Download size={14} className="text-muted-foreground shrink-0" />
                </a>
              ))}
            </div>
          )
        )}
        {(tab === "Ссылки" || tab === "Голос") && (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Пока ничего нет
          </div>
        )}

      </div>
    </aside>
  );
};

export default ChatInfoPanel;
