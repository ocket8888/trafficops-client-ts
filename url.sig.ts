import type { APIResponse, DeliveryService, DSURISignatureKeys } from "trafficops-types";

import type { Client } from "./index";

/**
 * Sets the URI Signing keys of a Delivery Service to those provided.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service having its keys set, or just its XMLID.
 * @param keys The keys being set on the Delivery Service.
 * @returns The servers response.
 */
export async function setURISigningKeys(
	this: Client,
	ds: string | DeliveryService,
	keys: DSURISignatureKeys
): Promise<DSURISignatureKeys> {
	const xmlID = typeof(ds) === "string" ? ds : ds.xmlId;
	return (await this.apiPut<DSURISignatureKeys>(`deliveryservices/${xmlID}/urisignkeys`, keys)).data;
}

/**
 * Gets the URI Signing keys of a Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service having its keys retrieved, or just its XMLID.
 * @returns The servers response.
 */
export async function getURISigningKeys(this: Client, ds: string | DeliveryService): Promise<DSURISignatureKeys> {
	const xmlID = typeof(ds) === "string" ? ds : ds.xmlId;
	return (await this.apiGet<DSURISignatureKeys>(`deliveryservices/${xmlID}/urisignkeys`)).data;
}

/**
 * Removes **all** URI Signing Keys from the given Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service having its keys removed, or just its XMLID.
 * @returns The servers response.
 */
export async function removeURISigningKeys(this: Client, ds: string | DeliveryService): Promise<APIResponse<undefined>> {
	const xmlID = typeof(ds) === "string" ? ds : ds.xmlId;
	return (await this.apiDelete(`deliveryservices/${xmlID}/urisignkeys`)).data;
}
