import { useCallback } from "react";
import useProject from "../projects/useProject";
import axios from "../../config/axios";

interface RemoveMemberParams {
  spaceId: string;
  memberId: string;
}

function useRemoveMember() {
  const { projectId } = useProject();

  const removeMember = useCallback(
    async ({ spaceId, memberId }: RemoveMemberParams) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!spaceId || !memberId) {
        throw new Error("spaceId and memberId are required");
      }

      await axios.delete(
        `/${projectId}/spaces/${spaceId}/members/${memberId}`
      );
    },
    [projectId]
  );

  return removeMember;
}

export default useRemoveMember;
