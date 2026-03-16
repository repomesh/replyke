import { File } from "./File";
import { IChatMessage } from "./IChatMessage";
import { IConversationMember } from "./IConversationMember";

export interface IConversation {
  id: string;
  projectId: string;
  type: "direct" | "group" | "space";
  name: string | null;
  description: string | null;
  spaceId: string | null;
  createdById: string | null;
  avatarFileId: string | null;
  lastMessageAt: Date | null;
  // Null for DMs and groups; 'members' | 'admins' for space chats
  postingPermission: "members" | "admins" | null;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;

  // Populated fields
  memberCount?: number;
  // The requesting user's own ConversationMember row — used to bootstrap lastReadAt and role
  currentMember?: IConversationMember;
  avatarFile?: File;
}

export interface IConversationPreview extends IConversation {
  unreadCount: number;
  // Truncated to 100 chars by the server for list performance
  lastMessage: IChatMessage | null;
}
