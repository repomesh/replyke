import { useCallback } from "react";
import useProject from "../projects/useProject";
import { SpaceBreadcrumb } from "../../interfaces/SpaceBreadcrumb";
import useAxiosPrivate from "../../config/useAxiosPrivate";

export interface FetchSpaceBreadcrumbProps {
  spaceId: string;
}

function useFetchSpaceBreadcrumb(): (props: FetchSpaceBreadcrumbProps) => Promise<SpaceBreadcrumb> {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const fetchSpaceBreadcrumb = useCallback(
    async ({ spaceId }: FetchSpaceBreadcrumbProps) => {
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
