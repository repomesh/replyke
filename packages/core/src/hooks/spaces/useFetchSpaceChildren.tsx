import { useCallback } from "react";
import useProject from "../projects/useProject";
import { Space, SpaceIncludeParam } from "../../interfaces/models/Space";
import { PaginatedResponse } from "../../interfaces/IPaginatedResponse";
import axios from "../../config/axios";

interface FetchSpaceChildrenParams {
  spaceId: string;
  page?: number;
  limit?: number;
  include?: SpaceIncludeParam;
}

function useFetchSpaceChildren() {
  const { projectId } = useProject();

  const fetchSpaceChildren = useCallback(
    async ({ spaceId, page = 1, limit = 20, include }: FetchSpaceChildrenParams) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!spaceId) {
        throw new Error("Please pass a spaceId");
      }

      const includeParam = include
        ? Array.isArray(include)
          ? include.join(",")
          : include
        : undefined;

      const response = await axios.get<PaginatedResponse<Space>>(
        `/${projectId}/spaces/${spaceId}/children`,
        {
          params: {
            page,
            limit,
            ...(includeParam ? { include: includeParam } : {}),
          },
        }
      );

      return response.data;
    },
    [projectId]
  );

  return fetchSpaceChildren;
}

export default useFetchSpaceChildren;
