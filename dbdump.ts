import { APIError } from "./api.error.js";

import type { Client } from "./index";

/* eslint-disable max-len */
/**
 * Dumps the entire database. There's really no reason I can think of to ever do
 * this, but the API allows it, so this client implements it. Please don't ever
 * use this method. Per
 * [apache/trafficcontrol#6397]{@link https://github.com/apache/trafficcontrol/issues/6397}
 * this can essentially dump users' unencrypted passwords. So, again. **DO NOT
 * USE THIS**.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @returns The server's response. If the Client is not configured to raise
 * alerts as errors, then any alerts indicating an error response will be
 * returned *as a raw string*. If it's a success, this will just be a huge SQL
 * script.
 * @throws {APIError} When the Client is configured to throw error alerts as
 * errors and the response status code indicates an error. Note that any alerts
 * given from the server **are not parsed** because this endpoint does not use
 * JSON encoding.
 */
export async function dbdump(this: Client): Promise<string> {
	const url = this.makeURL("dbdump");
	const response = await this.get<string>(url, {headers: this.headers});
	if (this.raiseErrorAlerts && (response.status < 200 || response.status >= 300)) {
		throw new APIError(`dbdump returned error response: ${response.data}`, response.status, response.headers);
	}
	return response.data;
}
/* eslint-enable max-len */
