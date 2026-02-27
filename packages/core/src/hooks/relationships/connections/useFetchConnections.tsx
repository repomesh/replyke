import { useCallback } from "react";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../projects/useProject";
import { useUser } from "../../user";
import { EstablishedConnection } from "../../../interfaces/models/Connection";
import { PaginatedResponse } from "../../../interfaces/IPaginatedResponse";

export interface FetchConnectionsParams {
  page?: number;
  limit?: number;
}

function useFetchConnections(): (props?: FetchConnectionsParams) => Promise<PaginatedResponse<EstablishedConnection>> {
  const axios = useAxiosPrivate();
  const { projectId } = useProject();
  const { user } = useUser();

  const fetchConnections = useCallback(
    async (
      props: FetchConnectionsParams = {}
    ): Promise<PaginatedResponse<EstablishedConnection>> => {
      const { page = 1, limit = 20 } = props;
      if (!projectId) {
        throw new Error("No project specified");
      }

      if (!user) {
        throw new Error("No user is logged in");
      }

      const response = await axios.get<PaginatedResponse<EstablishedConnection>>(
        `/connections`,
        {
          params: {
            page,
            limit,
          },
        }
      );

      return response.data;
    },
    [axios, projectId, user]
  );

  return fetchConnections;
}

export default useFetchConnections;
