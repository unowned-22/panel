import { createContext } from 'react';
import type { ApiCallType, ApiCallSession } from '@/api/calls';

/**
 * A call that's ringing on this device — either one we just started (we're
 * already "joined" per the backend, but not yet connected to LiveKit media)
 * or an incoming ring from someone else.
 */
export interface IncomingCall {
    callId: number;
    conversationId: number;
    initiatorId: number;
    roomName: string;
    /** Only known once we have the call record (see CallRingingEvent below); voice/video. */
    callType: ApiCallType;
}

/** A call we're currently connected to (or connecting to) via LiveKit. */
export interface ActiveCallSession {
    callId: number;
    conversationId: number;
    roomName: string;
    token: string;
    livekitUrl: string;
    callType: ApiCallType;
}

export interface CallRingingEvent {
    call_id: number;
    conversation_id: number;
    initiator_id: number;
    room_name: string;
}

export interface CallParticipantJoinedEvent {
    call_id: number;
    conversation_id: number;
    user_id: number;
}

export interface CallParticipantLeftEvent {
    call_id: number;
    conversation_id: number;
    user_id: number;
}

export interface CallDeclinedEvent {
    call_id: number;
    conversation_id: number;
    user_id: number;
}

export interface CallEndedEvent {
    call_id: number;
    conversation_id: number;
    status: string;
}

export interface Ctx {
    incomingCall: IncomingCall | null;
    activeCall: ActiveCallSession | null;
    isConnecting: boolean;
    error: string | null;
    startCall: (conversationId: number, callType: ApiCallType) => Promise<void>;
    acceptCall: () => Promise<void>;
    declineCall: () => Promise<void>;
    leaveCall: () => Promise<void>;
    endCall: () => Promise<void>;
    getActiveCallForConversation: (conversationId: number) => Promise<ApiCallSession | null>;
}

export const CallContext = createContext<Ctx | null>(null);