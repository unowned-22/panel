import { apiClient } from '@/lib/api-client';

// ─── Backend response types ────────────────────────────────────────────────

export interface ApiAttachment {
    id: number;
    type: string;
    url: string;
    mime_type: string;
    size_bytes: number;
    filename: string;
    duration_s?: number;
    width?: number;
    height?: number;
}

export interface ApiMessagePreview {
    id: number;
    sender_id: number;
    sender_name?: string;
    body: string;
}

export interface ApiMessage {
    id: number;
    conversation_id: number;
    sender_id: number;
    sender_name: string;
    sender_avatar: string;
    type: string;
    body: string;
    reply_to_id?: number | null;
    reply_to?: ApiMessagePreview | null;
    forwarded_from_id?: number | null;
    is_deleted: boolean;
    is_edited: boolean;
    edited_at?: string | null;
    pinned: boolean;
    likes_count: number;
    liked_by_me: boolean;
    disappears_at?: string | null;
    scheduled_at?: string | null;
    is_scheduled: boolean;
    delivery_status: string;
    mention_user_ids: number[];
    attachments: ApiAttachment[];
    created_at: string;
    updated_at: string;
}

export interface ApiMember {
    conversation_id: number;
    user_id: number;
    role: string;
    joined_at: string;
    left_at?: string | null;
    is_archived: boolean;
    user_name?: string;
    user_avatar?: string;
}

export interface ApiConversation {
    id: number;
    type: 'direct' | 'group' | 'channel';
    title: string;
    description: string;
    avatar_url: string;
    owner_id?: number | null;
    created_by: number;
    last_message_id?: number | null;
    last_message_at?: string | null;
    members_count: number;
    is_archived: boolean;
    invite_link: string;
    disappear_after_s?: number | null;
    created_at: string;
    updated_at: string;
    last_message?: ApiMessage | null;
    unread_count: number;
    members?: ApiMember[];
}

export interface ApiPrivacySettings {
    user_id: number;
    who_can_message: string;
    updated_at: string;
}

export interface ApiDraft {
    body: string;
    reply_to_id?: number | null;
}

export interface ApiUploadedAttachment {
    storage_key: string;
    url: string;
}

// ─── Paginated wrapper ─────────────────────────────────────────────────────

interface Paginated<T> {
    items: T[];
    total: number;
}

interface MessageResult {
    message: string;
}

// ─── API functions ─────────────────────────────────────────────────────────

const BASE = '/messenger';

export const messengerApi = {
    // ── Conversations ───────────────────────────────────────────────────────

    /** List all conversations for the current user */
    listConversations(page = 1, limit = 50) {
        return apiClient.get<{ data: Paginated<ApiConversation> }>(
            `${BASE}/conversations?page=${page}&limit=${limit}`
        );
    },

    /** Get a single conversation */
    getConversation(id: number) {
        return apiClient.get<{ data: ApiConversation }>(
            `${BASE}/conversations/${id}`
        );
    },

    /** Get or create a direct conversation with another user */
    getOrCreateDirect(targetUserID: number) {
        return apiClient.post<{ data: ApiConversation }>(
            `${BASE}/conversations/direct/${targetUserID}`,
            {}
        );
    },

    /** Create a group conversation */
    createGroup(title: string, description: string, memberIDs: number[]) {
        return apiClient.post<{ data: ApiConversation }>(
            `${BASE}/conversations/group`,
            { title, description, member_ids: memberIDs }
        );
    },

    /** Create a channel (no member_ids — members are added afterwards) */
    createChannel(title: string, description: string) {
        return apiClient.post<{ data: ApiConversation }>(
            `${BASE}/conversations/channel`,
            { title, description }
        );
    },

    /** Add members to a group/channel */
    addMembers(convID: number, memberIDs: number[]) {
        return apiClient.post<{ data: MessageResult }>(
            `${BASE}/conversations/${convID}/members`,
            { member_ids: memberIDs }
        );
    },

    /** Remove a member from a group/channel */
    removeMember(convID: number, userID: number) {
        return apiClient.delete<{ data: MessageResult }>(
            `${BASE}/conversations/${convID}/members/${userID}`
        );
    },

    /** Leave a conversation */
    leaveConversation(convID: number) {
        return apiClient.post<{ data: MessageResult }>(
            `${BASE}/conversations/${convID}/leave`,
            {}
        );
    },

    /** Subscribe to a group/channel (REST — not the WS endpoint) */
    subscribeToConversation(convID: number) {
        return apiClient.post<{ data: MessageResult }>(
            `${BASE}/conversations/${convID}/subscribe`,
            {}
        );
    },

    /** Archive a conversation */
    archiveConversation(convID: number) {
        return apiClient.post<{ data: MessageResult }>(
            `${BASE}/conversations/${convID}/archive`,
            {}
        );
    },

    /** Unarchive a conversation */
    unarchiveConversation(convID: number) {
        return apiClient.post<{ data: MessageResult }>(
            `${BASE}/conversations/${convID}/unarchive`,
            {}
        );
    },

    /** Generate (or rotate) an invite link for a group/channel */
    generateInviteLink(convID: number) {
        return apiClient.post<{ data: { link: string } }>(
            `${BASE}/conversations/${convID}/invite`,
            {}
        );
    },

    /** Revoke the invite link for a group/channel */
    revokeInviteLink(convID: number) {
        return apiClient.delete<{ data: MessageResult }>(
            `${BASE}/conversations/${convID}/invite`
        );
    },

    /** Join a group/channel by its invite slug */
    joinByInviteLink(slug: string) {
        return apiClient.post<{ data: ApiConversation }>(
            `${BASE}/join/${encodeURIComponent(slug)}`,
            {}
        );
    },

    /** Set (or clear with 0) the disappearing-messages timer for a conversation */
    setDisappearTimer(convID: number, durationS: number) {
        return apiClient.put<{ data: MessageResult }>(
            `${BASE}/conversations/${convID}/disappear-timer`,
            { duration_s: durationS }
        );
    },

    // ── Privacy & blocking ──────────────────────────────────────────────────

    /** Get my "who can message me" privacy setting */
    getPrivacy() {
        return apiClient.get<{ data: ApiPrivacySettings }>(`${BASE}/privacy`);
    },

    /** Update my "who can message me" privacy setting */
    updatePrivacy(whoCanMessage: string) {
        return apiClient.put<{ data: MessageResult }>(
            `${BASE}/privacy`,
            { who_can_message: whoCanMessage }
        );
    },

    /** Block a user from messaging me */
    blockUser(userID: number) {
        return apiClient.post<{ data: MessageResult }>(
            `${BASE}/blocked/${userID}`,
            {}
        );
    },

    /** Unblock a previously blocked user */
    unblockUser(userID: number) {
        return apiClient.delete<{ data: MessageResult }>(
            `${BASE}/blocked/${userID}`
        );
    },

    /** List IDs of users I've blocked */
    listBlocked() {
        return apiClient.get<{ data: { user_ids: number[] } }>(`${BASE}/blocked`);
    },

    // ── Messages ─────────────────────────────────────────────────────────────

    /** List messages in a conversation */
    listMessages(convID: number, page = 1, limit = 50) {
        return apiClient.get<{ data: Paginated<ApiMessage> }>(
            `${BASE}/conversations/${convID}/messages?page=${page}&limit=${limit}`
        );
    },

    /** Search messages in a conversation */
    searchMessages(convID: number, query: string) {
        return apiClient.get<{ data: Paginated<ApiMessage> }>(
            `${BASE}/conversations/${convID}/messages/search?q=${encodeURIComponent(query)}`
        );
    },

    /**
     * List pinned messages in a conversation.
     * NB: backend handler currently returns 501 Not Implemented.
     */
    listPinned(convID: number) {
        return apiClient.get<{ data: Paginated<ApiMessage> }>(
            `${BASE}/conversations/${convID}/messages/pinned`
        );
    },

    /** Send a text message */
    sendMessage(convID: number, body: string, replyToID?: number | null, attachmentKeys?: string[]) {
        return apiClient.post<{ data: ApiMessage }>(
            `${BASE}/conversations/${convID}/messages`,
            { body, reply_to_id: replyToID ?? undefined, attachment_keys: attachmentKeys }
        );
    },

    /** Edit a message's text */
    editMessage(msgID: number, body: string) {
        return apiClient.patch<{ data: ApiMessage }>(
            `${BASE}/messages/${msgID}`,
            { body }
        );
    },

    /** Delete a message */
    deleteMessage(msgID: number) {
        return apiClient.delete<{ data: MessageResult }>(
            `${BASE}/messages/${msgID}`
        );
    },

    /** Pin a message */
    pinMessage(msgID: number) {
        return apiClient.post<{ data: MessageResult }>(
            `${BASE}/messages/${msgID}/pin`,
            {}
        );
    },

    /** Unpin a message — DELETE on the same /pin resource, not POST /unpin */
    unpinMessage(msgID: number) {
        return apiClient.delete<{ data: MessageResult }>(
            `${BASE}/messages/${msgID}/pin`
        );
    },

    /** Like a message */
    likeMessage(msgID: number) {
        return apiClient.post<{ data: MessageResult }>(
            `${BASE}/messages/${msgID}/like`,
            {}
        );
    },

    /** Remove my like from a message */
    unlikeMessage(msgID: number) {
        return apiClient.delete<{ data: MessageResult }>(
            `${BASE}/messages/${msgID}/like`
        );
    },

    /** Forward a message to target conversations */
    forwardMessage(msgID: number, targetConversationIDs: number[]) {
        return apiClient.post<{ data: MessageResult }>(
            `${BASE}/messages/${msgID}/forward`,
            { target_conversation_ids: targetConversationIDs }
        );
    },

    /** Mark conversation as read up to a message */
    markRead(convID: number, lastMessageID: number) {
        return apiClient.post<{ data: MessageResult }>(
            `${BASE}/conversations/${convID}/read`,
            { last_message_id: lastMessageID }
        );
    },

    // ── Scheduled messages ──────────────────────────────────────────────────

    /** Schedule a message to be sent at a future time */
    scheduleMessage(convID: number, body: string, sendAt: string, replyToID?: number | null) {
        return apiClient.post<{ data: ApiMessage }>(
            `${BASE}/conversations/${convID}/messages/schedule`,
            { body, send_at: sendAt, reply_to_id: replyToID ?? undefined }
        );
    },

    /**
     * List scheduled (not yet sent) messages in a conversation.
     * NB: backend handler currently returns 501 Not Implemented.
     */
    listScheduled(convID: number) {
        return apiClient.get<{ data: Paginated<ApiMessage> }>(
            `${BASE}/conversations/${convID}/messages/scheduled`
        );
    },

    /**
     * Cancel a scheduled message before it fires.
     * NB: backend handler currently returns 501 Not Implemented.
     */
    cancelScheduled(scheduledID: number) {
        return apiClient.delete<{ data: MessageResult }>(
            `${BASE}/scheduled/${scheduledID}`
        );
    },

    // ── Drafts ───────────────────────────────────────────────────────────────

    /** Save (upsert) the draft for a conversation */
    saveDraft(convID: number, body: string, replyToID?: number | null) {
        return apiClient.put<{ data: MessageResult }>(
            `${BASE}/conversations/${convID}/draft`,
            { body, reply_to_id: replyToID ?? undefined }
        );
    },

    /** Get the saved draft for a conversation */
    getDraft(convID: number) {
        return apiClient.get<{ data: ApiDraft }>(
            `${BASE}/conversations/${convID}/draft`
        );
    },

    /** Delete the saved draft for a conversation */
    deleteDraft(convID: number) {
        return apiClient.delete<{ data: MessageResult }>(
            `${BASE}/conversations/${convID}/draft`
        );
    },

    // ── Mentions & attachments ──────────────────────────────────────────────

    /**
     * List conversations/messages where I was mentioned.
     * NB: backend handler currently returns 501 Not Implemented.
     */
    listMentions() {
        return apiClient.get<{ data: Paginated<ApiMessage> }>(`${BASE}/mentions`);
    },

    /**
     * Upload a file to attach to a future message. Returns a storage key to
     * pass as `attachment_keys` in sendMessage/scheduleMessage.
     * NB: backend handler currently returns 501 Not Implemented.
     */
    uploadAttachment(file: File) {
        return apiClient.upload<{ data: ApiUploadedAttachment }>(
            `${BASE}/attachments/upload`,
            file
        );
    },

    setTyping(convID: number, isTyping: boolean) {
        return apiClient.post(`${BASE}/conversations/${convID}/typing`, { is_typing: isTyping });
    },
};