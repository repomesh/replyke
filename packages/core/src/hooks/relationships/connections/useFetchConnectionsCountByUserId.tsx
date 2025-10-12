import { useCallback } from "react";
import useProject from "../../projects/useProject";
import { ConnectionCountResponse } from "../../../interfaces/models/Connection";
import axios from "../../../config/axios";

interface FetchConnectionsCountByUserIdParams {
  userId: string;
}

function useFetchConnectionsCountByUserId() {
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

      const response = await axios.get(`/users/${userId}/connections-count`);

      return response.data as ConnectionCountResponse;
    },
    [projectId]
  );

  return fetchConnectionsCountByUserId;
}

export default useFetchConnectionsCountByUserId;
