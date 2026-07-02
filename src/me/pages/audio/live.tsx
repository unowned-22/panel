import { useEffect, useRef, useState } from "react";
import { Radio, Mic, MicOff, Users, Send, Square, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

type ChatMsg = {
    id: string;
    author: string;
    text: string;
    ts: number;
};

const seedChat: ChatMsg[] = [
    { id: "m1", author: "nightowl", text: "наконец-то стрим 🔥", ts: Date.now() - 60000 },
    { id: "m2", author: "mira.k", text: "включи Glich!", ts: Date.now() - 40000 },
    { id: "m3", author: "alex.dev", text: "звук отличный сегодня", ts: Date.now() - 15000 },
];

export function MusicLive() {
    const [isLive, setIsLive] = useState(false);
    const [muted, setMuted] = useState(false);
    const [listeners, setListeners] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [chat, setChat] = useState<ChatMsg[]>(seedChat);
    const [draft, setDraft] = useState("");
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isLive) return;
        const t = setInterval(() => {
            setElapsed((e) => e + 1);
            setListeners((l) => Math.max(0, l + Math.round((Math.random() - 0.4) * 3)));
        }, 1000);
        return () => clearInterval(t);
    }, [isLive]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat]);

    const goLive = () => {
        setIsLive(true);
        setListeners(3);
        setElapsed(0);
    };
    const endLive = () => {
        setIsLive(false);
        setListeners(0);
    };

    const sendMsg = () => {
        if (!draft.trim()) return;
        setChat((c) => [...c, { id: crypto.randomUUID(), author: "вы", text: draft.trim(), ts: Date.now() }]);
        setDraft("");
    };

    const fmtTime = (s: number) => {
        const m = Math.floor(s / 60).toString().padStart(2, "0");
        const sec = (s % 60).toString().padStart(2, "0");
        return `${m}:${sec}`;
    };

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 w-full flex flex-col gap-4">
                <section className="panel-card rounded-xl border border-border/70 p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div
                                className={cn(
                                    "size-14 rounded-full flex items-center justify-center",
                                    isLive ? "bg-red-600" : "bg-secondary"
                                )}
                            >
                                <Radio className={cn("size-6", isLive ? "text-white" : "text-muted-foreground")} />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold flex items-center gap-2">
                                    Аудиострим
                                    {isLive && (
                                        <span className="flex items-center gap-1 text-xs font-bold text-red-500">
                                            <Circle className="size-2 fill-current" /> В ЭФИРЕ
                                        </span>
                                    )}
                                </h1>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {isLive ? `Идёт ${fmtTime(elapsed)}` : "Сейчас не транслируется"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setMuted((m) => !m)}
                                disabled={!isLive}
                                className="size-10 rounded-full bg-secondary flex items-center justify-center hover:bg-accent disabled:opacity-40 text-muted-foreground"
                                aria-label="Микрофон"
                            >
                                {muted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                            </button>
                            {isLive ? (
                                <button
                                    onClick={endLive}
                                    className="flex items-center gap-2 h-10 px-4 rounded-full bg-secondary text-sm font-bold hover:bg-accent"
                                >
                                    <Square className="size-3.5 fill-current" /> Завершить
                                </button>
                            ) : (
                                <button
                                    onClick={goLive}
                                    className="flex items-center gap-2 h-10 px-4 rounded-full bg-red-600 text-white text-sm font-bold hover:bg-red-700"
                                >
                                    <Radio className="size-4" /> Начать трансляцию
                                </button>
                            )}
                        </div>
                    </div>

                    {isLive && (
                        <div className="flex items-center gap-1.5 mt-4 text-sm text-muted-foreground">
                            <Users className="size-4" />
                            {listeners} слушают сейчас
                        </div>
                    )}
                </section>

                <section className="panel-card rounded-xl border border-border/70 flex flex-col h-[28rem]">
                    <header className="px-5 py-4 border-b border-border/70">
                        <h2 className="text-sm font-bold">Чат трансляции</h2>
                    </header>
                    <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
                        {chat.map((m) => (
                            <div key={m.id} className="text-sm">
                                <span className="font-semibold">{m.author}</span>{" "}
                                <span className="text-foreground/90">{m.text}</span>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3 border-t border-border/70">
                        <input
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMsg()}
                            placeholder={isLive ? "Написать в чат..." : "Чат доступен во время эфира"}
                            disabled={!isLive}
                            className="flex-1 h-9 rounded-full bg-secondary px-4 text-sm focus:outline-none disabled:opacity-50"
                        />
                        <button
                            onClick={sendMsg}
                            disabled={!isLive}
                            className="size-9 rounded-full bg-foreground text-background flex items-center justify-center disabled:opacity-40"
                            aria-label="Отправить"
                        >
                            <Send className="size-4" />
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default MusicLive;