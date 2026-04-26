import { useCallback } from "react";
import useProject from "../projects/useProject";
import { DeclineMemberResponse } from "../../interfaces/models/Space";
import useAxiosPrivate from "../../config/useAxiosPrivate";

export interface DeclineMemberProps {
  spaceId: string;
  memberId: string;
}

function useDeclineMember(): (props: DeclineMemberProps) => Promise<DeclineMemberResponse> {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const declineMember = useCallback(
    async ({ spaceId, memberId }: DeclineMemberProps) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!spaceId || !memberId) {
        throw new Error("spaceId and memberId are required");
      }

      const response = await axios.patch(
        `/${projectId}/spaces/${spaceId}/members/${memberId}/decline`
      );

      return response.data as DeclineMemberResponse;
    },
    [projectId]
  );

  return declineMember;
}

export default useDeclineMember;
