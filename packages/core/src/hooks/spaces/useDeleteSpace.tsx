import { useCallback } from "react";
import useProject from "../projects/useProject";
import { DeleteSpaceResponse } from "../../interfaces/models/Space";
import useAxiosPrivate from "../../config/useAxiosPrivate";

export interface DeleteSpaceProps {
  spaceId: string;
}

function useDeleteSpace() {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const deleteSpace = useCallback(
    async ({ spaceId }: DeleteSpaceProps) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!spaceId) {
        throw new Error("Please pass a spaceId");
      }

      const response = await axios.delete(`/${projectId}/spaces/${spaceId}`);

      return response.data as DeleteSpaceResponse;
    },
    [projectId]
  );

  return deleteSpace;
}

export default useDeleteSpace;
