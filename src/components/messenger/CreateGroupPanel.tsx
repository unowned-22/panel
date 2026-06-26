import { useRef, useState } from "react";
import { X, Image as ImageIcon, Search, UserPlus } from "lucide-react";
import { type ChatContact } from "@/context/messenger-context";
import { Avatar } from "./ConversationList";

const readAsDataURL = (file: File) =>
    new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = reject;
        r.readAsDataURL(file);
    });

interface Props {
    contacts: ChatContact[];
    onClose: () => void;
    onCreate: (name: string, memberIds: string[], avatar?: string) => void;
    onOpenDialog: () => void;
}

export const CreateGroupPanel = ({ contacts, onClose, onCreate, onOpenDialog }: Props) => {
    const [chatName, setChatName] = useState("");
    const [searchUser, setSearchUser] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [chatAvatar, setChatAvatar] = useState<string | null>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const filtered = contacts.filter(c =>
        c.name.toLowerCase().includes(searchUser.toLowerCase())
    );

    const toggleUser = (id: string) => {
        setSelectedUsers(p =>
            p.includes(id) ? p.filter(uid => uid !== id) : [...p, id]
        );
    };

    const handleCreate = () => {
        if (!chatName.trim() || selectedUsers.length === 0) return;
        onCreate(chatName.trim(), selectedUsers, chatAvatar ?? undefined);
        onClose();
    };

    return (
        <>
            {/* Header */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-border/60">
                <h2 className="font-semibold text-[15px]">Создание чата</h2>
                <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-foreground/70"
                    aria-label="Закрыть"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Name + Avatar */}
            <div className="p-4 flex items-center gap-3 border-b border-border/60">
                <input
                    type="file"
                    ref={avatarInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={async e => {
                        const file = e.target.files?.[0];
                        if (file) setChatAvatar(await readAsDataURL(file));
                    }}
                />
                <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="w-14 h-14 rounded-full border border-dashed border-border flex flex-col items-center justify-center bg-secondary/40 hover:bg-secondary transition-colors overflow-hidden shrink-0 relative group"
                    aria-label="Загрузить аватар"
                >
                    {chatAvatar ? (
                        <img src={chatAvatar} alt="Превью" className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    )}
                </button>
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Введите название чата"
                        value={chatName}
                        onChange={e => setChatName(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg bg-secondary text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    {chatName && (
                        <button
                            onClick={() => setChatName("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            aria-label="Очистить"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Search + selected tags */}
            <div className="p-3 border-b border-border/30 space-y-2">
                {selectedUsers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pb-1">
                        {selectedUsers.map(id => {
                            const user = contacts.find(c => c.id === id);
                            if (!user) return null;
                            return (
                                <div key={id} className="flex items-center gap-1.5 bg-accent px-2 py-1 rounded-md text-xs font-medium">
                                    {user.avatar ? (
                                        <img src={user.avatar} className="w-4 h-4 rounded-full object-cover" alt="" />
                                    ) : (
                                        <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                    )}
                                    <span className="truncate max-w-24">{user.name}</span>
                                    <button
                                        onClick={() => toggleUser(id)}
                                        className="text-muted-foreground hover:text-foreground"
                                        aria-label="Удалить"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Введите имя или фамилию"
                        value={searchUser}
                        onChange={e => setSearchUser(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 rounded-lg bg-secondary text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                </div>
            </div>

            {/* User list */}
            <div className="flex-1 overflow-y-auto px-2 pt-2">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4 text-muted-foreground">
                        <UserPlus className="w-10 h-10 mb-2 opacity-40" />
                        <p className="text-xs">Таких людей не нашлось</p>
                    </div>
                ) : (
                    filtered.map(c => {
                        const isSelected = selectedUsers.includes(c.id);
                        return (
                            <button
                                key={c.id}
                                onClick={() => toggleUser(c.id)}
                                className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 hover:bg-secondary/60 transition-colors"
                            >
                                <Avatar c={c} size={38} />
                                <div className="flex-1 min-w-0">
                                    <span className="text-[13.5px] font-semibold block truncate">{c.name}</span>
                                    <span className="text-[11px] text-muted-foreground block truncate">
                                        {c.verified ? "@id" + c.id : "был(а) недавно"}
                                    </span>
                                </div>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                    isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/50"
                                }`}>
                                    {isSelected && <div className="w-2 h-2 rounded-full bg-current" />}
                                </div>
                            </button>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            <div className="h-14 px-4 border-t border-border/60 flex items-center justify-between bg-background">
                <button
                    onClick={onOpenDialog}
                    className="text-[13px] font-medium text-foreground hover:underline"
                >
                    Настройки чата
                </button>
                <button
                    disabled={selectedUsers.length === 0 || !chatName.trim()}
                    onClick={handleCreate}
                    className="px-4 h-9 bg-foreground text-background font-medium text-[13px] rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:hover:bg-foreground transition-colors"
                >
                    Создать чат
                </button>
            </div>
        </>
    );
};