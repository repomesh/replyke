import { useCallback } from "react";
import useProject from "../projects/useProject";
import {
  SpaceDetailed,
  ReadingPermission,
  PostingPermission,
} from "../../interfaces/models/Space";
import useAxiosPrivate from "../../config/useAxiosPrivate";

export interface UpdateSpaceProps {
  spaceId: string;
  update: Partial<{
    name: string;
    slug: string | null;
    description: string | null;
    avatar: string | null;
    banner: string | null;
    readingPermission: ReadingPermission;
    postingPermission: PostingPermission;
    requireJoinApproval: boolean;
    metadata: Record<string, any>;
  }>;
}

function useUpdateSpace() {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const updateSpace = useCallback(
    async ({ spaceId, update }: UpdateSpaceProps) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!spaceId) {
        throw new Error("Please pass a spaceId");
      }

      const response = await axios.patch(`/${projectId}/spaces/${spaceId}`, update);

      return response.data as SpaceDetailed;
    },
    [projectId]
  );

  return updateSpace;
}

export default useUpdateSpace;
