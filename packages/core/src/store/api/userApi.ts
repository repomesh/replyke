import { baseApi } from './baseApi';
import type { AuthUser } from '../../interfaces/models/User';
import type { UploadImageOptions } from '../../interfaces/models/Image';

// Types for user API
export interface UpdateUserParams {
  name?: string | null;
  username?: string | null;
  avatar?: string | null | { file: File | Blob; options: UploadImageOptions };
  bio?: string;
  birthdate?: Date | null;
  location?: {
    latitude: number;
    longitude: number;
  } | null;
  metadata?: Record<string, any>;
  secureMetadata?: Record<string, any>;
  banner?: { file: File | Blob; options: UploadImageOptions };
}

export interface UpdateUserRequest {
  projectId: string;
  userId: string;
  update: UpdateUserParams;
}

// Removed FetchUserRequest and FetchUserByForeignIdRequest - these are for other users, not current user management

// Helper to build FormData for file uploads
function buildUserUpdateFormData(update: UpdateUserParams): FormData {
  const formData = new FormData();
  const avatarIsFile = update.avatar && typeof update.avatar === 'object' && 'file' in update.avatar;

  // Append non-file fields
  if (update.name !== undefined) {
    formData.append("name", update.name === null ? "" : update.name);
  }
  if (update.username !== undefined) {
    formData.append("username", update.username === null ? "" : update.username);
  }
  if (update.bio !== undefined) {
    formData.append("bio", update.bio);
  }
  if (update.birthdate !== undefined) {
    formData.append("birthdate", update.birthdate ? update.birthdate.toISOString() : "");
  }
  // URL-based avatar (legacy support)
  if (update.avatar && typeof update.avatar === "string") {
    formData.append("avatar", update.avatar);
  }
  // Object fields as JSON strings
  if (update.location !== undefined) {
    formData.append("location", update.location === null ? "null" : JSON.stringify(update.location));
  }
  if (update.metadata !== undefined) {
    formData.append("metadata", JSON.stringify(update.metadata));
  }
  if (update.secureMetadata !== undefined) {
    formData.append("secureMetadata", JSON.stringify(update.secureMetadata));
  }

  // Append avatar FILE and options
  if (avatarIsFile && update.avatar && typeof update.avatar === 'object' && 'file' in update.avatar) {
    formData.append("avatarFile", update.avatar.file);
    formData.append("avatarFile.options", JSON.stringify(update.avatar.options));
  }

  // Append banner FILE and options
  if (update.banner) {
    formData.append("bannerFile", update.banner.file);
    formData.append("bannerFile.options", JSON.stringify(update.banner.options));
  }

  return formData;
}

// Inject user-specific endpoints into the base API
export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Update current user (supports both JSON and FormData for file uploads)
    updateUser: builder.mutation<AuthUser, UpdateUserRequest>({
      query: ({ projectId, userId, update }) => {
        const avatarIsFile = update.avatar && typeof update.avatar === 'object' && 'file' in update.avatar;
        const hasFiles = avatarIsFile || update.banner;

        if (hasFiles) {
          return {
            url: `/${projectId}/users/${userId}`,
            method: 'PATCH',
            body: buildUserUpdateFormData(update),
            formData: true,
          };
        }

        // Simple JSON request (no files)
        return {
          url: `/${projectId}/users/${userId}`,
          method: 'PATCH',
          body: update,
        };
      },
      // No complex optimistic updates needed - let useUserActions handle state updates
      invalidatesTags: () => [
        { type: 'User' as const, id: 'CURRENT' },
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