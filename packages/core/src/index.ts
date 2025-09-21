// Helpers & Utilities
export { handleError } from "./utils/handleError";
export { keywordHelpers } from "./utils/keywordHelpers";
export { safeMergeStyleProps } from "./helpers/safeMergeStyleProps";
export { getUserName } from "./helpers/getUserName";
export { default as getPublicFileUrl } from "./helpers/getPublicFileUrl";
export {
  isDevelopment,
  isProduction,
  getApiBaseUrl,
  getEnvVar,
} from "./utils/env";

// Constants
export { reportReasons } from "./constants/reportReasons";
export type { ReportReasonKey } from "./constants/reportReasons";

// Context providers (Redux-powered by default)
export {
  ReplykeProvider,
  EntityProvider,
  CommentSectionProvider,
} from "./context";

// -- projects
export { useProject, useProjectData } from "./hooks/projects";

// -- crypto
export { useSignTestingJwt } from "./hooks/crypto";

// -- authentication
export { useAuth, type UseAuthValues } from "./hooks/auth";

// -- (current) user
export {
  useUser,
  useUserActions,
  type UseUserProps,
  type UseUserValues,
} from "./hooks/user";

// -- app notifications
export {
  useAppNotifications,
  useAppNotificationsActions,
  type UseAppNotificationsProps,
  type UseAppNotificationsValues,
} from "./hooks/app-notifications";

// -- lists
export {
  useLists,
  useListsActions,
  useIsEntitySaved,
  type UseListsProps,
  type UseListsValues,
} from "./hooks/lists";

// -- entities
export {
  useEntity,
  useEntityData,
  useCreateEntity,
  useFetchEntity,
  useFetchEntityByForeignId,
  useFetchEntityByShortId,
  useUpdateEntity,
  useEntityVotes,
  useDeleteEntity,
  useInfusedData,
} from "./hooks/entities";

// -- entity lists
export {
  useEntityList,
  useEntityListActions,
  type UseEntityListProps,
  type UseEntityListValues,
  type EntityListFilters,
  type EntityListFetchOptions,
} from "./hooks/entity-lists";

// -- comments
export {
  useCommentSection,
  useCommentSectionData,
  useCreateComment,
  useFetchManyComments,
  useFetchComment,
  useFetchCommentByForeignId,
  useReplies,
  useUpdateComment,
  useCommentVotes,
  useDeleteComment,
  useEntityComments,
  useProfileComments,
} from "./hooks/comments";

// -- users
export {
  useFetchUser,
  useFetchUserByForeignId,
  useFetchUserFollowersCount,
  useFetchUserFollowingCount,
  useCheckUsernameAvailability,
  useFetchUserSuggestions,
  useMentions,
  useUpdateUser,
} from "./hooks/users";

// -- follows
export {
  useFetchFollow,
  useFollowUser,
  useUnfollowUser,
  useFollowManager,
} from "./hooks/relationships/follows";

// -- reports
export { useCreateReport } from "./hooks/reports";

// -- general
export { useGetMetadata } from "./hooks/utils";

// -- storage
export { useUploadFile } from "./hooks/storage";

// Interfaces
export type { EntityCommentsTree } from "./interfaces/EntityCommentsTree";
export type { UserFull, User, AuthUser } from "./interfaces/models/User";
export * as AppNotification from "./interfaces/models/AppNotification";
export type { Entity } from "./interfaces/models/Entity";
export type { List } from "./interfaces/models/List";
export type { Comment, GifData } from "./interfaces/models/Comment";
export type { Mention } from "./interfaces/models/Mention";
export type { CommentsSortByOptions } from "./interfaces/CommentsSortByOptions";
export type { EntityListSortByOptions } from "./interfaces/EntityListSortByOptions";
export type { TimeFrame } from "./interfaces/TimeFrame";
