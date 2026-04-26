import { useCallback } from "react";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../projects/useProject";
import { useUser } from "../../user";
import type { User } from "../../../interfaces/models/User";
import { PaginatedResponse } from "../../../interfaces/PaginatedResponse";

export interface FollowerWithFollowInfo {
  followId: string;
  user: User;
  followedAt: string;
}

export interface FetchFollowersParams {
  page?: number;
  limit?: number;
}

function useFetchFollowers(): (params?: FetchFollowersParams) => Promise<PaginatedResponse<FollowerWithFollowInfo>> {
  const axios = useAxiosPrivate();
  const { projectId } = useProject();
  const { user } = useUser();

  const fetchFollowers = useCallback(
    async ({ page = 1, limit = 20 }: FetchFollowersParams = {}) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!user) {
        throw new Error("No user is logged in.");
      }

      const response = await axios.get<PaginatedResponse<FollowerWithFollowInfo>>(
        `/${projectId}/follows/followers`,
        {
          params: { page, limit },
        }
      );

      return response.data;
    },
    [axios, projectId, user]
  );

  return fetchFollowers;
}

export default useFetchFollowers;
