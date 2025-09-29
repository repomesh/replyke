import { useCallback } from "react";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../projects/useProject";
import { useUser } from "../../user";
import type { User } from "../../../interfaces/models/User";

export interface FollowerWithFollowInfo {
  followId: string;
  user: User;
  followedAt: string;
}

export interface FollowersResponse {
  followers: FollowerWithFollowInfo[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  };
}

export interface FetchFollowersParams {
  page?: number;
  limit?: number;
}

function useFetchFollowers() {
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

      const response = await axios.get(`/${projectId}/follows/followers`, {
        params: { page, limit },
        withCredentials: true,
      });

      return response.data as FollowersResponse;
    },
    [axios, projectId, user]
  );

  return fetchFollowers;
}

export default useFetchFollowers;
