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
import type { APIResponse, Log, NewLogCount } from "trafficops-types";

import type { PaginationParams } from "./util";

import type { Client } from "./index";

/**
 * Optional settings that affect the output/behavior of {@link getLogs}.
 */
type LogsParams = PaginationParams & {
	days?: number;
	/** @default 1000 */
	limit?: number;
	username?: string;
};

/**
 * Gets a log of changes made through the Traffic Ops API.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getLogs(this: Client, params?: LogsParams): Promise<APIResponse<Array<Log>>> {
	return (await this.apiGet<APIResponse<Array<Log>>>("logs", params)).data;
}

/**
 * Gets the number of log entries that have been added since the last time logs
 * were requested (i.e. the last time {@link getLogs} was called).
 *
 * @param this Tells TypeScript that this is a Client method.
 * @returns The server's response.
 */
export async function getNewLogsCount(this: Client): Promise<APIResponse<NewLogCount>> {
	return (await this.apiGet<APIResponse<NewLogCount>>("logs/newcount")).data;
}
