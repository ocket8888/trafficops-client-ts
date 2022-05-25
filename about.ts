import type { About, Alert, APIResponse, SystemInfo } from "trafficops-types";

import type { Client } from "./index";

/**
 * Gets some basic information about the Traffic Ops installation.
 *
 * @param this Tells TypeScript this is a Client method.
 * @returns The server's response.
 */
export async function about(this: Client): Promise<About> {
	const resp = await this.apiGet<About & {alerts?: Array<Alert>}>("about");
	return resp.data;
}

/**
 * Retrieves some Parameters that hold important global information that affect
 * Traffic Ops's behavior.
 *
 * @param this Tells TypeScript this is a Client method.
 * @returns The server's response.
 */
export async function systemInfo(this: Client): Promise<APIResponse<SystemInfo>> {
	const resp = await this.apiGet<APIResponse<SystemInfo>>("system/info");
	return resp.data;
}
