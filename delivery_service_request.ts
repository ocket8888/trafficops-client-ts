import type {
	APIResponse,
	DeliveryServicesRequest,
	DSRChangeType,
	DSRStatus,
	RequestDeliveryServiceRequest,
	ResponseDeliveryServiceRequest
} from "trafficops-types";

import { APIError, ClientError } from "./api.error.js";
import type { PaginationParams } from "./util";

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
	console.log("making request with params:", p);
	console.log("and single", single);
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
