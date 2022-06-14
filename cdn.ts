import type { APIResponse, RequestCDN, ResponseCDN } from "trafficops-types";

import { APIError, ClientError } from "./api.error.js";
import type { PaginationParams } from "./util";

import type { Client } from "./index";

/**
 * A set of options that can be used to affect the response returned by
 * {@link getCDNs}.
 */
type Params = PaginationParams & {
	/** Filter by ID. */
	id?: number;
	/** Filter by Name. */
	name?: string;
	/** Choose the property used for ordering the result set. */
	orderby?: Exclude<keyof ResponseCDN, "lastUpdated">;
};

/**
 * Retrieves CDNs.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getCDNs(this: Client, params?: Params): Promise<APIResponse<Array<ResponseCDN>>>;
/**
 * Retrieves CDNs.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn Either the name of a single CDN to fetch, or its ID.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getCDNs(this: Client, cdn: string | number, params?: Params): Promise<APIResponse<ResponseCDN>>;
/**
 * Retrieves CDNs.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdnOrParams Either the name of a single CDN to fetch, the ID of a
 * single CDN to fetch, or any and all optional settings for the request.
 * @param params Any and all optional settings for the request. This is ignored
 * unless `cdnOrParams` specified a single CDN via its name or ID.
 * @returns The server's response.
 */
export async function getCDNs(
	this: Client,
	cdnOrParams?: string | number | Params,
	params?: Params
): Promise<APIResponse<Array<ResponseCDN> | ResponseCDN>> {
	let p;
	let single = false;
	switch (typeof(cdnOrParams)) {
		case "string":
			p = {...params, name: cdnOrParams};
			single = true;
			break;
		case "number":
			p = {...params, id: cdnOrParams};
			single = true;
			break;
		default:
			p = cdnOrParams;
	}
	const resp = await this.apiGet<APIResponse<Array<ResponseCDN>>>("cdns", p);
	if (single) {
		const len = resp.data.response.length;
		if (len !== 1) {
			throw new APIError(`requesting CDN by identifier '${cdnOrParams}' yielded ${len} results`, resp.status, resp.headers);
		}
		return {...resp.data, response: resp.data.response[0]};
	}
	return resp.data;
}

/**
 * Updates a CDN to match the representation given.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn The entire desired representation of the CDN being modified.
 * @returns The server's response.
 */
export async function updateCDN(this: Client, cdn: ResponseCDN): Promise<APIResponse<ResponseCDN>>;
/**
 * Updates a CDN to match the representation given.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param id The ID of the CDN being modified.
 * @param cdn The desired representation of the CDN identified by `id`.
 * @returns The server's response.
 */
export async function updateCDN(this: Client, id: number, cdn: RequestCDN): Promise<APIResponse<ResponseCDN>>;
/**
 * Updates a CDN to match the representation given.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdnOrID Either the entire representation of the CDN as desired, or
 * just its ID.
 * @param cdn The desired representation of the CDN identified by `cdnOrID`.
 * This is required if `cdnOrID` is an ID, and ignored otherwise.
 * @returns The server's response.
 */
export async function updateCDN(this: Client, cdnOrID: number | ResponseCDN, cdn?: RequestCDN): Promise<APIResponse<ResponseCDN>> {
	let id, payload;
	if (typeof(cdnOrID) === "number") {
		id = cdnOrID;
		if (!cdn) {
			throw new ClientError("updateCDN", "cdn");
		}
		payload = cdn;
	} else {
		({id} = cdnOrID);
		payload = cdnOrID;
	}
	return (await this.apiPut<APIResponse<ResponseCDN>>(`cdns/${id}`, payload)).data;
}

/**
 * Creates a new CDN.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn The CDN being created.
 * @returns The server's response.
 */
export async function createCDN(this: Client, cdn: RequestCDN): Promise<APIResponse<ResponseCDN>> {
	return (await this.apiPost<APIResponse<ResponseCDN>>("cdns", cdn)).data;
}

/**
 * Destroys a CDN. Note that this will fail if the CDN contains any resources.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn Then CDN being deleted, or just its ID.
 * @returns The server's response.
 */
export async function deleteCDN(this: Client, cdn: ResponseCDN | number): Promise<APIResponse<undefined>> {
	const id = typeof(cdn) === "number" ? cdn : cdn.id;
	return (await this.apiDelete(`cdns/${id}`)).data;
}
