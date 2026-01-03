import { useCallback } from "react";
import useProject from "../projects/useProject";
import useAxiosPrivate from "../../config/useAxiosPrivate";

function useCheckSlugAvailability() {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const checkSlugAvailability = useCallback(
    async ({ slug }: { slug: string }) => {
      if (!projectId) {
        throw new Error("No project specified");
      }

      if (!slug) {
        throw new Error("Please specify a slug");
      }

      const response = await axios.get(
        `/${projectId}/spaces/check-slug?slug=${slug}`
      );

      return response.data as {
        available: boolean;
      };
    },
    [projectId, axios]
  );

  return checkSlugAvailability;
}

export default useCheckSlugAvailability;
