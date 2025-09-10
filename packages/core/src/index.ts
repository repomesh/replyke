// Helpers & Utilities
export { handleError } from "./utils/handleError";
export { safeMergeStyleProps } from "./helpers/safeMergeStyleProps";
export { getUserName } from "./helpers/getUserName";
export { default as getPublicFileUrl } from "./helpers/getPublicFileUrl";

// Constants
export { reportReasons } from "./constants/reportReasons";
export type { ReportReasonKey } from "./constants/reportReasons";

// Context providers (Redux-powered by default)
export {
  ReplykeProvider, // Always includes Redux auth and notification management
  ReplykeStoreProvider, // Advanced: standalone Redux provider
  EntityListProvider,
  EntityProvider,
  ListsProvider,
  CommentSectionProvider,
} from "./context";

// -- projects
export { useProject, useProjectData } from "./hooks/projects";

// -- crypto
export { useSignTestingJwt } from "./hooks/crypto";

// -- authentication (Redux-powered)
export {
  useAuthRedux,
  useUserRedux,
  type UseAuthReduxValues,
  type UseUserReduxValues,
} from "./hooks/auth-redux";

// -- app notifications (Redux-powered)
export {
  useAppNotificationsRedux,
  useAppNotificationsDataRedux,
  type UseAppNotificationsDataProps,
  type UseAppNotificationsDataValues,
} from "./hooks/app-notifications-redux";

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
  useEntityList,
  useEntityListData,
  useInfusedData,
} from "./hooks/entities";

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

// -- lists
export {
  useLists,
  useListsData,
  useCreateList,
  useFetchRootList,
  useFetchSubLists,
  useIsEntitySaved,
  useUpdateList,
  useAddToList,
  useRemoveFromList,
  useDeleteList,
} from "./hooks/lists";

// -- users
export {
  useUserData,
  useFetchUser,
  useFetchUserByForeignId,
  useFetchUserFollowersCount,
  useFetchUserFollowingCount,
  useCheckUsernameAvailability,
  useFetchUserSuggestions,
  useMentions,
  useUpdateUser,
  useFetchFollow,
  useFollowUser,
  useUnfollowUser,
} from "./hooks/users";

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
