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
  ReplykeIntegrationProvider,
  EntityProvider,
  CommentSectionProvider,
  SpaceProvider,
} from "./context";

// Integration mode exports (for users with their own Redux store)
export {
  replykeReducers,
  replykeApiReducer,
  replykeMiddleware,
  replykeApi,
  type ReplykeState,
} from "./store/integration";

// -- projects
export { useProject, useProjectData } from "./hooks/projects";

// -- crypto
export { useSignTestingJwt, type SignTestingJwtProps } from "./hooks/crypto";

// -- authentication
export {
  useAuth,
  type UseAuthValues,
  type SignUpWithEmailAndPasswordProps,
  type SignInWithEmailAndPasswordProps,
  type ChangePasswordProps,
} from "./hooks/auth";

// -- (current) user
export {
  useUser,
  useUserActions,
  type UseUserProps,
  type UseUserValues,
  type UpdateUserParams,
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
  type CreateCollectionProps,
  type UpdateCollectionProps,
  type DeleteCollectionProps,
  type AddToCollectionProps,
  type RemoveFromCollectionProps,
  type UseCollectionEntitiesWrapperProps,
  type UseCollectionEntitiesWrapperValues,
} from "./hooks/collections";

// -- entities
export {
  useEntity,
  useEntityData,
  useCreateEntity,
  useDeleteEntity,
  useFetchEntity,
  useFetchEntityByForeignId,
  useFetchEntityByShortId,
  useFetchManyEntities,
  useIncrementEntityViews,
  useFetchManyEntitiesWrapper,
  useUpdateEntity,
  useFetchDrafts,
  usePublishDraft,
  type CreateEntityProps,
  type DeleteEntityProps,
  type FetchEntityProps,
  type FetchEntityByForeignIdProps,
  type FetchEntityByShortIdProps,
  type PublishDraftProps,
  type UseFetchManyEntitiesWrapperProps,
  type UseFetchManyEntitiesWrapperValues,
} from "./hooks/entities";

// -- entity lists
export {
  useEntityList,
  useEntityListActions,
  type UseEntityListProps,
  type UseEntityListValues,
  type EntityListCreateEntityProps,
  type EntityListDeleteEntityProps,
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
  useFetchSpaceTeam,
  useFetchUserSpaces,
  useUpdateMemberRole,
  useApproveMember,
  useDeclineMember,
  useRemoveMember,
  useModerateSpaceEntity,
  useModerateSpaceComment,
  useSpacePermissions,
  useCheckMyMembership,
  // Rule hooks
  useCreateRule,
  useUpdateRule,
  useDeleteRule,
  useFetchRule,
  useFetchManyRules,
  useReorderRules,
  type UseSpaceDataProps,
  type UseSpaceDataValues,
  type FetchSpaceProps,
  type FetchSpaceByShortIdProps,
  type FetchSpaceBySlugProps,
  type FetchSpaceBreadcrumbProps,
  type FetchSpaceChildrenProps,
  type FetchManySpacesProps,
  type CheckSlugAvailabilityProps,
  type CreateSpaceProps,
  type UpdateSpaceProps,
  type DeleteSpaceProps,
  type JoinSpaceProps,
  type LeaveSpaceProps,
  type FetchSpaceMembersProps,
  type FetchSpaceTeamProps,
  type FetchUserSpacesProps,
  type CheckMyMembershipProps,
  type UpdateMemberRoleProps,
  type ApproveMemberProps,
  type DeclineMemberProps,
  type RemoveMemberProps,
  type ModerateSpaceEntityProps,
  type ModerateSpaceCommentProps,
  type UseSpacePermissionsProps,
  type UseSpacePermissionsValues,
  type CreateRuleProps,
  type UpdateRuleProps,
  type DeleteRuleProps,
  type FetchRuleProps,
  type FetchManyRulesProps,
  type ReorderRulesProps,
} from "./hooks/spaces";

// -- space lists
export {
  useSpaceList,
  useSpaceListActions,
  type UseSpaceListProps,
  type UseSpaceListValues,
  type SpaceListCreateSpaceProps,
  type SpaceListDeleteSpaceProps,
  type FetchSpacesOptions,
  type CreateSpaceOptions,
  type DeleteSpaceOptions,
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
  useDeleteComment,
  useEntityComments,
  useFetchManyCommentsWrapper,
  type CommentSectionCreateCommentProps,
  type CommentSectionUpdateCommentProps,
  type CommentSectionDeleteCommentProps,
  type CreateCommentProps,
  type FetchManyCommentsProps,
  type FetchCommentProps,
  type FetchCommentByForeignIdProps,
  type UseRepliesProps,
  type UpdateCommentProps,
  type DeleteCommentProps,
  type UseFetchManyCommentsWrapperProps,
  type UseFetchManyCommentsWrapperValues,
} from "./hooks/comments";

// -- reactions
export {
  useFetchEntityReactions,
  useFetchCommentReactions,
  useFetchEntityReactionsWrapper,
  useFetchCommentReactionsWrapper,
  useAddReaction,
  useRemoveReaction,
  useReactionToggle,
  type UseFetchEntityReactionsWrapperProps,
  type UseFetchEntityReactionsWrapperValues,
  type UseFetchCommentReactionsWrapperProps,
  type UseFetchCommentReactionsWrapperValues,
  type UseReactionToggleProps,
  type UseReactionToggleValues,
  type ToggleReactionProps,
  type AddReactionProps,
  type RemoveReactionProps,
  type FetchEntityReactionsProps,
  type FetchCommentReactionsProps,
} from "./hooks/reactions";

// -- users
export {
  useFetchUser,
  useFetchUserByForeignId,
  useFetchUserByUsername,
  useCheckUsernameAvailability,
  useFetchUserSuggestions,
  useMentions,
  type FetchUserProps,
  type FetchUserByForeignIdProps,
  type FetchUserByUsernameProps,
  type CheckUsernameAvailabilityProps,
  type FetchUserSuggestionsProps,
  type UseMentionsProps,
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
  type FollowUserProps,
  type UnfollowByFollowIdProps,
  type UnfollowUserByUserIdProps,
  type FetchFollowStatusProps,
  type FollowStatusResponse,
  type FollowerWithFollowInfo,
  type FetchFollowersParams,
  type FetchFollowersByUserIdParams,
  type FetchFollowersCountByUserIdProps,
  type FollowingWithFollowInfo,
  type FetchFollowingParams,
  type FetchFollowingByUserIdParams,
  type FetchFollowingCountByUserIdProps,
  type UseFollowToggleProps,
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
  type AcceptConnectionProps,
  type DeclineConnectionProps,
  type RemoveConnectionProps,
  type RemoveConnectionByUserIdProps,
  type FetchConnectionStatusProps,
  type FetchConnectionsParams,
  type FetchConnectionsByUserIdParams,
  type FetchConnectionsCountByUserIdParams,
  type FetchSentPendingConnectionsParams,
  type FetchReceivedPendingConnectionsParams,
  type UseConnectionManagerProps,
  type ConnectionData,
} from "./hooks/relationships/connections";

// -- reports
export {
  useCreateReport,
  useFetchModeratedReports,
  useHandleSpaceEntityReport,
  useHandleSpaceCommentReport,
  type UseCreateReportProps,
  type CreateReportProps,
  type CreateCommentReportProps,
  type CreateEntityReportProps,
  type FetchModeratedReportsParams,
  type ReportUserReport,
  type Report,
  type HandleSpaceEntityReportParams,
  type HandleReportResponse,
  type HandleSpaceCommentReportParams,
} from "./hooks/reports";

// -- general
export { useGetMetadata, type GetMetadataProps } from "./hooks/utils";

// -- storage
export {
  useUploadFile,
  useUploadImage,
  type RNFile,
  type UploadFileOptions,
  type UploadResponse,
} from "./hooks/storage";

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
  UserInclude,
  UserIncludeArray,
  UserIncludeParam,
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
export type {
  Reaction,
  ReactionType,
  ReactionCounts,
} from "./interfaces/models/Reaction";
export type { Mention } from "./interfaces/models/Mention";
export type {
  Space,
  SpaceDetailed,
  SpacePreview,
  SpaceMemberPermissions,
  ReadingPermission,
  PostingPermission,
  PaginationMeta,
  UserSpaceItem,
  UserSpacesResponse,
  JoinSpaceResponse,
  LeaveSpaceResponse,
  UpdateMemberRoleResponse,
  ApproveMemberResponse,
  DeclineMemberResponse,
  DeleteSpaceResponse,
  SpaceInclude,
  SpaceIncludeArray,
  SpaceIncludeParam,
} from "./interfaces/models/Space";
export type {
  SpaceMember,
  SpaceMemberRole,
  SpaceMemberStatus,
  SpaceMemberWithUser,
  SpaceMembersResponse,
  SpaceTeamResponse,
} from "./interfaces/models/SpaceMember";
export type {
  SpaceListSortByOptions,
  SpaceListFilters,
} from "./interfaces/SpaceListSortByOptions";
export type { SpaceBreadcrumb } from "./interfaces/SpaceBreadcrumb";
export type {
  Rule,
  FetchManyRulesResponse,
  DeleteRuleResponse,
} from "./interfaces/models/Rule";
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
export type {
  Image,
  ImageVariant,
  UploadImageOptions,
} from "./interfaces/models/Image";
export type { File } from "./interfaces/models/File";
