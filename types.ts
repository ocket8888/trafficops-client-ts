import { APIResponse, RequestType, TypeFromResponse } from "trafficops-types";

import type { PaginationParams } from "./util";

import type { Client } from "./index";

/**
 * Options that can be used to affect the result set returned by
 * {@link getTypes}.
 */
type Params = PaginationParams & {
	/**
	 * Sets which property of the response objects is used for sorting.
	 *
	 * @default "id"
	 */
	 orderby: keyof TypeFromResponse;
	/**
	 * Sets the order of sorting - ASCending or DESCending.
	 *
	 * @default "asc"
	 */
	sortOrder: "asc" | "desc";
};

/**
 * Retrieves the "Types" registered for Traffic Ops objects.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param params Any and all optional settings to use in the request.
 * @returns The server's response.
 */
export async function getTypes(this: Client, params?: Params): Promise<APIResponse<Array<TypeFromResponse>>> {
	return (await this.apiGet<APIResponse<Array<TypeFromResponse>>>("types", params)).data;
}

/**
 * Retrieves the "Types" registered for Traffic Ops objects.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param type The Type to be created. Only Types with a `useInTable` value of
 * `"server"` may be created; all other types are "immutable*†¹".
 * @returns The server's response.
 */
export async function createType(this: Client, type: RequestType & {useInTable: "server"}): Promise<APIResponse<TypeFromResponse & {useInTable: "server"}>> {
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
