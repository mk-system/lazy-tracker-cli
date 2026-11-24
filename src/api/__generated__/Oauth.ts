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

import { HttpClient, RequestParams } from "./http-client.js";

export class Oauth<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @name DeviceList
   * @request GET:/oauth/device
   */
  deviceList = (params: RequestParams = {}) =>
    this.request<any, any>({
      path: `/oauth/device`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @name DeviceLoginCreate
   * @request POST:/oauth/device/login
   */
  deviceLoginCreate = (params: RequestParams = {}) =>
    this.request<any, any>({
      path: `/oauth/device/login`,
      method: "POST",
      ...params,
    });
  /**
   * No description
   *
   * @name DeviceVerifyCreate
   * @request POST:/oauth/device/verify
   */
  deviceVerifyCreate = (params: RequestParams = {}) =>
    this.request<any, any>({
      path: `/oauth/device/verify`,
      method: "POST",
      ...params,
    });
  /**
   * No description
   *
   * @name DeviceApproveCreate
   * @request POST:/oauth/device/approve
   */
  deviceApproveCreate = (params: RequestParams = {}) =>
    this.request<any, any>({
      path: `/oauth/device/approve`,
      method: "POST",
      ...params,
    });
  /**
   * No description
   *
   * @name DeviceDenyCreate
   * @request POST:/oauth/device/deny
   */
  deviceDenyCreate = (params: RequestParams = {}) =>
    this.request<any, any>({
      path: `/oauth/device/deny`,
      method: "POST",
      ...params,
    });
}
