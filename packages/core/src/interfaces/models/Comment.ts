import { Entity } from "./Entity";
import { Mention } from "./Mention";
import { User } from "./User";
import { ReactionCounts, ReactionType } from "./Reaction";

export interface GifData {
  id: string;
  url: string;
  gifUrl: string;
  gifPreviewUrl: string;
  altText: string | undefined;
  aspectRatio: number;
}

export interface Comment {
  id: string; // Sequelize auto-generates this
  projectId: string; // Required
  foreignId: string | null;
  entityId: string; // Required
  entity?: Entity; // Optional - included when include contains "entity" or "space"
  userId: string;
  user?: User; // Optional - included when include contains "user"
  parentId: string | null; // Optional parent comment (if it's a reply)
  parentComment?: Comment; // Optional - included when include contains "parent"
  content: string | null; // Required
  gif: GifData | null;
  mentions: Mention[];
  upvotes: string[]; // Array of user IDs (v6 legacy - v7 uses reactionCounts)
  downvotes: string[]; // Array of user IDs (v6 legacy - v7 uses reactionCounts)
  reactionCounts: ReactionCounts; // v7 reaction system - counts for all 8 reaction types
  userReaction?: ReactionType | null; // v7 - current user's reaction (populated when authenticated)
  repliesCount: number; // Count of replies
  metadata: Record<string, any>; // JSON object that could contain any other data about the comment which is relevant. Limited to 10KB size.
  createdAt: Date; // Timestamp for creation
  updatedAt: Date; // Timestamp for updating
  deletedAt: Date | null; // Timestamp for updating
  parentDeletedAt: Date | null; // Timestamp for updating
}

export type CommentInclude = "user" | "entity" | "space" | "parent";
export type CommentIncludeArray = CommentInclude[];
export type CommentIncludeParam = CommentInclude | CommentIncludeArray;
