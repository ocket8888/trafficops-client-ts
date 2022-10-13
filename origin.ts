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
import type { APIResponse, RequestOrigin, RequestOriginResponse, ResponseOrigin } from "trafficops-types";

import { ClientError } from "./api.error.js";
import { getSingleResponse, type PaginationParams } from "./util.js";

import type { Client } from "./index";

/**
 * Optional settings that affect the behavior/output of {@link getOrigins}.
 */
type OriginParams = PaginationParams & {
	id?: number;
	name?: string;
};

/**
 * Retrieves exactly one Origin from Traffic Ops.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param id The ID of the single Origin to retrieve.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getOrigins(this: Client, id: number, params?: OriginParams): Promise<APIResponse<ResponseOrigin>>;
/**
 * Retrieves Origins from Traffic Ops.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getOrigins(this: Client, params?: OriginParams): Promise<APIResponse<Array<ResponseOrigin>>>;
/**
 * Retrieves one or more Origins from Traffic Ops.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param idOrParams Either the ID of a single Origin to retrieve, or any and
 * all optional settings for requesting multiple.
 * @param params Any and all optional settings for the request. This is ignored
 * if `idOrParams` is not an ID.
 * @returns The server's response.
 */
export async function getOrigins(
	this: Client,
	idOrParams?: number | OriginParams,
	params?: OriginParams
): Promise<APIResponse<ResponseOrigin | Array<ResponseOrigin>>> {
	if (typeof(idOrParams) === "number") {
		const response = await this.apiGet<APIResponse<[ResponseOrigin]>>("origins", {...params, id: idOrParams});
		return getSingleResponse(response, "Origin", idOrParams);
	}
	return (await this.apiGet<APIResponse<Array<ResponseOrigin>>>("origins", idOrParams)).data;
}

/**
 * Creates a new Origin.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param origin The Origin to be created.
 * @returns The server's response.
 */
export async function createOrigin(this: Client, origin: RequestOrigin): Promise<APIResponse<RequestOriginResponse>> {
	return (await this.apiPost<APIResponse<RequestOriginResponse>>("origins", origin)).data;
}

/**
 * Replaces an existing Origin with the provided new definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param originOrID Either the full representation of the Origin as desired, or
 * just its ID.
 * @param origin The new desired definition of the Origin identified by
 * `originOrID`. This is required if `originOrID` is an ID, and ignored
 * otherwise.
 * @returns The server's response.
 */
export async function updateOrigin(
	this: Client,
	originOrID: number | ResponseOrigin | RequestOriginResponse,
	origin?: RequestOrigin
): Promise<APIResponse<RequestOriginResponse>> {
	let id;
	let o;
	if (typeof(originOrID) === "number") {
		if (!origin) {
			throw new ClientError("updateOrigin", "origin");
		}
		id = originOrID;
		o = origin;
	} else {
		id = originOrID.id;
		o = originOrID;
	}

	return (await this.apiPut<APIResponse<RequestOriginResponse>>("origins", o, {id})).data;
}

/**
 * Deletes a given Origin.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param origin The Origin to be deleted, or just its ID.
 * @returns The server's response.
 */
export async function deleteOrigin(this: Client, origin: ResponseOrigin | RequestOriginResponse | number): Promise<APIResponse<undefined>> {
	const id = typeof(origin) === "number" ? origin : origin.id;
	return (await this.apiDelete("origins", {id})).data;
}
