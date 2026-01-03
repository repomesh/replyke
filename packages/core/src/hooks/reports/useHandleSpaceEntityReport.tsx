import { useCallback } from "react";
import useProject from "../projects/useProject";
import useAxiosPrivate from "../../config/useAxiosPrivate";

interface HandleSpaceEntityReportParams {
  spaceId: string;
  reportId: string;
  entityId: string;
  actions: Array<"delete-entity" | "ban-user" | "dismiss">;
  summary: string;
  userId?: string;
  reason?: string;
}

interface HandleReportResponse {
  message: string;
  code: string;
}

/**
 * Hook to handle entity reports at the space level
 * Space moderators can: delete entity, ban user from space, dismiss
 *
 * @example
 * const handleSpaceEntityReport = useHandleSpaceEntityReport();
 *
 * await handleSpaceEntityReport({
 *   spaceId: "space-uuid",
 *   reportId: "report-uuid",
 *   entityId: "entity-uuid",
 *   actions: ["delete-entity", "ban-user"],
 *   summary: "Removed spam content and banned user",
 *   userId: "user-uuid",
 *   reason: "Spamming"
 * });
 */
function useHandleSpaceEntityReport() {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const handleSpaceEntityReport = useCallback(
    async ({
      spaceId,
      reportId,
      entityId,
      actions,
      summary,
      userId,
      reason,
    }: HandleSpaceEntityReportParams) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!spaceId || !reportId) {
        throw new Error("spaceId and reportId are required");
      }

      const response = await axios.patch(
        `/${projectId}/spaces/${spaceId}/reports/entity/${reportId}`,
        {
          entityId,
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

  return handleSpaceEntityReport;
}

export default useHandleSpaceEntityReport;
