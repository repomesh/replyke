import { useCallback } from "react";
import useProject from "../projects/useProject";
import { MySpacesResponse, SpaceIncludeParam } from "../../interfaces/models/Space";
import useAxiosPrivate from "../../config/useAxiosPrivate";

interface FetchMySpacesParams {
  page?: number;
  limit?: number;
  status?: "active" | "pending" | "banned";
  include?: SpaceIncludeParam;
}

function useFetchMySpaces() {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const fetchMySpaces = useCallback(
    async (params: FetchMySpacesParams = {}) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      const { include, ...rest } = params;
      const includeParam = include
        ? Array.isArray(include)
          ? include.join(",")
          : include
        : undefined;

      const response = await axios.get<MySpacesResponse>(
        `/${projectId}/spaces/my-spaces`,
        {
          params: {
            ...rest,
            ...(includeParam ? { include: includeParam } : {}),
          },
        }
      );

      return response.data;
    },
    [projectId, axios]
  );

  return fetchMySpaces;
}

export default useFetchMySpaces;
