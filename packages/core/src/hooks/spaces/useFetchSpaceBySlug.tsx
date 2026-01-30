import { useCallback } from "react";
import useProject from "../projects/useProject";
import { SpaceDetailed, SpaceIncludeParam } from "../../interfaces/models/Space";
import useAxiosPrivate from "../../config/useAxiosPrivate";

function useFetchSpaceBySlug() {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const fetchSpaceBySlug = useCallback(
    async ({
      slug,
      include,
    }: {
      slug: string;
      include?: SpaceIncludeParam;
    }) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!slug) {
        throw new Error("Please pass a slug");
      }

      const response = await axios.get(`/${projectId}/spaces/by-slug`, {
        params: {
          slug,
          include: Array.isArray(include) ? include.join(",") : include,
        },
      });

      return response.data as SpaceDetailed;
    },
    [projectId]
  );

  return fetchSpaceBySlug;
}

export default useFetchSpaceBySlug;
