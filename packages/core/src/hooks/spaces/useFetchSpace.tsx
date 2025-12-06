import { useCallback } from "react";
import useProject from "../projects/useProject";
import { SpaceDetailed } from "../../interfaces/models/Space";
import axios from "../../config/axios";

function useFetchSpace() {
  const { projectId } = useProject();

  const fetchSpace = useCallback(
    async ({ spaceId }: { spaceId: string }) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!spaceId) {
        throw new Error("Please pass a spaceId");
      }

      const response = await axios.get(`/${projectId}/spaces/${spaceId}`);

      return response.data as SpaceDetailed;
    },
    [projectId]
  );

  return fetchSpace;
}

export default useFetchSpace;
