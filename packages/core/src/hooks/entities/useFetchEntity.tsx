import { useCallback } from "react";
import useProject from "../projects/useProject";
import { Entity, EntityIncludeParam } from "../../interfaces/models/Entity";
import axios from "../../config/axios";

function useFetchEntity() {
  const { projectId } = useProject();

  const fetchEntity = useCallback(
    async ({ entityId, include }: { entityId: string; include?: EntityIncludeParam }) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!entityId) {
        throw new Error("Please pass an entityId");
      }

      const response = await axios.get(`/${projectId}/entities/${entityId}`, {
        params: {
          include: Array.isArray(include) ? include.join(",") : include,
        },
      });

      return response.data as Entity;
    },
    [projectId]
  );

  return fetchEntity;
}

export default useFetchEntity;
