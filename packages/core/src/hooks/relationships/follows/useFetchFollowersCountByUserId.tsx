import { useCallback } from "react";
import useProject from "../../projects/useProject";
import axios from "../../../config/axios";

function useFetchFollowersCountByUserId() {
  const { projectId } = useProject();

  const fetchFollowersCountByUserId = useCallback(
    async ({ userId }: { userId: string }) => {
      if (!userId) {
        throw new Error("No userId provided.");
      }

      if (!projectId) {
        throw new Error("No projectId available.");
      }

      const response = await axios.get(
        `/${projectId}/users/${userId}/followers-count`
      );

      return response.data as { count: number };
    },
    [projectId]
  );

  return fetchFollowersCountByUserId;
}

export default useFetchFollowersCountByUserId;
