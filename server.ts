import type {
	APIResponse,
	RequestStatus,
	ResponseStatus
} from "trafficops-types";

import { APIError, ClientError } from "./api.error.js";
import type { PaginationParams } from "./util";

import type { Client } from "./index";

/**
 * Optional settings that affect the results returned by {@link_getStatuses}.
 */
type StatusParams = PaginationParams & {
	/** Return only Statuses with this **exact** description. */
	description?: string;
	/** Filter results by id. */
	id?: number;
	/** Filter results by name. */
	name?: string;
	/**
	 * Choose the property by which results are ordered.
	 *
	 * @default "name"
	 */
	orderby?: "description" | "id" | "name";
};

/**
 * Retrieves Statuses.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getStatuses(params?: StatusParams): Promise<APIResponse<Array<ResponseStatus>>>;
/**
 * Retrieves a Status.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param identifier Either the ID or the name of a single Status to retrieve.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getStatuses(identifier: number | string, params?: StatusParams): Promise<APIResponse<ResponseStatus>>;
/**
 * Retrieves Statuses.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param paramsOrIdentifier Either the ID or name of a single Status to
 * retrieve, or any and all optional settings for retrieving multiple.
 * @param params Any and all optional settings for the request. This is ignored
 * if settings were provided in `paramsOrIdentifier`.
 * @returns The server's response.
 */
export async function getStatuses(
	this: Client,
	paramsOrIdentifier?: StatusParams | number | string,
	params?: StatusParams
): Promise<APIResponse<Array<ResponseStatus> | ResponseStatus>> {
	let p;
	let single = false;
	switch (typeof(paramsOrIdentifier)) {
		case "number":
			p = {...params, id: paramsOrIdentifier};
			single = true;
			break;
		case "string":
			p = {...params, name: paramsOrIdentifier};
			single = true;
			break;
		default:
			p = paramsOrIdentifier;
	}
	const resp = await this.apiGet<APIResponse<Array<ResponseStatus>>>("statuses", p);
	if (single) {
		const len = resp.data.response.length;
		const status = resp.data.response[0];
		if (!status || len !== 1) {
			throw new APIError(`requesting status by identifier '${paramsOrIdentifier}' yielded ${len} results`, resp.status, resp.headers);
		}
		return {...resp.data, response: status};
	}
	return resp.data;
}

/**
 * Creates a new Status.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param status The status to create.
 * @returns The server's response.
 */
export async function createStatus(this: Client, status: RequestStatus): Promise<APIResponse<ResponseStatus>> {
	return (await this.apiPost<APIResponse<ResponseStatus>>("statuses", status)).data;
}

/**
 * Replaces the existing definition of a Status with the one provided.
 *
 * @param this Tells TypeScript that this is a TypeScript method.
 * @param status The full desired definition of the Status.
 * @returns The server's response.
 */
export async function updateStatus(this: Client, status: ResponseStatus): Promise<APIResponse<ResponseStatus>>;
/**
 * Replaces the existing definition of a Status with the one provided.
 *
 * @param this Tells TypeScript that this is a TypeScript method.
 * @param id The ID of the Status being updated.
 * @param status The desired definition of the Status.
 * @returns The server's response.
 */
export async function updateStatus(this: Client, id: number, status: RequestStatus): Promise<APIResponse<ResponseStatus>>;
/**
 * Replaces the existing definition of a Status with the one provided.
 *
 * @param this Tells TypeScript that this is a TypeScript method.
 * @param statusOrID Either the full desired definition of the Status or just
 * its ID.
 * @param status The desired definition of the Status. This is required if
 * `statusOrID` is an ID, and ignored otherwise.
 * @returns The server's response.
 */
export async function updateStatus(
	this: Client,
	statusOrID: ResponseStatus | number,
	status?: RequestStatus
): Promise<APIResponse<ResponseStatus>> {
	let id, payload;
	if (typeof(statusOrID) === "number") {
		id = statusOrID;
		if (!status) {
			throw new ClientError("updateStatus", "status");
		}
		payload = status;
	} else {
		({id} = statusOrID);
		payload = statusOrID;
	}
	return (await this.apiPut<APIResponse<ResponseStatus>>(`statuses/${id}`, payload)).data;
}

/**
 * Deletes a Status.
 *
 * @param this Tells TypeScript that this is a TypeScript method.
 * @param status Either the Status being deleted, or just its ID.
 * @returns The server's response.
 */
export async function deleteStatus(this: Client, status: ResponseStatus | number): Promise<APIResponse<undefined>> {
	const id = typeof(status) === "number" ? status : status.id;
	return (await this.apiDelete(`statuses/${id}`)).data;
}
