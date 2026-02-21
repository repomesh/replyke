import { useCallback } from "react";
import useProject from "../../projects/useProject";
import axios from "../../../config/axios";

export interface FetchFollowingCountByUserIdProps {
  userId: string;
}

function useFetchFollowingCountByUserId() {
  const { projectId } = useProject();

  const fetchFollowingCountByUserId = useCallback(
    async ({ userId }: FetchFollowingCountByUserIdProps) => {
      if (!userId) {
        throw new Error("No userId provided.");
      }

      if (!projectId) {
        throw new Error("No projectId available.");
      }

      const response = await axios.get(
        `/${projectId}/users/${userId}/following-count`
      );

      return response.data as { count: number };
    },
    [projectId]
  );

  return fetchFollowingCountByUserId;
}

export default useFetchFollowingCountByUserId;
