import type { APICapability, APIResponse } from "trafficops-types";

import type { Client } from "./index";

/**
 * Gets all associations between legacy "Capabilities" (not to be confused with
 * "server capabilities") and API methods and endpoints.
 *
 * @deprecated The information exposed by this method is not in any way enforced
 * by Traffic Ops, and has been removed from the latest version of the API in
 * favor of "Permissions" of Roles.
 *
 * @param this Tells TypeScript this is a Client method.
 * @returns The server's response.
 */
export async function getAPICapabilities(this: Client): Promise<APIResponse<Array<APICapability>>> {
	return (await this.apiGet<APIResponse<Array<APICapability>>>("api_capabilities")).data;
}
