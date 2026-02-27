import { useCallback } from "react";
import useProject from "../projects/useProject";
import { UserSpacesResponse, SpaceIncludeParam } from "../../interfaces/models/Space";
import { SpaceMemberRole } from "../../interfaces/models/SpaceMember";
import useAxiosPrivate from "../../config/useAxiosPrivate";

export interface FetchUserSpacesProps {
  page?: number;
  limit?: number;
  status?: "active" | "pending" | "banned";
  role?: SpaceMemberRole | SpaceMemberRole[];
  all?: boolean;
  include?: SpaceIncludeParam;
}

function useFetchUserSpaces(): (params?: FetchUserSpacesProps) => Promise<UserSpacesResponse> {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const fetchUserSpaces = useCallback(
    async (params: FetchUserSpacesProps = {}) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      const { include, role, ...rest } = params;

      const response = await axios.get<UserSpacesResponse>(
        `/${projectId}/spaces/user-spaces`,
        {
          params: {
            ...rest,
            include: Array.isArray(include) ? include.join(",") : include,
            role: Array.isArray(role) ? role.join(",") : role,
          },
        }
      );

      return response.data;
    },
    [projectId, axios]
  );

  return fetchUserSpaces;
}

export default useFetchUserSpaces;
