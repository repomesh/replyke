import { useCallback } from "react";

import useProject from "../projects/useProject";
import axios from "../../config/axios";
import { User, UserIncludeParam } from "../../interfaces/models/User";

function useFetchUserByUsername() {
  const { projectId } = useProject();

  const fetchUserByUsername = useCallback(
    async ({
      username,
      include,
    }: {
      username: string;
      include?: UserIncludeParam;
    }) => {
      if (!projectId) {
        throw new Error("No project specified");
      }

      if (!username) {
        throw new Error("Please specify a username");
      }

      const response = await axios.get(`/${projectId}/users/by-username`, {
        params: {
          username,
          include: Array.isArray(include) ? include.join(",") : include,
        },
      });

      return response.data as User;
    },
    [projectId]
  );

  return fetchUserByUsername;
}

export default useFetchUserByUsername;
