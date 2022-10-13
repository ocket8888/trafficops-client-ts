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
import type {
	APIResponse,
	DeliveryServicesRequest,
	DSRChangeType,
	DSRStatus,
	RequestDeliveryServiceRequest,
	RequestDeliveryServiceRequestComment,
	ResponseDeliveryServiceRequest,
	ResponseDeliveryServiceRequestComment,
	ResponseUser
} from "trafficops-types";

import { APIError, ClientError } from "./api.error.js";
import { getSingleResponse, type PaginationParams } from "./util.js";

import type { Client } from "./index";

/**
 * Optional settings that can affect the behavior of
 * {@link getDeliveryServiceRequests}.
 */
type Params = PaginationParams & {
	assignee?: string;
	assigneeId?: number;
	author?: string;
	authorId?: number;
	changeType?: DSRChangeType;
	createdAt?: Date;
	id?: number;
	status?: DSRStatus;
	xmlId?: string;
	orderby?: "author" | "authorId" | "changeType" | "createdAt" | "id" | "status";
};

const DSR_DATE_KEYS: readonly string[] = [
	"createdAt",
	"lastUpdated",
];

/**
 * Retrieves a single Delivery Service Request (DSR) from Traffic Ops.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param id The ID of the DSR to fetch.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 * @throws {APIError} If the Traffic Ops server responds with any number of DSRs
 * besides exactly 1.
 */
export async function getDeliveryServiceRequests(
	this: Client,
	id: number,
	params?: Params
): Promise<APIResponse<ResponseDeliveryServiceRequest>>;
/**
 * Retrieves Delivery Service Requests (DSRs) from Traffic Ops.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getDeliveryServiceRequests(
	this: Client,
	params?: Params
): Promise<APIResponse<Array<ResponseDeliveryServiceRequest>>>;
/**
 * Retrieves Delivery Service Requests (DSRs) from Traffic Ops.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param paramsOrID Either the ID of a single DSR to fetch, or any and all
 * optional settings for the request when requesting multiple DSRs.
 * @param params Any and all optional settings for the request. This is ignored
 * if optional settings were given in `paramsOrID`.
 * @returns The server's response.
 * @throws {APIError} If a single DSR is requested, but the Traffic Ops server
 * responds with any number of DSRs besides exactly 1.
 */
export async function getDeliveryServiceRequests(
	this: Client,
	paramsOrID?: number | Params,
	params?: Params
): Promise<APIResponse<Array<ResponseDeliveryServiceRequest> | ResponseDeliveryServiceRequest>> {
	let p;
	let single = false;
	if (typeof(paramsOrID) === "number") {
		p = {... params, id: paramsOrID};
		single = true;
	} else {
		p = paramsOrID;
	}
	const resp = await this.apiGet<APIResponse<Array<ResponseDeliveryServiceRequest>>>(
		"deliveryservice_requests",
		p,
		{dateString: DSR_DATE_KEYS}
	);
	if (single) {
		const dsr = resp.data.response[0];
		const len = resp.data.response.length;
		if (!dsr || len !== 1) {
			throw new APIError(`requesting Delivery Service Request by ID ${paramsOrID} yielded ${len} results`, resp.status, resp.headers);
		}
		return {...resp.data, response: dsr};
	}
	return resp.data;
}

/**
 * Creates a new Delivery Service Request (DSR).
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param dsr The DSR to create.
 * @returns The server's response.
 */
export async function createDeliveryServiceRequest(
	this: Client,
	dsr: RequestDeliveryServiceRequest
): Promise<APIResponse<ResponseDeliveryServiceRequest>> {
	return (
		await this.apiPost<APIResponse<ResponseDeliveryServiceRequest>>(
			"deliveryservice_requests",
			dsr,
			undefined,
			{dateString: DSR_DATE_KEYS}
		)
	).data;
}

/**
 * Replaces an existing Delivery Service Request (DSR) with the provided new
 * definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param id The ID of the DSR being modified.
 * @param dsr The desired DSR definition.
 * @returns The server's response.
 */
export async function updateDeliveryServiceRequest(
	this: Client,
	id: number,
	dsr: RequestDeliveryServiceRequest
): Promise<APIResponse<ResponseDeliveryServiceRequest>>;
/**
 * Replaces an existing Delivery Service Request (DSR) with the provided new
 * definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param dsr The full, new, desired DSR definition.
 * @returns The server's response.
 */
export async function updateDeliveryServiceRequest(
	this: Client,
	dsr: ResponseDeliveryServiceRequest
): Promise<APIResponse<ResponseDeliveryServiceRequest>>;
/**
 * Replaces an existing Delivery Service Request (DSR) with the provided new
 * definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param dsrOrID Either the full desired DSR definition, or the ID of the DSR
 * being modified.
 * @param dsr The desired DSR definition. This is required if `dsOrID` is given
 * as an ID, and is ignored otherwise.
 * @returns The server's response.
 * @throws {ClientError} When called incorrectly.
 */
export async function updateDeliveryServiceRequest(
	this: Client,
	dsrOrID: number | ResponseDeliveryServiceRequest,
	dsr?: RequestDeliveryServiceRequest
): Promise<APIResponse<ResponseDeliveryServiceRequest>> {
	let id, p;
	if (typeof(dsrOrID) === "number") {
		id = dsrOrID;
		if (!dsr) {
			throw new ClientError("updateDeliveryServiceRequest", "dsr");
		}
		p = dsr;
	} else {
		({id} = dsrOrID);
		p = dsrOrID;
	}
	return (await this.apiPut<APIResponse<ResponseDeliveryServiceRequest>>(
		"deliveryservice_requests",
		p,
		{id},
		{dateString: DSR_DATE_KEYS}
	)).data;
}

/**
 * Deletes a Delivery Service Request (DSR).
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param dsr The DSR to delete, or just its ID.
 * @returns The server's response.
 */
export async function deleteDeliveryServiceRequest(
	this: Client,
	dsr: number | ResponseDeliveryServiceRequest
): Promise<APIResponse<undefined>> {
	const id = typeof(dsr) === "number" ? dsr : dsr.id;
	return (await this.apiDelete("deliveryservice_requests", {id})).data;
}

/**
 * Assigns a Delivery Service Request (DSR) to a user (or unassigns it).
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param dsr The DSR being assigned, or just its ID.
 * @param assignee The user or ID of the user being assigned to the DSR given by
 * `dsr`, or `null`/`undefined` to instead *un*assign the DSR.
 * @returns The server's response.
 */
export async function assignDeliveryServiceRequest(
	this: Client,
	dsr: number | ResponseDeliveryServiceRequest,
	assignee: number | ResponseUser | null | undefined
): Promise<APIResponse<ResponseDeliveryServiceRequest>> {
	const dsrID = typeof(dsr) === "number" ? dsr : dsr.id;
	let assigneeId;
	if (assignee === null || assignee === undefined) {
		assigneeId = null;
	} else {
		assigneeId = typeof(assignee) === "number" ? assignee : assignee.id;
	}

	return (await this.apiPut<APIResponse<ResponseDeliveryServiceRequest>>(`deliveryservice_requests/${dsrID}/assign`, {assigneeId})).data;
}

/**
 * Changes the status of a Delivery Service Request (DSR).
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param dsr Either the DSR being updated, or just its ID.
 * @param status The desired new status for the DSR.
 * @returns The server's response.
 */
export async function changeDeliveryServiceRequestStatus(
	this: Client,
	dsr: number | ResponseDeliveryServiceRequest,
	status: DSRStatus
): Promise<APIResponse<ResponseDeliveryServiceRequest>> {
	const id = typeof(dsr) === "number" ? dsr : dsr.id;
	return (await this.apiPut<APIResponse<ResponseDeliveryServiceRequest>>(`deliveryservice_requests/${id}/status`, {status})).data;
}

/**
 * Optional settings that can affect the behavior of
 * {@link getDeliveryServiceRequestComments}.
 */
type DSRCParams = {
	author?: string;
	authorId?: number;
	deliveryServiceRequestId?: number;
	id?: number;
};

/**
 * Retrieves comments left on Delivery Service Requests (DSRs).
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getDeliveryServiceRequestComments(
	this: Client,
	params?: DSRCParams
): Promise<APIResponse<Array<ResponseDeliveryServiceRequestComment>>>;
/**
 * Retrieves a single comment left on a Delivery Service Request (DSR).
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param id The ID of a single DSR comment to fetch.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 * @throws {APIError} if Traffic Ops responds with any number of DSR comments
 * other than one.
 */
export async function getDeliveryServiceRequestComments(
	this: Client,
	id: number,
	params?: DSRCParams
): Promise<APIResponse<ResponseDeliveryServiceRequestComment>>;
/**
 * Retrieves comments left on Delivery Service Requests (DSRs).
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param paramsOrId Either the ID of a single DSR comment to fetch, or any and
 * all optional request settings when fetching multiple.
 * @param params Any and all optional settings for the request. This is ignored
 * if optional settings are given with `paramsOrId`.
 * @returns The server's response.
 */
export async function getDeliveryServiceRequestComments(
	this: Client,
	paramsOrId?: number | DSRCParams,
	params?: DSRCParams
): Promise<APIResponse<Array<ResponseDeliveryServiceRequestComment> | ResponseDeliveryServiceRequestComment>> {
	let single = false;
	let p;
	if (typeof(paramsOrId) === "number") {
		single = true;
		p = {...params, id: paramsOrId};
	} else {
		p = paramsOrId;
	}
	const resp = await this.apiGet<APIResponse<Array<ResponseDeliveryServiceRequestComment>>>("deliveryservice_request_comments", p);
	if (single) {
		return getSingleResponse(resp, "DSR comment", p?.id as number);
	}
	return resp.data;
}

/**
 * Checks if an argument to {@link createDeliveryServiceRequestComment} is a
 * comment creation request or a full DSR.
 *
 * @param x The object to check.
 * @returns `true` if `x` is a {@link RequestDeliveryServiceRequestComment},
 * `false` otherwise.
 */
function isComment(
	x: number | ResponseDeliveryServiceRequest | RequestDeliveryServiceRequestComment
): x is RequestDeliveryServiceRequestComment {
	return typeof(x) === "object" && Object.prototype.hasOwnProperty.call(x, "value");
}

/**
 * Adds a new comment to a Delivery Service Request (DSR).
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param comment The full comment creation request.
 * @returns The server's response.
 */
export async function createDeliveryServiceRequestComment(
	this: Client,
	comment: RequestDeliveryServiceRequestComment
): Promise<APIResponse<ResponseDeliveryServiceRequestComment>>;
/**
 * Adds a new comment to a Delivery Service Request (DSR).
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param dsr Either the DSR on which a new comment will be made, or just its
 * ID.
 * @param comment The content of the comment to be made.
 * @returns The server's response.
 */
export async function createDeliveryServiceRequestComment(
	this: Client,
	dsr: number | ResponseDeliveryServiceRequest,
	comment: string
): Promise<APIResponse<ResponseDeliveryServiceRequestComment>>;
/**
 * Adds a new comment to a Delivery Service Request (DSR).
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param dsrOrComment Either the full comment creation request, or just the DSR
 * (or its ID) on which a new comment will be made.
 * @param comment The content of the comment to be made. This is required if
 * `dsrOrComment` is used to identify a DSR, and is ignored otherwise.
 * @returns The server's response.
 */
export async function createDeliveryServiceRequestComment(
	this: Client,
	dsrOrComment: number | ResponseDeliveryServiceRequest | RequestDeliveryServiceRequestComment,
	comment?: string
): Promise<APIResponse<ResponseDeliveryServiceRequestComment>> {
	let request;
	if (isComment(dsrOrComment)) {
		request = dsrOrComment;
	} else if (comment === undefined) {
		throw new ClientError("createDeliveryServiceRequestComment", "comment");
	} else if (typeof(dsrOrComment) === "number") {
		request = {
			deliveryServiceRequestId: dsrOrComment,
			value: comment
		};
	} else {
		request = {
			deliveryServiceRequestId: dsrOrComment.id,
			value: comment
		};
	}

	return (await this.apiPost<APIResponse<ResponseDeliveryServiceRequestComment>>("deliveryservice_request_comments", request)).data;
}

/**
 * Replaces an existing comment on a Delivery Service Request (DSR) with the
 * provided new definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param dsrc The full new desired definition of the DSR comment.
 * @returns The server's response.
 */
export async function editDeliveryServiceRequestComment(
	this: Client,
	dsrc: ResponseDeliveryServiceRequestComment
): Promise<APIResponse<ResponseDeliveryServiceRequestComment>>;
/**
 * Replaces an existing comment on a Delivery Service Request (DSR) with the
 * provided new definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param dsrc The ID of the comment being edited.
 * @param comment The new desired definition of the DSR comment.
 * @returns The server's response.
 */
export async function editDeliveryServiceRequestComment(
	this: Client,
	dsrc: number,
	comment: RequestDeliveryServiceRequestComment
): Promise<APIResponse<ResponseDeliveryServiceRequestComment>>;
/**
 * Replaces an existing comment on a Delivery Service Request (DSR) with the
 * provided new definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param dsrc Either the full new desired definition of the DSR comment, or
 * just the ID of the comment being edited.
 * @param comment The new desired definition of the DSR comment. This is
 * required if `dsrc` is used to identify a DSR comment, and ignored otherwise.
 * @returns The server's response.
 */
export async function editDeliveryServiceRequestComment(
	this: Client,
	dsrc: number | ResponseDeliveryServiceRequestComment,
	comment?: RequestDeliveryServiceRequestComment
): Promise<APIResponse<ResponseDeliveryServiceRequestComment>> {
	let id, p;
	if (typeof(dsrc) === "number") {
		id = dsrc;
		if (!comment) {
			throw new ClientError("editDeliveryServiceRequestComment", "comment");
		}
		p = comment;
	} else {
		({id} = dsrc);
		p = dsrc;
	}
	return (await this.apiPut<APIResponse<ResponseDeliveryServiceRequestComment>>("deliveryservice_request_comments", p, {id})).data;
}

/**
 * Removes a comment from a Delivery Service Request (DSR).
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param dsrc The DSR comment being removed, or just its ID.
 * @returns The server's response.
 */
export async function deleteDeliveryServiceRequestComment(
	this: Client,
	dsrc: number | ResponseDeliveryServiceRequestComment
): Promise<APIResponse<undefined>> {
	const id = typeof(dsrc) === "number" ? dsrc : dsrc.id;
	return (await this.apiDelete("deliveryservice_request_comments", {id})).data;
}

/**
 * Creates a new DeliveryServicesRequest sent via email to Traffic Ops's
 * configured DeliveryServicesRequest recipient.
 *
 * @deprecated This has been removed from the latest API, in favor of proper
 * DSRs.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param request The request to send.
 * @returns The server's response.
 */
export async function sendDeliveryServicesRequest(this: Client, request: DeliveryServicesRequest): Promise<APIResponse<undefined>> {
	return (await this.apiPost("deliveryservices/request", request)).data;
}
