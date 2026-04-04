import { useCallback } from "react";
import useProject from "../../projects/useProject";
import type { User } from "../../../interfaces/models/User";
import { PaginatedResponse } from "../../../interfaces/PaginatedResponse";
import axios from "../../../config/axios";

export interface FollowingWithFollowInfo {
  followId: string;
  user: User;
  followedAt: string;
}

export interface FetchFollowingByUserIdParams {
  userId: string;
  page?: number;
  limit?: number;
}

function useFetchFollowingByUserId(): (params: FetchFollowingByUserIdParams) => Promise<PaginatedResponse<FollowingWithFollowInfo>> {
  const { projectId } = useProject();

  const fetchFollowingByUserId = useCallback(
    async ({ userId, page = 1, limit = 20 }: FetchFollowingByUserIdParams) => {
      if (!userId) {
        throw new Error("No userId provided.");
      }

      if (!projectId) {
        throw new Error("No projectId available.");
      }

      const response = await axios.get<PaginatedResponse<FollowingWithFollowInfo>>(
        `/${projectId}/users/${userId}/following`,
        {
          params: {
            page,
            limit,
          },
        }
      );

      return response.data;
    },
    [projectId]
  );

  return fetchFollowingByUserId;
}

export default useFetchFollowingByUserId;
