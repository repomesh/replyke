import { useCallback } from "react";
import useProject from "../../projects/useProject";
import { EstablishedConnection } from "../../../interfaces/models/Connection";
import { PaginatedResponse } from "../../../interfaces/IPaginatedResponse";
import axios from "../../../config/axios";

interface FetchConnectionsByUserIdParams {
  userId: string;
  page?: number;
  limit?: number;
}

function useFetchConnectionsByUserId() {
  const { projectId } = useProject();

  const fetchConnectionsByUserId = useCallback(
    async (
      props: FetchConnectionsByUserIdParams
    ): Promise<PaginatedResponse<EstablishedConnection>> => {
      const { userId, page = 1, limit = 20 } = props;
      if (!projectId) {
        throw new Error("No project specified");
      }

      if (!userId) {
        throw new Error("No user ID was provided");
      }

      const response = await axios.get<PaginatedResponse<EstablishedConnection>>(
        `/users/${userId}/connections`,
        {
          params: {
            page,
            limit,
          },
        }
      );

      return response.data;
    },
    [projectId]
  );

  return fetchConnectionsByUserId;
}

export default useFetchConnectionsByUserId;
