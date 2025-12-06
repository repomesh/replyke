import { useCallback } from "react";
import useProject from "../projects/useProject";
import { SpaceMember } from "../../interfaces/models/SpaceMember";
import axios from "../../config/axios";

function useJoinSpace() {
  const { projectId } = useProject();

  const joinSpace = useCallback(
    async ({ spaceId }: { spaceId: string }) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!spaceId) {
        throw new Error("Please pass a spaceId");
      }

      const response = await axios.post(`/${projectId}/spaces/${spaceId}/join`);

      return response.data as SpaceMember;
    },
    [projectId]
  );

  return joinSpace;
}

export default useJoinSpace;
