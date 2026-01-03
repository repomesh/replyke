import { useCallback } from "react";
import useProject from "../projects/useProject";
import {
  SpaceMembersResponse,
  SpaceMemberRole,
  SpaceMemberStatus,
} from "../../interfaces/models/SpaceMember";
import useAxiosPrivate from "../../config/useAxiosPrivate";

interface FetchSpaceMembersParams {
  spaceId: string;
  page?: number;
  limit?: number;
  role?: SpaceMemberRole;
  status?: SpaceMemberStatus;
}

function useFetchSpaceMembers() {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const fetchSpaceMembers = useCallback(
    async ({ spaceId, page, limit, role, status }: FetchSpaceMembersParams) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!spaceId) {
        throw new Error("Please pass a spaceId");
      }

      const queryParams = new URLSearchParams();
      if (page !== undefined) queryParams.append("page", page.toString());
      if (limit !== undefined) queryParams.append("limit", limit.toString());
      if (role) queryParams.append("role", role);
      if (status) queryParams.append("status", status);

      const queryString = queryParams.toString();
      const url = `/${projectId}/spaces/${spaceId}/members${queryString ? `?${queryString}` : ""}`;

      const response = await axios.get(url);

      return response.data as SpaceMembersResponse;
    },
    [projectId]
  );

  return fetchSpaceMembers;
}

export default useFetchSpaceMembers;
