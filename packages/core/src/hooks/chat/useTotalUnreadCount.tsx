import { useSublaySelector } from "../../store/hooks";
import { selectTotalUnreadCount } from "../../store/slices/chatSlice";

/**
 * Returns the total number of unread messages across all conversations.
 * Initialized from the server on ChatProvider mount — accurate before the
 * conversation list is ever loaded. Kept in sync via socket events.
 */
function useTotalUnreadCount(): number {
  return useSublaySelector(selectTotalUnreadCount) ?? 0;
}

export default useTotalUnreadCount;
