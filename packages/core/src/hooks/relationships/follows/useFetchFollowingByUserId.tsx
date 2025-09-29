import { useCallback } from "react";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../projects/useProject";
import type { User } from "../../../interfaces/models/User";

export interface FollowingWithFollowInfo {
  followId: string;
  user: User;
  followedAt: string;
}

export interface FollowingResponse {
  following: FollowingWithFollowInfo[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  };
}

export interface FetchFollowingByUserIdParams {
  userId: string;
  page?: number;
  limit?: number;
}

function useFetchFollowingByUserId() {
  const axios = useAxiosPrivate();
  const { projectId } = useProject();

  const fetchFollowingByUserId = useCallback(
    async ({ userId, page = 1, limit = 20 }: FetchFollowingByUserIdParams) => {
      if (!userId) {
        throw new Error("No userId provided.");
      }

      if (!projectId) {
        throw new Error("No projectId available.");
      }

      const response = await axios.get(
        `/${projectId}/users/${userId}/following`,
        {
          params: {
            page,
            limit,
          },
        }
      );

      return response.data as FollowingResponse;
    },
    [axios, projectId]
  );

  return fetchFollowingByUserId;
}

export default useFetchFollowingByUserId;
