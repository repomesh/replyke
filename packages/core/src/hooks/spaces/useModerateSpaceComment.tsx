import { useCallback } from "react";
import useProject from "../projects/useProject";
import useAxiosPrivate from "../../config/useAxiosPrivate";

interface ModerateSpaceCommentParams {
  spaceId: string;
  commentId: string;
  action: "approve" | "remove";
  reason?: string;
}

interface ModerateResponse {
  message: string;
  moderationStatus: "approved" | "removed";
}

/**
 * Hook to moderate a comment within a space (approve or remove).
 * Requires space moderator permissions.
 *
 * @example
 * const moderateSpaceComment = useModerateSpaceComment();
 *
 * await moderateSpaceComment({
 *   spaceId: "space-uuid",
 *   commentId: "comment-uuid",
 *   action: "remove",
 *   reason: "Spam content"
 * });
 */
function useModerateSpaceComment() {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const moderateSpaceComment = useCallback(
    async ({
      spaceId,
      commentId,
      action,
      reason,
    }: ModerateSpaceCommentParams) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!spaceId || !commentId) {
        throw new Error("spaceId and commentId are required.");
      }

      const response = await axios.patch(
        `/${projectId}/spaces/${spaceId}/comments/${commentId}/moderation`,
        { action, reason }
      );

      return response.data as ModerateResponse;
    },
    [projectId, axios]
  );

  return moderateSpaceComment;
}

export default useModerateSpaceComment;
