import { useCallback } from "react";
import useProject from "../projects/useProject";
import { CheckMyMembershipResponse } from "../../interfaces/models/Space";
import useAxiosPrivate from "../../config/useAxiosPrivate";

export interface CheckMyMembershipProps {
  spaceId: string;
}

function useCheckMyMembership() {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const checkMyMembership = useCallback(
    async ({ spaceId }: CheckMyMembershipProps) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!spaceId) {
        throw new Error("Please pass a spaceId");
      }

      const response = await axios.get<CheckMyMembershipResponse>(
        `/${projectId}/spaces/${spaceId}/membership/me`
      );

      return response.data;
    },
    [projectId, axios]
  );

  return checkMyMembership;
}

export default useCheckMyMembership;
