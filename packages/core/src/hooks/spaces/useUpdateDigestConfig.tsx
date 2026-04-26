import { useCallback } from "react";
import useProject from "../projects/useProject";
import { DigestConfig, UpdateDigestConfigProps as UpdateDigestConfigBody } from "../../interfaces/models/Space";
import useAxiosPrivate from "../../config/useAxiosPrivate";

export interface UpdateDigestConfigProps {
  spaceId: string;
  update: UpdateDigestConfigBody;
}

function useUpdateDigestConfig(): (props: UpdateDigestConfigProps) => Promise<DigestConfig> {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const updateDigestConfig = useCallback(
    async ({ spaceId, update }: UpdateDigestConfigProps) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!spaceId) {
        throw new Error("Please pass a spaceId");
      }

      const response = await axios.patch<DigestConfig>(
        `/${projectId}/spaces/${spaceId}/digest-config`,
        update
      );

      return response.data;
    },
    [projectId, axios]
  );

  return updateDigestConfig;
}

export default useUpdateDigestConfig;
