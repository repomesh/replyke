import { useCallback } from "react";
import useProject from "../projects/useProject";
import useAxiosPrivate from "../../config/useAxiosPrivate";
import { PaginatedResponse } from "../../interfaces/IPaginatedResponse";
import { Entity } from "../../interfaces/models/Entity";
import { Comment } from "../../interfaces/models/Comment";
import { Space } from "../../interfaces/models/Space";

interface FetchModeratedReportsParams {
  spaceId?: string;
  targetType?: "Comment" | "Entity";
  status?: "Pending" | "On Hold" | "Escalated" | "Dismissed" | "Actioned";
  sortBy?: "new" | "old";
  page?: number;
  limit?: number;
}

interface ReportUserReport {
  id: string;
  userId: string;
  reason: string;
  details: string | null;
  createdAt: Date;
}

interface Report {
  id: string;
  projectId: string;
  spaceId: string | null;
  targetId: string;
  targetType: "Comment" | "Entity";
  reporterCount: number;
  userReports: ReportUserReport[];
  status: "Pending" | "On Hold" | "Escalated" | "Dismissed" | "Actioned";
  actionTaken: string | null;
  target: Entity | Comment | null;
  space: Space | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * Hook to fetch reports for spaces the user can moderate
 *
 * If spaceId is provided, returns reports for that specific space
 * If spaceId is omitted, returns reports from ALL spaces the user moderates
 *
 * @example
 * const fetchModeratedReports = useFetchModeratedReports();
 *
 * // Fetch reports for a specific space
 * const reports = await fetchModeratedReports({
 *   spaceId: "space-uuid",
 *   targetType: "Entity",
 *   page: 1,
 *   limit: 20
 * });
 *
 * // Fetch reports from ALL spaces the user moderates
 * const allReports = await fetchModeratedReports({
 *   page: 1,
 *   limit: 20
 * });
 */
function useFetchModeratedReports() {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const fetchModeratedReports = useCallback(
    async ({
      spaceId,
      targetType,
      status,
      sortBy,
      page,
      limit,
    }: FetchModeratedReportsParams) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      const response = await axios.get<PaginatedResponse<Report>>(
        `/${projectId}/reports/moderated`,
        { params: { spaceId, targetType, status, sortBy, page, limit } }
      );

      return response.data;
    },
    [projectId, axios]
  );

  return fetchModeratedReports;
}

export default useFetchModeratedReports;
