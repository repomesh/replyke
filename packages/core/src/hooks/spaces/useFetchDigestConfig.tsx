import { useCallback } from "react";
import useProject from "../projects/useProject";
import { DigestConfig } from "../../interfaces/models/Space";
import useAxiosPrivate from "../../config/useAxiosPrivate";

export interface FetchDigestConfigProps {
  spaceId: string;
}

function useFetchDigestConfig(): (props: FetchDigestConfigProps) => Promise<DigestConfig> {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const fetchDigestConfig = useCallback(
    async ({ spaceId }: FetchDigestConfigProps) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!spaceId) {
        throw new Error("Please pass a spaceId");
      }

      const response = await axios.get<DigestConfig>(
        `/${projectId}/spaces/${spaceId}/digest-config`
      );

      return response.data;
    },
    [projectId, axios]
  );

  return fetchDigestConfig;
}

export default useFetchDigestConfig;
