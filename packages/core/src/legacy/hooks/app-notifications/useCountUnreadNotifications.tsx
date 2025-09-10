import { useCallback } from "react";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../../hooks/projects/useProject";
import { useUserRedux } from "../../../hooks/auth-redux";

function useCountUnreadNotifications() {
  const axios = useAxiosPrivate();
  const { projectId } = useProject();
  const { user } = useUserRedux();

  const countUnreadNotifications = useCallback(async () => {
    if (!user) {
      throw new Error("No authenticated user");
    }

    if (!projectId) {
      throw new Error("No projectId available.");
    }

    const response = await axios.get<number>(
      `/${projectId}/app-notifications/count`,
      { withCredentials: true }
    );
    return response.data as number;
  }, [projectId, user, axios]);

  return countUnreadNotifications;
}

export default useCountUnreadNotifications;
