import { useCallback } from "react";
import useProject from "../projects/useProject";
import { Comment, CommentIncludeParam } from "../../interfaces/models/Comment";
import axios from "../../config/axios";

function useFetchCommentByForeignId() {
  const { projectId } = useProject();

  const fetchCommentByForeignId = useCallback(
    async ({
      foreignId,
      include,
    }: {
      foreignId: string;
      include?: CommentIncludeParam;
    }) => {
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
