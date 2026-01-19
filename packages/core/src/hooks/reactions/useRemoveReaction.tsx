import { useCallback } from "react";
import useAxiosPrivate from "../../config/useAxiosPrivate";
import useProject from "../projects/useProject";
import { Entity } from "../../interfaces/models/Entity";
import { Comment } from "../../interfaces/models/Comment";

function useRemoveReaction() {
  const axios = useAxiosPrivate();
  const { projectId } = useProject();

  const removeReaction = useCallback(
    async (props: {
      targetType: "Entity" | "Comment";
      targetId: string;
    }): Promise<Entity | Comment> => {
      const { targetType, targetId } = props;

      if (!targetId) {
        throw new Error("No target ID provided");
      }

      if (!projectId) {
        throw new Error("No project specified");
      }

      // Determine endpoint based on targetType
      const endpoint =
        targetType === "Entity"
          ? `/${projectId}/v7/entities/${targetId}/reactions`
          : `/${projectId}/v7/comments/${targetId}/reactions`;

      const response = await axios.delete(endpoint);

      return response.data as Entity | Comment;
    },
    [axios, projectId]
  );

  return removeReaction;
}

export default useRemoveReaction;
