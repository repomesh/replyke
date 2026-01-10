import { PaginatedResponse, PaginationMetadata } from "../IPaginatedResponse";

export type ReadingPermission = "anyone" | "members";
export type PostingPermission = "anyone" | "members" | "admins";

export type SpaceMemberRole = "admin" | "moderator" | "member";
export type SpaceMemberStatus = "pending" | "active" | "banned" | "rejected";

export interface SpaceMemberPermissions {
  isAdmin: boolean;
  isModerator: boolean;
  isMember: boolean;
  status: "pending" | "active" | "banned" | null;
  canPost: boolean;
  canModerate: boolean;
  canRead: boolean;
}
export type PaginationMeta = PaginationMetadata;

export interface SpacePreview {
  id: string;
  shortId: string;
  name: string;
  slug: string | null;
  avatar: string | null;
  readingPermission?: ReadingPermission;
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
  readingPermission: ReadingPermission;
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
  isMember?: boolean; // Optional: only present when user is authenticated
}

// Extended space with detailed information (returned from single space fetch endpoints)
export interface SpaceDetailed extends Space {
  // Current user's membership permissions in this space (always included when fetching single space)
  memberPermissions: SpaceMemberPermissions | null;

  // Parent space information (always included, null if root space)
  parentSpace: SpacePreview | null;

  // Child spaces preview (always included, empty array if no children)
  childSpaces: SpacePreview[];
}

// My Spaces response types
export interface MySpaceItem {
  space: Space;
  membership: {
    membershipId: string;
    role: SpaceMemberRole;
    status: SpaceMemberStatus;
    joinedAt: Date;
  };
}

export type MySpacesResponse = PaginatedResponse<MySpaceItem>;

// Mutation response types
export interface JoinSpaceResponse {
  message: string;
  membership: {
    id: string;
    spaceId: string;
    userId: string;
    role: "member";
    status: "pending" | "active";
    joinedAt: Date;
  };
}

export interface LeaveSpaceResponse {
  message: string;
}

export interface UpdateMemberRoleResponse {
  message: string;
  membership: {
    id: string;
    role: SpaceMemberRole;
    status: string;
    joinedAt: Date;
    userId: string;
  };
}

export interface ApproveMemberResponse {
  message: string;
  membership: {
    id: string;
    status: "active";
    joinedAt: Date;
  };
}

export interface DeclineMemberResponse {
  message: string;
  membership: {
    id: string;
    status: "rejected";
  };
}

export interface DeleteSpaceResponse {
  message: string;
  deletedSpace: {
    id: string;
    name: string;
  };
  counts: {
    entities: number;
    members: number;
    childSpaces: number;
  };
}
