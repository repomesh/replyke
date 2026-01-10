import { useCallback } from "react";
import useProject from "../projects/useProject";
import { Entity, EntityIncludeParam } from "../../interfaces/models/Entity";
import axios from "../../config/axios";

function useFetchEntityByShortId() {
  const { projectId } = useProject();

  const fetchEntityByShortId = useCallback(
    async ({ shortId, include }: { shortId: string; include?: EntityIncludeParam }) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!shortId) {
        throw new Error("Please pass shortId");
      }

      const includeParam = include
        ? Array.isArray(include) ? include.join(',') : include
        : undefined;

      const response = await axios.get(`/${projectId}/entities/by-short-id`, {
        params: {
          shortId,
          ...(includeParam ? { include: includeParam } : {}),
        },
      });

      return response.data as Entity;
    },
    [projectId]
  );

  return fetchEntityByShortId;
}

export default useFetchEntityByShortId;
