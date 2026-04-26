import { useCallback } from "react";
import useProject from "../projects/useProject";
import useAxiosPrivate from "../../config/useAxiosPrivate";
import { Space, SpaceIncludeParam } from "../../interfaces/models/Space";
import { PaginatedResponse } from "../../interfaces/PaginatedResponse";
import { SpaceListSortByOptions } from "../../interfaces/SpaceListSortByOptions";

export interface FetchManySpacesProps {
  page?: number;
  limit?: number;
  sortBy?: SpaceListSortByOptions;
  searchSlug?: string | null;
  searchName?: string | null;
  searchDescription?: string | null;
  searchAny?: string | null;
  memberOf?: boolean;
  parentSpaceId?: string | null;
  include?: SpaceIncludeParam;
}

function useFetchManySpaces(): (params?: FetchManySpacesProps) => Promise<PaginatedResponse<Space>> {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const fetchManySpaces = useCallback(
    async (params?: FetchManySpacesProps) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      const queryParams: Record<string, any> = {};

      if (params?.page !== undefined) queryParams.page = params.page;
      if (params?.limit !== undefined) queryParams.limit = params.limit;
      if (params?.sortBy) queryParams.sortBy = params.sortBy;
      if (params?.searchSlug) queryParams.searchSlug = params.searchSlug;
      if (params?.searchName) queryParams.searchName = params.searchName;
      if (params?.searchDescription) queryParams.searchDescription = params.searchDescription;
      if (params?.searchAny) queryParams.searchAny = params.searchAny;
      if (params?.memberOf !== undefined) queryParams.memberOf = params.memberOf;
      if (params?.parentSpaceId !== undefined) queryParams.parentSpaceId = params.parentSpaceId || "null";
      if (params?.include) {
        queryParams.include = Array.isArray(params.include)
          ? params.include.join(",")
          : params.include;
      }

      const response = await axios.get<PaginatedResponse<Space>>(
        `/${projectId}/spaces`,
        {
          params: queryParams,
        }
      );

      return response.data;
    },
    [projectId, axios]
  );

  return fetchManySpaces;
}

export default useFetchManySpaces;
