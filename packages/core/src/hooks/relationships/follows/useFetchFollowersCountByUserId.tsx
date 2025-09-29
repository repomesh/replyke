import { useCallback } from "react";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../projects/useProject";

function useFetchFollowersCountByUserId() {
  const axios = useAxiosPrivate();
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
    [axios, projectId]
  );

  return fetchFollowersCountByUserId;
}

export default useFetchFollowersCountByUserId;
