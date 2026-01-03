import { useCallback } from "react";
import useProject from "../projects/useProject";
import { SpaceDetailed } from "../../interfaces/models/Space";
import useAxiosPrivate from "../../config/useAxiosPrivate";

function useFetchSpaceByShortId() {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const fetchSpaceByShortId = useCallback(
    async ({ shortId }: { shortId: string }) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!shortId) {
        throw new Error("Please pass a shortId");
      }

      const response = await axios.get(
        `/${projectId}/spaces/by-short-id?shortId=${shortId}`
      );

      return response.data as SpaceDetailed;
    },
    [projectId]
  );

  return fetchSpaceByShortId;
}

export default useFetchSpaceByShortId;
