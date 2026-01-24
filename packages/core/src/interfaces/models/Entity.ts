import { Mention } from "./Mention";
import { User } from "./User";
import { Space } from "./Space";
import { ReactionCounts, ReactionType } from "./Reaction";

export interface TopComment {
  id: string;
  user: User;
  upvotesCount: number;
  content: string;
  createdAt: string;
}

// Image variant structure (matches backend Image model)
export interface EntityImageVariant {
  path: string;           // Relative storage path
  publicPath: string;     // Proxy URL for client access
  width: number;
  height: number;
  size: number;           // Bytes
  format: string;         // webp, jpeg, png
}

// Image extension data (populated for type: "image" files)
export interface EntityImage {
  fileId: string;
  originalWidth: number;
  originalHeight: number;
  variants: Record<string, EntityImageVariant>;  // thumbnail, small, medium, large, etc.
  processingStatus: "completed" | "failed";
  processingError: string | null;
  format: string;         // User-requested format
  quality: number;        // User-requested quality (1-100)
  exifStripped: boolean;
  createdAt: string;
  updatedAt: string;
}

// File record (base table)
export interface EntityFile {
  id: string;
  projectId: string;
  userId: string | null;
  entityId: string | null;
  commentId: string | null;
  spaceId: string | null;
  type: "image" | "video" | "document" | "other";
  originalPath: string;       // Relative storage path
  originalSize: number;        // Bytes
  originalMimeType: string;
  position: number;            // Upload order (0-indexed)
  metadata: Record<string, any>;
  image?: EntityImage;         // Optional - only for type: "image"
  createdAt: string;
  updatedAt: string;
}

export interface Entity {
  id: string; // Unique entity ID
  foreignId: string | null; // If integrated on top of existing data, this would be the id of the item in your system. Could also accept static values such as "about-page"
  shortId: string; // Automatically generated - also unique - could be used to generate sharing links
  projectId: string;
  sourceId: string | null;
  spaceId: string | null; // Optional space association - entities can be organized into spaces
  space?: Space | null; // Optional space object populated when include contains "space"
  user?: User | null;
  title: string | null;
  content: string | null;
  mentions: Mention[]; // Array of mentions of other users
  attachments: Record<string, any>[]; // Array of JSON objects representing information about media items (e.g. url, size, format etc). Flexible structure.
  files?: EntityFile[]; // Optional - System-managed file associations (populated when entity created with files or when include contains "files")
  keywords: string[]; // An array of keywords/tags. These could be used to filter the feed
  upvotes: string[]; // An array of ids of users that upvoted the entity (v6 legacy - v7 uses reactionCounts)
  downvotes: string[]; // An array of ids of users that downvoted the entity (v6 legacy - v7 uses reactionCounts)
  reactionCounts: ReactionCounts; // v7 reaction system - counts for all 8 reaction types
  userReaction?: ReactionType | null; // v7 - current user's reaction (populated when authenticated)
  repliesCount: number; // A number representing how many comments and replies the entity has
  // sharesCount: number;
  views: number; // A number representing a count of how many views the entity received
  score: number; // A "hotness" score of ths entity. Automatically generated based on activity
  scoreUpdatedAt: Date; // Last tme the score was updated
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  } | null; // Optional location stored as GeoJSON. For example, if the entity is used to represent hotel listings
  metadata: Record<string, any>; // JSON object that could contain any other data about the entity which is relevant to the project. Limited to 10KB size.
  topComment: TopComment | null; // Optional field for top comment. As long as there is at least one comment it will be populated
  isSaved?: boolean; // Optional field populated when include contains "saved" - indicates if current user saved this entity
  createdAt: Date; // Use camelCase for `created_at`
  updatedAt: Date; // Use camelCase for `updated_at`
  deletedAt: Date | null; // Use camelCase for `updated_at`
}

export type EntityInclude = "space" | "user" | "topComment" | "saved" | "files";
export type EntityIncludeArray = EntityInclude[];
export type EntityIncludeParam = string | EntityIncludeArray;
