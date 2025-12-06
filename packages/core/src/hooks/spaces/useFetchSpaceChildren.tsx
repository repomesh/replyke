import { useCallback } from "react";
import useProject from "../projects/useProject";
import { Space } from "../../interfaces/models/Space";
import axios from "../../config/axios";

interface FetchSpaceChildrenParams {
  spaceId: string;
  page?: number;
  limit?: number;
}

function useFetchSpaceChildren() {
  const { projectId } = useProject();

  const fetchSpaceChildren = useCallback(
    async ({ spaceId, page = 1, limit = 20 }: FetchSpaceChildrenParams) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!spaceId) {
        throw new Error("Please pass a spaceId");
      }

      const response = await axios.get(
        `/${projectId}/spaces/${spaceId}/children?page=${page}&limit=${limit}`
      );

      return response.data as Space[];
    },
    [projectId]
  );

  return fetchSpaceChildren;
}

export default useFetchSpaceChildren;
