import { useCallback } from "react";
import { useSublayDispatch } from "../../store/hooks";
import { clearUnread } from "../../store/slices/chatSlice";
import useAxiosPrivate from "../../config/useAxiosPrivate";
import useProject from "../projects/useProject";
import { handleError } from "../../utils/handleError";

export interface UseMarkConversationAsReadProps {
  conversationId: string;
}

/**
 * Internal hook — called by ConversationProvider, not intended for direct use.
 * Advances the server-side lastReadAt to the given message's createdAt and
 * resets the local unread count to 0 immediately (optimistic clear).
 */
function useMarkConversationAsRead({
  conversationId,
}: UseMarkConversationAsReadProps): ({ messageId }: { messageId: string }) => Promise<void> {
  const dispatch = useSublayDispatch();
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const mark = useCallback(
    async ({ messageId }: { messageId: string }): Promise<void> => {
      if (!projectId || !conversationId || !messageId) return;

      // Clear unread count locally for immediate UI update
      dispatch(clearUnread(conversationId));

      try {
        await axios.post(
          `/${projectId}/chat/conversations/${conversationId}/read`,
          { messageId }
        );
      } catch (err) {
        // Non-critical — don't re-throw; the local clear still stands
        handleError(err, "Failed to mark conversation as read");
      }
    },
    [projectId, conversationId, axios, dispatch]
  );

  return mark;
}

export default useMarkConversationAsRead;
