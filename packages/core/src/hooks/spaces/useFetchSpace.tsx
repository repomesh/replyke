import { useCallback } from "react";
import useProject from "../projects/useProject";
import { SpaceDetailed, SpaceIncludeParam } from "../../interfaces/models/Space";
import useAxiosPrivate from "../../config/useAxiosPrivate";

function useFetchSpace() {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const fetchSpace = useCallback(
    async ({
      spaceId,
      include,
    }: {
      spaceId: string;
      include?: SpaceIncludeParam;
    }) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!spaceId) {
        throw new Error("Please pass a spaceId");
      }

      const response = await axios.get(`/${projectId}/spaces/${spaceId}`, {
        params: {
          include: Array.isArray(include) ? include.join(",") : include,
        },
      });

      return response.data as SpaceDetailed;
    },
    [projectId]
  );

  return fetchSpace;
}

export default useFetchSpace;
