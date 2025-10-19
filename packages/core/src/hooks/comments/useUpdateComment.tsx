import { useCallback } from "react";
import { Comment } from "../../interfaces/models/Comment";
import useAxiosPrivate from "../../config/useAxiosPrivate";
import useProject from "../projects/useProject";

function useUpdateComment() {
  const axios = useAxiosPrivate();
  const { projectId } = useProject();

  const updateComment = useCallback(
    async ({
      commentId,
      content,
      metadata,
    }: {
      commentId: string;
      content?: string;
      metadata?: Record<string, any>;
    }) => {
      if (!projectId) {
        throw new Error("No project specified");
      }

      // At least one of content or metadata must be provided
      if (content === undefined && metadata === undefined) {
        throw new Error("Either content or metadata must be provided");
      }

      // Validate content if provided
      if (content !== undefined && content.length < 1) {
        throw new Error("Comment is too short");
      }

      // Validate metadata if provided
      if (
        metadata !== undefined &&
        (typeof metadata !== "object" ||
          metadata === null ||
          Array.isArray(metadata))
      ) {
        throw new Error("Metadata must be a valid object");
      }

      // Build request body with only provided fields
      const requestBody: { content?: string; metadata?: Record<string, any> } =
        {};
      if (content !== undefined) {
        requestBody.content = content;
      }
      if (metadata !== undefined) {
        requestBody.metadata = metadata;
      }

      const response = await axios.patch(
        `/${projectId}/comments/${commentId}`,
        requestBody
      );

      return response.data as Comment;
    },
    [projectId, axios]
  );

  return updateComment;
}

export default useUpdateComment;
