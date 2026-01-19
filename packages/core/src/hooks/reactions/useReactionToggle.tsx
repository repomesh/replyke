import { useCallback, useState } from "react";
import { Entity } from "../../interfaces/models/Entity";
import { Comment } from "../../interfaces/models/Comment";
import { ReactionType } from "../../interfaces/models/Reaction";
import useAddReaction from "./useAddReaction";
import useRemoveReaction from "./useRemoveReaction";
import { handleError } from "../../utils/handleError";

export interface UseReactionToggleValues {
  toggleReaction: (
    targetType: "Entity" | "Comment",
    targetId: string,
    reactionType: ReactionType,
    currentReaction: ReactionType | null | undefined
  ) => Promise<Entity | Comment | null>;
  loading: boolean;
}

function useReactionToggle(): UseReactionToggleValues {
  const addReaction = useAddReaction();
  const removeReaction = useRemoveReaction();
  const [loading, setLoading] = useState(false);

  const toggleReaction = useCallback(
    async (
      targetType: "Entity" | "Comment",
      targetId: string,
      reactionType: ReactionType,
      currentReaction: ReactionType | null | undefined
    ): Promise<Entity | Comment | null> => {
      if (loading) return null;

      try {
        setLoading(true);

        // If user clicked the same reaction, remove it
        if (currentReaction === reactionType) {
          const result = await removeReaction({ targetType, targetId });
          return result;
        }

        // Otherwise add/update the reaction (backend handles replacement)
        const result = await addReaction({ targetType, targetId, reactionType });
        return result;
      } catch (err) {
        handleError(err, "Failed to toggle reaction:");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [addReaction, removeReaction, loading]
  );

  return {
    toggleReaction,
    loading,
  };
}

export default useReactionToggle;
