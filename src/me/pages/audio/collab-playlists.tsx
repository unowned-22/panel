import { useState } from "react";
import { Users, Plus, Play, Link2, X, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/components/PlayerContext";

type Collaborator = { name: string; avatar: string; color: string; isOwner?: boolean };

type CollabTrack = { title: string; addedBy: string; duration: string };

type CollabPlaylist = {
    id: string;
    title: string;
    cover: string;
    collaborators: Collaborator[];
    tracks: CollabTrack[];
    pendingInvite?: string;
};

const seedPlaylists: CollabPlaylist[] = [
    {
        id: "p1",
        title: "Lovable Studio x Starlight UA",
        cover: "var(--gradient-music-2)",
        collaborators: [
            { name: "resoul.ua", avatar: "R", color: "bg-red-600", isOwner: true },
            { name: "Starlight UA", avatar: "S", color: "bg-indigo-600" },
            { name: "Vence", avatar: "V", color: "bg-green-600" },
        ],
        tracks: [
            { title: "Space Movie Soundtrack", addedBy: "resoul.ua", duration: "17:03" },
            { title: "Untamed Dreams", addedBy: "Starlight UA", duration: "6:05" },
        ],
    },
    {
        id: "p2",
        title: "Night Drive Sessions",
        cover: "var(--gradient-music-4)",
        collaborators: [
            { name: "resoul.ua", avatar: "R", color: "bg-red-600", isOwner: true },
            { name: "Vence", avatar: "V", color: "bg-green-600" },
        ],
        tracks: [{ title: "Terraform", addedBy: "resoul.ua", duration: "3:14" }],
        pendingInvite: "Starlight UA",
    },
];

export function MusicCollabPlaylists() {
    const { play } = usePlayer();
    const [playlists, setPlaylists] = useState(seedPlaylists);
    const [open, setOpen] = useState<CollabPlaylist | null>(null);
    const [inviteName, setInviteName] = useState("");

    const invite = (playlistId: string) => {
        if (!inviteName.trim()) return;
        setPlaylists((ps) =>
            ps.map((p) => (p.id === playlistId ? { ...p, pendingInvite: inviteName.trim() } : p))
        );
        setInviteName("");
    };

    const cancelInvite = (playlistId: string) => {
        setPlaylists((ps) => ps.map((p) => (p.id === playlistId ? { ...p, pendingInvite: undefined } : p)));
    };

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 w-full flex flex-col gap-4">
                <section className="panel-card rounded-xl border border-border/70">
                    <header className="flex items-center justify-between px-5 py-4 border-b border-border/70">
                        <div>
                            <h1 className="text-lg font-bold">Совместные плейлисты</h1>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Создавайте плейлисты вместе с другими артистами — каждый может добавлять треки
                            </p>
                        </div>
                        <button className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-foreground text-background text-xs font-bold hover:opacity-90 shrink-0">
                            <Plus className="size-4" /> Новый плейлист
                        </button>
                    </header>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5">
                        {playlists.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setOpen(p)}
                                className="flex items-center gap-3 p-3 rounded-xl border border-border/70 hover:bg-secondary/40 text-left"
                            >
                                <div className="size-16 rounded-lg shrink-0 relative" style={{ background: p.cover }}>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-background/30 rounded-lg">
                                        <Play className="size-5 fill-white text-white ml-0.5" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold line-clamp-1">{p.title}</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {p.tracks.length} трек{p.tracks.length === 1 ? "" : "ов"}
                                    </p>
                                    <div className="flex items-center -space-x-2 mt-2">
                                        {p.collaborators.map((c) => (
                                            <div
                                                key={c.name}
                                                title={c.name}
                                                className={cn(
                                                    "size-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-card",
                                                    c.color
                                                )}
                                            >
                                                {c.avatar}
                                            </div>
                                        ))}
                                        {p.pendingInvite && (
                                            <div className="size-6 rounded-full flex items-center justify-center text-[10px] font-bold text-muted-foreground bg-secondary border-2 border-card border-dashed">
                                                ...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>
            </div>

            {open && (
                <div
                    className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center p-4"
                    onClick={() => setOpen(null)}
                >
                    <div
                        className="panel-card w-full max-w-lg rounded-xl border border-border/70 p-5 max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-4">
                            <div className="size-20 rounded-xl shrink-0" style={{ background: open.cover }} />
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg font-bold">{open.title}</h2>
                                <p className="text-xs text-muted-foreground mt-1">{open.tracks.length} треков</p>
                            </div>
                            <button onClick={() => setOpen(null)} className="p-1.5 rounded-full hover:bg-secondary shrink-0" aria-label="Закрыть">
                                <X className="size-4" />
                            </button>
                        </div>

                        <div className="mt-5">
                            <h3 className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
                                <Users className="size-3.5" /> Участники
                            </h3>
                            <div className="flex flex-col gap-2">
                                {open.collaborators.map((c) => (
                                    <div key={c.name} className="flex items-center gap-2">
                                        <div className={cn("size-8 rounded-full flex items-center justify-center text-xs font-bold text-white", c.color)}>
                                            {c.avatar}
                                        </div>
                                        <span className="text-sm font-medium flex-1">{c.name}</span>
                                        {c.isOwner && (
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Crown className="size-3.5" /> Владелец
                                            </span>
                                        )}
                                    </div>
                                ))}
                                {open.pendingInvite && (
                                    <div className="flex items-center gap-2">
                                        <div className="size-8 rounded-full bg-secondary border border-dashed border-border flex items-center justify-center text-muted-foreground">
                                            <Link2 className="size-3.5" />
                                        </div>
                                        <span className="text-sm flex-1 text-muted-foreground">{open.pendingInvite} — приглашение отправлено</span>
                                        <button onClick={() => cancelInvite(open.id)} className="text-xs text-muted-foreground hover:text-foreground">
                                            Отменить
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 mt-3">
                                <input
                                    value={inviteName}
                                    onChange={(e) => setInviteName(e.target.value)}
                                    placeholder="Имя или ссылка артиста"
                                    className="flex-1 h-9 rounded-lg bg-secondary px-3 text-sm focus:outline-none"
                                />
                                <button
                                    onClick={() => invite(open.id)}
                                    className="h-9 px-3 rounded-lg bg-secondary text-xs font-bold hover:bg-accent flex items-center gap-1.5"
                                >
                                    <Plus className="size-3.5" /> Пригласить
                                </button>
                            </div>
                        </div>

                        <div className="mt-5">
                            <h3 className="text-xs font-bold text-muted-foreground mb-2">Треки</h3>
                            <div className="divide-y divide-border/70">
                                {open.tracks.map((t, i) => (
                                    <button
                                        key={t.title}
                                        onClick={() => play({ title: t.title, artist: open.title, duration: t.duration })}
                                        className="w-full flex items-center gap-3 py-2.5 hover:bg-secondary/50 -mx-1 px-1 rounded-lg text-left"
                                    >
                                        <span className="w-4 text-xs text-muted-foreground tabular-nums">{i + 1}</span>
                                        <span className="flex-1 text-sm font-medium truncate">{t.title}</span>
                                        <span className="text-xs text-muted-foreground">добавил {t.addedBy}</span>
                                        <span className="text-xs text-muted-foreground">{t.duration}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MusicCollabPlaylists;