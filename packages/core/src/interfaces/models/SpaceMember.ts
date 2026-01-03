import { PaginatedResponse } from "./Space";

export type SpaceMemberRole = "admin" | "moderator" | "member";
export type SpaceMemberStatus = "pending" | "active" | "banned" | "rejected";

export interface SpaceMember {
  id: string;
  projectId: string;
  spaceId: string;
  userId: string;
  role: SpaceMemberRole;
  status: SpaceMemberStatus;
  joinedAt: Date;
  createdAt: Date;
}

// Space member with user information (returned from fetchSpaceMembers)
export interface SpaceMemberWithUser {
  membershipId: string;
  role: SpaceMemberRole;
  status: SpaceMemberStatus;
  joinedAt: Date;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    metadata: object;
    // Excludes: hash, salt, email, isVerified, isActive, lastActive, secureMetadata
  };
}

export type SpaceMembersResponse = PaginatedResponse<SpaceMemberWithUser>;
