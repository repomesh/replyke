import { useCallback } from "react";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../projects/useProject";
import { useUser } from "../../user";
import { ConnectionWithdrawResponse } from "../../../interfaces/models/Connection";

function useRemoveConnection() {
  const axios = useAxiosPrivate();
  const { projectId } = useProject();
  const { user } = useUser();

  const removeConnection = useCallback(
    async (props: { connectionId: string }): Promise<ConnectionWithdrawResponse> => {
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

      const response = await axios.delete(
        `/connections/${connectionId}`,
        { withCredentials: true }
      );

      return response.data as ConnectionWithdrawResponse;
    },
    [axios, projectId, user]
  );

  return removeConnection;
}

export default useRemoveConnection;