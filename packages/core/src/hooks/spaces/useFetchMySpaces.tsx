import { useCallback } from "react";
import useProject from "../projects/useProject";
import { MySpacesResponse } from "../../interfaces/models/Space";
import useAxiosPrivate from "../../config/useAxiosPrivate";

interface FetchMySpacesParams {
  page?: number;
  limit?: number;
  status?: "active" | "pending" | "banned";
}

function useFetchMySpaces() {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const fetchMySpaces = useCallback(
    async (params: FetchMySpacesParams = {}) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      const response = await axios.get(`/${projectId}/spaces/my-spaces`, {
        params,
      });

      return response.data as MySpacesResponse;
    },
    [projectId]
  );

  return fetchMySpaces;
}

export default useFetchMySpaces;
