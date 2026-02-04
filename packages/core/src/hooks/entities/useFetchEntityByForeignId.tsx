import { useCallback } from "react";
import useProject from "../projects/useProject";
import { Entity, EntityIncludeParam } from "../../interfaces/models/Entity";
import useAxiosPrivate from "../../config/useAxiosPrivate";

function useFetchEntityByForeignId() {
    const axios = useAxiosPrivate();
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

      const response = await axios.get(`/${projectId}/entities/by-foreign-id`, {
        params: {
          foreignId,
          createIfNotFound,
          include: Array.isArray(include) ? include.join(",") : include,
        },
      });

      return response.data as Entity;
    },
    [projectId]
  );

  return fetchEntityByForeignId;
}

export default useFetchEntityByForeignId;
