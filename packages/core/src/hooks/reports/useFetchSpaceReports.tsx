import { useCallback } from "react";
import useProject from "../projects/useProject";
import useAxiosPrivate from "../../config/useAxiosPrivate";

interface FetchSpaceReportsParams {
  spaceId: string;
  targetType?: "Comment" | "Entity";
  sortBy?: "new" | "old";
  page?: number;
  limit?: number;
}

interface Report {
  id: string;
  projectId: string;
  spaceId: string | null;
  reporters: string[];
  targetId: string;
  targetType: "Comment" | "Entity";
  reason: string;
  details: string | null;
  status: "Pending" | "On Hold" | "Escalated" | "Dismissed" | "Actioned";
  actionTaken: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * Hook to fetch reports for a specific space
 * Only accessible by space moderators/admins
 *
 * @example
 * const fetchSpaceReports = useFetchSpaceReports();
 *
 * const reports = await fetchSpaceReports({
 *   spaceId: "space-uuid",
 *   targetType: "Entity",
 *   page: 1,
 *   limit: 20
 * });
 */
function useFetchSpaceReports() {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const fetchSpaceReports = useCallback(
    async ({
      spaceId,
      targetType,
      sortBy,
      page,
      limit,
    }: FetchSpaceReportsParams) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!spaceId) {
        throw new Error("Please pass a spaceId");
      }

      const queryParams = new URLSearchParams();
      if (targetType) queryParams.append("targetType", targetType);
      if (sortBy) queryParams.append("sortBy", sortBy);
      if (page !== undefined) queryParams.append("page", page.toString());
      if (limit !== undefined) queryParams.append("limit", limit.toString());

      const queryString = queryParams.toString();
      const url = `/${projectId}/spaces/${spaceId}/reports${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await axios.get(url);

      return response.data as Report[];
    },
    [projectId, axios]
  );

  return fetchSpaceReports;
}

export default useFetchSpaceReports;
