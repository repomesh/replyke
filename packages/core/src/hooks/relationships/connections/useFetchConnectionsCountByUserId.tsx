import { useCallback } from "react";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../projects/useProject";
import { ConnectionCountResponse } from "../../../interfaces/models/Connection";

interface FetchConnectionsCountByUserIdParams {
  userId: string;
}

function useFetchConnectionsCountByUserId() {
  const axios = useAxiosPrivate();
  const { projectId } = useProject();

  const fetchConnectionsCountByUserId = useCallback(
    async (
      props: FetchConnectionsCountByUserIdParams
    ): Promise<ConnectionCountResponse> => {
      const { userId } = props;
      if (!projectId) {
        throw new Error("No project specified");
      }

      if (!userId) {
        throw new Error("No user ID was provided");
      }

      const response = await axios.get(`/users/${userId}/connections-count`, {
        withCredentials: true,
      });

      return response.data as ConnectionCountResponse;
    },
    [axios, projectId]
  );

  return fetchConnectionsCountByUserId;
}

export default useFetchConnectionsCountByUserId;