import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import type { UseAppNotificationsDataValues } from "./useAppNotificationsDataRedux";
import {
  selectAppNotifications,
  selectUnreadCount,
  selectAppNotificationsLoading,
  selectAppNotificationsHasMore,
} from "../../store/slices/appNotificationsSlice";
import { useAppNotificationsActionsRedux } from "./useAppNotificationsActionsRedux";

/**
 * Redux-powered hook that provides the same interface as useAppNotifications()
 * Returns the current app notifications state and actions
 */
export function useAppNotificationsRedux(): Partial<UseAppNotificationsDataValues> {
  // Select data from Redux store
  const appNotifications = useSelector((state: RootState) =>
    selectAppNotifications(state)
  );
  const unreadAppNotificationsCount = useSelector((state: RootState) =>
    selectUnreadCount(state)
  );
  const loading = useSelector((state: RootState) =>
    selectAppNotificationsLoading(state)
  );
  const hasMore = useSelector((state: RootState) =>
    selectAppNotificationsHasMore(state)
  );

  // Get actions
  const { loadMore, markNotificationAsRead, resetAppNotifications } =
    useAppNotificationsActionsRedux();

  return {
    appNotifications,
    unreadAppNotificationsCount,
    loading,
    hasMore,
    loadMore,
    markNotificationAsRead,
    resetAppNotifications,
  };
}

export default useAppNotificationsRedux;
