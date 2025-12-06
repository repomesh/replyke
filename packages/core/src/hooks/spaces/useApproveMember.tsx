import { useCallback } from "react";
import useProject from "../projects/useProject";
import { SpaceMember } from "../../interfaces/models/SpaceMember";
import axios from "../../config/axios";

interface ApproveMemberParams {
  spaceId: string;
  memberId: string;
}

function useApproveMember() {
  const { projectId } = useProject();

  const approveMember = useCallback(
    async ({ spaceId, memberId }: ApproveMemberParams) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!spaceId || !memberId) {
        throw new Error("spaceId and memberId are required");
      }

      const response = await axios.patch(
        `/${projectId}/spaces/${spaceId}/members/${memberId}/approve`
      );

      return response.data as SpaceMember;
    },
    [projectId]
  );

  return approveMember;
}

export default useApproveMember;
