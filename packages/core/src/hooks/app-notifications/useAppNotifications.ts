import { useEffect, useMemo } from "react";
import { useReplykeDispatch, useReplykeSelector } from "../../store/hooks";

import {
  setProjectContext,
  setLimit,
  selectAppNotifications,
  selectUnreadCount,
  selectAppNotificationsLoading,
  selectAppNotificationsHasMore,
  selectAppNotificationsPage,
  selectCurrentProjectId,
} from "../../store/slices/appNotificationsSlice";
import { useAppNotificationsActions } from "./useAppNotificationsActions";
import useProject from "../projects/useProject";
import { useUser } from "../user";
import { NotificationTemplates, UnifiedAppNotification } from "../../interfaces/models/AppNotification";
import addNotificationsMessages from "../../helpers/addNotificationsMessages";

export interface UseAppNotificationsProps {
  limit?: number;
  notificationTemplates?: Partial<NotificationTemplates>;
}

export interface UseAppNotificationsValues {
  appNotifications: UnifiedAppNotification[];
  unreadAppNotificationsCount: number;
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  markNotificationAsRead: ({ notificationId }: { notificationId: string }) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  resetAppNotifications: () => Promise<void>;
}

/**
 * Redux-powered hook that provides the exact same interface as useAppNotificationsData()
 * This is a drop-in replacement for the Context-based hook
 */
function useAppNotifications({
  limit = 10,
  notificationTemplates,
}: UseAppNotificationsProps = {}): UseAppNotificationsValues {
  const dispatch = useReplykeDispatch();

  // Get external context
  const { projectId } = useProject();
  const { user } = useUser();

  // Get Redux state
  const appNotifications = useReplykeSelector(selectAppNotifications);
  const unreadAppNotificationsCount = useReplykeSelector(selectUnreadCount);
  const loading = useReplykeSelector(selectAppNotificationsLoading);
  const hasMore = useReplykeSelector(selectAppNotificationsHasMore);
  const currentPage = useReplykeSelector(selectAppNotificationsPage);
  const currentProjectId = useReplykeSelector(selectCurrentProjectId);

  // Get actions (templates are applied at display time, not fetch time)
  const {
    loadMore,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    resetAppNotifications,
    fetchMoreNotifications,
    updateUnreadCount,
  } = useAppNotificationsActions();

  // Update Redux state when props change
  useEffect(() => {
    if (projectId && projectId !== currentProjectId) {
      dispatch(setProjectContext(projectId));
    }
  }, [dispatch, projectId, currentProjectId]);

  useEffect(() => {
    dispatch(setLimit(limit));
  }, [dispatch, limit]);

  // Fetch unread count on mount and when dependencies change
  useEffect(() => {
    if (projectId && user) {
      updateUnreadCount();
    }
  }, [updateUnreadCount, projectId, user]);

  // Reset and fetch initial notifications when dependencies change
  useEffect(() => {
    if (projectId && user) {
      resetAppNotifications();
    }
  }, [resetAppNotifications, projectId, user]);

  // Handle page changes (load more notifications)
  useEffect(() => {
    if (currentPage > 1 && projectId && user) {
      fetchMoreNotifications({ pageToFetch: currentPage });
    }
  }, [currentPage, fetchMoreNotifications, projectId, user]);

  // Apply templates at display time (not at fetch time)
  // This ensures templates are always applied fresh from props
  const templatedNotifications = useMemo(
    () => addNotificationsMessages(appNotifications, notificationTemplates),
    [appNotifications, notificationTemplates]
  );

  // Return the same interface as the original hook
  return useMemo(
    () => ({
      appNotifications: templatedNotifications,
      unreadAppNotificationsCount,
      loading,
      hasMore,
      loadMore,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      resetAppNotifications,
    }),
    [
      templatedNotifications,
      unreadAppNotificationsCount,
      loading,
      hasMore,
      loadMore,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      resetAppNotifications,
    ]
  );
}

export default useAppNotifications;
