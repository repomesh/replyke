import { useCallback } from "react";
import useAxiosPrivate from "../../config/useAxiosPrivate";
import useProject from "../projects/useProject";

export interface DeleteCommentProps {
  commentId: string;
}

function useDeleteComment(): (props: DeleteCommentProps) => Promise<void> {
  const axios = useAxiosPrivate();
  const { projectId } = useProject();

  const deleteComment = useCallback(
    async ({ commentId }: DeleteCommentProps) => {
      if (!commentId) {
        throw new Error("No comment ID passed");
      }

      if (!projectId) {
        throw new Error("No project specified");
      }

      await axios.delete(`/${projectId}/comments/${commentId}`);
    },
    [axios, projectId]
  );
  return deleteComment;
}

export default useDeleteComment;
