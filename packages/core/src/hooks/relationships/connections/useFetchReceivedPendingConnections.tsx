import { useCallback } from "react";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../projects/useProject";
import { useUser } from "../../user";
import { PendingConnectionListResponse } from "../../../interfaces/models/Connection";

interface FetchReceivedPendingConnectionsParams {
  page?: number;
  limit?: number;
}

function useFetchReceivedPendingConnections() {
  const axios = useAxiosPrivate();
  const { projectId } = useProject();
  const { user } = useUser();

  const fetchReceivedPendingConnections = useCallback(
    async (
      props: FetchReceivedPendingConnectionsParams = {}
    ): Promise<PendingConnectionListResponse> => {
      const { page = 1, limit = 20 } = props;
      if (!projectId) {
        throw new Error("No project specified");
      }

      if (!user) {
        throw new Error("No user is logged in");
      }

      const response = await axios.get("/connections/pending/received", {
        params: {
          page,
          limit,
        },
        withCredentials: true,
      });

      return response.data as PendingConnectionListResponse;
    },
    [axios, projectId, user]
  );

  return fetchReceivedPendingConnections;
}

export default useFetchReceivedPendingConnections;