import { useCallback, useState, useEffect } from "react";
import { Entity } from "../../interfaces/models/Entity";
import { Comment } from "../../interfaces/models/Comment";
import { ReactionType } from "../../interfaces/models/Reaction";
import useAddReaction from "./useAddReaction";
import useRemoveReaction from "./useRemoveReaction";
import { handleError } from "../../utils/handleError";

export interface UseReactionToggleProps {
  targetType: "Entity" | "Comment";
  targetId: string | undefined;
  initialReaction?: ReactionType | null | undefined;
  initialReactionCounts?: Record<string, number> | null | undefined;
}

export interface UseReactionToggleValues {
  currentReaction: ReactionType | null;
  reactionCounts: Record<string, number>;
  toggleReaction: (props: {
    reactionType: ReactionType;
  }) => Promise<Entity | Comment | null>;
  loading: boolean;
}

function useReactionToggle({
  targetType,
  targetId,
  initialReaction,
  initialReactionCounts,
}: UseReactionToggleProps): UseReactionToggleValues {
  const addReaction = useAddReaction();
  const removeReaction = useRemoveReaction();

  const [currentReaction, setCurrentReaction] = useState<ReactionType | null>(
    initialReaction ?? null,
  );
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>(
    initialReactionCounts ?? {},
  );
  const [loading, setLoading] = useState(false);

  // Reset state when target changes
  useEffect(() => {
    setCurrentReaction(initialReaction ?? null);
    setReactionCounts(initialReactionCounts ?? {});
  }, [targetId, initialReaction, initialReactionCounts]);

  const toggleReaction = useCallback(
    async (props: {
      reactionType: ReactionType;
    }): Promise<Entity | Comment | null> => {
      const { reactionType } = props;
      // Guard: prevent concurrent operations
      if (loading) return null;
      if (!targetId) return null;

      // Store original for revert on error
      const originalReaction = currentReaction;
      const originalCounts = { ...reactionCounts };

      // Determine new reaction (null if same, reactionType if different)
      const newReaction =
        currentReaction === reactionType ? null : reactionType;

      // OPTIMISTIC: Update UI immediately
      setCurrentReaction(newReaction);

      // OPTIMISTIC: Update counts
      const updatedCounts = { ...reactionCounts };

      if (currentReaction) {
        // Decrement old reaction count
        updatedCounts[currentReaction] = Math.max(
          (updatedCounts[currentReaction] || 0) - 1,
          0,
        );
      }

      if (newReaction) {
        // Increment new reaction count
        updatedCounts[newReaction] = (updatedCounts[newReaction] || 0) + 1;
      }

      setReactionCounts(updatedCounts);

      try {
        setLoading(true);

        // Call backend
        const result =
          newReaction === null
            ? await removeReaction({ targetType, targetId })
            : await addReaction({ targetType, targetId, reactionType });

        // Update with server truth (may differ from optimistic)
        setCurrentReaction(result.userReaction ?? null);
        setReactionCounts(result.reactionCounts ? { ...result.reactionCounts } : {});

        return result;
      } catch (err) {
        // REVERT: Restore original on error
        setCurrentReaction(originalReaction);
        setReactionCounts(originalCounts);
        handleError(err, "Failed to toggle reaction:");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [
      loading,
      currentReaction,
      reactionCounts,
      targetType,
      targetId,
      addReaction,
      removeReaction,
    ],
  );

  return {
    currentReaction,
    reactionCounts,
    toggleReaction,
    loading,
  };
}

export default useReactionToggle;
