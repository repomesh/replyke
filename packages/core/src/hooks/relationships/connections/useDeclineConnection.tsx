import { useCallback } from "react";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../projects/useProject";
import { useUser } from "../../user";
import { ConnectionActionResponse } from "../../../interfaces/models/Connection";

function useDeclineConnection() {
  const axios = useAxiosPrivate();
  const { projectId } = useProject();
  const { user } = useUser();

  const declineConnection = useCallback(
    async (props: { connectionId: string }): Promise<ConnectionActionResponse> => {
      const { connectionId } = props;
      if (!projectId) {
        throw new Error("No project specified");
      }

      if (!user) {
        throw new Error("No user is logged in");
      }

      if (!connectionId) {
        throw new Error("No connection ID was provided");
      }

      const response = await axios.patch(
        `/connections/${connectionId}/decline`,
        {},
        { withCredentials: true }
      );

      return response.data as ConnectionActionResponse;
    },
    [axios, projectId, user]
  );

  return declineConnection;
}

export default useDeclineConnection;