import { useCallback } from "react";

import useProject from "../projects/useProject";
import axios from "../../config/axios";
import { User, UserIncludeParam } from "../../interfaces/models/User";

export interface FetchUserByForeignIdProps {
  foreignId: string;
  include?: UserIncludeParam;
}

function useFetchUserByForeignId() {
  const { projectId } = useProject();

  const fetchUserByForeignId = useCallback(
    async ({
      foreignId,
      include,
    }: FetchUserByForeignIdProps) => {
      if (!projectId) {
        throw new Error("No project specified");
      }

      if (!foreignId) {
        throw new Error("Please specify a foreign ID");
      }

      const response = await axios.get(`/${projectId}/users/by-foreign-id`, {
        params: {
          foreignId,
          include: Array.isArray(include) ? include.join(",") : include,
        },
      });

      return response.data as User;
    },
    [projectId]
  );

  return fetchUserByForeignId;
}

export default useFetchUserByForeignId;
