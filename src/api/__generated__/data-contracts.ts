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

/** TicketState */
export type JpMkscLazytrackerCoreModelsTicketState =
  | "unscheduled"
  | "created"
  | "started"
  | "finished"
  | "rejected"
  | "accepted"
  | "delivered";

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
  message: string;
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
  stackTrace?: null | any[];
}

/** ErrorResponse */
export interface JpMkscLazytrackerApiModelsCommonErrorResponse {
  /** Map<String,String> */
  details?: null | object;
  /** String */
  errorCode: string;
  exceptionInfo?: null | JpMkscLazytrackerApiModelsCommonExceptionInfo;
  /** String */
  message: string;
  /** String */
  status: string;
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

/** SuccessResponse<Int> */
export interface JpMkscLazytrackerApiModelsCommonSuccessResponseKotlinInt {
  /**
   * Int
   * @format int32
   */
  data: number;
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
  /** String */
  message: string;
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
  /** String */
  scope: string;
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

/** DeviceVerifyRequest */
export interface JpMkscLazytrackerApiModelsOauthDeviceVerifyRequest {
  /** String */
  userCode: string;
}

/** DeviceCodeInfoResponse */
export interface JpMkscLazytrackerApiModelsOauthDeviceCodeInfoResponse {
  /** String */
  clientName: string;
  /** List<String> */
  scopeDescriptions: string[];
  /** List<String> */
  scopes: string[];
}

/** DeviceAuthorizeRequest */
export interface JpMkscLazytrackerApiModelsOauthDeviceAuthorizeRequest {
  /** Boolean */
  approve: boolean;
  /** String */
  userCode: string;
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
  avatarUrl?: null | string;
  /** String */
  displayName?: null | string;
  /** String */
  email?: null | string;
  /** String */
  username?: null | string;
}

/** PasswordUpdateRequest */
export interface JpMkscLazytrackerApiModelsUserPasswordUpdateRequest {
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
  /** String */
  estimatedWeeks?: null | string;
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

/** TicketResponse */
export interface JpMkscLazytrackerApiModelsTicketTicketResponse {
  /** List<String> */
  assigneeIds: string[];
  /**
   * Long
   * @format int64
   */
  createdAt: number;
  /** String */
  description: string;
  /**
   * Long
   * @format int64
   */
  finishedAt?: null | number;
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

/** TicketUpdateRequest */
export interface JpMkscLazytrackerApiModelsTicketTicketUpdateRequest {
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
  tagIds?: null | any[];
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

/** ChatResponse */
export interface JpMkscLazytrackerApiModelsChatChatResponse {
  /**
   * Long
   * @format int64
   */
  createdAt: number;
  /** String */
  id: string;
  /** Boolean */
  isReply: boolean;
  /** String */
  message: string;
  /** String */
  parentId?: null | string;
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
  /** String */
  parentId?: null | string;
}

/** ChatUpdateRequest */
export interface JpMkscLazytrackerApiModelsChatChatUpdateRequest {
  /** String */
  message: string;
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
