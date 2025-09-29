import { useCallback } from "react";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../projects/useProject";

function useFetchFollowingCountByUserId() {
  const axios = useAxiosPrivate();
  const { projectId } = useProject();

  const fetchFollowingCountByUserId = useCallback(
    async ({ userId }: { userId: string }) => {
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
    [axios, projectId]
  );

  return fetchFollowingCountByUserId;
}

export default useFetchFollowingCountByUserId;
