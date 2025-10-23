import { useCallback } from "react";
import { CommentsSortByOptions } from "../../interfaces/CommentsSortByOptions";
import { Comment } from "../../interfaces/models/Comment";
import useProject from "../projects/useProject";
import axios from "../../config/axios";

function useFetchManyComments() {
  const { projectId } = useProject();

  const fetchComments = useCallback(
    async (props: {
      entityId?: string | null | undefined;
      userId?: string | null | undefined;
      parentId?: string | null | undefined;
      sortBy?: CommentsSortByOptions;
      page: number;
      limit?: number;
      includeEntity?: boolean;
      sourceId?: string | null | undefined;
    }): Promise<Comment[]> => {
      const {
        entityId,
        userId,
        parentId,
        sortBy,
        page,
        limit,
        includeEntity,
        sourceId,
      } = props;

      if (page === 0) {
        throw new Error("Can't fetch comments with page 0");
      }

      if (limit === 0) {
        throw new Error("Can't fetch with limit 0");
      }

      if (!sortBy) {
        throw new Error("Can't fetch without sortBy property");
      }

      if (!projectId) {
        throw new Error("No project specified");
      }

      const params: Record<string, any> = {
        sortBy,
        page,
        limit,
      };

      if (entityId) params.entityId = entityId;
      if (userId) params.userId = userId;
      if (parentId) params.parentId = parentId;
      if (includeEntity) params.includeEntity = includeEntity;
      if (sourceId) params.sourceId = sourceId;

      const response = await axios.get(`/${projectId}/comments`, {
        params,
      });
      return response.data as Comment[];
    },
    [projectId]
  );

  return fetchComments;
}

export default useFetchManyComments;
