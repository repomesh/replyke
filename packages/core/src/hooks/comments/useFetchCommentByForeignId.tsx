import { useCallback } from "react";
import useProject from "../projects/useProject";
import { Comment, CommentIncludeParam } from "../../interfaces/models/Comment";
import axios from "../../config/axios";

export interface FetchCommentByForeignIdProps {
  foreignId: string;
  include?: CommentIncludeParam;
}

function useFetchCommentByForeignId(): (props: FetchCommentByForeignIdProps) => Promise<{ comment: Comment }> {
  const { projectId } = useProject();

  const fetchCommentByForeignId = useCallback(
    async ({ foreignId, include }: FetchCommentByForeignIdProps) => {
      if (!projectId) {
        throw new Error("No project specified");
      }

      if (!foreignId) {
        throw new Error("No foreign ID passed");
      }

      const params: Record<string, any> = {
        foreignId,
      };

      if (include) {
        params.include = Array.isArray(include) ? include.join(',') : include;
      }

      const response = await axios.get(`/${projectId}/comments/by-foreign-id`, {
        params,
      });

      return response.data as {
        comment: Comment;
      };
    },
    [projectId]
  );

  return fetchCommentByForeignId;
}

export default useFetchCommentByForeignId;
