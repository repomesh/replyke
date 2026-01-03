import { useCallback } from "react";
import useProject from "../projects/useProject";
import { ApproveMemberResponse } from "../../interfaces/models/Space";
import useAxiosPrivate from "../../config/useAxiosPrivate";

interface ApproveMemberParams {
  spaceId: string;
  memberId: string;
}

function useApproveMember() {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

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

      return response.data as ApproveMemberResponse;
    },
    [projectId]
  );

  return approveMember;
}

export default useApproveMember;
