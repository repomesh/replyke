import { baseApi } from './baseApi';
import type { AuthUser } from '../../interfaces/models/User';

// Types for user API
export interface UpdateUserParams {
  name?: string | null;
  username?: string | null;
  avatar?: string | null;
  bio?: string;
  birthdate?: Date | null;
  location?: {
    latitude: number;
    longitude: number;
  } | null;
  metadata?: Record<string, any>;
  secureMetadata?: Record<string, any>;
}

export interface UpdateUserRequest {
  projectId: string;
  userId: string;
  update: UpdateUserParams;
}

// Removed FetchUserRequest and FetchUserByForeignIdRequest - these are for other users, not current user management

// Inject user-specific endpoints into the base API
export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Update current user
    updateUser: builder.mutation<AuthUser, UpdateUserRequest>({
      query: ({ projectId, userId, update }) => ({
        url: `/${projectId}/users/${userId}`,
        method: 'PATCH',
        body: { update },
      }),
      // No complex optimistic updates needed - let useUserActionsRedux handle state updates
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User' as const, id: 'CURRENT' }, // Only current user now
      ],
    }),

    // Removed other-user queries - these should use the existing legacy hooks:
    // - useFetchUser
    // - useFetchUserByForeignId  
    // - useFetchUserFollowersCount
    // - useFetchUserFollowingCount
    // - useCheckUsernameAvailability
    // - useFetchUserSuggestions
  }),
});

// Export generated hooks (current user management only)
export const {
  useUpdateUserMutation,
} = userApi;