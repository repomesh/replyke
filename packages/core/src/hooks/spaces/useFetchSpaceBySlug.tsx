import { useCallback } from "react";
import useProject from "../projects/useProject";
import { SpaceDetailed } from "../../interfaces/models/Space";
import axios from "../../config/axios";

function useFetchSpaceBySlug() {
  const { projectId } = useProject();

  const fetchSpaceBySlug = useCallback(
    async ({ slug }: { slug: string }) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!slug) {
        throw new Error("Please pass a slug");
      }

      const response = await axios.get(
        `/${projectId}/spaces/by-slug?slug=${slug}`
      );

      return response.data as SpaceDetailed;
    },
    [projectId]
  );

  return fetchSpaceBySlug;
}

export default useFetchSpaceBySlug;
