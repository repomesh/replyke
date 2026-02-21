import { useCallback } from "react";
import useProject from "../projects/useProject";
import { JoinSpaceResponse } from "../../interfaces/models/Space";
import useAxiosPrivate from "../../config/useAxiosPrivate";

export interface JoinSpaceProps {
  spaceId: string;
}

function useJoinSpace() {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const joinSpace = useCallback(
    async ({ spaceId }: JoinSpaceProps) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!spaceId) {
        throw new Error("Please pass a spaceId");
      }

      const response = await axios.post(`/${projectId}/spaces/${spaceId}/join`);

      return response.data as JoinSpaceResponse;
    },
    [projectId]
  );

  return joinSpace;
}

export default useJoinSpace;
