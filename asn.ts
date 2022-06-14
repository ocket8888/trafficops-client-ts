import type { APIResponse, RequestASN, ResponseASN } from "trafficops-types";

import { ClientError } from "./api.error.js";
import type { PaginationParams } from "./util.js";

import type { Client } from "./index";

/**
 * These are the query string parameters available for use on /asns responses
 * from the TO API.
 */
type Params = {
	/** filter by Cache Group ID */
	cachegroup?: number;
	/** filter by ASN ID */
	id?: number;
	/**
	 * Order the returned results according to the specified response property.
	 */
	orderby?: keyof ResponseASN;
} & PaginationParams;

/**
 * Gets ASNs from Traffic Ops.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all query parameters to be passed to the endpoint.
 * @returns The server's response.
 */
export async function getASNs(this: Client, params?: Params): Promise<APIResponse<Array<ResponseASN>>> {
	return (await this.apiGet<APIResponse<Array<ResponseASN>>>("asns", params)).data;
}

/**
 * Creates th egiven ASN.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param asn The ASN to be created.
 * @returns The server's response.
 */
export async function createASN(this: Client, asn: RequestASN): Promise<APIResponse<ResponseASN>> {
	return (await this.apiPost<APIResponse<ResponseASN>>("asns", asn)).data;
}

/**
 * Deletes an ASN.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param id The ID of the ASN to be deleted.
 * @returns The server's response.
 */
export async function deleteASN(this: Client, id: number): Promise<APIResponse<undefined>> {
	return (await this.apiDelete(`asns/${id}`)).data;
}

/**
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param id The ID of the ASN that will be modified.
 * @param asn The new details of the ASN, as they should be after modification.
 * @returns The server's response.
 */
export async function updateASN(this: Client, id: number, asn: RequestASN): Promise<APIResponse<ResponseASN>>;
/**
 *	Updates an ASN.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param asn A full ASN - the ID of this ASN must match the ID of the ASN that
 * will be modified.
 * @returns The server's response.
 */
export async function updateASN(this: Client, asn: ResponseASN): Promise<APIResponse<ResponseASN>>;
/**
 * Updates an ASN.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param idOrASN Either a whole ASN to be modified or just the ID thereof.
 * @param asn The details of the ASN that the caller wants to change. This only
 * has meaning if `idOrASN` was given as the ID of an ASN to be modified.
 * @returns The server's response.
 */
export async function updateASN(this: Client, idOrASN: number | ResponseASN, asn?: RequestASN): Promise<APIResponse<ResponseASN>> {
	let id;
	if (typeof(idOrASN) === "number") {
		id = idOrASN;
		if (!asn) {
			throw new ClientError("updateASN", "asn");
		}
	} else {
		id = idOrASN.id;
		asn = idOrASN;
	}

	return (await this.apiPut<APIResponse<ResponseASN>>(`asns/${id}`, asn)).data;
}
