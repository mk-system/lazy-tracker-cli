/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** GitHubIssueStateFilter */
export type JpMkscLazytrackerCoreModelsGitHubIssueStateFilter =
  | "all"
  | "open"
  | "closed";

/** GitHubImportJobStatus */
export type JpMkscLazytrackerCoreModelsGitHubImportJobStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed";

/** ExternalLinkStatusEnum */
export type JpMkscLazytrackerApiModelsCommonExternalLinkStatusEnum =
  | "open"
  | "draft"
  | "merged"
  | "closed";

/** TicketState */
export type JpMkscLazytrackerCoreModelsTicketState =
  | "unscheduled"
  | "created"
  | "started"
  | "finished"
  | "rejected"
  | "accepted"
  | "delivered";

/** AnchorPlacementEnum */
export type JpMkscLazytrackerApiModelsCommonAnchorPlacementEnum =
  | "above"
  | "below";

/** TicketTypeEnum */
export type JpMkscLazytrackerApiModelsCommonTicketTypeEnum =
  | "normal"
  | "release";

/** TicketStateEnum */
export type JpMkscLazytrackerApiModelsCommonTicketStateEnum =
  | "unscheduled"
  | "created"
  | "started"
  | "finished"
  | "accepted"
  | "rejected"
  | "delivered";

/** TicketListTypeEnum */
export type JpMkscLazytrackerApiModelsCommonTicketListTypeEnum =
  | "done"
  | "current_backlog"
  | "icebox";

/** UserAuthenticationRequest */
export interface JpMkscLazytrackerApiModelsUserUserAuthenticationRequest {
  /** String */
  email: string;
  /** String */
  password: string;
}

/** UserResponse */
export interface JpMkscLazytrackerApiModelsUserUserResponse {
  /** String */
  avatarUrl: string;
  /**
   * Long
   * @format int64
   */
  createdAt: number;
  /** String */
  displayName: string;
  /** String */
  email: string;
  /** Boolean */
  emailDeliveryFailed: boolean;
  /** Boolean */
  emailVerified: boolean;
  /** String */
  id: string;
  /** String */
  name: string;
  /** String */
  role?: null | string;
  /**
   * Long
   * @format int64
   */
  updatedAt: number;
  /** String */
  username: string;
}

/** LoginResponse */
export interface JpMkscLazytrackerApiModelsUserLoginResponse {
  /** String */
  redirectUrl: string;
  user: JpMkscLazytrackerApiModelsUserUserResponse;
}

/** ExceptionInfo */
export interface JpMkscLazytrackerApiModelsCommonExceptionInfo {
  /** String */
  cause?: null | string;
  /** String */
  exceptionType?: null | string;
  /** List<String> */
  stackTrace?: null | string[];
}

/** ErrorResponse */
export interface JpMkscLazytrackerApiModelsCommonErrorResponse {
  /** Map<String,String> */
  details?: null | Record<string, string>;
  /** String */
  errorCode: string;
  exceptionInfo?: null | JpMkscLazytrackerApiModelsCommonExceptionInfo;
  /** String */
  status: string;
}

/** EmailLookupRequest */
export interface JpMkscLazytrackerApiModelsUserEmailLookupRequest {
  /** String */
  password: string;
  /** String */
  username: string;
}

/** EmailLookupResponse */
export interface JpMkscLazytrackerApiModelsUserEmailLookupResponse {
  /** String */
  email: string;
}

/** EmailVerificationRequest */
export interface JpMkscLazytrackerApiModelsUserEmailVerificationRequest {
  /** String */
  email: string;
}

/** SuccessResponse<Unit> */
export interface JpMkscLazytrackerApiModelsCommonSuccessResponseKotlinUnit {
  /** Unit */
  data: null;
  /** String */
  status: string;
}

/** CompleteRegistrationRequest */
export interface JpMkscLazytrackerApiModelsUserCompleteRegistrationRequest {
  /** String */
  displayName: string;
  /** String */
  password: string;
  /** String */
  token: string;
  /** String */
  username: string;
}

/** PasswordResetRequest */
export interface JpMkscLazytrackerApiModelsUserPasswordResetRequest {
  /** String */
  email: string;
}

/** PasswordResetConfirmRequest */
export interface JpMkscLazytrackerApiModelsUserPasswordResetConfirmRequest {
  /** String */
  password: string;
  /** String */
  token: string;
}

/** EmailChangeConfirmRequest */
export interface JpMkscLazytrackerApiModelsUserEmailChangeConfirmRequest {
  /** String */
  token: string;
}

/** AccountDeleteRequest */
export interface JpMkscLazytrackerApiModelsUserAccountDeleteRequest {
  /** String */
  email: string;
}

/** StatusResponse */
export interface JpMkscLazytrackerApiModelsCommonStatusResponse {
  /** String */
  buildHash: string;
}

/** SuccessResponse<StatusResponse> */
export interface JpMkscLazytrackerApiModelsCommonSuccessResponseJpMkscLazytrackerApiModelsCommonStatusResponse {
  data: JpMkscLazytrackerApiModelsCommonStatusResponse;
  /** String */
  status: string;
}

/** ConstraintsResponse */
export interface JpMkscLazytrackerApiModelsCommonConstraintsResponse {
  password: JpMkscLazytrackerApiModelsCommonPasswordConstraints;
}

/** PasswordConstraints */
export interface JpMkscLazytrackerApiModelsCommonPasswordConstraints {
  /** String */
  description: string;
  /**
   * Int
   * @format int32
   */
  maxLength: number;
  /**
   * Int
   * @format int32
   */
  minLength: number;
  /** String */
  pattern: string;
}

/** SuccessResponse<ConstraintsResponse> */
export interface JpMkscLazytrackerApiModelsCommonSuccessResponseJpMkscLazytrackerApiModelsCommonConstraintsResponse {
  data: JpMkscLazytrackerApiModelsCommonConstraintsResponse;
  /** String */
  status: string;
}

/** InvitationInfoResponse */
export interface JpMkscLazytrackerApiModelsTeamInvitationInfoResponse {
  /** String */
  errorCode?: null | string;
  /**
   * Long
   * @format int64
   */
  expiresAt?: null | number;
  /** Boolean */
  isValid: boolean;
  /** String */
  teamDescription: string;
  /** String */
  teamKey: string;
}

/** AcceptInvitationResponse */
export interface JpMkscLazytrackerApiModelsTeamAcceptInvitationResponse {
  /** String */
  errorCode?: null | string;
  /** Boolean */
  success: boolean;
  /** String */
  teamKey?: null | string;
}

/** DeviceCodeRequest */
export interface JpMkscLazytrackerApiModelsOauthDeviceCodeRequest {
  /** String */
  clientId: string;
  /** String */
  scope?: null | string;
}

/** DeviceCodeResponse */
export interface JpMkscLazytrackerApiModelsOauthDeviceCodeResponse {
  /** String */
  deviceCode: string;
  /**
   * Int
   * @format int32
   */
  expiresIn: number;
  /**
   * Int
   * @format int32
   */
  interval: number;
  /** String */
  userCode: string;
  /** String */
  verificationUri: string;
  /** String */
  verificationUriComplete: string;
}

/** TokenRequest */
export interface JpMkscLazytrackerApiModelsOauthTokenRequest {
  /** String */
  clientId?: null | string;
  /** String */
  deviceCode?: null | string;
  /** String */
  grantType: string;
  /** String */
  refreshToken?: null | string;
  /** Boolean */
  secureStorage: boolean;
}

/** TokenResponse */
export interface JpMkscLazytrackerApiModelsOauthTokenResponse {
  /** String */
  accessToken: string;
  /**
   * Int
   * @format int32
   */
  expiresIn: number;
  /** String */
  refreshToken: string;
  /**
   * Int
   * @format int32
   */
  refreshTokenExpiresIn: number;
  /** String */
  tokenType: string;
}

/** RevokeRequest */
export interface JpMkscLazytrackerApiModelsOauthRevokeRequest {
  /** String */
  token: string;
  /** String */
  tokenTypeHint?: null | string;
}

/** UserRegistrationRequest */
export interface JpMkscLazytrackerApiModelsUserUserRegistrationRequest {
  /** String */
  displayName: string;
  /** String */
  email: string;
  /** String */
  password: string;
  /** String */
  username: string;
}

/** ResetPasswordResponse */
export interface JpMkscLazytrackerApiModelsUserResetPasswordResponse {
  /** String */
  temporaryPassword: string;
}

/** EmailVerifiedUpdateRequest */
export interface JpMkscLazytrackerApiModelsUserEmailVerifiedUpdateRequest {
  /** Boolean */
  emailVerified: boolean;
}

/** SystemAdminUpdateRequest */
export interface JpMkscLazytrackerApiModelsUserSystemAdminUpdateRequest {
  /** Boolean */
  isSystemAdmin: boolean;
}

/** UserUpdateRequest */
export interface JpMkscLazytrackerApiModelsUserUserUpdateRequest {
  /** String */
  displayName?: null | string;
  /** String */
  email?: null | string;
}

/** PasswordUpdateRequest */
export interface JpMkscLazytrackerApiModelsUserPasswordUpdateRequest {
  /** String */
  currentPassword: string;
  /** String */
  password: string;
}

/** TeamResponse */
export interface JpMkscLazytrackerApiModelsTeamTeamResponse {
  /**
   * Long
   * @format int64
   */
  createdAt: number;
  /** String */
  description?: null | string;
  /** String */
  id: string;
  /** String */
  ownerId: string;
  /** String */
  teamKey: string;
  /**
   * Long
   * @format int64
   */
  updatedAt: number;
}

/** TeamCreateRequest */
export interface JpMkscLazytrackerApiModelsTeamTeamCreateRequest {
  /** String */
  description?: null | string;
  /** String */
  teamKey: string;
}

/** TeamMemberResponse */
export interface JpMkscLazytrackerApiModelsTeamTeamMemberResponse {
  /** String */
  avatarUrl: string;
  /** String */
  displayName: string;
  /** String */
  email: string;
  /** Boolean */
  isOwner: boolean;
  /**
   * Long
   * @format int64
   */
  joinedAt: number;
  /** String */
  role: string;
  /** String */
  userId: string;
  /** String */
  userName: string;
}

/** TeamStorageUsageResponse */
export interface JpMkscLazytrackerApiModelsTeamTeamStorageUsageResponse {
  /**
   * Long
   * @format int64
   */
  limitBytes: number;
  /**
   * Long
   * @format int64
   */
  usedBytes: number;
}

/** CreateInvitationRequest */
export interface JpMkscLazytrackerApiModelsTeamCreateInvitationRequest {
  /**
   * Long
   * @format int64
   */
  expiresInHours?: null | number;
  /**
   * Int
   * @format int32
   */
  maxUses?: null | number;
}

/** InvitationResponse */
export interface JpMkscLazytrackerApiModelsTeamInvitationResponse {
  /**
   * Long
   * @format int64
   */
  createdAt: number;
  /** String */
  createdBy: string;
  /**
   * Long
   * @format int64
   */
  expiresAt?: null | number;
  /** String */
  id: string;
  /** String */
  inviteUrl: string;
  /** Boolean */
  isActive: boolean;
  /**
   * Int
   * @format int32
   */
  maxUses?: null | number;
  /**
   * Long
   * @format int64
   */
  revokedAt?: null | number;
  /** String */
  token: string;
  /**
   * Int
   * @format int32
   */
  useCount: number;
}

/** TeamMemberAddRequest */
export interface JpMkscLazytrackerApiModelsTeamTeamMemberAddRequest {
  /** String */
  role?: null | string;
  /** String */
  userId: string;
}

/** TeamMemberRoleUpdateRequest */
export interface JpMkscLazytrackerApiModelsTeamTeamMemberRoleUpdateRequest {
  /** String */
  role: string;
}

/** TransferOwnershipRequest */
export interface JpMkscLazytrackerApiModelsTeamTransferOwnershipRequest {
  /** String */
  newOwnerId: string;
}

/** ProjectCreateByTeamKeyRequest */
export interface JpMkscLazytrackerApiModelsProjectProjectCreateByTeamKeyRequest {
  /** String */
  description?: null | string;
  /** String */
  projectKey: string;
  /** String */
  timeZone: string;
  /**
   * Int
   * @format int32
   */
  weeklyVelocity: number;
}

/** ProjectResponse */
export interface JpMkscLazytrackerApiModelsProjectProjectResponse {
  /**
   * Long
   * @format int64
   */
  createdAt: number;
  /** String */
  description?: null | string;
  /**
   * Int
   * @format int32
   */
  estimatedWeeks?: null | number;
  /** String */
  id: string;
  /** Boolean */
  isProjectMember: boolean;
  /** Boolean */
  isTeamMember: boolean;
  /** String */
  nextReleaseDate?: null | string;
  /** String */
  projectKey: string;
  /** String */
  teamId: string;
  /** String */
  teamKey: string;
  /** String */
  timeZone: string;
  /** String */
  timeZoneDisplay: string;
  /**
   * Long
   * @format int64
   */
  updatedAt: number;
  /**
   * Int
   * @format int32
   */
  weeklyVelocity: number;
}

/** WeeklyPoint */
export interface JpMkscLazytrackerCoreServicesWeeklyPoint {
  /**
   * Int
   * @format int32
   */
  points: number;
  /**
   * Long
   * @format int64
   */
  weekEnd: number;
  /**
   * Long
   * @format int64
   */
  weekStart: number;
}

/** ProjectVelocityHistory */
export interface JpMkscLazytrackerCoreServicesProjectVelocityHistory {
  /** List<WeeklyPoint> */
  weeklyPoints: JpMkscLazytrackerCoreServicesWeeklyPoint[];
  /**
   * Int
   * @format int32
   */
  weeklyVelocity: number;
}

/** ProjectMemberResponse */
export interface JpMkscLazytrackerApiModelsProjectProjectMemberResponse {
  /**
   * Long
   * @format int64
   */
  addedAt: number;
  /** String */
  avatarUrl: string;
  /** String */
  displayName: string;
  /** String */
  email: string;
  /** String */
  userId: string;
  /** String */
  userName: string;
}

/** ProjectUpdateRequest */
export interface JpMkscLazytrackerApiModelsProjectProjectUpdateRequest {
  /** String */
  description?: null | string;
  /** String */
  projectKey?: null | string;
  /** String */
  timeZone?: null | string;
  /**
   * Int
   * @format int32
   */
  weeklyVelocity?: null | number;
}

/** ProjectMemberAddRequest */
export interface JpMkscLazytrackerApiModelsProjectProjectMemberAddRequest {
  /** String */
  userId: string;
}

/** SuccessResponse<Map<String,String>> */
export interface JpMkscLazytrackerApiModelsCommonSuccessResponseKotlinCollectionsMapKotlinStringKotlinString {
  /** Map<String,String> */
  data: Record<string, string>;
  /** String */
  status: string;
}

/** RecentProjectResponse */
export interface JpMkscLazytrackerApiModelsActivityRecentProjectResponse {
  /** String */
  description?: null | string;
  /** String */
  id: string;
  /**
   * Long
   * @format int64
   */
  lastActivityAt: number;
  /** String */
  projectKey: string;
  /** String */
  teamId: string;
  /** String */
  teamKey: string;
}

/** RecentTeamResponse */
export interface JpMkscLazytrackerApiModelsActivityRecentTeamResponse {
  /** String */
  description?: null | string;
  /** String */
  id: string;
  /**
   * Long
   * @format int64
   */
  lastActivityAt: number;
  /** String */
  teamKey: string;
}

/** FavoriteProjectResponse */
export interface JpMkscLazytrackerApiModelsFavoriteFavoriteProjectResponse {
  /** String */
  id: string;
  /** String */
  projectKey: string;
  /** String */
  teamId: string;
  /** String */
  teamKey: string;
}

/** AdminTeamWithBillingResponse */
export interface JpMkscLazytrackerApiModelsAdminAdminTeamWithBillingResponse {
  /** Boolean */
  billingExempt: boolean;
  /** String */
  billingStatus: string;
  /**
   * Long
   * @format int64
   */
  createdAt: number;
  /** String */
  description?: null | string;
  /** String */
  id: string;
  /** String */
  ownerId: string;
  /**
   * Long
   * @format int64
   */
  payableSeatCount: number;
  /** String */
  teamKey: string;
  /**
   * Long
   * @format int64
   */
  updatedAt: number;
}

/** AdminBillingExemptUpdateRequest */
export interface JpMkscLazytrackerApiModelsAdminAdminBillingExemptUpdateRequest {
  /** Boolean */
  billingExempt: boolean;
}

/** TicketResponse */
export interface JpMkscLazytrackerApiModelsTicketTicketResponse {
  /**
   * Long
   * @format int64
   */
  acceptedAt?: null | number;
  /** List<String> */
  assigneeIds: string[];
  /**
   * Long
   * @format int64
   */
  createdAt: number;
  /** String */
  description: string;
  /** String */
  id: string;
  listType: JpMkscLazytrackerApiModelsCommonTicketListTypeEnum;
  /** String */
  ownerId?: null | string;
  /**
   * Int
   * @format int32
   */
  point?: null | number;
  /**
   * Long
   * @format int64
   */
  position: number;
  /** String */
  projectId: string;
  /** String */
  projectKey: string;
  /** String */
  releaseDate?: null | string;
  /**
   * Long
   * @format int64
   */
  startedAt?: null | number;
  state: JpMkscLazytrackerApiModelsCommonTicketStateEnum;
  /** List<String> */
  tagIds: string[];
  /** String */
  teamKey: string;
  /**
   * Long
   * @format int64
   */
  ticketNumber: number;
  ticketType: JpMkscLazytrackerApiModelsCommonTicketTypeEnum;
  /** String */
  title: string;
  /**
   * Long
   * @format int64
   */
  updatedAt: number;
}

/** TicketCreateRequest */
export interface JpMkscLazytrackerApiModelsTicketTicketCreateRequest {
  anchorPlacement?: null | JpMkscLazytrackerApiModelsCommonAnchorPlacementEnum;
  /** String */
  anchorTicketId?: null | string;
  /** List<String> */
  assigneeIds: string[];
  /** String */
  description: string;
  listType: JpMkscLazytrackerApiModelsCommonTicketListTypeEnum;
  /**
   * Int
   * @format int32
   */
  point?: null | number;
  /** String */
  releaseDate?: null | string;
  state: JpMkscLazytrackerApiModelsCommonTicketStateEnum;
  /** List<String> */
  tagIds: string[];
  ticketType: JpMkscLazytrackerApiModelsCommonTicketTypeEnum;
  /** String */
  title: string;
}

/** BulkUpdateTagsRequest */
export interface JpMkscLazytrackerApiModelsTicketBulkUpdateTagsRequest {
  /** List<String> */
  addTagIds: string[];
  /** List<String> */
  removeTagIds: string[];
  /** List<String> */
  ticketIds: string[];
}

/** BulkOperationResponse */
export interface JpMkscLazytrackerApiModelsTicketBulkOperationResponse {
  /** Map<String,String> */
  errors: Record<string, string>;
  /** List<String> */
  failedTicketIds: string[];
  /**
   * Int
   * @format int32
   */
  failureCount: number;
  /**
   * Int
   * @format int32
   */
  successCount: number;
}

/** BulkDeleteRequest */
export interface JpMkscLazytrackerApiModelsTicketBulkDeleteRequest {
  /** List<String> */
  ticketIds: string[];
}

/** BulkMoveRequest */
export interface JpMkscLazytrackerApiModelsTicketBulkMoveRequest {
  /** String */
  afterTicketId?: null | string;
  /** String */
  beforeTicketId?: null | string;
  targetListType: JpMkscLazytrackerApiModelsCommonTicketListTypeEnum;
  /** List<String> */
  ticketIds: string[];
}

/** BulkAssignRequest */
export interface JpMkscLazytrackerApiModelsTicketBulkAssignRequest {
  /** String */
  assigneeId: string;
  /** List<String> */
  ticketIds: string[];
}

/** PositionStatsResponse */
export interface JpMkscLazytrackerApiModelsTicketPositionStatsResponse {
  /** Map<String,PositionRangeResponse> */
  positionRangeByState: Record<
    string,
    JpMkscLazytrackerApiModelsTicketPositionRangeResponse
  >;
  /** Map<String,Int> */
  ticketsByState: Record<string, number>;
  /**
   * Int
   * @format int32
   */
  totalTickets: number;
}

/** PositionRangeResponse */
export interface JpMkscLazytrackerApiModelsTicketPositionRangeResponse {
  /**
   * Long
   * @format int64
   */
  max: number;
  /**
   * Long
   * @format int64
   */
  min: number;
}

/** RebalanceResponse */
export interface JpMkscLazytrackerApiModelsTicketRebalanceResponse {
  after: JpMkscLazytrackerApiModelsTicketPositionStatsResponse;
  before: JpMkscLazytrackerApiModelsTicketPositionStatsResponse;
  /**
   * Long
   * @format int64
   */
  executionTimeMs: number;
  /** Map<String,Int> */
  processedStateGroups: Record<string, number>;
  /** Boolean */
  success: boolean;
  /**
   * Int
   * @format int32
   */
  totalTickets: number;
}

/** TicketActivityResponse */
export interface JpMkscLazytrackerApiModelsTicketTicketActivityResponse {
  /** Map<String,FieldChangeResponse> */
  changes?: null | Record<
    string,
    JpMkscLazytrackerApiModelsTicketFieldChangeResponse
  >;
  /**
   * Long
   * @format int64
   */
  createdAt: number;
  /** String */
  eventType: string;
  /**
   * Long
   * @format int64
   */
  id: number;
  /** String */
  title?: null | string;
  /** String */
  userId: string;
}

/** FieldChangeResponse */
export interface JpMkscLazytrackerApiModelsTicketFieldChangeResponse {
  /** String */
  new?: null | string;
  /** String */
  old?: null | string;
}

/** TicketUpdateRequest */
export interface JpMkscLazytrackerApiModelsTicketTicketUpdateRequest {
  /** Boolean */
  clearPoint?: null | boolean;
  /** String */
  description?: null | string;
  listType?: null | JpMkscLazytrackerApiModelsCommonTicketListTypeEnum;
  /**
   * Int
   * @format int32
   */
  point?: null | number;
  /**
   * Long
   * @format int64
   */
  position?: null | number;
  /** String */
  releaseDate?: null | string;
  state?: null | JpMkscLazytrackerApiModelsCommonTicketStateEnum;
  /** List<String> */
  tagIds?: null | string[];
  ticketType?: null | JpMkscLazytrackerApiModelsCommonTicketTypeEnum;
  /** String */
  title?: null | string;
}

/** TicketMoveRequest */
export interface JpMkscLazytrackerApiModelsTicketTicketMoveRequest {
  /** String */
  afterTicketId?: null | string;
  /** String */
  beforeTicketId?: null | string;
  listType: JpMkscLazytrackerApiModelsCommonTicketListTypeEnum;
  state?: null | JpMkscLazytrackerCoreModelsTicketState;
}

/** TicketAssignRequest */
export interface JpMkscLazytrackerApiModelsTicketTicketAssignRequest {
  /** String */
  assigneeId: string;
}

/** TagResponse */
export interface JpMkscLazytrackerApiModelsTagTagResponse {
  /**
   * Long
   * @format int64
   */
  createdAt: number;
  /** String */
  id: string;
  /** String */
  name: string;
  /** String */
  projectId: string;
  /**
   * Long
   * @format int64
   */
  updatedAt: number;
}

/** TagCreateRequest */
export interface JpMkscLazytrackerApiModelsTagTagCreateRequest {
  /** String */
  name: string;
}

/** TagUpdateRequest */
export interface JpMkscLazytrackerApiModelsTagTagUpdateRequest {
  /** String */
  name: string;
}

/** ChatResponse */
export interface JpMkscLazytrackerApiModelsChatChatResponse {
  /**
   * Long
   * @format int64
   */
  createdAt: number;
  /** String */
  id: string;
  /** String */
  message: string;
  /** String */
  ticketId: string;
  /**
   * Long
   * @format int64
   */
  updatedAt: number;
  /** String */
  userId?: null | string;
}

/** ChatCreateRequest */
export interface JpMkscLazytrackerApiModelsChatChatCreateRequest {
  /** String */
  message: string;
}

/** ChatUpdateRequest */
export interface JpMkscLazytrackerApiModelsChatChatUpdateRequest {
  /** String */
  message: string;
}

/** TicketExternalLinkResponse */
export interface JpMkscLazytrackerApiModelsTicketTicketExternalLinkResponse {
  /**
   * Long
   * @format int64
   */
  createdAt: number;
  /** String */
  id: string;
  /**
   * Int
   * @format int32
   */
  number: number;
  /** String */
  repository: string;
  status?: null | JpMkscLazytrackerApiModelsCommonExternalLinkStatusEnum;
  /** String */
  ticketId: string;
  /** String */
  title?: null | string;
  /**
   * Long
   * @format int64
   */
  updatedAt: number;
  /** String */
  url: string;
}

/** TicketExternalLinkCreateRequest */
export interface JpMkscLazytrackerApiModelsTicketTicketExternalLinkCreateRequest {
  /** String */
  url: string;
}

/** ProjectSearchHitResponse */
export interface JpMkscLazytrackerApiModelsSearchProjectSearchHitResponse {
  /** String */
  chatSnippet?: null | string;
  /** String */
  ticketId: string;
}

/** ProjectSearchResponse */
export interface JpMkscLazytrackerApiModelsSearchProjectSearchResponse {
  /** List<ProjectSearchHitResponse> */
  results: JpMkscLazytrackerApiModelsSearchProjectSearchHitResponse[];
  /** Boolean */
  truncated: boolean;
}

/** PresignedUploadRequest */
export interface JpMkscLazytrackerApiModelsFilePresignedUploadRequest {
  /** String */
  contentType: string;
  /**
   * Long
   * @format int64
   */
  fileSize: number;
  /** String */
  filename: string;
}

/** PresignedUploadResponse */
export interface JpMkscLazytrackerApiModelsFilePresignedUploadResponse {
  /** String */
  fileId: string;
  /** String */
  uploadUrl: string;
}

/** GitHubJobStatusResponse */
export interface JpMkscLazytrackerApiModelsGithubGitHubJobStatusResponse {
  /**
   * Long
   * @format int64
   */
  completedAt?: null | number;
  /** String */
  errorMessage?: null | string;
  /**
   * Int
   * @format int32
   */
  failedCount?: null | number;
  /**
   * Int
   * @format int32
   */
  importedCount?: null | number;
  /** String */
  jobId: string;
  /**
   * Int
   * @format int32
   */
  skippedCount?: null | number;
  /**
   * Long
   * @format int64
   */
  startedAt?: null | number;
  status: JpMkscLazytrackerCoreModelsGitHubImportJobStatus;
  /**
   * Long
   * @format int64
   */
  submittedAt: number;
  /**
   * Int
   * @format int32
   */
  updatedCount?: null | number;
}

/** GitHubInitiateDeviceFlowRequest */
export interface JpMkscLazytrackerApiModelsGithubGitHubInitiateDeviceFlowRequest {
  /** Boolean */
  isPrivate: boolean;
  /** String */
  owner: string;
  /** String */
  repo: string;
}

/** GitHubDeviceFlowResponse */
export interface JpMkscLazytrackerApiModelsGithubGitHubDeviceFlowResponse {
  /**
   * Int
   * @format int32
   */
  expiresIn: number;
  /**
   * Int
   * @format int32
   */
  interval: number;
  /** String */
  jobId: string;
  /** String */
  userCode: string;
  /** String */
  verificationUri: string;
}

/** GitHubDeviceFlowImportRequest */
export interface JpMkscLazytrackerApiModelsGithubGitHubDeviceFlowImportRequest {
  /** List<Int> */
  issueNumbers?: null | number[];
  /** String */
  jobId: string;
  /** List<String> */
  labels?: null | string[];
  /** String */
  owner: string;
  /** String */
  repo: string;
  state: JpMkscLazytrackerCoreModelsGitHubIssueStateFilter;
}

/** GitHubImportJobResponse */
export interface JpMkscLazytrackerApiModelsGithubGitHubImportJobResponse {
  /** String */
  jobId: string;
  status: JpMkscLazytrackerCoreModelsGitHubImportJobStatus;
}

/** ProjectRepositoryResponse */
export interface JpMkscLazytrackerApiModelsProjectProjectRepositoryResponse {
  /**
   * Long
   * @format int64
   */
  connectedAt: number;
  /** String */
  connectedBy?: null | string;
  /** String */
  repository: string;
  /** String */
  url: string;
}

/** ProjectRepositoryStatusResponse */
export interface JpMkscLazytrackerApiModelsProjectProjectRepositoryStatusResponse {
  /** Boolean */
  appEnabled: boolean;
  /** String */
  installUrl?: null | string;
  repository?: null | JpMkscLazytrackerApiModelsProjectProjectRepositoryResponse;
}

/** ProjectRepositoryAuthorizationResponse */
export interface JpMkscLazytrackerApiModelsProjectProjectRepositoryAuthorizationResponse {
  /** String */
  authorizeUrl: string;
}

/** ProjectRepositoryCandidateResponse */
export interface JpMkscLazytrackerApiModelsProjectProjectRepositoryCandidateResponse {
  /** String */
  fullName: string;
  /**
   * Long
   * @format int64
   */
  installationId: number;
  /** Boolean */
  isPrivate: boolean;
  /**
   * Long
   * @format int64
   */
  repositoryId: number;
}

/** ProjectRepositoryCandidatesResponse */
export interface JpMkscLazytrackerApiModelsProjectProjectRepositoryCandidatesResponse {
  /** List<ProjectRepositoryCandidateResponse> */
  candidates: JpMkscLazytrackerApiModelsProjectProjectRepositoryCandidateResponse[];
}

/** ProjectRepositoryConnectRequest */
export interface JpMkscLazytrackerApiModelsProjectProjectRepositoryConnectRequest {
  /**
   * Long
   * @format int64
   */
  repositoryId: number;
  /** String */
  session: string;
}

/** ConfirmUploadRequest */
export interface JpMkscLazytrackerApiModelsFileConfirmUploadRequest {
  /** String */
  fileId: string;
}

/** FileResponse */
export interface JpMkscLazytrackerApiModelsFileFileResponse {
  /** String */
  contentType: string;
  /**
   * Long
   * @format int64
   */
  createdAt: number;
  /** String */
  downloadUrl: string;
  /**
   * Long
   * @format int64
   */
  fileSize: number;
  /** String */
  id: string;
  /** String */
  originalFilename: string;
  /** String */
  status: string;
  /**
   * Long
   * @format int64
   */
  updatedAt: number;
  /** String */
  uploadedBy: string;
}

/** BillingAlertResponse */
export interface JpMkscLazytrackerApiModelsBillingBillingAlertResponse {
  /** String */
  status: string;
  /** String */
  teamKey: string;
}

/** TeamBillingStatusResponse */
export interface JpMkscLazytrackerApiModelsBillingTeamBillingStatusResponse {
  /** Boolean */
  billingExempt: boolean;
  /** String */
  billingInterval?: null | string;
  /** Boolean */
  cancelAtPeriodEnd: boolean;
  /** String */
  currency?: null | string;
  /**
   * Long
   * @format int64
   */
  currentPeriodEnd?: null | number;
  /**
   * Long
   * @format int64
   */
  gracePeriodEndsAt?: null | number;
  /**
   * Long
   * @format int64
   */
  payableSeatCount: number;
  /** Boolean */
  requiresBilling: boolean;
  /**
   * Long
   * @format int64
   */
  seatTotalAmount?: null | number;
  /** String */
  status: string;
  /**
   * Long
   * @format int64
   */
  unitAmount?: null | number;
}

/** TeamNextInvoiceResponse */
export interface JpMkscLazytrackerApiModelsBillingTeamNextInvoiceResponse {
  /**
   * Long
   * @format int64
   */
  amountDue?: null | number;
  /** String */
  currency?: null | string;
  /**
   * Long
   * @format int64
   */
  nextPaymentAt?: null | number;
  /** String */
  state: string;
  /**
   * Long
   * @format int64
   */
  subtotal?: null | number;
  /**
   * Long
   * @format int64
   */
  tax?: null | number;
  /**
   * Long
   * @format int64
   */
  unpaidAmount?: null | number;
  /** String */
  unpaidCurrency?: null | string;
  /**
   * Long
   * @format int64
   */
  unpaidDueAt?: null | number;
  /** String */
  unpaidInvoiceUrl?: null | string;
}

/** CheckoutSessionResponse */
export interface JpMkscLazytrackerApiModelsBillingCheckoutSessionResponse {
  /** String */
  checkoutUrl: string;
}

/** BillingPortalSessionResponse */
export interface JpMkscLazytrackerApiModelsBillingBillingPortalSessionResponse {
  /** String */
  portalUrl: string;
}
