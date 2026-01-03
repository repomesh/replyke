import { useCallback } from "react";
import useProject from "../projects/useProject";
import useAxiosPrivate from "../../config/useAxiosPrivate";

interface HandleSpaceCommentReportParams {
  spaceId: string;
  reportId: string;
  commentId: string;
  actions: Array<"delete-comment" | "ban-user" | "dismiss">;
  summary: string;
  userId?: string;
  reason?: string;
}

interface HandleReportResponse {
  message: string;
  code: string;
}

/**
 * Hook to handle comment reports at the space level
 * Space moderators can: delete comment, ban user from space, dismiss
 *
 * @example
 * const handleSpaceCommentReport = useHandleSpaceCommentReport();
 *
 * await handleSpaceCommentReport({
 *   spaceId: "space-uuid",
 *   reportId: "report-uuid",
 *   commentId: "comment-uuid",
 *   actions: ["delete-comment"],
 *   summary: "Removed inappropriate comment"
 * });
 */
function useHandleSpaceCommentReport() {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const handleSpaceCommentReport = useCallback(
    async ({
      spaceId,
      reportId,
      commentId,
      actions,
      summary,
      userId,
      reason,
    }: HandleSpaceCommentReportParams) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!spaceId || !reportId) {
        throw new Error("spaceId and reportId are required");
      }

      const response = await axios.patch(
        `/${projectId}/spaces/${spaceId}/reports/comment/${reportId}`,
        {
          commentId,
          actions,
          summary,
          userId,
          reason,
        }
      );

      return response.data as HandleReportResponse;
    },
    [projectId, axios]
  );

  return handleSpaceCommentReport;
}

export default useHandleSpaceCommentReport;
