import { useMemo } from "react";
import {
  SpaceMemberPermissions,
  PostingPermission,
  ReadingPermission,
} from "../../interfaces/models/Space";

export interface UseSpacePermissionsProps {
  memberPermissions: SpaceMemberPermissions | null | undefined;
  postingPermission: PostingPermission;
  readingPermission?: ReadingPermission;
}

export interface UseSpacePermissionsValues {
  isMember: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  canPost: boolean;
  canModerate: boolean;
  canRead: boolean;
  isPending: boolean;
  isBanned: boolean;
}

function useSpacePermissions({
  memberPermissions,
  postingPermission,
  readingPermission = "anyone",
}: UseSpacePermissionsProps): UseSpacePermissionsValues {
  return useMemo(() => {
    if (!memberPermissions) {
      // User is not a member
      return {
        isMember: false,
        isAdmin: false,
        isModerator: false,
        canPost: postingPermission === "anyone",
        canModerate: false,
        canRead: readingPermission === "anyone",
        isPending: false,
        isBanned: false,
      };
    }

    // Use server-computed permission booleans directly so the server stays the
    // single source of truth and client/server logic can't drift.
    return {
      isMember: memberPermissions.isMember,
      isAdmin: memberPermissions.isAdmin,
      isModerator: memberPermissions.isModerator,
      canPost: memberPermissions.canPost,
      canModerate: memberPermissions.canModerate,
      canRead: memberPermissions.canRead,
      isPending: memberPermissions.status === "pending",
      isBanned: memberPermissions.status === "banned",
    };
  }, [memberPermissions, postingPermission, readingPermission]);
}

export default useSpacePermissions;
