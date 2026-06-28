import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMessenger } from "@/hooks/use-messenger";
import { profileApi } from "@/api/profile";
import { ConversationList } from "@/components/messenger/ConversationList";
import { CreateGroupPanel } from "@/components/messenger/CreateGroupPanel";
import { ChatWindow } from "@/components/messenger/ChatWindow";
import { EmptyChatState } from "@/components/messenger/EmptyChatState";
import ChatInfoPanel from "@/components/messenger/ChatInfoPanel";
import CreateChatDialog from "@/components/messenger/CreateChatDialog";
import CallScreen from "@/components/messenger/CallScreen";
import ForwardDialog from "@/components/messenger/ForwardDialog";

const Messenger = () => {
    const { contacts, ensureLoaded, createChat, openDraftChat } = useMessenger() as ReturnType<typeof useMessenger> & {
        ensureLoaded: (chatId: string) => void;
    };
    const { setActiveChat } = useMessenger();
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();
    const [activeId, setActiveId] = useState<string>(contacts[0]?.id ?? "");
    const [closedByUser, setClosedByUser] = useState(false);
    const [creatingChat, setCreatingChat] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [call, setCall] = useState<{ type: "voice" | "video" } | null>(null);
    const [forwardMsgId, setForwardMsgId] = useState<string | null>(null);
    const [resolvingUser, setResolvingUser] = useState(false);
    const active = contacts.find(c => c.id === activeId) ?? null;

    useEffect(() => {
        if (activeId) ensureLoaded(activeId);
    }, [activeId, ensureLoaded]);

    useEffect(() => {
        if (!closedByUser && !activeId && contacts.length > 0 && !username) {
            setActiveId(contacts[0].id);
        }
    }, [contacts, activeId, username, closedByUser]);

    useEffect(() => {
        if (!username) return;

        let cancelled = false;

        const openDraft = async () => {
            setResolvingUser(true);
            try {
                const profile = await profileApi.get(username);
                if (cancelled || !profile?.id) return;

                const chatId = openDraftChat({
                    userId: profile.id,
                    name: profile.full_name ?? profile.username ?? "",
                    avatar: profile.avatar_url,
                });

                if (!cancelled && chatId) {
                    setClosedByUser(false);
                    setActiveId(chatId);
                }
            } catch (err) {
                console.error("[messenger] failed to resolve user by username", err);
            } finally {
                if (!cancelled) {
                    setResolvingUser(false);
                    navigate("/me/messenger", { replace: true });
                }
            }
        };

        openDraft();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [username]);

    const handleSelect = (id: string) => {
        setActiveId(id);
        setActiveChat(id);
        setClosedByUser(false);
        setCreatingChat(false);
        setInfoOpen(false);
    };

    const handleCloseChat = () => {
        setClosedByUser(true);
        setActiveId("");
    };

    const handleCreateGroup = async (name: string, memberIds: string[], avatar?: string) => {
        const id = await createChat({ name, isGroup: true, memberIds, avatar });
        if (id) handleSelect(id as string);
    };

    return (
        <>
            <div className="panel-card overflow-hidden flex h-[calc(100vh-84px)]">
                {/* ── Left sidebar ── */}
                <section className="w-75 shrink-0 border-r border-border flex flex-col">
                    {creatingChat ? (
                        <CreateGroupPanel
                            contacts={contacts}
                            onClose={() => setCreatingChat(false)}
                            onCreate={handleCreateGroup}
                            onOpenDialog={() => setCreateOpen(true)}
                        />
                    ) : (
                        <ConversationList
                            contacts={contacts}
                            activeId={activeId}
                            onSelect={handleSelect}
                            onOpenCreate={() => setCreateOpen(true)}
                            onStartGroupCreate={() => setCreatingChat(true)}
                        />
                    )}
                </section>

                {/* ── Right: chat window or empty state ── */}
                <section className="flex-1 min-w-0 flex flex-col">
                    {active ? (
                        <ChatWindow
                            active={active}
                            onClose={handleCloseChat}
                            onToggleInfo={() => setInfoOpen(v => !v)}
                            infoOpen={infoOpen}
                            onStartCall={type => setCall({ type })}
                            onForward={msgId => setForwardMsgId(msgId)}
                            onChatIdChange={setActiveId}
                        />
                    ) : resolvingUser ? (
                        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                            Открываем диалог…
                        </div>
                    ) : (
                        <EmptyChatState onStartCreate={() => setCreatingChat(true)} />
                    )}
                </section>

                {/* ── Info panel ── */}
                {infoOpen && active && (
                    <ChatInfoPanel chatId={activeId} onClose={() => setInfoOpen(false)} />
                )}
            </div>

            {/* ── Dialogs & overlays ── */}
            <CreateChatDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onCreated={id => handleSelect(id)}
            />

            {call && active && (
                <CallScreen
                    type={call.type}
                    contactName={active.name}
                    contactAvatar={active.avatar}
                    onEnd={() => setCall(null)}
                />
            )}

            <ForwardDialog
                open={forwardMsgId !== null}
                onOpenChange={v => !v && setForwardMsgId(null)}
                sourceChatId={activeId}
                messageId={forwardMsgId}
            />
        </>
    );
};

export default Messenger;