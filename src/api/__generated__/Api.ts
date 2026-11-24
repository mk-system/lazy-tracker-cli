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
  JpMkscLazytrackerApiModelsActivityRecentProjectResponse,
  JpMkscLazytrackerApiModelsActivityRecentTeamResponse,
  JpMkscLazytrackerApiModelsAdminAdminBillingExemptUpdateRequest,
  JpMkscLazytrackerApiModelsAdminAdminTeamWithBillingResponse,
  JpMkscLazytrackerApiModelsBillingBillingAlertResponse,
  JpMkscLazytrackerApiModelsBillingBillingPortalSessionResponse,
  JpMkscLazytrackerApiModelsBillingCheckoutSessionResponse,
  JpMkscLazytrackerApiModelsBillingTeamBillingStatusResponse,
  JpMkscLazytrackerApiModelsBillingTeamNextInvoiceResponse,
  JpMkscLazytrackerApiModelsChatChatCreateRequest,
  JpMkscLazytrackerApiModelsChatChatResponse,
  JpMkscLazytrackerApiModelsChatChatUpdateRequest,
  JpMkscLazytrackerApiModelsCommonErrorResponse,
  JpMkscLazytrackerApiModelsCommonSuccessResponseJpMkscLazytrackerApiModelsCommonConstraintsResponse,
  JpMkscLazytrackerApiModelsCommonSuccessResponseJpMkscLazytrackerApiModelsCommonStatusResponse,
  JpMkscLazytrackerApiModelsCommonSuccessResponseKotlinCollectionsMapKotlinStringKotlinString,
  JpMkscLazytrackerApiModelsCommonSuccessResponseKotlinUnit,
  JpMkscLazytrackerApiModelsFavoriteFavoriteProjectResponse,
  JpMkscLazytrackerApiModelsFileConfirmUploadRequest,
  JpMkscLazytrackerApiModelsFileFileResponse,
  JpMkscLazytrackerApiModelsFilePresignedUploadRequest,
  JpMkscLazytrackerApiModelsFilePresignedUploadResponse,
  JpMkscLazytrackerApiModelsGithubGitHubDeviceFlowImportRequest,
  JpMkscLazytrackerApiModelsGithubGitHubDeviceFlowResponse,
  JpMkscLazytrackerApiModelsGithubGitHubImportJobResponse,
  JpMkscLazytrackerApiModelsGithubGitHubInitiateDeviceFlowRequest,
  JpMkscLazytrackerApiModelsGithubGitHubJobStatusResponse,
  JpMkscLazytrackerApiModelsOauthDeviceCodeRequest,
  JpMkscLazytrackerApiModelsOauthDeviceCodeResponse,
  JpMkscLazytrackerApiModelsOauthRevokeRequest,
  JpMkscLazytrackerApiModelsOauthTokenRequest,
  JpMkscLazytrackerApiModelsOauthTokenResponse,
  JpMkscLazytrackerApiModelsProjectProjectCreateByTeamKeyRequest,
  JpMkscLazytrackerApiModelsProjectProjectMemberAddRequest,
  JpMkscLazytrackerApiModelsProjectProjectMemberResponse,
  JpMkscLazytrackerApiModelsProjectProjectRepositoryAuthorizationResponse,
  JpMkscLazytrackerApiModelsProjectProjectRepositoryCandidatesResponse,
  JpMkscLazytrackerApiModelsProjectProjectRepositoryConnectRequest,
  JpMkscLazytrackerApiModelsProjectProjectRepositoryResponse,
  JpMkscLazytrackerApiModelsProjectProjectRepositoryStatusResponse,
  JpMkscLazytrackerApiModelsProjectProjectResponse,
  JpMkscLazytrackerApiModelsProjectProjectUpdateRequest,
  JpMkscLazytrackerApiModelsSearchProjectSearchResponse,
  JpMkscLazytrackerApiModelsTagTagCreateRequest,
  JpMkscLazytrackerApiModelsTagTagResponse,
  JpMkscLazytrackerApiModelsTagTagUpdateRequest,
  JpMkscLazytrackerApiModelsTeamAcceptInvitationResponse,
  JpMkscLazytrackerApiModelsTeamCreateInvitationRequest,
  JpMkscLazytrackerApiModelsTeamInvitationInfoResponse,
  JpMkscLazytrackerApiModelsTeamInvitationResponse,
  JpMkscLazytrackerApiModelsTeamTeamCreateRequest,
  JpMkscLazytrackerApiModelsTeamTeamMemberAddRequest,
  JpMkscLazytrackerApiModelsTeamTeamMemberResponse,
  JpMkscLazytrackerApiModelsTeamTeamMemberRoleUpdateRequest,
  JpMkscLazytrackerApiModelsTeamTeamResponse,
  JpMkscLazytrackerApiModelsTeamTeamStorageUsageResponse,
  JpMkscLazytrackerApiModelsTeamTransferOwnershipRequest,
  JpMkscLazytrackerApiModelsTicketBulkAssignRequest,
  JpMkscLazytrackerApiModelsTicketBulkDeleteRequest,
  JpMkscLazytrackerApiModelsTicketBulkMoveRequest,
  JpMkscLazytrackerApiModelsTicketBulkOperationResponse,
  JpMkscLazytrackerApiModelsTicketBulkUpdateTagsRequest,
  JpMkscLazytrackerApiModelsTicketRebalanceResponse,
  JpMkscLazytrackerApiModelsTicketTicketActivityResponse,
  JpMkscLazytrackerApiModelsTicketTicketAssignRequest,
  JpMkscLazytrackerApiModelsTicketTicketCreateRequest,
  JpMkscLazytrackerApiModelsTicketTicketExternalLinkCreateRequest,
  JpMkscLazytrackerApiModelsTicketTicketExternalLinkResponse,
  JpMkscLazytrackerApiModelsTicketTicketMoveRequest,
  JpMkscLazytrackerApiModelsTicketTicketResponse,
  JpMkscLazytrackerApiModelsTicketTicketUpdateRequest,
  JpMkscLazytrackerApiModelsUserAccountDeleteRequest,
  JpMkscLazytrackerApiModelsUserCompleteRegistrationRequest,
  JpMkscLazytrackerApiModelsUserEmailChangeConfirmRequest,
  JpMkscLazytrackerApiModelsUserEmailLookupRequest,
  JpMkscLazytrackerApiModelsUserEmailLookupResponse,
  JpMkscLazytrackerApiModelsUserEmailVerificationRequest,
  JpMkscLazytrackerApiModelsUserEmailVerifiedUpdateRequest,
  JpMkscLazytrackerApiModelsUserLoginResponse,
  JpMkscLazytrackerApiModelsUserPasswordResetConfirmRequest,
  JpMkscLazytrackerApiModelsUserPasswordResetRequest,
  JpMkscLazytrackerApiModelsUserPasswordUpdateRequest,
  JpMkscLazytrackerApiModelsUserResetPasswordResponse,
  JpMkscLazytrackerApiModelsUserSystemAdminUpdateRequest,
  JpMkscLazytrackerApiModelsUserUserAuthenticationRequest,
  JpMkscLazytrackerApiModelsUserUserRegistrationRequest,
  JpMkscLazytrackerApiModelsUserUserResponse,
  JpMkscLazytrackerApiModelsUserUserUpdateRequest,
  JpMkscLazytrackerCoreServicesProjectVelocityHistory,
} from "./data-contracts.js";
import { HttpClient, RequestParams } from "./http-client.js";

export class Api<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @name OptionsApi
   * @request OPTIONS:/api/v1/{...}
   */
  optionsApi = (params: RequestParams = {}) =>
    this.request<any, any>({
      path: `/api/v1/{...}`,
      method: "OPTIONS",
      ...params,
    });
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
      type: "application/json",
      format: "json",
      ...params,
    });
  /**
   * @description Look up the email address registered for a username, authenticated by that account's password. For users whose password manager only stored the username.
   *
   * @tags Authentication
   * @name V1AccountLookupEmailCreate
   * @request POST:/api/v1/account/lookup-email
   */
  v1AccountLookupEmailCreate = (
    data: JpMkscLazytrackerApiModelsUserEmailLookupRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsUserEmailLookupResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/account/lookup-email`,
      method: "POST",
      body: data,
      type: "application/json",
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
      type: "application/json",
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
      type: "application/json",
      format: "json",
      ...params,
    });
  /**
   * @description Send a password reset link to the given address. The response status and body do not depend on whether the address belongs to an account.
   *
   * @tags Authentication
   * @name V1AccountForgotPasswordCreate
   * @request POST:/api/v1/account/forgot-password
   */
  v1AccountForgotPasswordCreate = (
    data: JpMkscLazytrackerApiModelsUserPasswordResetRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsCommonSuccessResponseKotlinUnit,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/account/forgot-password`,
      method: "POST",
      body: data,
      type: "application/json",
      format: "json",
      ...params,
    });
  /**
   * @description Check whether a password reset token is still usable, before showing the input form.
   *
   * @tags Authentication
   * @name V1AccountVerifyResetTokenList
   * @request GET:/api/v1/account/verify-reset-token
   */
  v1AccountVerifyResetTokenList = (
    query?: {
      /**
       * String
       * Password reset token
       */
      token?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsCommonSuccessResponseKotlinUnit,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/account/verify-reset-token`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description Consume a password reset token and set a new password. The token is single use and any other unused token of the same account is invalidated together with it.
   *
   * @tags Authentication
   * @name V1AccountResetPasswordCreate
   * @request POST:/api/v1/account/reset-password
   */
  v1AccountResetPasswordCreate = (
    data: JpMkscLazytrackerApiModelsUserPasswordResetConfirmRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsCommonSuccessResponseKotlinUnit,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/account/reset-password`,
      method: "POST",
      body: data,
      type: "application/json",
      format: "json",
      ...params,
    });
  /**
   * @description Consume an email change token and switch the account to the new address. Requires the session of the account the token was issued for: opening the link alone does not change anything. The address is not changed until this endpoint is called.
   *
   * @tags Authentication
   * @name V1AccountConfirmEmailChangeCreate
   * @request POST:/api/v1/account/confirm-email-change
   */
  v1AccountConfirmEmailChangeCreate = (
    data: JpMkscLazytrackerApiModelsUserEmailChangeConfirmRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsCommonSuccessResponseKotlinUnit,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/account/confirm-email-change`,
      method: "POST",
      body: data,
      type: "application/json",
      format: "json",
      ...params,
    });
  /**
   * @description Permanently delete the signed-in user's own account. The request must carry the account's email address as confirmation (exact match). Team owners and system administrators are refused. On success the auth cookies are cleared.
   *
   * @tags Users
   * @name V1AccountDeleteCreate
   * @request POST:/api/v1/account/delete
   */
  v1AccountDeleteCreate = (
    data: JpMkscLazytrackerApiModelsUserAccountDeleteRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsCommonSuccessResponseKotlinUnit,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/account/delete`,
      method: "POST",
      body: data,
      type: "application/json",
      format: "json",
      ...params,
    });
  /**
   * @description Log out the current user by clearing authentication cookies and revoking the current session. Other sessions of the user stay valid.
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
   * @description Readiness of the API. Returns 200 only when the API can also reach the database, and 503 with DATABASE_UNAVAILABLE otherwise. Intended for external uptime monitoring; the ALB health check does not look at this path, so a database outage does not take the only task out of service
   *
   * @tags Status
   * @name V1StatusList
   * @request GET:/api/v1/status
   */
  v1StatusList = (params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsCommonSuccessResponseJpMkscLazytrackerApiModelsCommonStatusResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/status`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Get the input constraints enforced by the server, so clients can validate input with the same rules.
   *
   * @tags Constraints
   * @name V1ConstraintsList
   * @request GET:/api/v1/constraints
   */
  v1ConstraintsList = (params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsCommonSuccessResponseJpMkscLazytrackerApiModelsCommonConstraintsResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/constraints`,
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
   * @tags Oauth
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
      type: "application/json",
      format: "json",
      ...params,
    });
  /**
   * @description Exchange device code or refresh token for access token.
   *
   * @tags Oauth
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
      type: "application/json",
      format: "json",
      ...params,
    });
  /**
   * @description Revoke an access token or refresh token.
   *
   * @tags Oauth
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
      type: "application/json",
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @name V1WebhooksStripeCreate
   * @request POST:/api/v1/webhooks/stripe
   */
  v1WebhooksStripeCreate = (params: RequestParams = {}) =>
    this.request<any, any>({
      path: `/api/v1/webhooks/stripe`,
      method: "POST",
      ...params,
    });
  /**
   * No description
   *
   * @name V1WebhooksGithubCreate
   * @request POST:/api/v1/webhooks/github
   */
  v1WebhooksGithubCreate = (params: RequestParams = {}) =>
    this.request<any, any>({
      path: `/api/v1/webhooks/github`,
      method: "POST",
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
      type: "application/json",
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
   * @description Update user information. A new email address is not applied here: a confirmation link is sent to it and the change takes effect only through POST /api/v1/account/confirm-email-change.
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
      type: "application/json",
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
   * @description Reset user password and generate temporary password (admin only). Rejected with error code CANNOT_RESET_OWN_PASSWORD when the target is the caller.
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
   * @description Force logout: revoke every login session, OAuth token, pending device authorization, pending email change and unused password reset token of the user (admin only)
   *
   * @tags Users
   * @name V1UsersRevokeSessionsCreate
   * @request POST:/api/v1/users/{id}/revoke-sessions
   */
  v1UsersRevokeSessionsCreate = (id: string, params: RequestParams = {}) =>
    this.request<void, JpMkscLazytrackerApiModelsCommonErrorResponse>({
      path: `/api/v1/users/${id}/revoke-sessions`,
      method: "POST",
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
      type: "application/json",
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
      type: "application/json",
      format: "json",
      ...params,
    });
  /**
   * @description Update user password; the current password is required. Also revokes the user's OAuth tokens, pending device authorizations, pending email change and unused password reset tokens. With cookie authentication the current session stays valid and the other login sessions are revoked; with OAuth authentication all login sessions are revoked.
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
      type: "application/json",
      ...params,
    });
  /**
   * @description Get all teams accessible to the user
   *
   * @tags Teams
   * @name V1TeamsList
   * @request GET:/api/v1/teams/
   */
  v1TeamsList = (params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsTeamTeamResponse[],
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Create a new team
   *
   * @tags Teams
   * @name V1TeamsCreate
   * @request POST:/api/v1/teams/
   */
  v1TeamsCreate = (
    data: JpMkscLazytrackerApiModelsTeamTeamCreateRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsTeamTeamResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/`,
      method: "POST",
      body: data,
      type: "application/json",
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
   * @name V1TeamsList2
   * @request GET:/api/v1/teams/{teamKey}/
   * @originalName v1TeamsList
   * @duplicate
   */
  v1TeamsList2 = (teamKey: string, params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsTeamTeamResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/`,
      method: "GET",
      format: "json",
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
   * @description Delete a team. Team must not have any projects, nor a live Stripe subscription.
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
      type: "application/json",
      format: "json",
      ...params,
    });
  /**
   * @description Get the attachment storage usage and limit of a team
   *
   * @tags Teams
   * @name V1TeamsStorageList
   * @request GET:/api/v1/teams/{teamKey}/storage
   */
  v1TeamsStorageList = (teamKey: string, params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsTeamTeamStorageUsageResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/storage`,
      method: "GET",
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
      type: "application/json",
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
      type: "application/json",
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
   * @description Transfer team ownership to another member. Only the current owner can perform this action.
   *
   * @tags Teams
   * @name V1TeamsOwnerTransferCreate
   * @request POST:/api/v1/teams/{teamKey}/owner/transfer
   */
  v1TeamsOwnerTransferCreate = (
    teamKey: string,
    data: JpMkscLazytrackerApiModelsTeamTransferOwnershipRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsTeamTeamResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/owner/transfer`,
      method: "POST",
      body: data,
      type: "application/json",
      format: "json",
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
      type: "application/json",
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
      type: "application/json",
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
      type: "application/json",
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
   * @description Get recent projects the user has interacted with
   *
   * @tags Activities
   * @name V1ActivitiesRecentProjectsList
   * @request GET:/api/v1/activities/recent-projects
   */
  v1ActivitiesRecentProjectsList = (
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
      JpMkscLazytrackerApiModelsActivityRecentProjectResponse[],
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/activities/recent-projects`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description Get recent teams the user has interacted with
   *
   * @tags Activities
   * @name V1ActivitiesRecentTeamsList
   * @request GET:/api/v1/activities/recent-teams
   */
  v1ActivitiesRecentTeamsList = (
    query?: {
      /**
       * String
       * Maximum number of teams to return, defaults to 10
       */
      limit?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsActivityRecentTeamResponse[],
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/activities/recent-teams`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description Get the current user's favorite projects
   *
   * @tags Favorites
   * @name V1FavoritesProjectsList
   * @request GET:/api/v1/favorites/projects
   */
  v1FavoritesProjectsList = (params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsFavoriteFavoriteProjectResponse[],
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/favorites/projects`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Add a project to the current user's favorites
   *
   * @tags Favorites
   * @name V1FavoritesProjectsCreate
   * @request POST:/api/v1/favorites/projects/{projectId}
   */
  v1FavoritesProjectsCreate = (projectId: string, params: RequestParams = {}) =>
    this.request<void, JpMkscLazytrackerApiModelsCommonErrorResponse>({
      path: `/api/v1/favorites/projects/${projectId}`,
      method: "POST",
      ...params,
    });
  /**
   * @description Remove a project from the current user's favorites
   *
   * @tags Favorites
   * @name V1FavoritesProjectsDelete
   * @request DELETE:/api/v1/favorites/projects/{projectId}
   */
  v1FavoritesProjectsDelete = (projectId: string, params: RequestParams = {}) =>
    this.request<void, JpMkscLazytrackerApiModelsCommonErrorResponse>({
      path: `/api/v1/favorites/projects/${projectId}`,
      method: "DELETE",
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
   * @description Verify that the current user has system admin privileges. Returns 404 if not a system admin (unified with resource-not-found responses to avoid information disclosure).
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
   * @description Get all teams in the system (admin only)
   *
   * @tags Admin
   * @name V1AdminTeamsList
   * @request GET:/api/v1/admin/teams
   */
  v1AdminTeamsList = (params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsTeamTeamResponse[],
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/admin/teams`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Get all teams with billing status and payable seat count (admin only)
   *
   * @tags Admin
   * @name V1AdminTeamsWithBillingList
   * @request GET:/api/v1/admin/teams/with-billing
   */
  v1AdminTeamsWithBillingList = (params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsAdminAdminTeamWithBillingResponse[],
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/admin/teams/with-billing`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Update a team's billing exemption flag (admin only). Exempt teams bypass billing gates and are not moved to read_only by the launch migration.
   *
   * @tags Admin
   * @name V1AdminTeamsBillingExemptPartialUpdate
   * @request PATCH:/api/v1/admin/teams/{teamKey}/billing-exempt
   */
  v1AdminTeamsBillingExemptPartialUpdate = (
    teamKey: string,
    data: JpMkscLazytrackerApiModelsAdminAdminBillingExemptUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsAdminAdminTeamWithBillingResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/admin/teams/${teamKey}/billing-exempt`,
      method: "PATCH",
      body: data,
      type: "application/json",
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
   * @description Get all tickets for a specific project by team key and project key. Supports filtering by state, listType, assigneeId, type (ticket type), and releaseDate range (from/to). Done tickets are limited to the most recent iterations by default (see doneWeeks).
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
      /**
       * String
       * Number of iterations (weeks with done tickets, newest first, Monday start in the project time zone) to include from the done list. Defaults to 2, 0 means no limit. Done tickets without acceptedAt are always included (optional)
       */
      doneWeeks?: string;
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
      type: "application/json",
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
   * @description Update tags for multiple tickets at once. Can add and/or remove tags in a single operation.
   *
   * @tags Tickets
   * @name V1TeamsProjectsTicketsBulkUpdateTagsCreate
   * @request POST:/api/v1/teams/{teamKey}/projects/{projectKey}/tickets/bulk/update-tags
   */
  v1TeamsProjectsTicketsBulkUpdateTagsCreate = (
    teamKey: string,
    projectKey: string,
    data: JpMkscLazytrackerApiModelsTicketBulkUpdateTagsRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsTicketBulkOperationResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/projects/${projectKey}/tickets/bulk/update-tags`,
      method: "POST",
      body: data,
      type: "application/json",
      format: "json",
      ...params,
    });
  /**
   * @description Delete multiple tickets at once
   *
   * @tags Tickets
   * @name V1TeamsProjectsTicketsBulkDeleteCreate
   * @request POST:/api/v1/teams/{teamKey}/projects/{projectKey}/tickets/bulk/delete
   */
  v1TeamsProjectsTicketsBulkDeleteCreate = (
    teamKey: string,
    projectKey: string,
    data: JpMkscLazytrackerApiModelsTicketBulkDeleteRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsTicketBulkOperationResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/projects/${projectKey}/tickets/bulk/delete`,
      method: "POST",
      body: data,
      type: "application/json",
      format: "json",
      ...params,
    });
  /**
   * @description Move multiple tickets to a different list type and/or state at once
   *
   * @tags Tickets
   * @name V1TeamsProjectsTicketsBulkMoveCreate
   * @request POST:/api/v1/teams/{teamKey}/projects/{projectKey}/tickets/bulk/move
   */
  v1TeamsProjectsTicketsBulkMoveCreate = (
    teamKey: string,
    projectKey: string,
    data: JpMkscLazytrackerApiModelsTicketBulkMoveRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsTicketBulkOperationResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/projects/${projectKey}/tickets/bulk/move`,
      method: "POST",
      body: data,
      type: "application/json",
      format: "json",
      ...params,
    });
  /**
   * @description Assign a user to multiple tickets at once
   *
   * @tags Tickets
   * @name V1TeamsProjectsTicketsBulkAssignCreate
   * @request POST:/api/v1/teams/{teamKey}/projects/{projectKey}/tickets/bulk/assign
   */
  v1TeamsProjectsTicketsBulkAssignCreate = (
    teamKey: string,
    projectKey: string,
    data: JpMkscLazytrackerApiModelsTicketBulkAssignRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsTicketBulkOperationResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/projects/${projectKey}/tickets/bulk/assign`,
      method: "POST",
      body: data,
      type: "application/json",
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
      type: "application/json",
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
      type: "application/json",
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
   * @description Get activity log (operation history) for a specific ticket
   *
   * @tags Tickets
   * @name V1TicketsActivitiesList
   * @request GET:/api/v1/tickets/{ticketId}/activities
   */
  v1TicketsActivitiesList = (ticketId: string, params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsTicketTicketActivityResponse[],
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/tickets/${ticketId}/activities`,
      method: "GET",
      format: "json",
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
      type: "application/json",
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
      type: "application/json",
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
      type: "application/json",
      format: "json",
      ...params,
    });
  /**
   * @description Update an existing tag
   *
   * @tags Tags
   * @name V1TeamsProjectsTagsUpdate
   * @request PUT:/api/v1/teams/{teamKey}/projects/{projectKey}/tags/{tagId}
   */
  v1TeamsProjectsTagsUpdate = (
    teamKey: string,
    projectKey: string,
    tagId: string,
    data: JpMkscLazytrackerApiModelsTagTagUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsTagTagResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/projects/${projectKey}/tags/${tagId}`,
      method: "PUT",
      body: data,
      type: "application/json",
      format: "json",
      ...params,
    });
  /**
   * @description Delete a tag from a project
   *
   * @tags Tags
   * @name V1TeamsProjectsTagsDelete
   * @request DELETE:/api/v1/teams/{teamKey}/projects/{projectKey}/tags/{tagId}
   */
  v1TeamsProjectsTagsDelete = (
    teamKey: string,
    projectKey: string,
    tagId: string,
    params: RequestParams = {},
  ) =>
    this.request<void, JpMkscLazytrackerApiModelsCommonErrorResponse>({
      path: `/api/v1/teams/${teamKey}/projects/${projectKey}/tags/${tagId}`,
      method: "DELETE",
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
      type: "application/json",
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
      type: "application/json",
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
   * @description List GitHub pull requests linked to a ticket, oldest first. title and status are null until they are fetched from GitHub. Returns 404 when the ticket does not exist or is not accessible.
   *
   * @tags Tickets
   * @name V1TicketsLinksList
   * @request GET:/api/v1/tickets/{ticketId}/links
   */
  v1TicketsLinksList = (ticketId: string, params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsTicketTicketExternalLinkResponse[],
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/tickets/${ticketId}/links`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Link a GitHub pull request to a ticket by its URL (https://github.com/{owner}/{repo}/pull/{number}; subpaths, query and fragment are ignored). GitHub is not contacted, so title and status are null. Returns 400 VALIDATION_ERROR (details.field = url) for a non pull request URL, 409 DUPLICATE_KEY when the pull request is already linked to the ticket, and 404 when the ticket does not exist or is not writable.
   *
   * @tags Tickets
   * @name V1TicketsLinksCreate
   * @request POST:/api/v1/tickets/{ticketId}/links
   */
  v1TicketsLinksCreate = (
    ticketId: string,
    data: JpMkscLazytrackerApiModelsTicketTicketExternalLinkCreateRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsTicketTicketExternalLinkResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/tickets/${ticketId}/links`,
      method: "POST",
      body: data,
      type: "application/json",
      format: "json",
      ...params,
    });
  /**
   * @description Unlink a pull request from a ticket. Returns 404 when the link does not exist or belongs to another ticket.
   *
   * @tags Tickets
   * @name V1TicketsLinksDelete
   * @request DELETE:/api/v1/tickets/{ticketId}/links/{linkId}
   */
  v1TicketsLinksDelete = (
    ticketId: string,
    linkId: string,
    params: RequestParams = {},
  ) =>
    this.request<void, JpMkscLazytrackerApiModelsCommonErrorResponse>({
      path: `/api/v1/tickets/${ticketId}/links/${linkId}`,
      method: "DELETE",
      ...params,
    });
  /**
   * @description Search tickets inside a project by ticket title, ticket description, chat message body and linked pull requests (`123`, `#123`, `owner/repo#123`, pull request title). Text matching is case-insensitive substring matching; `q` must be 2..200 characters (400 otherwise). `limit` counts distinct matching tickets and applies separately to ticket matches, chat-only matches and pull-request-only matches, so up to 3x `limit` tickets can be returned; it is clamped to 1..200 and defaults to 50. `truncated` is true when any side had more matching tickets than the limit. `chatSnippet` carries the newest matching chat message around the match and is null when the chat did not match.
   *
   * @tags Search
   * @name V1TeamsProjectsSearchList
   * @request GET:/api/v1/teams/{teamKey}/projects/{projectKey}/search
   */
  v1TeamsProjectsSearchList = (
    teamKey: string,
    projectKey: string,
    query?: {
      /**
       * String
       * Search text (2..200 characters)
       */
      q?: string;
      /**
       * String
       * Maximum number of matching tickets, defaults to 50
       */
      limit?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsSearchProjectSearchResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/projects/${projectKey}/search`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description Get a presigned URL for uploading a file to the resource
   *
   * @tags Files
   * @name V1TicketsFilesPresignedUploadCreate
   * @request POST:/api/v1/tickets/{ticketId}/files/presigned-upload
   */
  v1TicketsFilesPresignedUploadCreate = (
    ticketId: string,
    data: JpMkscLazytrackerApiModelsFilePresignedUploadRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsFilePresignedUploadResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/tickets/${ticketId}/files/presigned-upload`,
      method: "POST",
      body: data,
      type: "application/json",
      format: "json",
      ...params,
    });
  /**
   * @description Get a presigned URL for uploading a file to the resource
   *
   * @tags Files
   * @name V1ProjectsFilesPresignedUploadCreate
   * @request POST:/api/v1/projects/{projectId}/files/presigned-upload
   */
  v1ProjectsFilesPresignedUploadCreate = (
    projectId: string,
    data: JpMkscLazytrackerApiModelsFilePresignedUploadRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsFilePresignedUploadResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/projects/${projectId}/files/presigned-upload`,
      method: "POST",
      body: data,
      type: "application/json",
      format: "json",
      ...params,
    });
  /**
   * @description Get status of GitHub import job
   *
   * @tags GitHub Integration
   * @name V1ProjectsGithubImportJobsDetail
   * @request GET:/api/v1/projects/{projectId}/github/import/jobs/{jobId}
   */
  v1ProjectsGithubImportJobsDetail = (
    projectId: string,
    jobId: string,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsGithubGitHubJobStatusResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/projects/${projectId}/github/import/jobs/${jobId}`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Initiate GitHub Device Flow for issue import
   *
   * @tags GitHub Integration
   * @name V1ProjectsGithubImportInitiateDeviceFlowCreate
   * @request POST:/api/v1/projects/{projectId}/github/import/initiate-device-flow
   */
  v1ProjectsGithubImportInitiateDeviceFlowCreate = (
    projectId: string,
    data: JpMkscLazytrackerApiModelsGithubGitHubInitiateDeviceFlowRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsGithubGitHubDeviceFlowResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/projects/${projectId}/github/import/initiate-device-flow`,
      method: "POST",
      body: data,
      type: "application/json",
      format: "json",
      ...params,
    });
  /**
   * @description Submit GitHub issue import job for background processing
   *
   * @tags GitHub Integration
   * @name V1ProjectsGithubImportSubmitCreate
   * @request POST:/api/v1/projects/{projectId}/github/import/submit
   */
  v1ProjectsGithubImportSubmitCreate = (
    projectId: string,
    data: JpMkscLazytrackerApiModelsGithubGitHubDeviceFlowImportRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsGithubGitHubImportJobResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/projects/${projectId}/github/import/submit`,
      method: "POST",
      body: data,
      type: "application/json",
      format: "json",
      ...params,
    });
  /**
   * @description Get the GitHub repository connected to the project. repository is null when nothing is connected; app_enabled is false when the GitHub App is not configured.
   *
   * @tags GitHub Integration
   * @name V1ProjectsRepositoryList
   * @request GET:/api/v1/projects/{projectId}/repository/
   */
  v1ProjectsRepositoryList = (projectId: string, params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsProjectProjectRepositoryStatusResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/projects/${projectId}/repository/`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Connect one of the candidates to the project, replacing the current one. 409 GITHUB_AUTHORIZATION_EXPIRED when the session is unknown or expired; 422 GITHUB_REPOSITORY_NOT_ALLOWED when the repository is not a candidate; 502 GITHUB_UNAVAILABLE; 409 DUPLICATE_KEY (details.field = repository) when another project has it. The session ends once connected.
   *
   * @tags GitHub Integration
   * @name V1ProjectsRepositoryUpdate
   * @request PUT:/api/v1/projects/{projectId}/repository/
   */
  v1ProjectsRepositoryUpdate = (
    projectId: string,
    data: JpMkscLazytrackerApiModelsProjectProjectRepositoryConnectRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsProjectProjectRepositoryResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/projects/${projectId}/repository/`,
      method: "PUT",
      body: data,
      type: "application/json",
      format: "json",
      ...params,
    });
  /**
   * @description Disconnect the repository. GitHub data (title / status) of the project's links is cleared.
   *
   * @tags GitHub Integration
   * @name V1ProjectsRepositoryDelete
   * @request DELETE:/api/v1/projects/{projectId}/repository/
   */
  v1ProjectsRepositoryDelete = (
    projectId: string,
    params: RequestParams = {},
  ) =>
    this.request<void, JpMkscLazytrackerApiModelsCommonErrorResponse>({
      path: `/api/v1/projects/${projectId}/repository/`,
      method: "DELETE",
      ...params,
    });
  /**
   * @description Start the GitHub App user authorization for connecting a repository. Navigate the browser to authorize_url; GitHub returns to the API's callback, which redirects to the project settings page with #repositoryConnect=<session> in the URL fragment (or ?repositoryConnectError=<reason>). The authorization expires in 10 minutes.
   *
   * @tags GitHub Integration
   * @name V1ProjectsRepositoryAuthorizationCreate
   * @request POST:/api/v1/projects/{projectId}/repository/authorization
   */
  v1ProjectsRepositoryAuthorizationCreate = (
    projectId: string,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsProjectProjectRepositoryAuthorizationResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/projects/${projectId}/repository/authorization`,
      method: "POST",
      format: "json",
      ...params,
    });
  /**
   * @description List the repositories the authorized GitHub user can connect: those with the GitHub App installed on which the user has push permission. 409 GITHUB_AUTHORIZATION_EXPIRED when the session is unknown or expired; 502 GITHUB_UNAVAILABLE.
   *
   * @tags GitHub Integration
   * @name V1ProjectsRepositoryCandidatesList
   * @request GET:/api/v1/projects/{projectId}/repository/candidates
   */
  v1ProjectsRepositoryCandidatesList = (
    projectId: string,
    query?: {
      /**
       * String
       * The repositoryConnect value from the settings page URL fragment
       */
      session?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsProjectProjectRepositoryCandidatesResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/projects/${projectId}/repository/candidates`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  /**
   * @description Confirm that a file has been uploaded successfully
   *
   * @tags Files
   * @name V1FilesConfirmCreate
   * @request POST:/api/v1/files/confirm
   */
  v1FilesConfirmCreate = (
    data: JpMkscLazytrackerApiModelsFileConfirmUploadRequest,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsFileFileResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/files/confirm`,
      method: "POST",
      body: data,
      type: "application/json",
      format: "json",
      ...params,
    });
  /**
   * @description Delete a file
   *
   * @tags Files
   * @name V1FilesDelete
   * @request DELETE:/api/v1/files/{id}
   */
  v1FilesDelete = (id: string, params: RequestParams = {}) =>
    this.request<void, JpMkscLazytrackerApiModelsCommonErrorResponse>({
      path: `/api/v1/files/${id}`,
      method: "DELETE",
      ...params,
    });
  /**
   * @description List teams the current user owns or administers that are read_only due to billing (purchase guidance after login).
   *
   * @tags Billing
   * @name V1BillingAlertsList
   * @request GET:/api/v1/billing/alerts
   */
  v1BillingAlertsList = (params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsBillingBillingAlertResponse[],
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/billing/alerts`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Get billing status of the team. cancel_at_period_end tells whether the subscription is scheduled to end at current_period_end; Stripe keeps the status active until then. seat_total_amount is payable_seat_count x unit_amount for one billing interval, derived from the current price in env rather than from the team's own contract. It is NOT a confirmed next invoice amount: tax, discounts, proration, a scheduled cancellation, unpaid invoices and grandfathered prices are all ignored, so do not present it as the amount that will be charged. Use it only as a pre-purchase estimate for teams without a contract; for a team that has one, read the confirmed amount from GET /teams/{teamKey}/billing/next-invoice. Null when billing does not apply (exempt team or no payable seats) or the price lookup failed.
   *
   * @tags Billing
   * @name V1TeamsBillingStatusList
   * @request GET:/api/v1/teams/{teamKey}/billing/status
   */
  v1TeamsBillingStatusList = (teamKey: string, params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsBillingTeamBillingStatusResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/billing/status`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Get the amount Stripe will actually charge the team, computed from its own subscription. Unlike seat_total_amount of /billing/status, tax, discounts, proration and the price the team is actually on are all reflected, so it can be presented as the next invoice amount. state tells why amounts are absent: no_upcoming (cancellation scheduled or contract ended), not_subscribed (no contract; fall back to the estimate in /billing/status) or unavailable (Stripe lookup failed). unpaid_amount is the total left on open invoices and is what has to be paid first when present - it is not part of the next invoice. unpaid_invoice_url is a Stripe-hosted payment page that needs no further authentication, so it is only returned to team owners/admins and system admins, matching the authorization of the portal-session endpoint; other members get the amount without the link.
   *
   * @tags Billing
   * @name V1TeamsBillingNextInvoiceList
   * @request GET:/api/v1/teams/{teamKey}/billing/next-invoice
   */
  v1TeamsBillingNextInvoiceList = (
    teamKey: string,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsBillingTeamNextInvoiceResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/billing/next-invoice`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Create a Stripe Checkout Session for the team's paid plan. Team owner or admin only.
   *
   * @tags Billing
   * @name V1TeamsBillingCheckoutSessionCreate
   * @request POST:/api/v1/teams/{teamKey}/billing/checkout-session
   */
  v1TeamsBillingCheckoutSessionCreate = (
    teamKey: string,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsBillingCheckoutSessionResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/billing/checkout-session`,
      method: "POST",
      format: "json",
      ...params,
    });
  /**
   * @description Create a Stripe Billing Portal Session for the team. Team owner or admin only.
   *
   * @tags Billing
   * @name V1TeamsBillingPortalSessionCreate
   * @request POST:/api/v1/teams/{teamKey}/billing/portal-session
   */
  v1TeamsBillingPortalSessionCreate = (
    teamKey: string,
    params: RequestParams = {},
  ) =>
    this.request<
      JpMkscLazytrackerApiModelsBillingBillingPortalSessionResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/billing/portal-session`,
      method: "POST",
      format: "json",
      ...params,
    });
  /**
   * @description Re-read the team's subscription from Stripe and return the refreshed billing status. Team owner or admin only. Intended for the return from the Billing Portal, where a scheduled cancellation only reaches this service through the customer.subscription.updated webhook and the page cannot wait for it. Only cancel_at_period_end is pulled; billing_status transitions stay owned by the webhook. The response body is identical to GET /teams/{teamKey}/billing/status.
   *
   * @tags Billing
   * @name V1TeamsBillingRefreshCreate
   * @request POST:/api/v1/teams/{teamKey}/billing/refresh
   */
  v1TeamsBillingRefreshCreate = (teamKey: string, params: RequestParams = {}) =>
    this.request<
      JpMkscLazytrackerApiModelsBillingTeamBillingStatusResponse,
      JpMkscLazytrackerApiModelsCommonErrorResponse
    >({
      path: `/api/v1/teams/${teamKey}/billing/refresh`,
      method: "POST",
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @name V1GithubOauthCallbackList
   * @request GET:/api/v1/github/oauth/callback
   */
  v1GithubOauthCallbackList = (params: RequestParams = {}) =>
    this.request<any, any>({
      path: `/api/v1/github/oauth/callback`,
      method: "GET",
      ...params,
    });
}
