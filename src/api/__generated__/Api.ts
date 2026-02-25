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

import {
  JpMkscLazytrackerApiModelsChatChatCreateRequest,
  JpMkscLazytrackerApiModelsChatChatResponse,
  JpMkscLazytrackerApiModelsChatChatUpdateRequest,
  JpMkscLazytrackerApiModelsCommonErrorResponse,
  JpMkscLazytrackerApiModelsCommonSuccessResponseKotlinCollectionsMapKotlinStringKotlinString,
  JpMkscLazytrackerApiModelsCommonSuccessResponseKotlinInt,
  JpMkscLazytrackerApiModelsCommonSuccessResponseKotlinUnit,
  JpMkscLazytrackerApiModelsOauthDeviceAuthorizeRequest,
  JpMkscLazytrackerApiModelsOauthDeviceCodeInfoResponse,
  JpMkscLazytrackerApiModelsOauthDeviceCodeRequest,
  JpMkscLazytrackerApiModelsOauthDeviceCodeResponse,
  JpMkscLazytrackerApiModelsOauthDeviceVerifyRequest,
  JpMkscLazytrackerApiModelsOauthRevokeRequest,
  JpMkscLazytrackerApiModelsOauthTokenRequest,
  JpMkscLazytrackerApiModelsOauthTokenResponse,
  JpMkscLazytrackerApiModelsProjectProjectCreateByTeamKeyRequest,
  JpMkscLazytrackerApiModelsProjectProjectMemberAddRequest,
  JpMkscLazytrackerApiModelsProjectProjectMemberResponse,
  JpMkscLazytrackerApiModelsProjectProjectResponse,
  JpMkscLazytrackerApiModelsProjectProjectUpdateRequest,
  JpMkscLazytrackerApiModelsTagTagCreateRequest,
  JpMkscLazytrackerApiModelsTagTagResponse,
  JpMkscLazytrackerApiModelsTeamAcceptInvitationResponse,
  JpMkscLazytrackerApiModelsTeamCreateInvitationRequest,
  JpMkscLazytrackerApiModelsTeamInvitationInfoResponse,
  JpMkscLazytrackerApiModelsTeamInvitationResponse,
  JpMkscLazytrackerApiModelsTeamTeamCreateRequest,
  JpMkscLazytrackerApiModelsTeamTeamMemberAddRequest,
  JpMkscLazytrackerApiModelsTeamTeamMemberResponse,
  JpMkscLazytrackerApiModelsTeamTeamMemberRoleUpdateRequest,
  JpMkscLazytrackerApiModelsTeamTeamResponse,
  JpMkscLazytrackerApiModelsTicketRebalanceResponse,
  JpMkscLazytrackerApiModelsTicketTicketAssignRequest,
  JpMkscLazytrackerApiModelsTicketTicketCreateRequest,
  JpMkscLazytrackerApiModelsTicketTicketMoveRequest,
  JpMkscLazytrackerApiModelsTicketTicketResponse,
  JpMkscLazytrackerApiModelsTicketTicketUpdateRequest,
  JpMkscLazytrackerApiModelsUserCompleteRegistrationRequest,
  JpMkscLazytrackerApiModelsUserEmailVerificationRequest,
  JpMkscLazytrackerApiModelsUserEmailVerifiedUpdateRequest,
  JpMkscLazytrackerApiModelsUserLoginResponse,
  JpMkscLazytrackerApiModelsUserPasswordUpdateRequest,
  JpMkscLazytrackerApiModelsUserResetPasswordResponse,
  JpMkscLazytrackerApiModelsUserSystemAdminUpdateRequest,
  JpMkscLazytrackerApiModelsUserUserAuthenticationRequest,
  JpMkscLazytrackerApiModelsUserUserRegistrationRequest,
  JpMkscLazytrackerApiModelsUserUserResponse,
  JpMkscLazytrackerApiModelsUserUserUpdateRequest,
  JpMkscLazytrackerCoreServicesProjectVelocityHistory,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Api<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description Authenticate user with email and password. Sets authentication cookies for subsequent requests.
   *
   * @tags Authentication
   * @name V1AccountLoginCreate
   * @request POST:/api/v1/account/login
   */
  v1AccountLoginCreate = (
    data: JpMkscLazytrackerApiModelsUserUserAuthenticationRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsUserLoginResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/account/login`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Request email verification for registration. Sends verification email to the provided address.
   *
   * @tags Authentication
   * @name V1AccountRegisterCreate
   * @request POST:/api/v1/account/register
   */
  v1AccountRegisterCreate = (
    data: JpMkscLazytrackerApiModelsUserEmailVerificationRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsCommonSuccessResponseKotlinUnit,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/account/register`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Verify email address using token sent in verification email. Returns token for completing registration.
   *
   * @tags Authentication
   * @name V1AccountVerifyEmailList
   * @request GET:/api/v1/account/verify-email
   */
  v1AccountVerifyEmailList = (
    query?: {
      /**
       * String
       * Email verification token
       */
      token?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsCommonSuccessResponseKotlinUnit,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/account/verify-email`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description Complete user registration with verified email token and account information.
   *
   * @tags Authentication
   * @name V1AccountCompleteRegistrationCreate
   * @request POST:/api/v1/account/complete-registration
   */
  v1AccountCompleteRegistrationCreate = (
    data: JpMkscLazytrackerApiModelsUserCompleteRegistrationRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsCommonSuccessResponseKotlinUnit,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/account/complete-registration`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Log out the current user by clearing authentication cookies and session data.
   *
   * @tags Authentication
   * @name V1AccountLogoutCreate
   * @request POST:/api/v1/account/logout
   */
  v1AccountLogoutCreate = (params: RequestParams = {}) =>
    this.request<
      Record<string, string>,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/account/logout`,
      method: "POST",
      format: "json",
      ...params,
    });
  /**
   * @description Refresh JWT token using current valid token. Generates a new JWT with extended expiration and updates authentication cookies.
   *
   * @tags Authentication
   * @name V1AccountRefreshCreate
   * @request POST:/api/v1/account/refresh
   */
  v1AccountRefreshCreate = (params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsUserUserResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/account/refresh`,
      method: "POST",
      format: "json",
      ...params,
    });
  /**
   * @description Get API status information to check if the service is running properly
   *
   * @tags Status
   * @name V1StatusList
   * @request GET:/api/v1/status
   */
  v1StatusList = (params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsCommonSuccessResponseKotlinInt,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/status`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Get invitation info by token (public endpoint)
   *
   * @tags Team Invitations
   * @name V1InvitationsInfoList
   * @request GET:/api/v1/invitations/{token}/info
   */
  v1InvitationsInfoList = (token: string, params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsTeamInvitationInfoResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/invitations/${token}/info`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Accept an invitation and join the team
   *
   * @tags Team Invitations
   * @name V1InvitationsAcceptCreate
   * @request POST:/api/v1/invitations/{token}/accept
   */
  v1InvitationsAcceptCreate = (token: string, params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsTeamAcceptInvitationResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/invitations/${token}/accept`,
      method: "POST",
      format: "json",
      ...params,
    });
  /**
   * @description Request a device code and user code for Device Authorization Grant flow (RFC 8628).
   *
   * @tags OAuth
   * @name V1OauthDeviceCodeCreate
   * @request POST:/api/v1/oauth/device/code
   */
  v1OauthDeviceCodeCreate = (
    data: JpMkscLazytrackerApiModelsOauthDeviceCodeRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsOauthDeviceCodeResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/oauth/device/code`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Exchange device code or refresh token for access token.
   *
   * @tags OAuth
   * @name V1OauthTokenCreate
   * @request POST:/api/v1/oauth/token
   */
  v1OauthTokenCreate = (
    data: JpMkscLazytrackerApiModelsOauthTokenRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsOauthTokenResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/oauth/token`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Revoke an access token or refresh token.
   *
   * @tags OAuth
   * @name V1OauthRevokeCreate
   * @request POST:/api/v1/oauth/revoke
   */
  v1OauthRevokeCreate = (
    data: JpMkscLazytrackerApiModelsOauthRevokeRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      Record<string, string>,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/oauth/revoke`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Verify user code and get device authorization info.
   *
   * @tags OAuth
   * @name V1OauthDeviceVerifyCreate
   * @request POST:/api/v1/oauth/device/verify
   */
  v1OauthDeviceVerifyCreate = (
    data: JpMkscLazytrackerApiModelsOauthDeviceVerifyRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsOauthDeviceCodeInfoResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/oauth/device/verify`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Approve or deny device authorization request.
   *
   * @tags OAuth
   * @name V1OauthDeviceAuthorizeCreate
   * @request POST:/api/v1/oauth/device/authorize
   */
  v1OauthDeviceAuthorizeCreate = (
    data: JpMkscLazytrackerApiModelsOauthDeviceAuthorizeRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      Record<string, string>,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/oauth/device/authorize`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Get all users (admin only)
   *
   * @tags Users
   * @name V1UsersList
   * @request GET:/api/v1/users/
   */
  v1UsersList = (params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsUserUserResponse[],
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/users/`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Create a new user
   *
   * @tags Users
   * @name V1UsersCreate
   * @request POST:/api/v1/users/
   */
  v1UsersCreate = (
    data: JpMkscLazytrackerApiModelsUserUserRegistrationRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsUserUserResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/users/`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Get user by ID
   *
   * @tags Users
   * @name V1UsersDetail
   * @request GET:/api/v1/users/{id}
   */
  v1UsersDetail = (id: string, params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsUserUserResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/users/${id}`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Update user information
   *
   * @tags Users
   * @name V1UsersUpdate
   * @request PUT:/api/v1/users/{id}
   */
  v1UsersUpdate = (
    id: string,
    data: JpMkscLazytrackerApiModelsUserUserUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsUserUserResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/users/${id}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Delete a user
   *
   * @tags Users
   * @name V1UsersDelete
   * @request DELETE:/api/v1/users/{id}
   */
  v1UsersDelete = (id: string, params: RequestParams = {}) =>
    this.request<void, JpMkscLazytrackerApiModelsCommonErrorResponse>({
      path: `/api/v1/users/${id}`,
      method: "DELETE",
      ...params,
    });
  /**
   * @description Reset user password and generate temporary password (admin only)
   *
   * @tags Users
   * @name V1UsersResetPasswordCreate
   * @request POST:/api/v1/users/{id}/reset-password
   */
  v1UsersResetPasswordCreate = (id: string, params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsUserResetPasswordResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/users/${id}/reset-password`,
      method: "POST",
      format: "json",
      ...params,
    });
  /**
   * @description Update user email verification status (admin only)
   *
   * @tags Users
   * @name V1UsersEmailVerifiedPartialUpdate
   * @request PATCH:/api/v1/users/{id}/email-verified
   */
  v1UsersEmailVerifiedPartialUpdate = (
    id: string,
    data: JpMkscLazytrackerApiModelsUserEmailVerifiedUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsUserUserResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/users/${id}/email-verified`,
      method: "PATCH",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Update user system admin status (admin only)
   *
   * @tags Users
   * @name V1UsersSystemAdminPartialUpdate
   * @request PATCH:/api/v1/users/{id}/system-admin
   */
  v1UsersSystemAdminPartialUpdate = (
    id: string,
    data: JpMkscLazytrackerApiModelsUserSystemAdminUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsUserUserResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/users/${id}/system-admin`,
      method: "PATCH",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Update user password
   *
   * @tags Users
   * @name V1UsersPasswordPartialUpdate
   * @request PATCH:/api/v1/users/{id}/password
   */
  v1UsersPasswordPartialUpdate = (
    id: string,
    data: JpMkscLazytrackerApiModelsUserPasswordUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<void, JpMkscLazytrackerApiModelsCommonErrorResponse>({
      path: `/api/v1/users/${id}/password`,
      method: "PATCH",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * @description Verify user email address
   *
   * @tags Users
   * @name V1UsersVerifyEmailPartialUpdate
   * @request PATCH:/api/v1/users/{id}/verify-email
   */
  v1UsersVerifyEmailPartialUpdate = (id: string, params: RequestParams = {}) =>
    this.request<void, JpMkscLazytrackerApiModelsCommonErrorResponse>({
      path: `/api/v1/users/${id}/verify-email`,
      method: "PATCH",
      ...params,
    });
  /**
   * @description Get all teams accessible to the user
   *
   * @tags Teams
   * @name V1TeamsList
   * @request GET:/api/v1/teams
   */
  v1TeamsList = (params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsTeamTeamResponse[],
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Create a new team
   *
   * @tags Teams
   * @name V1TeamsCreate
   * @request POST:/api/v1/teams
   */
  v1TeamsCreate = (
    data: JpMkscLazytrackerApiModelsTeamTeamCreateRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsTeamTeamResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Get all teams accessible to the user
   *
   * @tags Teams
   * @name V1TeamsMyList
   * @request GET:/api/v1/teams/my
   */
  v1TeamsMyList = (params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsTeamTeamResponse[],
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/my`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Get team by team key
   *
   * @tags Teams
   * @name V1TeamsDetail
   * @request GET:/api/v1/teams/{teamKey}
   */
  v1TeamsDetail = (teamKey: string, params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsTeamTeamResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Get all members of a team
   *
   * @tags Teams
   * @name V1TeamsMembersList
   * @request GET:/api/v1/teams/{teamKey}/members
   */
  v1TeamsMembersList = (teamKey: string, params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsTeamTeamMemberResponse[],
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/members`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Add a member to a team
   *
   * @tags Teams
   * @name V1TeamsMembersCreate
   * @request POST:/api/v1/teams/{teamKey}/members
   */
  v1TeamsMembersCreate = (
    teamKey: string,
    data: JpMkscLazytrackerApiModelsTeamTeamMemberAddRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsTeamTeamMemberResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/members`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Get all invitation links for a team
   *
   * @tags Team Invitations
   * @name V1TeamsInvitationsList
   * @request GET:/api/v1/teams/{teamKey}/invitations/
   */
  v1TeamsInvitationsList = (teamKey: string, params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsTeamInvitationResponse[],
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/invitations/`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Create a new invitation link for a team
   *
   * @tags Team Invitations
   * @name V1TeamsInvitationsCreate
   * @request POST:/api/v1/teams/{teamKey}/invitations/
   */
  v1TeamsInvitationsCreate = (
    teamKey: string,
    data: JpMkscLazytrackerApiModelsTeamCreateInvitationRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsTeamInvitationResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/invitations/`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Revoke an invitation link
   *
   * @tags Team Invitations
   * @name V1TeamsInvitationsDelete
   * @request DELETE:/api/v1/teams/{teamKey}/invitations/{invitationId}
   */
  v1TeamsInvitationsDelete = (
    teamKey: string,
    invitationId: string,
    params: RequestParams = {},
  ) =>
    this.request<void, JpMkscLazytrackerApiModelsCommonErrorResponse>({
      path: `/api/v1/teams/${teamKey}/invitations/${invitationId}`,
      method: "DELETE",
      ...params,
    });
  /**
   * No description
   *
   * @name V1TeamsUpdate
   * @request PUT:/api/v1/teams/{teamKey}/
   */
  v1TeamsUpdate = (teamKey: string, params: RequestParams = {}) =>
    this.request<any, any>({
      path: `/api/v1/teams/${teamKey}/`,
      method: "PUT",
      ...params,
    });
  /**
   * @description Delete a team. Team must not have any projects.
   *
   * @tags Teams
   * @name V1TeamsDelete
   * @request DELETE:/api/v1/teams/{teamKey}/
   */
  v1TeamsDelete = (teamKey: string, params: RequestParams = {}) =>
    this.request<void, JpMkscLazytrackerApiModelsCommonErrorResponse>({
      path: `/api/v1/teams/${teamKey}/`,
      method: "DELETE",
      ...params,
    });
  /**
   * @description Update a team member's role
   *
   * @tags Teams
   * @name V1TeamsMembersRoleUpdate
   * @request PUT:/api/v1/teams/{teamKey}/members/{userId}/role
   */
  v1TeamsMembersRoleUpdate = (
    teamKey: string,
    userId: string,
    data: JpMkscLazytrackerApiModelsTeamTeamMemberRoleUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsTeamTeamMemberResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/members/${userId}/role`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Remove a member from a team
   *
   * @tags Teams
   * @name V1TeamsMembersDelete
   * @request DELETE:/api/v1/teams/{teamKey}/members/{userId}
   */
  v1TeamsMembersDelete = (
    teamKey: string,
    userId: string,
    params: RequestParams = {},
  ) =>
    this.request<void, JpMkscLazytrackerApiModelsCommonErrorResponse>({
      path: `/api/v1/teams/${teamKey}/members/${userId}`,
      method: "DELETE",
      ...params,
    });
  /**
   * @description Create a new project under the specified team
   *
   * @tags Projects
   * @name V1TeamsProjectsCreate
   * @request POST:/api/v1/teams/{teamKey}/projects
   */
  v1TeamsProjectsCreate = (
    teamKey: string,
    data: JpMkscLazytrackerApiModelsProjectProjectCreateByTeamKeyRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsProjectProjectResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/projects`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Get project by team key and project key
   *
   * @tags Projects
   * @name V1TeamsProjectsList
   * @request GET:/api/v1/teams/{teamKey}/projects/{projectKey}/
   */
  v1TeamsProjectsList = (
    teamKey: string,
    projectKey: string,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsProjectProjectResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/projects/${projectKey}/`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Update project by team key and project key
   *
   * @tags Projects
   * @name V1TeamsProjectsUpdate
   * @request PUT:/api/v1/teams/{teamKey}/projects/{projectKey}/
   */
  v1TeamsProjectsUpdate = (
    teamKey: string,
    projectKey: string,
    data: JpMkscLazytrackerApiModelsProjectProjectUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsProjectProjectResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/projects/${projectKey}/`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Delete project by team key and project key
   *
   * @tags Projects
   * @name V1TeamsProjectsDelete
   * @request DELETE:/api/v1/teams/{teamKey}/projects/{projectKey}/
   */
  v1TeamsProjectsDelete = (
    teamKey: string,
    projectKey: string,
    params: RequestParams = {},
  ) =>
    this.request<void, JpMkscLazytrackerApiModelsCommonErrorResponse>({
      path: `/api/v1/teams/${teamKey}/projects/${projectKey}/`,
      method: "DELETE",
      ...params,
    });
  /**
   * @description Get project velocity history by team key and project key
   *
   * @tags Projects
   * @name V1TeamsProjectsVelocityList
   * @request GET:/api/v1/teams/{teamKey}/projects/{projectKey}/velocity
   */
  v1TeamsProjectsVelocityList = (
    teamKey: string,
    projectKey: string,
    query?: {
      /**
       * String
       * Number of weeks of history to return (default: 12)
       */
      weeks?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerCoreServicesProjectVelocityHistory,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/projects/${projectKey}/velocity`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description Get project members by team key and project key
   *
   * @tags Projects
   * @name V1TeamsProjectsMembersList
   * @request GET:/api/v1/teams/{teamKey}/projects/{projectKey}/members
   */
  v1TeamsProjectsMembersList = (
    teamKey: string,
    projectKey: string,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsProjectProjectMemberResponse[],
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/projects/${projectKey}/members`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Add a member to project by team key and project key
   *
   * @tags Projects
   * @name V1TeamsProjectsMembersCreate
   * @request POST:/api/v1/teams/{teamKey}/projects/{projectKey}/members
   */
  v1TeamsProjectsMembersCreate = (
    teamKey: string,
    projectKey: string,
    data: JpMkscLazytrackerApiModelsProjectProjectMemberAddRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsProjectProjectMemberResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/projects/${projectKey}/members`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Join project by team key and project key
   *
   * @tags Projects
   * @name V1TeamsProjectsJoinCreate
   * @request POST:/api/v1/teams/{teamKey}/projects/{projectKey}/join
   */
  v1TeamsProjectsJoinCreate = (
    teamKey: string,
    projectKey: string,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsCommonSuccessResponseKotlinCollectionsMapKotlinStringKotlinString,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/projects/${projectKey}/join`,
      method: "POST",
      format: "json",
      ...params,
    });
  /**
   * @description Remove a member from project by team key and project key
   *
   * @tags Projects
   * @name V1TeamsProjectsMembersDelete
   * @request DELETE:/api/v1/teams/{teamKey}/projects/{projectKey}/members/{userId}
   */
  v1TeamsProjectsMembersDelete = (
    teamKey: string,
    projectKey: string,
    userId: string,
    params: RequestParams = {},
  ) =>
    this.request<void, JpMkscLazytrackerApiModelsCommonErrorResponse>({
      path: `/api/v1/teams/${teamKey}/projects/${projectKey}/members/${userId}`,
      method: "DELETE",
      ...params,
    });
  /**
   * @description Get all projects accessible to the user
   *
   * @tags Projects
   * @name V1ProjectsList
   * @request GET:/api/v1/projects
   */
  v1ProjectsList = (params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsProjectProjectResponse[],
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/projects`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Get recently accessed projects
   *
   * @tags Projects
   * @name V1ProjectsRecentList
   * @request GET:/api/v1/projects/recent
   */
  v1ProjectsRecentList = (
    query?: {
      /**
       * String
       * Maximum number of projects to return, defaults to 10
       */
      limit?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsProjectProjectResponse[],
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/projects/recent`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description Get all projects accessible to the user filtered by team key
   *
   * @tags Projects
   * @name V1ProjectsTeamDetail
   * @request GET:/api/v1/projects/team/{teamKey}
   */
  v1ProjectsTeamDetail = (teamKey: string, params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsProjectProjectResponse[],
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/projects/team/${teamKey}`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Get project by project key
   *
   * @tags Projects
   * @name V1ProjectsKeyList
   * @request GET:/api/v1/projects/key/{projectKey}/
   */
  v1ProjectsKeyList = (projectKey: string, params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsProjectProjectResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/projects/key/${projectKey}/`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Get current authenticated user information from JWT token
   *
   * @tags User Info
   * @name V1UserinfoList
   * @request GET:/api/v1/userinfo
   */
  v1UserinfoList = (params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsUserUserResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/userinfo`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Verify that the current user has system admin privileges. Returns 403 if not a system admin.
   *
   * @tags Admin
   * @name V1AdminVerifyList
   * @request GET:/api/v1/admin/verify
   */
  v1AdminVerifyList = (params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsCommonSuccessResponseKotlinCollectionsMapKotlinStringKotlinString,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/admin/verify`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Get all tickets from teams the current user belongs to. Supports filtering by type (ticket type) and releaseDate range (from/to).
   *
   * @tags Tickets
   * @name V1TicketsList
   * @request GET:/api/v1/tickets
   */
  v1TicketsList = (
    query?: {
      /**
       * String
       * Filter by ticket type: normal, release (optional)
       */
      type?: string;
      /**
       * String
       * Filter by releaseDate >= this date (YYYY-MM-DD, optional)
       */
      from?: string;
      /**
       * String
       * Filter by releaseDate <= this date (YYYY-MM-DD, optional)
       */
      to?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsTicketTicketResponse[],
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/tickets`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description Get all tickets for a specific team. Supports filtering by type (ticket type) and releaseDate range (from/to).
   *
   * @tags Tickets
   * @name V1TeamsTicketsList
   * @request GET:/api/v1/teams/{teamKey}/tickets
   */
  v1TeamsTicketsList = (
    teamKey: string,
    query?: {
      /**
       * String
       * Filter by ticket type: normal, release (optional)
       */
      type?: string;
      /**
       * String
       * Filter by releaseDate >= this date (YYYY-MM-DD, optional)
       */
      from?: string;
      /**
       * String
       * Filter by releaseDate <= this date (YYYY-MM-DD, optional)
       */
      to?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsTicketTicketResponse[],
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/tickets`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description Get all tickets for a specific project by team key and project key. Supports filtering by state, listType, assigneeId, type (ticket type), and releaseDate range (from/to).
   *
   * @tags Tickets
   * @name V1TeamsProjectsTicketsList
   * @request GET:/api/v1/teams/{teamKey}/projects/{projectKey}/tickets
   */
  v1TeamsProjectsTicketsList = (
    teamKey: string,
    projectKey: string,
    query?: {
      /**
       * String
       * Filter by ticket state (optional)
       */
      state?: string;
      /**
       * String
       * Filter by list type (optional)
       */
      listType?: string;
      /**
       * String
       * Filter by assignee ID (optional)
       */
      assigneeId?: string;
      /**
       * String
       * Filter by ticket type: normal, release (optional)
       */
      type?: string;
      /**
       * String
       * Filter by releaseDate >= this date (YYYY-MM-DD, optional)
       */
      from?: string;
      /**
       * String
       * Filter by releaseDate <= this date (YYYY-MM-DD, optional)
       */
      to?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsTicketTicketResponse[],
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/projects/${projectKey}/tickets`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description Create a new ticket in a project by team key and project key
   *
   * @tags Tickets
   * @name V1TeamsProjectsTicketsCreate
   * @request POST:/api/v1/teams/{teamKey}/projects/{projectKey}/tickets
   */
  v1TeamsProjectsTicketsCreate = (
    teamKey: string,
    projectKey: string,
    data: JpMkscLazytrackerApiModelsTicketTicketCreateRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsTicketTicketResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/projects/${projectKey}/tickets`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Get ticket by ticket number within a project
   *
   * @tags Tickets
   * @name V1TeamsProjectsTicketsByNumberDetail
   * @request GET:/api/v1/teams/{teamKey}/projects/{projectKey}/tickets/by-number/{ticketNumber}
   */
  v1TeamsProjectsTicketsByNumberDetail = (
    teamKey: string,
    projectKey: string,
    ticketNumber: string,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsTicketTicketResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/projects/${projectKey}/tickets/by-number/${ticketNumber}`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Get all tickets for a specific project
   *
   * @tags Tickets
   * @name V1ProjectsTicketsList
   * @request GET:/api/v1/projects/{projectId}/tickets
   */
  v1ProjectsTicketsList = (projectId: string, params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsTicketTicketResponse[],
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/projects/${projectId}/tickets`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Create a new ticket in a project
   *
   * @tags Tickets
   * @name V1ProjectsTicketsCreate
   * @request POST:/api/v1/projects/{projectId}/tickets
   */
  v1ProjectsTicketsCreate = (
    projectId: string,
    data: JpMkscLazytrackerApiModelsTicketTicketCreateRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsTicketTicketResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/projects/${projectId}/tickets`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Rebalance ticket positions in a project
   *
   * @tags Tickets
   * @name V1ProjectsRebalanceCreate
   * @request POST:/api/v1/projects/{projectId}/rebalance
   */
  v1ProjectsRebalanceCreate = (projectId: string, params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsTicketRebalanceResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/projects/${projectId}/rebalance`,
      method: "POST",
      format: "json",
      ...params,
    });
  /**
   * @description Get ticket by ID
   *
   * @tags Tickets
   * @name V1TicketsDetail
   * @request GET:/api/v1/tickets/{ticketId}
   */
  v1TicketsDetail = (ticketId: string, params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsTicketTicketResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/tickets/${ticketId}`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Update an existing ticket
   *
   * @tags Tickets
   * @name V1TicketsUpdate
   * @request PUT:/api/v1/tickets/{ticketId}
   */
  v1TicketsUpdate = (
    ticketId: string,
    data: JpMkscLazytrackerApiModelsTicketTicketUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsTicketTicketResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/tickets/${ticketId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Delete an existing ticket
   *
   * @tags Tickets
   * @name V1TicketsDelete
   * @request DELETE:/api/v1/tickets/{ticketId}
   */
  v1TicketsDelete = (ticketId: string, params: RequestParams = {}) =>
    this.request<void, JpMkscLazytrackerApiModelsCommonErrorResponse>({
      path: `/api/v1/tickets/${ticketId}`,
      method: "DELETE",
      ...params,
    });
  /**
   * @description Move ticket to different position/list
   *
   * @tags Tickets
   * @name V1TicketsMoveUpdate
   * @request PUT:/api/v1/tickets/{ticketId}/move
   */
  v1TicketsMoveUpdate = (
    ticketId: string,
    data: JpMkscLazytrackerApiModelsTicketTicketMoveRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsCommonSuccessResponseKotlinCollectionsMapKotlinStringKotlinString,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/tickets/${ticketId}/move`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Assign user to ticket
   *
   * @tags Tickets
   * @name V1TicketsAssigneesCreate
   * @request POST:/api/v1/tickets/{ticketId}/assignees
   */
  v1TicketsAssigneesCreate = (
    ticketId: string,
    data: JpMkscLazytrackerApiModelsTicketTicketAssignRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsCommonSuccessResponseKotlinCollectionsMapKotlinStringKotlinString,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/tickets/${ticketId}/assignees`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Unassign user from ticket
   *
   * @tags Tickets
   * @name V1TicketsAssigneesDelete
   * @request DELETE:/api/v1/tickets/{ticketId}/assignees/{assigneeId}
   */
  v1TicketsAssigneesDelete = (
    ticketId: string,
    assigneeId: string,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsCommonSuccessResponseKotlinCollectionsMapKotlinStringKotlinString,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/tickets/${ticketId}/assignees/${assigneeId}`,
      method: "DELETE",
      format: "json",
      ...params,
    });
  /**
   * @description Get all chats for a specific ticket
   *
   * @tags Chats
   * @name V1TicketsChatsList
   * @request GET:/api/v1/tickets/{ticketId}/chats
   */
  v1TicketsChatsList = (ticketId: string, params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsChatChatResponse[],
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/tickets/${ticketId}/chats`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Create a new chat message for a ticket
   *
   * @tags Chats
   * @name V1TicketsChatsCreate
   * @request POST:/api/v1/tickets/{ticketId}/chats
   */
  v1TicketsChatsCreate = (
    ticketId: string,
    data: JpMkscLazytrackerApiModelsChatChatCreateRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsChatChatResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/tickets/${ticketId}/chats`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Update a chat message
   *
   * @tags Chats
   * @name V1ChatsUpdate
   * @request PUT:/api/v1/chats/{chatId}
   */
  v1ChatsUpdate = (
    chatId: string,
    data: JpMkscLazytrackerApiModelsChatChatUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsChatChatResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/chats/${chatId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Delete a chat message
   *
   * @tags Chats
   * @name V1ChatsDelete
   * @request DELETE:/api/v1/chats/{chatId}
   */
  v1ChatsDelete = (chatId: string, params: RequestParams = {}) =>
    this.request<void, JpMkscLazytrackerApiModelsCommonErrorResponse>({
      path: `/api/v1/chats/${chatId}`,
      method: "DELETE",
      ...params,
    });
  /**
   * @description Get all tags for a specific project
   *
   * @tags Tags
   * @name V1TeamsProjectsTagsList
   * @request GET:/api/v1/teams/{teamKey}/projects/{projectKey}/tags
   */
  v1TeamsProjectsTagsList = (
    teamKey: string,
    projectKey: string,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsTagTagResponse[],
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/projects/${projectKey}/tags`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Create a new tag in a project
   *
   * @tags Tags
   * @name V1TeamsProjectsTagsCreate
   * @request POST:/api/v1/teams/{teamKey}/projects/{projectKey}/tags
   */
  v1TeamsProjectsTagsCreate = (
    teamKey: string,
    projectKey: string,
    data: JpMkscLazytrackerApiModelsTagTagCreateRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsTagTagResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/projects/${projectKey}/tags`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
}
