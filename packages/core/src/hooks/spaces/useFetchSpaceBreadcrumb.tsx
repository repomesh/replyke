import { useCallback } from "react";
import useProject from "../projects/useProject";
import { SpaceBreadcrumb } from "../../interfaces/SpaceBreadcrumb";
import axios from "../../config/axios";

function useFetchSpaceBreadcrumb() {
  const { projectId } = useProject();

  const fetchSpaceBreadcrumb = useCallback(
    async ({ spaceId }: { spaceId: string }) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!spaceId) {
        throw new Error("Please pass a spaceId");
      }

      const response = await axios.get(
        `/${projectId}/spaces/${spaceId}/breadcrumb`
      );

      return response.data as SpaceBreadcrumb;
    },
    [projectId]
  );

  return fetchSpaceBreadcrumb;
}

export default useFetchSpaceBreadcrumb;
