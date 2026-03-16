import { useCallback } from "react";
import { useReplykeDispatch, useReplykeSelector } from "../../../store/hooks";
import { updateReactions } from "../../../store/slices/chatSlice";
import { selectUser } from "../../../store/slices/userSlice";
import { selectUser as selectAuthUser } from "../../../store/slices/authSlice";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../projects/useProject";
import { handleError } from "../../../utils/handleError";

export interface ToggleReactionParams {
  conversationId: string;
  messageId: string;
  emoji: string;
}

export interface ToggleReactionResult {
  reactionCounts: Record<string, number>;
  userReactions: string[];
}

function useToggleReaction(): (
  params: ToggleReactionParams
) => Promise<ToggleReactionResult> {
  const dispatch = useReplykeDispatch();
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const user = useReplykeSelector(selectUser);
  const authUser = useReplykeSelector(selectAuthUser);
  const currentUserId = (user || authUser)?.id ?? "";

  const toggle = useCallback(
    async ({
      conversationId,
      messageId,
      emoji,
    }: ToggleReactionParams): Promise<ToggleReactionResult> => {
      if (!projectId) throw new Error("No projectId available.");

      try {
        const response = await axios.post(
          `/${projectId}/v7/chat/conversations/${conversationId}/messages/${messageId}/reactions`,
          { emoji }
        );
        const { reactionCounts, userReactions, delta } = response.data as {
          reactionCounts: Record<string, number>;
          userReactions: string[];
          delta: 1 | -1;
        };

        dispatch(
          updateReactions({
            conversationId,
            messageId,
            reactionCounts,
            userId: currentUserId,
            emoji,
            delta,
            currentUserId,
          })
        );

        return { reactionCounts, userReactions };
      } catch (err) {
        handleError(err, "Failed to toggle reaction");
        throw err;
      }
    },
    [projectId, currentUserId, axios, dispatch]
  );

  return toggle;
}

export default useToggleReaction;
