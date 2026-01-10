import { useCallback } from "react";
import useProject from "../projects/useProject";
import { Entity, EntityIncludeParam } from "../../interfaces/models/Entity";
import axios from "../../config/axios";

function useFetchEntityByForeignId() {
  const { projectId } = useProject();

  const fetchEntityByForeignId = useCallback(
    async ({
      foreignId,
      createIfNotFound,
      include,
    }: {
      foreignId: string;
      createIfNotFound?: boolean;
      include?: EntityIncludeParam;
    }) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!foreignId) {
        throw new Error("Please pass foreignId");
      }

      const includeParam = include
        ? Array.isArray(include) ? include.join(',') : include
        : undefined;

      const response = await axios.get(`/${projectId}/entities/by-foreign-id`, {
        params: {
          foreignId,
          createIfNotFound,
          ...(includeParam ? { include: includeParam } : {}),
        },
      });

      return response.data as Entity;
    },
    [projectId]
  );

  return fetchEntityByForeignId;
}

export default useFetchEntityByForeignId;
