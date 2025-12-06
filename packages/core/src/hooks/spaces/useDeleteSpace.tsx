import { useCallback } from "react";
import useProject from "../projects/useProject";
import axios from "../../config/axios";

function useDeleteSpace() {
  const { projectId } = useProject();

  const deleteSpace = useCallback(
    async ({ spaceId }: { spaceId: string }) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!spaceId) {
        throw new Error("Please pass a spaceId");
      }

      await axios.delete(`/${projectId}/spaces/${spaceId}`);
    },
    [projectId]
  );

  return deleteSpace;
}

export default useDeleteSpace;
