import { baseApi } from "./baseApi";
import type { UnifiedAppNotification } from "../../interfaces/models/AppNotification";

// API parameters types
interface FetchAppNotificationsParams {
  projectId: string;
  page: number;
  limit: number;
}

interface MarkNotificationAsReadParams {
  projectId: string;
  notificationId: string;
}

interface CountUnreadNotificationsParams {
  projectId: string;
}

// Extended API with app notifications endpoints
export const appNotificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch paginated app notifications
    fetchAppNotifications: builder.query<UnifiedAppNotification[], FetchAppNotificationsParams>({
      query: ({ projectId, page, limit }) => ({
        url: `/${projectId}/app-notifications`,
        method: 'GET',
        params: {
          page,
          limit,
        },
      }),
      providesTags: (result, error, { projectId }) => [
        { type: 'AppNotification' as const, id: `${projectId}-LIST` },
        ...(result?.map(({ id }) => ({ type: 'AppNotification' as const, id })) ?? []),
      ],
    }),

    // Mark a notification as read
    markNotificationAsRead: builder.mutation<void, MarkNotificationAsReadParams>({
      query: ({ projectId, notificationId }) => ({
        url: `/${projectId}/app-notifications/${notificationId}/mark-as-read`,
        method: 'PATCH',
        body: {},
      }),
      // Optimistically update the cache
      async onQueryStarted({ projectId, notificationId }, { dispatch, queryFulfilled }) {
        // Update all relevant queries in cache
        const patches: any[] = [];
        
        dispatch(
          appNotificationsApi.util.updateQueryData(
            'fetchAppNotifications',
            // We need to find all queries for this projectId - this is a simplified approach
            { projectId, page: 1, limit: 10 }, // This should be more dynamic in practice
            (draft) => {
              const notification = draft.find(n => n.id === notificationId);
              if (notification) {
                notification.isRead = true;
              }
            }
          )
        );
        
        try {
          await queryFulfilled;
        } catch {
          // Revert optimistic update on failure
          patches.forEach(patch => patch.undo());
        }
      },
      invalidatesTags: (result, error, { projectId, notificationId }) => [
        { type: 'AppNotification', id: notificationId },
        { type: 'AppNotification', id: `${projectId}-LIST` },
      ],
    }),

    // Count unread notifications
    countUnreadNotifications: builder.query<number, CountUnreadNotificationsParams>({
      query: ({ projectId }) => ({
        url: `/${projectId}/app-notifications/count`,
        method: 'GET',
      }),
      providesTags: (result, error, { projectId }) => [
        { type: 'AppNotification', id: `${projectId}-COUNT` },
      ],
    }),
  }),
});

// Export hooks for use in components
export const {
  useFetchAppNotificationsQuery,
  useLazyFetchAppNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useCountUnreadNotificationsQuery,
  useLazyCountUnreadNotificationsQuery,
} = appNotificationsApi;

// Export for manual cache management
export const {
  fetchAppNotifications,
  markNotificationAsRead,
  countUnreadNotifications,
} = appNotificationsApi.endpoints;