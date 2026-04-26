import { useCallback } from "react";
import useProject from "../projects/useProject";
import { Comment, CommentIncludeParam } from "../../interfaces/models/Comment";
import axios from "../../config/axios";

export interface FetchCommentProps {
  commentId: string;
  include?: CommentIncludeParam;
}

function useFetchComment(): (props: FetchCommentProps) => Promise<{ comment: Comment }> {
  const { projectId } = useProject();

  const fetchComment = useCallback(
    async ({ commentId, include }: FetchCommentProps) => {
      if (!projectId) {
        throw new Error("No project specified");
      }

      if (!commentId) {
        throw new Error("No comment ID passed");
      }

      const params: Record<string, any> = {};

      if (include) {
        params.include = Array.isArray(include) ? include.join(',') : include;
      }

      const response = await axios.get(`/${projectId}/comments/${commentId}`, {
        params,
      });

      return response.data as {
        comment: Comment;
      };
    },
    [projectId]
  );

  return fetchComment;
}

export default useFetchComment;
