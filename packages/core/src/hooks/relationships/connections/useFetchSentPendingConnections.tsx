import { useCallback } from "react";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../projects/useProject";
import { useUser } from "../../user";
import { PendingConnectionListResponse } from "../../../interfaces/models/Connection";

interface FetchSentPendingConnectionsParams {
  page?: number;
  limit?: number;
}

function useFetchSentPendingConnections() {
  const axios = useAxiosPrivate();
  const { projectId } = useProject();
  const { user } = useUser();

  const fetchSentPendingConnections = useCallback(
    async (
      props: FetchSentPendingConnectionsParams = {}
    ): Promise<PendingConnectionListResponse> => {
      const { page = 1, limit = 20 } = props;
      if (!projectId) {
        throw new Error("No project specified");
      }

      if (!user) {
        throw new Error("No user is logged in");
      }

      const response = await axios.get("/connections/pending/sent", {
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

  return fetchSentPendingConnections;
}

export default useFetchSentPendingConnections;