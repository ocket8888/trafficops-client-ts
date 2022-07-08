import type { APIResponse, CDN, PostResponseCDNFederation, RequestCDNFederation, ResponseCDNFederation } from "trafficops-types";

import { ClientError } from "./api.error.js";
import type { PaginationParams } from "./util";

import type { Client } from "./index";

/**
 * Optional settings that affect the behavior and/or result set of
 * {@link getCDNFederations}.
 */
type CDNFedParams = PaginationParams & {
	/**
	 * Return only CDN Federations that correspond to Federations with this ID.
	 */
	id?: number;
	/**
	 * Choose a property by which results will be ordered.
	 *
	 * ("id" is the ID of the *Federation*, not the CDN, CDNFederation,
	 * FederationResolver(s), FederationResolverResolver(s), or an Delivery
	 * Service. It's not visible in the response.)
	 *
	 * ("name" is the name of the CDN. Technically allowed, but utterly
	 * useless.)
	 *
	 * @default "id"
	 */
	orderby?: "id" | "name" | "cname";
};

/**
 * Retrieves a list of CDNFederations in use by a particular CDN.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn The CDN for which to retrieve Federations.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getCDNFederations(
	this: Client,
	cdn: string | CDN,
	params?: CDNFedParams
): Promise<APIResponse<Array<ResponseCDNFederation>>> {
	const name = typeof(cdn) === "string" ? cdn : cdn.name;
	return (await this.apiGet<APIResponse<Array<ResponseCDNFederation>>>(`cdns/${name}/federations`, params)).data;
}

/* eslint-disable max-len */
/**
 * Adds a new CDNFederation to a particular CDN.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn The CDN within which a new CDNFederation will be created. Note
 * that this doesn't actually work or mean anything, because a CDNFederation is
 * not actually associated with a CDN until it is assigned to one or more
 * Delivery Services. This must be a real CDN (or its name), but that in no way
 * has any impact on the created CDNFederation. See
 * [apache/trafficcontrol#4052]{@link https://github.com/apache/trafficcontrol/issues/4052}.
 * @param fed The CDNFederation to create.
 * @returns The server's response.
 */
export async function createCDNFederation(
/* eslint-enable max-len */
	this: Client,
	cdn: string | CDN,
	fed: RequestCDNFederation
): Promise<APIResponse<PostResponseCDNFederation>> {
	const name = typeof(cdn) === "string" ? cdn : cdn.name;
	return (await this.apiPost<APIResponse<PostResponseCDNFederation>>(`cdns/${name}/federations`, fed)).data;
}

/**
 * Replaces an existing CDNFederation with the provided new definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn Any valid CDN or its name, doesn't matter or affect anything
 * unless the Federation being modified is assigned to at least one Delivery
 * Service, in which case this must be the CDN to which those Delivery Services
 * belong or its name.
 * @param federation The full new desired definition of the CDNFederation.
 * @returns The server's response.
 */
export async function updateCDNFederation(
	this: Client,
	cdn: string | CDN,
	federation: PostResponseCDNFederation
): Promise<APIResponse<PostResponseCDNFederation>>;
/**
 * Replaces an existing CDNFederation with the provided new definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn Any valid CDN or its name, doesn't matter or affect anything
 * unless the Federation being modified is assigned to at least one Delivery
 * Service, in which case this must be the CDN to which those Delivery Services
 * belong or its name.
 * @param id The ID of the CDNFederation being updated.
 * @param federation The new desired definition of the CDN Federation.
 * @returns The server's response.
 */
export async function updateCDNFederation(
	this: Client,
	cdn: string | CDN,
	id: number,
	federation: RequestCDNFederation
): Promise<APIResponse<PostResponseCDNFederation>>;
/**
 * Replaces an existing CDNFederation with the provided new definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn Any valid CDN or its name, doesn't matter or affect anything
 * unless the Federation being modified is assigned to at least one Delivery
 * Service, in which case this must be the CDN to which those Delivery Services
 * belong or its name.
 * @param fedOrID Either the full new desired definition of the CDNFederation,
 * or just its ID.
 * @param fed The new desired definition of the CDN Federation. This is required
 * if `fedOrID` was an ID, and ignored otherwise.
 * @returns The server's response.
 */
export async function updateCDNFederation(
	this: Client,
	cdn: string | CDN,
	fedOrID: number | PostResponseCDNFederation,
	fed?: RequestCDNFederation
): Promise<APIResponse<PostResponseCDNFederation>> {
	const name = typeof(cdn) === "string" ? cdn : cdn.name;
	let id, payload;
	if (typeof(fedOrID) === "number") {
		id = fedOrID;
		if (!fed) {
			throw new ClientError("updateCDNFederation", "fed");
		}
		payload = fed;
	} else {
		({id} = fedOrID);
		payload = fedOrID;
	}
	return (await this.apiPut<APIResponse<PostResponseCDNFederation>>(`cdns/${name}/federations/${id}`, payload)).data;
}

/**
 * Deletes a CDNFederation with the provided new definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn Any valid CDN or its name, doesn't matter or affect anything
 * unless the Federation being modified is assigned to at least one Delivery
 * Service, in which case this must be the CDN to which those Delivery Services
 * belong or its name. Of course, in that case deletion will fail.
 * @param federation Either the Federation being deleted or its ID.
 * @returns The server's response.
 */
export async function deleteCDNFederation(
	this: Client,
	cdn: string | CDN,
	federation: number | PostResponseCDNFederation
): Promise<APIResponse<undefined>> {
	const name = typeof(cdn) === "string" ? cdn : cdn.name;
	const id = typeof(federation) === "number" ? federation : federation.id;
	return (await this.apiDelete(`cdns/${name}/federations/${id}`)).data;
}
