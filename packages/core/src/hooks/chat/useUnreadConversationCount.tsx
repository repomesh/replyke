import { useSublaySelector } from "../../store/hooks";
import { selectUnreadConversationCount } from "../../store/slices/chatSlice";

/**
 * Returns the number of conversations that have at least one unread message.
 * Initialized from the server on ChatProvider mount — accurate before the
 * conversation list is ever loaded. Kept in sync via socket events.
 *
 * Note: when a new message arrives from a conversation not yet loaded into
 * the conversation list (e.g. paginated out), only `useTotalUnreadCount` is
 * bumped — this count is not adjusted for that edge case and re-syncs on
 * the next ChatProvider mount.
 */
function useUnreadConversationCount(): number {
  return useSublaySelector(selectUnreadConversationCount) ?? 0;
}

export default useUnreadConversationCount;
