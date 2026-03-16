import { useReplykeSelector } from "../../store/hooks";
import { selectConversationList } from "../../store/slices/chatSlice";

/**
 * Returns the sum of unread message counts across all loaded conversation
 * previews. Reads directly from Redux — no network call.
 */
function useTotalUnreadCount(): number {
  const conversations = useReplykeSelector(selectConversationList);
  return conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
}

export default useTotalUnreadCount;
