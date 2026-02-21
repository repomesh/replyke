import { useCallback } from "react";
import useAxiosPrivate from "../../config/useAxiosPrivate";
import useProject from "../projects/useProject";
import { Entity } from "../../interfaces/models/Entity";

export interface PublishDraftProps {
  entityId: string;
}

function usePublishDraft() {
  const axios = useAxiosPrivate();
  const { projectId } = useProject();

  const publishDraft = useCallback(
    async ({ entityId }: PublishDraftProps) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!entityId) {
        throw new Error("No entityId provided.");
      }

      const response = await axios.patch<Entity>(
        `/${projectId}/entities/${entityId}/publish`,
        {},
        { withCredentials: true }
      );

      return response.data;
    },
    [projectId, axios]
  );

  return publishDraft;
}

export default usePublishDraft;
