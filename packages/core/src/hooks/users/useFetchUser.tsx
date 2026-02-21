import { useCallback } from "react";

import useProject from "../projects/useProject";
import axios from "../../config/axios";
import { User, UserIncludeParam } from "../../interfaces/models/User";

export interface FetchUserProps {
  userId: string;
  include?: UserIncludeParam;
}

function useFetchUser() {
  const { projectId } = useProject();

  const fetchUser = useCallback(
    async ({
      userId,
      include,
    }: FetchUserProps) => {
      if (!projectId) {
        throw new Error("No project specified");
      }

      if (!userId) {
        throw new Error("Please specify a user ID");
      }

      const response = await axios.get(`/${projectId}/users/${userId}`, {
        params: {
          include: Array.isArray(include) ? include.join(",") : include,
        },
      });

      return response.data as User;
    },
    [projectId]
  );

  return fetchUser;
}

export default useFetchUser;
