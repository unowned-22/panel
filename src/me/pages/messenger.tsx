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
    const { contacts, ensureLoaded, createChat } = useMessenger() as ReturnType<typeof useMessenger> & {
        ensureLoaded: (chatId: string) => void;
    };
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();

    const [activeId, setActiveId] = useState<string>(contacts[0]?.id ?? "");
    const [creatingChat, setCreatingChat] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [call, setCall] = useState<{ type: "voice" | "video" } | null>(null);
    const [forwardMsgId, setForwardMsgId] = useState<string | null>(null);
    const [resolvingUser, setResolvingUser] = useState(false);

    const active = contacts.find(c => c.id === activeId) ?? null;

    // Load messages whenever active conversation changes
    useEffect(() => {
        if (activeId) ensureLoaded(activeId);
    }, [activeId, ensureLoaded]);

    // Auto-select first conversation once contacts load
    useEffect(() => {
        if (!activeId && contacts.length > 0 && !username) {
            setActiveId(contacts[0].id);
        }
    }, [contacts, activeId, username]);

    // ── Открытие диалога по /me/messenger/:username ───────────────────────
    // Если уже есть direct-переписка с этим пользователем среди загруженных
    // контактов — просто выбираем её. Если нет — получаем (или создаём) её
    // через бэкенд по числовому id профиля и сразу открываем.
    useEffect(() => {
        if (!username) return;

        let cancelled = false;

        const openDirectByUsername = async () => {
            setResolvingUser(true);
            try {
                const profile = await profileApi.get(username);
                if (cancelled || !profile?.id) return;

                const chatId = await createChat({
                    name: profile.full_name ?? profile.username ?? "",
                    isGroup: false,
                    memberIds: [String(profile.id)],
                });

                if (!cancelled && chatId) {
                    setActiveId(chatId);
                }
            } catch (err) {
                console.error("[messenger] failed to open chat by username", err);
            } finally {
                if (!cancelled) {
                    setResolvingUser(false);
                    // Возвращаемся на канонический /me/messenger, чтобы при
                    // обновлении страницы или повторном клике на ту же ссылку
                    // не пересоздавать диалог заново.
                    navigate("/me/messenger", { replace: true });
                }
            }
        };

        openDirectByUsername();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [username]);

    const handleSelect = (id: string) => {
        setActiveId(id);
        setCreatingChat(false);
        setInfoOpen(false);
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
                            onClose={() => setActiveId("")}
                            onToggleInfo={() => setInfoOpen(v => !v)}
                            infoOpen={infoOpen}
                            onStartCall={type => setCall({ type })}
                            onForward={msgId => setForwardMsgId(msgId)}
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