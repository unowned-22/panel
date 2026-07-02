import { apiClient } from '@/lib/api-client';

export type ApiCallType = 'voice' | 'video';

export type ApiCallStatus = 'ringing' | 'active' | 'ended' | 'missed' | 'declined';

export type ApiCallParticipantStatus =
    | 'invited'
    | 'ringing'
    | 'joined'
    | 'left'
    | 'declined'
    | 'missed';

export interface ApiCallParticipant {
    user_id: number;
    status: ApiCallParticipantStatus;
    invited_at: string;
    joined_at?: string | null;
    left_at?: string | null;
}

export interface ApiCallSession {
    id: number;
    conversation_id: number;
    initiator_id: number;
    call_type: ApiCallType;
    status: ApiCallStatus;
    created_at: string;
    started_at?: string | null;
    ended_at?: string | null;
    participants?: ApiCallParticipant[];
}

export interface ApiJoinInfo {
    call_id: number;
    room_name: string;
    token: string;
    livekit_url: string;
}

export interface ApiInitiateCallResult {
    call: ApiCallSession;
    join: ApiJoinInfo;
}

export const callsApi = {
    /**
     * Start a call for a conversation — rings every other member.
     * Rejects with a 409-carrying error if the conversation already has a
     * live call; callers should catch that and fall back to
     * getActiveCallForConversation + join instead.
     */
    initiate(conversationId: number, callType: ApiCallType) {
        return apiClient.post<{ data: ApiInitiateCallResult }>('/calls', {
            conversation_id: conversationId,
            call_type: callType,
        });
    },

    /** Get call state + participant list. */
    get(callId: number) {
        return apiClient.get<{ data: ApiCallSession }>(`/calls/${callId}`);
    },

    /**
     * Join a ringing or already-active call. Used both by an invited callee
     * accepting the ring and by any conversation member joining an
     * in-progress group call mid-way.
     */
    join(callId: number) {
        return apiClient.post<{ data: ApiJoinInfo }>(`/calls/${callId}/join`, {});
    },

    /**
     * Decline a ringing call. For a 1:1 call this ends the call for both
     * sides (nobody left to answer); for a group call it just removes this
     * participant from the invite list.
     */
    decline(callId: number) {
        return apiClient.post<{ data: unknown }>(`/calls/${callId}/decline`, {});
    },

    /** Leave a call you're currently in. Auto-ends it if you were last. */
    leave(callId: number) {
        return apiClient.post<{ data: unknown }>(`/calls/${callId}/leave`, {});
    },

    /**
     * Force-end a call for everyone. Any participant may end a 1:1 call;
     * for a group call only the initiator may — everyone else should call
     * leave() instead.
     */
    end(callId: number) {
        return apiClient.post<{ data: unknown }>(`/calls/${callId}/end`, {});
    },

    /**
     * Get the current live call for a conversation, if any. `data` is null
     * when there's no ringing/active call — use this to show a "join call"
     * banner instead of blindly calling initiate() and hitting a 409.
     */
    getActiveForConversation(conversationId: number) {
        return apiClient.get<{ data: ApiCallSession | null }>(
            `/conversations/${conversationId}/active-call`
        );
    },
};