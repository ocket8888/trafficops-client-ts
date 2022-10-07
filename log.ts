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
