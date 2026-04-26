import { useCallback } from "react";
import useProject from "../../projects/useProject";
import type { User } from "../../../interfaces/models/User";
import { PaginatedResponse } from "../../../interfaces/PaginatedResponse";
import axios from "../../../config/axios";

export interface FollowerWithFollowInfo {
  followId: string;
  user: User;
  followedAt: string;
}

export interface FetchFollowersByUserIdParams {
  userId: string;
  page?: number;
  limit?: number;
}

function useFetchFollowersByUserId(): (params: FetchFollowersByUserIdParams) => Promise<PaginatedResponse<FollowerWithFollowInfo>> {
  const { projectId } = useProject();

  const fetchFollowersByUserId = useCallback(
    async ({ userId, page = 1, limit = 20 }: FetchFollowersByUserIdParams) => {
      if (!userId) {
        throw new Error("No userId provided.");
      }

      if (!projectId) {
        throw new Error("No projectId available.");
      }

      const response = await axios.get<PaginatedResponse<FollowerWithFollowInfo>>(
        `/${projectId}/users/${userId}/followers`,
        { params: { page, limit } }
      );

      return response.data;
    },
    [projectId]
  );

  return fetchFollowersByUserId;
}

export default useFetchFollowersByUserId;
