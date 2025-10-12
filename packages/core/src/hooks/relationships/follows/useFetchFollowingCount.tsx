import { useCallback } from "react";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../projects/useProject";
import { useUser } from "../../user";

function useFetchFollowingCount() {
  const axios = useAxiosPrivate();
  const { projectId } = useProject();
  const { user } = useUser();

  const fetchFollowingCount = useCallback(
    async () => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!user) {
        throw new Error("No user is logged in.");
      }

      const response = await axios.get(
        `/${projectId}/follows/following-count`,
        { withCredentials: true }
      );

      return response.data as { count: number };
    },
    [axios, projectId, user]
  );

  return fetchFollowingCount;
}

export default useFetchFollowingCount;