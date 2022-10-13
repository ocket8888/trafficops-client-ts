/**
 * @license Apache-2.0
 *
 * Copyright 2022 ocket8888
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import type { APICapability, APIResponse, Capability } from "trafficops-types";

import { APIError } from "./api.error.js";
import type { PaginationParams } from "./util";

import type { Client } from "./index";

/**
 * Options that affect the result set returned by {@link getAPICapabilities}.
 */
type APICapabilityParams = {
	/**
	 * Filters results to only the APICapabilities that relate to the Capability
	 * with this name.
	 */
	capability?: string;
};

/**
 * Gets all associations between legacy "Capabilities" (not to be confused with
 * "server capabilities") and API methods and endpoints.
 *
 * @deprecated The information exposed by this method is not in any way enforced
 * by Traffic Ops, and has been removed from the latest version of the API in
 * favor of "Permissions" of Roles.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param params Any and all optional settings to use in the request.
 * @returns The server's response.
 */
export async function getAPICapabilities(this: Client, params?: APICapabilityParams): Promise<APIResponse<Array<APICapability>>> {
	return (await this.apiGet<APIResponse<Array<APICapability>>>("api_capabilities", params)).data;
}

/**
 * Options that affect the result set returned by {@link getCapabilities}.
 */
type CapabilityParams = PaginationParams & {
	/**
	 * Filter results to only the Capabilities that have this name.
	 */
	name?: string;
	/**
	 * Sets the field by which results are ordered.
	 *
	 * @default "name"
	 */
	orderby?: "name";
};

/**
 * Retrieves legacy "Capabilities" (not to be confused with "server
 * capabilities").
 *
 * @deprecated The information exposed by this method is not in any way enforced
 * by Traffic Ops, and has been removed from the latest version of the API in
 * favor of "Permissions" of Roles.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param params Any and all optional settings to use in the request.
 * @returns The server's response.
 */
export async function getCapabilities(this: Client, params?: CapabilityParams): Promise<APIResponse<Array<Capability>>>;
/**
 * Retrieves a legacy "Capability" (not to be confused with a "server
 * capability").
 *
 * @deprecated The information exposed by this method is not in any way enforced
 * by Traffic Ops, and has been removed from the latest version of the API in
 * favor of "Permissions" of Roles.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param name The name of a single Capability which will be returned (if it
 * exists).
 * @param params Any and all optional settings to use in the request.
 * @returns The server's response.
 * @throws {APIError} when zero or more than one results are returned by Traffic
 * Ops.
 */
export async function getCapabilities(this: Client, name: string, params?: CapabilityParams): Promise<APIResponse<Capability>>;
/**
 * Retrieves legacy "Capabilities" (not to be confused with "server
 * capabilities").
 *
 * @deprecated The information exposed by this method is not in any way enforced
 * by Traffic Ops, and has been removed from the latest version of the API in
 * favor of "Permissions" of Roles.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param nameOrParams Either the name of a single Capability which will be
 * returned (if it exists) or optional settings to use in the request for
 * multiple "Capabilities".
 * @param params Any and all optional settings to use in the request. This is
 * ignored if options were passed in `nameOrParams`.
 * @returns The server's response.
 * @throws {APIError} when a single Capability is requested by name but zero or
 * more than one results are returned by Traffic Ops.
 */
export async function getCapabilities(
	this: Client,
	nameOrParams?: CapabilityParams | string,
	params?: CapabilityParams
): Promise<APIResponse<Array<Capability> | Capability>> {
	let p;
	let single = false;
	if (typeof(nameOrParams) === "string") {
		p = {...params, name: nameOrParams};
		single = true;
	} else {
		p = nameOrParams;
	}
	const resp = await this.apiGet<APIResponse<Array<Capability>>>("capabilities", p);
	if (single) {
		const len = resp.data.response?.length;
		if (len !== 1) {
			throw new APIError(`requesting a Capability by name '${nameOrParams}' yielded ${len} results`, resp.status, resp.headers);
		}
		return {...resp.data, response: resp.data.response[0]};
	}
	return resp.data;
}
