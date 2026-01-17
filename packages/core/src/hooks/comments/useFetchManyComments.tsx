import { useCallback } from "react";
import { CommentsSortByOptions } from "../../interfaces/CommentsSortByOptions";
import { Comment, CommentIncludeParam } from "../../interfaces/models/Comment";
import { PaginatedResponse } from "../../interfaces/IPaginatedResponse";
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
      include?: CommentIncludeParam;
      sourceId?: string | null | undefined;
    }): Promise<PaginatedResponse<Comment>> => {
      const {
        entityId,
        userId,
        parentId,
        sortBy,
        page,
        limit,
        include,
        sourceId,
      } = props;

      if (page === 0) {
        throw new Error("Can't fetch comments with page 0");
      }

      if (limit === 0) {
        throw new Error("Can't fetch with limit 0");
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
      if (sourceId) params.sourceId = sourceId;

      if (include) {
        params.include = Array.isArray(include) ? include.join(',') : include;
      }

      const response = await axios.get<PaginatedResponse<Comment>>(
        `/${projectId}/comments`,
        {
          params,
        }
      );
      return response.data;
    },
    [projectId]
  );

  return fetchComments;
}

export default useFetchManyComments;
