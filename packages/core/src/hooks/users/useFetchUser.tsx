import { useCallback } from "react";

import useProject from "../projects/useProject";
import axios from "../../config/axios";
import { User, UserIncludeParam } from "../../interfaces/models/User";

function useFetchUser() {
  const { projectId } = useProject();

  const fetchUser = useCallback(
    async ({
      userId,
      include,
    }: {
      userId: string;
      include?: UserIncludeParam;
    }) => {
      if (!projectId) {
        throw new Error("No project specified");
      }

      if (!userId) {
        throw new Error("Please specify a user ID");
      }

      const includeParam = include
        ? Array.isArray(include)
          ? include.join(",")
          : include
        : undefined;

      const response = await axios.get(`/${projectId}/users/${userId}`, {
        params: includeParam ? { include: includeParam } : undefined,
      });

      return response.data as User;
    },
    [projectId]
  );

  return fetchUser;
}

export default useFetchUser;
