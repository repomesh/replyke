import type { IChatMessage } from "../interfaces/models/IChatMessage";
import type { IConversation } from "../interfaces/models/IConversation";
import type { IConversationMember } from "../interfaces/models/IConversationMember";

// ─── Server → Client events ────────────────────────────────────────────────

export interface ServerToClientEvents {
  "message:created": (message: IChatMessage) => void;
  "message:updated": (payload: {
    messageId: string;
    conversationId: string;
    content: string | null;
    gif: IChatMessage["gif"];
    mentions: IChatMessage["mentions"];
    metadata: Record<string, any>;
    editedAt: Date | null;
  }) => void;
  "message:deleted": (payload: {
    messageId: string;
    conversationId: string;
    userDeletedAt: Date;
  }) => void;
  "message:removed": (payload: {
    messageId: string;
    conversationId: string;
  }) => void;
  "message:reaction": (payload: {
    messageId: string;
    conversationId: string;
    emoji: string;
    userId: string;
    delta: 1 | -1;
    reactionCounts: Record<string, number>;
  }) => void;
  "thread:reply_count": (payload: {
    messageId: string;
    conversationId: string;
    threadReplyCount: number;
  }) => void;
  "typing:start": (payload: {
    userId: string;
    conversationId: string;
  }) => void;
  "typing:stop": (payload: {
    userId: string;
    conversationId: string;
  }) => void;
  "member:joined": (payload: {
    conversationId: string;
    member: IConversationMember;
  }) => void;
  "member:left": (payload: {
    conversationId: string;
    userId: string;
  }) => void;
  "conversation:updated": (patch: Partial<IConversation> & { id: string }) => void;
  "conversation:deleted": (payload: { conversationId: string }) => void;
}

// ─── Client → Server events ────────────────────────────────────────────────

export interface ClientToServerEvents {
  "join:conversation": (payload: { conversationId: string }) => void;
  "leave:conversation": (payload: { conversationId: string }) => void;
  "typing:start": (payload: { conversationId: string }) => void;
  "typing:stop": (payload: { conversationId: string }) => void;
}
