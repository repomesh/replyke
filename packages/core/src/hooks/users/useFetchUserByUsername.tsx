import { useCallback } from "react";

import useProject from "../projects/useProject";
import axios from "../../config/axios";
import { User } from "../../interfaces/models/User";

function useFetchUserByUsername() {
  const { projectId } = useProject();

  const fetchUserByUsername = useCallback(
    async ({ username }: { username: string }) => {
      if (!projectId) {
        throw new Error("No project specified");
      }

      if (!username) {
        throw new Error("Please specify a username");
      }

      const response = await axios.get(`/${projectId}/users/by-username`, {
        params: { username },
      });

      return response.data as User;
    },
    [projectId]
  );

  return fetchUserByUsername;
}

export default useFetchUserByUsername;
