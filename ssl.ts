import type { APIResponse, CDN, CDNDeliveryServiceSSLKeys } from "trafficops-types";

import type { Client } from "./index";

/**
 * Returns SSL certificates for all Delivery Services that are a part of the
 * specified CDN.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn Either the CDN for which SSL keys will be fetched, or just its
 * name.
 * @returns The server's response.
 */
export async function getCDNSSLKeys(this: Client, cdn: string | CDN): Promise<APIResponse<Array<CDNDeliveryServiceSSLKeys>>> {
	const name = typeof(cdn) === "string" ? cdn : cdn.name;
	return (await this.apiGet<APIResponse<Array<CDNDeliveryServiceSSLKeys>>>(`cdns/name/${name}/sslkeys`)).data;
}
