import type { APIResponse, RequestType, TypeFromResponse } from "trafficops-types";

import { APIError } from "./api.error.js";
import type { PaginationParams } from "./util";

import type { Client } from "./index";

/**
 * Options that can be used to affect the result set returned by
 * {@link getTypes}.
 */
type Params = PaginationParams & {
	/**
	 * Filter results to only the one Type with this ID.
	 */
	id?: number;
	/**
	 * Filter results to only the one Type with this name.
	 */
	name?: string;
	/**
	 * Sets which property of the response objects is used for sorting.
	 *
	 * @default "id"
	 */
	orderby?: Exclude<keyof TypeFromResponse, "lastUpdated">;
	/**
	 * Filter results to only those Types that have this `useInTable` property.
	 */
	useInTable?: string;
};

/**
 * Retrieves the "Types" registered for Traffic Ops objects.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param params Any and all optional settings to use in the request.
 * @returns The server's response.
 */
export async function getTypes(this: Client, identifier: string | number, params?: Params): Promise<APIResponse<TypeFromResponse>>;
/**
 * Retrieves the "Types" registered for Traffic Ops objects.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param params Any and all optional settings to use in the request.
 * @returns The server's response.
 */
export async function getTypes(this: Client, params?: Params): Promise<APIResponse<Array<TypeFromResponse>>>;
/**
 * Retrieves the "Types" registered for Traffic Ops objects.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param paramsOrIdentifier If a single "Type" is being requested, this must be
 * its Name or ID. If multiple "Types" are being requested, any and all optional
 * settings to use in the request.
 * @param params Any and all optional settings to use in the request. This is
 * ignored if options are set by `paramsOrIdentifier`.
 * @returns The server's response.
 */
export async function getTypes(
	this: Client,
	paramsOrIdentifier?: number  | string | Params,
	params?: Params
): Promise<APIResponse<Array<TypeFromResponse>|TypeFromResponse>> {
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
	const resp = await this.apiGet<APIResponse<Array<TypeFromResponse>>>("types", p);
	if (single) {
		const len = resp.data.response.length;
		if (len !== 1) {
			throw new APIError(`getting Type by identifier '${paramsOrIdentifier}' yielded ${len} results`, resp.status, resp.headers);
		}
		return {...resp.data, response: resp.data.response[0]};
	}
	return resp.data;
}

/**
 * Retrieves the "Types" registered for Traffic Ops objects.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param type The Type to be created. Only Types with a `useInTable` value of
 * `"server"` may be created; all other types are "immutable*†¹".
 * @returns The server's response.
 */
export async function createType(
	this: Client,
	type: RequestType & {useInTable: "server"}
): Promise<APIResponse<TypeFromResponse & {useInTable: "server"}>> {
	return (await this.apiPost<APIResponse<TypeFromResponse & {useInTable: "server"}>>("types", type)).data;
}

/**
 * Deletes a "Type".
 * @param this Tells TypeScript this is a Client method.
 * @param t Either the exact Type to be deleted, or its ID. Only Types with a
 * `useInTable` value of `"server"` may be deleted; all other types are
 * "immutable*†¹".
 * @returns The server's response.
 */
export async function deleteType(this: Client, t: number | (TypeFromResponse & {useInTable: "server"})): Promise<APIResponse<undefined>> {
	let id;
	if (typeof t === "number") {
		id = t;
	} else {
		({id} = t);
	}
	return (await this.apiDelete<APIResponse<undefined>>(`types/${id}`)).data;
}
