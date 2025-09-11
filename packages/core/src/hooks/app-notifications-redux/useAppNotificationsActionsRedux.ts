import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import {
  loadMore as loadMoreAction,
  resetNotifications,
  setLoading,
  addNotifications,
  markAsReadLocally,
  markAllAsReadLocally,
  setUnreadCount,
  selectCurrentProjectId,
  selectAppNotificationsPage,
  selectAppNotificationsLimit,
  selectNotificationTemplates,
} from "../../store/slices/appNotificationsSlice";
import {
  useLazyFetchAppNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useLazyCountUnreadNotificationsQuery,
} from "../../store/api/appNotificationsApi";
import { handleError } from "../../utils/handleError";
import addNotificationsMessages from "../../helpers/addNotificationsMessages";
import useProject from "../projects/useProject";
import { useUserRedux } from "../auth-redux";

/**
 * Hook that provides Redux-powered actions for app notifications
 * Integrates RTK Query with Redux slice actions
 */
export function useAppNotificationsActionsRedux() {
  const dispatch = useDispatch<AppDispatch>();

  // Get current state for actions
  const projectIdFromSlice = useSelector((state: RootState) =>
    selectCurrentProjectId(state)
  );
  const page = useSelector((state: RootState) =>
    selectAppNotificationsPage(state)
  );
  const limit = useSelector((state: RootState) =>
    selectAppNotificationsLimit(state)
  );
  const notificationTemplates = useSelector((state: RootState) =>
    selectNotificationTemplates(state)
  );

  // Get project and user context (fallback to current hooks)
  const { projectId: projectIdFromHook } = useProject();
  const { user } = useUserRedux();

  // Use project ID from slice if available, otherwise from hook
  const projectId = projectIdFromSlice || projectIdFromHook;

  // RTK Query hooks
  const [triggerFetchNotifications] = useLazyFetchAppNotificationsQuery();
  const [markNotificationAsReadMutation] = useMarkNotificationAsReadMutation();
  const [markAllNotificationsAsReadMutation] = useMarkAllNotificationsAsReadMutation();
  const [triggerCountUnread] = useLazyCountUnreadNotificationsQuery();

  // Load more action
  const loadMore = useCallback(() => {
    dispatch(loadMoreAction());
  }, [dispatch]);

  // Mark notification as read action
  const markNotificationAsRead = useCallback(
    async (notificationId: string) => {
      if (!projectId || !user) {
        throw new Error("No project ID or authenticated user available");
      }

      try {
        // Optimistic update
        dispatch(markAsReadLocally(notificationId));

        // Make API call
        await markNotificationAsReadMutation({
          projectId,
          notificationId,
        }).unwrap();
      } catch (error) {
        handleError(error, "Failed to mark notification as read:");
        throw error;
      }
    },
    [dispatch, projectId, user, markNotificationAsReadMutation]
  );

  // Reset notifications action
  const resetAppNotifications = useCallback(async () => {
    if (!projectId || !user) {
      throw new Error("No project ID or authenticated user available");
    }

    try {
      dispatch(setLoading(true));
      dispatch(resetNotifications());

      // Fetch first page
      const result = await triggerFetchNotifications({
        projectId,
        page: 1,
        limit,
      }).unwrap();

      if (result) {
        // Apply notification templates
        const completeNotifications = addNotificationsMessages(
          result,
          notificationTemplates
        );

        dispatch(
          addNotifications({
            notifications: completeNotifications,
            isFirstPage: true,
          })
        );
      }
    } catch (error) {
      handleError(error, "Failed to refresh notifications:");
      throw error;
    }
  }, [
    dispatch,
    projectId,
    user,
    triggerFetchNotifications,
    limit,
    notificationTemplates,
  ]);

  // Fetch more notifications (internal action triggered by page changes)
  const fetchMoreNotifications = useCallback(
    async (pageToFetch: number) => {
      if (!projectId || !user) return;

      try {
        dispatch(setLoading(true));

        const result = await triggerFetchNotifications({
          projectId,
          page: pageToFetch,
          limit,
        }).unwrap();

        if (result) {
          const completeNotifications = addNotificationsMessages(
            result,
            notificationTemplates
          );

          dispatch(addNotifications({ notifications: completeNotifications }));
        }
      } catch (error) {
        handleError(error, "Loading more app notifications failed:");
      } finally {
        dispatch(setLoading(false));
      }
    },
    [
      dispatch,
      projectId,
      user,
      triggerFetchNotifications,
      limit,
      notificationTemplates,
    ]
  );

  // Update unread count
  const updateUnreadCount = useCallback(async () => {
    if (!projectId || !user) return;

    try {
      const count = await triggerCountUnread({ projectId }).unwrap();
      if (typeof count === "number") {
        dispatch(setUnreadCount(count));
      }
    } catch (error) {
      handleError(error, "Failed to fetch unread count:");
    }
  }, [dispatch, projectId, user, triggerCountUnread]);

  // Mark all notifications as read action
  const markAllNotificationsAsRead = useCallback(async () => {
    if (!projectId || !user) {
      throw new Error("No project ID or authenticated user available");
    }

    try {
      // Optimistic update
      dispatch(markAllAsReadLocally());
      
      // Make API call
      await markAllNotificationsAsReadMutation({ projectId }).unwrap();
    } catch (error) {
      handleError(error, "Failed to mark all notifications as read:");
      throw error;
    }
  }, [dispatch, projectId, user, markAllNotificationsAsReadMutation]);

  return {
    loadMore,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    resetAppNotifications,
    fetchMoreNotifications, // Internal action
    updateUnreadCount, // Internal action
  };
}

export default useAppNotificationsActionsRedux;
