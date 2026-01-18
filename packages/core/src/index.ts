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
  SpaceProvider,
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

// -- collections
export {
  useCollections,
  useCollectionsActions,
  useIsEntityInCollection,
  useCollectionEntitiesWrapper,
  type UseCollectionsProps,
  type UseCollectionsValues,
  type UseCollectionEntitiesWrapperProps,
  type UseCollectionEntitiesWrapperValues,
} from "./hooks/collections";

// -- entities
export {
  useEntity,
  useEntityData,
  useCreateEntity,
  useDeleteEntity,
  useDownvoteEntity,
  useEntityVotes,
  useFetchEntity,
  useFetchEntityByForeignId,
  useFetchEntityByShortId,
  useFetchManyEntities,
  useIncrementEntityViews,
  useFetchManyEntitiesWrapper,
  useRemoveEntityDownvote,
  useRemoveEntityUpvote,
  useUpdateEntity,
  useUpvoteEntity,
  type UseFetchManyEntitiesWrapperProps,
  type UseFetchManyEntitiesWrapperValues,
} from "./hooks/entities";

// -- entity lists
export {
  useEntityList,
  useEntityListActions,
  type UseEntityListProps,
  type UseEntityListValues,
  type EntityListFilters,
  type EntityListSort,
  type EntityListFetchOptions,
} from "./hooks/entity-lists";

// -- spaces
export {
  useSpace,
  useSpaceData,
  useFetchSpace,
  useFetchSpaceByShortId,
  useFetchSpaceBySlug,
  useFetchSpaceBreadcrumb,
  useFetchSpaceChildren,
  useFetchManySpaces,
  useCheckSlugAvailability,
  useCreateSpace,
  useUpdateSpace,
  useDeleteSpace,
  useJoinSpace,
  useLeaveSpace,
  useFetchSpaceMembers,
  useFetchMySpaces,
  useUpdateMemberRole,
  useApproveMember,
  useDeclineMember,
  useRemoveMember,
  useSpacePermissions,
  type UseSpaceDataProps,
  type UseSpaceDataValues,
  type CreateSpaceProps,
  type UpdateSpaceProps,
} from "./hooks/spaces";

// -- space lists
export {
  useSpaceList,
  useSpaceListActions,
  type UseSpaceListProps,
  type UseSpaceListValues,
} from "./hooks/space-lists";

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
  useFetchManyCommentsWrapper,
  type UseFetchManyCommentsWrapperProps,
  type UseFetchManyCommentsWrapperValues,
} from "./hooks/comments";

// -- users
export {
  useFetchUser,
  useFetchUserByForeignId,
  useFetchUserByUsername,
  useCheckUsernameAvailability,
  useFetchUserSuggestions,
  useMentions,
  useUpdateUser,
} from "./hooks/users";

// -- follows
export {
  useFetchFollowStatus,
  useFetchFollowers,
  useFetchFollowersByUserId,
  useFetchFollowersCount,
  useFetchFollowersCountByUserId,
  useFetchFollowing,
  useFetchFollowingByUserId,
  useFetchFollowingCount,
  useFetchFollowingCountByUserId,
  useFollowManager,
  useFollowUser,
  useUnfollowByFollowId,
  useUnfollowUserByUserId,
} from "./hooks/relationships/follows";

// -- connections
export {
  useRequestConnection,
  useAcceptConnection,
  useDeclineConnection,
  useRemoveConnection,
  useFetchConnections,
  useFetchConnectionStatus,
  useRemoveConnectionByUserId,
  useFetchConnectionsCount,
  useFetchSentPendingConnections,
  useFetchReceivedPendingConnections,
  useFetchConnectionsByUserId,
  useFetchConnectionsCountByUserId,
  useConnectionManager,
} from "./hooks/relationships/connections";

// -- reports
export { useCreateReport } from "./hooks/reports";
export { useFetchSpaceReports } from "./hooks/reports";
export { useHandleSpaceEntityReport } from "./hooks/reports";
export { useHandleSpaceCommentReport } from "./hooks/reports";

// -- general
export { useGetMetadata } from "./hooks/utils";

// -- storage
export { useUploadFile } from "./hooks/storage";

// Interfaces
export type {
  PaginatedResponse,
  PaginationMetadata,
} from "./interfaces/IPaginatedResponse";
export type { EntityCommentsTree } from "./interfaces/EntityCommentsTree";
export type {
  UserFull,
  User,
  AuthUser,
  UserRole,
} from "./interfaces/models/User";
export * as AppNotification from "./interfaces/models/AppNotification";
export type {
  Entity,
  EntityInclude,
  EntityIncludeArray,
  EntityIncludeParam,
} from "./interfaces/models/Entity";
export type { Collection } from "./interfaces/models/Collection";
export type {
  Comment,
  GifData,
  CommentInclude,
  CommentIncludeArray,
  CommentIncludeParam,
} from "./interfaces/models/Comment";
export type { Mention } from "./interfaces/models/Mention";
export type {
  Space,
  SpaceDetailed,
  SpacePreview,
  SpaceMemberPermissions,
  ReadingPermission,
  PostingPermission,
  PaginationMeta,
  MySpaceItem,
  MySpacesResponse,
  JoinSpaceResponse,
  LeaveSpaceResponse,
  UpdateMemberRoleResponse,
  ApproveMemberResponse,
  DeclineMemberResponse,
  DeleteSpaceResponse,
} from "./interfaces/models/Space";
export type {
  SpaceMember,
  SpaceMemberRole,
  SpaceMemberStatus,
  SpaceMemberWithUser,
  SpaceMembersResponse,
} from "./interfaces/models/SpaceMember";
export type {
  SpaceListSortByOptions,
  SpaceListFilters,
} from "./interfaces/SpaceListSortByOptions";
export type { SpaceBreadcrumb } from "./interfaces/SpaceBreadcrumb";
export type { CommentsSortByOptions } from "./interfaces/CommentsSortByOptions";
export type {
  EntityListSortByOptions,
  SortDirection,
  SortType,
} from "./interfaces/EntityListSortByOptions";
export {
  validateSortBy,
  validateMetadataPropertyName,
  validateSortType,
} from "./interfaces/EntityListSortByOptions";
export type { TimeFrame } from "./interfaces/TimeFrame";
export type {
  Connection,
  EstablishedConnection,
  PendingConnection,
  ConnectionsResponse,
  PendingConnectionsResponse,
  PendingConnectionListResponse,
  ConnectionRequestParams,
  ConnectionActionResponse,
  ConnectionWithdrawResponse,
  ConnectionCountResponse,
  RemoveConnectionByUserIdResponse,
  ConnectionStatusResponse,
  ConnectionStatus,
} from "./interfaces/models/Connection";
