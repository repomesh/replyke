import { useCallback } from "react";
import useProject from "../projects/useProject";
import { LeaveSpaceResponse } from "../../interfaces/models/Space";
import useAxiosPrivate from "../../config/useAxiosPrivate";

function useLeaveSpace() {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const leaveSpace = useCallback(
    async ({ spaceId }: { spaceId: string }) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!spaceId) {
        throw new Error("Please pass a spaceId");
      }

      const response = await axios.delete(
        `/${projectId}/spaces/${spaceId}/leave`
      );

      return response.data as LeaveSpaceResponse;
    },
    [projectId]
  );

  return leaveSpace;
}

export default useLeaveSpace;
