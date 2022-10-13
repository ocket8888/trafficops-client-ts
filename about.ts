/**
 * @license Apache-2.0
 *
 * Copyright 2022 ocket8888
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
