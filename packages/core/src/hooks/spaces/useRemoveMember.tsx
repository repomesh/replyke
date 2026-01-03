import { useCallback } from "react";
import useProject from "../projects/useProject";
import useAxiosPrivate from "../../config/useAxiosPrivate";

interface RemoveMemberParams {
  spaceId: string;
  memberId: string;
}

interface RemoveMemberResponse {
  message: string;
}

function useRemoveMember() {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const removeMember = useCallback(
    async ({ spaceId, memberId }: RemoveMemberParams) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!spaceId || !memberId) {
        throw new Error("spaceId and memberId are required");
      }

      const response = await axios.delete(
        `/${projectId}/spaces/${spaceId}/members/${memberId}`
      );

      return response.data as RemoveMemberResponse;
    },
    [projectId]
  );

  return removeMember;
}

export default useRemoveMember;
