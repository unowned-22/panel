import { useEffect, useRef } from "react";
import { Phone, PhoneOff, Video } from "lucide-react";
import { useCall } from "@/hooks/use-call";
import { playRingtone } from "@/lib/call-ringtone";

interface Props {
    contactName: string;
    contactAvatar?: string;
}

/**
 * Модалка входящего звонка (принять/отклонить). Показывается, пока
 * useCall().incomingCall не пуст. Сейчас монтируется внутри страницы
 * мессенджера — для входящих звонков вне мессенджера (например, пока
 * пользователь листает ленту) её стоит поднять на уровень App.tsx рядом
 * с CallProvider, чтобы работала на любом роуте.
 */
const IncomingCallDialog = ({ contactName, contactAvatar }: Props) => {
    const { incomingCall, acceptCall, declineCall, isConnecting } = useCall();
    const stopRingtoneRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (!incomingCall) return;
        stopRingtoneRef.current = playRingtone();
        return () => {
            stopRingtoneRef.current?.();
            stopRingtoneRef.current = null;
        };
    }, [incomingCall?.callId]);

    if (!incomingCall) return null;

    const initials = contactName.charAt(0).toUpperCase();
    const isVideo = incomingCall.callType === "video";

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60">
            <div className="w-full max-w-90 rounded-2xl bg-card border border-border p-6 flex flex-col items-center gap-4 shadow-elevated">
                {contactAvatar ? (
                    <img
                        src={contactAvatar}
                        alt={contactName}
                        className="w-20 h-20 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-3xl font-bold">
                        {initials}
                    </div>
                )}
                <div className="text-center">
                    <div className="font-semibold text-lg">{contactName}</div>
                    <div className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1.5">
                        {isVideo ? <Video size={14} /> : <Phone size={14} />}
                        {isVideo ? "Видеозвонок" : "Входящий звонок"}
                    </div>
                </div>
                <div className="flex items-center gap-8 mt-2">
                    <button
                        onClick={() => declineCall()}
                        className="w-14 h-14 rounded-full bg-destructive hover:bg-destructive/90 flex items-center justify-center text-destructive-foreground"
                        aria-label="Отклонить"
                    >
                        <PhoneOff size={24} />
                    </button>
                    <button
                        onClick={() => acceptCall()}
                        disabled={isConnecting}
                        className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center text-primary-foreground disabled:opacity-60"
                        aria-label="Принять"
                    >
                        <Phone size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IncomingCallDialog;