import { useCallback } from "react";
import useProject from "../projects/useProject";
import { Space, SpaceVisibility, PostingPermission } from "../../interfaces/models/Space";
import axios from "../../config/axios";

export interface CreateSpaceProps {
  name: string;
  slug?: string | null;
  description?: string | null;
  avatar?: string | null;
  banner?: string | null;
  visibility?: SpaceVisibility;
  postingPermission?: PostingPermission;
  requireJoinApproval?: boolean;
  metadata?: Record<string, any>;
  parentSpaceId?: string | null;
}

function useCreateSpace() {
  const { projectId } = useProject();

  const createSpace = useCallback(
    async (props: CreateSpaceProps) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!props.name) {
        throw new Error("Space name is required");
      }

      const response = await axios.post(`/${projectId}/spaces`, props);

      return response.data as Space;
    },
    [projectId]
  );

  return createSpace;
}

export default useCreateSpace;
