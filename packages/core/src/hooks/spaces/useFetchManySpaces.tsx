import { useCallback } from "react";
import useProject from "../projects/useProject";
import useAxiosPrivate from "../../config/useAxiosPrivate";
import { Space, PaginatedResponse } from "../../interfaces/models/Space";
import { SpaceListSortByOptions } from "../../interfaces/SpaceListSortByOptions";

interface FetchManySpacesParams {
  page?: number;
  limit?: number;
  sortBy?: SpaceListSortByOptions;
  search?: string | null;
  memberOf?: boolean;
  parentSpaceId?: string | null;
}

function useFetchManySpaces() {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const fetchManySpaces = useCallback(
    async (params?: FetchManySpacesParams) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      const queryParams: Record<string, any> = {};

      if (params?.page !== undefined) queryParams.page = params.page;
      if (params?.limit !== undefined) queryParams.limit = params.limit;
      if (params?.sortBy) queryParams.sortBy = params.sortBy;
      if (params?.search) queryParams.search = params.search;
      if (params?.memberOf !== undefined) queryParams.memberOf = params.memberOf;
      if (params?.parentSpaceId !== undefined) queryParams.parentSpaceId = params.parentSpaceId || "null";

      const response = await axios.get(`/${projectId}/spaces`, {
        params: queryParams,
      });

      return response.data as PaginatedResponse<Space>;
    },
    [projectId, axios]
  );

  return fetchManySpaces;
}

export default useFetchManySpaces;
