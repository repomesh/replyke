import { useCallback } from "react";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../projects/useProject";
import { ConnectionsResponse } from "../../../interfaces/models/Connection";

interface FetchConnectionsByUserIdParams {
  userId: string;
  page?: number;
  limit?: number;
}

function useFetchConnectionsByUserId() {
  const axios = useAxiosPrivate();
  const { projectId } = useProject();

  const fetchConnectionsByUserId = useCallback(
    async (
      props: FetchConnectionsByUserIdParams
    ): Promise<ConnectionsResponse> => {
      const { userId, page = 1, limit = 20 } = props;
      if (!projectId) {
        throw new Error("No project specified");
      }

      if (!userId) {
        throw new Error("No user ID was provided");
      }

      const response = await axios.get(`/users/${userId}/connections`, {
        params: {
          page,
          limit,
        },
        withCredentials: true,
      });

      return response.data as ConnectionsResponse;
    },
    [axios, projectId]
  );

  return fetchConnectionsByUserId;
}

export default useFetchConnectionsByUserId;