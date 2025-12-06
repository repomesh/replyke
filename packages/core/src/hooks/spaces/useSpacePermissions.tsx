import { useMemo } from "react";
import { SpaceUserRole, PostingPermission } from "../../interfaces/models/Space";

interface UseSpacePermissionsProps {
  userRole: SpaceUserRole | null | undefined;
  postingPermission: PostingPermission;
}

interface UseSpacePermissionsValues {
  isMember: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  canPost: boolean;
  canModerate: boolean;
  isPending: boolean;
  isBanned: boolean;
}

function useSpacePermissions({
  userRole,
  postingPermission,
}: UseSpacePermissionsProps): UseSpacePermissionsValues {
  return useMemo(() => {
    if (!userRole) {
      // User is not a member
      return {
        isMember: false,
        isAdmin: false,
        isModerator: false,
        canPost: postingPermission === "anyone",
        canModerate: false,
        isPending: false,
        isBanned: false,
      };
    }

    const isAdmin = userRole.role === "admin";
    const isModerator = userRole.role === "moderator" || isAdmin;
    const isActiveMember = userRole.status === "active";
    const isPending = userRole.status === "pending";
    const isBanned = userRole.status === "banned";

    let canPost = false;
    if (postingPermission === "anyone") {
      canPost = !isBanned;
    } else if (postingPermission === "members") {
      canPost = isActiveMember && !isBanned;
    } else if (postingPermission === "admins") {
      canPost = isAdmin && isActiveMember && !isBanned;
    }

    return {
      isMember: true,
      isAdmin,
      isModerator,
      canPost,
      canModerate: isModerator && isActiveMember && !isBanned,
      isPending,
      isBanned,
    };
  }, [userRole, postingPermission]);
}

export default useSpacePermissions;
