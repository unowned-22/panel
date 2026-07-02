import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, PhoneOff, Video, VideoOff, Volume2 } from "lucide-react";
import { Room, RoomEvent, Track, type RemoteTrack } from "livekit-client";
import { useCall } from "@/hooks/use-call";
import { playRingtone } from "@/lib/call-ringtone";

interface CallScreenProps {
  contactName: string;
  contactAvatar?: string;
}

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};

const CallScreen = ({ contactName, contactAvatar }: CallScreenProps) => {
  const { activeCall, endCall, error } = useCall();

  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(activeCall?.callType !== "video");
  const [duration, setDuration] = useState(0);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const roomRef = useRef<Room | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const stopRingtoneRef = useRef<(() => void) | null>(null);

  const callId = activeCall?.callId;

  // Подключение к LiveKit-комнате по данным из activeCall.
  useEffect(() => {
    if (!activeCall) return;
    let cancelled = false;
    const room = new Room();
    roomRef.current = room;

    room.on(RoomEvent.ParticipantConnected, () => setRemoteConnected(true));
    room.on(RoomEvent.ParticipantDisconnected, () => {
      if (room.remoteParticipants.size === 0) setRemoteConnected(false);
    });
    room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
      if (track.kind === Track.Kind.Video && remoteVideoRef.current) {
        track.attach(remoteVideoRef.current);
      } else if (track.kind === Track.Kind.Audio && remoteAudioRef.current) {
        track.attach(remoteAudioRef.current);
      }
    });
    room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
      track.detach();
    });
    room.on(RoomEvent.Disconnected, () => {
      if (!cancelled) setConnectError("Соединение прервано");
    });

    (async () => {
      try {
        await room.connect(activeCall.livekitUrl, activeCall.token);
        if (cancelled) {
          room.disconnect();
          return;
        }
        await room.localParticipant.setMicrophoneEnabled(true);
        if (activeCall.callType === "video") {
          await room.localParticipant.setCameraEnabled(true);
          const camPub = Array.from(room.localParticipant.videoTrackPublications.values())[0];
          if (camPub?.track && localVideoRef.current) {
            camPub.track.attach(localVideoRef.current);
          }
        }
        setRemoteConnected(room.remoteParticipants.size > 0);
      } catch (e) {
        console.error("[call] livekit connect failed", e);
        if (!cancelled) setConnectError("Не удалось подключиться к звонку");
      }
    })();

    return () => {
      cancelled = true;
      room.disconnect();
      roomRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callId]);

  // Гудки, пока собеседник ещё не подключился к комнате.
  useEffect(() => {
    if (remoteConnected) {
      stopRingtoneRef.current?.();
      stopRingtoneRef.current = null;
      return;
    }
    stopRingtoneRef.current = playRingtone();
    return () => {
      stopRingtoneRef.current?.();
      stopRingtoneRef.current = null;
    };
  }, [remoteConnected]);

  // Таймер разговора — идёт только пока собеседник реально в комнате.
  useEffect(() => {
    if (!remoteConnected) return;
    const i = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(i);
  }, [remoteConnected]);

  const toggleMute = async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !muted;
    await room.localParticipant.setMicrophoneEnabled(!next);
    setMuted(next);
  };

  const toggleVideo = async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !videoOff;
    await room.localParticipant.setCameraEnabled(!next);
    setVideoOff(next);
  };

  if (!activeCall) return null;

  const initials = contactName.charAt(0).toUpperCase();
  const isVideo = activeCall.callType === "video";
  const showRemoteVideo = isVideo && remoteConnected;

  return (
      <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-between text-primary-foreground"
          style={{
            background:
                "linear-gradient(180deg, hsl(220 25% 18%) 0%, hsl(220 30% 8%) 100%)",
          }}
      >
        {showRemoteVideo && (
            <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
            />
        )}
        <audio ref={remoteAudioRef} autoPlay />

        {!showRemoteVideo && isVideo && contactAvatar && (
            <div className="absolute inset-0 overflow-hidden">
              <img
                  src={contactAvatar}
                  alt=""
                  className="w-full h-full object-cover blur-md scale-110 opacity-30"
              />
            </div>
        )}

        <div className="relative z-10 flex flex-col items-center pt-20">
          {!showRemoteVideo && (
              <div className="relative">
                {contactAvatar ? (
                    <img
                        src={contactAvatar}
                        alt={contactName}
                        className={`rounded-full object-cover border-4 border-primary-foreground/20 ${
                            isVideo ? "w-24 h-24" : "w-32 h-32"
                        }`}
                    />
                ) : (
                    <div
                        className={`rounded-full border-4 border-primary-foreground/20 bg-secondary flex items-center justify-center font-bold ${
                            isVideo ? "w-24 h-24 text-3xl" : "w-32 h-32 text-5xl"
                        }`}
                    >
                      {initials}
                    </div>
                )}
                {!remoteConnected && (
                    <>
                      <span className="absolute inset-[-8px] rounded-full border-2 border-primary-foreground/25 animate-ping" />
                      <span
                          className="absolute inset-[-16px] rounded-full border-2 border-primary-foreground/15 animate-ping"
                          style={{ animationDelay: "0.6s" }}
                      />
                    </>
                )}
              </div>
          )}
          <h2 className="text-2xl font-semibold mt-6">{contactName}</h2>
          <p className="text-sm text-primary-foreground/60 mt-1">
            {connectError ?? error ?? (!remoteConnected ? (isVideo ? "Видеовызов…" : "Вызов…") : fmt(duration))}
          </p>
        </div>

        {isVideo && !videoOff && (
            <div className="absolute top-6 right-6 z-20 w-28 h-40 rounded-2xl overflow-hidden border-2 border-primary-foreground/20 bg-black/40">
              <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            </div>
        )}

        <div className="relative z-10 pb-16 flex flex-col items-center gap-8">
          <div className="flex items-center gap-6">
            <button
                onClick={toggleMute}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                    muted ? "bg-primary-foreground/30" : "bg-primary-foreground/10 hover:bg-primary-foreground/20"
                }`}
                aria-label={muted ? "Включить микрофон" : "Выключить микрофон"}
            >
              {muted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>

            {isVideo && (
                <button
                    onClick={toggleVideo}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                        videoOff ? "bg-primary-foreground/30" : "bg-primary-foreground/10 hover:bg-primary-foreground/20"
                    }`}
                    aria-label={videoOff ? "Включить камеру" : "Выключить камеру"}
                >
                  {videoOff ? <VideoOff size={24} /> : <Video size={24} />}
                </button>
            )}

            <button
                className="w-14 h-14 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center"
                aria-label="Динамик"
            >
              <Volume2 size={24} />
            </button>
          </div>

          <button
              onClick={() => endCall()}
              className="w-16 h-16 rounded-full bg-destructive hover:bg-destructive/90 flex items-center justify-center transition-colors"
              aria-label="Завершить звонок"
          >
            <PhoneOff size={28} />
          </button>
        </div>
      </div>
  );
};

export default CallScreen;