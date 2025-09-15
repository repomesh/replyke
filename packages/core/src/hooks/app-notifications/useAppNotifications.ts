import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";

import {
  setProjectContext,
  setLimit,
  setNotificationTemplates,
  selectAppNotifications,
  selectUnreadCount,
  selectAppNotificationsLoading,
  selectAppNotificationsHasMore,
  selectAppNotificationsPage,
  selectCurrentProjectId,
  selectNotificationTemplates,
} from "../../store/slices/appNotificationsSlice";
import { useAppNotificationsActions } from "./useAppNotificationsActions";
import useProject from "../projects/useProject";
import { useUser } from "../user";
import { NotificationTemplates, UnifiedAppNotification } from "../../interfaces/models/AppNotification";

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
  markNotificationAsRead: (notificationId: string) => Promise<void>;
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
  const dispatch = useDispatch<AppDispatch>();

  // Get external context
  const { projectId } = useProject();
  const { user } = useUser();

  // Get Redux state
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
  const currentPage = useSelector((state: RootState) =>
    selectAppNotificationsPage(state)
  );
  const currentProjectId = useSelector((state: RootState) =>
    selectCurrentProjectId(state)
  );

  // Get actions
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

  // Prevent infinite re-renders by comparing current vs new templates
  const currentTemplates = useSelector((state: RootState) =>
    selectNotificationTemplates(state)
  );

  const templatesChanged = useMemo(() => {
    // If no templates provided, skip comparison
    if (!notificationTemplates) return false;

    // Deep comparison using JSON stringify
    return (
      JSON.stringify(currentTemplates) !== JSON.stringify(notificationTemplates)
    );
  }, [currentTemplates, notificationTemplates]);

  useEffect(() => {
    if (notificationTemplates && templatesChanged) {
      dispatch(setNotificationTemplates(notificationTemplates));
    }
  }, [dispatch, notificationTemplates, templatesChanged]);

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
      fetchMoreNotifications(currentPage);
    }
  }, [currentPage, fetchMoreNotifications, projectId, user]);

  // Return the same interface as the original hook
  return useMemo(
    () => ({
      appNotifications,
      unreadAppNotificationsCount,
      loading,
      hasMore,
      loadMore,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      resetAppNotifications,
    }),
    [
      appNotifications,
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
