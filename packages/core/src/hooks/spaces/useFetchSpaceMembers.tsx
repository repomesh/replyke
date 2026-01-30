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

      const response = await axios.get<SpaceMembersResponse>(
        `/${projectId}/spaces/${spaceId}/members`,
        { params: { page, limit, role, status } }
      );

      return response.data;
    },
    [projectId, axios]
  );

  return fetchSpaceMembers;
}

export default useFetchSpaceMembers;
