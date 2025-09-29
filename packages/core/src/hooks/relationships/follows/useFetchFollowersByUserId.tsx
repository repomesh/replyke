import { useCallback } from "react";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../projects/useProject";
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

export interface FetchFollowersByUserIdParams {
  userId: string;
  page?: number;
  limit?: number;
}

function useFetchFollowersByUserId() {
  const axios = useAxiosPrivate();
  const { projectId } = useProject();

  const fetchFollowersByUserId = useCallback(
    async ({ userId, page = 1, limit = 20 }: FetchFollowersByUserIdParams) => {
      if (!userId) {
        throw new Error("No userId provided.");
      }

      if (!projectId) {
        throw new Error("No projectId available.");
      }

      const response = await axios.get(
        `/${projectId}/users/${userId}/followers`,
        { params: { page, limit } }
      );

      return response.data as FollowersResponse;
    },
    [axios, projectId]
  );

  return fetchFollowersByUserId;
}

export default useFetchFollowersByUserId;
