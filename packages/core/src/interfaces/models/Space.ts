export type SpaceVisibility = "public" | "private";
export type PostingPermission = "anyone" | "members" | "admins";

export type SpaceMemberRole = "admin" | "moderator" | "member";
export type SpaceMemberStatus = "pending" | "active" | "banned" | "rejected";

export interface SpaceUserRole {
  role: SpaceMemberRole;
  status: SpaceMemberStatus;
  canPost: boolean;
  canModerate: boolean;
  isAdmin: boolean;
}

export interface SpacePreview {
  id: string;
  shortId: string;
  name: string;
  slug: string | null;
  avatar: string | null;
  visibility?: SpaceVisibility;
  parentSpaceId?: string | null;
  depth?: number;
}

export interface Space {
  // Core identifiers
  id: string;
  projectId: string;
  shortId: string;
  slug: string | null;

  // Display info
  name: string;
  description: string | null;
  avatar: string | null;
  banner: string | null;

  // Ownership & permissions
  userId: string;
  visibility: SpaceVisibility;
  postingPermission: PostingPermission;
  requireJoinApproval: boolean;

  // Hierarchy
  parentSpaceId: string | null;
  depth: number;

  // Metadata
  metadata: Record<string, any>;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  // Computed fields
  membersCount: number;
  childSpacesCount: number;
}

// Extended space with detailed information (returned from single space fetch endpoints)
export interface SpaceDetailed extends Space {
  // User's role and permissions in this space (always included when fetching single space)
  userRole: SpaceUserRole | null;

  // Parent space information (always included, null if root space)
  parentSpace: SpacePreview | null;

  // Child spaces preview (always included, empty array if no children)
  childSpaces: SpacePreview[];
}
