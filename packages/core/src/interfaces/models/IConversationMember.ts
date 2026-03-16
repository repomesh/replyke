import { User } from "./User";

export type ConversationMemberRole = "admin" | "member";

export interface IConversationMember {
  id: string;
  projectId: string;
  conversationId: string;
  userId: string;
  role: ConversationMemberRole | null;
  lastReadAt: Date | null;
  // Reserved for future mute functionality — no logic reads this in v1
  mutedUntil: Date | null;
  isActive: boolean;
  leftAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Populated
  user?: User;
}
