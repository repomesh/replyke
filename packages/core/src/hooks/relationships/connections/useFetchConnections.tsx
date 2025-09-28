import { useCallback } from "react";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../projects/useProject";
import { useUser } from "../../user";
import { ConnectionsResponse } from "../../../interfaces/models/Connection";

interface FetchConnectionsParams {
  page?: number;
  limit?: number;
}

function useFetchConnections() {
  const axios = useAxiosPrivate();
  const { projectId } = useProject();
  const { user } = useUser();

  const fetchConnections = useCallback(
    async (
      props: FetchConnectionsParams = {}
    ): Promise<ConnectionsResponse> => {
      const { page = 1, limit = 20 } = props;
      if (!projectId) {
        throw new Error("No project specified");
      }

      if (!user) {
        throw new Error("No user is logged in");
      }

      const response = await axios.get(`/connections`, {
        params: {
          page,
          limit,
        },
        withCredentials: true,
      });

      return response.data as ConnectionsResponse;
    },
    [axios, projectId, user]
  );

  return fetchConnections;
}

export default useFetchConnections;
