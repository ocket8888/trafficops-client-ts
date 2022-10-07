import type { APIResponse, ISORequest, OSVersions } from "trafficops-types";

import { APIError } from "./api.error.js";

import type { Client } from "./index";

/**
 * Generates a bootable Linux system image in ISO format.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param request The specification to use for generation of the ISO.
 * @returns The server's response. If the Client is not configured to raise
 * alerts as errors, then any alerts indicating an error response will be
 * returned *as a raw string*. If it's a success, this will just be a huge
 * system image binary blob.
 * @throws {APIError} When the Client is configured to throw error alerts as
 * errors and the response status code indicates an error. Note that any alerts
 * given from the server **are not parsed** because this endpoint does not use
 * JSON encoding.
 */
export async function generateISO(this: Client, request: ISORequest): Promise<ArrayBuffer> {
	const url = this.makeURL("isos");
	const response = await this.post<ArrayBuffer>(url, request, {headers: this.headers, responseType: "arraybuffer"});
	if (this.raiseErrorAlerts && (response.status < 200 || response.status >= 300)) {
		throw new APIError(`isos returned error response: ${response.data}`, response.status, response.headers);
	}
	return response.data;
}

/**
 * Retrieves a list of Operating Systems for which Traffic Ops can generate a
 * bootable system image (which can be done using {@link generateISO}).
 *
 * @param this Tells TypeScript that this is a Client method.
 * @returns The server's response.
 */
export async function getOSVersions(this: Client): Promise<APIResponse<OSVersions>> {
	return (await this.apiGet<APIResponse<OSVersions>>("osversions")).data;
}
