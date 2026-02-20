import { useCallback } from "react";
import useAxiosPrivate from "../../config/useAxiosPrivate";
import useProject from "../projects/useProject";
import { Entity } from "../../interfaces/models/Entity";
import { Comment } from "../../interfaces/models/Comment";
import { ReactionType } from "../../interfaces/models/Reaction";

function useAddReaction() {
  const axios = useAxiosPrivate();
  const { projectId } = useProject();

  const addReaction = useCallback(
    async (props: {
      targetType: "entity" | "comment";
      targetId: string;
      reactionType: ReactionType;
    }): Promise<Entity | Comment> => {
      const { targetType, targetId, reactionType } = props;

      if (!targetId) {
        throw new Error("No target ID provided");
      }

      if (!reactionType) {
        throw new Error("No reaction type provided");
      }

      if (!projectId) {
        throw new Error("No project specified");
      }

      // Determine endpoint based on targetType
      const endpoint =
        targetType === "entity"
          ? `/${projectId}/entities/${targetId}/reactions`
          : `/${projectId}/comments/${targetId}/reactions`;

      const response = await axios.post(endpoint, { reactionType });

      return response.data as Entity | Comment;
    },
    [axios, projectId]
  );

  return addReaction;
}

export default useAddReaction;
